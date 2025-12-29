/**
 * PWA Registration Module
 * Single source of truth for service worker registration using VitePWA
 */
import { registerSW } from 'virtual:pwa-register';

export const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Dispatch event for UI to show update prompt
    window.dispatchEvent(new CustomEvent('pwa:update-available'));
  },
  onOfflineReady() {
    console.log('App ready for offline use');
    window.dispatchEvent(new CustomEvent('pwa:offline-ready'));
  },
  onRegistered(registration) {
    console.log('SW registered:', registration);
  },
  onRegisterError(error) {
    console.error('SW registration failed:', error);
  },
});
