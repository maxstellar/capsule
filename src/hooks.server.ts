import type { Handle } from '@sveltejs/kit';
import { loadSession } from '$lib/server/auth/session';
import { isWhitelisted, isAdmin } from '$lib/server/auth/access';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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
