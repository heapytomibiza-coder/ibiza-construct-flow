/**
 * React Query hooks for User Inspector API
 * Phase 10: Extended API coverage for admin user management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './_http';

export interface UserProfile {
  user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  roles: Array<'client' | 'professional' | 'admin'>;
  created_at: string;
  last_sign_in_at?: string;
  email_verified: boolean;
  phone_verified: boolean;
  metadata?: Record<string, any>;
}

export interface UserActivity {
  user_id: string;
  activity_type: 'login' | 'job_post' | 'offer_sent' | 'booking' | 'payment';
  details: Record<string, any>;
  timestamp: string;
}

export interface UserStats {
  user_id: string;
  total_jobs: number;
  active_jobs: number;
  completed_jobs: number;
  total_spent?: number;
  total_earned?: number;
  avg_rating?: number;
  total_reviews?: number;
}

const queryKeys = {
  users: (filters?: { role?: string; search?: string }) => ['users', filters] as const,
  user: (userId: string) => ['users', userId] as const,
  userActivity: (userId: string, limit?: number) => ['users', userId, 'activity', limit] as const,
  userStats: (userId: string) => ['users', userId, 'stats'] as const,
};

// List all users with filters
export function useListUsers(filters?: { role?: 'client' | 'professional' | 'admin'; search?: string; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.users(filters),
    queryFn: () =>
      apiFetch<UserProfile[]>('/admin/users', {
        query: filters,
      }),
  });
}

// Get specific user profile
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => apiFetch<UserProfile>(`/admin/users/${userId}`),
    enabled: !!userId,
  });
}

// Get user activity history
export function useUserActivity(userId: string, limit: number = 50) {
  return useQuery({
    queryKey: queryKeys.userActivity(userId, limit),
    queryFn: () =>
      apiFetch<UserActivity[]>(`/admin/users/${userId}/activity`, {
        query: { limit },
      }),
    enabled: !!userId,
  });
}

// Get user statistics
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: queryKeys.userStats(userId),
    queryFn: () => apiFetch<UserStats>(`/admin/users/${userId}/stats`),
    enabled: !!userId,
  });
}

// Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: Array<'client' | 'professional' | 'admin'> }) =>
      apiFetch<UserProfile>(`/admin/users/${userId}/roles`, {
        method: 'PATCH',
        body: { roles },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(data.user_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
  });
}

// Suspend/unsuspend user
export function useToggleUserSuspension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, suspend }: { userId: string; suspend: boolean }) =>
      apiFetch<{ ok: true; user: UserProfile }>(`/admin/users/${userId}/suspension`, {
        method: 'POST',
        body: { suspend },
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
  });
}

// Delete user (admin only)
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch<{ ok: true }>(`/admin/users/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, userId) => {
      queryClient.removeQueries({ queryKey: queryKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
  });
}
