/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const SHELL_CACHE = `shutter-v${version}`;
// Image cache is intentionally not versioned — persists across app updates
const IMAGE_CACHE = 'shutter-images';
const IMAGE_CACHE_MAX = 500;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(SHELL_CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			// Delete old shell caches but leave IMAGE_CACHE alone
			.then((keys) =>
				Promise.all(
					keys.filter((k) => k !== SHELL_CACHE && k !== IMAGE_CACHE).map((k) => caches.delete(k))
				)
			)
			.then(() => self.clients.claim())
	);
});

async function serveImage(request: Request): Promise<Response> {
	const cache = await caches.open(IMAGE_CACHE);
	const cached = await cache.match(request);
	if (cached) return cached;

	const response = await fetch(request);
	if (response.ok || response.type === 'opaque') {
		await cache.put(request, response.clone());
		// Trim oldest entries when over the limit
		const keys = await cache.keys();
		if (keys.length > IMAGE_CACHE_MAX) {
			await Promise.all(keys.slice(0, keys.length - IMAGE_CACHE_MAX).map((k) => cache.delete(k)));
		}
	}
	return response;
}

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	// Cache-first for Hack Club CDN images
	if (url.hostname === 'cdn.hackclub.com') {
		event.respondWith(serveImage(event.request));
		return;
	}

	// Only handle same-origin requests beyond this point
	if (url.origin !== self.location.origin) return;

	// App shell: cache-first for pre-built assets, network-first for pages
	if (ASSETS.includes(url.pathname)) {
		event.respondWith(caches.match(event.request).then((cached) => cached ?? fetch(event.request)));
		return;
	}

	// Network-first for everything else (API, pages)
	event.respondWith(
		fetch(event.request).catch(() => caches.match(event.request).then((r) => r ?? Response.error()))
	);
});

self.addEventListener('push', (event) => {
	if (!event.data) return;

	let payload: { title: string; body: string; url: string };
	try {
		payload = event.data.json();
	} catch {
		return;
	}

	event.waitUntil(
		self.registration.showNotification(payload.title, {
			body: payload.body,
			icon: '/icons/192.png',
			badge: '/icons/192.png',
			data: { url: payload.url }
		})
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url: string = event.notification.data?.url ?? '/';

	event.waitUntil(
		self.clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((clients) => {
				for (const client of clients) {
					if (client.url === url && 'focus' in client) {
						return client.focus();
					}
				}
				return self.clients.openWindow(url);
			})
	);
});
