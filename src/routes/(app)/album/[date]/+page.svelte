<script lang="ts">
	import type { PageData } from './$types';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import DayPicker from '$lib/components/DayPicker.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { fitText } from '$lib/actions/fitText';

	let { data }: { data: PageData } = $props();

	let formattedDate = $derived(
		new Date(data.date + 'T12:00:00').toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		})
	);

	let lightboxPhotos = $state<string[]>([]);
	let lightboxIndex = $state(0);

	function openLightbox(photos: string[], index: number) {
		lightboxPhotos = photos;
		lightboxIndex = index;
	}

	function closeLightbox() {
		lightboxPhotos = [];
	}
</script>

<svelte:head>
	<title>Album - Shutter</title>
</svelte:head>

{#if lightboxPhotos.length > 0}
	<Lightbox photos={lightboxPhotos} startIndex={lightboxIndex} onclose={closeLightbox} />
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

	{#if data.groups.length === 0}
		<p class="mt-12 text-center text-sm text-zinc-400">No photos were submitted on this day.</p>
	{:else}
		<div class="space-y-4">
			{#each data.groups as group (group.userId)}
				{@const urls = group.photos.map((p) => p.cdn_url)}
				<div
					class="rounded-md border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#131315]"
				>
					<div class="mb-4 flex items-center gap-2">
						<UserAvatar name={group.name} avatarUrl={group.avatarUrl} size={32} />
						<span class="text-base font-medium text-zinc-700 dark:text-zinc-300">{group.name}</span>
						<span class="text-sm text-zinc-400">{group.photos.length}/5</span>
					</div>
					<div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
						{#each group.photos as photo, i (photo.id)}
							<button
								onclick={() => openLightbox(urls, i)}
								class="block cursor-pointer overflow-hidden rounded-md"
							>
								<img
									src={photo.cdn_url}
									alt=""
									loading="lazy"
									class="aspect-square w-full object-cover transition-opacity hover:opacity-90"
								/>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
