/**
 * PWA Registration Module
 * Single source of truth for service worker registration using VitePWA
 */
import { registerSW } from 'virtual:pwa-register';

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
