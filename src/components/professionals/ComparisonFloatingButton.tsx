import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComparisonModal } from './ComparisonModal';

export const ComparisonFloatingButton = () => {
  const [count, setCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      const stored = localStorage.getItem('professional_comparison');
      const list = stored ? JSON.parse(stored) : [];
      setCount(list.length);
    };

    updateCount();

    window.addEventListener('comparison-updated', updateCount);
    return () => window.removeEventListener('comparison-updated', updateCount);
  }, []);

  if (count === 0) return null;

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 left-6 z-40"
      >
        <Button
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="rounded-full shadow-xl gap-2 pl-4 pr-6"
        >
          <div className="relative">
            <Scale className="w-5 h-5" />
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs font-bold text-destructive-foreground"
              >
                {count}
              </motion.div>
            </AnimatePresence>
          </div>
          <span className="hidden sm:inline">Compare ({count})</span>
        </Button>
      </motion.div>

      <ComparisonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
