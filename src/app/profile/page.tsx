'use client';

import { formatCurrency, formatDateRange, getPaymentStatusColor, getPaymentStatusLabel, formatDate } from '@/lib/utils';
import { User, Mail, Phone, FileText, Calendar, CreditCard, Ticket, LogOut, Edit, Tent, Heart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Booking, Trip } from '@/types';

type ProfileAuthState = {
  isAuthenticated: boolean;
  user: { id: string; email: string; full_name: string } | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<ProfileAuthState>({ isAuthenticated: false, user: null });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tripsCache, setTripsCache] = useState<Record<string, Trip>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const authUser = userData.user;
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', authUser.id)
        .maybeSingle();

      setAuthState({
        isAuthenticated: true,
        user: {
          id: authUser.id,
          email: authUser.email ?? '',
          full_name: profile?.full_name || String(authUser.user_metadata.full_name || ''),
        },
      });

      const { data: userBookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      setBookings((userBookings ?? []) as Booking[]);
      setLoading(false);
    };

    void loadData();
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await createClient().auth.signOut();
    }
    router.replace('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-adventure-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="min-h-screen bg-adventure-dark flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-adventure-card rounded-full flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h1>
        <p className="text-slate-700 mb-8 text-center max-w-md">
          Você precisa estar logado para acessar seu perfil e histórico de aventuras.
        </p>
        <Link 
          href="/auth/login"
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-8 rounded-lg transition-colors"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  const user = authState.user;
  const initials = user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const confirmedBookings = bookings.filter(b => b.payment_status === 'confirmed');
  const totalInvested = confirmedBookings.reduce((sum, b) => sum + b.total_amount, 0);
  
  // Find next trip (simplified logic assuming upcoming dates based on trip data if available, but for now just showing mock info)
  const nextTrip = confirmedBookings.length > 0 ? "Em breve" : "Nenhuma programada";

  return (
    <div className="min-h-screen bg-adventure-dark text-slate-900 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 backdrop-blur-sm">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-lg shadow-blue-900/20 shrink-0">
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{user.full_name}</h1>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-6 text-slate-700 mb-6">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {user.email}</span>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-neutral-300 hover:border-blue-500 hover:text-blue-400 transition-colors bg-adventure-card/50 font-medium">
                <Edit className="w-4 h-4" />
                Editar Perfil
              </button>
              <button 
                onClick={() => handleLogout()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-900/30 text-red-400 hover:bg-red-950/30 hover:border-red-800 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-adventure-card/40 border border-neutral-300 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center">
                <Tent className="w-4 h-4" />
              </div>
              <span className="text-slate-700 font-medium">Total de Aventuras</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{confirmedBookings.length}</p>
          </div>
          
            <div className="bg-adventure-card/40 border border-neutral-300 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-slate-700 font-medium">Total Investido</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalInvested)}</p>
          </div>
          
            <div className="bg-adventure-card/40 border border-neutral-300 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-slate-700 font-medium">Próxima Aventura</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{nextTrip}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Data Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Dados Pessoais
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="text" defaultValue={user.full_name} className="w-full bg-adventure-card border border-neutral-300 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="email" defaultValue={user.email} className="w-full bg-adventure-card border border-neutral-300 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="tel" placeholder="(00) 00000-0000" className="w-full bg-adventure-card border border-neutral-300 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="text" placeholder="000.000.000-00" className="w-full bg-adventure-card border border-neutral-300 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                  </div>
                </div>
                
                <hr className="border-neutral-300 my-4" />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Contato de Emergência
                  </label>
                  <input type="text" placeholder="Nome do contato" className="w-full bg-adventure-card border border-neutral-300 rounded-lg py-2.5 px-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors mb-3" />
                  <input type="tel" placeholder="Telefone do contato" className="w-full bg-adventure-card border border-neutral-300 rounded-lg py-2.5 px-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors mt-6">
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>

          {/* Booking History Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-500" />
                Minhas Aventuras
              </h2>

              {bookings.length === 0 ? (
                <div className="bg-adventure-card/50 rounded-xl border border-neutral-300 border-dashed p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-adventure-card rounded-full flex items-center justify-center mb-4">
                    <Tent className="w-8 h-8 text-neutral-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma aventura ainda</h3>
                  <p className="text-slate-700 mb-6 max-w-sm">
                    Você ainda não tem nenhuma aventura reservada. Que tal explorar nossos destinos incríveis?
                  </p>
                  <Link 
                    href="/destinations"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    Explorar Destinos
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const trip = tripsCache[booking.trip_id];
                    const statusColorClass = getPaymentStatusColor(booking.payment_status);
                    
                    return (
                      <div key={booking.id} className="bg-adventure-card rounded-xl border border-neutral-300 overflow-hidden hover:border-neutral-300 transition-colors">
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-2 py-1 rounded">
                                  {booking.id.substring(0, 8).toUpperCase()}
                                </span>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColorClass} bg-opacity-10 border border-current`}>
                                  {getPaymentStatusLabel(booking.payment_status)}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-slate-900">
                                {trip ? trip.title : 'Destino em carregamento...'}
                              </h3>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="text-lg font-bold text-blue-400">
                                {formatCurrency(booking.total_amount)}
                              </div>
                              <div className="text-xs text-slate-700">
                                Criado em {formatDate(booking.created_at)}
                              </div>
                            </div>
                          </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-700 mb-5">
                            {trip && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-neutral-500" />
                                <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
                              </div>
                            )}
                            {booking.accommodation && (
                              <div className="flex items-center gap-2">
                                <Tent className="w-4 h-4 text-neutral-500" />
                                <span>{booking.accommodation.label}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end pt-4 border-t border-neutral-300">
                            <Link 
                              href={`/checkout/success/${booking.id}`}
                              className="text-blue-400 hover:text-blue-300 font-medium text-sm flex items-center gap-1 transition-colors"
                            >
                              Ver Voucher <Ticket className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
