<script lang="ts">
	let dark = $state(
		typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
	);

	function toggle() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
		const theme = dark ? 'dark' : 'light';
		document.cookie = `theme=${theme}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.setAttribute('content', dark ? '#09090c' : '#ffffff');
	}
</script>

<button
	onclick={toggle}
	aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
	class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
>
	{#if dark}
		<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="24" height="24"><path d="M15.001 5C15.001 4.448 15.449 4 16.001 4C16.553 4 17.001 4.448 17.001 5V7C17.001 7.552 16.553 8 16.001 8C15.449 8 15.001 7.552 15.001 7V5ZM9.12203 7.707C8.73203 7.317 8.09903 7.317 7.70803 7.707C7.31803 8.098 7.31803 8.731 7.70803 9.121L9.12203 10.536C9.51303 10.926 10.146 10.926 10.537 10.536C10.927 10.145 10.927 9.512 10.537 9.121L9.12203 7.707ZM24.536 7.707C24.146 7.317 23.513 7.317 23.122 7.707L21.708 9.121C21.318 9.512 21.318 10.145 21.708 10.536C22.099 10.926 22.732 10.926 23.122 10.536L24.537 9.121C24.927 8.731 24.926 8.098 24.536 7.707Z"/><path d="M15.001 27.1694C15.001 27.7214 15.449 28.1694 16.001 28.1694C16.553 28.1694 17.001 27.7214 17.001 27.1694V25.1694C17.001 24.6174 16.553 24.1694 16.001 24.1694C15.449 24.1694 15.001 24.6174 15.001 25.1694V27.1694ZM9.122 24.4624C8.732 24.8524 8.099 24.8524 7.708 24.4624C7.318 24.0714 7.318 23.4384 7.708 23.0484L9.122 21.6334C9.513 21.2434 10.146 21.2434 10.537 21.6334C10.927 22.0244 10.927 22.6574 10.537 23.0484L9.122 24.4624ZM24.536 24.4624C24.146 24.8524 23.513 24.8524 23.122 24.4624L21.708 23.0484C21.318 22.6574 21.318 22.0244 21.708 21.6334C22.099 21.2434 22.732 21.2434 23.122 21.6334L24.537 23.0484C24.927 23.4384 24.926 24.0714 24.536 24.4624ZM27 17.1694C27.552 17.1694 28 16.7214 28 16.1694C28 15.6174 27.552 15.1694 27 15.1694H25C24.448 15.1694 24 15.6174 24 16.1694C24 16.7214 24.448 17.1694 25 17.1694H27ZM8 16.1694C8 16.7214 7.552 17.1694 7 17.1694H5C4.448 17.1694 4 16.7214 4 16.1694C4 15.6174 4.448 15.1694 5 15.1694H7C7.552 15.1694 8 15.6174 8 16.1694Z"/><circle cx="16" cy="16" r="6"/></svg>
	{:else}
		<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="24" height="24"><path d="M26.1197 22.6849C26.6747 21.9485 25.8563 21.0399 24.9529 21.2251C24.1704 21.3855 23.3602 21.4698 22.5303 21.4698C15.9029 21.4698 10.5303 16.0972 10.5303 9.46976C10.5303 8.63983 10.6145 7.82959 10.7749 7.04711C10.9601 6.14378 10.0515 5.32533 9.3151 5.8803C6.40906 8.07028 4.53027 11.5506 4.53027 15.4698C4.53027 22.0972 9.90286 27.4698 16.5303 27.4698C20.4494 27.4698 23.9298 25.591 26.1197 22.6849Z"/></svg>
	{/if}
</button>
