import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ReviewStatsWidget = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['review-stats', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;

      // Fetch reviews received
      const { data: reviewsReceived, error: receivedError } = await supabase
        .from('reviews')
        .select('overall_rating, created_at')
        .eq('reviewee_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (receivedError) throw receivedError;

      // Count total reviews
      const { count: totalReviews, error: countError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('reviewee_id', user.id);

      if (countError) throw countError;

      // Get this month's reviews
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: thisMonthReviews } = await supabase
        .from('reviews')
        .select('overall_rating')
        .eq('reviewee_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      // Count pending as client
      const { count: pendingAsClient, error: clientError } = await supabase
        .from('activity_feed')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('notification_type', 'review_reminder')
        .eq('metadata->>reminder_type', 'client')
        .is('read_at', null);

      if (clientError) throw clientError;

      // Count pending as pro
      const { count: pendingAsPro, error: proError } = await supabase
        .from('activity_feed')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('notification_type', 'review_reminder')
        .eq('metadata->>reminder_type', 'professional')
        .is('read_at', null);

      if (proError) throw proError;

      // Count unread review notifications
      const { count: unreadNotifications, error: unreadError } = await supabase
        .from('activity_feed')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('event_type', ['review_received', 'review_response'])
        .is('read_at', null);

      if (unreadError) throw unreadError;

      // Calculate ratings
      const avgRating = reviewsReceived && reviewsReceived.length > 0
        ? reviewsReceived.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviewsReceived.length
        : 0;

      const monthAvgRating = thisMonthReviews && thisMonthReviews.length > 0
        ? thisMonthReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / thisMonthReviews.length
        : 0;

      return {
        pendingAsClient: pendingAsClient || 0,
        pendingAsPro: pendingAsPro || 0,
        recentReviews: reviewsReceived || [],
        totalReviews: totalReviews || 0,
        thisMonthCount: thisMonthReviews?.length || 0,
        averageRating: avgRating,
        monthAverageRating: monthAvgRating,
        unreadNotifications: unreadNotifications || 0,
      };
    },
  });

  if (isLoading || !data) {
    return null;
  }

  const totalPending = data.pendingAsClient + data.pendingAsPro;
  const hasActivity = data.totalReviews > 0 || totalPending > 0 || data.unreadNotifications > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Review Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasActivity ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">You're all caught up 🎉</p>
            <p className="text-sm mt-1">No reviews waiting for you right now.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {data.averageRating > 0 ? `${data.averageRating.toFixed(1)} ⭐` : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{data.thisMonthCount}</p>
                {data.monthAverageRating > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {data.monthAverageRating.toFixed(1)} ⭐ avg
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{data.totalReviews}</p>
              </div>
            </div>

            {totalPending > 0 && (
              <div className="p-3 bg-accent/50 rounded-lg space-y-2">
                <p className="text-sm font-medium">Pending Reviews: {totalPending}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  {data.pendingAsClient > 0 && (
                    <p>• {data.pendingAsClient} as client</p>
                  )}
                  {data.pendingAsPro > 0 && (
                    <p>• {data.pendingAsPro} as professional</p>
                  )}
                </div>
              </div>
            )}

            {data.unreadNotifications > 0 && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  <Badge variant="secondary">{data.unreadNotifications}</Badge> new review
                  notification{data.unreadNotifications > 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              {totalPending > 0 && (
                <Button variant="outline" className="flex-1" asChild>
                  <a href="/reviews/submit">Review Completed Jobs</a>
                </Button>
              )}
              {data.unreadNotifications > 0 && (
                <Button variant="outline" className="flex-1" asChild>
                  <a href="/reviews">View Responses</a>
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};