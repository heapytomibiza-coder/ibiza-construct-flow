import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, TrendingUp, Clock, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

export const JobBoardStatsBar: React.FC = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalBudget: 0,
    todayJobs: 0,
    avgResponseTime: '2h',
    avgRating: 4.7
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
        totalJobs: jobs.length,
        totalBudget: jobs.reduce((sum, job) => sum + (job.budget_value || 0), 0),
        todayJobs: jobs.filter(job => new Date(job.created_at) >= today).length,
        avgResponseTime: '2h',
        avgRating: 4.7
      });
    }
  };

  const statItems = [
    {
      icon: Briefcase,
      label: 'Active Jobs',
      value: stats.totalJobs,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: DollarSign,
      label: 'Total Budget',
      value: `€${stats.totalBudget.toLocaleString()}`,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: TrendingUp,
      label: 'Posted Today',
      value: stats.todayJobs,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Clock,
      label: 'Avg Response',
      value: stats.avgResponseTime,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Star,
      label: 'Client Rating',
      value: stats.avgRating,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 * index }}
        >
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <motion.p 
                  className="text-lg font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + (0.1 * index) }}
                >
                  {stat.value}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
