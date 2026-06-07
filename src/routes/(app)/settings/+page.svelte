<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	// Track select value locally so toggles react before save
	let selectValue = $state(data.reminderHour != null ? String(data.reminderHour) : '');
	$effect(() => {
		selectValue = data.reminderHour != null ? String(data.reminderHour) : '';
	});
	let noReminder = $derived(data.reminderHour == null);

	let reminderSaved = $state(false);
	let savedTimer: ReturnType<typeof setTimeout> | undefined;
	function showSaved() {
		if (savedTimer) clearTimeout(savedTimer);
		reminderSaved = true;
		savedTimer = setTimeout(() => {
			reminderSaved = false;
		}, 2500);
	}

	let pushSupported = $state(false);
	let pushEnabled = $state(false);

	$effect(() => {
		pushEnabled = data.subscriptionCount > 0;
	});
	let pushLoading = $state(false);
	let pushError = $state<string | null>(null);

	$effect(() => {
		pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
	});

	function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
		const raw = atob(base64);
		const arr = new Uint8Array(raw.length);
		for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
		return arr.buffer;
	}

	async function enablePush() {
		pushLoading = true;
		pushError = null;
		try {
			const permission = await Notification.requestPermission();
			if (permission !== 'granted') {
				pushError = 'Notification permission denied.';
				return;
			}
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(data.vapidPublicKey)
			});
			const res = await fetch('/api/push/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(sub.toJSON())
			});
			if (!res.ok) throw new Error('Subscription save failed');
			pushEnabled = true;
		} catch (e) {
			pushError = e instanceof Error ? e.message : 'Failed to enable push';
		} finally {
			pushLoading = false;
		}
	}

	async function disablePush() {
		pushLoading = true;
		pushError = null;
		try {
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.getSubscription();
			if (sub) {
				await fetch('/api/push/unsubscribe', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ endpoint: sub.endpoint })
				});
				await sub.unsubscribe();
			}
			pushEnabled = false;
		} catch (e) {
			pushError = e instanceof Error ? e.message : 'Failed to disable push';
		} finally {
			pushLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Settings - Shutter</title>
</svelte:head>

<div class="page-container">
	<h1 class="page-heading mb-6">
		Settings
	</h1>

	<!-- Reminder time -->
	<section class="mb-8">
		<h2 class="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Daily reminder</h2>
		<div class="rounded-md border border-zinc-300 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-[#131315]">
			<form
				method="POST"
				action="?/saveReminder"
				use:enhance={() =>
					async ({ result, update }) => {
						await update();
						if (result.type === 'success') showSaved();
					}}
				class="flex items-center gap-3"
			>
				<select
					name="hour"
					bind:value={selectValue}
					class="cursor-pointer rounded-md border border-zinc-300 bg-white py-1.5 pr-9 pl-2.5 text-sm text-zinc-900 focus:ring-2 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
				>
					<option value="">No reminder</option>
					{#each Array(24) as _, h}
						<option value={String(h)}
							>{h === 0
								? '12:00 AM'
								: h < 12
									? `${h}:00 AM`
									: h === 12
										? '12:00 PM'
										: `${h - 12}:00 PM`}</option
						>
					{/each}
				</select>
				<button
					type="submit"
					class="cursor-pointer rounded-md border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
				>
					Save
				</button>
			</form>
		</div>
	</section>

	<!-- Reminders -->
	<section class="mb-8">
		<h2 class="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Reminders</h2>
		<div
			class="divide-y divide-zinc-200 rounded-md border border-zinc-300 bg-zinc-50 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-[#131315]"
		>
			<div class="flex items-center justify-between px-4 py-3">
				<div class:opacity-40={noReminder}>
					<p class="text-sm text-zinc-800 dark:text-zinc-200">Push notification</p>
					<p class="text-xs text-zinc-400">Browser alert on this device</p>
				</div>
				<button
					role="switch"
					aria-checked={pushEnabled}
					onclick={pushEnabled ? disablePush : enablePush}
					disabled={pushLoading || !pushSupported || noReminder}
					class="toggle"
					style={pushEnabled ? 'background-color: var(--color-accent)' : ''}
				>
					<span class="toggle-dot"></span>
				</button>
			</div>
			{#if data.hasSlack}
				<div class="flex items-center justify-between px-4 py-3">
					<div class:opacity-40={noReminder}>
						<p class="text-sm text-zinc-800 dark:text-zinc-200">Slack DM</p>
						<p class="text-xs text-zinc-400">Direct message in Hack Club Slack</p>
					</div>
					<form method="POST" action="?/saveSlackNotify" use:enhance>
						<input type="hidden" name="enabled" value={data.slackNotify ? '0' : '1'} />
						<button
							type="submit"
							role="switch"
							aria-checked={data.slackNotify}
							class="toggle"
							disabled={noReminder}
							style={data.slackNotify ? 'background-color: var(--color-accent)' : ''}
						>
							<span class="toggle-dot"></span>
						</button>
					</form>
				</div>
			{/if}
		</div>
		{#if pushError}
			<p class="mt-2 text-xs text-red-500">{pushError}</p>
		{/if}
	</section>

	<!-- Sign out -->
	<section>
		<h2 class="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Account</h2>
		<div class="rounded-md border border-zinc-300 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-[#131315]">
			<p class="mb-3 text-xs text-zinc-500">
				Photos submitted to Shutter are stored on the Hack Club CDN and cannot be automatically
				deleted once uploaded. Contact an admin if you need a photo removed.
			</p>
			<form method="POST" action="/logout">
				<button
					type="submit"
					class="cursor-pointer text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
				>
					Sign out
				</button>
			</form>
		</div>
	</section>
</div>

{#if reminderSaved}
	<div
		class="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg sm:bottom-6 dark:bg-zinc-100 dark:text-zinc-900"
	>
		Reminder time saved
	</div>
{/if}

<style>
	.toggle {
		position: relative;
		display: inline-block;
		height: 1.5rem;
		width: 2.75rem;
		flex-shrink: 0;
		cursor: pointer;
		border-radius: 9999px;
		background-color: #d4d4d8;
		border: none;
		transition: background-color 150ms;
	}
	:global(html.dark) .toggle {
		background-color: #52525b;
	}
	.toggle:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.toggle-dot {
		pointer-events: none;
		position: absolute;
		top: 3px;
		left: 3px;
		height: 1.125rem;
		width: 1.125rem;
		border-radius: 9999px;
		background-color: white;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		transition: transform 150ms;
	}
	.toggle[aria-checked='true'] .toggle-dot {
		transform: translateX(1.25rem);
	}
</style>
