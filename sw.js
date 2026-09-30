/**
 * Service worker source. The build (targets/web/shell-plugin.js) replaces the
 * two placeholders with the build's asset list and a content hash.
 *
 * Scope: the app shell only (HTML, JS, CSS, icons, category.json, book.json).
 * Translations live in IndexedDB; cross-origin requests (the catalog and
 * translation downloads) are never intercepted.
 */
const CACHE = 'lai-shell-b9cd312bf676';
const PRECACHE = ["./assets/index-BUU7nyou.js","./assets/index-WgCB-EDw.css","./assets/library.worker-Dr1R9uP_.js","./assets/pane-Bf-fAYbl.js","./assets/search.worker-Bkrp18mU.js","./assets/tedim1932-iSzL7-PG.js","./book.json","./category.json","./icons/favicon-32.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon.svg","./index.html","./manifest.webmanifest"];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('lai-shell-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

// The page asks for the new version only when the reader agrees to it.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'take-over') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Network first so a deployed update is seen; cached shell when offline.
    event.respondWith(fetch(request).catch(async () => (await caches.match('./index.html')) ?? Response.error()));
    return;
  }
  event.respondWith((async () => (await caches.match(request)) ?? fetch(request))());
});
