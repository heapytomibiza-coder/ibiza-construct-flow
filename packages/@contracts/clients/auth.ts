/**
 * Auth API Client
 * Generated React Query hooks for authentication operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customInstance } from '@/lib/api/index';

// Types
export interface UserSession {
  userId: string;
  email: string;
  roles: ('client' | 'professional' | 'admin')[];
  verified: boolean;
  activeRole?: 'client' | 'professional' | 'admin' | null;
  profile?: {
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
  data?: UserSession;
}

export interface SignOutResponse {
  success: boolean;
}

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

// Hooks
export const useCurrentSession = () => {
  return useQuery<GetSessionResponse>({
    queryKey: authKeys.session(),
    queryFn: () => customInstance({ url: '/auth-session', method: 'GET' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation<SignInResponse, Error, SignInRequest>({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await import('@/integrations/supabase/client').then(m => 
        m.supabase.auth.signInWithPassword({ email, password })
      );
      
      if (error) throw error;
      if (!data.user) throw new Error('Sign in failed');
      
      // Fetch session data from edge function
      const sessionResponse = await customInstance({ url: '/auth-session', method: 'GET' }) as GetSessionResponse;
      return sessionResponse as SignInResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();
  
  return useMutation<SignUpResponse, Error, SignUpRequest>({
    mutationFn: async ({ email, password, fullName }) => {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await import('@/integrations/supabase/client').then(m => 
        m.supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { full_name: fullName }
          }
        })
      );
      
      if (error) throw error;
      if (!data.user) throw new Error('Sign up failed');
      
      // Fetch session data from edge function
      const sessionResponse = await customInstance({ url: '/auth-session', method: 'GET' }) as GetSessionResponse;
      return sessionResponse as SignUpResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  
  return useMutation<SignOutResponse, Error, void>({
    mutationFn: async () => {
      const { error } = await import('@/integrations/supabase/client').then(m => 
        m.supabase.auth.signOut()
      );
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
