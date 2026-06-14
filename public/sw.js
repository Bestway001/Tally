const CACHE = "tally-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/api.js",
  "/js/helpers.js",
  "/js/auth.js",
  "/js/cgpa.js",
  "/js/study.js",
  "/js/budget.js",
  "/js/target.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/api")) return; // always fetch live data
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
