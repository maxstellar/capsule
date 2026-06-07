<script lang="ts">
	import type { PageData } from './$types';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import StreakBadge from '$lib/components/StreakBadge.svelte';

	let { data }: { data: PageData } = $props();

	function relativeTime(date: Date | null | string): string {
		if (!date) return 'never';
		const d = date instanceof Date ? date : new Date(date);
		const diff = Date.now() - d.getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		return `${Math.floor(hrs / 24)}d ago`;
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

	<div class="overflow-hidden rounded-md border border-zinc-300 bg-zinc-50 dark:border-zinc-800 dark:bg-[#131315]">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-zinc-300 text-left dark:border-zinc-800">
					<th class="px-4 py-2.5 font-medium text-zinc-500">Member</th>
					<th class="px-4 py-2.5 font-medium text-zinc-500">Today</th>
					<th class="px-4 py-2.5 font-medium text-zinc-500">Streak</th>
					<th class="px-4 py-2.5 font-medium text-zinc-500">Last seen</th>
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
						<td class="px-4 py-3 text-xs text-zinc-400">
							{relativeTime(member.last_seen_at)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
