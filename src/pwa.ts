/**
 * PWA Registration Module
 * Single source of truth for service worker registration using VitePWA
 * 
 * Flow Contract v1.0: Homepage Reversion Contract (PWA)
 * - On deploy, if build version changes: unregister all SWs, clear all caches, hard reload
 * - This runs BEFORE app render to ensure users never see stale content
 */
import { registerSW } from 'virtual:pwa-register';

// Build version for cache invalidation (set by CI/CD or defaults to timestamp)
const BUILD_VERSION = import.meta.env.VITE_BUILD_VERSION || `dev-${Date.now()}`;
const BUILD_KEY = 'csibiza_build_version';

// Known legacy cache names that must be purged
const LEGACY_CACHES = [
  'taskhub-v1',
  'static-v1',
  'dynamic-v1',
  'ibiza-build-flow-v1',
  // Additional potential legacy caches
  'workbox-precache-v2',
  'workbox-runtime',
  'cs-ibiza-v1',
  'ibiza-cache-v1',
  'app-cache-v1',
  'sw-precache-v3',
];

/**
 * Unregister ALL service workers (nuclear option for version mismatch)
 */
async function unregisterAllServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
    console.log('[PWA] Unregistered all service workers');
  } catch (e) {
    console.warn('[PWA] Failed to unregister service workers:', e);
  }
}

/**
 * Clear ALL caches (nuclear option for version mismatch)
 */
async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) return;
  
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[PWA] Cleared all caches:', cacheNames);
  } catch (e) {
    console.warn('[PWA] Failed to clear caches:', e);
  }
}

/**
 * Enforce fresh build on version change
 * This is the "nuclear option" that ensures users NEVER see stale content
 * 
 * MUST NOT CHANGE WITHOUT APPROVAL (Flow Contract v1.0)
 */
export async function enforceFreshBuildOncePerDeploy(): Promise<boolean> {
  try {
    const previousBuild = localStorage.getItem(BUILD_KEY);
    const currentBuild = BUILD_VERSION;
    
    // First visit or same build - no action needed
    if (!previousBuild) {
      localStorage.setItem(BUILD_KEY, currentBuild);
      console.log('[PWA] First visit, storing build version:', currentBuild);
      return false;
    }
    
    // Same build version - no action needed
    if (previousBuild === currentBuild) {
      return false;
    }
    
    // BUILD CHANGED - Nuclear purge!
    console.log('[PWA] Build version changed:', previousBuild, '→', currentBuild);
    console.log('[PWA] Executing nuclear cache purge...');
    
    await unregisterAllServiceWorkers();
    await clearAllCaches();
    
    // Store new version BEFORE reload to prevent infinite loop
    localStorage.setItem(BUILD_KEY, currentBuild);
    
    // Force clean navigation with version param to bust any edge caches
    const url = new URL(window.location.href);
    url.searchParams.set('v', currentBuild);
    
    // Use replace to prevent back-button issues
    window.location.replace(url.toString());
    
    return true; // Indicates reload is happening
  } catch (e) {
    console.warn('[PWA] enforceFreshBuildOncePerDeploy failed:', e);
    return false;
  }
}

/**
 * Cleanup legacy service workers (selective - only /service-worker.js)
 * This prevents "homepage reverting" caused by stale caches from older builds
 */
async function cleanupLegacyServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs.map(async (reg) => {
        const scriptURL =
          reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL || '';

        // Only unregister the legacy SW that older versions registered at /service-worker.js.
        // Never unregister the current VitePWA-generated /sw.js worker.
        if (scriptURL.includes('/service-worker.js')) {
          await reg.unregister();
          console.log('[PWA] Unregistered legacy service worker:', scriptURL);
        }
      })
    );
  } catch {
    // ignore
  }

  // Purge all known legacy caches
  try {
    if ('caches' in window) {
      await Promise.all(LEGACY_CACHES.map((name) => caches.delete(name)));
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

// Export build version for UI display
export const BUILD_INFO = {
  version: BUILD_VERSION,
  isProduction: import.meta.env.PROD,
};
