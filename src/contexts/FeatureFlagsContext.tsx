import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlagsContextType {
  flags: Record<string, boolean>;
  loading: boolean;
  getFlag: (key: string, defaultValue?: boolean) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

const CACHE_KEY = 'feature_flags_cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

interface CachedFlags {
  flags: Record<string, boolean>;
  timestamp: number;
}

export const FeatureFlagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const cachedData: CachedFlags = JSON.parse(cached);
          if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
            setFlags(cachedData.flags);
            setLoading(false);
            return;
          }
        }

        // Check if user is authenticated before making DB calls
        const { data: { user } } = await supabase.auth.getUser();
        
        // Provide defaults for unauthenticated users (for auth pages)
        if (!user) {
        const defaultFlags = {
          'ff.magicLink': true,
          'ff.socialAuth': true,
          'ff.jobWizardV2': true,
          'ff.enhancedServiceCards': true,
          'ff.visualPricingTiers': true,
          'ff.smartLocationSuggestions': true,
          'ff.smartPricingHints': true,
          'ff.aiQuestions': true,
          'ff.contractFlow': true,
          'ff.paymentSystem': true,
          'enhanced_client_dashboard': true,
          'enhanced_professional_dashboard': true
        };
          setFlags(defaultFlags);
          setLoading(false);
          return;
        }

        // Fetch all feature flags in one query for authenticated users
        const { data, error } = await supabase
          .from('feature_flags')
          .select('key, enabled');

        if (error) {
          console.warn('Failed to load feature flags:', error.message);
          // Fallback to defaults on error
          const defaultFlags = {
            'ff.magicLink': true,
            'ff.socialAuth': true,
            'ff.jobWizardV2': true,
            'ff.enhancedServiceCards': true,
            'ff.visualPricingTiers': true,
            'ff.smartLocationSuggestions': true,
            'ff.smartPricingHints': true,
            'ff.aiQuestions': true,
            'ff.contractFlow': true,
            'ff.paymentSystem': true,
            'enhanced_client_dashboard': true,
            'enhanced_professional_dashboard': true
          };
          setFlags(defaultFlags);
          setLoading(false);
          return;
        }

        // Convert to object for easy lookup
        const flagsObject = (data || []).reduce((acc, flag) => {
          acc[flag.key] = !!flag.enabled;
          return acc;
        }, {} as Record<string, boolean>);

        setFlags(flagsObject);

        // Cache the results
        const cacheData: CachedFlags = {
          flags: flagsObject,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      } catch (error) {
        console.warn('Error loading feature flags:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeatureFlags();
  }, []);

  const getFlag = React.useCallback((key: string, defaultValue = false): boolean => {
    return flags.hasOwnProperty(key) ? flags[key] : defaultValue;
  }, [flags]);

  const value: FeatureFlagsContextType = {
    flags,
    loading,
    getFlag
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};

// Legacy hook for backwards compatibility
export const useFeature = (key: string, defaultValue = false): boolean => {
  const { getFlag } = useFeatureFlags();
  return getFlag(key, defaultValue);
};