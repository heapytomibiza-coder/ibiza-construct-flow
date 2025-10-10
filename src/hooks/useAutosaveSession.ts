import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAutosaveSession(formType: string, payload: any, enabled: boolean = true) {
  const latestPayload = useRef<any>(payload);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Update ref when payload changes
  useEffect(() => {
    latestPayload.current = payload;
  }, [payload]);

  useEffect(() => {
    if (!enabled) return;

    const saveSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('form_sessions').upsert({
          user_id: user.id,
          form_type: formType,
          payload: latestPayload.current,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,form_type'
        });
      } catch (error) {
        console.error('Error saving form session:', error);
      }
    };

    // Debounced autosave - save 1 second after last change
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveSession();
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formType, payload, enabled]);

  // Function to manually save
  const saveNow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('form_sessions').upsert({
        user_id: user.id,
        form_type: formType,
        payload: latestPayload.current,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,form_type'
      });
    } catch (error) {
      console.error('Error saving form session:', error);
    }
  };

  // Function to load saved session
  const loadSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('form_sessions')
        .select('payload')
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .single();

      if (error || !data) return null;
      return data.payload;
    } catch (error) {
      console.error('Error loading form session:', error);
      return null;
    }
  };

  // Function to clear session
  const clearSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('form_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('form_type', formType);
    } catch (error) {
      console.error('Error clearing form session:', error);
    }
  };

  return {
    saveNow,
    loadSession,
    clearSession
  };
}