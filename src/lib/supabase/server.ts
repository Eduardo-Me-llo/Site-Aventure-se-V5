import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from '@/lib/supabase/config';

/** Creates a request-scoped Supabase client for Server Components and Route Handlers. */
export async function createClient() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error('Supabase não está configurado.');
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. proxy.ts refreshes sessions instead.
        }
      },
    },
  });
}
