<script lang="ts">
	import type { PageData } from './$types';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import StreakBadge from '$lib/components/StreakBadge.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Streaks - Shutter</title>
</svelte:head>

<div class="page-container">
	<h1 class="page-heading mb-6">Streaks</h1>

	{#if data.myStreak}
		<div
			class="mb-6 rounded-md border border-zinc-300 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-[#131315]"
		>
			<p class="mb-1 text-sm text-zinc-500">Your streak</p>
			<div class="flex items-baseline gap-2">
				<span class="streak-number text-zinc-900 dark:text-zinc-100">{data.myStreak.current}</span>
				<span class="text-xl text-zinc-500">day{data.myStreak.current !== 1 ? 's' : ''}</span>
			</div>
			<p class="mt-1 text-xs text-zinc-400">
				Longest: {data.myStreak.longest} day{data.myStreak.longest !== 1 ? 's' : ''}
			</p>
		</div>
	{/if}

	<h2 class="mb-3 text-sm font-medium tracking-wide text-zinc-500 uppercase">Leaderboard</h2>

	<div
		class="overflow-hidden rounded-md border border-zinc-300 bg-zinc-50 dark:border-zinc-800 dark:bg-[#131315]"
	>
		{#each data.streaks as member, i (member.id)}
			<div
				class="flex items-center gap-3 border-b border-zinc-200 px-3.5 py-3 transition-colors last:border-0 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
			>
				<span class="w-5 text-right text-xs text-zinc-400">{i + 1}</span>
				<UserAvatar name={member.name} avatarUrl={member.avatar_url} size={36} />
				<span class="flex-1 text-base text-zinc-800 dark:text-zinc-200">{member.name}</span>
				<StreakBadge streak={member.current} />
			</div>
		{/each}
	</div>
</div>

<style>
	.streak-number {
		font-family: var(--font-sans);
		font-weight: 600;
		font-size: 44px;
		line-height: 1;
		letter-spacing: -0.01em;
	}
</style>
