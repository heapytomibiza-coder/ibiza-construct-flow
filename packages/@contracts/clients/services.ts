/**
 * Services API React Query Hooks
 * Auto-generated type-safe hooks for service micro management
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './_http';

// Types matching contracts/src/services.zod.ts
export interface Question {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multi' | 'file' | 'date' | 'boolean';
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  showIf?: { questionId: string; equals: string | number | boolean };
  priceImpact?: number;
}

export interface ServiceMicro {
  id: string;
  category: string;
  subcategory: string;
  micro: string;
  questions_micro: Question[];
  questions_logistics: Question[];
}

export interface GetServiceMicrosResponse {
  data: ServiceMicro[];
}

export interface GetServiceMicroByIdResponse {
  data: ServiceMicro;
}

export interface GetServicesByCategoryResponse {
  data: ServiceMicro[];
}

export interface GetCategoriesResponse {
  data: string[];
}

export interface GetSubcategoriesResponse {
  data: string[];
}

// Query Keys Factory
export const servicesKeys = {
  all: ['services'] as const,
  micros: () => [...servicesKeys.all, 'micros'] as const,
  micro: (id: string) => [...servicesKeys.all, 'micro', id] as const,
  categories: () => [...servicesKeys.all, 'categories'] as const,
  subcategories: (category: string) => [...servicesKeys.all, 'subcategories', category] as const,
  byCategory: (category: string) => [...servicesKeys.all, 'byCategory', category] as const,
};

// Hooks

/**
 * Get all service micros
 */
export const useGetServiceMicros = () => {
  return useQuery({
    queryKey: servicesKeys.micros(),
    queryFn: () => apiFetch<GetServiceMicrosResponse>('/api/services/micros', { method: 'GET' }),
  });
};

/**
 * Get a single service micro by ID
 */
export const useGetServiceMicroById = (id: string) => {
  return useQuery({
    queryKey: servicesKeys.micro(id),
    queryFn: () => apiFetch<GetServiceMicroByIdResponse>(`/api/services/micros/${id}`, { method: 'GET' }),
    enabled: !!id,
  });
};

/**
 * Get services by category
 */
export const useGetServicesByCategory = (category: string) => {
  return useQuery({
    queryKey: servicesKeys.byCategory(category),
    queryFn: () => apiFetch<GetServicesByCategoryResponse>(`/api/services/category/${category}`, { method: 'GET' }),
    enabled: !!category,
  });
};

/**
 * Get all categories
 */
export const useGetCategories = () => {
  return useQuery({
    queryKey: servicesKeys.categories(),
    queryFn: () => apiFetch<GetCategoriesResponse>('/api/services/categories', { method: 'GET' }),
  });
};

/**
 * Get subcategories for a category
 */
export const useGetSubcategories = (category: string) => {
  return useQuery({
    queryKey: servicesKeys.subcategories(category),
    queryFn: () => apiFetch<GetSubcategoriesResponse>(`/api/services/categories/${category}/subcategories`, { method: 'GET' }),
    enabled: !!category,
  });
};
