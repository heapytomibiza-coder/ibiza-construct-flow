import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ReviewFormData {
  rating: number;
  comment: string;
  photos: File[];
  categoryRatings?: Record<string, number>;
}

export interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => Promise<void>;
  maxPhotos?: number;
  maxPhotoSize?: number; // in MB
  categories?: string[]; // e.g., ['Communication', 'Quality', 'Timeliness']
  loading?: boolean;
}

export default function ReviewForm({ 
  onSubmit, 
  maxPhotos = 3,
  maxPhotoSize = 5,
  categories = [],
  loading = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file sizes
    const oversized = files.filter(f => f.size > maxPhotoSize * 1024 * 1024);
    if (oversized.length > 0) {
      toast({
        title: "File too large",
        description: `Photos must be under ${maxPhotoSize}MB each`,
        variant: "destructive",
      });
      return;
    }

    // Limit number of photos
    const newPhotos = [...photos, ...files].slice(0, maxPhotos);
    setPhotos(newPhotos);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please share your experience",
        variant: "destructive",
      });
      return;
    }

    await onSubmit({ 
      rating, 
      comment: comment.trim(), 
      photos,
      categoryRatings: categories.length > 0 ? categoryRatings : undefined
    });
  };

  const setCategoryRating = (category: string, value: number) => {
    setCategoryRatings(prev => ({ ...prev, [category]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall rating */}
        <div className="space-y-2">
          <Label>Overall Rating</Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} star{rating !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Category ratings */}
        {categories.length > 0 && (
          <div className="space-y-3 pt-2">
            <Label>Rate by Category</Label>
            {categories.map((category) => (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <span className="text-xs text-muted-foreground">
                    {categoryRatings[category] || 0}/5
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCategoryRating(category, star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= (categoryRatings[category] || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment */}
        <div className="space-y-2">
          <Label htmlFor="comment">Your Review</Label>
          <Textarea
            id="comment"
            maxLength={500}
            placeholder="Share details about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-32"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Be specific and honest</span>
            <span>{comment.length}/500</span>
          </div>
        </div>

        {/* Photo upload */}
        <div className="space-y-2">
          <Label>Photos (optional)</Label>
          <div className="space-y-2">
            {photos.length < maxPhotos && (
              <div>
                <Input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFiles}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Photos (up to {maxPhotos}, max {maxPhotoSize}MB each)
                </Button>
              </div>
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !comment.trim()}
          className="w-full"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardContent>
    </Card>
  );
}
