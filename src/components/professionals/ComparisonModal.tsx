import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Star, Clock, Award, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ComparisonProfessional {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime: string;
  addedAt: string;
}

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComparisonModal = ({ isOpen, onClose }: ComparisonModalProps) => {
  const [professionals, setProfessionals] = useState<ComparisonProfessional[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadComparisons();
    }
  }, [isOpen]);

  const loadComparisons = () => {
    const stored = localStorage.getItem('professional_comparison');
    const list = stored ? JSON.parse(stored) : [];
    setProfessionals(list);
  };

  const removeFromComparison = (id: string) => {
    const updated = professionals.filter(p => p.id !== id);
    localStorage.setItem('professional_comparison', JSON.stringify(updated));
    setProfessionals(updated);
    toast.success('Removed from comparison');
    
    window.dispatchEvent(new CustomEvent('comparison-updated', { 
      detail: { count: updated.length } 
    }));
  };

  const clearAll = () => {
    localStorage.removeItem('professional_comparison');
    setProfessionals([]);
    toast.success('Comparison cleared');
    window.dispatchEvent(new CustomEvent('comparison-updated', { 
      detail: { count: 0 } 
    }));
  };

  const metrics = [
    { icon: Star, label: 'Rating', key: 'rating' as const },
    { icon: Award, label: 'Reviews', key: 'reviewCount' as const },
    { icon: TrendingUp, label: 'Jobs', key: 'completedJobs' as const },
    { icon: Clock, label: 'Response', key: 'responseTime' as const }
  ];

  if (professionals.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compare Professionals</DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No professionals to compare yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add professionals to comparison to see them here.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Compare Professionals ({professionals.length}/3)</DialogTitle>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-[600px]">
            <AnimatePresence mode="popLayout">
              {professionals.map((professional, index) => (
                <motion.div
                  key={professional.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative border rounded-lg p-4 bg-card"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeFromComparison(professional.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <h3 className="font-semibold text-lg mb-4 pr-8">{professional.name}</h3>

                  <div className="space-y-4">
                    {metrics.map((metric) => {
                      const Icon = metric.icon;
                      const value = metric.key === 'rating' 
                        ? `${professional[metric.key]}/5` 
                        : professional[metric.key];

                      return (
                        <div key={metric.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{metric.label}</span>
                          </div>
                          <span className="font-semibold">{value}</span>
                        </div>
                      );
                    })}
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    onClick={() => window.location.href = `/professionals/${professional.id}`}
                  >
                    View Profile
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 Tip: You can add up to 3 professionals for comparison
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
