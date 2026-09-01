'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      setMessage('A nova senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('As senhas não conferem.');
      return;
    }
    if (!isSupabaseConfigured) {
      setMessage('O Supabase ainda não está configurado.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await createClient().auth.updateUser({ password });
    setMessage(error ? error.message : 'Senha atualizada. Você já pode entrar na sua conta.');
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-adventure-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-300 bg-adventure-card/80 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Definir nova senha</h1>
        <p className="mt-2 text-slate-700">Escolha uma senha segura para continuar.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Nova senha
            <span className="relative mt-1 block">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input className="w-full rounded-xl border border-neutral-300 bg-white py-3 pl-10 pr-4 text-slate-900" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </span>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Confirmar nova senha
            <input className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-slate-900" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </label>
          <button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white disabled:opacity-70" type="submit">
            {isSubmitting ? 'Salvando...' : 'Salvar nova senha'} {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
        {message && <p role="status" className="mt-4 text-sm text-blue-400">{message}</p>}
        <Link className="mt-6 inline-block text-sm text-blue-400 hover:text-blue-300" href="/auth/login">Voltar ao login</Link>
      </div>
    </main>
  );
}
