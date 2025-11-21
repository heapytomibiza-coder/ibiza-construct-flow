import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface QuickApplyButtonProps {
  jobId: string;
  jobTitle: string;
  suggestedQuote?: number;
  onSuccess?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const QuickApplyButton: React.FC<QuickApplyButtonProps> = ({
  jobId,
  jobTitle,
  suggestedQuote,
  onSuccess,
  variant = 'default',
  size = 'default',
  className
}) => {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(suggestedQuote?.toString() || '');
  const [message, setMessage] = useState(`Hi! I'm interested in your project "${jobTitle}". I have relevant experience and can deliver quality results. Let's discuss the details!`);

  const handleQuickApply = async () => {
    if (!user) {
      toast.error('Please log in to apply');
      return;
    }

    if (!quote || parseFloat(quote) <= 0) {
      toast.error('Please enter a valid quote amount');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('job_quotes')
        .insert({
          job_id: jobId,
          professional_id: user.id,
          quote_amount: parseFloat(quote),
          proposal_message: message,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Application sent successfully!');
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Zap className="w-4 h-4 mr-2" />
        Quick Apply
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-copper" />
              Quick Apply
            </DialogTitle>
            <DialogDescription>
              Send your application in seconds. Review and adjust your quote and message.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quote">Your Quote (€)</Label>
              <Input
                id="quote"
                type="number"
                placeholder="Enter amount"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                min="0"
                step="10"
              />
              {suggestedQuote && (
                <p className="text-xs text-muted-foreground">
                  💡 Suggested based on similar jobs: €{suggestedQuote}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message to Client</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you're a great fit..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleQuickApply} 
              disabled={loading}
              className="bg-gradient-hero text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Send Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
