'use client';

import { useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function TermsPage() {
  const [terms, setTerms] = useState('Carregando termo de compromisso...');

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void createClient().from('site_settings').select('value').eq('key', 'commitment_terms').maybeSingle()
      .then(({ data }) => setTerms(data?.value || 'O termo de compromisso ainda não foi publicado.'));
  }, []);

  return <main className="min-h-screen bg-adventure-dark px-6 pb-20 pt-32 text-slate-900"><article className="mx-auto max-w-3xl"><h1 className="text-4xl font-bold">Termo de compromisso</h1><div className="mt-8 whitespace-pre-wrap rounded-2xl border border-neutral-300 bg-white p-6 leading-relaxed text-slate-700">{terms}</div></article></main>;
}
