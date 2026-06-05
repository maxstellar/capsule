<script lang="ts">
	let {
		prompt,
		myCount,
		showUploadCta = false
	}: {
		prompt: string;
		myCount: number;
		showUploadCta?: boolean;
	} = $props();

</script>

<div
	class="mb-4 rounded-md border border-zinc-300 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-[#131315]"
>
	<div class="flex items-start justify-between gap-4">
		<div>
			<p class="mb-2 text-base font-medium uppercase tracking-wide text-zinc-400">Today's prompt</p>
			<p class="text-lg text-zinc-800 dark:text-zinc-200">{prompt}</p>
		</div>
		<div class="shrink-0 text-right">
			<p class="text-xs text-zinc-400">{myCount}/5 photos</p>
		</div>
	</div>

	<div class="mt-4 flex items-center gap-1.5">
		{#each Array(5) as _, i}
			<div
				class="h-2 flex-1 rounded-full transition-colors"
				style={i < myCount ? 'background-color:var(--color-accent)' : ''}
				class:bg-zinc-300={i >= myCount && i < 3}
				class:dark:bg-zinc-600={i >= myCount && i < 3}
				class:bg-zinc-200={i >= myCount && i >= 3}
				class:dark:bg-zinc-800={i >= myCount && i >= 3}
			></div>
		{/each}
	</div>

	{#if showUploadCta}
		<a
			href="/upload"
			class="mt-4 flex w-full items-center justify-center rounded-md px-6 py-3 text-base font-bold text-white transition-colors"
			style={myCount >= 5 ? 'background-color:#71717a' : 'background-color:var(--color-accent)'}
		>
			{myCount >= 5 ? 'Edit your photos' : 'Upload photos'}
		</a>
	{/if}
</div>

