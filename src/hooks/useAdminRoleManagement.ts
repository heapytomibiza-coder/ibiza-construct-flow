import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type RoleAction = "assign" | "revoke";
type AppRole = "admin" | "professional" | "client";

interface RoleManagementParams {
  action: RoleAction;
  targetUserId: string;
  role: AppRole;
}

export function useAdminRoleManagement() {
  const queryClient = useQueryClient();

  const manageRole = useMutation({
    mutationFn: async ({ action, targetUserId, role }: RoleManagementParams) => {
      const { data, error } = await supabase.functions.invoke("admin-manage-roles", {
        body: { action, targetUserId, role },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to manage role");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Role management failed");
      }

      return data;
    },
    onSuccess: (data, variables) => {
      const actionText = variables.action === "assign" ? "assigned" : "revoked";
      toast.success(`Role ${actionText} successfully`, {
        description: data.message,
      });
      
      // Invalidate user queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to manage role", {
        description: error.message,
      });
    },
  });

  const assignRole = (targetUserId: string, role: AppRole) => {
    return manageRole.mutateAsync({ action: "assign", targetUserId, role });
  };

  const revokeRole = (targetUserId: string, role: AppRole) => {
    return manageRole.mutateAsync({ action: "revoke", targetUserId, role });
  };

  return {
    assignRole,
    revokeRole,
    isLoading: manageRole.isPending,
    error: manageRole.error,
  };
}
