import { supabase } from '@/integrations/supabase/client';
import type { UserSession, ApiResponse } from './types';

export const auth = {
  async getCurrentSession(): Promise<ApiResponse<UserSession>> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) return { error: error.message };
      if (!session?.user) return { data: undefined };

      // Get user profile for roles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', session.user.id)
        .single();

      if (profileError) return { error: profileError.message };

      // Map backend roles to frontend terminology
      const roles = (profile.roles as string[])?.map(role => {
        if (role === 'professional') return 'tasker';
        if (role === 'client') return 'asker'; 
        return role as 'admin';
      }) || ['asker'];

      return {
        data: {
          userId: session.user.id,
          email: session.user.email!,
          roles,
          verified: !!session.user.email_confirmed_at
        }
      };
    } catch (error) {
      return { error: 'Failed to get session' };
    }
  },

  async signIn(email: string, password: string): Promise<ApiResponse<UserSession>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) return { error: error.message };
      if (!data.session?.user) return { error: 'No session created' };

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', data.user.id)
        .single();

      if (profileError) return { error: profileError.message };

      const roles = (profile.roles as string[])?.map(role => {
        if (role === 'professional') return 'tasker';
        if (role === 'client') return 'asker';
        return role as 'admin';
      }) || ['asker'];

      return {
        data: {
          userId: data.user.id,
          email: data.user.email!,
          roles,
          verified: !!data.user.email_confirmed_at
        }
      };
    } catch (error) {
      return { error: 'Sign in failed' };
    }
  },

  async signUp(email: string, password: string, fullName?: string): Promise<ApiResponse<UserSession>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) return { error: error.message };
      if (!data.user) return { error: 'No user created' };

      return {
        data: {
          userId: data.user.id,
          email: data.user.email!,
          roles: ['asker'],
          verified: false
        }
      };
    } catch (error) {
      return { error: 'Sign up failed' };
    }
  },

  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { error: error.message };
      return { data: undefined };
    } catch (error) {
      return { error: 'Sign out failed' };
    }
  }
};