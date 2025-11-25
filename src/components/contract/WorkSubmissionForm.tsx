import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, Upload } from 'lucide-react';
import { useWorkSubmission } from '@/hooks/useWorkSubmission';

interface WorkSubmissionFormProps {
  contractId: string;
  onSuccess?: () => void;
}

export function WorkSubmissionForm({ contractId, onSuccess }: WorkSubmissionFormProps) {
  const [notes, setNotes] = useState('');
  const { submitWork, isSubmitting } = useWorkSubmission(contractId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notes.trim()) {
      return;
    }

    submitWork(
      { contractId, notes },
      {
        onSuccess: () => {
          setNotes('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Submit Completed Work
        </CardTitle>
        <CardDescription>
          Let the client know the work is complete and ready for review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="notes">Completion Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what you've completed and any important details..."
              rows={5}
              required
            />
            <p className="text-sm text-muted-foreground mt-2">
              Include any relevant details about the completed work
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !notes.trim()}
            className="w-full"
            size="lg"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
