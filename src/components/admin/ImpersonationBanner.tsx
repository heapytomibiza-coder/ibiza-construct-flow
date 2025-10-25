import { useEffect, useState } from "react";
import { AlertTriangle, UserCog, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImpersonationSession {
  id: string;
  target_user_id: string;
  target_email: string;
  reason: string;
  expires_at: string;
  actions_taken: number;
}

export function ImpersonationBanner() {
  const [session, setSession] = useState<ImpersonationSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    checkImpersonationSession();

    const interval = setInterval(() => {
      if (session) {
        const now = new Date().getTime();
        const expires = new Date(session.expires_at).getTime();
        const diff = expires - now;

        if (diff <= 0) {
          endImpersonation();
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${hours}h ${minutes}m remaining`);
        }
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [session]);

  const checkImpersonationSession = async () => {
    try {
      const { data, error } = await supabase.rpc("get_active_impersonation_session");

      if (error || !data || data.length === 0) {
        setSession(null);
        return;
      }

      const sessionData = data[0] as any;

      // Get target user email
      const { data: userData } = await supabase
        .from("profiles" as any)
        .select("full_name")
        .eq("id", sessionData.target_user_id)
        .single();

      const profileData = userData as any;

      setSession({
        id: sessionData.id,
        target_user_id: sessionData.target_user_id,
        target_email: profileData?.full_name || sessionData.target_user_id,
        reason: sessionData.reason,
        expires_at: sessionData.expires_at,
        actions_taken: sessionData.actions_taken,
      });
    } catch (error) {
      console.error("Error checking impersonation session:", error);
    }
  };

  const endImpersonation = async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("impersonation_sessions" as any)
        .update({ ended_at: new Date().toISOString() })
        .eq("id", session.id);

      if (error) throw error;

      setSession(null);
      
      toast.success("Impersonation session ended", {
        description: "You are now back to your admin account",
      });

      // Reload to clear any impersonated state
      window.location.reload();
    } catch (error) {
      console.error("Error ending impersonation:", error);
      toast.error("Failed to end impersonation session");
    }
  };

  if (!session) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-warning text-warning-foreground px-4 py-2 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Impersonating: {session.target_email}</p>
            <p className="text-sm opacity-90">
              Reason: {session.reason} • {timeRemaining} • {session.actions_taken} actions taken
            </p>
          </div>
        </div>
        <Button
          onClick={endImpersonation}
          variant="secondary"
          size="sm"
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Stop Impersonating
        </Button>
      </div>
    </div>
  );
}
