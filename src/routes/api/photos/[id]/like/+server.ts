import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { requireWhitelisted } from '$lib/server/auth/access';
import { db } from '$lib/server/db';
import { photo_likes, photos } from '$lib/server/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
	requireWhitelisted(event);

	const photoId = event.params.id;
	const userId = event.locals.user!.id;

	const [photo] = await db
		.select({ id: photos.id, user_id: photos.user_id })
		.from(photos)
		.where(and(eq(photos.id, photoId), isNull(photos.deleted_at)))
		.limit(1);

	if (!photo) error(404, 'Photo not found');
	if (photo.user_id === userId) error(400, 'Cannot like your own photo');

	const [existing] = await db
		.select()
		.from(photo_likes)
		.where(and(eq(photo_likes.photo_id, photoId), eq(photo_likes.user_id, userId)))
		.limit(1);

	if (existing) {
		await db
			.delete(photo_likes)
			.where(and(eq(photo_likes.photo_id, photoId), eq(photo_likes.user_id, userId)));
	} else {
		await db.insert(photo_likes).values({ photo_id: photoId, user_id: userId });
	}

	const [{ count }] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(photo_likes)
		.where(eq(photo_likes.photo_id, photoId));

	return json({ liked: !existing, count });
};
