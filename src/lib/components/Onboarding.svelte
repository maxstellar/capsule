<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import { beforeNavigate } from '$app/navigation';

	beforeNavigate(({ cancel }) => {
		if (active) cancel();
	});

	const STORAGE_KEY = 'shutter_onboarded_v1';

	type Step = {
		selector: string;
		title: string;
		body: string;
		pad?: number;
		noSpotlight?: boolean;
		pwa?: boolean;
	};

	const steps: Step[] = [
		{
			selector: 'body',
			title: 'Welcome to Shutter! 📸',
			body: "Shutter is the daily photo journal & shared album for this year's Hack Club interns! Every day there's a new prompt that encourages you to take interesting pictures, try new things, meet new people, and make memories!",
			noSpotlight: true
		},
		{
			selector: '[data-onboard="upload"]',
			title: 'Upload your photos',
			body: 'Tap here each day to take or add up to 5 photos! You need at least 3 to keep your streak alive.',
			pad: 14
		},
		{
			selector: '[data-onboard="album"]',
			title: "Today's album",
			body: 'See what everyone else is doing today! Tap any photo to view it in fullscreen.',
			pad: 10
		},
		{
			selector: '[data-onboard="daypicker"]',
			title: 'Browse previous days',
			body: 'Use these arrows to go back and see photos from previous days.',
			pad: 10
		},
		{
			selector: '[data-onboard="streaks"]',
			title: 'Streaks leaderboard',
			body: "Check everyone's streaks and see how you rank.",
			pad: 14
		},
		{
			selector: 'body',
			title: 'Shutter is better as an app!',
			body: '',
			noSpotlight: true,
			pwa: true
		}
	];

	type Browser = 'safari' | 'chrome-ios' | 'firefox-ios' | 'chrome' | 'firefox' | 'samsung' | 'other-ios' | 'other';

	function detectBrowser(): Browser {
		const ua = navigator.userAgent;
		const ios = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
		if (/CriOS/.test(ua)) return 'chrome-ios';
		if (/FxiOS/.test(ua)) return 'firefox-ios';
		if (/SamsungBrowser/.test(ua)) return 'samsung';
		if (/Firefox/.test(ua)) return 'firefox';
		if (/Chrome/.test(ua)) return 'chrome';
		if (/Safari/.test(ua)) return 'safari';
		return ios ? 'other-ios' : 'other';
	}

	let active = $state(false);
	let stepIndex = $state(0);
	let box = $state<{ x: number; y: number; w: number; h: number } | null>(null);
	let isStandalone = $state(false);
	let browser = $state<Browser>('other');

	function updateBox() {
		const step = steps[stepIndex];
		if (step.noSpotlight) {
			box = null;
			return;
		}
		const el = document.querySelector<HTMLElement>(step.selector);
		if (!el) return;
		const pad = step.pad ?? 10;
		const r = el.getBoundingClientRect();
		box = { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
	}

	onMount(() => {
		isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(navigator as any).standalone === true;
		browser = detectBrowser();

		if (
			$page.url.pathname === '/' &&
			window.innerWidth < 640 &&
			!localStorage.getItem(STORAGE_KEY)
		) {
			setTimeout(() => {
				active = true;
				updateBox();
			}, 600);
		}
	});

	let visibleSteps = $derived(isStandalone ? steps.filter((s) => !s.pwa) : steps);

	$effect(() => {
		if (active && visibleSteps[stepIndex]?.pwa) {
			localStorage.setItem(STORAGE_KEY, '1');
		}
	});

	function next() {
		if (stepIndex < visibleSteps.length - 1) {
			stepIndex++;
			updateBox();
		} else {
			dismiss();
		}
	}

	function dismiss() {
		active = false;
		localStorage.setItem(STORAGE_KEY, '1');
	}

	let tooltipEl = $state<HTMLDivElement | null>(null);

	let tooltipBelow = $derived(box ? box.y + box.h + 200 < window.innerHeight : true);

	let tooltipTop = $derived(
		box
			? tooltipBelow
				? box.y + box.h + 14
				: box.y - 14 - (tooltipEl?.offsetHeight ?? 160)
			: window.innerHeight / 2 - 90
	);
</script>

{#if active}
	<div
		role="presentation"
		class="fixed inset-0 z-70"
		transition:fade={{ duration: 150 }}
		onclick={next}
	>
		{#if box}
			<!-- spotlight hole via box-shadow -->
			<div
				class="pointer-events-none absolute rounded-xl"
				style="
					left: {box.x}px; top: {box.y}px;
					width: {box.w}px; height: {box.h}px;
					box-shadow: 0 0 0 9999px rgba(0,0,0,0.75);
					transition: left 250ms ease, top 250ms ease, width 250ms ease, height 250ms ease;
				"
			></div>
		{:else}
			<!-- full-page dim with no cutout -->
			<div class="pointer-events-none absolute inset-0" style="background: rgba(0,0,0,0.75)"></div>
		{/if}

		<!-- tooltip -->
		<div
			bind:this={tooltipEl}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			class="pointer-events-auto absolute left-1/2 w-72 rounded-xl bg-white p-4 shadow-xl dark:bg-zinc-800"
			style="top: {tooltipTop}px; transform: translateX(-50%); transition: top 250ms ease;"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<p class="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
				{visibleSteps[stepIndex].title}
			</p>

			{#if visibleSteps[stepIndex].pwa}
				{@const shareIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`}
				{@const dotsIcon = `<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>`}
				{@const linesIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`}
				{@const addIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`}

				{@const instructions: [string, string][] =
					browser === 'safari'
						? [[shareIcon, 'Tap the Share button at the bottom of Safari'], [addIcon, 'Tap "Add to Home Screen"']]
						: browser === 'chrome-ios'
						? [[shareIcon, 'Tap the Share button in the address bar'], [addIcon, 'Tap "Add to Home Screen"']]
						: browser === 'firefox-ios'
						? [[dotsIcon, 'Tap the ··· menu'], [shareIcon, 'Tap Share → "Add to Home Screen"']]
						: browser === 'chrome'
						? [[dotsIcon, 'Tap the ⋮ menu (top right)'], [addIcon, 'Tap "Add to Home Screen" or "Install app"']]
						: browser === 'samsung'
						? [[linesIcon, 'Tap the ≡ menu (bottom right)'], [addIcon, 'Tap "Add page to" → "Home screen"']]
						: browser === 'firefox'
						? [[dotsIcon, 'Tap the ⋮ menu'], [addIcon, 'Tap "Install"']]
						: browser === 'other-ios'
						? [[shareIcon, 'Find the Share button in your browser'], [addIcon, 'Tap "Add to Home Screen"']]
						: [[dotsIcon, 'Open your browser menu'], [addIcon, 'Tap "Add to Home Screen"']]}

				<div class="mb-4">
					<p class="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
						Add Shutter to your home screen for the full app experience.
					</p>
					<div class="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
						{#each instructions as [icon, label]}
							<div class="flex items-center gap-2">
								<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-700">
									{@html icon}
								</span>
								<span>{@html label}</span>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<p class="mb-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
					{visibleSteps[stepIndex].body}
				</p>
			{/if}

			<div class="flex items-center justify-between">
				<div class="flex gap-1.5">
					{#each visibleSteps as _, i}
						<div
							class="h-1.5 rounded-full transition-all"
							style="
								width: {i === stepIndex ? '16px' : '6px'};
								background-color: {i === stepIndex ? 'var(--color-accent)' : '#e4e4e7'};
							"
						></div>
					{/each}
				</div>
				<div class="flex items-center gap-3">
					{#if stepIndex > 0}
						<button
							onclick={() => {
								stepIndex--;
								updateBox();
							}}
							class="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
						>
							Back
						</button>
					{/if}
					<button
						onclick={next}
						class="cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:brightness-110 active:brightness-100"
						style="background-color: var(--color-accent)"
					>
						{stepIndex < visibleSteps.length - 1 ? 'Next' : 'Done'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
