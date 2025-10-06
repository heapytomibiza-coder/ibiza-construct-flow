import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMessageSafety } from '@/hooks/useMessageSafety';
import { useAuth } from '@/hooks/useAuth';

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  targetUserName: string;
  onBlocked?: () => void;
}

export function BlockUserDialog({
  open,
  onOpenChange,
  targetUserId,
  targetUserName,
  onBlocked
}: BlockUserDialogProps) {
  const { user } = useAuth();
  const { blockUser } = useMessageSafety(user?.id);
  const [reason, setReason] = useState('');
  const [blocking, setBlocking] = useState(false);

  const handleBlock = async () => {
    setBlocking(true);
    const success = await blockUser(targetUserId, reason);
    setBlocking(false);

    if (success) {
      onOpenChange(false);
      setReason('');
      onBlocked?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block {targetUserName}?</DialogTitle>
          <DialogDescription>
            Blocked users cannot send you messages or see your activity. You can unblock them later from your settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Why are you blocking this user?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={blocking}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleBlock}
            disabled={blocking}
          >
            {blocking ? 'Blocking...' : 'Block User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
