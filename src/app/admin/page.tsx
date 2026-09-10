'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, Users, Clock, BarChart3, TrendingUp, Package, Ticket, ArrowRight, LogOut, Settings, Home, Image, Save, Ban, UserCheck, FileText } from 'lucide-react';
import { getAdminBookings, getAdminTrips, getAdminUsers, saveAdminTrip, updateAdminUserStatus, getCommitmentTerms, saveCommitmentTerms, getAboutContent, saveAboutContent, defaultAboutContent, type AboutContent, type AdminUser } from '@/lib/supabase/admin-data';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, getPaymentStatusColor, getPaymentStatusLabel } from '@/lib/utils';
import { Booking, Trip } from '@/types';
import { getHomeImage, saveHomeImage } from '@/lib/store';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    occupancyRate: 0,
    revenueByAccommodation: [] as { type: string; revenue: number; count: number }[],
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [mediaTrips, setMediaTrips] = useState<Trip[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<AdminUser[]>([]);
  const [homeImage, setHomeImage] = useState('');
  const [adminName, setAdminName] = useState('Administrador');
  const [commitmentTerms, setCommitmentTerms] = useState('');
  const [termsFeedback, setTermsFeedback] = useState('');
  const [aboutContent, setAboutContent] = useState<AboutContent>(defaultAboutContent);
  const [aboutFeedback, setAboutFeedback] = useState('');
  const [dashboardFeedback, setDashboardFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
      const results = await Promise.allSettled([getAdminBookings(), getAdminTrips(), getAdminUsers(), getCommitmentTerms(), getAboutContent()]);
      const [bookingsResult, tripsResult, usersResult, termsResult, aboutResult] = results;
      const allBookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value : [];
      const trips = tripsResult.status === 'fulfilled' ? tripsResult.value : [];
      const users = usersResult.status === 'fulfilled' ? usersResult.value : [];
      const terms = termsResult.status === 'fulfilled' ? termsResult.value : '';
      const about = aboutResult.status === 'fulfilled' ? aboutResult.value : defaultAboutContent;
      const failedSections = results.filter((result) => result.status === 'rejected').length;
      if (failedSections > 0) setDashboardFeedback('Alguns dados não puderam ser carregados. Execute as migrações do Supabase e tente atualizar a página.');
      const confirmed = allBookings.filter((booking) => booking.payment_status === 'confirmed');
      const pending = allBookings.filter((booking) => booking.payment_status === 'pending');
      const capacity = trips.flatMap((trip) => trip.accommodations ?? []).reduce((sum, accommodation) => sum + accommodation.capacity, 0);
      const occupied = trips.flatMap((trip) => trip.accommodations ?? []).reduce((sum, accommodation) => sum + accommodation.booked_count, 0);
      const revenueByAccommodation = trips.flatMap((trip) => trip.accommodations ?? []).map((accommodation) => ({ type: accommodation.label, revenue: accommodation.price * accommodation.booked_count, count: accommodation.booked_count }));
      setMetrics({
        totalRevenue: confirmed.reduce((sum, booking) => sum + booking.total_amount, 0),
        confirmedBookings: confirmed.length,
        pendingBookings: pending.length,
        occupancyRate: capacity > 0 ? Math.round((occupied / capacity) * 100) : 0,
        revenueByAccommodation,
      });
      setRecentBookings(allBookings.slice(0, 5));
      setMediaTrips(trips);
      setRegisteredUsers(users);
      setCommitmentTerms(terms);
      setAboutContent(about);
      setHomeImage(getHomeImage());
      const { data: authData } = await createClient().auth.getUser();
      setAdminName(authData.user?.user_metadata.full_name || authData.user?.email || 'Administrador');
      } catch {
        setDashboardFeedback('Não foi possível carregar o painel. Verifique sua sessão e a configuração do Supabase.');
      } finally {
        setLoading(false);
      }
    };
    void loadDashboard();
  }, []);

  const handleSaveCommitmentTerms = async () => {
    try {
      await saveCommitmentTerms(commitmentTerms);
      setTermsFeedback('Termo oficial atualizado.');
    } catch (error) {
      console.error(error);
      setTermsFeedback('Não foi possível salvar o termo.');
    }
  };

  const handleSaveAboutContent = async () => {
    try {
      await saveAboutContent(aboutContent);
      setAboutFeedback('Conteúdo da página Sobre nós atualizado.');
    } catch {
      setAboutFeedback('Não foi possível salvar o conteúdo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-adventure-dark text-slate-900 p-8 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleCoverImageChange = (tripId: string, coverImage: string) => {
    const trip = mediaTrips.find(item => item.id === tripId);
    if (!trip) return;
    const updatedTrip = { ...trip, cover_image: coverImage };
    void saveAdminTrip(updatedTrip);
    setMediaTrips(current => current.map(item => item.id === tripId ? updatedTrip : item));
  };

  const handleUserStatus = async (user: AdminUser) => {
    const status = user.status === 'active' ? 'blocked' : 'active';
    await updateAdminUserStatus(user.id, status);
    setRegisteredUsers(current => current.map(item => item.id === user.id ? { ...item, status } : item));
  };

  return (
    <div className="min-h-screen bg-adventure-dark text-slate-900 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-300 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f7f3e9] flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-500" />
              Painel Administrativo
            </h1>
            <p className="text-slate-700 mt-1">Bem-vindo ao sistema de gestão do Aventure-se.</p>
            {dashboardFeedback && <p role="status" className="mt-2 text-sm text-amber-600">{dashboardFeedback}</p>}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 text-slate-700 hover:text-blue-500 hover:bg-blue-400/10 rounded-full transition-colors" title="Início">
              <Home className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3 px-4 py-2 bg-adventure-card rounded-full border border-neutral-300">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                AD
              </div>
              <span className="text-sm font-medium">{adminName}</span>
            </div>
            <button onClick={async () => { await createClient().auth.signOut(); window.location.href = '/'; }} className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-adventure-card/50 backdrop-blur-sm border border-neutral-300 rounded-2xl p-6 flex items-start gap-4 hover:border-blue-500/30 transition-colors">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Faturamento Total</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(metrics.totalRevenue)}</h3>
            </div>
          </div>
          
          <div className="bg-adventure-card/50 backdrop-blur-sm border border-neutral-300 rounded-2xl p-6 flex items-start gap-4 hover:border-blue-500/30 transition-colors">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Reservas Confirmadas</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.confirmedBookings}</h3>
            </div>
          </div>
          
          <div className="bg-adventure-card/50 backdrop-blur-sm border border-neutral-300 rounded-2xl p-6 flex items-start gap-4 hover:border-amber-500/30 transition-colors">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font.medium text-slate-700">Reservas Pendentes</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.pendingBookings}</h3>
            </div>
          </div>
          
          <div className="bg-adventure-card/50 backdrop-blur-sm border border-neutral-300 rounded-2xl p-6 flex items-start gap-4 hover:border-blue-500/30 transition-colors">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Taxa de Ocupação</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.occupancyRate}%</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue by Accommodation */}
          <div className="bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6 lg:col-span-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Receita por Acomodação
            </h3>
            <div className="space-y-4">
              {metrics.revenueByAccommodation && metrics.revenueByAccommodation.length > 0 ? (
                metrics.revenueByAccommodation.map((item, index) => {
                  const maxVal = Math.max(...metrics.revenueByAccommodation.map(x => x.revenue));
                  const percent = maxVal > 0 ? (item.revenue / maxVal) * 100 : 0;
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-300">{item.type}</span>
                        <span className="font-medium text-blue-400">{formatCurrency(item.revenue)}</span>
                      </div>
                      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-neutral-500 text-sm text-center py-4">Sem dados suficientes</div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6 lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Reservas Recentes
              </h3>
              <Link href="/admin/bookings" className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-neutral-300 text-sm text-slate-600">
                    <th className="py-3 px-4 font-medium">Código</th>
                    <th className="py-3 px-4 font-medium">Passageiro</th>
                    <th className="py-3 px-4 font-medium">Hospedagem</th>
                    <th className="py-3 px-4 font-medium">Valor</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-adventure-card/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-neutral-300">{booking.id.substring(0, 8).toUpperCase()}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{booking.passenger_name}</td>
                        <td className="py-3 px-4 text-sm text-slate-700">{(booking as any).accommodation?.label || booking.accommodation_id}</td>
                        <td className="py-3 px-4 text-sm font-medium">{formatCurrency(booking.total_amount)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                            {getPaymentStatusLabel(booking.payment_status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-400">
                          {new Date(booking.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-500 text-sm">
                        Nenhuma reserva recente encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/trips" className="group relative overflow-hidden bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="w-24 h-24 text-blue-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-adventure-card rounded-xl flex items-center justify-center text-slate-900 mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gerenciar Viagens</h3>
              <p className="text-slate-700 text-sm mb-4">Adicione, edite ou remova destinos, datas e pacotes.</p>
              <div className="text-blue-500 text-sm font-medium flex items-center gap-1">
                Acessar <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
          
            <Link href="/admin/bookings" className="group relative overflow-hidden bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-24 h-24 text-blue-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-adventure-card rounded-xl flex items-center justify-center text-slate-900 mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gerenciar Vendas</h3>
              <p className="text-slate-700 text-sm mb-4">Visualize reservas, confirme pagamentos e emita listas.</p>
              <div className="text-blue-500 text-sm font-medium flex items-center gap-1">
                Acessar <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

            <Link href="/admin/coupons" className="group relative overflow-hidden bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6 hover:border-amber-500/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Ticket className="w-24 h-24 text-amber-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-adventure-card rounded-xl flex items-center justify-center text-slate-900 mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gerenciar Cupons</h3>
              <p className="text-slate-700 text-sm mb-4">Crie cupons de desconto, defina regras e limites de uso.</p>
              <div className="text-amber-500 text-sm font-medium flex items-center gap-1">
                Acessar <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* Visual content and customer directory */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Image className="w-5 h-5 text-blue-500" /> Fotos da home e viagens</h2>
                <p className="text-sm text-slate-700 mt-1">Atualize a imagem principal de cada experiência.</p>
              </div>
              <span className="text-xs text-slate-500">Modo visual local</span>
            </div>
            <div className="mb-5 rounded-xl overflow-hidden border border-neutral-300 relative aspect-[16/6]">
              {homeImage && <img src={homeImage} alt="Prévia da imagem da home" className="absolute inset-0 w-full h-full object-cover" />}
            </div>
            <div className="flex gap-2 mb-6">
              <input aria-label="URL da imagem da home" value={homeImage} onChange={event => setHomeImage(event.target.value)} className="min-w-0 flex-1 bg-adventure-card border border-neutral-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500" />
              <button onClick={() => saveHomeImage(homeImage)} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"><Save className="w-3.5 h-3.5" /> Salvar</button>
            </div>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {mediaTrips.map(trip => (
                <div key={trip.id} className="flex gap-4 items-center border-b border-neutral-300/70 pb-4 last:border-0 last:pb-0">
                  <img src={trip.cover_image} alt="" className="w-20 h-14 rounded-lg object-cover border border-neutral-300" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{trip.title}</p>
                    <input
                      aria-label={`URL da capa de ${trip.title}`}
                      value={trip.cover_image}
                      onChange={event => handleCoverImageChange(trip.id, event.target.value)}
                      className="w-full mt-2 bg-adventure-card border border-neutral-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <Save className="w-4 h-4 text-blue-500 shrink-0" />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900">Editar Sobre nós</h2>
            <p className="mt-1 text-sm text-slate-700">Atualize os textos exibidos na página institucional.</p>
            <div className="mt-5 space-y-3">
              {([['heroTitle', 'Título principal'], ['heroDescription', 'Descrição inicial'], ['proposalTitle', 'Título da proposta'], ['proposalDescription', 'Descrição da proposta'], ['impactValue', 'Valor de impacto'], ['impactDescription', 'Descrição de impacto'], ['experienceValue', 'Valor de experiência'], ['experienceDescription', 'Descrição de experiência']] as const).map(([field, label]) => <label key={field} className="block text-sm font-medium text-slate-700">{label}<textarea rows={field.includes('Description') ? 3 : 1} value={aboutContent[field]} onChange={(event) => setAboutContent((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" /></label>)}
            </div>
            <button type="button" onClick={() => void handleSaveAboutContent()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"><Save className="h-4 w-4" /> Salvar Sobre nós</button>
            {aboutFeedback && <p role="status" className="mt-3 text-sm text-blue-600">{aboutFeedback}</p>}
          </section>

          <section className="bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Contas cadastradas</h2>
                <p className="text-sm text-slate-700 mt-1">Visualize e altere o status dos aventureiros.</p>
              </div>
              <span className="text-sm font-semibold text-blue-500">{registeredUsers.length} contas</span>
            </div>
            {registeredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-neutral-300 text-slate-600"><tr><th className="py-3 pr-3">Aventureiro</th><th className="py-3 pr-3">Contato</th><th className="py-3 pr-3">Status</th><th className="py-3 text-right">Controle</th></tr></thead>
                  <tbody className="divide-y divide-neutral-300/70">
                    {registeredUsers.map(user => <tr key={user.id}>
                      <td className="py-3 pr-3"><p className="font-medium text-slate-900">{user.full_name}</p><p className="text-xs text-slate-600">{user.email}</p></td>
                      <td className="py-3 pr-3 text-slate-700">{user.phone || 'Não informado'}</td>
                      <td className="py-3 pr-3"><span className={`px-2 py-1 rounded-md text-xs font-medium ${user.status === 'active' ? 'bg-blue-500/10 text-blue-600' : 'bg-red-500/10 text-red-600'}`}>{user.status === 'active' ? 'Ativo' : 'Bloqueado'}</span></td>
                      <td className="py-3 text-right"><button onClick={() => handleUserStatus(user)} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-neutral-300 text-xs text-slate-700 hover:border-blue-500 hover:text-blue-600">{user.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}{user.status === 'active' ? 'Bloquear' : 'Ativar'}</button></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-slate-600 py-10 text-center">Nenhuma conta cadastrada ainda.</p>}
          </section>

          <section className="bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Termo de compromisso</h2>
            <p className="text-sm text-slate-700 mt-1">Este texto será exibido no checkout e aceito pelos clientes.</p>
            <textarea value={commitmentTerms} onChange={(event) => setCommitmentTerms(event.target.value)} rows={10} className="mt-5 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" />
            <button type="button" onClick={() => void handleSaveCommitmentTerms()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"><Save className="h-4 w-4" /> Salvar termo oficial</button>
            {termsFeedback && <p role="status" className="mt-3 text-sm text-blue-600">{termsFeedback}</p>}
          </section>
        </div>

      </div>
    </div>
  );
}
