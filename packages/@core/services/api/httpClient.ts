/**
 * HTTP Client
 * @core - Base fetch wrapper with auth injection
 * 
 * Provides Axios-like interface for HTTP calls
 * Uses client registry for auth token - decoupled from specific implementations
 */

import { getSupabase, isSupabaseRegistered } from '../../persistence/clientRegistry';

export interface HttpClientOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Skip auth header injection (for public endpoints) */
  skipAuth?: boolean;
}

/**
 * HTTP client compatible with React Query and contract-generated hooks
 * Handles auth token injection via registered Supabase client
 */
export async function httpClient<T>(config: HttpClientOptions): Promise<T> {
  const { url, method, params, data, headers, signal, skipAuth = false } = config;
  
  // Build URL with query parameters
  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  // Get auth token if Supabase is registered and auth not skipped
  const authHeaders: Record<string, string> = {};
  if (!skipAuth && isSupabaseRegistered()) {
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch {
      // Silently continue without auth header
    }
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
