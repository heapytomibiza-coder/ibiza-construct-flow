import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useJobQuotes } from '@/hooks/useJobQuotes';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface SubmitQuoteDialogProps {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmitQuoteDialog({ jobId, jobTitle, open, onOpenChange }: SubmitQuoteDialogProps) {
  const { submitQuote } = useJobQuotes();
  const [quoteAmount, setQuoteAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [proposal, setProposal] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await submitQuote.mutateAsync({
      job_id: jobId,
      quote_amount: parseFloat(quoteAmount),
      estimated_duration_hours: duration ? parseInt(duration) : undefined,
      estimated_start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      proposal_message: proposal
    });

    // Reset form
    setQuoteAmount('');
    setDuration('');
    setStartDate(undefined);
    setProposal('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Quote</DialogTitle>
          <DialogDescription>
            Submit your quote for: {jobTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quote_amount">Quote Amount (€) *</Label>
            <Input
              id="quote_amount"
              type="number"
              step="0.01"
              min="0"
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              placeholder="Enter your quote amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 40"
            />
          </div>

          <div className="space-y-2">
            <Label>Estimated Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposal">Proposal Message *</Label>
            <Textarea
              id="proposal"
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Describe your approach, experience, and why you're the best fit for this job..."
              rows={6}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitQuote.isPending}>
              {submitQuote.isPending ? 'Submitting...' : 'Submit Quote'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
