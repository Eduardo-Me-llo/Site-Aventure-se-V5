import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/auth/server';

export async function POST(request: Request) {
  const admin = await getAuthenticatedUser();
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null) as { email?: string; password?: string; fullName?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const fullName = body?.fullName?.trim() || '';
  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Informe e-mail e senha com pelo menos 8 caracteres.' }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
  if (error || !data.user) return NextResponse.json({ error: error?.message || 'Não foi possível criar o administrador.' }, { status: 400 });

  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({ user_id: data.user.id, full_name: fullName, role: 'admin', status: 'active' });
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
