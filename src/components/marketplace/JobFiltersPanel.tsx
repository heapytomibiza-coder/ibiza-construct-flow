import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Image, TrendingUp, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { getServiceVisuals } from '@/data/serviceCategoryImages';

interface JobFiltersPanelProps {
  open: boolean;
  onClose: () => void;
  filters: {
    categories: string[];
    budgetRange: [number, number];
    startDate: string;
    location: string;
    hasPhotos: boolean;
    highBudget: boolean;
    highlyRated: boolean;
    newToday: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export const JobFiltersPanel: React.FC<JobFiltersPanelProps> = ({
  open,
  onClose,
  filters,
  onFiltersChange
}) => {
  const [categoryStats, setCategoryStats] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadCategoryStats();
    }
  }, [open]);

  const loadCategoryStats = async () => {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('micro_id')
      .eq('status', 'open');

    if (jobs) {
      const microIds = jobs.map(j => j.micro_id).filter(Boolean);
      const { data: services } = await supabase
        .from('services_micro')
        .select('category')
        .in('id', microIds);

      if (services) {
        const counts = services.reduce((acc: any, s) => {
          acc[s.category] = (acc[s.category] || 0) + 1;
          return acc;
        }, {});

        const stats = Object.entries(counts).map(([category, count]) => ({
          category,
          count,
          icon: getServiceVisuals(category).icon
        }));

        setCategoryStats(stats);
      }
    }
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleBudgetChange = (values: number[]) => {
    onFiltersChange({ ...filters, budgetRange: [values[0], values[1]] as [number, number] });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      budgetRange: [0, 5000] as [number, number],
      startDate: 'all',
      location: '',
      hasPhotos: false,
      highBudget: false,
      highlyRated: false,
      newToday: false
    });
  };

  const activeFilterCount = 
    filters.categories.length +
    (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 5000 ? 1 : 0) +
    (filters.startDate !== 'all' ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.hasPhotos ? 1 : 0) +
    (filters.highBudget ? 1 : 0) +
    (filters.highlyRated ? 1 : 0) +
    (filters.newToday ? 1 : 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-background border-r border-border shadow-xl z-50 lg:relative lg:w-full"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-copper" />
                  <h3 className="font-semibold">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Service Categories */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Service Categories
                    </Label>
                    <div className="space-y-2">
                      {categoryStats.map((stat) => (
                        <button
                          key={stat.category}
                          onClick={() => toggleCategory(stat.category)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                            filters.categories.includes(stat.category)
                              ? 'bg-copper/10 border-copper text-copper-dark'
                              : 'bg-muted/50 border-transparent hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{stat.icon}</span>
                            <span className="text-sm font-medium">{stat.category}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {stat.count}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Budget Range */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Budget Range
                    </Label>
                    <div className="space-y-4">
                      <Slider
                        min={0}
                        max={5000}
                        step={50}
                        value={filters.budgetRange}
                        onValueChange={handleBudgetChange}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>€{filters.budgetRange[0]}</span>
                        <span>€{filters.budgetRange[1]}+</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Start Date */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Start Date
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['all', 'asap', 'this-week', 'next-week'].map((date) => (
                        <button
                          key={date}
                          onClick={() => onFiltersChange({ ...filters, startDate: date })}
                          className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                            filters.startDate === date
                              ? 'bg-copper/10 border-copper text-copper-dark'
                              : 'bg-muted/50 border-transparent hover:bg-muted'
                          }`}
                        >
                          {date === 'all' ? 'All Dates' :
                           date === 'asap' ? 'ASAP' :
                           date === 'this-week' ? 'This Week' :
                           'Next Week'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Location */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Location
                    </Label>
                    <Input
                      placeholder="Enter location..."
                      value={filters.location}
                      onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
                    />
                  </div>

                  <Separator />

                  {/* Special Filters */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Special Filters
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Has Photos</span>
                        </div>
                        <Switch
                          checked={filters.hasPhotos}
                          onCheckedChange={(checked) => 
                            onFiltersChange({ ...filters, hasPhotos: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">High Budget (€500+)</span>
                        </div>
                        <Switch
                          checked={filters.highBudget}
                          onCheckedChange={(checked) => 
                            onFiltersChange({ ...filters, highBudget: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Highly Rated Clients</span>
                        </div>
                        <Switch
                          checked={filters.highlyRated}
                          onCheckedChange={(checked) => 
                            onFiltersChange({ ...filters, highlyRated: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Posted Today</span>
                        </div>
                        <Switch
                          checked={filters.newToday}
                          onCheckedChange={(checked) => 
                            onFiltersChange({ ...filters, newToday: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <Button
                  className="w-full bg-gradient-hero text-white"
                  onClick={onClose}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
