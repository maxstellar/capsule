# Shutter

A daily photo journal for Hack Club intern cohorts (could potentially be repurposed for other cohorts). Each day has a prompt for at least one photo; members upload up to 5 photos per day and build streaks. Admins can set prompts and review submissions.

Built with SvelteKit, PostgreSQL (Drizzle ORM), and Hack Club OAuth.

## Dev Setup

**1. Install dependencies**

```sh
npm install
```

**2. Configure environment variables**

Copy `.env.example` to `.env` and fill in the values:

| Variable                                                   | Description                                      |
| ---------------------------------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`                                             | PostgreSQL connection string                     |
| `HACKCLUB_AUTH_CLIENT_ID`                                  | OAuth app client ID                              |
| `HACKCLUB_AUTH_CLIENT_SECRET`                              | OAuth app client secret                          |
| `HACKCLUB_AUTH_REDIRECT_URI`                               | OAuth redirect URI                               |
| `WHITELIST_IDS`                                            | Comma-separated Slack user IDs with access       |
| `ADMIN_IDS`                                                | Comma-separated Slack user IDs with admin access |
| `COHORT_START` / `COHORT_END`                              | Date range for the cohort (YYYY-MM-DD)           |
| `HACKCLUB_CDN_TOKEN`                                       | Token for Hack Club CDN image hosting            |
| `SLACK_BOT_TOKEN`                                          | For Slack notifications (optional)               |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | For web push notifications (optional)            |
| `CRON_SECRET`                                              | Secret for cron endpoints                        |

Generate VAPID keys with `npx web-push generate-vapid-keys`.

**3. Start the database**

```sh
npm run db:start   # starts a local Postgres container via Docker Compose
npm run db:migrate # applies migrations
```

**4. Run the dev server**

```sh
npm run dev
```

## Other scripts

```sh
npm run build       # production build
npm run preview     # preview production build
npm run check       # type checking
npm run db:studio   # Drizzle Studio (visual DB browser)
npm run db:generate # generate migrations from schema changes
```

# Contributing

PRs welcome!
