<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import DayPicker from '$lib/components/DayPicker.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { fitText } from '$lib/actions/fitText';

	let { data }: { data: PageData } = $props();

	type Photo = (typeof data.photos)[number];
	type Row = { photos: Photo[]; height: number };

	const GAP = 4;
	let containerWidth = $state(0);
	let targetHeight = $state(240);
	let minPhotoWidth = $state(100);

	onMount(() => {
		const update = () => {
			targetHeight = window.innerWidth >= 640 ? 260 : 180;
			minPhotoWidth = window.innerWidth >= 640 ? 180 : 100;
		};
		update();
		window.addEventListener('resize', update);
		return () => window.removeEventListener('resize', update);
	});

	function buildRows(photos: Photo[], width: number, target: number, gap: number, minW: number): Row[] {
		if (!width || !target || photos.length === 0) return [];
		const rows: Row[] = [];
		let buffer: Photo[] = [];
		let arSum = 0;
		let minAr = Infinity;

		for (const photo of photos) {
			const ar = photo.width && photo.height ? photo.width / photo.height : 1;
			const newArSum = arSum + ar;
			const newMinAr = Math.min(minAr, ar);
			const newHeight = (width - buffer.length * gap) / newArSum;

			if (buffer.length > 0 && newHeight * newMinAr < minW) {
				const heightWithout = (width - (buffer.length - 1) * gap) / arSum;
				rows.push({ photos: buffer, height: heightWithout });
				buffer = [photo];
				arSum = ar;
				minAr = ar;
				continue;
			}

			if (newHeight < target && buffer.length > 0) {
				const heightWithout = (width - (buffer.length - 1) * gap) / arSum;
				const errWith = Math.abs(newHeight - target);
				const errWithout = Math.abs(heightWithout - target);

				if (errWith <= errWithout) {
					buffer.push(photo);
					rows.push({ photos: buffer, height: newHeight });
					buffer = [];
					arSum = 0;
					minAr = Infinity;
				} else {
					rows.push({ photos: buffer, height: heightWithout });
					buffer = [photo];
					arSum = ar;
					minAr = ar;
				}
			} else {
				buffer.push(photo);
				arSum += ar;
				minAr = newMinAr;
			}
		}

		if (buffer.length > 0) {
			const naturalHeight = (width - (buffer.length - 1) * gap) / arSum;
			rows.push({ photos: buffer, height: Math.min(target, naturalHeight) });
		}

		return rows;
	}

	let rows = $derived(buildRows(data.photos, containerWidth, targetHeight, GAP, minPhotoWidth));

	let formattedDate = $derived(
		new Date(data.date + 'T12:00:00').toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		})
	);

	let lightboxIndex = $state(0);
	let lightboxOpen = $state(false);

	let lightboxPhotos = $derived(data.photos.map((p) => {
		const like = getLike(p);
		return { url: p.cdn_url, id: p.id, isOwn: p.user_id === data.user?.id, liked: like.liked, likeCount: like.count };
	}));

	function openLightbox(index: number) {
		lightboxIndex = index;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	const HEART_LIKED = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f496/emoji.svg';
	const HEART_OPEN  = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f90d/emoji.svg';

	let likeState = $state<Record<string, { count: number; liked: boolean }>>({});
	let burstIds = $state<Record<string, number>>({});

	function getLike(photo: (typeof data.photos)[number]) {
		return likeState[photo.id] ?? { count: photo.like_count, liked: photo.liked_by_me };
	}

	async function toggleLike(photoId: string) {
		const current = likeState[photoId] ?? {
			count: data.photos.find((p) => p.id === photoId)!.like_count,
			liked: data.photos.find((p) => p.id === photoId)!.liked_by_me
		};
		const wasLiked = current.liked;
		likeState[photoId] = { count: current.count + (wasLiked ? -1 : 1), liked: !wasLiked };
		if (!wasLiked) {
			burstIds[photoId] = (burstIds[photoId] ?? 0) + 1;
			setTimeout(() => { burstIds[photoId] = 0; }, 700);
		}
		const res = await fetch(`/api/photos/${photoId}/like`, { method: 'POST' });
		if (res.ok) {
			const body = await res.json();
			likeState[photoId] = { count: body.count, liked: body.liked };
		} else {
			likeState[photoId] = current;
		}
	}
</script>

<svelte:head>
	<title>Album - Shutter</title>
</svelte:head>

{#if lightboxOpen}
	<Lightbox photos={lightboxPhotos} startIndex={lightboxIndex} onclose={closeLightbox} onlike={toggleLike} />
{/if}

<div class="page-container">
	<div class="album-date-row mb-6 flex items-center justify-between gap-3">
		<h1 class="page-heading" use:fitText>
			{formattedDate}
		</h1>
		<DayPicker
			currentDay={data.date}
			today={data.today}
			cohortStart={data.cohortStart}
			cohortEnd={data.cohortEnd}
		/>
	</div>

	{#if data.prompt}
		<div
			class="mb-4 rounded-md border border-zinc-300 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-[#131315]"
		>
			<p class="mb-0.5 text-xs font-medium tracking-wide text-zinc-400 uppercase">Prompt</p>
			<p class="text-sm text-zinc-800 dark:text-zinc-200">{data.prompt.text}</p>
		</div>
	{/if}

	{#if data.photos.length === 0}
		<p class="mt-12 text-center text-sm text-zinc-400">No photos were submitted on this day.</p>
	{:else}
		{#snippet photoCard(photo: Photo, height: number)}
			{@const like = getLike(photo)}
			{@const isOwn = photo.user_id === data.user?.id}
			{@const idx = data.photos.findIndex((p) => p.id === photo.id)}
			{@const ar = photo.width && photo.height ? photo.width / photo.height : 1}
			<div style="width: {height * ar}px; height: {height}px" class="group relative shrink-0 overflow-hidden rounded-md">
				<button onclick={() => openLightbox(idx)} class="block h-full w-full cursor-pointer">
					<img
						src={photo.cdn_url}
						alt=""
						loading="lazy"
						class="h-full w-full object-cover transition-opacity group-hover:opacity-95"
					/>
				</button>
				{#key burstIds[photo.id]}
					{#if burstIds[photo.id]}
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<img src={HEART_LIKED} alt="" class="heart-burst" />
						</div>
					{/if}
				{/key}
				<div class="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-black/80 via-black/40 to-transparent px-2 pb-2 pt-20">
					{#if !isOwn || like.count > 0}
						<button
							class="pointer-events-auto flex cursor-pointer items-center gap-1.5 text-sm text-white/90 disabled:cursor-not-allowed"
							class:heart-pop={burstIds[photo.id] > 0}
							disabled={isOwn}
							onclick={(e) => { e.stopPropagation(); if (!isOwn) toggleLike(photo.id); }}
							aria-label={isOwn ? `${like.count} likes` : like.liked ? 'Unlike' : 'Like'}
						>
							<img src={isOwn || like.liked ? HEART_LIKED : HEART_OPEN} alt="" class="h-5 w-5" style={isOwn || like.liked ? 'filter: drop-shadow(0 0 3px rgba(255,100,100,0.6))' : ''} />
							{#if like.count > 0}<span>{like.count}</span>{/if}
						</button>
					{/if}
					<div class="pointer-events-none ml-auto">
						<span class="truncate text-xs text-white/90">{photo.user_name}</span>
					</div>
				</div>
			</div>
		{/snippet}

		<div class="flex flex-col gap-1" bind:clientWidth={containerWidth}>
			{#if containerWidth > 0}
				{#each rows as row}
					<div class="flex gap-1">
						{#each row.photos as photo (photo.id)}
							{@render photoCard(photo, row.height)}
						{/each}
					</div>
				{/each}
			{:else}
				<div class="flex h-64 items-center justify-center">
					<div class="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 dark:border-zinc-700" style="border-top-color: transparent"></div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	@keyframes heart-burst {
		0%   { transform: scale(0);   opacity: 0; }
		20%  { transform: scale(1.4); opacity: 1; }
		60%  { transform: scale(1.1); opacity: 1; }
		100% { transform: scale(1.6); opacity: 0; }
	}
	@keyframes heart-pop {
		0%   { transform: scale(1);    }
		40%  { transform: scale(1.25); }
		70%  { transform: scale(0.95); }
		100% { transform: scale(1);    }
	}
	.heart-burst {
		width: 3rem;
		height: 3rem;
		animation: heart-burst 0.65s ease-out forwards;
		pointer-events: none;
	}
	.heart-pop {
		animation: heart-pop 0.4s ease-out;
	}
</style>
