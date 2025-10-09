import { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminQueue, Column, FilterChip } from '@/components/admin/shared/AdminQueue';
import { AdminDrawer } from '@/components/admin/shared/AdminDrawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Flag, CheckCircle, XCircle, Star } from 'lucide-react';

interface Review {
  id: string;
  professional_id: string;
  client_id: string;
  rating: number;
  comment: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  created_at: string;
  professional: {
    full_name: string;
    display_name: string;
  } | null;
  client: {
    full_name: string;
    display_name: string;
  } | null;
}

export default function ReviewsQueue() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('flagged');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews', activeFilter],
    queryFn: async () => {
      let finalQuery: any = supabase
        .from('reviews')
        .select(`
          *,
          professional:profiles!reviews_professional_id_fkey(full_name, display_name),
          client:profiles!reviews_client_id_fkey(full_name, display_name)
        `)
        .order('created_at', { ascending: false });

      if (activeFilter === 'flagged') {
        finalQuery = finalQuery.eq('is_flagged', true);
      }

      const { data, error } = await finalQuery;
      if (error) throw error;
      return data as Review[];
    },
  });

  const moderateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, action }: { reviewId: string; action: 'approve' | 'remove' }) => {
      const { error } = await supabase
        .from('reviews')
        .update({
          is_flagged: action === 'remove',
          flag_reason: action === 'remove' ? 'Removed by admin' : null,
        })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.action === 'approve' ? 'Review Approved' : 'Review Removed',
        description: `Review has been ${variables.action === 'approve' ? 'approved' : 'removed'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setSelectedReview(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to moderate review. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const columns: Column<Review>[] = [
    {
      key: 'professional',
      label: 'Professional',
      render: (review) => review.professional?.full_name || review.professional?.display_name || 'Unknown',
    },
    {
      key: 'client',
      label: 'Client',
      render: (review) => review.client?.full_name || review.client?.display_name || 'Unknown',
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (review) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span>{review.rating}/5</span>
        </div>
      ),
    },
    {
      key: 'is_flagged',
      label: 'Status',
      render: (review) => (
        <Badge variant={review.is_flagged ? 'destructive' : 'default'}>
          {review.is_flagged ? 'Flagged' : 'Active'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (review) => new Date(review.created_at).toLocaleDateString(),
    },
  ];

  const filters: FilterChip[] = [
    { id: 'flagged', label: 'Flagged', count: reviews?.filter(r => r.is_flagged).length },
    { id: 'all', label: 'All Reviews', count: reviews?.length },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Review Moderation Queue</h1>
          <p className="text-sm text-muted-foreground">
            Moderate and manage user reviews
          </p>
        </div>

        <AdminQueue
          title="Reviews"
          description="View and moderate platform reviews"
          columns={columns}
          data={reviews || []}
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onRowClick={(review) => setSelectedReview(review)}
          isLoading={isLoading}
        />

        <AdminDrawer
          open={!!selectedReview}
          onOpenChange={(open) => !open && setSelectedReview(null)}
          title="Review Details"
          description="Review information and moderation actions"
        >
          {selectedReview && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Professional</h3>
                  <p className="text-base">
                    {selectedReview.professional?.full_name || selectedReview.professional?.display_name || 'Unknown'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                  <p className="text-base">
                    {selectedReview.client?.full_name || selectedReview.client?.display_name || 'Unknown'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rating</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-base font-semibold">{selectedReview.rating}/5</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Comment</h3>
                  <p className="text-base mt-1">{selectedReview.comment || 'No comment provided'}</p>
                </div>

                {selectedReview.is_flagged && selectedReview.flag_reason && (
                  <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Flag className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-destructive">Flagged</h3>
                        <p className="text-sm text-muted-foreground mt-1">{selectedReview.flag_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Submitted</h3>
                  <p className="text-base">{new Date(selectedReview.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => moderateReviewMutation.mutate({ reviewId: selectedReview.id, action: 'approve' })}
                  disabled={moderateReviewMutation.isPending}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => moderateReviewMutation.mutate({ reviewId: selectedReview.id, action: 'remove' })}
                  disabled={moderateReviewMutation.isPending}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </AdminDrawer>
      </div>
    </AdminLayout>
  );
}
