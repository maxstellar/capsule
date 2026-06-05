<script lang="ts">
	import { ChevronLeft, ChevronRight, X } from 'lucide-svelte';

	let {
		photos,
		startIndex = 0,
		onclose
	}: {
		photos: string[];
		startIndex?: number;
		onclose: () => void;
	} = $props();

	let current = $state(startIndex);

	function prev() { current = (current - 1 + photos.length) % photos.length; }
	function next() { current = (current + 1) % photos.length; }

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
		if (e.key === 'ArrowLeft') prev();
		if (e.key === 'ArrowRight') next();
	}
</script>

<svelte:window onkeydown={handleKey} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/92"
	onclick={onclose}
	role="dialog"
	aria-modal="true"
>
	<!-- Close -->
	<button
		onclick={onclose}
		aria-label="Close"
		class="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
	>
		<X size={18} />
	</button>

	<!-- Counter -->
	{#if photos.length > 1}
		<p class="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/60 tabular-nums">
			{current + 1} / {photos.length}
		</p>
	{/if}

	<!-- Nav arrows pinned to screen edges -->
	{#if photos.length > 1}
		<button
			onclick={(e) => { e.stopPropagation(); prev(); }}
			aria-label="Previous photo"
			class="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
		>
			<ChevronLeft size={20} />
		</button>
		<button
			onclick={(e) => { e.stopPropagation(); next(); }}
			aria-label="Next photo"
			class="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
		>
			<ChevronRight size={20} />
		</button>
	{/if}

	<!-- Image -->
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="flex max-h-[90dvh] max-w-[90dvw] items-center justify-center" onclick={(e) => e.stopPropagation()}>
		<img
			src={photos[current]}
			alt=""
			class="max-h-[90dvh] max-w-[90dvw] rounded-md object-contain"
		/>
	</div>
</div>
