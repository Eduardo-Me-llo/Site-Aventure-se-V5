'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, Mountain, MapPin, Calendar, CreditCard, 
  Shield, Users, Sparkles, Star, ChevronDown, Compass, 
  PartyPopper, CheckCircle, Quote, Tent, Bus,
  Timer
} from 'lucide-react'
import { TripCard } from '@/components/trip-card'
import { FeaturedTripCarousel } from '@/components/featured-trip-carousel'
import { BrandLogo } from '@/components/brand-logo'
import { getFeaturedTrips, getHomeImage } from '@/lib/store'
import { Trip } from '@/types'

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [homeImage, setHomeImage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      setTrips(getFeaturedTrips())
      setHomeImage(getHomeImage())
    } catch (error) {
      console.error('Não foi possível carregar os dados da home:', error)
    } finally {
      setMounted(true)
    }
  }, [])

  if (!mounted) return null

  const otherFeaturedTrips = trips.filter(trip => trip.id !== 'trip-reveillon-2026')

  const scrollToTrips = () => {
    document.getElementById('trips-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-adventure-dark text-slate-900 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        {/* Animated Background Gradients & Orbs */}
        <div className="absolute inset-0 bg-gradient-to-b from-adventure-dark via-adventure-card to-adventure-dark z-0"></div>
        {homeImage && <img src={homeImage} alt="Paisagem de aventura" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-multiply z-0" />}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-900/20 rounded-full blur-[150px]"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto mt-10 lg:mt-20">
          <BrandLogo className="h-16 w-32 sm:h-20 sm:w-40 mb-6 sm:mb-8 animate-fade-in-up" priority />
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Sua próxima <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-400">aventura</span> começa aqui
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-slate-700 max-w-3xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Expedições únicas na natureza brasileira. Viva experiências que transformam, conectam e ficam para sempre na memória.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={scrollToTrips}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 text-white font-bold text-lg transition-all duration-300 shadow-[0_0_30px_-5px_rgba(15,131,247,0.25)] hover:shadow-[0_0_40px_-5px_rgba(15,131,247,0.4)] hover:-translate-y-1"
            >
              Próximo Destino
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link 
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-adventure-card/50 hover:bg-adventure-card border border-neutral-300 text-slate-900 font-medium text-lg transition-all duration-300 backdrop-blur-sm"
            >
              Como Funciona
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-16 sm:mt-24 mb-10 sm:mb-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 py-5 sm:py-8 px-3 sm:px-6 rounded-3xl bg-adventure-card/40 border border-neutral-300/50 backdrop-blur-md">
            <div className="flex items-center justify-center gap-4">
              <div className="hidden sm:flex w-12 h-12 rounded-full bg-blue-500/10 items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-xl sm:text-2xl font-bold text-slate-900">2000+</p>
                <p className="text-xs sm:text-sm text-slate-700">Aventureiros</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 border-l border-neutral-800/50 md:border-t-0 md:border-l border-neutral-300/50 pl-3 sm:pl-0">
              <div className="hidden sm:flex w-12 h-12 rounded-full bg-blue-500/10 items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-xl sm:text-2xl font-bold text-slate-900">15+</p>
                <p className="text-xs sm:text-sm text-slate-700">Destinos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer z-10" onClick={scrollToTrips}>
          <ChevronDown className="w-8 h-8 text-neutral-500 hover:text-white transition-colors" />
        </div>
      </section>

      {/* 2. Featured Trip Banner (Réveillon Ubatuba) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-adventure-card">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-1 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-600 shadow-2xl">
            {/* Inner Content */}
            <div className="relative bg-adventure-card/95 backdrop-blur-xl rounded-[1.4rem] p-4 sm:p-6 md:p-12 overflow-hidden flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10 lg:items-center">
              {/* Background abstract shape */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="flex-1 z-10">
                <FeaturedTripCarousel />
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wider mb-6">
                  <PartyPopper className="w-4 h-4" />
                  <span>EDIÇÃO ESPECIAL</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  Réveillon Aventure-se 2026/2027
                </h2>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-slate-700 mb-6 sm:mb-8 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="w-5 h-5 text-blue-400" /> Ubatumirim, Ubatuba</span>
                  <span className="hidden md:inline text-slate-700">•</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-5 h-5 text-blue-400" /> 29 de dezembro a 03 de janeiro</span>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-8">
                  {['5 dias pé na areia', '4 festas temáticas', 'Yoga & Breathwork', 'Ritual da Virada'].map((highlight, i) => (
                    <span key={i} className="px-3 py-2 rounded-lg bg-adventure-card/80 border border-neutral-300 text-xs sm:text-sm text-slate-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      {highlight}
                    </span>
                  ))}
                </div>
                
                <div className="relative pl-4 sm:pl-6 border-l-4 border-blue-500/50 py-2 mb-6 sm:mb-10">
                  <Quote className="absolute -left-3 -top-2 w-6 h-6 text-neutral-700 bg-neutral-950" />
                  <p className="text-lg italic text-neutral-400">
                    "A verdadeira virada começa dentro da gente. A meia-noite só celebra."
                  </p>
                </div>
              </div>
              
                <div className="w-full lg:w-[380px] bg-adventure-card/50 rounded-2xl p-4 sm:p-6 border border-neutral-300 z-10 flex flex-col">
                <div className="mb-6">
                  <p className="text-sm text-neutral-400 mb-1">Investimento</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl sm:text-4xl font-bold text-slate-900">A partir de R$ 890</p>
                    <p className="text-sm text-neutral-400 mb-1">,00</p>
                  </div>
                </div>
                
                <Link 
                  href="/trips/reveillon-ubatuba-2026"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-neutral-950 font-bold text-lg hover:bg-neutral-200 transition-colors mb-4"
                >
                  Garantir minha vaga
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <div className="flex items-center justify-center gap-2 text-sm text-amber-400 font-medium bg-amber-400/10 py-2 rounded-lg">
                  <Timer className="w-4 h-4" />
                  Últimas vagas! 73% das vagas já preenchidas
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trips Grid Section */}
      {otherFeaturedTrips.length > 0 && <section id="trips-section" className="py-24 px-4 sm:px-6 lg:px-8 bg-adventure-card relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Próximas Aventuras</h2>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">Escolha seu destino e viva algo único. Vagas limitadas para garantir a melhor experiência.</p>
          </div>
          
          {otherFeaturedTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherFeaturedTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-neutral-800/30 rounded-3xl border border-neutral-800">
              <Mountain className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Nenhuma aventura disponível no momento</h3>
              <p className="text-neutral-400">Cadastre-se na newsletter para receber novidades.</p>
            </div>
          )}
        </div>
      </section>}

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-950 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Como Funciona</h2>
            <p className="text-xl text-slate-700">Sua jornada até a aventura em 4 passos simples</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-gradient-to-r from-neutral-800 via-blue-500/50 to-neutral-800 z-0"></div>
            
            {[
              {
                icon: Compass,
                title: 'Escolha seu destino',
                desc: 'Explore nossas expedições e encontre a aventura perfeita para você.'
              },
              {
                icon: Calendar,
                title: 'Selecione datas e hospedagem',
                desc: 'Escolha entre camping, pousada ou suíte e adicione transporte.'
              },
              {
                icon: CreditCard,
                title: 'Pagamento seguro',
                desc: 'Pague via PIX com desconto ou parcele em até 12x no cartão.'
              },
              {
                icon: PartyPopper,
                title: 'Viva a experiência',
                desc: 'Receba seu voucher digital e embarque na aventura da sua vida.'
              }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center mb-6 shadow-xl relative group hover:border-blue-500/50 transition-colors duration-300">
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  <step.icon className="w-10 h-10 text-blue-400 relative z-10" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-500 text-neutral-950 font-bold flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-700 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Differentials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Por que Aventure-se?</h2>
            <p className="text-xl text-neutral-400">O que nos torna a melhor escolha para sua próxima viagem</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                icon: Shield,
                title: 'Segurança Garantida',
                desc: 'Seguro aventura incluso em todas as expedições. Guias experientes e credenciados CADASTUR em todas as atividades.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20'
              },
              {
                icon: Users,
                title: 'Comunidade Única',
                desc: 'Conheça pessoas incríveis e crie conexões que duram para sempre. Nossas viagens são desenhadas para promover integração.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/20'
              },
              {
                icon: Sparkles,
                title: 'Experiências Exclusivas',
                desc: 'Roteiros autorais e fora do óbvio com atividades de bem-estar, aventura, fogueira, música e celebração.',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20'
              },
              {
                icon: CreditCard,
                title: 'Facilidade no Pagamento',
                desc: 'Pagamento facilitado: PIX com desconto especial ou até 12x no cartão de crédito. Opções de parcelamento sem juros.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20'
              }
            ].map((diff, idx) => (
              <div key={idx} className="bg-adventure-card/30 border border-neutral-300 hover:border-neutral-200 transition-colors rounded-3xl p-8 flex gap-6 items-start group">
                  <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center ${diff.bg} border ${diff.border} group-hover:scale-110 transition-transform duration-300`}>
                    <diff.icon className={`w-8 h-8 ${diff.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{diff.title}</h3>
                    <p className="text-slate-700 leading-relaxed">{diff.desc}</p>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-adventure-card relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">O que nossos aventureiros dizem</h2>
            <p className="text-xl text-slate-700">Experiências reais de quem já viajou com a gente</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Mariana Silva',
                trip: 'Réveillon Ubatuba 2025',
                text: 'Foi a melhor virada de ano da minha vida! A energia da galera, a organização impecável e as paisagens... Indescritível. Já estou garantindo minha vaga pro próximo.'
              },
              {
                name: 'Pedro Henrique',
                trip: 'Travessia Petrópolis-Teresópolis',
                text: 'Atenção aos detalhes e segurança em primeiro lugar. Os guias foram incríveis e a comida no acampamento estava sensacional. Recomendo de olhos fechados!'
              },
              {
                name: 'Camila Costa',
                trip: 'Retiro de Yoga Ilha Grande',
                text: 'Uma experiência de desconexão e reconexão. O equilíbrio perfeito entre aventura e descanso. Voltei renovada e com vários amigos novos!'
              }
            ].map((test, idx) => (
              <div key={idx} className="bg-adventure-card rounded-3xl p-8 border border-neutral-300 relative">
                <Quote className="absolute top-6 right-6 w-10 h-10 text-neutral-300" />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-lg italic mb-8 relative z-10">"{test.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{test.name}</h4>
                    <p className="text-sm text-blue-400">{test.trip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA Final Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t border-neutral-800">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 sm:from-neutral-900 sm:to-neutral-950 z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-400 mb-6">
            Pronto para a aventura?
          </h2>
          <p className="text-xl md:text-2xl text-white mb-10">
            A próxima experiência inesquecível está te esperando. Escolha seu destino e embarque com a gente.
          </p>
          <button 
            onClick={scrollToTrips}
            className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-white text-neutral-950 font-bold text-xl hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)] hover:-translate-y-1"
          >
            Explorar Destinos
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>
    </main>
  )
}
