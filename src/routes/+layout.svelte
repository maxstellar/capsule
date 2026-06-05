<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';
	import PullToRefresh from '$lib/components/PullToRefresh.svelte';
	import Onboarding from '$lib/components/Onboarding.svelte';
	import type { LayoutData } from './$types';
	import { browser } from '$app/environment';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	if (browser && 'serviceWorker' in navigator) {
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			window.location.reload();
		});
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Capsule</title>
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<Nav user={data.user} isAdmin={data.isAdmin} isWhitelisted={data.isWhitelisted} />
	{#if data.isWhitelisted}
		<PullToRefresh />
		<Onboarding />
{/if}
	<main class="flex-1 sm:pb-0" class:content-bottom-padding={data.isWhitelisted}>
		{@render children()}
	</main>
</div>
