<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { X } from 'lucide-svelte';
	import PromptCard from '$lib/components/PromptCard.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';

	let lightboxPhotos = $state<{ url: string }[]>([]);
	let lightboxIndex = $state(0);

	function openLightbox(index: number) {
		lightboxPhotos = data.photos.map((p) => ({ url: p.cdn_url }));
		lightboxIndex = index;
	}

	let { data }: { data: PageData } = $props();

	let uploading = $state(false);
	let error = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);

	// Remaining slots
	let remaining = $derived(5 - data.photos.length);
	let canUpload = $derived(remaining > 0);

	let outsideCohort = $derived(
		(!!data.cohortStart && data.today < data.cohortStart) ||
		(!!data.cohortEnd && data.today > data.cohortEnd)
	);

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
	<title>Upload - Shutter</title>
</svelte:head>

<div class="page-container">
	<h1 class="page-heading mb-4.5">
		Upload
	</h1>

	{#if outsideCohort}
		<div class="flex flex-col items-center gap-4 py-16 text-center">
			<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="sun" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="96" height="96" style="color:var(--color-accent)"><path d="M15.001 5C15.001 4.448 15.449 4 16.001 4C16.553 4 17.001 4.448 17.001 5V7C17.001 7.552 16.553 8 16.001 8C15.449 8 15.001 7.552 15.001 7V5ZM9.12203 7.707C8.73203 7.317 8.09903 7.317 7.70803 7.707C7.31803 8.098 7.31803 8.731 7.70803 9.121L9.12203 10.536C9.51303 10.926 10.146 10.926 10.537 10.536C10.927 10.145 10.927 9.512 10.537 9.121L9.12203 7.707ZM24.536 7.707C24.146 7.317 23.513 7.317 23.122 7.707L21.708 9.121C21.318 9.512 21.318 10.145 21.708 10.536C22.099 10.926 22.732 10.926 23.122 10.536L24.537 9.121C24.927 8.731 24.926 8.098 24.536 7.707Z"/><path d="M20.001 16.176C20.001 13.815 18.156 12 16.001 12C13.846 12 12.001 13.815 12.001 16.176H10.001C10.001 12.765 12.687 10 16.001 10C19.315 10 22.001 12.765 22.001 16.176H20.001Z"/><path d="M15.001 27.1694C15.001 27.7214 15.449 28.1694 16.001 28.1694C16.553 28.1694 17.001 27.7214 17.001 27.1694V25.1694C17.001 24.6174 16.553 24.1694 16.001 24.1694C15.449 24.1694 15.001 24.6174 15.001 25.1694V27.1694ZM9.122 24.4624C8.732 24.8524 8.099 24.8524 7.708 24.4624C7.318 24.0714 7.318 23.4384 7.708 23.0484L9.122 21.6334C9.513 21.2434 10.146 21.2434 10.537 21.6334C10.927 22.0244 10.927 22.6574 10.537 23.0484L9.122 24.4624ZM24.536 24.4624C24.146 24.8524 23.513 24.8524 23.122 24.4624L21.708 23.0484C21.318 22.6574 21.318 22.0244 21.708 21.6334C22.099 21.2434 22.732 21.2434 23.122 21.6334L24.537 23.0484C24.927 23.4384 24.926 24.0714 24.536 24.4624ZM27 17.1694C27.552 17.1694 28 16.7214 28 16.1694C28 15.6174 27.552 15.1694 27 15.1694H25C24.448 15.1694 24 15.6174 24 16.1694C24 16.7214 24.448 17.1694 25 17.1694H27ZM8 16.1694C8 16.7214 7.552 17.1694 7 17.1694H5C4.448 17.1694 4 16.7214 4 16.1694C4 15.6174 4.448 15.1694 5 15.1694H7C7.552 15.1694 8 15.6174 8 16.1694Z"/><path d="M20.001 16.1741C20.001 18.5351 18.156 20.3501 16.001 20.3501C13.846 20.3501 12.001 18.5351 12.001 16.1741H10.001C10.001 19.5851 12.687 22.3501 16.001 22.3501C19.315 22.3501 22.001 19.5851 22.001 16.1741H20.001Z"/></svg>
			<p class="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
				Summertime hasn't started yet! Come back when it's sunnier :)
			</p>
		</div>
	{:else}
		<p class="page-subtitle mb-6">
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
	{/if}
</div>
