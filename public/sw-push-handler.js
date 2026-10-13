// sw-push-handler.js
// Manejador de eventos Push, clics de Notificaciones y Background Sync para Súper Colmado DAVID

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificación cerrada:', event.notification.tag);
});

// Manejo de eventos Push entrantes del servidor
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Súper Colmado DAVID',
        body: event.data.text()
      };
    }
  }

  const title = data.title || 'Súper Colmado DAVID';
  const options = {
    body: data.body || 'Tienes una nueva actualización en tu cuenta.',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/icon.svg',
    tag: data.tag || `colmado-push-${Date.now()}`,
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data || { url: '/' },
    renotify: data.renotify !== false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Sincronización en segundo plano (Background Sync) para fiados y abonos offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-fiados-abonos' || event.tag === 'sync-offline-queue') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' });
        });
      })
    );
  }
});
