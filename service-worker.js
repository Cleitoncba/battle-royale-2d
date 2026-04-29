// Nome do cache do jogo
const CACHE_NAME = "battle-royale-2d-v1";

// Arquivos principais que serão salvos para abrir mais rápido
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/game.js",
  "./manifest.json"
];

// Instala o service worker e salva os arquivos no cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Ativa o service worker e remove caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }

          return null;
        })
      );
    })
  );

  self.clients.claim();
});

// Intercepta requisições e responde com cache quando possível
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});