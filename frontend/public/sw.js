// Minimal Service Worker for Citations PWA
// Only enables PWA installation - no caching, no automatic updates

// Install event - no automatic skipWaiting
self.addEventListener('install', event => {
  console.log('[SW] Service worker installed');
  // Do not call skipWaiting() - requires manual update
});

// Activate event - take control of clients
self.addEventListener('activate', event => {
  console.log('[SW] Service worker activated');
  event.waitUntil(self.clients.claim());
});

// Fetch event - pass through all requests without caching
self.addEventListener('fetch', event => {
  // Simply pass through to network, no caching
  event.respondWith(fetch(event.request));
});
