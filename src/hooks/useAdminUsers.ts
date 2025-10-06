import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  active_role: string;
  created_at: string;
  roles: string[];
  is_suspended?: boolean;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async (filters?: {
    role?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, active_role, created_at')
        .order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      if (filters?.search) {
        query = query.ilike('full_name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user roles from user_roles table
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Fetch emails from auth.users
      const { data: authData } = await supabase.auth.admin.listUsers();

      interface ProfileData {
        id: string;
        full_name: string;
        active_role: string;
        created_at: string;
      }

      interface RoleData {
        user_id: string;
        role: string;
      }

      const usersWithEmail = ((data || []) as ProfileData[]).map(user => ({
        id: user.id,
        full_name: user.full_name,
        active_role: user.active_role,
        created_at: user.created_at,
        email: authData?.users?.find((u: any) => u.id === user.id)?.email || '',
        roles: (rolesData as RoleData[] || []).filter(r => r.user_id === user.id).map(r => r.role),
        is_suspended: false, // Add proper suspension tracking if needed
      }));

      setUsers(usersWithEmail);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      // For now, we'll disable the user's account via auth
      // In a real implementation, you'd add a suspension table or field
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: '876000h' // 100 years
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User suspended successfully',
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error suspending user:', error);
      toast({
        title: 'Error',
        description: 'Failed to suspend user',
        variant: 'destructive',
      });
    }
  };

  const activateUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none'
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User activated successfully',
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error activating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate user',
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  return {
    users,
    loading,
    fetchUsers,
    suspendUser,
    activateUser,
    deleteUser,
  };
}
