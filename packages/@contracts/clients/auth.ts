/**
 * Auth API React Query Hooks
 * Type-safe hooks for authentication operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for Edge Function calls
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// Types matching contracts/src/auth.zod.ts with extended profile
export interface UserSession {
  userId: string;
  email: string | null;
  roles: Array<'asker' | 'tasker' | 'admin'>;
  verified: boolean;
  activeRole: 'asker' | 'tasker' | 'admin' | null;
  profile: {
    display_name: string | null;
    preferred_language: string | null;
    onboarding_status: string | null;
  };
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  data: UserSession;
}

export interface SignUpRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignUpResponse {
  data: UserSession;
}

export interface GetSessionResponse {
  data: UserSession | null;
}

export interface SignOutResponse {
  success: boolean;
}

// Query Keys Factory
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

// Hooks

/**
 * Get current user session via auth-session Edge Function
 * Uses long stale time (5 minutes) and cached data while revalidating
 */
export const useCurrentSession = () => {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('auth-session', {
        body: {}
      });

      if (error) {
        console.error('Error fetching session:', error);
        throw error;
      }

      return data as GetSessionResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
};

/**
 * Sign in with email and password
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SignInRequest) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: request.email,
        password: request.password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate session to refetch with new user
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};

/**
 * Sign up with email and password
 */
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SignUpRequest) => {
      const { data, error } = await supabase.auth.signUp({
        email: request.email,
        password: request.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: request.fullName
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate session to fetch new user
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};

/**
 * Sign out current user
 * Clears all React Query cache on success
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      // Clear entire cache on sign out
      queryClient.clear();
    },
  });
};
