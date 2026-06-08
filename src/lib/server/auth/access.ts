import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { whitelist } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

function parseIdSet(raw: string | undefined): Set<string> {
	if (!raw) return new Set();
	return new Set(
		raw
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	);
}

const ADMINS = parseIdSet(env.ADMIN_IDS);

export async function isWhitelisted(slackId: string | null): Promise<boolean> {
	if (!slackId) return false;
	if (ADMINS.has(slackId)) return true;
	const [row] = await db
		.select({ slack_id: whitelist.slack_id })
		.from(whitelist)
		.where(eq(whitelist.slack_id, slackId))
		.limit(1);
	return !!row;
}

export function isAdmin(slackId: string | null): boolean {
	if (!slackId) return false;
	return ADMINS.has(slackId);
}

export async function getWhitelistedSlackIds(): Promise<Set<string>> {
	const rows = await db.select({ slack_id: whitelist.slack_id }).from(whitelist);
	const ids = new Set(rows.map((r) => r.slack_id));
	for (const id of ADMINS) ids.add(id);
	return ids;
}

export function requireWhitelisted(event: RequestEvent): void {
	if (!event.locals.isWhitelisted) {
		error(401, 'Unauthorized');
	}
}

export function requireAdmin(event: RequestEvent): void {
	if (!event.locals.isAdmin) {
		error(404, 'Not found');
	}
}
