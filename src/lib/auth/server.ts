import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
};

export const getAuthenticatedUser = cache(async (): Promise<AuthenticatedUser | null> => {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !claimsData || !userId) return null;

  const { data: profileWithStatus, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, role, status')
    .eq('user_id', userId)
    .maybeSingle();

  let profile = profileWithStatus;
  if (profileError) {
    const fallback = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('user_id', userId)
      .maybeSingle();
    if (fallback.error || !fallback.data) return null;
    profile = { ...fallback.data, status: 'active' };
  }
  if (!profile || profile.status === 'blocked') return null;

  return {
    id: userId,
    email: (claimsData.claims.email as string | undefined) ?? '',
    fullName: profile.full_name,
    role: profile.role === 'admin' ? 'admin' : 'user',
  };
});

export async function requireAdmin(): Promise<AuthenticatedUser> {
  if (!isSupabaseConfigured) {
    redirect('/auth/login?error=supabase-not-configured');
  }

  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'admin') {
    redirect('/auth/login?error=admin-required');
  }

  return user;
}
