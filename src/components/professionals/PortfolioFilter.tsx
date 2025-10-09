import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortfolioFilterProps {
  categories?: string[];
  onFilterChange?: (category: string | null) => void;
  onViewChange?: (view: 'grid' | 'masonry') => void;
}

export const PortfolioFilter = ({
  categories = ['All', 'Renovations', 'New Builds', 'Repairs', 'Design'],
  onFilterChange,
  onViewChange
}: PortfolioFilterProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (onFilterChange) {
      onFilterChange(category === 'All' ? null : category);
    }
  };

  const handleViewChange = (view: 'grid' | 'masonry') => {
    setViewMode(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = category === activeCategory;
            
            return (
              <motion.button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all touch-target ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 rounded-full bg-primary"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange('grid')}
            className={`touch-target ${
              viewMode === 'grid' ? 'bg-background shadow-sm' : ''
            }`}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange('masonry')}
            className={`touch-target ${
              viewMode === 'masonry' ? 'bg-background shadow-sm' : ''
            }`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Filter Indicator */}
      <AnimatePresence>
        {activeCategory !== 'All' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Filter className="w-4 h-4" />
            <span>
              Showing: <span className="font-semibold text-foreground">{activeCategory}</span>
            </span>
            <button
              onClick={() => handleCategoryChange('All')}
              className="text-primary hover:underline ml-2"
            >
              Clear filter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
