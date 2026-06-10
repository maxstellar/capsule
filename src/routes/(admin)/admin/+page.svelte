<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { Check, X, Minus, ChevronLeft, ChevronRight } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let promptText = $state('');
	$effect(() => { promptText = data.prompt?.text ?? ''; });

	let lightboxPhotos = $state<{ url: string }[]>([]);
	let lightboxIndex = $state(0);

	function openLightbox(urls: string[], index: number) {
		lightboxPhotos = urls.map((url) => ({ url }));
		lightboxIndex = index;
	}

	function closeLightbox() {
		lightboxPhotos = [];
	}

	let isToday = $derived(data.day === data.today);
	let isYesterday = $derived(data.day === data.yesterday);


function navDay(offset: number) {
		const d = new Date(data.day + 'T12:00:00');
		d.setDate(d.getDate() + offset);
		const next = d.toISOString().slice(0, 10);
		if (next === data.today) goto('/admin');
		else goto(`/admin?day=${next}`);
	}
</script>

{#if lightboxPhotos.length > 0}
	<Lightbox photos={lightboxPhotos} startIndex={lightboxIndex} onclose={closeLightbox} />
{/if}

<svelte:head>
	<title>Admin - Shutter</title>
</svelte:head>

<div class="page-container">
	<div class="mb-6 flex items-center gap-3">
		<h1 class="page-heading">Admin</h1>
		<span class="rounded-md border border-zinc-300 px-2.5 py-1 text-sm text-zinc-500 sm:text-base dark:border-zinc-700">
			{new Date(data.day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
		</span>
		<div class="ml-auto flex items-center gap-1">
			<button
				onclick={() => navDay(-1)}
				disabled={isYesterday}
				aria-label="Previous day"
				class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-zinc-200 text-zinc-700 transition-colors disabled:opacity-30 [@media(hover:hover)]:hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:[@media(hover:hover)]:hover:bg-zinc-700"
			><ChevronLeft size={14} /></button>
			<button
				onclick={() => navDay(1)}
				disabled={isToday}
				aria-label="Next day"
				class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-zinc-200 text-zinc-700 transition-colors disabled:opacity-30 [@media(hover:hover)]:hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:[@media(hover:hover)]:hover:bg-zinc-700"
			><ChevronRight size={14} /></button>
		</div>
	</div>

	<!-- Prompt (today only) -->
	{#if isToday}
	<section class="mb-8">
		<h2 class="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Today's prompt</h2>
		<form method="POST" action="?/setPrompt" use:enhance class="flex gap-2">
			<input
				type="text"
				name="text"
				bind:value={promptText}
				placeholder="e.g. Take a photo with another intern at lunch"
				class="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
			/>
			<button
				type="submit"
				class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110 active:brightness-100"
				style="background-color:var(--color-accent)"
			>
				{data.prompt ? 'Update' : 'Set'}
			</button>
		</form>
	</section>
	{:else if data.prompt}
	<section class="mb-8">
		<h2 class="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Prompt</h2>
		<p class="text-sm text-zinc-700 dark:text-zinc-300">{data.prompt.text}</p>
	</section>
	{/if}

	<!-- Members -->
	<section>
		<h2 class="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
			Members — prompt review
		</h2>
		<p class="mb-4 text-xs text-zinc-500">
			Mark "Yes" when a member's photos meet the prompt. "No" breaks their streak. Unmarked = benefit of the doubt (streak intact).
		</p>

		<div class="space-y-4">
			{#each data.members as member (member.id)}
				<div class="rounded-md border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#131315]">
					<div class="mb-3 flex items-center justify-between gap-3">
						<div class="flex items-center gap-2">
							<UserAvatar name={member.name} avatarUrl={member.avatar_url} size={28} />
							<span class="text-sm font-medium text-zinc-800 dark:text-zinc-200">{member.name}</span>
							<span class="text-xs text-zinc-400">{member.photoCount}/5</span>
						</div>

						<div class="flex items-center gap-1">
							{#if member.prompt_met !== null}
								<form method="POST" action="?/markCompletion" use:enhance>
									<input type="hidden" name="user_id" value={member.id} />
									<input type="hidden" name="day" value={data.day} />
									<input type="hidden" name="value" value="clear" />
									<button
										type="submit"
										title="Clear mark"
										class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-zinc-300 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
									><Minus size={13} /></button>
								</form>
							{/if}
							<form method="POST" action="?/markCompletion" use:enhance>
								<input type="hidden" name="user_id" value={member.id} />
								<input type="hidden" name="day" value={data.day} />
								<input type="hidden" name="value" value="yes" />
								<button
									type="submit"
									title="Mark as met"
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border text-xs transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
									style={member.prompt_met === 1 ? 'border-color:#22c55e;background-color:color-mix(in srgb,#22c55e 10%,transparent);color:#22c55e' : ''}
									class:border-zinc-300={member.prompt_met !== 1}
									class:text-zinc-400={member.prompt_met !== 1}
									class:dark:border-zinc-700={member.prompt_met !== 1}
								><Check size={13} /></button>
							</form>
							<form method="POST" action="?/markCompletion" use:enhance>
								<input type="hidden" name="user_id" value={member.id} />
								<input type="hidden" name="day" value={data.day} />
								<input type="hidden" name="value" value="no" />
								<button
									type="submit"
									title="Mark as not met"
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border text-xs transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
									style={member.prompt_met === 0 ? 'border-color:var(--color-accent);background-color:color-mix(in srgb,var(--color-accent) 10%,transparent);color:var(--color-accent)' : ''}
									class:border-zinc-300={member.prompt_met !== 0}
									class:text-zinc-400={member.prompt_met !== 0}
									class:dark:border-zinc-700={member.prompt_met !== 0}
								><X size={13} /></button>
							</form>
						</div>
					</div>

					{#if member.photos.length > 0}
						{@const urls = member.photos.map((p) => p.cdn_url)}
						<div class="grid grid-cols-5 gap-1">
							{#each member.photos as photo, i (photo.id)}
								<div class="group relative overflow-hidden rounded-sm">
									<button onclick={() => openLightbox(urls, i)} class="block w-full cursor-pointer">
										<img
											src={photo.cdn_url}
											alt=""
											loading="lazy"
											class="aspect-square w-full object-cover transition-opacity hover:opacity-90"
										/>
									</button>
									<form method="POST" action="?/deletePhoto" use:enhance class="absolute top-1 right-1">
										<input type="hidden" name="photo_id" value={photo.id} />
										<button
											type="submit"
											aria-label="Delete photo"
											class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
										><X size={10} /></button>
									</form>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-xs text-zinc-400">No photos submitted yet.</p>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<div class="mt-8 flex gap-4 border-t border-zinc-300 pt-6 dark:border-zinc-800">
		<a href="/admin/prompts" class="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300">Manage prompts</a>
		<a href="/admin/users" class="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300">All users</a>
		<a href="/admin/invite" class="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300">Invite</a>
	</div>
</div>
