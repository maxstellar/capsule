<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let showMobileCard = $state(false);
	let siteUrl = $state('');
	let copied = $state(false);

	onMount(() => {
		siteUrl = window.location.origin;
		const standalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(navigator as any).standalone === true;
		if (!standalone && !localStorage.getItem('mobile-card-dismissed')) {
			showMobileCard = true;
		}
	});

	function dismissMobileCard() {
		showMobileCard = false;
		localStorage.setItem('mobile-card-dismissed', '1');
	}

	async function copyLink() {
		await navigator.clipboard.writeText(siteUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Capsule</title>
</svelte:head>

<div
	class="login-page relative flex min-h-[calc(100dvh-3rem)] items-center justify-center overflow-hidden bg-white px-6 py-16 sm:min-h-[calc(100dvh-4rem)] dark:bg-surface-dark"
>
	<!-- Dot grid -->
	<div class="dot-grid pointer-events-none absolute inset-0"></div>

	<!-- Vignette -->
	<div class="vignette pointer-events-none absolute inset-0"></div>

	<!-- Decorative polaroids — sm+ only -->
	<div class="pointer-events-none absolute top-[7%] left-[4%] rotate-[-14deg]">
		<div class="polaroid w-16 rounded p-1.5 shadow-xl sm:w-22 sm:p-2">
			<div class="polaroid-fill h-13 w-full rounded-sm sm:h-18"></div>
			<div
				class="polaroid-line mx-auto mt-2 mb-0.5 h-1.5 w-8 rounded-full sm:mt-2.5 sm:mb-1 sm:w-10"
			></div>
		</div>
	</div>

	<div class="pointer-events-none absolute top-[10%] right-[6%] rotate-9">
		<div class="polaroid w-14 rounded p-1.5 shadow-xl sm:w-19 sm:p-2">
			<div class="polaroid-fill h-11 w-full rounded-sm sm:h-15"></div>
			<div
				class="polaroid-line mx-auto mt-2 mb-0.5 h-1.5 w-7 rounded-full sm:mt-2.5 sm:mb-1 sm:w-8"
			></div>
		</div>
	</div>

	<div class="pointer-events-none absolute bottom-[11%] left-[10%] rotate-10 sm:bottom-[14%]">
		<div class="polaroid w-14 rounded p-1.5 shadow-xl sm:w-20 sm:p-2">
			<div class="polaroid-fill h-11 w-full rounded-sm sm:h-16"></div>
			<div
				class="polaroid-line mx-auto mt-2 mb-0.5 h-1.5 w-7 rounded-full sm:mt-2.5 sm:mb-1 sm:w-9"
			></div>
		</div>
	</div>

	<div class="pointer-events-none absolute right-[4%] bottom-[8%] rotate-[-8deg]">
		<div class="polaroid w-16 rounded p-1.5 shadow-xl sm:w-23 sm:p-2">
			<div class="polaroid-fill h-13 w-full rounded-sm sm:h-19"></div>
			<div
				class="polaroid-line mx-auto mt-2 mb-0.5 h-1.5 w-8 rounded-full sm:mt-2.5 sm:mb-1 sm:w-11"
			></div>
		</div>
	</div>

	<!-- Content -->
	<div class="relative z-10 flex w-full max-w-xs flex-col items-center text-center sm:max-w-sm">
		<!-- Camera icon badge -->
		<div class="camera-badge mb-8 flex h-15 w-15 items-center justify-center rounded-[18px]">
			<svg
				fill-rule="evenodd"
				clip-rule="evenodd"
				stroke-linejoin="round"
				stroke-miterlimit="1.414"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 32 32"
				preserveAspectRatio="xMidYMid meet"
				fill="white"
				width="53"
				height="53"
			>
				<path
					d="M13.1716 13.1716L17.4142 8.92893C18.9763 7.36683 21.509 7.36683 23.0711 8.92893C24.6332 10.491 24.6332 13.0237 23.0711 14.5858L18.8284 18.8284L13.1716 13.1716ZM11.7574 11.7574L16 7.51471C18.3432 5.17157 22.1422 5.17157 24.4853 7.51471C26.8284 9.85786 26.8284 13.6568 24.4853 16L16 24.4853C14.8284 25.6569 13.2929 26.2426 11.7574 26.2426C10.7736 26.2426 9.78976 26.0022 8.90168 25.5213C8.40361 25.2516 7.93565 24.9062 7.51468 24.4853C5.17154 22.1421 5.17154 18.3431 7.51468 16L11.7573 11.7573L11.7574 11.7574Z"
				/>
			</svg>
		</div>

		<!-- Wordmark -->
		<h1 class="wordmark mb-3 text-[52px] leading-none font-bold tracking-tight sm:text-[64px]">
			Capsule
		</h1>

		<!-- Tagline -->
		<p class="mb-10 max-w-60 text-sm leading-relaxed text-zinc-500 sm:max-w-67.5 sm:text-[15px]">
			A daily photo journal & shared album for Hack Club interns.
		</p>

		<!-- Sign in button -->
		<a
			href={data.authorizeUrl}
			class="sign-in-btn flex w-full items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:brightness-110 active:brightness-100 sm:py-4 sm:text-[15px]"
		>
			<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="24" height="24">
				<path d="M13.707,15.293c0.391,0.39 0.391,1.024 0,1.414l-4,4c-0.39,0.391 -1.024,0.391 -1.414,0c-0.391,-0.39 -0.391,-1.024 0,-1.414l2.293,-2.293l-7.586,0c-0.552,0 -1,-0.448 -1,-1c0,-0.552 0.448,-1 1,-1l7.586,0l-2.293,-2.293c-0.391,-0.39 -0.391,-1.024 0,-1.414c0.39,-0.391 1.024,-0.391 1.414,0l4,4Z"/>
				<path d="M19.884,8c0,0 -0.001,0 -0.001,0c-1.7,-0.001 -2.86,0.045 -3.77,0.25c-0.005,0.001 -0.01,0.002 -0.015,0.003c-0.79,0.173 -1.104,0.409 -1.292,0.638c0,0 0,0.001 0,0.001c-0.23,0.282 -0.498,0.834 -0.679,2.043c0,0.001 0,0.002 0,0.003c-0.007,0.048 -0.015,0.097 -0.022,0.147c-0.072,0.516 -0.501,0.915 -1.022,0.915c-0.584,0 -1.049,-0.501 -0.973,-1.08c0.566,-4.332 2.406,-4.92 7.773,-4.92c7,0 8,1 8,10c0,9 -1,10 -8,10c-5.367,0 -7.207,-0.588 -7.773,-4.92c-0.076,-0.579 0.389,-1.08 0.973,-1.08c0.521,0 0.95,0.399 1.022,0.915c0.007,0.05 0.015,0.099 0.022,0.147c0,0.001 0,0.002 0,0.003c0.181,1.209 0.449,1.762 0.679,2.044l0,0c0.188,0.229 0.502,0.465 1.292,0.638c0.005,0.001 0.01,0.002 0.015,0.003c0.91,0.204 2.07,0.25 3.77,0.25c0,0 0.001,0 0.001,0c1.7,0 2.86,-0.046 3.77,-0.25c0.005,-0.001 0.01,-0.002 0.015,-0.003c0.79,-0.173 1.104,-0.409 1.291,-0.638l0.001,0c0.23,-0.282 0.498,-0.835 0.678,-2.043c0.001,-0.001 0.001,-0.003 0.001,-0.005c0.189,-1.247 0.244,-2.848 0.243,-5.061c0,0 0,0 0,0c0.001,-2.213 -0.054,-3.814 -0.243,-5.061c0,-0.002 0,-0.004 -0.001,-0.005c-0.18,-1.208 -0.448,-1.76 -0.678,-2.042c0,0 0,-0.001 -0.001,-0.001c-0.187,-0.229 -0.501,-0.465 -1.291,-0.638c-0.005,-0.001 -0.01,-0.002 -0.015,-0.003c-0.91,-0.205 -2.07,-0.251 -3.77,-0.25Z"/>
			</svg>
			Sign in with Hack Club
		</a>

		<!-- Access note -->
		<p class="mt-5 text-[12px] text-zinc-500">
			Need access? Ping <span class="font-medium text-zinc-400 dark:text-zinc-500">@maxstellar</span
			> on Slack.
		</p>

		<!-- Desktop: better on mobile card -->
		{#if showMobileCard}
			<div class="relative mt-8 hidden w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-left backdrop-blur sm:block dark:border-zinc-700 dark:bg-zinc-900/80">
				<button
					onclick={dismissMobileCard}
					aria-label="Dismiss"
					class="absolute top-2.5 right-2.5 cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				</button>
				<p class="mb-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-100">📱 Capsule is better on mobile!</p>
				<p class="mb-3 text-xs text-zinc-500">Open Capsule on your phone and add it to your Home Screen for the full app experience.</p>
				<div class="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
					<span class="flex-1 truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{siteUrl}</span>
					<button
						onclick={copyLink}
						class="cursor-pointer text-[11px] font-medium transition-colors"
						style="color: var(--color-accent)"
					>
						{copied ? 'Copied!' : 'Copy'}
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* ── Light mode ── */

	.dot-grid {
		background-image: radial-gradient(circle, #a1a1aa 1px, transparent 1px);
		background-size: 28px 28px;
		opacity: 0.6;
	}

	.vignette {
		background: radial-gradient(
			ellipse 80% 80% at 50% 50%,
			transparent 35%,
			rgba(255, 255, 255, 0.95) 100%
		);
	}

	.polaroid {
		background: rgba(0, 0, 0, 0.06);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		border: 1px solid rgba(0, 0, 0, 0.14);
		opacity: 0.7;
	}
	.polaroid-fill {
		background: #d4d4d8;
	}
	.polaroid-line {
		background: #a1a1aa;
	}

	.wordmark {
		color: #09090b;
	}

	.camera-badge {
		background: linear-gradient(145deg, #ec3750 0%, #c8273a 100%);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
	}

	.sign-in-btn {
		background: linear-gradient(135deg, #ec3750 0%, #d42d43 100%);
	}

	/* ── Dark mode ── */

	:global(html.dark) .dot-grid {
		background-image: radial-gradient(circle, #71717a 1px, transparent 1px);
		background-size: 28px 28px;
		opacity: 0.35;
	}

	:global(html.dark) .vignette {
		background: radial-gradient(
			ellipse 80% 80% at 50% 50%,
			transparent 35%,
			rgba(14, 14, 16, 0.95) 100%
		);
	}

	:global(html.dark) .polaroid {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
		opacity: 0.55;
	}
	:global(html.dark) .polaroid-fill {
		background: #3f3f46;
	}
	:global(html.dark) .polaroid-line {
		background: #52525b;
	}

	:global(html.dark) .wordmark {
		background: linear-gradient(160deg, #ffffff 0%, #a1a1aa 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	:global(html.dark) .camera-badge {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	}
</style>
