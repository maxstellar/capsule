<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { X } from 'lucide-svelte';
	import PromptCard from '$lib/components/PromptCard.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';

	let lightboxPhotos = $state<string[]>([]);
	let lightboxIndex = $state(0);

	function openLightbox(index: number) {
		lightboxPhotos = data.photos.map((p) => p.cdn_url);
		lightboxIndex = index;
	}

	let { data }: { data: PageData } = $props();

	let uploading = $state(false);
	let error = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);

	// Remaining slots
	let remaining = $derived(5 - data.photos.length);
	let canUpload = $derived(remaining > 0);

	async function stripExifAndUpload(file: File): Promise<void> {
		// Re-encode via canvas to strip EXIF (including GPS data)
		const bitmap = await createImageBitmap(file);
		const canvas = document.createElement('canvas');
		canvas.width = bitmap.width;
		canvas.height = bitmap.height;
		const ctx = canvas.getContext('2d')!;
		ctx.drawImage(bitmap, 0, 0);
		bitmap.close();

		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
				'image/jpeg',
				0.92
			);
		});

		const form = new FormData();
		form.append('photo', blob, file.name.replace(/\.[^.]+$/, '.jpg'));

		const res = await fetch('/upload', { method: 'POST', body: form });
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error(body.message ?? 'Upload failed');
		}
	}

	async function handleFiles(files: FileList | null) {
		if (!files || files.length === 0) return;
		error = null;
		const selected = Array.from(files);
		if (selected.length > remaining) {
			error = `You selected ${selected.length} photo${selected.length !== 1 ? 's' : ''} but only have ${remaining} slot${remaining !== 1 ? 's' : ''} remaining. Please select ${remaining} or fewer.`;
			if (fileInput) fileInput.value = '';
			return;
		}
		uploading = true;
		try {
			for (const file of selected) {
				await stripExifAndUpload(file);
			}
			await invalidateAll();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Upload failed';
		} finally {
			uploading = false;
			if (fileInput) fileInput.value = '';
		}
	}

	async function deletePhoto(id: string) {
		const res = await fetch(`/upload?id=${id}`, { method: 'DELETE' });
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			error = body.message ?? 'Could not delete photo';
			return;
		}
		await invalidateAll();
	}
</script>

{#if lightboxPhotos.length > 0}
	<Lightbox
		photos={lightboxPhotos}
		startIndex={lightboxIndex}
		onclose={() => (lightboxPhotos = [])}
	/>
{/if}

<svelte:head>
	<title>Upload - Capsule</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-8 sm:py-12">
	<h1 class="mb-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
		Upload
	</h1>
	<p class="mb-6 text-sm text-zinc-500">
		Add up to 5 photos to the album! You need at least 3 to keep your streak.
		<br /><br />
		<strong
			>DO NOT SUBMIT SENSITIVE PHOTOS! These photos will be uploaded to Hack Club CDN! Make sure you
			get consent from your subjects.</strong
		>
	</p>
	{#if data.prompt}
		<PromptCard prompt={data.prompt.text} myCount={data.photos.length} />
	{/if}

	{#if error}
		<p
			class="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
		>
			{error}
		</p>
	{/if}

	<!-- Photo grid: 5 slots -->
	<div class="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-5">
		{#each data.photos as photo, i (photo.id)}
			<div class="group relative overflow-hidden rounded-md">
				<button onclick={() => openLightbox(i)} class="block w-full cursor-pointer">
					<img
						src={photo.cdn_url}
						alt=""
						class="aspect-square w-full object-cover"
						loading="lazy"
						onerror={(e) => {
							const img = e.currentTarget as HTMLImageElement;
							const attempts = parseInt(img.dataset.attempts ?? '0');
							if (attempts < 4) {
								img.dataset.attempts = String(attempts + 1);
								setTimeout(
									() => {
										img.src = photo.cdn_url + '?t=' + Date.now();
									},
									1500 * (attempts + 1)
								);
							}
						}}
					/>
				</button>
				<button
					onclick={() => deletePhoto(photo.id)}
					aria-label="Delete photo"
					class="absolute top-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white"
				>
					<X size={12} />
				</button>
			</div>
		{/each}

		{#if canUpload}
			<button
				onclick={() => fileInput?.click()}
				disabled={uploading}
				class="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-500 bg-white text-zinc-400 transition-colors hover:border-zinc-900 hover:text-zinc-600 disabled:opacity-50 dark:border-zinc-500 dark:bg-surface-dark dark:text-zinc-500 dark:hover:border-zinc-300 dark:hover:text-zinc-200"
				aria-label="Add photo"
			>
				{#if uploading}
					<span class="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"
					></span>
				{:else}
					<svg
						fill-rule="evenodd"
						clip-rule="evenodd"
						stroke-linejoin="round"
						stroke-miterlimit="1.414"
						viewBox="0 0 32 32"
						preserveAspectRatio="xMidYMid meet"
						fill="currentColor"
						width="35"
						height="35"
					>
						<path
							d="M18.4941 6.96399C18.2617 5.82149 17.2225 4.96399 16.0007 4.96399C14.7784 4.96399 13.7396 5.82149 13.5073 6.96399C13.5007 6.99623 13.4987 7.02713 13.5008 7.05675C4.84338 7.22758 4 8.61743 4 17.036C4 26.203 5 27.036 16 27.036C27 27.036 28 26.203 28 17.036C28 8.61693 27.1565 7.22741 18.4976 7.05672C18.5017 7.02702 18.5006 6.99613 18.4941 6.96399ZM12 17.036C12 14.8269 13.7909 13.036 16 13.036C18.2091 13.036 20 14.8269 20 17.036C20 19.2451 18.2091 21.036 16 21.036C13.7909 21.036 12 19.2451 12 17.036ZM16 11.036C12.6863 11.036 10 13.7223 10 17.036C10 20.3497 12.6863 23.036 16 23.036C19.3137 23.036 22 20.3497 22 17.036C22 13.7223 19.3137 11.036 16 11.036ZM8 12.536C8.829 12.536 9.5 11.864 9.5 11.036C9.5 10.208 8.829 9.53601 8 9.53601C7.171 9.53601 6.5 10.208 6.5 11.036C6.5 11.864 7.171 12.536 8 12.536Z"
						/>
					</svg>
				{/if}
			</button>
		{/if}
	</div>

	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		multiple
		class="sr-only"
		onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
	/>

	{#if remaining > 0 && !uploading}
		<button
			onclick={() => fileInput?.click()}
			class="w-full cursor-pointer rounded-md px-6 py-3.5 text-base font-bold text-white transition-all hover:brightness-110 active:brightness-100"
			style="background-color:var(--color-accent)"
		>
			Upload photo{remaining !== 1 ? 's' : ''} ({remaining} remaining)
		</button>
	{:else if remaining === 0}
		<p class="text-center text-sm text-zinc-500">All 5 slots filled for today.</p>
	{/if}
</div>
