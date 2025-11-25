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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Upload, X } from 'lucide-react';
import { useReviewSystem } from '@/hooks/useReviewSystem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const reviewSchema = z.object({
  timeliness_rating: z.number().min(1, 'Please rate timeliness').max(5),
  communication_rating: z.number().min(1, 'Please rate communication').max(5),
  value_rating: z.number().min(1, 'Please rate value').max(5),
  quality_rating: z.number().min(1, 'Please rate quality').max(5),
  professionalism_rating: z.number().min(1, 'Please rate professionalism').max(5),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId?: string;
  contractId: string;
  revieweeId: string;
  revieweeName: string;
}

const categoryConfig = [
  { key: 'timeliness_rating', label: 'Timeliness', icon: '⏱️', description: 'Were deadlines met?' },
  { key: 'communication_rating', label: 'Communication', icon: '💬', description: 'How responsive were they?' },
  { key: 'value_rating', label: 'Value', icon: '💰', description: 'Was it worth the cost?' },
  { key: 'quality_rating', label: 'Quality', icon: '⭐', description: 'Quality of work delivered' },
  { key: 'professionalism_rating', label: 'Professionalism', icon: '👔', description: 'Professional conduct' },
] as const;

export const ReviewSubmissionDialog = ({
  open,
  onOpenChange,
  jobId,
  contractId,
  revieweeId,
  revieweeName,
}: ReviewSubmissionDialogProps) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { submitReview } = useReviewSystem();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      timeliness_rating: 0,
      communication_rating: 0,
      value_rating: 0,
      quality_rating: 0,
      professionalism_rating: 0,
    },
  });

  const ratings = watch();

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `review-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reviews')
        .upload(filePath, photo);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('reviews')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setUploading(true);
      
      const photoUrls = await uploadPhotos();

      await submitReview.mutateAsync({
        contractId,
        jobId,
        revieweeId,
        ratings: {
          timeliness: data.timeliness_rating,
          communication: data.communication_rating,
          value: data.value_rating,
          quality: data.quality_rating,
          professionalism: data.professionalism_rating,
        },
        title: data.title,
        comment: data.comment,
        photos: photoUrls.length > 0 ? photoUrls : undefined,
      });

      reset();
      setPhotos([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setUploading(false);
    }
  };

  const RatingInput = ({ 
    categoryKey, 
    label, 
    icon, 
    description 
  }: { 
    categoryKey: keyof ReviewFormData; 
    label: string; 
    icon: string; 
    description: string;
  }) => {
    const currentRating = ratings[categoryKey] as number || 0;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <Label className="font-medium">{label}</Label>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setValue(categoryKey, rating, { shouldValidate: true })}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  rating <= currentRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
        {errors[categoryKey] && (
          <p className="text-sm text-destructive">{errors[categoryKey]?.message}</p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review {revieweeName}</DialogTitle>
          <DialogDescription>
            Share your experience to help others make informed decisions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Ratings */}
          <div className="space-y-4">
            {categoryConfig.map((category) => (
              <RatingInput
                key={category.key}
                categoryKey={category.key}
                label={category.label}
                icon={category.icon}
                description={category.description}
              />
            ))}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Summarize your experience"
              {...register('title')}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Review (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share details about your experience..."
              rows={4}
              {...register('comment')}
              maxLength={1000}
            />
            {errors.comment && (
              <p className="text-sm text-destructive">{errors.comment.message}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photos (Optional, Max 5)</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="w-20 h-20 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading || submitReview.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={uploading || submitReview.isPending}
            >
              {uploading || submitReview.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
