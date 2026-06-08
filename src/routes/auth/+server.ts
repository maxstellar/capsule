import type { RequestHandler } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { exchangeCode, fetchHackClubUser } from '$lib/server/auth/hackclub';
import { fetchSlackAvatar } from '$lib/server/slack';
import { createSession } from '$lib/server/auth/session';
import { isWhitelisted } from '$lib/server/auth/access';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async (event) => {
	const { url, cookies, request } = event;

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state');

	cookies.delete('oauth_state', { path: '/' });

	if (!code || !state || !storedState || state !== storedState) {
		error(400, 'Invalid OAuth callback');
	}

	let accessToken: string;
	try {
		const result = await exchangeCode(code);
		accessToken = result.accessToken;
	} catch (e) {
		console.error('[auth callback] token exchange error:', e);
		error(502, 'Failed to complete sign-in. Please try again.');
	}

	let hcUser: Awaited<ReturnType<typeof fetchHackClubUser>>;
	try {
		hcUser = await fetchHackClubUser(accessToken);
	} catch (e) {
		console.error('[auth callback] userinfo error:', e);
		error(502, 'Failed to fetch user info. Please try again.');
	}

	const name = hcUser.name || hcUser.id;
	const email = hcUser.email || '';
	const slack_id = hcUser.slack_id ?? null;
	const slackAvatar = slack_id ? await fetchSlackAvatar(slack_id) : null;
	const avatar_url = slackAvatar ?? hcUser.avatar ?? null;

	// Upsert user — reminder_hour_local only set on first insert (17 = 5 PM ET default)
	await db
		.insert(users)
		.values({
			hackclub_id: hcUser.id,
			slack_id,
			name,
			email,
			avatar_url,
			reminder_hour_local: 17,
			last_seen_at: new Date()
		})
		.onConflictDoUpdate({
			target: users.hackclub_id,
			set: { slack_id, name, email, avatar_url, last_seen_at: new Date() }
		});

	const [user] = await db.select().from(users).where(eq(users.hackclub_id, hcUser.id)).limit(1);

	const ua = request.headers.get('user-agent');
	await createSession(user.id, ua, event);

	if (!(await isWhitelisted(slack_id))) {
		throw redirect(303, '/ineligible');
	}

	throw redirect(303, '/');
};
