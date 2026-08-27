'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Calendar, Clock, ChevronLeft, Share2, 
  CheckCircle, X as XIcon, Star, Shield, 
  Hotel, Crown, Bus, Car, Wifi, Coffee, Waves, 
  Thermometer, Users, ArrowRight 
} from 'lucide-react';

import { TripGallery } from '@/components/trip-gallery';
import { BookingWidget } from '@/components/booking-widget';
import { getTripBySlug } from '@/lib/store';
import { 
  formatCurrency, formatDateRange, calculateDays, 
  calculateNights, getDifficultyColor, getRemainingSpots, 
  getScarcityBadge, getAccommodationIcon 
} from '@/lib/utils';
import Link from 'next/link';

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      const fetchedTrip = getTripBySlug(params.slug as string);
      setTrip(fetchedTrip);
      setLoading(false);
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-adventure-dark p-6 flex flex-col gap-8 animate-pulse pt-24">
        <div className="h-12 w-3/4 bg-adventure-card rounded-lg mx-auto md:mx-0"></div>
        <div className="h-64 w-full bg-adventure-card rounded-2xl max-w-7xl mx-auto"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="h-32 bg-adventure-card rounded-xl"></div>
            <div className="h-48 bg-adventure-card rounded-xl"></div>
          </div>
          <div className="lg:col-span-4 h-96 bg-adventure-card rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-adventure-dark flex flex-col items-center justify-center text-slate-900 p-6 pt-24">
        <h1 className="text-3xl font-bold mb-4">Viagem não encontrada</h1>
        <p className="text-slate-700 mb-8">Desculpe, não conseguimos encontrar os detalhes desta viagem.</p>
        <button 
          onClick={() => router.back()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>
      </div>
    );
  }

  const days = calculateDays(trip.start_date, trip.end_date);
  const nights = calculateNights(trip.start_date, trip.end_date);
  const difficultyColor = getDifficultyColor(trip.difficulty);

  return (
    <main className="min-h-screen bg-adventure-dark text-slate-900 pb-24 lg:pb-12 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button & Share */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-700 hover:text-blue-400 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
          <button className="flex items-center gap-2 text-slate-700 hover:text-blue-400 transition-colors text-sm font-medium">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>

        {/* Hero/Header */}
        <header className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor}`}>
              {trip.difficulty}
            </span>
            <div className="flex items-center gap-1.5 text-slate-700 bg-adventure-card/60 border border-neutral-300 px-3 py-1 rounded-full">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{trip.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 bg-adventure-card/60 border border-neutral-300 px-3 py-1 rounded-full">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 bg-adventure-card/60 border border-neutral-300 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{days} dias / {nights} noites</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            {trip.title}
          </h1>
        </header>

        {/* Image Gallery */}
        <div className="mb-12">
          <TripGallery images={trip.images} />
        </div>

        {/* Two-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative">
          
          {/* Left Column */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-12">
            
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                Sobre a viagem
              </h2>
              <div className="text-slate-700 leading-relaxed whitespace-pre-line text-lg">
                {trip.description}
              </div>
            </section>

            {/* Included / Not Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-adventure-card/40 p-6 md:p-8 rounded-2xl border border-neutral-300">
              <section>
                <h3 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                  O que está incluso
                </h3>
                <ul className="space-y-4">
                  {trip.highlights?.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                      <div className="mt-1 bg-blue-500/10 p-0.5 rounded-full shrink-0">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                  <XIcon className="w-6 h-6 text-red-400" />
                  Não incluso
                </h3>
                <ul className="space-y-4">
                  {trip.not_included?.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                      <div className="mt-1 bg-red-500/10 p-0.5 rounded-full shrink-0">
                        <XIcon className="w-4 h-4 text-red-400" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Itinerary */}
            <section>
              <h2 className="text-2xl font-bold mb-8 text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                Roteiro dia a dia
              </h2>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500/50 before:via-blue-500/20 before:to-transparent">
                {trip.itinerary?.map((day: any, idx: number) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-950 border-2 border-blue-500/50 text-blue-400 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_rgba(15,131,247,0.2)] z-10">
                      {idx + 1}
                    </div>
                    <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-adventure-card/50 border border-neutral-300 hover:border-blue-500/30 hover:bg-adventure-card transition-all shadow-lg">
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{day.title}</h3>
                      <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Accommodation Details */}
            {trip.accommodations && trip.accommodations.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                  Opções de Hospedagem
                </h2>
                
                <div className="grid gap-6">
                  {trip.accommodations.map((acc: any, idx: number) => {
                    const accommodationIcon = getAccommodationIcon(acc.type);
                    
                    return (
                      <div key={idx} className="bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6 hover:border-blue-500/30 transition-colors shadow-lg">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-adventure-card rounded-xl text-blue-400 border border-neutral-300">
                              <span className="text-2xl leading-none" aria-hidden="true">{accommodationIcon}</span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">{acc.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-slate-700 mt-1">
                                <span className="capitalize">{acc.type}</span>
                                <span className="text-zinc-600">•</span>
                                <span>Capacidade: {acc.capacity} pessoas</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-left md:text-right">
                            <div className="text-2xl font-bold text-blue-400">
                              {formatCurrency(acc.price)}
                            </div>
                            <div className="text-sm text-slate-500">por pessoa</div>
                          </div>
                        </div>
                        
                        <p className="text-slate-700 mb-6 text-sm leading-relaxed">{acc.description}</p>
                        
                        {/* Amenities */}
                        {acc.amenities && acc.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {acc.amenities.map((amenity: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 bg-adventure-card/60 text-slate-700 text-xs rounded-lg border border-neutral-300 flex items-center gap-1.5 font-medium">
                                <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Status/Capacity footer */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-neutral-300 mt-2">
                          <div className="flex items-center gap-4 text-sm">
                            {acc.checkIn && (
                              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                <Clock className="w-4 h-4 text-blue-500/70" />
                                In: {acc.checkIn} / Out: {acc.checkOut}
                              </div>
                            )}
                          </div>
                          
                          <div className={`text-sm font-semibold flex items-center gap-2 px-3 py-1.5 rounded-full ${
                            acc.spotsLeft <= 5 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            <Users className="w-4 h-4" />
                            {acc.spotsLeft} vagas restantes
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            
          </div>

          {/* Right Column (Sticky Widget) */}
          <div className="lg:col-span-5 xl:col-span-4 hidden lg:block">
            <div className="sticky top-28">
              <BookingWidget trip={trip} />
            </div>
          </div>
          
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-adventure-dark/95 backdrop-blur-xl border-t border-neutral-300 p-4 z-50 flex items-center justify-between safe-area-pb shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
        <div>
          <p className="text-xs text-slate-700 mb-0.5">A partir de</p>
          <p className="text-xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(trip.price)}
          </p>
        </div>
        <Link 
          href={`/trips/${trip.slug}/book`}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
        >
          Reservar <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
