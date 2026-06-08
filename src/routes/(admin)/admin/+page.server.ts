import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth/access';
import { db } from '$lib/server/db';
import {
	photos,
	users,
	daily_prompts,
	prompt_completions,
	audit_log
} from '$lib/server/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { adminEditableDays, assertAdminDayEditable, currentETDay } from '$lib/server/time';
import { getWhitelistedSlackIds } from '$lib/server/auth/access';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { today, yesterday } = adminEditableDays();

	// Clamp requested day to [yesterday, today]
	const raw = url.searchParams.get('day') ?? today;
	const day = raw >= yesterday && raw <= today ? raw : today;

	const [allUsers, whitelistedIds] = await Promise.all([
		db.select().from(users),
		getWhitelistedSlackIds()
	]);
	const whitelisted = allUsers.filter((u) => u.slack_id && whitelistedIds.has(u.slack_id));

	const [photoCounts, completions, dayPrompt] = await Promise.all([
		db
			.select({
				user_id: photos.user_id,
				count: sql<number>`count(*)::int`
			})
			.from(photos)
			.where(and(eq(photos.day, day), isNull(photos.deleted_at)))
			.groupBy(photos.user_id),
		db.select().from(prompt_completions).where(eq(prompt_completions.day, day)),
		db.select().from(daily_prompts).where(eq(daily_prompts.day, day)).limit(1)
	]);

	const countMap = new Map(photoCounts.map((r) => [r.user_id, r.count]));
	const completionMap = new Map(completions.map((c) => [c.user_id, c.prompt_met]));

	const dayPhotos = await db
		.select({ id: photos.id, cdn_url: photos.cdn_url, user_id: photos.user_id })
		.from(photos)
		.where(and(eq(photos.day, day), isNull(photos.deleted_at)))
		.orderBy(photos.created_at);

	const photosByUser = new Map<string, typeof dayPhotos>();
	for (const p of dayPhotos) {
		if (!photosByUser.has(p.user_id)) photosByUser.set(p.user_id, []);
		photosByUser.get(p.user_id)!.push(p);
	}

	const members = whitelisted.map((u) => ({
		id: u.id,
		name: u.name,
		avatar_url: u.avatar_url,
		photoCount: countMap.get(u.id) ?? 0,
		prompt_met: completionMap.has(u.id) ? completionMap.get(u.id)! : null,
		photos: photosByUser.get(u.id) ?? []
	}));

	return {
		today,
		yesterday,
		day,
		prompt: dayPrompt[0] ?? null,
		members
	};
};

export const actions: Actions = {
	setPrompt: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const text = (form.get('text') as string)?.trim();
		const { today } = adminEditableDays();
		const day = today; // prompt can only be set for today

		if (!text) return fail(400, { error: 'Prompt text is required' });

		await db
			.insert(daily_prompts)
			.values({ day, text, set_by_user_id: event.locals.user!.id })
			.onConflictDoUpdate({
				target: daily_prompts.day,
				set: { text, set_by_user_id: event.locals.user!.id, updated_at: new Date() }
			});

		await db.insert(audit_log).values({
			actor_user_id: event.locals.user!.id,
			action: 'set_prompt',
			day,
			meta: { text }
		});

		return { ok: true };
	},

	deletePhoto: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const photoId = form.get('photo_id') as string;
		if (!photoId) return fail(400, { error: 'photo_id required' });

		const [row] = await db
			.select({ id: photos.id, user_id: photos.user_id })
			.from(photos)
			.where(and(eq(photos.id, photoId), isNull(photos.deleted_at)))
			.limit(1);

		if (!row) return fail(404, { error: 'Photo not found' });

		await db.update(photos).set({ deleted_at: new Date() }).where(eq(photos.id, photoId));

		await db.insert(audit_log).values({
			actor_user_id: event.locals.user!.id,
			action: 'admin_delete_photo',
			target_user_id: row.user_id,
			meta: { photo_id: photoId }
		});

		return { ok: true };
	},

	markCompletion: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const targetUserId = form.get('user_id') as string;
		const day = (form.get('day') as string) ?? currentETDay();
		const valueStr = form.get('value') as string;

		if (!targetUserId) return fail(400, { error: 'user_id required' });

		// value: 'yes' | 'no' | 'clear'
		let promptMet: number | null;
		if (valueStr === 'yes') promptMet = 1;
		else if (valueStr === 'no') promptMet = 0;
		else promptMet = null;

		assertAdminDayEditable(day);

		if (promptMet === null) {
			await db
				.delete(prompt_completions)
				.where(
					and(eq(prompt_completions.user_id, targetUserId), eq(prompt_completions.day, day))
				);
		} else {
			await db
				.insert(prompt_completions)
				.values({
					user_id: targetUserId,
					day,
					prompt_met: promptMet,
					marked_by_user_id: event.locals.user!.id
				})
				.onConflictDoUpdate({
					target: [prompt_completions.user_id, prompt_completions.day],
					set: {
						prompt_met: promptMet,
						marked_by_user_id: event.locals.user!.id,
						marked_at: new Date()
					}
				});
		}

		await db.insert(audit_log).values({
			actor_user_id: event.locals.user!.id,
			action: valueStr === 'yes' ? 'mark_prompt_met' : valueStr === 'no' ? 'mark_prompt_not_met' : 'clear_prompt_mark',
			target_user_id: targetUserId,
			day,
			meta: null
		});

		return { ok: true };
	}
};
