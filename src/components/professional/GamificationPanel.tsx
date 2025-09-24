import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Target, TrendingUp, Award, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Badge {
  id: string;
  key: string;
  awarded_at: string;
  meta: any;
}

interface Target {
  period: string;
  revenue_target: number;
  jobs_target: number;
}

export const GamificationPanel = ({ userId }: { userId: string }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [currentProgress, setCurrentProgress] = useState({
    revenue: 0,
    jobs: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchGamificationData();
    }
  }, [userId]);

  const fetchGamificationData = async () => {
    try {
      // Mock data for now until database migration is complete
      const mockBadges = [
        { id: '1', key: 'early_bird', awarded_at: new Date().toISOString(), meta: {} },
        { id: '2', key: 'perfectionist', awarded_at: new Date().toISOString(), meta: {} }
      ];

      const mockTargets = [
        { period: 'weekly', revenue_target: 2000, jobs_target: 10 }
      ];

      setBadges(mockBadges);
      setTargets(mockTargets);
      
      // Mock current progress
      setCurrentProgress({ revenue: 1200, jobs: 6, streak: 5 });
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeKey: string) => {
    const icons: Record<string, any> = {
      'early_bird': '🌅',
      'perfectionist': '⭐',
      'speed_demon': '⚡',
      'client_favorite': '❤️',
      'eco_warrior': '🌱',
      'safety_first': '🛡️',
      'master_craftsman': '🔨',
      'team_player': '🤝'
    };
    return icons[badgeKey] || '🏆';
  };

  const weeklyTarget = targets.find(t => t.period === 'weekly');
  const revenueProgress = weeklyTarget 
    ? (currentProgress.revenue / weeklyTarget.revenue_target) * 100 
    : 0;
  const jobsProgress = weeklyTarget 
    ? (currentProgress.jobs / weeklyTarget.jobs_target) * 100 
    : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Targets */}
      {weeklyTarget && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              Weekly Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Revenue</span>
                <span>€{currentProgress.revenue.toFixed(0)} / €{weeklyTarget.revenue_target}</span>
              </div>
              <Progress value={Math.min(revenueProgress, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Jobs</span>
                <span>{currentProgress.jobs} / {weeklyTarget.jobs_target}</span>
              </div>
              <Progress value={Math.min(jobsProgress, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5" />
            Recent Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {badges.slice(0, 6).map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                >
                  <span className="text-2xl">{getBadgeIcon(badge.key)}</span>
                  <div>
                    <div className="font-medium text-sm capitalize">
                      {badge.key.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(badge.awarded_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <p>Complete jobs to earn your first badges!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">€{currentProgress.revenue.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{currentProgress.jobs}</div>
              <div className="text-sm text-muted-foreground">Jobs Done</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                {currentProgress.streak}
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};