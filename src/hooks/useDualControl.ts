import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateApprovalRequest {
  action_type: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  payload: any;
}

export function useDualControl() {
  const queryClient = useQueryClient();

  // Fetch pending approvals
  const { data: pendingApprovals, isLoading } = useQuery({
    queryKey: ["dual-control-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dual_control_approvals" as any)
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create approval request
  const createRequest = useMutation({
    mutationFn: async (request: CreateApprovalRequest) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("dual_control_approvals" as any)
        .insert({
          ...request,
          requested_by: user.data.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Approval request created", {
        description: "Waiting for approval from another admin.",
      });
      queryClient.invalidateQueries({ queryKey: ["dual-control-approvals"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to create approval request", {
        description: error.message,
      });
    },
  });

  // Check if action requires dual control
  const requiresDualControl = (actionType: string, payload: any): boolean => {
    // High-risk actions that require dual approval
    const highRiskActions = [
      { type: "refund", threshold: 500 },
      { type: "dispute_decision", threshold: 50 }, // 50% split or more
      { type: "payout_batch", threshold: 1000 },
      { type: "user_suspension", threshold: null },
      { type: "role_grant_admin", threshold: null },
    ];

    const action = highRiskActions.find((a) => a.type === actionType);
    if (!action) return false;

    // If no threshold, always require approval
    if (action.threshold === null) return true;

    // Check threshold-based rules
    if (actionType === "refund" && payload.amount > action.threshold) {
      return true;
    }

    if (actionType === "dispute_decision" && payload.split_percent > action.threshold) {
      return true;
    }

    if (actionType === "payout_batch" && payload.total_amount > action.threshold) {
      return true;
    }

    return false;
  };

  return {
    pendingApprovals,
    isLoading,
    createRequest: createRequest.mutateAsync,
    requiresDualControl,
  };
}
