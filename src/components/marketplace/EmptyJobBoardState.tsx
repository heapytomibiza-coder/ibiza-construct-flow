import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface EmptyJobBoardStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export const EmptyJobBoardState: React.FC<EmptyJobBoardStateProps> = ({
  isFiltered = false,
  onClearFilters
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="col-span-full"
    >
      <Card className="p-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Briefcase className="w-12 h-12 text-muted-foreground" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-3"
        >
          {isFiltered ? 'No Jobs Match Your Filters' : 'No Active Jobs Right Now'}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-8 max-w-md mx-auto"
        >
          {isFiltered
            ? 'Try adjusting your search criteria or filters to see more opportunities.'
            : 'New opportunities are posted daily. Set up job alerts to get notified first!'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          {isFiltered ? (
            <Button onClick={onClearFilters} size="lg">
              Clear Filters
            </Button>
          ) : (
            <>
              <Button onClick={() => navigate('/settings/subscription')} size="lg" className="bg-gradient-hero">
                <Bell className="w-4 h-4 mr-2" />
                Set Up Job Alerts
              </Button>
              <Button onClick={() => navigate('/professional/profile')} variant="outline" size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Complete Profile
              </Button>
            </>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};
