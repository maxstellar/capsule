import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth/access';
import { db } from '$lib/server/db';
import { whitelist, audit_log } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { sendSlackDM } from '$lib/server/slack';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
	const entries = await db.select().from(whitelist).orderBy(whitelist.invited_at);
	return { whitelist: entries };
};

export const actions: Actions = {
	invite: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const slackId = (form.get('slack_id') as string)?.trim().toUpperCase();

		if (!slackId) return fail(400, { error: 'Slack user ID is required' });
		if (!/^[UW][A-Z0-9]+$/.test(slackId))
			return fail(400, { error: 'Invalid Slack user ID (should look like U01ABC123)' });

		await db
			.insert(whitelist)
			.values({ slack_id: slackId, invited_by_user_id: event.locals.user!.id })
			.onConflictDoNothing();

		const appUrl = env.ORIGIN ?? 'https://shutter.maxstellar.net';
		const msg = [
			`*You've been invited to Shutter, the shared photo album for Hack Club interns!*`,
			``,
			`Post at least 3 photos every day to maintain a streak! Each day will have a prompt that at least one of your photos should match (ex: take a photo with another intern outside of work, at a place you've never been to).\n\nAt the end of the summer, if everyone keeps up their streaks, we'll have around 2000 photos to look back on and cherish!`,
			``,
			`*<${appUrl}|Join us on Shutter!>*`
		].join('\n');

		await sendSlackDM(slackId, msg);

		await db.insert(audit_log).values({
			actor_user_id: event.locals.user!.id,
			action: 'invite_user',
			meta: { slack_id: slackId }
		});

		return { ok: true, invited: slackId };
	},

	remove: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const slackId = form.get('slack_id') as string;

		if (!slackId) return fail(400, { error: 'slack_id required' });

		await db.delete(whitelist).where(eq(whitelist.slack_id, slackId));

		await db.insert(audit_log).values({
			actor_user_id: event.locals.user!.id,
			action: 'remove_from_whitelist',
			meta: { slack_id: slackId }
		});

		return { ok: true };
	}
};
