<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { X } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let slackId = $state('');
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Invite - Admin - Shutter</title>
</svelte:head>

<div class="page-container">
	<div class="mb-6 flex items-center gap-3">
		<a href="/admin" class="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">← Admin</a>
		<h1 class="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Invite</h1>
	</div>

	<section class="mb-8">
		<h2 class="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">Add someone to the whitelist</h2>
		<p class="mb-3 text-xs text-zinc-500">Enter their Slack user ID (e.g. <code class="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">U01ABC123</code>). They'll receive a Slack DM with instructions.</p>

		<form
			method="POST"
			action="?/invite"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
					slackId = '';
				};
			}}
			class="flex gap-2"
		>
			<input
				type="text"
				name="slack_id"
				bind:value={slackId}
				placeholder="U01ABC123"
				autocomplete="off"
				spellcheck="false"
				class="w-48 rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
			/>
			<button
				type="submit"
				disabled={submitting || !slackId.trim()}
				class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110 active:brightness-100 disabled:cursor-not-allowed disabled:opacity-50"
				style="background-color:var(--color-accent)"
			>
				{submitting ? 'Inviting…' : 'Invite'}
			</button>
		</form>

		{#if form?.error}
			<p class="mt-2 text-xs text-red-500">{form.error}</p>
		{/if}
		{#if form?.ok && form?.invited}
			<p class="mt-2 text-xs text-green-600 dark:text-green-400">Invited <code class="font-mono">{form.invited}</code> and sent them a Slack DM.</p>
		{/if}
	</section>

	<section>
		<h2 class="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
			Whitelist — {data.whitelist.length} {data.whitelist.length === 1 ? 'person' : 'people'}
		</h2>

		{#if data.whitelist.length === 0}
			<p class="text-sm text-zinc-400">No one on the whitelist yet.</p>
		{:else}
			<div class="overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-800">
				{#each data.whitelist as entry (entry.slack_id)}
					<div class="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 last:border-0 dark:border-zinc-800/50">
						<code class="font-mono text-sm text-zinc-700 dark:text-zinc-300">{entry.slack_id}</code>
						<span class="text-xs text-zinc-400">
							{entry.invited_at
								? new Date(entry.invited_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
								: ''}
						</span>
						<form method="POST" action="?/remove" use:enhance>
							<input type="hidden" name="slack_id" value={entry.slack_id} />
							<button
								type="submit"
								title="Remove from whitelist"
								class="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
							><X size={12} /></button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
