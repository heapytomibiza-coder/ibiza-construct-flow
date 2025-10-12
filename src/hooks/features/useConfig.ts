/**
 * Configuration Hook
 * Phase 32: Advanced Feature Flags & Configuration System
 * 
 * Hook for dynamic configuration management
 */

import { useState, useCallback, useEffect } from 'react';
import { configManager, Configuration, ConfigScope } from '@/lib/features';

export function useConfig<T = any>(
  key?: string,
  defaultValue?: T,
  scope?: ConfigScope
) {
  const [value, setValue] = useState<T | undefined>(
    key ? configManager.get(key, defaultValue, scope) : undefined
  );
  const [configs, setConfigs] = useState<Configuration[]>([]);

  // Load value when key changes
  useEffect(() => {
    if (key) {
      const newValue = configManager.get(key, defaultValue, scope);
      setValue(newValue);
    }
  }, [key, defaultValue, scope]);

  // Load all configs
  const loadConfigs = useCallback((scope?: ConfigScope) => {
    const allConfigs = configManager.getAll(scope);
    setConfigs(allConfigs);
  }, []);

  // Set configuration
  const setConfig = useCallback((config: Configuration) => {
    configManager.set(config);
    if (config.key === key) {
      setValue(config.value as T);
    }
    loadConfigs();
  }, [key, loadConfigs]);

  // Get configuration
  const get = useCallback(<V = any>(
    configKey: string,
    defaultValue?: V,
    scope?: ConfigScope
  ): V => {
    return configManager.get(configKey, defaultValue, scope);
  }, []);

  // Update configuration
  const update = useCallback((configKey: string, newValue: any) => {
    const updated = configManager.update(configKey, newValue);
    if (updated && configKey === key) {
      setValue(newValue as T);
    }
    loadConfigs();
    return updated;
  }, [key, loadConfigs]);

  // Delete configuration
  const deleteConfig = useCallback((configKey: string) => {
    const deleted = configManager.delete(configKey);
    if (deleted) {
      loadConfigs();
    }
    return deleted;
  }, [loadConfigs]);

  // Get by tag
  const getByTag = useCallback((tag: string) => {
    return configManager.getByTag(tag);
  }, []);

  // Search
  const search = useCallback((query: string) => {
    return configManager.search(query);
  }, []);

  // Export/Import
  const exportConfigs = useCallback((scope?: ConfigScope) => {
    return configManager.export(scope);
  }, []);

  const importConfigs = useCallback((
    configs: Record<string, any>,
    scope: ConfigScope = 'global'
  ) => {
    configManager.import(configs, scope);
    loadConfigs();
  }, [loadConfigs]);

  // Clear cache
  const clearCache = useCallback((configKey?: string) => {
    configManager.clearCache(configKey);
  }, []);

  return {
    value,
    configs,
    loadConfigs,
    setConfig,
    get,
    update,
    deleteConfig,
    getByTag,
    search,
    exportConfigs,
    importConfigs,
    clearCache,
  };
}
