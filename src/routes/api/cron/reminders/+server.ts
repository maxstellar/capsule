import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { timingSafeEqual } from 'crypto';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import {
	users,
	photos,
	daily_prompts,
	push_subscriptions,
	reminder_sends
} from '$lib/server/db/schema';
import { and, eq, isNull, sql, lt } from 'drizzle-orm';
import { currentETDay, currentETHour } from '$lib/server/time';
import { sendPushNotification } from '$lib/server/push';
import { sendSlackDM } from '$lib/server/slack';
import { isWhitelisted } from '$lib/server/auth/access';

export const POST: RequestHandler = async (event) => {
	// Constant-time bearer check
	const authHeader = event.request.headers.get('authorization') ?? '';
	const provided = authHeader.replace(/^Bearer\s+/i, '');
	const expected = env.CRON_SECRET ?? '';

	if (!expected) error(500, 'CRON_SECRET not configured');

	const a = Buffer.from(provided);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !timingSafeEqual(a, b)) error(401, 'Unauthorized');

	const today = currentETDay();
	const hour = currentETHour();

	// Get all users with this reminder hour who haven't yet had 3 photos today
	const eligible = await db
		.select({
			id: users.id,
			name: users.name,
			slack_id: users.slack_id,
			slack_notify: users.slack_notify,
			photoCount: sql<number>`count(${photos.id}) filter (where ${photos.day} = ${today} and ${photos.deleted_at} is null)::int`
		})
		.from(users)
		.leftJoin(photos, eq(photos.user_id, users.id))
		.where(eq(users.reminder_hour_local, hour))
		.groupBy(users.id);

	const whitelistedEligible = eligible.filter((u) => isWhitelisted(u.slack_id) && u.photoCount < 3);

	if (whitelistedEligible.length === 0) return json({ sent: 0, hour, day: today });

	// Get today's prompt for the notification body
	const [todayPrompt] = await db
		.select()
		.from(daily_prompts)
		.where(eq(daily_prompts.day, today))
		.limit(1);

	const promptText = todayPrompt?.text ?? 'Time to post your daily photos!';

	let sent = 0;

	for (const user of whitelistedEligible) {
		// Dedupe temporarily disabled for testing

		let notified = false;

		// Push notifications
		const subs = await db
			.select()
			.from(push_subscriptions)
			.where(eq(push_subscriptions.user_id, user.id));

		for (const sub of subs) {
			await sendPushNotification(sub.id, sub.endpoint, sub.p256dh, sub.auth, {
				title: "Don't forget to post your photos!",
				body: promptText,
				url: '/upload'
			});
			notified = true;
		}

		// Slack DM
		if (user.slack_notify && user.slack_id) {
			const slackMsg = `*Don't forget to take/post photos for Shutter!*\n>${promptText}${env.ORIGIN ? `\n\n*<${env.ORIGIN}/upload|Go to Shutter>*` : ''}`;
			const ok = await sendSlackDM(user.slack_id, slackMsg);
			if (ok) notified = true;
		}

		if (notified) {
			await db
				.insert(reminder_sends)
				.values({ user_id: user.id, day: today, hour_local: hour })
				.onConflictDoNothing();
			sent++;
		}
	}

	return json({ sent, hour, day: today });
};
