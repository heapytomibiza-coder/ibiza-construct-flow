import React, { createContext, useContext, useEffect, useState } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface SafeAreaContextType {
  insets: SafeAreaInsets;
  isReady: boolean;
}

const SafeAreaContext = createContext<SafeAreaContextType>({
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  isReady: false,
});

export const useSafeArea = () => {
  const context = useContext(SafeAreaContext);
  if (!context) {
    throw new Error('useSafeArea must be used within a SafeAreaProvider');
  }
  return context;
};

interface SafeAreaProviderProps {
  children: React.ReactNode;
}

export const SafeAreaProvider = ({ children }: SafeAreaProviderProps) => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateSafeArea = () => {
      // Get CSS env() values for safe area insets
      const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0');
      const right = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right') || '0');
      const bottom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0');
      const left = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left') || '0');

      setInsets({ top, right, bottom, left });
      setIsReady(true);
    };

    // Update on load
    updateSafeArea();

    // Update on orientation change
    window.addEventListener('orientationchange', updateSafeArea);
    window.addEventListener('resize', updateSafeArea);

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return (
    <SafeAreaContext.Provider value={{ insets, isReady }}>
      {children}
    </SafeAreaContext.Provider>
  );
};