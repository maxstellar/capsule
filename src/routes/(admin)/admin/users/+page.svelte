<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import StreakBadge from '$lib/components/StreakBadge.svelte';

	let { data }: { data: PageData } = $props();

	let reminderSending = $state(false);
	let reminderResult = $state<{ sent: number; failed: number } | null>(null);
	let reminderError = $state<string | null>(null);

	function formatHour(h: number | null): string {
		if (h == null) return 'No reminder';
		if (h === 0) return '12 AM';
		if (h < 12) return `${h} AM`;
		if (h === 12) return '12 PM';
		return `${h - 12} PM`;
	}
</script>

<svelte:head>
	<title>Users - Admin - Shutter</title>
</svelte:head>

<div class="page-container">
	<div class="mb-6 flex items-center gap-3">
		<a href="/admin" class="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">← Admin</a>
		<h1 class="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Users</h1>
		<span class="text-sm text-zinc-400">{data.members.length} members</span>
	</div>

	{#if data.reminderEligibleCount > 0}
		<div
			class="mb-4 flex items-center justify-between gap-3 rounded-md border border-zinc-300 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-[#131315]"
		>
			<div>
				<p class="text-sm text-zinc-800 dark:text-zinc-200">PWA install + push reminder</p>
				<p class="text-xs text-zinc-500">
					DM the {data.reminderEligibleCount}
					{data.reminderEligibleCount === 1 ? 'user' : 'users'} who haven't enabled push notifications.
				</p>
			</div>
			<form
				method="POST"
				action="?/sendPwaReminders"
				use:enhance={({ cancel }) => {
					if (!confirm(`Send Slack DM to ${data.reminderEligibleCount} users?`)) {
						cancel();
						return;
					}
					reminderSending = true;
					reminderResult = null;
					reminderError = null;
					return async ({ result, update }) => {
						reminderSending = false;
						if (result.type === 'success' && result.data) {
							reminderResult = {
								sent: result.data.sent as number,
								failed: result.data.failed as number
							};
						} else if (result.type === 'failure' && result.data) {
							reminderError = (result.data.error as string) ?? 'Failed to send';
						}
						await update();
					};
				}}
			>
				<button
					type="submit"
					disabled={reminderSending}
					class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110 active:brightness-100 disabled:cursor-not-allowed disabled:opacity-60"
					style="background-color: var(--color-accent)"
				>
					{reminderSending ? 'Sending…' : 'Send DMs'}
				</button>
			</form>
		</div>
		{#if reminderResult}
			<p class="mb-4 text-xs text-zinc-500">
				Sent {reminderResult.sent}
				{reminderResult.sent === 1 ? 'DM' : 'DMs'}{reminderResult.failed > 0
					? `, ${reminderResult.failed} failed`
					: ''}.
			</p>
		{/if}
		{#if reminderError}
			<p class="mb-4 text-xs text-red-500">{reminderError}</p>
		{/if}
	{/if}

	<div class="overflow-hidden rounded-md border border-zinc-300 bg-zinc-50 dark:border-zinc-800 dark:bg-[#131315]">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-zinc-300 text-left dark:border-zinc-800">
					<th class="px-4 py-2.5 font-medium text-zinc-500">Member</th>
					<th class="px-4 py-2.5 font-medium text-zinc-500">Today</th>
					<th class="px-4 py-2.5 font-medium text-zinc-500">Streak</th>
					<th class="px-4 py-2.5 font-medium text-zinc-500">Notifications</th>
				</tr>
			</thead>
			<tbody>
				{#each data.members as member (member.id)}
					<tr class="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900">
						<td class="px-4 py-3">
							<div class="flex items-center gap-2">
								<UserAvatar name={member.name} avatarUrl={member.avatar_url} size={24} />
								<div>
									<p class="font-medium text-zinc-800 dark:text-zinc-200">{member.name}</p>
									<p class="text-xs text-zinc-400">{member.email}</p>
								</div>
							</div>
						</td>
						<td class="px-4 py-3 text-zinc-600 dark:text-zinc-400">
							{member.todayCount}/5
						</td>
						<td class="px-4 py-3">
							<StreakBadge streak={member.streak} />
						</td>
						<td class="px-4 py-3">
							<div class="space-y-1">
								<div class="text-xs text-zinc-600 dark:text-zinc-400">
									{formatHour(member.reminder_hour)}
								</div>
								<div class="flex flex-wrap gap-1 text-[10px]">
									{#if member.push_count > 0}
										<span class="rounded bg-zinc-200 px-1.5 py-0.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
											push ({member.push_count})
										</span>
									{/if}
									{#if member.has_slack && member.slack_notify}
										<span class="rounded bg-zinc-200 px-1.5 py-0.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
											slack
										</span>
									{/if}
									{#if member.push_count === 0 && !(member.has_slack && member.slack_notify)}
										<span class="text-zinc-400">none</span>
									{/if}
								</div>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
