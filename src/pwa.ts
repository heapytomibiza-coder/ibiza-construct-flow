/**
 * PWA Registration Module
 * Single source of truth for service worker registration using VitePWA
 */
import { registerSW } from 'virtual:pwa-register';

// Cleanup: unregister any legacy SW that may still be controlling clients.
// This prevents "homepage reverting" caused by stale caches from older builds.
async function cleanupLegacyServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs.map(async (reg) => {
        const scriptURL =
          reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL || '';

        // Legacy SW file shipped in /public
        if (scriptURL.includes('/service-worker.js')) {
          await reg.unregister();
        }
      })
    );
  } catch {
    // ignore
  }

  // Best-effort cleanup of legacy caches
  try {
    if ('caches' in window) {
      await caches.delete('taskhub-v1');
    }
  } catch {
    // ignore
  }
}

// Fire-and-forget; don't block app boot.
cleanupLegacyServiceWorkers();

export const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new Event('pwa:update-available'));
  },
  onOfflineReady() {
    console.log('App ready for offline use');
    window.dispatchEvent(new Event('pwa:offline-ready'));
  },
  onRegistered(registration) {
    console.log('SW registered:', registration);
  },
  onRegisterError(error) {
    console.error('SW registration failed:', error);
  },
});
