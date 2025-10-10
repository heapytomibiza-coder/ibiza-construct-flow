import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface JobBoardHeroSectionProps {
  onSearch?: (query: string) => void;
  onQuickFilter?: (filter: string) => void;
}

export const JobBoardHeroSection: React.FC<JobBoardHeroSectionProps> = ({
  onSearch,
  onQuickFilter
}) => {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalBudget: 0,
    todayJobs: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('budget_value, created_at')
      .eq('status', 'open');

    if (jobs) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setStats({
        activeJobs: jobs.length,
        totalBudget: jobs.reduce((sum, job) => sum + (job.budget_value || 0), 0),
        todayJobs: jobs.filter(job => new Date(job.created_at) >= today).length
      });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      {/* Background Image with Gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80)`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/80 to-transparent" />
      
      {/* Content */}
      <div className="relative px-8 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 backdrop-blur-md bg-white/10 border-white/20 text-white animate-pulse">
            <Sparkles className="w-3 h-3 mr-1" />
            New jobs posted every hour
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Find Your Next Project in Ibiza
          </h1>
          
          <p className="text-lg text-white/90 mb-8 max-w-2xl">
            Connect with homeowners who need your expertise. Get notified instantly for jobs that match your skills.
          </p>

          {/* Live Stats */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-copper" />
              <span className="font-semibold">{stats.activeJobs} active jobs</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <DollarSign className="w-5 h-5 text-copper" />
              <span className="font-semibold">€{stats.totalBudget.toLocaleString()} total budget</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-copper" />
              <span className="font-semibold">{stats.todayJobs} posted today</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for plumbing, electrical, cleaning..."
              className="pl-12 h-14 bg-white/95 backdrop-blur-md border-white/20 text-base"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge 
              className="cursor-pointer backdrop-blur-md bg-white/10 hover:bg-white/20 border-white/20 text-white transition-all"
              onClick={() => onQuickFilter?.('asap')}
            >
              ⚡ ASAP Jobs
            </Badge>
            <Badge 
              className="cursor-pointer backdrop-blur-md bg-white/10 hover:bg-white/20 border-white/20 text-white transition-all"
              onClick={() => onQuickFilter?.('high-budget')}
            >
              💰 High Budget (€500+)
            </Badge>
            <Badge 
              className="cursor-pointer backdrop-blur-md bg-white/10 hover:bg-white/20 border-white/20 text-white transition-all"
              onClick={() => onQuickFilter?.('photos')}
            >
              📷 Has Photos
            </Badge>
            <Badge 
              className="cursor-pointer backdrop-blur-md bg-white/10 hover:bg-white/20 border-white/20 text-white transition-all"
              onClick={() => onQuickFilter?.('this-week')}
            >
              📅 Starting This Week
            </Badge>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
