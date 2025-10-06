import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useImpersonation } from "@/hooks/useImpersonation";
import { UserCog, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImpersonationControlsProps {
  userId: string;
  userName: string;
}

export function ImpersonationControls({ userId, userName }: ImpersonationControlsProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { startImpersonation, isStarting, isImpersonating } = useImpersonation();

  const handleImpersonate = async () => {
    if (!reason.trim()) {
      return;
    }

    try {
      await startImpersonation({
        targetUserId: userId,
        reason: reason.trim(),
        requiresApproval: false,
      });
      setOpen(false);
      setReason("");
    } catch (error) {
      // Error handling done in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isImpersonating}
        >
          <UserCog className="h-4 w-4" />
          Impersonate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Start Impersonation Session
          </DialogTitle>
          <DialogDescription>
            You are about to impersonate <strong>{userName}</strong>. All actions will be logged.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Impersonation is a high-privilege action. Use only when absolutely necessary for support or debugging.
            Session expires in 4 hours.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason (Required)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why impersonation is necessary (e.g., 'Customer support - investigating payment issue ticket #1234')"
              rows={4}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImpersonate}
            disabled={!reason.trim() || isStarting}
          >
            Start Impersonation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
