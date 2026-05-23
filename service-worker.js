const CACHE_NAME = "vetinstant-dashboard-v6";
const APP_SHELL_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./assets/icons/dashboard.svg",
  "./assets/icons/animals.svg",
  "./assets/icons/horses.svg",
  "./assets/icons/health.svg",
  "./assets/icons/alerts.svg",
  "./assets/icons/sync.svg",
  "./assets/icons/settings.svg",
  "./assets/icons/bell.svg",
  "./assets/icons/user.svg",
  "./assets/icons/menu.svg",
  "./assets/icons/kpi-total.svg",
  "./assets/icons/kpi-healthy.svg",
  "./assets/icons/kpi-risk.svg",
  "./assets/icons/kpi-sick.svg",
  "./assets/icons/kpi-estrous.svg",
  "./assets/icons/kpi-vaccination.svg",
  "./assets/icons/risk-infection.svg",
  "./assets/icons/risk-respiratory.svg",
  "./assets/icons/risk-udder.svg",
  "./assets/icons/risk-chronic.svg",
  "./assets/icons/risk-heat.svg",
  "./assets/icons/pwa-192.svg",
  "./assets/icons/pwa-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
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
