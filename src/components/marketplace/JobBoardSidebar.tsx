import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Lightbulb, Crown, CheckCircle, 
  ArrowRight, PieChart, Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const JobBoardSidebar: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const subscriptionTier = (profile as any)?.subscription_tier || 'basic';

  useEffect(() => {
    loadCategoryStats();
  }, []);

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

        const stats = Object.entries(counts)
          .map(([category, count]) => ({ category, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5);

        setCategoryStats(stats);
      }
    }
  };

  const tips = [
    "Jobs with photos get 3× more responses",
    "Respond within 1 hour to stand out",
    "Complete profiles win 70% more jobs",
    "Add certifications to boost trust"
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 sticky top-6">
      {/* Earnings Potential Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Earnings Potential
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                €2,400
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Available this week from matching jobs
              </p>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-green-200 dark:border-green-800">
              <Badge className="bg-green-600 text-white">
                +15% vs last week
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Smart Insights */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-copper" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                <span>🔥</span>
                <p className="text-muted-foreground">
                  Jobs in your category <span className="font-semibold text-foreground">+40% today</span>
                </p>
              </div>
              <div className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                <span>⚡</span>
                <p className="text-muted-foreground">
                  Average response time: <span className="font-semibold text-foreground">45 min</span> - be fast!
                </p>
              </div>
              <div className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                <span>👀</span>
                <p className="text-muted-foreground">
                  Your profile views <span className="font-semibold text-foreground">increased 3×</span> this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Application Tracker */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-copper" />
              Application Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Applied</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Viewed</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Shortlisted</p>
                <p className="text-2xl font-bold text-green-600">1</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" size="sm">
              View Full Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-copper" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categoryStats.map((stat: any, index) => (
              <div key={stat.category} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{stat.category}</span>
                <Badge variant="secondary">{stat.count}</Badge>
              </div>
            ))}
            {categoryStats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Loading categories...</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              Pro Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.p
              key={currentTipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-blue-900 dark:text-blue-100"
            >
              💡 {tips[currentTipIndex]}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upgrade CTA (only for basic tier) */}
      {subscriptionTier === 'basic' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-gradient-hero text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Go Pro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Get notified first</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>See jobs 24h early</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Priority support</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-white text-copper hover:bg-white/90"
                onClick={() => navigate('/settings/subscription')}
              >
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pro Benefits (for pro/premium users) */}
      {(subscriptionTier === 'pro' || subscriptionTier === 'premium') && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                {subscriptionTier === 'premium' ? 'Premium' : 'Pro'} Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-900 dark:text-green-100 mb-3">
                You're getting instant notifications for new jobs!
              </p>
              <Badge className="bg-green-600 text-white">
                ⚡ Next alert in ~15 min
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
