import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, DollarSign } from 'lucide-react';

interface ReleaseEscrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneId: string;
}

export const ReleaseEscrowDialog = ({
  open,
  onOpenChange,
  milestoneId,
}: ReleaseEscrowDialogProps) => {
  const [processing, setProcessing] = useState(false);

  const handleRelease = async () => {
    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke('release-escrow', {
        body: { milestoneId },
      });

      if (error) throw error;

      toast.success('Escrow released successfully - payment sent to professional');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error releasing escrow:', error);
      toast.error(error.message || 'Failed to release escrow');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Release Payment
          </DialogTitle>
          <DialogDescription>
            Release the escrow payment to the professional
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">
              Ready to Release
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              You've approved this milestone. Releasing the payment will transfer the funds
              from escrow to the professional's account.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> This action cannot be undone. Only release payment if
              you're satisfied with the work completed.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRelease}
              disabled={processing}
              className="flex-1 bg-gradient-hero"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Releasing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Release Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
