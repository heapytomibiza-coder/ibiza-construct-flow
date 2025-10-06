import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StartImpersonationParams {
  targetUserId: string;
  reason: string;
  requiresApproval?: boolean;
}

export function useImpersonation() {
  const queryClient = useQueryClient();

  // Get active impersonation session
  const { data: activeSession } = useQuery({
    queryKey: ["impersonation-active"],
    queryFn: async () => {
      const sessionId = localStorage.getItem("impersonation_session_id");
      if (!sessionId) return null;

      const { data, error } = await supabase
        .from("impersonation_sessions" as any)
        .select("*")
        .eq("id", sessionId)
        .is("ended_at", null)
        .single();

      if (error) {
        localStorage.removeItem("impersonation_session_id");
        return null;
      }

      return data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Start impersonation
  const startImpersonation = useMutation({
    mutationFn: async ({ targetUserId, reason, requiresApproval = false }: StartImpersonationParams) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");

      // Check if already impersonating
      if (activeSession) {
        throw new Error("Already in an impersonation session. End the current session first.");
      }

      // Create impersonation session
      const { data, error } = await supabase
        .from("impersonation_sessions" as any)
        .insert({
          admin_id: user.data.user.id,
          target_user_id: targetUserId,
          reason,
          requires_approval: requiresApproval,
          expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
        })
        .select()
        .single();

      if (error) throw error;

      const sessionData = data as any;

      // Store session ID in localStorage
      localStorage.setItem("impersonation_session_id", sessionData.id);

      // Log the impersonation start
      await supabase.rpc("log_admin_action", {
        p_action: "impersonation_started",
        p_entity_type: "user",
        p_entity_id: targetUserId,
        p_changes: {
          impersonation_session_id: sessionData.id,
          reason,
          expires_at: sessionData.expires_at,
        },
      });

      return sessionData;
    },
    onSuccess: () => {
      toast.success("Impersonation started", {
        description: "You are now viewing as the selected user. All actions will be logged.",
      });
      queryClient.invalidateQueries({ queryKey: ["impersonation-active"] });
      
      // Reload to apply impersonation context
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error: Error) => {
      toast.error("Failed to start impersonation", {
        description: error.message,
      });
    },
  });

  // End impersonation
  const endImpersonation = useMutation({
    mutationFn: async () => {
      const sessionId = localStorage.getItem("impersonation_session_id");
      if (!sessionId) throw new Error("No active impersonation session");

      const { error } = await supabase
        .from("impersonation_sessions" as any)
        .update({ ended_at: new Date().toISOString() })
        .eq("id", sessionId);

      if (error) throw error;

      // Log the impersonation end
      await supabase.rpc("log_admin_action", {
        p_action: "impersonation_ended",
        p_entity_type: "impersonation_session",
        p_entity_id: sessionId,
        p_changes: {
          ended_at: new Date().toISOString(),
        },
      });

      localStorage.removeItem("impersonation_session_id");
    },
    onSuccess: () => {
      toast.success("Impersonation ended", {
        description: "You are back to your admin account",
      });
      queryClient.invalidateQueries({ queryKey: ["impersonation-active"] });
      
      // Reload to clear impersonation context
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error: Error) => {
      toast.error("Failed to end impersonation", {
        description: error.message,
      });
    },
  });

  return {
    activeSession,
    isImpersonating: !!activeSession,
    startImpersonation: startImpersonation.mutateAsync,
    endImpersonation: endImpersonation.mutateAsync,
    isStarting: startImpersonation.isPending,
    isEnding: endImpersonation.isPending,
  };
}
