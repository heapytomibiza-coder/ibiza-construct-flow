import { useEffect, useState } from 'react';

type DashboardMode = 'simple' | 'enhanced' | 'classic';

interface Preferences {
  mode?: DashboardMode;
  widgets?: string[];
  layout?: 'compact' | 'comfortable';
  hiddenCards?: string[];
}

const STORAGE_KEY = 'dashboard_prefs_v2';

interface UseDashboardPreferenceProps {
  scope: 'client' | 'professional';
  defaultMode?: DashboardMode;
}

export function useDashboardPreference({ scope, defaultMode = 'enhanced' }: UseDashboardPreferenceProps) {
  const [prefs, setPrefs] = useState<Preferences>({ mode: defaultMode });

  useEffect(() => {
    const key = `${STORAGE_KEY}:${scope}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setPrefs({ mode: defaultMode, ...parsed });
      } catch {
        setPrefs({ mode: defaultMode });
      }
    }
  }, [scope, defaultMode]);

  const updatePrefs = (patch: Partial<Preferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      const key = `${STORAGE_KEY}:${scope}`;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  const updateMode = (mode: DashboardMode) => {
    updatePrefs({ mode });
  };

  return { 
    dashboardMode: prefs.mode ?? defaultMode,
    preferences: prefs,
    updateMode,
    updatePrefs
  };
}
