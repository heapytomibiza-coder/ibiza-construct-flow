import React, { useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface MobileGesturesProps {
  children: React.ReactNode;
  enableSwipeNavigation?: boolean;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
}

export const MobileGestures = ({ 
  children, 
  enableSwipeNavigation = true,
  enablePullToRefresh = true,
  onRefresh
}: MobileGesturesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchEndRef = useRef({ x: 0, y: 0, time: 0 });
  const isPullingRef = useRef(false);
  const refreshThreshold = 80; // pixels
  const swipeThreshold = 100; // pixels
  const swipeVelocityThreshold = 0.5; // pixels per ms
  
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || !enablePullToRefresh) return;
    
    try {
      await onRefresh();
      toast.success('Refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh');
    }
  }, [onRefresh, enablePullToRefresh]);

  const getNavigationRoutes = () => {
    const routes = ['/', '/services', '/professionals', '/how-it-works', '/contact'];
    const currentIndex = routes.indexOf(location.pathname);
    return { routes, currentIndex };
  };

  const handleSwipeNavigation = useCallback((direction: 'left' | 'right') => {
    if (!enableSwipeNavigation) return;
    
    const { routes, currentIndex } = getNavigationRoutes();
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'left' && currentIndex < routes.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === 'right' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex !== undefined) {
      navigate(routes[nextIndex]);
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  }, [navigate, location.pathname, enableSwipeNavigation]);

  useEffect(() => {
    if (!isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    let refreshIndicator: HTMLDivElement | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      // Create refresh indicator if pull-to-refresh is enabled
      if (enablePullToRefresh && window.scrollY === 0) {
        refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'fixed top-0 left-0 right-0 bg-primary/10 text-primary text-center py-2 text-sm font-medium transform -translate-y-full transition-transform duration-200 z-50';
        refreshIndicator.textContent = 'Pull to refresh';
        document.body.appendChild(refreshIndicator);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartRef.current.y;
      
      // Handle pull-to-refresh
      if (enablePullToRefresh && window.scrollY === 0 && deltaY > 0 && refreshIndicator) {
        const progress = Math.min(deltaY / refreshThreshold, 1);
        const translateY = Math.min(deltaY * 0.5, refreshThreshold * 0.5);
        
        refreshIndicator.style.transform = `translateY(${translateY - refreshIndicator.offsetHeight}px)`;
        refreshIndicator.style.opacity = progress.toString();
        
        if (progress >= 1) {
          refreshIndicator.textContent = 'Release to refresh';
          refreshIndicator.className = refreshIndicator.className.replace('bg-primary/10', 'bg-primary/20');
          isPullingRef.current = true;
        } else {
          refreshIndicator.textContent = 'Pull to refresh';
          refreshIndicator.className = refreshIndicator.className.replace('bg-primary/20', 'bg-primary/10');
          isPullingRef.current = false;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = touchEndRef.current.y - touchStartRef.current.y;
      const deltaTime = touchEndRef.current.time - touchStartRef.current.time;
      const velocity = Math.abs(deltaX) / deltaTime;

      // Handle pull-to-refresh release
      if (enablePullToRefresh && isPullingRef.current && refreshIndicator) {
        handleRefresh();
        isPullingRef.current = false;
      }

      // Clean up refresh indicator
      if (refreshIndicator) {
        refreshIndicator.style.transform = 'translateY(-100%)';
        refreshIndicator.style.opacity = '0';
        setTimeout(() => {
          if (refreshIndicator && refreshIndicator.parentNode) {
            refreshIndicator.parentNode.removeChild(refreshIndicator);
          }
        }, 200);
        refreshIndicator = null;
      }

      // Handle horizontal swipe navigation
      if (enableSwipeNavigation && 
          Math.abs(deltaX) > swipeThreshold && 
          Math.abs(deltaY) < Math.abs(deltaX) / 2 && // More horizontal than vertical
          velocity > swipeVelocityThreshold) {
        
        if (deltaX > 0) {
          handleSwipeNavigation('right');
        } else {
          handleSwipeNavigation('left');
        }
      }
    };

    // Add touch event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      
      // Clean up refresh indicator if it exists
      if (refreshIndicator && refreshIndicator.parentNode) {
        refreshIndicator.parentNode.removeChild(refreshIndicator);
      }
    };
  }, [isMobile, handleSwipeNavigation, handleRefresh, enableSwipeNavigation, enablePullToRefresh]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="touch-pan-y">
      {children}
    </div>
  );
};