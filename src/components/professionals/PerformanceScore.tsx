import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, Clock, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface PerformanceScoreProps {
  rating: number;
  totalReviews: number;
  completedJobs: number;
  onTimeRate: number;
  responseTime: number;
  repeatClientRate: number;
}

export const PerformanceScore = ({
  rating,
  totalReviews,
  completedJobs,
  onTimeRate,
  responseTime,
  repeatClientRate
}: PerformanceScoreProps) => {
  // Calculate overall performance score (0-100)
  const performanceScore = Math.round(
    (rating / 5) * 30 + // 30% weight on rating
    Math.min(totalReviews / 50, 1) * 20 + // 20% weight on review count
    Math.min(completedJobs / 100, 1) * 20 + // 20% weight on completed jobs
    (onTimeRate / 100) * 15 + // 15% weight on on-time delivery
    (repeatClientRate / 100) * 15 // 15% weight on repeat clients
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Exceptional';
    if (score >= 75) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Fair';
  };

  const metrics = [
    {
      icon: Award,
      label: 'Quality',
      value: `${rating.toFixed(1)}/5.0`,
      percentage: (rating / 5) * 100
    },
    {
      icon: Clock,
      label: 'Punctuality',
      value: `${onTimeRate}%`,
      percentage: onTimeRate
    },
    {
      icon: ThumbsUp,
      label: 'Satisfaction',
      value: `${repeatClientRate}%`,
      percentage: repeatClientRate
    }
  ];

  return (
    <Card className="card-luxury border-2 border-primary/20 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className={`text-6xl font-bold ${getScoreColor(performanceScore)}`}
          >
            {performanceScore}
          </motion.div>
          <p className="text-lg font-semibold mt-2">Performance Score</p>
          <p className="text-sm text-muted-foreground">
            {getScoreLabel(performanceScore)} Professional
          </p>
        </div>
      </div>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{metric.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{completedJobs}+</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalReviews}</p>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
