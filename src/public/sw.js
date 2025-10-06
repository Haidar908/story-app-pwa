// src/public/sw.js

// Kriteria 3: Offline Mode (App Shell Caching)
const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/', 
  '/index.html', 
  '/app.bundle.js', // Pastikan nama file bundle Anda benar
  '/styles.css', 
  '/manifest.json', 
  
  // Leaflet CSS eksternal (WAJIB di-cache)
  'https://unpkg.com/leaflet/dist/leaflet.css' 
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(urlsToCache)
          .catch((error) => {
            console.error('Failed to cache one or more URLs (Icon/Leaflet/Bundle?):', error);
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Hapus cache lama
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME) {
          console.log('Service Worker: Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      }),
    )),
  );
});

// KOREKSI: Hanya App Shell yang di-cache-first
self.addEventListener('fetch', (event) => {
  // Dapatkan base URL API Anda dari config.js (asumsi)
  const API_URL = 'https://story-api.dicoding.dev/v1'; 
  
  // Jika request adalah untuk DATA API, JANGAN di-cache-first oleh SW.
  // Biarkan jatuh ke network, yang kegagalannya akan ditangkap oleh home-page.js
  if (event.request.url.includes(API_URL)) {
    return; 
  }
  
  // Untuk aset statis (App Shell), gunakan Cache-First
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// =========================================================================
// KRITERIA 2: PUSH NOTIFICATION
// =========================================================================
self.addEventListener('push', (event) => {
  console.log('Push event received');

  const notificationData = event.data.json() || {
    title: 'Notifikasi Baru',
    body: 'Ada cerita baru yang dibagikan!',
  };

  const options = {
    body: notificationData.body,
    icon: '/icons/icon-192x192.png', // Harus tersedia di folder icons
    data: {
      url: notificationData.url || '/',
    }
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});