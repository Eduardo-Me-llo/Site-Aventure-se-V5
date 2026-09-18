import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { ok: false, error: 'Supabase não está configurado neste ambiente.' },
      { status: 503 },
    );
  }

  try {
    const { error } = await (await createClient())
      .from('profiles')
      .select('user_id')
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'Não foi possível consultar o Supabase.' },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true, service: 'supabase' });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Não foi possível conectar ao Supabase.' },
      { status: 503 },
    );
  }
}