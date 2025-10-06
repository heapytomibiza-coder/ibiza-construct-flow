import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PartialReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneId: string;
  milestoneAmount: number;
  alreadyReleased: number;
}

export const PartialReleaseDialog = ({
  open,
  onOpenChange,
  milestoneId,
  milestoneAmount,
  alreadyReleased,
}: PartialReleaseDialogProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const remainingAmount = milestoneAmount - alreadyReleased;
  const isValid = 
    amount && 
    parseFloat(amount) > 0 && 
    parseFloat(amount) <= remainingAmount;

  const handleRelease = async () => {
    if (!isValid) return;

    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('release-escrow', {
        body: {
          milestoneId,
          amount: parseFloat(amount),
          notes,
          partial: true,
        },
      });

      if (error) throw error;

      toast({
        title: "Partial Payment Released",
        description: `$${amount} has been released to the professional.`,
      });

      onOpenChange(false);
      setAmount("");
      setNotes("");
    } catch (error: any) {
      console.error('Error releasing partial payment:', error);
      toast({
        variant: "destructive",
        title: "Release Failed",
        description: error.message || "Failed to release partial payment",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Release Partial Payment</DialogTitle>
          <DialogDescription>
            Release a portion of this milestone's payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-medium">${milestoneAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Already Released:</span>
              <span className="font-medium">${alreadyReleased.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Remaining:</span>
              <span className="text-primary">${remainingAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Release</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={remainingAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max: ${remainingAmount.toFixed(2)}`}
            />
            {amount && parseFloat(amount) > remainingAmount && (
              <p className="text-sm text-destructive">
                Amount exceeds remaining balance
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this partial release..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRelease}
            disabled={!isValid || processing}
          >
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Release ${amount || '0.00'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
