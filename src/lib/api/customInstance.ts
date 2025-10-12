/**
 * Custom Instance for Contract Clients
 * Phase 12: API Client Standardization
 * 
 * Axios-like interface for contract-generated hooks
 */

import { supabase } from '@/integrations/supabase/client';

export interface CustomInstanceOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Custom fetch instance compatible with contract-generated hooks
 * Provides Axios-like interface for edge function calls
 */
export async function customInstance<T>(config: CustomInstanceOptions): Promise<T> {
  const { url, method, params, data, headers, signal } = config;
  
  // Build URL with query parameters
  let fullUrl = url;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
  }

  // Get auth token for edge function calls
  const { data: { session } } = await supabase.auth.getSession();
  const authHeaders: Record<string, string> = {};
  if (session?.access_token) {
    authHeaders['Authorization'] = `Bearer ${session.access_token}`;
  }

  // Make request
  const response = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: response.statusText 
    }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
