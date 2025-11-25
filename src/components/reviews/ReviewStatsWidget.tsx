import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, AlertCircle, TrendingUp, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export const ReviewStatsWidget = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['review-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        // Get reviews received in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: recentCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('reviewee_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString());

        // Get total reviews
        const { count: totalCount, data: allReviews } = await supabase
          .from('reviews')
          .select('overall_rating', { count: 'exact' })
          .eq('reviewee_id', user.id);

        const avgRating = allReviews?.reduce((sum: number, r: any) => sum + (r.overall_rating || 0), 0) / (allReviews?.length || 1);

        // Get unread notifications
        const { count: unreadNotifs } = await supabase
          .from('activity_feed')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('read_at', null)
          .in('event_type', ['review_received', 'review_response', 'review_helpful_vote']);

        return {
          pendingReviews: 0, // Simplified for now
          recentReviews: recentCount || 0,
          totalReviews: totalCount || 0,
          averageRating: avgRating || 0,
          unreadNotifications: unreadNotifs || 0,
        };
      } catch (error) {
        console.error('Error fetching review stats:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  if (isLoading || !stats) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Review Activity</h3>
          <Link to="/reviews">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Average Rating */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4" />
              Average Rating
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({stats.totalReviews} total)
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Last 7 Days
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.recentReviews}</span>
              <span className="text-sm text-muted-foreground">new</span>
            </div>
          </div>

          {/* Unread Notifications */}
          <div className="space-y-2 col-span-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              Review Notifications
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.unreadNotifications}</span>
              {stats.unreadNotifications > 0 && (
                <Badge variant="secondary" className="text-xs">Unread</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
