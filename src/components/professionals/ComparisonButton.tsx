import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Scale, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ComparisonButtonProps {
  professionalId: string;
  professionalName: string;
  professionalData: {
    rating: number;
    reviewCount: number;
    completedJobs: number;
    responseTime: string;
  };
}

export const ComparisonButton = ({
  professionalId,
  professionalName,
  professionalData
}: ComparisonButtonProps) => {
  const [isInComparison, setIsInComparison] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);

  useEffect(() => {
    // Load comparison list from localStorage
    const stored = localStorage.getItem('professional_comparison');
    const list = stored ? JSON.parse(stored) : [];
    setIsInComparison(list.some((p: any) => p.id === professionalId));
    setComparisonCount(list.length);
  }, [professionalId]);

  const toggleComparison = () => {
    const stored = localStorage.getItem('professional_comparison');
    let list = stored ? JSON.parse(stored) : [];

    if (isInComparison) {
      // Remove from comparison
      list = list.filter((p: any) => p.id !== professionalId);
      toast.success('Removed from comparison');
    } else {
      // Check limit
      if (list.length >= 3) {
        toast.error('You can only compare up to 3 professionals');
        return;
      }

      // Add to comparison
      list.push({
        id: professionalId,
        name: professionalName,
        ...professionalData,
        addedAt: new Date().toISOString()
      });
      toast.success('Added to comparison');
    }

    localStorage.setItem('professional_comparison', JSON.stringify(list));
    setIsInComparison(!isInComparison);
    setComparisonCount(list.length);

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('comparison-updated', { 
      detail: { count: list.length } 
    }));
  };

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant={isInComparison ? 'default' : 'outline'}
          size="sm"
          onClick={toggleComparison}
          className="gap-2 touch-target"
        >
          {isInComparison ? (
            <>
              <Check className="w-4 h-4" />
              In Comparison
            </>
          ) : (
            <>
              <Scale className="w-4 h-4" />
              Compare
            </>
          )}
        </Button>
      </motion.div>

      {/* Comparison Count Badge */}
      <AnimatePresence>
        {comparisonCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
          >
            {comparisonCount}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
