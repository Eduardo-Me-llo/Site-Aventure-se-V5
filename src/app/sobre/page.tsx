'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Heart, Mountain, Shield, Users, Sparkles, MapPinned, Route } from 'lucide-react';

const team = [
  {
    name: 'Victor Max Mello',
    role: 'Fundadora e Diretor de Experiências',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85',
    bio: 'Transforma roteiros em experiências acolhedoras, autênticas e cheias de significado.'
  },
  {
    name: 'Carine',
    role: 'Coordenador de Operações',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85',
    bio: 'Cuida de cada detalhe para que a jornada seja fluida, segura e inesquecível.'
  },
  {
    name: 'teste123',
    role: 'Guia e Especialista em Natureza',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85',
    bio: 'Conecta pessoas à natureza com conhecimento, leveza e respeito por cada destino.'
  }
];

const values = [
  { icon: Compass, title: 'Curadoria com alma', text: 'Roteiros pensados para equilibrar aventura, conforto e tempo para viver cada destino.' },
  { icon: Shield, title: 'Cuidado em cada etapa', text: 'A operação é desenhada para deixar cada passo claro, seguro e acolhedor.' },
  { icon: Heart, title: 'Conexões reais', text: 'Criamos experiências em grupo que aproximam pessoas, comunidades e a natureza.' },
];

const journeySteps = [
  'Escolhemos destinos com identidade, clima e beleza genuína.',
  'Organizamos cada detalhe para que a experiência seja tranquila antes e durante a viagem.',
  'Acompanhamos o grupo com atenção, energia e uma logística bem pensada.',
];

export default function AboutPage() {
  const [activeMember, setActiveMember] = useState(0);
  const member = team[activeMember];

  return (
    <main className="min-h-screen bg-[#f7f3e9] text-black pt-20 sm:pt-24">
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-8 sm:gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-sm font-semibold">
              <Mountain className="w-4 h-4" /> Nossa história
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-black mt-5 sm:mt-6 mb-5 sm:mb-6">
              Viajar é encontrar novas versões de si.
            </h1>
            <p className="text-base sm:text-xl leading-relaxed text-black max-w-xl">
              O Aventure-se nasceu para aproximar pessoas de paisagens extraordinárias e criar viagens em grupo com cuidado, liberdade e boas histórias para contar.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/#trips-section" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors">
                Explorar viagens <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white text-black font-semibold hover:bg-slate-100 transition-colors">
                Fazer parte
              </Link>
            </div>
          </div>
          <div className="relative min-h-[300px] sm:min-h-[420px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-slate-300 shadow-xl">
            <img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=85" alt="Grupo de viajantes em uma paisagem natural" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 text-white text-lg font-medium">Pequenos grupos, grandes descobertas.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/70 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5 sm:gap-8">
          {values.map(({ icon: Icon, title, text }) => (
            <article key={title} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <Icon className="w-7 h-7 text-blue-500 mb-4" />
              <h2 className="text-xl font-bold text-black mb-2">{title}</h2>
              <p className="text-black leading-relaxed">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-8 sm:gap-10 items-start">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold">
              <Sparkles className="w-4 h-4" /> Nossa proposta
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-black">Uma viagem pode mudar a forma como você olha para o mundo.</h2>
            <p className="text-black leading-relaxed">
              Acreditamos que a melhor aventura não é só aquela com paisagens incríveis, mas também com tempo para respirar, conectar e sentir o lugar com profundidade.
            </p>
            <div className="space-y-4 mt-8">
              {journeySteps.map((step, index) => (
                <div key={step} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-black leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 overflow-hidden bg-white shadow-sm">
            <div className="grid md:grid-cols-2">
              <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200">
                <MapPinned className="w-8 h-8 text-blue-500 mb-4" />
                <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">Impacto</p>
                <p className="text-4xl font-bold mt-3 text-black">15+</p>
                <p className="mt-2 text-black">destinos selecionados com foco em experiência e autenticidade.</p>
              </div>
              <div className="p-6 sm:p-8">
                <Route className="w-8 h-8 text-blue-500 mb-4" />
                <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">Experiência</p>
                <p className="text-4xl font-bold mt-3 text-black">2k+</p>
                <p className="mt-2 text-black">aventureiros que já viveram jornadas inspiradoras com a gente.</p>
              </div>
            </div>
            <div className="p-6 sm:p-8 border-t border-slate-200 bg-slate-50">
              <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold mb-3">Como viajamos</p>
              <p className="text-black leading-relaxed">
                Temos uma abordagem leve, humana e bem estruturada: buscamos destinos com identidade, entregamos uma logística clara e criamos uma atmosfera que faz o grupo se sentir em casa, mesmo longe de casa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-blue-600 font-semibold uppercase tracking-wider text-sm">Quem faz acontecer</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-black mt-2">Uma equipe que vai com você</h2>
            </div>
            <p className="text-black max-w-md">
              Estamos atentos aos detalhes, ao bem-estar do grupo e à energia da viagem para que cada passo tenha sentido.
            </p>
          </div>
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-stretch">
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
              {team.map((person, index) => (
                <button
                  key={person.name}
                  onClick={() => setActiveMember(index)}
                  className={`flex items-center gap-3 text-left p-3 rounded-xl border transition-colors ${activeMember === index ? 'bg-blue-500/10 border-blue-500/40' : 'bg-white border-slate-200 hover:border-blue-500/30'}`}
                >
                  <img src={person.image} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <span className="hidden sm:block lg:block">
                    <strong className="block text-black">{person.name}</strong>
                    <small className="text-black">{person.role}</small>
                  </span>
                </button>
              ))}
            </div>
            <article className="grid md:grid-cols-2 bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <img src={member.image} alt={member.name} className="w-full h-full min-h-[300px] object-cover" />
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <Users className="w-8 h-8 text-blue-500 mb-6" />
                <h3 className="text-3xl font-bold text-black">{member.name}</h3>
                <p className="text-blue-600 font-semibold mt-2">{member.role}</p>
                <p className="text-black leading-relaxed mt-6">{member.bio}</p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
