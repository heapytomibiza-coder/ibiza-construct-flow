import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWorkSubmission } from '@/hooks/useWorkSubmission';
import { format } from 'date-fns';

interface WorkReviewCardProps {
  submission: any;
  contractId: string;
}

export function WorkReviewCard({ submission, contractId }: WorkReviewCardProps) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReview, setShowReview] = useState(false);
  const { reviewWork, isReviewing, releaseEscrow, isReleasing } = useWorkSubmission(contractId);

  const handleApprove = () => {
    reviewWork(
      { 
        submissionId: submission.id, 
        approved: true, 
        reviewNotes 
      },
      {
        onSuccess: () => {
          setShowReview(false);
          setReviewNotes('');
        },
      }
    );
  };

  const handleReject = () => {
    if (!reviewNotes.trim()) {
      return;
    }

    reviewWork(
      { 
        submissionId: submission.id, 
        approved: false, 
        reviewNotes 
      },
      {
        onSuccess: () => {
          setShowReview(false);
          setReviewNotes('');
        },
      }
    );
  };

  const getStatusBadge = () => {
    switch (submission.status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Needs Revision</Badge>;
      default:
        return <Badge>{submission.status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Work Submission</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Submitted on {format(new Date(submission.created_at), 'MMM dd, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Completion Notes</Label>
          <p className="text-sm mt-1 p-3 bg-muted rounded-md">
            {submission.submission_notes}
          </p>
        </div>

        {submission.status === 'pending' && !showReview && (
          <Button 
            onClick={() => setShowReview(true)} 
            className="w-full"
            size="lg"
          >
            Review Work
          </Button>
        )}

        {showReview && submission.status === 'pending' && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="review-notes">Review Notes (optional for approval, required for rejection)</Label>
              <Textarea
                id="review-notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any feedback or notes..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleReject}
                variant="outline"
                disabled={isReviewing || !reviewNotes.trim()}
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isReviewing}
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Release Payment
              </Button>
            </div>
          </div>
        )}

        {submission.status === 'approved' && (
          <div className="space-y-3 pt-4 border-t">
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                ✓ Work approved! Payment is being processed.
              </p>
            </div>
          </div>
        )}

        {submission.status === 'rejected' && submission.review_notes && (
          <div className="space-y-2 pt-4 border-t">
            <Label>Revision Notes</Label>
            <p className="text-sm p-3 bg-red-50 text-red-800 rounded-md">
              {submission.review_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
