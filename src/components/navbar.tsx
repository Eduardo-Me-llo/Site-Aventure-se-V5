'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogIn } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-2.5 sm:py-4' : 'bg-transparent py-3 sm:py-6'
      }`}
    >
      <div className="container mx-auto px-3 sm:px-6 md:px-12 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center group" aria-label="Aventure-se">
          <BrandLogo className="h-10 w-28 sm:h-14 sm:w-36 transition-transform group-hover:scale-105" priority />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#trips-section" className="text-slate-900 hover:text-blue-500 transition-colors text-sm font-medium tracking-wide">
            Próximos Destinos
          </Link>
          <Link href="/sobre" className={`transition-colors text-sm font-medium tracking-wide ${pathname === '/sobre' ? 'text-blue-600' : 'text-slate-900 hover:text-blue-500'}`}>
            Sobre nós
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-slate-900 hover:text-blue-500 transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-adventure-card/40"
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </Link>
          <Link
            href="#reservar"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium text-sm hover:shadow-[0_0_20px_rgba(15,131,247,0.25)] transition-all transform hover:-translate-y-0.5"
          >
            Reservar Agora
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden flex h-9 w-9 items-center justify-center text-slate-900 hover:text-blue-500 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden absolute top-full left-0 w-full glass-card border-t-0 rounded-t-none transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[400px] py-4' : 'max-h-0 py-0'
        }`}
      >
        <div className="flex flex-col px-6 gap-4">
            <Link
              href="/#trips-section"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-900 hover:text-blue-500 py-2 border-b border-neutral-300/10"
            >
            Próximos Destinos
          </Link>
          <Link
            href="/sobre"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`py-2 border-b border-white/10 ${pathname === '/sobre' ? 'text-blue-600' : 'text-slate-900 hover:text-blue-500'}`}
          >
            Sobre nós
          </Link>
          
          <div className="flex flex-col gap-3 mt-2">
            <Link
              href="/auth/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-neutral-300/10 text-slate-900"
            >
              <User className="w-4 h-4" />
              Entrar
            </Link>
            <Link
              href="#reservar"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium"
            >
              Reservar Agora
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
