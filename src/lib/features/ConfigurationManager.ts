/**
 * Configuration Manager
 * Phase 32: Advanced Feature Flags & Configuration System
 * 
 * Manages dynamic application configuration
 */

import { Configuration, ConfigScope, ConfigValidation } from './types';

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private configs: Map<string, Configuration> = new Map();
  private cache: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  // Set configuration
  set(config: Configuration): void {
    // Validate value
    if (config.validation) {
      const validation = this.validate(config.value, config.validation);
      if (validation !== true) {
        throw new Error(`Configuration validation failed: ${validation}`);
      }
    }

    this.configs.set(config.key, config);
    this.cache.delete(config.key);
  }

  // Get configuration value
  get<T = any>(key: string, defaultValue?: T, scope?: ConfigScope): T {
    // Check cache
    const cacheKey = `${key}:${scope || 'global'}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const config = this.configs.get(key);
    
    if (!config) {
      return defaultValue as T;
    }

    // Check scope
    if (scope && config.scope !== 'global' && config.scope !== scope) {
      return defaultValue as T;
    }

    // Parse value based on type
    const value = this.parseValue(config.value, config.type);
    
    // Cache the parsed value
    this.cache.set(cacheKey, value);
    
    return value as T;
  }

  // Get configuration object
  getConfig(key: string): Configuration | undefined {
    return this.configs.get(key);
  }

  // Get all configurations
  getAll(scope?: ConfigScope): Configuration[] {
    let configs = Array.from(this.configs.values());
    
    if (scope) {
      configs = configs.filter(c => c.scope === scope || c.scope === 'global');
    }

    return configs;
  }

  // Update configuration
  update(key: string, value: any): Configuration | undefined {
    const config = this.configs.get(key);
    if (!config) return undefined;

    // Validate new value
    if (config.validation) {
      const validation = this.validate(value, config.validation);
      if (validation !== true) {
        throw new Error(`Configuration validation failed: ${validation}`);
      }
    }

    config.value = value;
    config.updatedAt = new Date();
    this.cache.delete(key);
    
    return config;
  }

  // Delete configuration
  delete(key: string): boolean {
    this.cache.delete(key);
    return this.configs.delete(key);
  }

  // Validate configuration value
  private validate(value: any, validation: ConfigValidation): true | string {
    if (validation.required && (value === null || value === undefined)) {
      return 'Value is required';
    }

    if (validation.min !== undefined && Number(value) < validation.min) {
      return `Value must be at least ${validation.min}`;
    }

    if (validation.max !== undefined && Number(value) > validation.max) {
      return `Value must be at most ${validation.max}`;
    }

    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(String(value))) {
        return `Value does not match pattern: ${validation.pattern}`;
      }
    }

    if (validation.enum && !validation.enum.includes(value)) {
      return `Value must be one of: ${validation.enum.join(', ')}`;
    }

    if (validation.custom) {
      const result = validation.custom(value);
      if (result !== true) {
        return typeof result === 'string' ? result : 'Custom validation failed';
      }
    }

    return true;
  }

  // Parse value based on type
  private parseValue(value: any, type: Configuration['type']): any {
    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'json':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'array':
        return Array.isArray(value) ? value : [value];
      default:
        return value;
    }
  }

  // Get by tag
  getByTag(tag: string): Configuration[] {
    return Array.from(this.configs.values()).filter(
      c => c.tags?.includes(tag)
    );
  }

  // Search configurations
  search(query: string): Configuration[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.configs.values()).filter(
      c =>
        c.key.toLowerCase().includes(lowerQuery) ||
        c.description?.toLowerCase().includes(lowerQuery)
    );
  }

  // Bulk operations
  setMany(configs: Configuration[]): void {
    configs.forEach(config => this.set(config));
  }

  // Export configurations
  export(scope?: ConfigScope): Record<string, any> {
    const configs = this.getAll(scope);
    const exported: Record<string, any> = {};
    
    configs.forEach(config => {
      exported[config.key] = config.value;
    });

    return exported;
  }

  // Import configurations
  import(configs: Record<string, any>, scope: ConfigScope = 'global'): void {
    Object.entries(configs).forEach(([key, value]) => {
      this.set({
        id: `config-${Date.now()}-${Math.random()}`,
        key,
        value,
        type: this.inferType(value),
        scope,
        createdAt: new Date(),
      });
    });
  }

  // Infer type from value
  private inferType(value: any): Configuration['type'] {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    return 'json';
  }

  // Clear cache
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Get configuration with override
  getWithOverride<T = any>(
    key: string,
    override?: T,
    defaultValue?: T
  ): T {
    return override !== undefined ? override : this.get(key, defaultValue);
  }
}

export const configManager = ConfigurationManager.getInstance();
