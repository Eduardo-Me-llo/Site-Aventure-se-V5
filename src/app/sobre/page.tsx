'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Heart, Mountain, Shield, Users } from 'lucide-react';

const team = [
  {
    name: 'Marina Costa',
    role: 'Fundadora e Diretora de Experiências',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85',
    bio: 'Transforma roteiros em experiências acolhedoras, autênticas e cheias de significado.'
  },
  {
    name: 'Rafael Mendes',
    role: 'Coordenador de Operações',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85',
    bio: 'Cuida de cada detalhe para que a jornada seja fluida, segura e inesquecível.'
  },
  {
    name: 'Clara Almeida',
    role: 'Guia e Especialista em Natureza',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85',
    bio: 'Conecta pessoas à natureza com conhecimento, leveza e respeito por cada destino.'
  }
];

export default function AboutPage() {
  const [activeMember, setActiveMember] = useState(0);
  const member = team[activeMember];

  return (
    <main className="min-h-screen bg-adventure-dark text-slate-900 pt-24">
      <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-sm font-semibold"> <Mountain className="w-4 h-4" /> Nossa história</span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mt-6 mb-6">Viajar é encontrar novas versões de si.</h1>
            <p className="text-xl leading-relaxed text-slate-700 max-w-xl">O Aventure-se nasceu para aproximar pessoas de paisagens extraordinárias e criar viagens em grupo com cuidado, liberdade e boas histórias para contar.</p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/#trips-section" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors">Explorar viagens <ArrowRight className="w-4 h-4" /></Link>
              <Link href="/auth/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-neutral-300 text-slate-900 font-semibold hover:bg-adventure-card transition-colors">Fazer parte</Link>
            </div>
          </div>
          <div className="relative min-h-[420px] rounded-[2rem] overflow-hidden border border-neutral-300 shadow-xl">
            <img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=85" alt="Grupo de viajantes em uma paisagem natural" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 text-white text-lg font-medium">Pequenos grupos, grandes descobertas.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-300/70 bg-adventure-card/40 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[{ icon: Compass, title: 'Curadoria com alma', text: 'Roteiros escolhidos para equilibrar aventura, conforto e tempo para viver o lugar.' }, { icon: Shield, title: 'Cuidado em cada etapa', text: 'Operação transparente e atenção às pessoas, do primeiro contato ao retorno.' }, { icon: Heart, title: 'Conexões reais', text: 'Experiências que aproximam viajantes, comunidades locais e a natureza.' }].map(({ icon: Icon, title, text }) => <article key={title} className="p-6 rounded-2xl bg-adventure-card border border-neutral-300"><Icon className="w-7 h-7 text-blue-500 mb-4" /><h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2><p className="text-slate-700 leading-relaxed">{text}</p></article>)}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"><div><p className="text-blue-600 font-semibold uppercase tracking-wider text-sm">Quem faz acontecer</p><h2 className="text-4xl font-bold text-slate-900 mt-2">Uma equipe que vai com você</h2></div><p className="text-slate-700 max-w-md">Estas informações são demonstrativas e poderão ser atualizadas pelo administrador quando o conteúdo real estiver definido.</p></div>
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-stretch">
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
              {team.map((person, index) => <button key={person.name} onClick={() => setActiveMember(index)} className={`flex items-center gap-3 text-left p-3 rounded-xl border transition-colors ${activeMember === index ? 'bg-blue-500/10 border-blue-500/40' : 'bg-adventure-card/50 border-neutral-300 hover:border-blue-500/30'}`}><img src={person.image} alt="" className="w-12 h-12 rounded-full object-cover" /><span className="hidden sm:block lg:block"><strong className="block text-slate-900">{person.name}</strong><small className="text-slate-600">{person.role}</small></span></button>)}
            </div>
            <article className="grid md:grid-cols-2 bg-adventure-card rounded-2xl overflow-hidden border border-neutral-300"><img src={member.image} alt={member.name} className="w-full h-full min-h-[300px] object-cover" /><div className="p-8 flex flex-col justify-center"><Users className="w-8 h-8 text-blue-500 mb-6" /><h3 className="text-3xl font-bold text-slate-900">{member.name}</h3><p className="text-blue-600 font-semibold mt-2">{member.role}</p><p className="text-slate-700 leading-relaxed mt-6">{member.bio}</p></div></article>
          </div>
        </div>
      </section>
    </main>
  );
}
