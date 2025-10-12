import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobRoute } from '@/lib/navigation';
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
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const quoteRequestSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().trim().min(20, 'Please provide more details (at least 20 characters)').max(1000),
  location_details: z.string().trim().max(200).optional(),
  special_requirements: z.string().trim().max(500).optional(),
});

interface QuoteRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: string;
  professionalName: string;
  serviceId?: string;
  serviceName?: string;
}

export const QuoteRequestModal = ({
  open,
  onOpenChange,
  professionalId,
  professionalName,
  serviceId,
  serviceName
}: QuoteRequestModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: serviceName || '',
    description: '',
    location_details: '',
    special_requirements: ''
  });
  const [preferredDates, setPreferredDates] = useState<Date[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to request a quote');
      navigate('/auth');
      return;
    }

    // Validate form
    try {
      quoteRequestSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setLoading(true);
    try {
      // Create job with quote request details
      const jobData = {
        client_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: 'open',
        micro_id: serviceId || null,
        location_details: formData.location_details.trim() || null,
        special_requirements: formData.special_requirements.trim() || null,
        preferred_dates: preferredDates.length > 0 ? preferredDates.map(d => d.toISOString()) : null,
        origin: 'professional_request'
      };

      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (jobError) throw jobError;

      // Send notification to professional
      await supabase
        .from('activity_feed')
        .insert({
          user_id: professionalId,
          event_type: 'quote_requested',
          entity_type: 'job',
          entity_id: job.id,
          title: 'New Quote Request',
          description: `${user.email || 'A client'} requested a quote for "${formData.title.trim()}"`,
          action_url: getJobRoute(job.id),
          notification_type: 'quote',
          priority: 'high'
        });

      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        location_details: '',
        special_requirements: ''
      });
      setPreferredDates([]);
      
      toast.success('Quote request sent! The professional will submit their quote soon.');
      navigate(getJobRoute(job.id));
    } catch (error) {
      console.error('Error creating quote request:', error);
      toast.error('Failed to send quote request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Quote from {professionalName}</DialogTitle>
          <DialogDescription>
            Provide details about your project to receive an accurate quote
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Kitchen renovation, Bathroom plumbing repair"
              maxLength={100}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project in detail, including scope, materials, timeline expectations..."
              rows={5}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              <p className="text-xs text-muted-foreground ml-auto">
                {formData.description.length}/1000
              </p>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location Details</Label>
            <Input
              id="location"
              value={formData.location_details}
              onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
              placeholder="Address or area"
              maxLength={200}
            />
          </div>

          {/* Preferred Dates */}
          <div>
            <Label>Preferred Dates (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !preferredDates.length && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {preferredDates.length > 0
                    ? `${preferredDates.length} date(s) selected`
                    : 'Select preferred dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="multiple"
                  selected={preferredDates}
                  onSelect={(dates) => setPreferredDates(dates || [])}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            {preferredDates.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {preferredDates.map((date, index) => (
                  <span key={index} className="text-xs bg-secondary px-2 py-1 rounded">
                    {format(date, 'MMM dd, yyyy')}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Special Requirements */}
          <div>
            <Label htmlFor="requirements">Special Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.special_requirements}
              onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
              placeholder="Any specific materials, timing constraints, or special considerations..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.special_requirements.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-hero text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Quote Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
