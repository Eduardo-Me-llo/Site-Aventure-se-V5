const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseConfig() {
  if (!supabaseUrl || !supabasePublishableKey) return null;

  return {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
  };
}

export const isSupabaseConfigured = Boolean(getSupabaseConfig());
