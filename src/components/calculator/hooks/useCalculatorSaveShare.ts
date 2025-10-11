import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { CalculatorSelections } from './useCalculatorState';
import type { PricingResult } from './useCalculatorPricing';

interface SavedConfig {
  id: string;
  config_name: string;
  created_at: string;
  project_type: string;
  selections: any;
  pricing_snapshot?: any;
}

export function useCalculatorSaveShare() {
  const [saving, setSaving] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const { toast } = useToast();

  const saveConfiguration = async (
    name: string,
    selections: CalculatorSelections,
    pricing?: PricingResult | null
  ) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('calculator_saved_configs')
        .insert({
          config_name: name,
          project_type: selections.projectType || '',
          selections: selections as any,
          pricing_snapshot: pricing as any
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Configuration Saved",
        description: `"${name}" has been saved successfully.`
      });

      return data;
    } catch (error) {
      console.error('Save configuration error:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save configuration. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const loadSavedConfigs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('calculator_saved_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSavedConfigs((data as any) || []);
      return (data as any) || [];
    } catch (error) {
      console.error('Load configs error:', error);
      return [];
    }
  };

  const deleteConfiguration = async (configId: string) => {
    try {
      const { error } = await supabase
        .from('calculator_saved_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      toast({
        title: "Configuration Deleted",
        description: "The saved configuration has been removed."
      });

      // Refresh list
      await loadSavedConfigs();
    } catch (error) {
      console.error('Delete config error:', error);
      toast({
        title: "Delete Failed",
        variant: "destructive"
      });
    }
  };

  const generateShareLink = async (configId: string, expiresInDays: number = 30) => {
    try {
      const shareToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const { error } = await supabase
        .from('calculator_saved_configs')
        .update({
          is_public: true,
          share_token: shareToken,
          expires_at: expiresAt.toISOString()
        })
        .eq('id', configId);

      if (error) throw error;

      const shareUrl = `${window.location.origin}/calculator?share=${shareToken}`;
      
      // Track share event
      await supabase.from('calculator_share_events').insert({
        config_id: configId,
        share_method: 'link'
      });

      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Share Link Generated",
        description: "Link copied to clipboard! Valid for 30 days."
      });

      return shareUrl;
    } catch (error) {
      console.error('Generate share link error:', error);
      toast({
        title: "Share Failed",
        variant: "destructive"
      });
      return null;
    }
  };

  const loadSharedConfig = async (shareToken: string) => {
    try {
      const { data, error } = await supabase
        .from('calculator_saved_configs')
        .select('*')
        .eq('share_token', shareToken)
        .eq('is_public', true)
        .single();

      if (error) throw error;

      // Track access
      await supabase.from('calculator_share_events').insert({
        config_id: data.id,
        share_method: 'link',
        accessed_at: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('Load shared config error:', error);
      return null;
    }
  };

  return {
    saving,
    savedConfigs,
    saveConfiguration,
    loadSavedConfigs,
    deleteConfiguration,
    generateShareLink,
    loadSharedConfig
  };
}
