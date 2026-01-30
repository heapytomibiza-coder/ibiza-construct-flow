import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type GateOptions = {
  /** Required role to proceed - if user has different role, they'll be redirected to role switcher */
  requiredRole?: "professional" | "client" | "admin";
  /** Message shown before redirect */
  reason?: string;
};

/**
 * Hook for gating actions behind authentication and role requirements.
 * 
 * Usage:
 * ```tsx
 * const gate = useAuthGate();
 * 
 * const handleApply = () => {
 *   if (!gate(user, profile?.active_role, { 
 *     requiredRole: 'professional',
 *     reason: 'Sign in as a professional to apply'
 *   })) return;
 *   
 *   // User is authenticated with correct role, proceed...
 * };
 * ```
 */
export function useAuthGate() {
  const navigate = useNavigate();
  const location = useLocation();

  return function gate(
    user: any,
    activeRole?: string | null,
    opts?: GateOptions
  ): boolean {
    const redirect = encodeURIComponent(location.pathname + location.search);

    // Not logged in → redirect to auth
    if (!user) {
      if (opts?.reason) toast.error(opts.reason);
      navigate(`/auth?redirect=${redirect}`);
      return false;
    }

    // Logged in but wrong role → redirect to role switcher
    if (opts?.requiredRole && activeRole && activeRole !== opts.requiredRole) {
      toast.error(`Switch to ${opts.requiredRole} mode to continue`);
      navigate(`/role-switcher?redirect=${redirect}&requiredRole=${opts.requiredRole}`);
      return false;
    }

    return true;
  };
}
