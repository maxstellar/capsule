<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	// Default to tomorrow
	let tomorrow = $derived(() => {
		const d = new Date(data.today + 'T12:00:00');
		d.setDate(d.getDate() + 1);
		return d.toISOString().slice(0, 10);
	});

	let newDay = $state('');
	let newText = $state('');

	$effect(() => {
		newDay = tomorrow();
	});
</script>

<svelte:head>
	<title>Prompts - Admin - Capsule</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-6">
	<div class="mb-6 flex items-center gap-3">
		<a href="/admin" class="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">← Admin</a>
		<h1 class="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Prompts</h1>
	</div>

	<!-- Add / edit form -->
	<form method="POST" use:enhance class="mb-8 rounded-md border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#131315]">
		<h2 class="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Set a prompt</h2>
		<div class="mb-3 flex gap-2">
			<input
				type="date"
				name="day"
				bind:value={newDay}
				class="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
			/>
			<input
				type="text"
				name="text"
				bind:value={newText}
				placeholder="Prompt text..."
				class="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
			/>
			<button
				type="submit"
				class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110 active:brightness-100"
				style="background-color:var(--color-accent)"
			>
				Save
			</button>
		</div>
	</form>

	<!-- Existing prompts -->
	<h2 class="mb-3 text-sm font-medium text-zinc-500 uppercase tracking-wide">Recent prompts</h2>
	{#if data.prompts.length === 0}
		<p class="text-sm text-zinc-400">No prompts set yet.</p>
	{:else}
		<div class="space-y-1">
			{#each data.prompts as p (p.day)}
				<div class="flex items-start gap-3 rounded-md px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900">
					<span class="w-24 shrink-0 text-xs text-zinc-400">{p.day}</span>
					<span class="text-sm text-zinc-700 dark:text-zinc-300">{p.text}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
