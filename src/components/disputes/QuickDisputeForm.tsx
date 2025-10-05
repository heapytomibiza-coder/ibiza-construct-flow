import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { AlertCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QuickDisputeFormProps {
  jobId: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const DISPUTE_REASONS = [
  { value: 'quality', label: 'Quality Issue' },
  { value: 'timeline', label: 'Timeline Delay' },
  { value: 'incorrect_work', label: 'Incorrect Work' },
  { value: 'materials', label: 'Material Issue' },
  { value: 'communication', label: 'Communication Problem' },
  { value: 'other', label: 'Other' },
];

export const QuickDisputeForm = ({ jobId, onSubmit, onCancel }: QuickDisputeFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !description.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please select a reason and provide details',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get job details for context
      const { data: job } = await supabase
        .from('jobs')
        .select('title, client_id')
        .eq('id', jobId)
        .single();

      if (!job) throw new Error('Job not found');

      // Create dispute
      const disputeNumber = `DSP-${Date.now()}`;
      const { error } = await supabase
        .from('disputes')
        .insert({
          job_id: jobId,
          created_by: user.id,
          disputed_against: job.client_id,
          type: reason,
          title: `Dispute: ${job.title}`,
          description: description,
          dispute_number: disputeNumber,
          status: 'open',
          priority: reason === 'quality' || reason === 'incorrect_work' ? 'high' : 'medium',
        });

      if (error) throw error;

      toast({
        title: 'Dispute reported',
        description: 'Our team will review your case within 24 hours',
      });

      onSubmit?.();
    } catch (error) {
      console.error('Error submitting dispute:', error);
      toast({
        title: 'Failed to submit',
        description: 'Please try again or contact support',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-50">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Report an Issue</h3>
            <p className="text-sm text-muted-foreground">
              Step {step} of 3 • We'll help resolve this
            </p>
          </div>
        </div>

        {/* Step 1: Select Reason */}
        {step === 1 && (
          <div className="space-y-3">
            <Label htmlFor="reason">What's the issue?</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => setStep(2)}
              disabled={!reason}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Describe Issue */}
        {step === 2 && (
          <div className="space-y-3">
            <Label htmlFor="description">Describe the issue</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide specific details about the issue..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Include dates, specific problems, and any relevant evidence
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!description.trim()}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Reason
                </p>
                <p className="font-medium">
                  {DISPUTE_REASONS.find(r => r.value === reason)?.label}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Description
                </p>
                <p className="text-sm">{description}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 text-sm text-blue-900">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="space-y-1 text-xs">
                <li>• Our team reviews within 24 hours</li>
                <li>• Both parties can provide evidence</li>
                <li>• Escrow funds remain protected</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>

            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
                className="w-full"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
