import { env } from '$env/dynamic/private';

const BASE_URL = 'https://photos.hackclub.com/api/v1';

interface UploadHackClubPhotoOptions {
	buffer: Buffer;
	filename: string;
	mimeType: string;
	userId: string;
	photoId: string;
}

export async function uploadHackClubPhoto({
	buffer,
	filename,
	mimeType,
	userId,
	photoId
}: UploadHackClubPhotoOptions): Promise<string | null> {
	const apiKey = env.HACKCLUB_PHOTOS_ADMIN_API_KEY;
	const eventId = env.HACKCLUB_PHOTOS_EVENT_ID;
	if (!apiKey || !eventId) return null;

	const form = new FormData();
	form.append('file', new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);
	form.append('eventId', eventId);
	form.append('tags', 'intern-2026');
	form.append('uploadedById', userId);
	form.append('globalAdminOnlyDelete', 'true');
	form.append(
		'metadata',
		JSON.stringify({
			source: 'shutter',
			externalId: photoId
		})
	);

	const res = await fetch(`${BASE_URL}/upload`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${apiKey}` },
		body: form
	});

	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`Hack Club Photos upload failed ${res.status}: ${text}`);
	}

	const data = await res.json();
	return typeof data.media?.id === 'string' ? data.media.id : null;
}

export async function deleteHackClubPhoto(mediaId: string): Promise<void> {
	const apiKey = env.HACKCLUB_PHOTOS_ADMIN_API_KEY;
	if (!apiKey) return;

	const res = await fetch(`${BASE_URL}/admin/media/${mediaId}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${apiKey}` }
	});

	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`Hack Club Photos delete failed ${res.status}: ${text}`);
	}
}
