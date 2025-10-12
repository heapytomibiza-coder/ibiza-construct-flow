import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JobCompletionCardProps {
  jobId: string;
  contractId?: string;
  onComplete?: () => void;
}

export function JobCompletionCard({ jobId, contractId, onComplete }: JobCompletionCardProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState('');

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setDeliverables([...deliverables, newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSubmitCompletion = async () => {
    if (!completionNotes.trim()) {
      toast({
        variant: "destructive",
        title: "Notes Required",
        description: "Please provide completion notes",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update job status to completed
      const { error: jobError } = await supabase
        .from('jobs')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (jobError) throw jobError;

      // If there's a contract, mark the first pending milestone as completed
      if (contractId) {
        const { data: milestones } = await supabase
          .from('escrow_milestones')
          .select('id')
          .eq('contract_id', contractId)
          .eq('status', 'in_progress')
          .order('milestone_number', { ascending: true })
          .limit(1);

        if (milestones && milestones.length > 0) {
          await supabase
            .from('escrow_milestones')
            .update({
              status: 'completed',
              completed_date: new Date().toISOString(),
            })
            .eq('id', milestones[0].id);
        }
      }

      // Log completion event
      await supabase.from('job_lifecycle_events').insert({
        job_id: jobId,
        event_type: 'completion_submitted',
        metadata: {
          notes: completionNotes,
          deliverables,
          submitted_at: new Date().toISOString(),
        },
      });

      toast({
        title: "Completion Submitted",
        description: "The client will be notified to verify your work.",
      });

      onComplete?.();
    } catch (error) {
      console.error('Error submitting completion:', error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit completion",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Mark Job Complete
        </CardTitle>
        <CardDescription>
          Submit your completed work for client verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Completion Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Completion Notes *</Label>
          <Textarea
            id="notes"
            placeholder="Describe what you've completed, any important details, or instructions for the client..."
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Provide clear details about the completed work
          </p>
        </div>

        {/* Deliverables Checklist */}
        <div className="space-y-2">
          <Label>Deliverables</Label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addDeliverable()}
              placeholder="Add a deliverable item..."
              className="flex-1 px-3 py-2 text-sm border rounded-md"
            />
            <Button type="button" size="sm" onClick={addDeliverable}>
              Add
            </Button>
          </div>
          
          {deliverables.length > 0 && (
            <div className="space-y-2 mt-3">
              {deliverables.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm flex-1">{item}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDeliverable(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitCompletion}
          disabled={isSubmitting || !completionNotes.trim()}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Submit for Verification
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
