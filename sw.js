/* Musicomp service worker — offline app shell.
 * Cache-first for versioned assets, network-first for navigations with an
 * offline fallback to the cached index.html. Bump CACHE on every release. */
const CACHE = "musicomp-v4";
const SHELL = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "questions.js",
  "vendor/tone.min.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled(SHELL.map((u) => c.add(new Request(u, { cache: "reload" }))));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   /* never touch the CDN fallback */

  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const c = await caches.open(CACHE);
        c.put("index.html", fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match("index.html");
        return cached || Response.error();
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) {
      /* stale-while-revalidate: quietly refresh in the background */
      fetch(req).then((fresh) => caches.open(CACHE).then((c) => c.put(req, fresh))).catch(() => {});
      return cached;
    }
    try {
      const fresh = await fetch(req);
      if (fresh.ok) { const c = await caches.open(CACHE); c.put(req, fresh.clone()); }
      return fresh;
    } catch (err) {
      return Response.error();
    }
  })());
});
