const CACHE_NAME = 'atos-pamor-v2';

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Memaksa SW baru segera aktif
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Hapus cache lama
          }
        })
      );
    }).then(() => self.clients.claim()) // Langsung mengontrol halaman tanpa perlu refresh
  );
});

// Fetch Event (Network First, Cache Fallback)
self.addEventListener('fetch', (event) => {
  // Hanya proses request GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Jika berhasil mengambil dari jaringan, simpan ke cache
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Jika offline atau jaringan gagal, ambil dari cache
        return caches.match(event.request);
      })
  );
});