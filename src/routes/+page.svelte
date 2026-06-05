<script lang="ts">
	import type { PageData } from './$types';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import PromptCard from '$lib/components/PromptCard.svelte';
	import DayPicker from '$lib/components/DayPicker.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';

	let { data }: { data: PageData } = $props();

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
	<title>Album - Capsule</title>
</svelte:head>

{#if lightboxPhotos.length > 0}
	<Lightbox photos={lightboxPhotos} startIndex={lightboxIndex} onclose={closeLightbox} />
{/if}

<div class="mx-auto max-w-6xl px-6 py-8 sm:max-w-2xl sm:py-12">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
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

	{#if data.groups.length === 0}
		<p class="mt-12 text-center text-sm text-zinc-400" data-onboard="album">
			No photos yet today. <a href="/upload" class="underline underline-offset-2" style="color:var(--color-accent)">Be the first.</a>
		</p>
	{:else}
		<div class="space-y-4" data-onboard="album">
			{#each data.groups as group (group.userId)}
				{@const urls = group.photos.map((p) => p.cdn_url)}
				<div class="rounded-md border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#131315]">
					<div class="mb-3 flex items-center gap-2">
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
