import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { VisualRatingInput } from './VisualRatingInput';
import { useReviewSystem } from '@/hooks/useReviewSystem';
import type { CategoryRatings } from '@/types/review';

const reviewSchema = z.object({
  timeliness: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  payment: z.number().min(1).max(5),
  clarity: z.number().min(1).max(5),
  professionalism: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewClientDialogProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
  jobId?: string;
  clientId: string;
  clientName: string;
}

export const ReviewClientDialog = ({
  open,
  onClose,
  contractId,
  jobId,
  clientId,
  clientName,
}: ReviewClientDialogProps) => {
  const { submitReview } = useReviewSystem();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      timeliness: 3,
      communication: 3,
      payment: 3,
      clarity: 3,
      professionalism: 3,
      title: '',
      comment: '',
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setIsSubmitting(true);

      const ratings: CategoryRatings = {
        timeliness: data.timeliness,
        communication: data.communication,
        value: data.payment, // Map payment to value field
        quality: data.clarity, // Map clarity to quality field
        professionalism: data.professionalism,
      };

      await submitReview.mutateAsync({
        contractId,
        jobId,
        revieweeId: clientId,
        ratings,
        title: data.title,
        comment: data.comment,
      });

      onClose();
      form.reset();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Your Client</DialogTitle>
          <DialogDescription>
            Share your experience working with {clientName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Ratings */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="timeliness"
                render={({ field }) => (
                  <FormItem>
                    <VisualRatingInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Timeliness"
                      required
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communication"
                render={({ field }) => (
                  <FormItem>
                    <VisualRatingInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Communication"
                      required
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment"
                render={({ field }) => (
                  <FormItem>
                    <VisualRatingInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Payment Promptness"
                      required
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clarity"
                render={({ field }) => (
                  <FormItem>
                    <VisualRatingInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Project Clarity"
                      required
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professionalism"
                render={({ field }) => (
                  <FormItem>
                    <VisualRatingInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Professionalism"
                      required
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Great client to work with!"
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Share details about your experience..."
                      rows={4}
                      maxLength={1000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
