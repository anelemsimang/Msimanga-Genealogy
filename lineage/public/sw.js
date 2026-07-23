/* Minimal service worker — enables installability (PWA) without aggressive caching. */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Network-only: keep behaviour identical to a normal website.
  event.respondWith(fetch(event.request));
});
