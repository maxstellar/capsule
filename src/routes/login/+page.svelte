<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Capsule</title>
</svelte:head>

<div
	class="login-page relative flex min-h-[calc(100dvh-3rem)] items-center justify-center overflow-hidden bg-white px-6 py-16 sm:min-h-[calc(100dvh-4rem)] dark:bg-zinc-950"
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
			class="sign-in-btn flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:brightness-110 active:brightness-100 sm:py-4 sm:text-[15px]"
		>
			<svg
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
				<polyline points="10 17 15 12 10 7" />
				<line x1="15" y1="12" x2="3" y2="12" />
			</svg>
			Sign in with Hack Club
		</a>

		<!-- Access note -->
		<p class="mt-5 text-[12px] text-zinc-500">
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
		background: linear-gradient(160deg, #09090b 0%, #52525b 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
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
			rgba(9, 9, 11, 0.95) 100%
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
