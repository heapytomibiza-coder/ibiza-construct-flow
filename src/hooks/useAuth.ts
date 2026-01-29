import { useState, useEffect, useMemo, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  active_role: string;
  tasker_onboarding_status: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // 1) Single source of truth for session & user + listener cleanup
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false); // auth state known
    };

    // Attach listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      // Do not set loading here; profile loading is tracked separately.
    });

    init();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2) Fetch profile whenever user changes (no setTimeout, no duplication)
  const refreshProfile = useCallback(async (userId?: string) => {
    const id = userId ?? user?.id;
    if (!id) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle<Profile>();
      if (error) throw error;
      setProfile(data ?? null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // fetch on sign-in / user switch; clear on sign-out
    if (user?.id) {
      refreshProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user?.id, refreshProfile]);

  // 3) Auth actions
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  // 4) Roles — use a HEAD/COUNT query to avoid row materialization
  const hasRole = useCallback(
    async (role: 'admin' | 'client' | 'professional'): Promise<boolean> => {
      if (!user?.id) return false;
      try {
        const { count, error } = await supabase
          .from('user_roles')
          .select('role', { head: true, count: 'exact' })
          .eq('user_id', user.id)
          .eq('role', role);
        if (error) return false;
        return (count ?? 0) > 0;
      } catch {
        return false;
      }
    },
    [user?.id]
  );

  // 5) Convenience memoized helpers (callable or optimistic based on profile)
  const isAdmin = useCallback(async () => hasRole('admin'), [hasRole]);
  const isProfessional = useCallback(async () => hasRole('professional'), [hasRole]);
  const isClient = useCallback(async () => hasRole('client'), [hasRole]);

  // Derived ready state: auth known && (no user || profile fetched/idle)
  const ready = useMemo(() => {
    if (!loading && !user) return true;          // signed-out and known
    if (!loading && user && !profileLoading) return true; // signed-in and profile settled
    return false;
  }, [loading, user, profileLoading]);

  return {
    user,
    session,
    profile,
    loading: !ready,          // external consumers: 'loading' means "not ready"
    profileLoading,           // finer-grained if needed
    refreshProfile,           // manual refetch hook
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isProfessional,
    isClient,
  };
};