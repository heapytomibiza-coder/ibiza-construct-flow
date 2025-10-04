/**
 * Auth API React Query Hooks
 * Type-safe hooks for authentication operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './_http';

// Types matching contracts/src/auth.zod.ts
export interface UserSession {
  userId: string;
  email: string;
  roles: Array<'asker' | 'tasker' | 'admin'>;
  verified: boolean;
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

// Query Keys Factory
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

// Hooks

/**
 * Get current user session
 * Uses long stale time (5 minutes) and cached data while revalidating
 */
export const useCurrentSession = () => {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => apiFetch<GetSessionResponse>('/api/auth/session', { method: 'GET' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Sign in with email and password
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SignInRequest) =>
      apiFetch<SignInResponse>('/api/auth/signin', { method: 'POST', body: request }),
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
    mutationFn: (request: SignUpRequest) =>
      apiFetch<SignUpResponse>('/api/auth/signup', { method: 'POST', body: request }),
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
    mutationFn: () => apiFetch<SignOutResponse>('/api/auth/signout', { method: 'POST' }),
    onSuccess: () => {
      // Clear entire cache on sign out
      queryClient.clear();
    },
  });
};
