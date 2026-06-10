import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, photos, push_subscriptions } from '$lib/server/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { currentETDay } from '$lib/server/time';
import { computeStreak } from '$lib/server/streak';
import { getWhitelistedSlackIds, requireAdmin } from '$lib/server/auth/access';
import { sendSlackDM } from '$lib/server/slack';

function buildPwaReminderMessage(adminSlackId: string | null): string {
	const signoff = adminSlackId
		? `If you have any questions or run into trouble, reach out to me <@${adminSlackId}>.\n\nLooking forward to seeing your photos!`
		: 'Looking forward to seeing your photos!';

	return `*Thanks for signing up for Shutter!*

We're excited to see what photos you'll take and share with us in the next month, and to make your experience doing so as smooth as possible, we noticed a few things you could do to improve your experience!

*1. Install Shutter as an app on your phone*
• On iPhone (Safari): Tap the Share button → "Add to Home Screen"
• On Android (Chrome): Tap the ⋮ menu → "Install app" or "Add to Home Screen"

*2. Turn on push notifications*
After installing, open Shutter from your home screen. You'll see a prompt to enable notifications - tap "Enable notifications" to get a daily reminder to upload your photos (and follow the prompt!)

${signoff}`;
}

export const load: PageServerLoad = async () => {
	const today = currentETDay();

	const [allUsers, whitelistedIds] = await Promise.all([
		db.select().from(users).orderBy(users.name),
		getWhitelistedSlackIds()
	]);
	const whitelisted = allUsers.filter((u) => u.slack_id && whitelistedIds.has(u.slack_id));

	const [todayCounts, pushCounts] = await Promise.all([
		db
			.select({ user_id: photos.user_id, count: sql<number>`count(*)::int` })
			.from(photos)
			.where(and(eq(photos.day, today), isNull(photos.deleted_at)))
			.groupBy(photos.user_id),
		db
			.select({ user_id: push_subscriptions.user_id, count: sql<number>`count(*)::int` })
			.from(push_subscriptions)
			.groupBy(push_subscriptions.user_id)
	]);
	const countMap = new Map(todayCounts.map((r) => [r.user_id, r.count]));
	const pushMap = new Map(pushCounts.map((r) => [r.user_id, r.count]));

	const members = await Promise.all(
		whitelisted.map(async (u) => {
			const { current } = await computeStreak(u.id);
			return {
				id: u.id,
				name: u.name,
				email: u.email,
				avatar_url: u.avatar_url,
				todayCount: countMap.get(u.id) ?? 0,
				streak: current,
				reminder_hour: u.reminder_hour_local,
				slack_notify: u.slack_notify,
				has_slack: !!u.slack_id,
				push_count: pushMap.get(u.id) ?? 0
			};
		})
	);

	members.sort((a, b) => b.streak - a.streak || a.name.localeCompare(b.name));

	const reminderEligibleCount = members.filter((m) => m.has_slack && m.push_count === 0).length;

	return { members, today, reminderEligibleCount };
};

export const actions: Actions = {
	sendPwaReminders: async (event) => {
		requireAdmin(event);

		const [allUsers, whitelistedIds, pushUserIds] = await Promise.all([
			db.select().from(users),
			getWhitelistedSlackIds(),
			db
				.selectDistinct({ user_id: push_subscriptions.user_id })
				.from(push_subscriptions)
				.then((rows) => new Set(rows.map((r) => r.user_id)))
		]);

		const targets = allUsers.filter(
			(u) => u.slack_id && whitelistedIds.has(u.slack_id) && !pushUserIds.has(u.id)
		);

		if (targets.length === 0) {
			return fail(400, { error: 'No eligible users to message.' });
		}

		const message = buildPwaReminderMessage(event.locals.user?.slack_id ?? null);

		const results = await Promise.all(targets.map((u) => sendSlackDM(u.slack_id!, message)));
		const sent = results.filter(Boolean).length;
		const failed = results.length - sent;

		return { ok: true, sent, failed };
	}
};
