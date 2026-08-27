'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { loginAsAdmin, loginAsUser } from '@/lib/store';
import { BrandLogo } from '@/components/brand-logo';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('aventurese_remembered_email') || '' : '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => typeof window !== 'undefined' && !!localStorage.getItem('aventurese_remembered_email'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleUserLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedback('');
    setIsSubmitting(true);
    if (rememberMe) {
      localStorage.setItem('aventurese_remembered_email', email.trim());
    } else {
      localStorage.removeItem('aventurese_remembered_email');
    }
    loginAsUser('Aventureiro Local', email || 'user@aventurese.com.br');
    router.push('/');
  };

  const handleForgotPassword = () => {
    setFeedback(email.trim()
      ? `A recuperação para ${email.trim()} será habilitada quando o Supabase estiver conectado.`
      : 'Informe seu e-mail. A recuperação será habilitada quando o Supabase estiver conectado.');
  };

  const handleAdminLogin = () => {
    loginAsAdmin();
    router.push('/admin');
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

            <div className="flex items-center pl-1">
              <input id="remember" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 bg-adventure-card text-blue-500 focus:ring-blue-500/50 focus:ring-offset-adventure-dark" />
              <label htmlFor="remember" className="ml-2 block text-sm text-slate-700">Lembrar de mim</label>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-white font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-70 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-adventure-dark transition-all shadow-lg shadow-blue-900/30">
              {isSubmitting ? 'Entrando...' : 'Entrar'} {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {feedback && <p role="status" className="mt-4 text-center text-sm text-blue-300">{feedback}</p>}

          <div className="mt-6 relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-300" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-adventure-card text-slate-700">ou</span></div></div>

          <button type="button" disabled className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-4 border border-neutral-300 rounded-xl bg-transparent text-slate-500 font-medium cursor-not-allowed opacity-70" title="Login social será habilitado com o Supabase">Entrar com Google (em breve)</button>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-slate-700">Não tem conta? <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Cadastre-se</Link></p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button onClick={handleAdminLogin} className="text-slate-700 hover:text-slate-900 transition-colors bg-adventure-card/50 px-3 py-1.5 rounded-full border border-neutral-300">Acessar como Admin</button>
            <button onClick={() => handleUserLogin()} className="text-slate-700 hover:text-slate-900 transition-colors bg-adventure-card/50 px-3 py-1.5 rounded-full border border-neutral-300 flex items-center gap-1"><User className="w-3 h-3" /> Acessar como Aventureiro</button>
          </div>
        </div>
      </div>
    </div>
  );
}
