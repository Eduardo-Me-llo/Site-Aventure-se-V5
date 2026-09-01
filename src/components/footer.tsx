import Link from 'next/link';
import { Camera, Video, Share2, Mail, Phone } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';

export function Footer() {
  return (
    <footer className="bg-adventure-dark text-slate-900 relative pt-16 pb-8 border-t border-neutral-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400"></div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center text-slate-900" aria-label="Aventure-se">
              <BrandLogo className="h-16 w-44" />
            </Link>
            <p className="text-slate-700 text-sm leading-relaxed">
              Transformando a maneira como você explora o mundo. Viagens de aventura premium para destinos inesquecíveis.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="h-10 w-10 rounded-full bg-adventure-card/60 flex items-center justify-center hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                <Camera className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-adventure-card/60 flex items-center justify-center hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                <Video className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-adventure-card/60 flex items-center justify-center hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Destinos */}
          <div className="flex flex-col gap-4">
            <h3 className="text-slate-900 font-semibold text-lg">Destinos</h3>
            <ul className="flex flex-col gap-3 text-sm">
                            <li><Link href="/#trips-section" className="hover:text-blue-400 transition-colors">São Tomé das Letras, Minas Gerais</Link></li>
              <li><Link href="/#trips-section" className="hover:text-blue-400 transition-colors">Palmas, Ilha Grande, Rio de Janeiro</Link></li>
              <li><Link href="/#trips-section" className="hover:text-blue-400 transition-colors">Prumirim, Ubatuba, Rio de Janeiro</Link></li>
              <li><Link href="/#trips-section" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">Ver todos os destinos &rarr;</Link></li>
            </ul>
          </div>

          {/* Empresa */}
          <div className="flex flex-col gap-4">
            <h3 className="text-slate-900 font-semibold text-lg">Empresa</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/sobre" className="hover:text-blue-400 transition-colors">Sobre Nós</Link></li>
              <li><Link href="/faq" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
              <li><Link href="/contato" className="hover:text-blue-400 transition-colors">Contato</Link></li>
            </ul>
          </div>

          {/* Newsletter / Contato */}
          <div className="flex flex-col gap-4">
            
            <p className="text-slate-400 text-sm">
              Receba novidades e ofertas exclusivas.
            </p>
            <form className="flex flex-col gap-2">
              <input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                className="bg-adventure-card border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 placeholder:text-slate-500"
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
              >
                Inscrever-se
              </button>
            </form>
            <div className="flex flex-col gap-2 mt-4 text-sm">
              <a href="mailto:contato@aventure-se.com.br" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Mail className="h-4 w-4" /> contato@aventure-se.com.br
              </a>
              <a href="tel:+5521977167373" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Phone className="h-4 w-4" /> (21) 97716-7373
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
          <div className="border-t border-neutral-300 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; 2026 Aventure-se. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="font-medium px-2 py-1 bg-adventure-card/80 text-slate-700 rounded border border-neutral-300">CADASTUR</span>
            <span>Agência de Turismo Registrada</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
