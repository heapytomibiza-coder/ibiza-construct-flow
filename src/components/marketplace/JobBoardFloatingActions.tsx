import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Filter, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface JobBoardFloatingActionsProps {
  onFilterClick?: () => void;
  notificationCount?: number;
}

export const JobBoardFloatingActions: React.FC<JobBoardFloatingActionsProps> = ({
  onFilterClick,
  notificationCount = 0
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 md:hidden"
        >
          <div className="flex items-center gap-3 bg-background/95 backdrop-blur-md border border-border rounded-full shadow-luxury p-2">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full relative"
              onClick={() => {}}
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-copper">
                  {notificationCount}
                </Badge>
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              onClick={onFilterClick}
            >
              <Filter className="w-5 h-5" />
            </Button>

            <Button
              size="icon"
              className="rounded-full bg-gradient-hero text-white"
              onClick={scrollToTop}
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
