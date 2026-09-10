'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, FileText, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

type FormErrors = Partial<Record<'name' | 'email' | 'phone' | 'cpf' | 'password' | 'confirmPassword' | 'terms', string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const normalizedName = formData.name.trim();
    const normalizedEmail = formData.email.trim();
    const phoneDigits = formData.phone.replace(/\D/g, '');
    const cpfDigits = formData.cpf.replace(/\D/g, '');

    if (normalizedName.length < 3 || normalizedName.split(/\s+/).length < 2) nextErrors.name = 'Informe nome e sobrenome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) nextErrors.email = 'Informe um e-mail válido.';
    if (phoneDigits.length !== 10 && phoneDigits.length !== 11) nextErrors.phone = 'Informe um telefone válido com DDD.';
    if (cpfDigits.length !== 11 || /^([0-9])\1+$/.test(cpfDigits) || !isValidCpf(cpfDigits)) nextErrors.cpf = 'Informe um CPF válido.';
    if (formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password) || !/[^A-Za-z0-9]/.test(formData.password)) {
      nextErrors.password = 'Use 8+ caracteres, uma letra maiúscula, um número e um símbolo.';
    }
    if (formData.confirmPassword !== formData.password) nextErrors.confirmPassword = 'As senhas não conferem.';
    if (!formData.terms) nextErrors.terms = 'Aceite os termos para continuar.';

    return nextErrors;
  };

  const isValidCpf = (cpf: string) => {
    let sum = 0;
    for (let index = 0; index < 9; index += 1) sum += Number(cpf[index]) * (10 - index);
    let digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
    if (digit !== Number(cpf[9])) return false;

    sum = 0;
    for (let index = 0; index < 10; index += 1) sum += Number(cpf[index]) * (11 - index);
    digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
    return digit === Number(cpf[10]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!isSupabaseConfigured) {
      setFeedback('O cadastro será liberado após a configuração do Supabase em .env.local.');
      return;
    }

    setIsSubmitting(true);
    setFeedback('');
    try {
      const { data, error } = await createClient().auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
          data: {
            full_name: formData.name.trim(),
            phone: formData.phone.trim(),
            document: formData.cpf.trim(),
          },
        },
      });

      if (error) {
        setFeedback(error.message);
        return;
      }

      if (data.session) {
        router.replace('/profile');
        router.refresh();
        return;
      }

      setFeedback('Confira seu e-mail para confirmar a conta antes de entrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = () => {
    const pw = formData.password;
    if (!pw) return 0;
    let score = 0;
    if (pw.length > 7) score += 25;
    if (pw.match(/[A-Z]/)) score += 25;
    if (pw.match(/[0-9]/)) score += 25;
    if (pw.match(/[^A-Za-z0-9]/)) score += 25;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthColor = strength === 0 ? 'bg-zinc-700' : strength <= 25 ? 'bg-red-500' : strength <= 50 ? 'bg-yellow-500' : strength <= 75 ? 'bg-blue-400' : 'bg-blue-500';

  return (
    <div className="min-h-screen bg-adventure-dark flex flex-col items-center justify-center relative p-4 py-12 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-4 group" aria-label="Aventure-se">
            <BrandLogo className="h-24 w-56 transition-transform group-hover:scale-105" priority />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Crie sua conta de aventureiro</h1>
          <p className="text-slate-700">Junte-se a milhares de exploradores</p>
        </div>

        <div className="bg-adventure-card/80 backdrop-blur-xl border border-neutral-300 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700 pl-1">Nome completo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-adventure-card border border-neutral-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                    placeholder="João da Silva"
                    required
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700 pl-1">E-mail</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-adventure-card border border-neutral-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                    placeholder="seu@email.com"
                    required
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 pl-1">Telefone</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-adventure-card border border-neutral-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                    placeholder="(11) 99999-9999"
                    required
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 pl-1">CPF</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <FileText className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-adventure-card border border-neutral-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                    placeholder="000.000.000-00"
                    required
                  />
                  {errors.cpf && <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>}
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700 pl-1">Senha</label>
                <div className="relative group mb-2">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-12 py-3 bg-adventure-card border border-neutral-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                {/* Força da senha */}
                <div className="flex gap-1 h-1.5 w-full bg-neutral-200/40 rounded-full overflow-hidden mt-2">
                  <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${Math.max(strength, 0)}%` }}></div>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700 pl-1">Confirmar senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Shield className="h-5 w-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-12 py-3 bg-adventure-card border border-neutral-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                    placeholder="Repita a senha"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex items-start pl-1 pt-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 rounded border-neutral-300 bg-adventure-card text-blue-500 focus:ring-blue-500/50 focus:ring-offset-adventure-dark"
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-slate-700">
                Aceito os <Link href="/termos" className="text-blue-400 hover:underline">termos de uso</Link> e <Link href="/privacidade" className="text-blue-400 hover:underline">política de privacidade</Link>
              </label>
            </div>
            {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-white font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-adventure-dark transition-all shadow-lg shadow-blue-900/30 mt-2"
            >
              {isSubmitting ? 'Criando conta...' : 'Seja aventureiro'} {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {feedback && <p role="status" className="mt-4 text-center text-sm text-blue-400">{feedback}</p>}

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-adventure-card text-slate-700">ou</span>
            </div>
          </div>

          <div className="mt-6">
            <button type="button" disabled className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-neutral-300 rounded-xl bg-adventure-card/80 text-slate-500 font-medium cursor-not-allowed shadow-sm">
              Cadastro com Google em breve
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-700">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
