import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare } from 'lucide-react';
import { ReviewSubmissionDialog } from './ReviewSubmissionDialog';

interface QuickReviewPromptProps {
  contractId: string;
  jobId?: string;
  revieweeId: string;
  revieweeName: string;
  onReviewSubmitted?: () => void;
}

export function QuickReviewPrompt({
  contractId,
  jobId,
  revieweeId,
  revieweeName,
  onReviewSubmitted,
}: QuickReviewPromptProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-yellow-400" />
            How was your experience?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your feedback helps {revieweeName} improve and helps other clients make informed decisions.
          </p>
          <Button 
            onClick={() => setDialogOpen(true)}
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Leave a Review
          </Button>
        </CardContent>
      </Card>

      <ReviewSubmissionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open && onReviewSubmitted) {
            onReviewSubmitted();
          }
        }}
        jobId={jobId || contractId}
        contractId={contractId}
        revieweeId={revieweeId}
        revieweeName={revieweeName}
      />
    </>
  );
}
