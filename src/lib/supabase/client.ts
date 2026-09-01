import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/lib/supabase/config';

let browserClient: SupabaseClient | undefined;

/**
 * Returns the browser Supabase client used only by Client Components.
 * Authentication tokens are stored as cookies so the server can verify them.
 */
export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const config = getSupabaseConfig();
  if (!config) {
    throw new Error('Supabase não está configurado. Adicione as variáveis de ambiente em .env.local.');
  }

  browserClient = createBrowserClient(config.url, config.publishableKey);
  return browserClient;
}

export { isSupabaseConfigured } from '@/lib/supabase/config';
