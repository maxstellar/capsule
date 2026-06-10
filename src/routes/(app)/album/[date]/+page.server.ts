import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { photos, users, daily_prompts, photo_likes } from '$lib/server/db/schema';
import { and, eq, isNull, desc, sql } from 'drizzle-orm';
import { currentETDay } from '$lib/server/time';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { date } = params;

	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw redirect(303, '/');

	const today = currentETDay();
	if (date > today) throw redirect(303, '/');
	if (env.COHORT_START && date < env.COHORT_START) throw redirect(303, '/');
	if (env.COHORT_END && date > env.COHORT_END) throw redirect(303, '/');

	const userId = locals.user?.id ?? null;

	const [dayPhotos, dayPrompt] = await Promise.all([
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
				liked_by_me: userId
					? sql<boolean>`coalesce(bool_or(${photo_likes.user_id} = ${userId}::uuid), false)`
					: sql<boolean>`false`
			})
			.from(photos)
			.innerJoin(users, eq(photos.user_id, users.id))
			.leftJoin(photo_likes, eq(photos.id, photo_likes.photo_id))
			.where(and(eq(photos.day, date), isNull(photos.deleted_at)))
			.groupBy(photos.id, users.id)
			.orderBy(desc(sql`count(${photo_likes.photo_id})`), desc(photos.created_at)),
		db.select().from(daily_prompts).where(eq(daily_prompts.day, date)).limit(1)
	]);

	return { date, today, photos: dayPhotos, prompt: dayPrompt[0] ?? null };
};
