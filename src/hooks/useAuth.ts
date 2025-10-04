import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSignIn, useSignUp, useSignOut } from '../../packages/@contracts/clients/auth';

interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  roles: any; // JSON field from database
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
  
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const signOutMutation = useSignOut();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch to avoid blocking auth state changes
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    return new Promise<{ error: any }>((resolve) => {
      signInMutation.mutate(
        { email, password },
        {
          onSuccess: () => resolve({ error: null }),
          onError: (error) => resolve({ error })
        }
      );
    });
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    return new Promise<{ error: any }>((resolve) => {
      signUpMutation.mutate(
        { email, password, fullName },
        {
          onSuccess: () => resolve({ error: null }),
          onError: (error) => resolve({ error })
        }
      );
    });
  };

  const signOut = async () => {
    return new Promise<{ error: any }>((resolve) => {
      signOutMutation.mutate(
        undefined,
        {
          onSuccess: () => resolve({ error: null }),
          onError: (error) => resolve({ error })
        }
      );
    });
  };

  const hasRole = (role: string): boolean => {
    if (!profile?.roles) return false;
    // Handle both string[] and JSON formats
    const roles = Array.isArray(profile.roles) ? profile.roles : JSON.parse(profile.roles || '[]');
    return roles.includes(role);
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isProfessional = (): boolean => hasRole('professional');
  const isClient = (): boolean => hasRole('client');

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isProfessional,
    isClient
  };
};