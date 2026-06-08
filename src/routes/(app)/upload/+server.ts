import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { requireWhitelisted } from '$lib/server/auth/access';
import { sniffMime, getDimensions } from '$lib/server/images';
import { getUploader } from '$lib/server/cdn';
import { uploadHackClubPhoto, deleteHackClubPhoto } from '$lib/server/hackclub-photos';
import { assertUserDayEditable, currentETDay } from '$lib/server/time';
import { db } from '$lib/server/db';
import { photos } from '$lib/server/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const MAX_PHOTOS_PER_DAY = 5;

export const POST: RequestHandler = async (event) => {
	requireWhitelisted(event);

	const formData = await event.request.formData();
	const file = formData.get('photo');
	if (!file || !(file instanceof File)) error(400, 'No photo provided');
	if (file.size > MAX_FILE_SIZE) error(413, 'File too large (max 15 MB)');

	const buffer = Buffer.from(await file.arrayBuffer());
	const mimeType = sniffMime(buffer);
	const { width, height } = getDimensions(buffer);

	const today = currentETDay();
	assertUserDayEditable(today);

	const userId = event.locals.user!.id;
	const hackClubUserId = event.locals.user!.hackclub_id;
	const uploader = getUploader();

	// Enforce 5-per-day with a serializable transaction
	let cdnResult: Awaited<ReturnType<typeof uploader.upload>>;
	try {
		cdnResult = await uploader.upload(buffer, file.name || 'photo.jpg', mimeType);
	} catch (err) {
		console.error('CDN upload failed:', err);
		error(502, 'Failed to upload photo. Please try again.');
	}

	const newPhoto = await db.transaction(async (tx) => {
		const [countRow] = await tx
			.select({ count: sql<number>`count(*)::int` })
			.from(photos)
			.where(and(eq(photos.user_id, userId), eq(photos.day, today), isNull(photos.deleted_at)));

		if ((countRow?.count ?? 0) >= MAX_PHOTOS_PER_DAY) {
			error(409, `You can only submit ${MAX_PHOTOS_PER_DAY} photos per day`);
		}

		const [inserted] = await tx
			.insert(photos)
			.values({
				user_id: userId,
				cdn_url: cdnResult.url,
				cdn_key: cdnResult.key ?? null,
				mime_type: mimeType,
				size_bytes: file.size,
				width: width ?? null,
				height: height ?? null
			})
			.returning();

		return inserted;
	});

	uploadHackClubPhoto({
		buffer,
		filename: file.name || 'photo.jpg',
		mimeType,
		userId: hackClubUserId,
		photoId: newPhoto.id
	})
		.then(async (mediaId) => {
			if (!mediaId) return;
			await db
				.update(photos)
				.set({ hackclub_photos_media_id: mediaId })
				.where(eq(photos.id, newPhoto.id));
		})
		.catch((err) => console.error('Hack Club Photos upload failed:', err));

	return json({ id: newPhoto.id, cdn_url: newPhoto.cdn_url, width: newPhoto.width, height: newPhoto.height });
};

export const DELETE: RequestHandler = async (event) => {
	requireWhitelisted(event);

	const photoId = event.url.searchParams.get('id');
	if (!photoId) error(400, 'Missing photo id');

	const today = currentETDay();
	assertUserDayEditable(today);

	const userId = event.locals.user!.id;

	const [row] = await db
		.select()
		.from(photos)
		.where(and(eq(photos.id, photoId), eq(photos.user_id, userId), isNull(photos.deleted_at)))
		.limit(1);

	if (!row) error(404, 'Photo not found');
	if (row.day !== today) error(403, 'Cannot delete photos from a past day');

	await db
		.update(photos)
		.set({ deleted_at: new Date() })
		.where(eq(photos.id, photoId));

	if (row.hackclub_photos_media_id) {
		deleteHackClubPhoto(row.hackclub_photos_media_id).catch((err) =>
			console.error('Hack Club Photos delete failed:', err)
		);
	}

	return json({ ok: true });
};
