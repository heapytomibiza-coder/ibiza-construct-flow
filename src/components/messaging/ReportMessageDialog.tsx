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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMessageSafety } from '@/hooks/useMessageSafety';
import { useAuth } from '@/hooks/useAuth';

interface ReportMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  onReported?: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or unwanted messages' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'other', label: 'Other' }
];

export function ReportMessageDialog({
  open,
  onOpenChange,
  messageId,
  onReported
}: ReportMessageDialogProps) {
  const { user } = useAuth();
  const { reportMessage } = useMessageSafety(user?.id);
  const [selectedReason, setSelectedReason] = useState('spam');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [reporting, setReporting] = useState(false);

  const handleReport = async () => {
    setReporting(true);
    const reasonText = REPORT_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;
    const fullReason = additionalDetails 
      ? `${reasonText}: ${additionalDetails}` 
      : reasonText;

    const success = await reportMessage(messageId, fullReason);
    setReporting(false);

    if (success) {
      onOpenChange(false);
      setSelectedReason('spam');
      setAdditionalDetails('');
      onReported?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Message</DialogTitle>
          <DialogDescription>
            Help us keep the platform safe. Your report will be reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Reason for report</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {REPORT_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label htmlFor={reason.value} className="font-normal cursor-pointer">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              placeholder="Provide more context about this report..."
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reporting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReport}
            disabled={reporting}
          >
            {reporting ? 'Reporting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
