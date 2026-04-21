const VERSION = "mozg-site-marcelo-v10";
const HOME_PATH = "/node-vitepress-marcelo/";
const APP_SHELL = [
  "/node-vitepress-marcelo/",
  "/node-vitepress-marcelo/manifest.json",
  "/node-vitepress-marcelo/logo-mini.svg",
  "/node-vitepress-marcelo/logo-mini.png",
  "/node-vitepress-marcelo/og.jpg",
  "/node-vitepress-marcelo/data/site-catalog.json",
  "/node-vitepress-marcelo/data/site-audit.json",
  "/node-vitepress-marcelo/data/site-discovery.json",
  "/node-vitepress-marcelo/data/site-portfolio.json",
  "/node-vitepress-marcelo/data/site-projects.json",
  "/node-vitepress-marcelo/data/site-capabilities.json",
  "/node-vitepress-marcelo/data/site-stacks.json",
  "/node-vitepress-marcelo/data/site-operations.json",
  "/node-vitepress-marcelo/data/site-journeys.json",
  "/node-vitepress-marcelo/data/site-trust.json",
  "/node-vitepress-marcelo/llms.txt",
  "/node-vitepress-marcelo/robots.txt",
  "/node-vitepress-marcelo/contato",
  "/node-vitepress-marcelo/presenca",
  "/node-vitepress-marcelo/en/",
  "/node-vitepress-marcelo/en/contact",
  "/node-vitepress-marcelo/en/presence"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => (key === VERSION ? null : caches.delete(key))),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(HOME_PATH, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(VERSION);
          return cache.match(HOME_PATH) || Response.error();
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(event.request, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || networkFetch;
    }),
  );
});
