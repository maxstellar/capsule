<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.status} - Capsule</title>
</svelte:head>

<div class="flex min-h-[calc(100dvh-3rem)] items-center justify-center px-8 sm:px-4">
	<div class="w-full max-w-sm sm:max-w-md">
		<p class="mb-2 text-2xl font-bold tracking-tight sm:text-3xl" style="color:var(--color-accent)">{$page.status}</p>
		<h1 class="mb-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
			{#if $page.status === 404}
				Page not found
			{:else if $page.status === 403}
				Access denied
			{:else}
				Something went wrong
			{/if}
		</h1>
		<p class="mb-8 text-sm text-zinc-400 sm:text-base">
			{#if $page.status === 404}
				This page doesn't exist or may have been moved.
			{:else if $page.status === 403}
				You don't have permission to view this page.
			{:else}
				An unexpected error occurred. Try refreshing the page.
			{/if}
		</p>
		<a
			href="/"
			class="inline-flex cursor-pointer items-center rounded-md px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 active:brightness-100 sm:text-base"
			style="background-color:var(--color-accent)"
		>
			Go home
		</a>
	</div>
</div>
