import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PendingReview {
  id: string;
  reviewer_name: string;
  reviewee_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  reports_count?: number;
}

export function ReviewModerationPanel() {
  const [pendingReviews, setReviews] = useState<PendingReview[]>([]);
  const [reportedReviews, setReportedReviews] = useState<PendingReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingReviews();
    fetchReportedReviews();
  }, []);

  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name),
          reviewee:profiles!reviews_reviewee_id_fkey(full_name)
        `)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReviews((data || []).map((r: any) => ({
        id: r.id,
        reviewer_name: r.reviewer?.full_name || 'Unknown',
        reviewee_name: r.reviewee?.full_name || 'Unknown',
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        created_at: r.created_at,
      })));
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending reviews',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReportedReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name),
          reviewee:profiles!reviews_reviewee_id_fkey(full_name),
          reports:review_reports(count)
        `)
        .eq('moderation_status', 'approved')
        .not('reports', 'is', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReportedReviews((data || []).map((r: any) => ({
        id: r.id,
        reviewer_name: r.reviewer?.full_name || 'Unknown',
        reviewee_name: r.reviewee?.full_name || 'Unknown',
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        created_at: r.created_at,
        reports_count: r.reports?.length || 0,
      })));
    } catch (error) {
      console.error('Error fetching reported reviews:', error);
    }
  };

  const handleModerate = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          moderation_status: status,
          moderator_notes: moderatorNotes || undefined,
          moderated_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Review ${status}`,
      });

      setModeratorNotes('');
      setSelectedReview(null);
      await fetchPendingReviews();
      await fetchReportedReviews();
    } catch (error) {
      console.error('Error moderating review:', error);
      toast({
        title: 'Error',
        description: 'Failed to moderate review',
        variant: 'destructive',
      });
    }
  };

  const renderReviewCard = (review: PendingReview, showReports?: boolean) => (
    <Card key={review.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{review.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              By {review.reviewer_name} for {review.reviewee_name}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge>{review.rating} ★</Badge>
            {showReports && review.reports_count && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {review.reports_count} reports
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{review.comment}</p>
        
        <div className="text-xs text-muted-foreground">
          {new Date(review.created_at).toLocaleString()}
        </div>

        {selectedReview === review.id && (
          <div className="space-y-2 pt-2 border-t">
            <Textarea
              placeholder="Moderator notes (optional)"
              value={moderatorNotes}
              onChange={(e) => setModeratorNotes(e.target.value)}
              rows={2}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setSelectedReview(review.id);
              handleModerate(review.id, 'approved');
            }}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedReview(review.id);
              handleModerate(review.id, 'rejected');
            }}
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews ({pendingReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : pendingReviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending reviews
            </p>
          ) : (
            pendingReviews.map((review) => renderReviewCard(review))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reported Reviews ({reportedReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reportedReviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No reported reviews
            </p>
          ) : (
            reportedReviews.map((review) => renderReviewCard(review, true))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
