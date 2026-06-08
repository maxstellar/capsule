import type { Handle } from '@sveltejs/kit';
import { loadSession } from '$lib/server/auth/session';
import { isWhitelisted, isAdmin } from '$lib/server/auth/access';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { Cron } from 'croner';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

if (!dev) {
	new Cron('* * * * *', async () => {
		try {
			const res = await fetch(`http://localhost:${process.env.PORT ?? 3000}/api/cron/reminders`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${env.CRON_SECRET}` }
			});
			if (!res.ok) {
				console.error('[Cron] reminders HTTP error', res.status, await res.text());
			} else {
				console.log('[Cron] reminders ok', await res.json());
			}
		} catch (err) {
			console.error('[Cron] reminders error', err);
		}
	});
}

export const handleError = ({ error }: { error: unknown }) => {
	console.error('[handleError]', error);
	if (error instanceof Error && error.cause) console.error('[handleError cause]', error.cause);
};

export const handle: Handle = async ({ event, resolve }) => {
	const session = await loadSession(event);

	if (session) {
		const [user] = await db.select().from(users).where(eq(users.id, session.user_id)).limit(1);
		if (user) {
			event.locals.user = user;
			event.locals.session = session;
			event.locals.isWhitelisted = isWhitelisted(user.slack_id);
			event.locals.isAdmin = isAdmin(user.slack_id);
		} else {
			event.locals.user = null;
			event.locals.session = null;
			event.locals.isWhitelisted = false;
			event.locals.isAdmin = false;
		}
	} else {
		event.locals.user = null;
		event.locals.session = null;
		event.locals.isWhitelisted = false;
		event.locals.isAdmin = false;
	}

	return resolve(event);
};
