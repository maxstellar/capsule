import {
	pgTable,
	text,
	uuid,
	timestamp,
	smallint,
	date,
	integer,
	jsonb,
	bigserial,
	boolean,
	primaryKey,
	index,
	uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

const tsz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });

export const users = pgTable(
	'users',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		hackclub_id: text('hackclub_id').notNull().unique(),
		slack_id: text('slack_id'),
		slack_notify: boolean('slack_notify').notNull().default(true),
		name: text('name').notNull(),
		email: text('email').notNull(),
		avatar_url: text('avatar_url'),
		reminder_hour_local: smallint('reminder_hour_local'),
		onboarded: boolean('onboarded').notNull().default(false),
		created_at: tsz('created_at').notNull().defaultNow(),
		last_seen_at: tsz('last_seen_at')
	},
	(t) => [uniqueIndex('users_hackclub_id_idx').on(t.hackclub_id)]
);

export const sessions = pgTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		user_id: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		expires_at: tsz('expires_at').notNull(),
		user_agent: text('user_agent'),
		created_at: tsz('created_at').notNull().defaultNow(),
		last_seen_at: tsz('last_seen_at').notNull().defaultNow()
	},
	(t) => [index('sessions_expires_at_idx').on(t.expires_at)]
);

export const photos = pgTable(
	'photos',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		user_id: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		created_at: tsz('created_at').notNull().defaultNow(),
		// Computed from created_at in America/New_York; Postgres 12+ stored generated column
		day: date('day').generatedAlwaysAs(
			sql`((created_at AT TIME ZONE 'America/New_York')::date)`
		),
		cdn_url: text('cdn_url').notNull(),
		cdn_key: text('cdn_key'),
		mime_type: text('mime_type').notNull(),
		size_bytes: integer('size_bytes').notNull(),
		width: integer('width'),
		height: integer('height'),
		deleted_at: tsz('deleted_at')
	},
	(t) => [
		index('photos_user_day_idx').on(t.user_id, t.day),
		index('photos_day_user_idx').on(t.day, t.user_id)
	]
);

export const daily_prompts = pgTable('daily_prompts', {
	day: date('day').primaryKey(),
	text: text('text').notNull(),
	set_by_user_id: uuid('set_by_user_id').references(() => users.id, { onDelete: 'set null' }),
	created_at: tsz('created_at').notNull().defaultNow(),
	updated_at: tsz('updated_at').notNull().defaultNow()
});

export const prompt_completions = pgTable(
	'prompt_completions',
	{
		user_id: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		day: date('day').notNull(),
		// null = not yet reviewed (benefit of the doubt — streak intact)
		// 1 = admin approved
		// 0 = admin rejected (streak broken for this day)
		prompt_met: smallint('prompt_met'),
		marked_by_user_id: uuid('marked_by_user_id').references(() => users.id, {
			onDelete: 'set null'
		}),
		marked_at: tsz('marked_at').notNull().defaultNow()
	},
	(t) => [primaryKey({ columns: [t.user_id, t.day] })]
);

export const push_subscriptions = pgTable('push_subscriptions', {
	id: uuid('id').primaryKey().defaultRandom(),
	user_id: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	endpoint: text('endpoint').notNull().unique(),
	p256dh: text('p256dh').notNull(),
	auth: text('auth').notNull(),
	user_agent: text('user_agent'),
	created_at: tsz('created_at').notNull().defaultNow(),
	failure_count: smallint('failure_count').notNull().default(0)
});

export const reminder_sends = pgTable(
	'reminder_sends',
	{
		user_id: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		day: date('day').notNull(),
		hour_local: smallint('hour_local').notNull(),
		sent_at: tsz('sent_at').notNull().defaultNow()
	},
	(t) => [primaryKey({ columns: [t.user_id, t.day, t.hour_local] })]
);

export const audit_log = pgTable('audit_log', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	actor_user_id: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
	action: text('action').notNull(),
	target_user_id: uuid('target_user_id').references(() => users.id, { onDelete: 'set null' }),
	day: date('day'),
	meta: jsonb('meta'),
	created_at: tsz('created_at').notNull().defaultNow()
});

export const whitelist = pgTable('whitelist', {
	slack_id: text('slack_id').primaryKey(),
	invited_by_user_id: uuid('invited_by_user_id').references(() => users.id, { onDelete: 'set null' }),
	invited_at: tsz('invited_at').notNull().defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	photos: many(photos),
	push_subscriptions: many(push_subscriptions),
	prompt_completions: many(prompt_completions)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.user_id], references: [users.id] })
}));

export const photosRelations = relations(photos, ({ one }) => ({
	user: one(users, { fields: [photos.user_id], references: [users.id] })
}));

export const promptCompletionsRelations = relations(prompt_completions, ({ one }) => ({
	user: one(users, { fields: [prompt_completions.user_id], references: [users.id] }),
	marked_by: one(users, {
		fields: [prompt_completions.marked_by_user_id],
		references: [users.id]
	})
}));
