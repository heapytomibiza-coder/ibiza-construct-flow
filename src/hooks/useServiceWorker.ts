import { useState, useEffect } from 'react';

export const useServiceWorker = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if SW is already registered (VitePWA handles registration in main.tsx)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsRegistered(true);
      });
    }

    // Listen for update available event from VitePWA
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('pwa:update-available', handleUpdateAvailable);

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('pwa:update-available', handleUpdateAvailable);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshApp = async () => {
    const { updateSW } = await import('../pwa');
    await updateSW(true);
  };

  const enableNotifications = async () => {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') return true;
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  };

  return {
    isRegistered,
    isOnline,
    updateAvailable,
    refreshApp,
    enableNotifications
  };
};
