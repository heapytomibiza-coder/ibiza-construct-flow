import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function useAdminCheck(redirectPath: string = '/') {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        navigate(redirectPath);
        return;
      }

      // Check if user has admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
        setLoading(false);
        navigate(redirectPath);
        return;
      }

      const hasAdminRole = !!data;
      setIsAdmin(hasAdminRole);
      setLoading(false);

      if (!hasAdminRole) {
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Admin check error:', error);
      setIsAdmin(false);
      setLoading(false);
      navigate(redirectPath);
    }
  };

  return { isAdmin, loading };
}
