const CACHE_NAME = 'guillermobadia-cache-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/es/index.html',
  '/en/index.html',
  '/es/proyectos.html',
  '/es/publicaciones.html',
  '/en/projects.html',
  '/en/publications.html',
  '/css/styles.css',
  '/js/main.js',
  '/images/favicon.ico',
  '/images/logo.png',
  '/images/profile.jpg',
  '/offline.html'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché: Network First con fallback a caché
self.addEventListener('fetch', (event) => {
  // Ignorar solicitudes no GET
  if (event.request.method !== 'GET') return;

  // Ignorar solicitudes a Google Analytics
  if (event.request.url.includes('google-analytics.com')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, actualizar caché
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar servir desde caché
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Si la solicitud es para una página HTML y no está en caché,
            // mostrar página offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
            // Para otros recursos, devolver una respuesta vacía
            return new Response('', {
              status: 408,
              statusText: 'Request timed out.'
            });
          });
      })
  );
});

// Manejo de mensajes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Manejo de sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

// Función para sincronizar analytics offline
async function syncAnalytics() {
  const analyticsQueue = await getAnalyticsQueue();
  for (const event of analyticsQueue) {
    try {
      await sendAnalyticsEvent(event);
      await removeFromQueue(event);
    } catch (error) {
      console.error('Error sincronizando analytics:', error);
    }
  }
}

// Funciones auxiliares para manejo de analytics offline
async function getAnalyticsQueue() {
  const db = await openDB();
  return db.getAll('analyticsQueue');
}

async function sendAnalyticsEvent(event) {
  const response = await fetch('https://www.google-analytics.com/collect', {
    method: 'POST',
    body: JSON.stringify(event),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.ok;
}

async function removeFromQueue(event) {
  const db = await openDB();
  return db.delete('analyticsQueue', event.id);
}

// Función para abrir la base de datos IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('analyticsDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('analyticsQueue')) {
        db.createObjectStore('analyticsQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
} 