import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { randomBytes } from 'crypto';
import { getAuthorizeUrl } from '$lib/server/auth/hackclub';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	if (locals.user) throw redirect(303, '/');

	const state = randomBytes(16).toString('hex');
	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 600
	});

	const authorizeUrl = getAuthorizeUrl(state);
	return { authorizeUrl };
};
