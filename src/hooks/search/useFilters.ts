/**
 * Filters Hook
 * Phase 26: Advanced Search & Filtering System
 * 
 * React hook for managing filters
 */

import { useState, useCallback } from 'react';
import { SearchFilter, FilterGroup } from '@/lib/search/types';
import { filterManager } from '@/lib/search';

export function useFilters() {
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

  // Add filter
  const addFilter = useCallback((filter: SearchFilter) => {
    setActiveFilters(prev => [...prev, filter]);
  }, []);

  // Remove filter
  const removeFilter = useCallback((index: number) => {
    setActiveFilters(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Update filter
  const updateFilter = useCallback((index: number, updates: Partial<SearchFilter>) => {
    setActiveFilters(prev => 
      prev.map((filter, i) => i === index ? { ...filter, ...updates } : filter)
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Create filter group
  const createGroup = useCallback((name: string, operator: 'AND' | 'OR' = 'AND') => {
    const groupId = filterManager.createGroup(name, operator);
    setFilterGroups(filterManager.getAllGroups());
    return groupId;
  }, []);

  // Add filter to group
  const addToGroup = useCallback((groupId: string, filter: SearchFilter) => {
    filterManager.addToGroup(groupId, filter);
    setFilterGroups(filterManager.getAllGroups());
  }, []);

  // Remove filter from group
  const removeFromGroup = useCallback((groupId: string, filterIndex: number) => {
    filterManager.removeFromGroup(groupId, filterIndex);
    setFilterGroups(filterManager.getAllGroups());
  }, []);

  // Delete group
  const deleteGroup = useCallback((groupId: string) => {
    filterManager.deleteGroup(groupId);
    setFilterGroups(filterManager.getAllGroups());
  }, []);

  return {
    activeFilters,
    filterGroups,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    createGroup,
    addToGroup,
    removeFromGroup,
    deleteGroup,
  };
}
