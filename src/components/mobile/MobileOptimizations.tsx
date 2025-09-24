import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, X, Search, Filter, Bell, User, Plus, 
  Home, Briefcase, MessageSquare, CreditCard,
  ChevronLeft, ChevronRight, ArrowUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notifications?: number;
}

export const MobileBottomNavigation = ({ activeTab, onTabChange, notifications = 0 }: MobileNavProps) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'jobs', icon: Briefcase, label: 'Jobs' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', badge: notifications },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3 relative",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  showSearch?: boolean;
  onSearch?: () => void;
}

export const MobileHeader = ({ 
  title, 
  subtitle, 
  showBack = false, 
  onBack, 
  actions,
  showSearch = false,
  onSearch 
}: MobileHeaderProps) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-area-pt">
      <div className="flex items-center gap-3 px-4 py-3">
        {showBack && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack}
            className="p-2 -ml-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onSearch}
              className="p-2"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
};

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: { icon: React.ReactNode; label: string; color?: string };
  rightAction?: { icon: React.ReactNode; label: string; color?: string };
  className?: string;
}

export const SwipeableCard = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  leftAction, 
  rightAction,
  className 
}: SwipeableCardProps) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    setDragX(Math.max(-150, Math.min(150, diffX)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (Math.abs(dragX) > 75) {
      if (dragX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (dragX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    setDragX(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left Action */}
      {rightAction && (
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 flex items-center justify-center w-20 transition-transform",
            rightAction.color || "bg-green-500 text-white"
          )}
          style={{ 
            transform: `translateX(${Math.max(0, dragX - 80)}px)`,
            opacity: dragX > 0 ? Math.min(1, dragX / 75) : 0 
          }}
        >
          <div className="flex flex-col items-center gap-1">
            {rightAction.icon}
            <span className="text-xs font-medium">{rightAction.label}</span>
          </div>
        </div>
      )}

      {/* Right Action */}
      {leftAction && (
        <div 
          className={cn(
            "absolute right-0 top-0 bottom-0 flex items-center justify-center w-20 transition-transform",
            leftAction.color || "bg-red-500 text-white"
          )}
          style={{ 
            transform: `translateX(${Math.min(0, dragX + 80)}px)`,
            opacity: dragX < 0 ? Math.min(1, Math.abs(dragX) / 75) : 0 
          }}
        >
          <div className="flex flex-col items-center gap-1">
            {leftAction.icon}
            <span className="text-xs font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div
        className={cn("transition-transform duration-200", className)}
        style={{ 
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh = ({ onRefresh, children, threshold = 80 }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY > 0 || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(diff * 0.5, threshold * 1.5));
      
      if (diff > threshold) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance > threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  };

  useEffect(() => {
    if (isRefreshing) {
      setPullDistance(threshold);
    }
  }, [isRefreshing, threshold]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10"
        style={{ 
          height: `${pullDistance}px`,
          transform: `translateY(-${Math.max(0, threshold - pullDistance)}px)`,
          opacity: pullDistance > 20 ? 1 : 0
        }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <ArrowUp 
            className={cn(
              "w-5 h-5 transition-transform duration-200",
              isRefreshing && "animate-spin",
              pullDistance > threshold && "rotate-180"
            )} 
          />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : 
             pullDistance > threshold ? 'Release to refresh' : 
             'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: `translateY(${Math.max(0, pullDistance - threshold)}px)` 
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const MobileFloatingActionButton = ({ onClick, icon, label }: {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
}) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;

  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg z-40 bg-primary hover:bg-primary/90"
      aria-label={label}
    >
      {icon}
    </Button>
  );
};

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'full' | 'half' | 'auto';
}

export const MobileModal = ({ isOpen, onClose, title, children, height = 'auto' }: MobileModalProps) => {
  const isMobile = useIsMobile();
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!isMobile) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const diff = Math.max(0, currentY - startY);
    setDragY(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (dragY > 150) {
      onClose();
    }
    
    setDragY(0);
  };

  if (!isOpen) return null;

  const heightClass = {
    full: 'h-full',
    half: 'h-1/2',
    auto: 'max-h-[90vh]'
  }[height];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl transition-transform duration-300",
          heightClass
        )}
        style={{ 
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Drag handle */}
        <div 
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-4 border-b border-border">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};