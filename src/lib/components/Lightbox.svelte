<script lang="ts">
	import { ChevronLeft, ChevronRight, X } from 'lucide-svelte';

	type Photo = {
		url: string;
		id?: string;
		liked?: boolean;
		likeCount?: number;
		isOwn?: boolean;
	};

	let {
		photos,
		startIndex = 0,
		onclose,
		onlike
	}: {
		photos: Photo[];
		startIndex?: number;
		onclose: () => void;
		onlike?: (id: string) => void;
	} = $props();

	let current = $state(startIndex);

	function prev() { current = (current - 1 + photos.length) % photos.length; }
	function next() { current = (current + 1) % photos.length; }

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
		if (e.key === 'ArrowLeft') prev();
		if (e.key === 'ArrowRight') next();
	}

	let photo = $derived(photos[current]);

	const HEART_LIKED = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f496/emoji.svg';
	const HEART_OPEN  = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f90d/emoji.svg';

	let burstKey = $state(0);
	let popping = $state(false);

	function handleLike() {
		if (photo.isOwn || !photo.id || !onlike) return;
		if (!photo.liked) {
			burstKey++;
			popping = true;
			setTimeout(() => { popping = false; }, 500);
		}
		onlike(photo.id);
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
	<div class="flex max-h-[calc(100dvh-160px)] max-w-[90dvw] items-center justify-center" onclick={(e) => e.stopPropagation()}>
		<img
			src={photo.url}
			alt=""
			class="max-h-[calc(100dvh-160px)] max-w-[90dvw] rounded-md object-contain"
		/>
	</div>

	<!-- Heart burst -->
	{#key burstKey}
		{#if burstKey > 0}
			<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
				<img src={HEART_LIKED} alt="" class="heart-burst" />
			</div>
		{/if}
	{/key}

	<!-- Like button -->
	{#if photo.id && onlike && (!photo.isOwn || (photo.likeCount ?? 0) > 0)}
		<button
			onclick={(e) => { e.stopPropagation(); if (!photo.isOwn) handleLike(); }}
			disabled={photo.isOwn}
			aria-label={photo.isOwn ? `${photo.likeCount ?? 0} likes` : photo.liked ? 'Unlike' : 'Like'}
			class="absolute bottom-6 left-1/2 -translate-x-1/2 flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:hover:bg-white/10"
			class:heart-pop={popping}
		>
			<img src={photo.isOwn || photo.liked ? HEART_LIKED : HEART_OPEN} alt="" class="h-5 w-5" style={photo.isOwn || photo.liked ? 'filter: drop-shadow(0 0 4px rgba(255,100,100,0.7))' : ''} />
			{#if (photo.likeCount ?? 0) > 0}
				<span class="text-sm tabular-nums">{photo.likeCount}</span>
			{/if}
		</button>
	{/if}
</div>

<style>
	@keyframes heart-burst {
		0%   { transform: scale(0);   opacity: 0; }
		20%  { transform: scale(1.6); opacity: 1; }
		60%  { transform: scale(1.3); opacity: 1; }
		100% { transform: scale(2);   opacity: 0; }
	}
	@keyframes heart-pop {
		0%   { transform: scale(1);    }
		40%  { transform: scale(1.25); }
		70%  { transform: scale(0.95); }
		100% { transform: scale(1);    }
	}
	.heart-burst {
		width: 5rem;
		height: 5rem;
		animation: heart-burst 0.65s ease-out forwards;
		pointer-events: none;
	}
	.heart-pop {
		animation: heart-pop 0.4s ease-out;
	}
</style>
