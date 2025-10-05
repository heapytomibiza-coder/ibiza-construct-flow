/**
 * Hook for smart hide/show behavior on scroll
 * Used for bottom navigation and floating CTAs
 */
import { useState, useEffect, useRef } from 'react';

interface UseScrollHideOptions {
  threshold?: number;
  hideDelay?: number;
}

export const useScrollHide = (options: UseScrollHideOptions = {}) => {
  const { threshold = 5, hideDelay = 300 } = options;
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;
      
      // At the top of page
      if (currentScrollY < 10) {
        setIsAtTop(true);
        setIsVisible(true);
        return;
      }
      
      setIsAtTop(false);

      // Scrolling down - hide after delay
      if (scrollDelta > threshold) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, hideDelay);
      }
      
      // Scrolling up - show immediately
      if (scrollDelta < -threshold) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [threshold, hideDelay]);

  return { isVisible, isAtTop };
};
