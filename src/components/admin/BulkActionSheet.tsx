import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useDualControl } from "@/hooks/useDualControl";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BulkAction {
  id: string;
  label: string;
  variant: 'default' | 'destructive';
  requiresReason: boolean;
  requiresDualControl?: boolean;
  dualControlPayload?: any;
}

interface BulkActionSheetProps {
  entityType: 'users' | 'verifications' | 'bookings' | 'payments';
  selectedIds: string[];
  availableActions: BulkAction[];
  onExecute: (action: string, reason?: string) => Promise<void>;
  onCancel: () => void;
  open: boolean;
}

export function BulkActionSheet({
  entityType,
  selectedIds,
  availableActions,
  onExecute,
  onCancel,
  open
}: BulkActionSheetProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { requiresDualControl, createRequest } = useDualControl();
  const { toast } = useToast();

  const currentAction = availableActions.find(a => a.id === selectedAction);

  const handleExecute = async () => {
    if (!selectedAction) return;
    
    if (currentAction?.requiresReason && !reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for this action",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Check if dual control is needed
      if (currentAction?.requiresDualControl) {
        const needsApproval = requiresDualControl(
          `bulk_${selectedAction}_${entityType}`,
          currentAction.dualControlPayload || { count: selectedIds.length }
        );

        if (needsApproval) {
          await createRequest({
            action_type: `bulk_${selectedAction}_${entityType}`,
            entity_type: entityType,
            entity_id: selectedIds[0], // First ID as representative
            reason: reason || `Bulk ${selectedAction} on ${selectedIds.length} ${entityType}`,
            payload: {
              action: selectedAction,
              ids: selectedIds,
              reason: reason
            }
          });

          toast({
            title: "Approval Required",
            description: "This action requires dual control approval. Request has been submitted."
          });
          
          onCancel();
          return;
        }
      }

      // Execute the action
      await onExecute(selectedAction, reason);

      // Log to admin audit
      await supabase.rpc('log_admin_action', {
        p_action: `bulk_${selectedAction}`,
        p_entity_type: entityType,
        p_changes: {
          count: selectedIds.length,
          ids: selectedIds,
          reason: reason
        }
      });

      toast({
        title: "Action Completed",
        description: `Successfully performed ${selectedAction} on ${selectedIds.length} ${entityType}`
      });

      onCancel();
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>{selectedIds.length}</strong> {entityType} selected
            </AlertDescription>
          </Alert>

          {!selectedAction ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Choose an action:</p>
              {availableActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  className="w-full justify-start"
                  onClick={() => setSelectedAction(action.id)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium mb-2">
                  Action: <span className="text-primary">{currentAction?.label}</span>
                </p>
                
                {currentAction?.requiresReason && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Reason (required):
                    </label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain why this action is necessary..."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {currentAction?.requiresDualControl && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This action may require dual control approval depending on risk level.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          {selectedAction && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAction(null);
                  setReason("");
                }}
                disabled={loading}
              >
                Back
              </Button>
              <Button onClick={handleExecute} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Execute
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
