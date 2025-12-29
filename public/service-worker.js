/**
 * Legacy Service Worker (Kill Switch)
 *
 * Older versions of this app registered `/service-worker.js`.
 * The app now uses VitePWA-generated service worker (`/sw.js`).
 *
 * This file exists only to gracefully unregister the legacy SW and
 * clear its old caches so users stop seeing "reverting"/stale homepage content.
 */

self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clear legacy caches (best effort)
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        // ignore
      }

      // Unregister this legacy SW so it stops controlling pages
      try {
        await self.registration.unregister();
      } catch {
        // ignore
      }

      // Ask all open tabs to reload so the new SW can take over
      try {
        const clientList = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });

        await Promise.all(
          clientList.map((client) => {
            try {
              return client.navigate(client.url);
            } catch {
              return Promise.resolve();
            }
          })
        );
      } catch {
        // ignore
      }
    })()
  );
});
