/**
 * Lightweight fetch wrapper with JSON + error handling
 * Used by generated React Query hooks
 */

import { customInstance } from '@/lib/api';

export type HttpOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiFetch<T>(url: string, opts: HttpOptions = {}): Promise<T> {
  return customInstance<T>({
    url,
    method: opts.method || 'GET',
    params: opts.query,
    data: opts.body,
    headers: opts.headers,
    signal: opts.signal,
  });
}
