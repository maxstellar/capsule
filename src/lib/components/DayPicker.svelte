<script lang="ts">
	import { goto } from '$app/navigation';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	let {
		currentDay,
		today,
		cohortStart = null,
		cohortEnd = null
	}: {
		currentDay: string;
		today: string;
		cohortStart?: string | null;
		cohortEnd?: string | null;
	} = $props();

	function offset(days: number): string {
		const d = new Date(currentDay + 'T12:00:00');
		d.setDate(d.getDate() + days);
		return d.toISOString().slice(0, 10);
	}

	let prevDay = $derived(offset(-1));
	let nextDay = $derived(offset(1));

	let isToday = $derived(currentDay === today);
	let atCohortStart = $derived(!!cohortStart && currentDay <= cohortStart);
	let atCohortEnd = $derived((!!cohortEnd && currentDay >= cohortEnd) || isToday);

	function nav(day: string) {
		if (day === today) goto('/');
		else goto(`/album/${day}`);
	}
</script>

<div class="flex items-center gap-2">
	<button
		onclick={() => nav(prevDay)}
		disabled={atCohortStart}
		aria-label="Previous day"
		class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-zinc-200 text-zinc-700 transition-colors disabled:opacity-30 [@media(hover:hover)]:hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:[@media(hover:hover)]:hover:bg-zinc-700"
	>
		<ChevronLeft size={14} />
	</button>
	<button
		onclick={() => nav(nextDay)}
		disabled={atCohortEnd}
		aria-label="Next day"
		class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-zinc-200 text-zinc-700 transition-colors disabled:opacity-30 [@media(hover:hover)]:hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:[@media(hover:hover)]:hover:bg-zinc-700"
	>
		<ChevronRight size={14} />
	</button>
</div>
