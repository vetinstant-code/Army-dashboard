const CACHE_NAME = "snake-zoo-dashboard-v1";

/** Core app shell — loads offline after first visit */
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./enclosure-detail.css",
  "./manifest.webmanifest",
  "./data.js",
  "./app.js",
  "./enclosure-detail.js",
  "./assets/images/snake-logo.png",
  "./assets/icons/pwa-192.svg",
  "./assets/icons/pwa-512.svg",
  "./assets/icons/overview.svg",
  "./assets/icons/enclosure.svg",
  "./assets/icons/snake.svg",
  "./assets/icons/health.svg",
  "./assets/icons/digestion.svg",
  "./assets/icons/breeding.svg",
  "./assets/icons/feeding.svg",
  "./assets/icons/environment.svg",
  "./assets/icons/alerts.svg",
  "./assets/icons/reports.svg",
  "./assets/icons/settings.svg",
  "./assets/icons/search.svg",
  "./assets/icons/bell.svg",
  "./assets/icons/moon.svg",
  "./assets/icons/kpi-snakes.svg",
  "./assets/icons/kpi-enclosures.svg",
  "./assets/icons/kpi-healthy.svg",
  "./assets/icons/kpi-alerts.svg",
  "./assets/icons/risk-heat.svg",
  "./assets/icons/risk-respiratory.svg",
  "./assets/icons/risk-chronic.svg",
  "./assets/icons/risk-shed.svg",
  "./assets/icons/horse-risk-digestive.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return undefined;
        });
    })
  );
});
