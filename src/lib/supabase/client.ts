// =====================================================
// AVENTURE-SE — Supabase Client (placeholder)
// Configure suas credenciais em .env.local
// =====================================================

// import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Descomente quando configurar o Supabase:
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Por enquanto, utilizamos o mock data provider em src/lib/store.ts
// Para ativar o Supabase:
// 1. Crie um projeto no https://supabase.com
// 2. Execute o script supabase/schema.sql no SQL Editor
// 3. Copie a URL e Anon Key para .env.local:
//    NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
// 4. Descomente o createClient acima e importe onde necessário

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export { supabaseUrl, supabaseAnonKey };
