<svelte:head>
	<title>Not invited - Shutter</title>
</svelte:head>

<div class="ineligible-page flex items-center justify-center px-4">
	<div class="w-full max-w-sm text-center">
		<h1 class="mb-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
			You're not an intern!
		</h1>
		<p class="mb-8 text-sm text-zinc-500">
			If you think this is a mistake, contact @maxstellar on Slack.
		</p>

		<form method="POST" action="/logout">
			<button
				type="submit"
				class="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
			>
				Sign out
			</button>
		</form>
	</div>
</div>

<style>
	.ineligible-page {
		min-height: calc(100dvh - var(--header-height) - 1px);
	}
</style>
