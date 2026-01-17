/**
 * Client Registry
 * @core - Bring-your-own-client pattern
 * 
 * Allows @core to remain decoupled from specific implementations
 * Wire in app bootstrap (main.tsx) before using any @core services
 */

// Use a generic type to accept any Supabase client shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any;

let supabaseClient: AnySupabaseClient = null;

/**
 * Register the Supabase client instance
 * Call this in app bootstrap before using any services
 */
export function registerSupabase(client: AnySupabaseClient): void {
  supabaseClient = client;
}

/**
 * Get the registered Supabase client
 * Throws if not registered
 */
export function getSupabase<T = AnySupabaseClient>(): T {
  if (!supabaseClient) {
    throw new Error(
      'Supabase client not registered. Call registerSupabase() in app bootstrap (main.tsx) before using @core services.'
    );
  }
  return supabaseClient as T;
}

/**
 * Check if Supabase client is registered
 */
export function isSupabaseRegistered(): boolean {
  return supabaseClient !== null;
}
