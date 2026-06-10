<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import PromptCard from '$lib/components/PromptCard.svelte';
	import DayPicker from '$lib/components/DayPicker.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { fitText } from '$lib/actions/fitText';

	const HEART_LIKED = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f496/emoji.svg';
	const HEART_OPEN  = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f90d/emoji.svg';

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

	let lightboxIndex = $state(0);
	let lightboxOpen = $state(false);

	let outsideCohort = $derived(
		(!!data.cohortStart && data.today < data.cohortStart) ||
		(!!data.cohortEnd && data.today > data.cohortEnd)
	);

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

	// Optimistic like state
	let likeState = $state<Record<string, { count: number; liked: boolean }>>({});
	let burstIds = $state<Record<string, number>>({}); // photoId → animation key

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
	{#if outsideCohort}
		<div class="flex flex-col items-center gap-4 py-16 text-center">
			<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="sun" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="96" height="96" style="color:var(--color-accent)"><path d="M15.001 5C15.001 4.448 15.449 4 16.001 4C16.553 4 17.001 4.448 17.001 5V7C17.001 7.552 16.553 8 16.001 8C15.449 8 15.001 7.552 15.001 7V5ZM9.12203 7.707C8.73203 7.317 8.09903 7.317 7.70803 7.707C7.31803 8.098 7.31803 8.731 7.70803 9.121L9.12203 10.536C9.51303 10.926 10.146 10.926 10.537 10.536C10.927 10.145 10.927 9.512 10.537 9.121L9.12203 7.707ZM24.536 7.707C24.146 7.317 23.513 7.317 23.122 7.707L21.708 9.121C21.318 9.512 21.318 10.145 21.708 10.536C22.099 10.926 22.732 10.926 23.122 10.536L24.537 9.121C24.927 8.731 24.926 8.098 24.536 7.707Z"/><path d="M20.001 16.176C20.001 13.815 18.156 12 16.001 12C13.846 12 12.001 13.815 12.001 16.176H10.001C10.001 12.765 12.687 10 16.001 10C19.315 10 22.001 12.765 22.001 16.176H20.001Z"/><path d="M15.001 27.1694C15.001 27.7214 15.449 28.1694 16.001 28.1694C16.553 28.1694 17.001 27.7214 17.001 27.1694V25.1694C17.001 24.6174 16.553 24.1694 16.001 24.1694C15.449 24.1694 15.001 24.6174 15.001 25.1694V27.1694ZM9.122 24.4624C8.732 24.8524 8.099 24.8524 7.708 24.4624C7.318 24.0714 7.318 23.4384 7.708 23.0484L9.122 21.6334C9.513 21.2434 10.146 21.2434 10.537 21.6334C10.927 22.0244 10.927 22.6574 10.537 23.0484L9.122 24.4624ZM24.536 24.4624C24.146 24.8524 23.513 24.8524 23.122 24.4624L21.708 23.0484C21.318 22.6574 21.318 22.0244 21.708 21.6334C22.099 21.2434 22.732 21.2434 23.122 21.6334L24.537 23.0484C24.927 23.4384 24.926 24.0714 24.536 24.4624ZM27 17.1694C27.552 17.1694 28 16.7214 28 16.1694C28 15.6174 27.552 15.1694 27 15.1694H25C24.448 15.1694 24 15.6174 24 16.1694C24 16.7214 24.448 17.1694 25 17.1694H27ZM8 16.1694C8 16.7214 7.552 17.1694 7 17.1694H5C4.448 17.1694 4 16.7214 4 16.1694C4 15.6174 4.448 15.1694 5 15.1694H7C7.552 15.1694 8 15.6174 8 16.1694Z"/><path d="M20.001 16.1741C20.001 18.5351 18.156 20.3501 16.001 20.3501C13.846 20.3501 12.001 18.5351 12.001 16.1741H10.001C10.001 19.5851 12.687 22.3501 16.001 22.3501C19.315 22.3501 22.001 19.5851 22.001 16.1741H20.001Z"/></svg>
			<p class="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
				Summertime hasn't started yet! Come back when it's sunnier :)
			</p>
		</div>
	{:else}
		<div class="album-date-row mb-6 flex items-center justify-between gap-3">
			<h1 class="page-heading" use:fitText>
				{new Date(data.today + 'T12:00:00').toLocaleDateString('en-US', {
					weekday: 'long',
					month: 'long',
					day: 'numeric'
				})}
			</h1>
			<div data-onboard="daypicker">
				<DayPicker currentDay={data.today} today={data.today} cohortStart={data.cohortStart} cohortEnd={data.cohortEnd} />
			</div>
		</div>

		{#if data.prompt}
			<PromptCard prompt={data.prompt.text} myCount={data.myPhotoCount} showUploadCta />
		{:else}
			<div class="mb-8 rounded-md border border-zinc-300 bg-zinc-50 px-5 py-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
				No prompt set for today.
			</div>
		{/if}

		{#if data.photos.length === 0}
			<p class="mt-12 text-center text-sm text-zinc-400" data-onboard="album">
				No photos yet today. <a href="/upload" class="underline underline-offset-2" style="color:var(--color-accent)">Be the first.</a>
			</p>
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

			<div class="flex flex-col gap-1" bind:clientWidth={containerWidth} data-onboard="album">
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
