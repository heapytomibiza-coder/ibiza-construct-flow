import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface DualApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalRequest: {
    id: string;
    action_type: string;
    entity_type: string;
    entity_id: string;
    requested_by: string;
    reason: string;
    payload: any;
    created_at: string;
    expires_at: string;
  } | null;
}

export function DualApprovalModal({ open, onOpenChange, approvalRequest }: DualApprovalModalProps) {
  const [adminNotes, setAdminNotes] = useState("");
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (action: "approved" | "rejected") => {
      if (!approvalRequest) return;

      const { error } = await supabase
        .from("dual_control_approvals" as any)
        .update({
          status: action,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", approvalRequest.id);

      if (error) throw error;

      // Log the admin action
      await supabase.rpc("log_admin_action", {
        p_action_type: `dual_approval_${action}`,
        p_target_type: approvalRequest.entity_type,
        p_target_id: approvalRequest.entity_id,
        p_action_data: {
          approval_id: approvalRequest.id,
          action_type: approvalRequest.action_type,
          notes: adminNotes,
        },
      });
    },
    onSuccess: (_, action) => {
      toast.success(`Request ${action}`, {
        description: `The ${approvalRequest?.action_type} request has been ${action}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["dual-control-approvals"] });
      onOpenChange(false);
      setAdminNotes("");
    },
    onError: (error: Error) => {
      toast.error("Failed to process approval", {
        description: error.message,
      });
    },
  });

  if (!approvalRequest) return null;

  const isExpired = new Date(approvalRequest.expires_at) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Dual Approval Required
          </DialogTitle>
          <DialogDescription>
            This high-risk action requires approval from a second admin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Action Type</p>
                <p className="font-medium">{approvalRequest.action_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Entity</p>
                <p className="font-medium">{approvalRequest.entity_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Requested</p>
                <p className="font-medium">
                  {new Date(approvalRequest.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Expires</p>
                <p className={`font-medium ${isExpired ? "text-destructive" : ""}`}>
                  {new Date(approvalRequest.expires_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Reason</p>
              <p className="text-sm">{approvalRequest.reason}</p>
            </div>

            {/* Payload Preview */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Request Details</p>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(approvalRequest.payload, null, 2)}
              </pre>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Admin Notes (optional)
            </label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes about your decision..."
              rows={3}
            />
          </div>

          {isExpired && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded">
              <XCircle className="h-4 w-4" />
              This approval request has expired
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => approveMutation.mutate("rejected")}
            disabled={approveMutation.isPending || isExpired}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button
            onClick={() => approveMutation.mutate("approved")}
            disabled={approveMutation.isPending || isExpired}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
