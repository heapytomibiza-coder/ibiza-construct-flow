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
  roles: ('asker' | 'tasker' | 'admin')[];
  verified: boolean;
  activeRole?: string;
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
    mutationFn: (data) => 
      customInstance({ 
        url: '/auth-session',
        method: 'POST',
        data: { action: 'signin', ...data }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();
  
  return useMutation<SignUpResponse, Error, SignUpRequest>({
    mutationFn: (data) => 
      customInstance({ 
        url: '/auth-session',
        method: 'POST',
        data: { action: 'signup', ...data }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  
  return useMutation<SignOutResponse, Error, void>({
    mutationFn: () => 
      customInstance({ 
        url: '/auth-session',
        method: 'POST',
        data: { action: 'signout' }
      }),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
