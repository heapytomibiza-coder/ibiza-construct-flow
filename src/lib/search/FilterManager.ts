/**
 * Filter Manager
 * Phase 26: Advanced Search & Filtering System
 * 
 * Advanced filtering and faceting
 */

import { SearchFilter, FilterGroup, SearchFacets, SearchableItem } from './types';

export class FilterManager {
  private filterGroups: Map<string, FilterGroup> = new Map();

  /**
   * Create filter group
   */
  createGroup(name: string, operator: 'AND' | 'OR' = 'AND'): string {
    const id = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.filterGroups.set(id, {
      id,
      name,
      filters: [],
      operator,
    });
    return id;
  }

  /**
   * Add filter to group
   */
  addToGroup(groupId: string, filter: SearchFilter): void {
    const group = this.filterGroups.get(groupId);
    if (group) {
      group.filters.push(filter);
    }
  }

  /**
   * Remove filter from group
   */
  removeFromGroup(groupId: string, filterIndex: number): void {
    const group = this.filterGroups.get(groupId);
    if (group && group.filters[filterIndex]) {
      group.filters.splice(filterIndex, 1);
    }
  }

  /**
   * Get filter group
   */
  getGroup(groupId: string): FilterGroup | undefined {
    return this.filterGroups.get(groupId);
  }

  /**
   * Get all groups
   */
  getAllGroups(): FilterGroup[] {
    return Array.from(this.filterGroups.values());
  }

  /**
   * Delete group
   */
  deleteGroup(groupId: string): void {
    this.filterGroups.delete(groupId);
  }

  /**
   * Apply filters to items
   */
  applyFilters(items: SearchableItem[], filters: SearchFilter[]): SearchableItem[] {
    return items.filter(item => this.matchesFilters(item, filters));
  }

  /**
   * Apply filter groups to items
   */
  applyGroups(items: SearchableItem[], groupIds: string[]): SearchableItem[] {
    return items.filter(item => {
      return groupIds.every(groupId => {
        const group = this.filterGroups.get(groupId);
        if (!group) return true;

        if (group.operator === 'AND') {
          return group.filters.every(filter => this.matchesFilter(item, filter));
        } else {
          return group.filters.some(filter => this.matchesFilter(item, filter));
        }
      });
    });
  }

  /**
   * Generate facets from items
   */
  generateFacets(items: SearchableItem[], fields: string[]): SearchFacets {
    const facets: SearchFacets = {};

    fields.forEach(field => {
      const valueCounts = new Map<any, number>();

      items.forEach(item => {
        const value = this.getFieldValue(item, field);
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => {
              valueCounts.set(v, (valueCounts.get(v) || 0) + 1);
            });
          } else {
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
          }
        }
      });

      facets[field] = Array.from(valueCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
    });

    return facets;
  }

  /**
   * Check if item matches all filters
   */
  private matchesFilters(item: SearchableItem, filters: SearchFilter[]): boolean {
    return filters.every(filter => this.matchesFilter(item, filter));
  }

  /**
   * Check if item matches a filter
   */
  private matchesFilter(item: SearchableItem, filter: SearchFilter): boolean {
    const value = this.getFieldValue(item, filter.field);
    return this.compareValues(value, filter.operator, filter.value);
  }

  /**
   * Get field value from item
   */
  private getFieldValue(item: SearchableItem, field: string): any {
    if (field.includes('.')) {
      const parts = field.split('.');
      let value: any = item;
      for (const part of parts) {
        value = value?.[part];
      }
      return value;
    }
    return (item as any)[field];
  }

  /**
   * Compare values with operator
   */
  private compareValues(itemValue: any, operator: string, filterValue: any): boolean {
    switch (operator) {
      case 'eq': return itemValue === filterValue;
      case 'ne': return itemValue !== filterValue;
      case 'gt': return itemValue > filterValue;
      case 'gte': return itemValue >= filterValue;
      case 'lt': return itemValue < filterValue;
      case 'lte': return itemValue <= filterValue;
      case 'in': return Array.isArray(filterValue) && filterValue.includes(itemValue);
      case 'nin': return Array.isArray(filterValue) && !filterValue.includes(itemValue);
      case 'contains':
        return typeof itemValue === 'string' &&
               itemValue.toLowerCase().includes(String(filterValue).toLowerCase());
      case 'startsWith':
        return typeof itemValue === 'string' &&
               itemValue.toLowerCase().startsWith(String(filterValue).toLowerCase());
      case 'endsWith':
        return typeof itemValue === 'string' &&
               itemValue.toLowerCase().endsWith(String(filterValue).toLowerCase());
      case 'between':
        return Array.isArray(filterValue) &&
               itemValue >= filterValue[0] &&
               itemValue <= filterValue[1];
      default: return false;
    }
  }

  /**
   * Clear all groups
   */
  clear(): void {
    this.filterGroups.clear();
  }
}

// Global filter manager instance
export const filterManager = new FilterManager();
