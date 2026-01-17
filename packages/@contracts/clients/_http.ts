/**
 * Lightweight fetch wrapper with JSON + error handling
 * Used by generated React Query hooks
 * 
 * Now depends on @core/services/api for httpClient
 */

import { httpClient } from '../../@core/services/api/httpClient';

export type HttpOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiFetch<T>(url: string, opts: HttpOptions = {}): Promise<T> {
  return httpClient<T>({
    url,
    method: opts.method || 'GET',
    params: opts.query,
    data: opts.body,
    headers: opts.headers,
    signal: opts.signal,
  });
}
