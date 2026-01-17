/**
 * Client Registry
 * @core - Bring-your-own-client pattern
 * 
 * Allows @core to remain decoupled from specific implementations
 * Wire in app bootstrap (main.tsx) before using any @core services
 */

type SupabaseClient = {
  auth: {
    getSession: () => Promise<{ data: { session: { access_token: string } | null } }>;
  };
  [key: string]: unknown;
};

let supabaseClient: SupabaseClient | null = null;

/**
 * Register the Supabase client instance
 * Call this in app bootstrap before using any services
 */
export function registerSupabase(client: SupabaseClient): void {
  supabaseClient = client;
}

/**
 * Get the registered Supabase client
 * Throws if not registered
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error(
      'Supabase client not registered. Call registerSupabase() in app bootstrap (main.tsx) before using @core services.'
    );
  }
  return supabaseClient;
}

/**
 * Check if Supabase client is registered
 */
export function isSupabaseRegistered(): boolean {
  return supabaseClient !== null;
}
