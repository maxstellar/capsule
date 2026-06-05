<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';

	const STORAGE_KEY = 'capsule_onboarded_v1';

	type Step = {
		selector: string;
		title: string;
		body: string;
		pad?: number;
		noSpotlight?: boolean;
	};

	const steps: Step[] = [
		{
			selector: 'body',
			title: 'Welcome to Capsule! 📸',
			body: "Capsule is the daily photo journal & shared album for this year's Hack Club interns! Every day there's a new prompt that encourages you to take interesting pictures, try new things, meet new people, and make memories!",
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
		}
	];

	let active = $state(false);
	let stepIndex = $state(0);
	let box = $state<{ x: number; y: number; w: number; h: number } | null>(null);

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

	function next() {
		if (stepIndex < steps.length - 1) {
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
				{steps[stepIndex].title}
			</p>
			<p class="mb-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
				{steps[stepIndex].body}
			</p>
			<div class="flex items-center justify-between">
				<div class="flex gap-1.5">
					{#each steps as _, i}
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
						{stepIndex < steps.length - 1 ? 'Next' : 'Done'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
