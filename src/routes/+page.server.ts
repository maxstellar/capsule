import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { photos, users, daily_prompts, prompt_completions, photo_likes } from '$lib/server/db/schema';
import { and, eq, isNull, desc, sql } from 'drizzle-orm';
import { currentETDay } from '$lib/server/time';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	if (!locals.isWhitelisted) throw redirect(303, '/ineligible');

	const today = currentETDay();
	const userId = locals.user.id;

	const [todayPhotos, todayPrompt, myCompletion] = await Promise.all([
		db
			.select({
				id: photos.id,
				cdn_url: photos.cdn_url,
				width: photos.width,
				height: photos.height,
				created_at: photos.created_at,
				user_id: photos.user_id,
				user_name: users.name,
				user_avatar: users.avatar_url,
				like_count: sql<number>`count(${photo_likes.photo_id})::int`,
				liked_by_me: sql<boolean>`coalesce(bool_or(${photo_likes.user_id} = ${userId}::uuid), false)`
			})
			.from(photos)
			.innerJoin(users, eq(photos.user_id, users.id))
			.leftJoin(photo_likes, eq(photos.id, photo_likes.photo_id))
			.where(and(eq(photos.day, today), isNull(photos.deleted_at)))
			.groupBy(photos.id, users.id)
			.orderBy(desc(sql`count(${photo_likes.photo_id})`), desc(photos.created_at)),
		db.select().from(daily_prompts).where(eq(daily_prompts.day, today)).limit(1),
		db
			.select()
			.from(prompt_completions)
			.where(
				and(eq(prompt_completions.user_id, userId), eq(prompt_completions.day, today))
			)
			.limit(1)
	]);

	return {
		today,
		photos: todayPhotos,
		prompt: todayPrompt[0] ?? null,
		myCompletion: myCompletion[0] ?? null,
		myPhotoCount: todayPhotos.filter((p) => p.user_id === userId).length
	};
};
