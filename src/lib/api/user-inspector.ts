import { supabase } from '@/integrations/supabase/client';
import type {
  GetUserProfileRequest,
  GetUserProfileResponse,
  ListUsersRequest,
  ListUsersResponse,
  GetUserActivityRequest,
  GetUserActivityResponse,
  GetUserJobsRequest,
  GetUserJobsResponse,
  UpdateUserStatusRequest,
  UpdateUserStatusResponse,
} from '../../../contracts/src/user-inspector.zod';

/**
 * User Inspector API - Contract-first implementation
 * Provides admin capabilities for user management and inspection
 */
export const userInspector = {
  /**
   * Get detailed profile for a specific user
   */
  async getUserProfile(request: GetUserProfileRequest): Promise<GetUserProfileResponse> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, roles, active_role, created_at, updated_at')
        .eq('id', request.userId)
        .single();

      if (error) throw error;

      // Get email from auth.users metadata if needed
      const { data: authData } = await supabase.auth.admin.getUserById(request.userId);
      
      return {
        success: true,
        data: data ? {
          ...data,
          email: authData?.user?.email || null,
          roles: data.roles as string[],
        } : null,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch user profile',
      };
    }
  },

  /**
   * List all users with optional filtering
   */
  async listUsers(request: Partial<ListUsersRequest> = {}): Promise<ListUsersResponse> {
    try {
      const { limit = 50, offset = 0, role } = request;

      let query = supabase
        .from('profiles')
        .select('id, full_name, roles, active_role, created_at, updated_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filter by role if provided
      if (role) {
        query = query.contains('roles', [role]);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data ? data.map(user => ({
          ...user,
          email: null, // Email fetched separately if needed
          roles: user.roles as string[],
        })) : null,
        total: count || 0,
      };
    } catch (error) {
      console.error('Error listing users:', error);
      return {
        success: false,
        data: null,
        total: 0,
        error: error instanceof Error ? error.message : 'Failed to list users',
      };
    }
  },

  /**
   * Get recent activity for a user
   */
  async getUserActivity(request: GetUserActivityRequest): Promise<GetUserActivityResponse> {
    try {
      const { userId, limit = 20 } = request;

      const { data, error } = await supabase
        .from('system_activity_log')
        .select('id, user_id, action, entity_type, entity_id, changes, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data: data as any || null,
      };
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch user activity',
      };
    }
  },

  /**
   * Get jobs associated with a user
   */
  async getUserJobs(request: GetUserJobsRequest): Promise<GetUserJobsResponse> {
    try {
      const { userId, limit = 10 } = request;

      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, status, created_at')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data: data || null,
      };
    } catch (error) {
      console.error('Error fetching user jobs:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch user jobs',
      };
    }
  },

  /**
   * Update user roles (admin operation)
   */
  async updateUserStatus(request: UpdateUserStatusRequest): Promise<UpdateUserStatusResponse> {
    try {
      const { userId, roles } = request;

      const { data, error } = await supabase
        .from('profiles')
        .update({ roles, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, full_name, roles, active_role, created_at, updated_at')
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data ? {
          ...data,
          email: null, // Email not updated here
          roles: data.roles as string[],
        } : null,
      };
    } catch (error) {
      console.error('Error updating user status:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update user status',
      };
    }
  },
};
