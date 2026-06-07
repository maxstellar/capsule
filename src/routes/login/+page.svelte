<script lang="ts">
	import type { PageData } from './$types';
	import favicon from '$lib/assets/favicon.svg';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Shutter</title>
</svelte:head>

<div
	class="login-page relative flex items-center justify-center overflow-hidden bg-white px-6 py-16 dark:bg-surface-dark"
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
	<div class="login-content relative z-10 flex w-full flex-col items-center text-center">
		<!-- App icon badge -->
		<img src={favicon} alt="" class="camera-badge mb-8 h-20 w-20 rounded-[22px]" />

		<!-- Wordmark -->
		<h1 class="wordmark mb-5 text-[72px] leading-[0.95] font-normal tracking-tight">
			<span style="letter-spacing: -0.06em">S</span>hutter
		</h1>

		<!-- Tagline -->
		<p class="tagline mb-10 max-w-60 text-sm leading-relaxed text-zinc-500">
			A daily photo journal &amp; shared album for Hack Club interns.
		</p>

		<!-- Sign in button -->
		<a
			href={data.authorizeUrl}
			class="sign-in-btn flex w-full items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:brightness-110 active:brightness-100"
		>
			<svg
				fill-rule="evenodd"
				clip-rule="evenodd"
				stroke-linejoin="round"
				stroke-miterlimit="1.414"
				viewBox="0 0 32 32"
				preserveAspectRatio="xMidYMid meet"
				fill="currentColor"
				width="24"
				height="24"
			>
				<path
					d="M13.707,15.293c0.391,0.39 0.391,1.024 0,1.414l-4,4c-0.39,0.391 -1.024,0.391 -1.414,0c-0.391,-0.39 -0.391,-1.024 0,-1.414l2.293,-2.293l-7.586,0c-0.552,0 -1,-0.448 -1,-1c0,-0.552 0.448,-1 1,-1l7.586,0l-2.293,-2.293c-0.391,-0.39 -0.391,-1.024 0,-1.414c0.39,-0.391 1.024,-0.391 1.414,0l4,4Z"
				/>
				<path
					d="M19.884,8c0,0 -0.001,0 -0.001,0c-1.7,-0.001 -2.86,0.045 -3.77,0.25c-0.005,0.001 -0.01,0.002 -0.015,0.003c-0.79,0.173 -1.104,0.409 -1.292,0.638c0,0 0,0.001 0,0.001c-0.23,0.282 -0.498,0.834 -0.679,2.043c0,0.001 0,0.002 0,0.003c-0.007,0.048 -0.015,0.097 -0.022,0.147c-0.072,0.516 -0.501,0.915 -1.022,0.915c-0.584,0 -1.049,-0.501 -0.973,-1.08c0.566,-4.332 2.406,-4.92 7.773,-4.92c7,0 8,1 8,10c0,9 -1,10 -8,10c-5.367,0 -7.207,-0.588 -7.773,-4.92c-0.076,-0.579 0.389,-1.08 0.973,-1.08c0.521,0 0.95,0.399 1.022,0.915c0.007,0.05 0.015,0.099 0.022,0.147c0,0.001 0,0.002 0,0.003c0.181,1.209 0.449,1.762 0.679,2.044l0,0c0.188,0.229 0.502,0.465 1.292,0.638c0.005,0.001 0.01,0.002 0.015,0.003c0.91,0.204 2.07,0.25 3.77,0.25c0,0 0.001,0 0.001,0c1.7,0 2.86,-0.046 3.77,-0.25c0.005,-0.001 0.01,-0.002 0.015,-0.003c0.79,-0.173 1.104,-0.409 1.291,-0.638l0.001,0c0.23,-0.282 0.498,-0.835 0.678,-2.043c0.001,-0.001 0.001,-0.003 0.001,-0.005c0.189,-1.247 0.244,-2.848 0.243,-5.061c0,0 0,0 0,0c0.001,-2.213 -0.054,-3.814 -0.243,-5.061c0,-0.002 0,-0.004 -0.001,-0.005c-0.18,-1.208 -0.448,-1.76 -0.678,-2.042c0,0 0,-0.001 -0.001,-0.001c-0.187,-0.229 -0.501,-0.465 -1.291,-0.638c-0.005,-0.001 -0.01,-0.002 -0.015,-0.003c-0.91,-0.205 -2.07,-0.251 -3.77,-0.25Z"
				/>
			</svg>
			Sign in with Hack Club
		</a>

		<!-- Access note -->
		<p class="access-note mt-5 text-[12px] text-zinc-500">
			Need access? Ping <span class="font-medium text-zinc-400 dark:text-zinc-500">@maxstellar</span
			> on Slack.
		</p>
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
			ellipse 70% 70% at 50% 50%,
			transparent 15%,
			rgba(255, 255, 255, 1) 100%
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
		font-family: var(--font-serif);
		font-feature-settings: 'liga', 'dlig', 'kern';
	}

	.login-page {
		/* subtract header height + its 1px bottom border so the page fits exactly */
		min-height: calc(100dvh - var(--header-height) - 1px);
	}

	.login-content {
		max-width: 20rem;
	}

	/* Desktop: fluid scaling between 640px and 1600px viewport (mobile keeps its perfect static values) */
	@media (min-width: 640px) {
		.login-content {
			max-width: clamp(20rem, calc(11rem + 22.5vw), 32rem);
		}
		.camera-badge {
			width: clamp(80px, calc(40px + 6.25vw), 140px);
			height: clamp(80px, calc(40px + 6.25vw), 140px);
			border-radius: clamp(22px, calc(12.33px + 1.5vw), 36px);
			margin-bottom: clamp(32px, calc(21.33px + 1.667vw), 48px);
		}
		.wordmark {
			font-size: clamp(88px, calc(40px + 7.5vw), 160px);
			margin-bottom: clamp(20px, calc(12px + 1.25vw), 32px);
		}
		.tagline {
			font-size: clamp(18px, calc(14.67px + 0.521vw), 26px);
			max-width: clamp(17rem, calc(12rem + 11.25vw), 28rem);
			margin-bottom: clamp(40px, calc(24px + 2.5vw), 64px);
		}
		.sign-in-btn {
			padding-top: clamp(14px, calc(8.67px + 0.833vw), 22px);
			padding-bottom: clamp(14px, calc(8.67px + 0.833vw), 22px);
			font-size: clamp(15px, calc(10.33px + 0.729vw), 22px);
			gap: clamp(6px, calc(4px + 0.3125vw), 10px);
		}
		.sign-in-btn :global(svg) {
			width: clamp(24px, calc(16px + 1.25vw), 36px);
			height: clamp(24px, calc(16px + 1.25vw), 36px);
		}
		.access-note {
			font-size: clamp(12px, calc(8px + 0.625vw), 18px);
			margin-top: clamp(20px, calc(15.33px + 1.042vw), 32px);
		}
	}

	.camera-badge {
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
			ellipse 70% 70% at 50% 50%,
			transparent 15%,
			rgba(14, 14, 16, 1) 100%
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
