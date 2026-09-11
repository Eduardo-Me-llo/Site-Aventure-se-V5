'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleUserLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedback('');
    if (!isSupabaseConfigured) {
      setFeedback('A autenticação ainda não foi configurada. Adicione as credenciais do Supabase em .env.local.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await createClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setFeedback(error.message);
        return;
      }

      const next = searchParams.get('next');
      const safeNext = next?.startsWith('/') ? next : '/profile';
      router.replace(safeNext);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setFeedback('Informe seu e-mail para receber o link de recuperação.');
      return;
    }
    if (!isSupabaseConfigured) {
      setFeedback('A recuperação de senha exige a configuração do Supabase.');
      return;
    }

    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
    setFeedback(error ? error.message : 'Enviamos um link de recuperação para seu e-mail.');
  };

  return (
    <div className="min-h-screen bg-adventure-dark flex flex-col items-center justify-center relative p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-6 group" aria-label="Aventure-se">
            <BrandLogo className="h-24 w-56 transition-transform group-hover:scale-105" priority />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo de volta!</h1>
          <p className="text-slate-700">Entre na sua conta para continuar</p>
        </div>

        <div className="bg-adventure-card/80 backdrop-blur-xl border border-neutral-300 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleUserLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 pl-1" htmlFor="email">E-mail</label>
              <div className="relative group">
                <Mail className="absolute inset-y-0 left-0 my-auto ml-4 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setFeedback(''); }} className="block w-full pl-11 pr-4 py-3 bg-adventure-card border border-neutral-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none" placeholder="seu@email.com" autoComplete="email" required />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between pl-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">Senha</label>
                <button type="button" onClick={handleForgotPassword} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Esqueci minha senha</button>
              </div>
              <div className="relative group">
                <Lock className="absolute inset-y-0 left-0 my-auto ml-4 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-11 pr-12 py-3 bg-adventure-card border border-neutral-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none" placeholder="••••••••" autoComplete="current-password" required />
                <button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-white font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-70 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-adventure-dark transition-all shadow-lg shadow-blue-900/30">
              {isSubmitting ? 'Entrando...' : 'Entrar'} {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {feedback && <p role="status" className="mt-4 text-center text-sm text-blue-300">{feedback}</p>}

        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-slate-700">Não tem conta? <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Cadastre-se</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen bg-adventure-dark" />}><LoginForm /></Suspense>;
}
