'use client';

import React, { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { Search, Filter, Download, Printer, ChevronDown, ChevronUp, ChevronLeft, Check, X as XIcon, FileText, Users, Bus } from 'lucide-react';
import { getBookings, getTrips, updateBookingStatus } from '@/lib/store';
import { formatCurrency, formatDate, getPaymentStatusColor, getPaymentStatusLabel } from '@/lib/utils';
import { Booking, Trip } from '@/types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Filters
  const [filterTrip, setFilterTrip] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setBookings(getBookings());
      setTrips(getTrips());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      updateBookingStatus(bookingId, newStatus);
      loadData();
    } catch (error) {
      console.error('Error updating status', error);
      alert('Erro ao atualizar status');
    }
  };

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchTrip = filterTrip === 'all' || b.trip_id === filterTrip;
    const matchStatus = filterStatus === 'all' || b.payment_status === filterStatus;
    const matchSearch = searchQuery === '' || 
      b.passenger_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTrip && matchStatus && matchSearch;
  });

  // Stats
  const totalValue = filteredBookings.reduce((sum, b) => sum + b.total_amount, 0);
  const confirmedCount = filteredBookings.filter(b => b.payment_status === 'confirmed').length;
  const pendingCount = filteredBookings.filter(b => b.payment_status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-adventure-dark text-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-adventure-dark text-slate-900 p-6 lg:p-10 font-sans print:bg-white print:text-black print:p-0">
      <div className="max-w-7xl mx-auto space-y-6 print:hidden">
        
        {/* Top Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-500 w-fit transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <Link href="/admin">Voltar ao Dashboard</Link>
        </div>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Gerenciar Vendas
            </h1>
            <p className="text-slate-700 mt-1">Controle de reservas, pagamentos e emissão de listas.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-adventure-card/80 hover:bg-adventure-card text-slate-900 font-medium py-2 px-4 rounded-xl transition-all border border-neutral-300"
            >
              <Printer className="w-4 h-4" />
              Imprimir Lista
            </button>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl transition-all">
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </header>

        {/* Filters & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3 bg-adventure-card/50 p-4 rounded-2xl border border-neutral-300">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Buscar passageiro ou código..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-adventure-card border border-neutral-300 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select 
              value={filterTrip}
              onChange={e => setFilterTrip(e.target.value)}
              className="w-full bg-adventure-card border border-neutral-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
            >
              <option value="all">Todas as Viagens</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-adventure-card border border-neutral-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
            >
              <option value="all">Todos os Status</option>
              <option value="confirmed">Confirmados</option>
              <option value="pending">Pendentes</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/40 to-neutral-900 p-4 rounded-2xl border border-blue-500/20 flex flex-col justify-center">
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Resumo Visível</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{filteredBookings.length}</span>
              <span className="text-sm text-neutral-400">reservas</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-blue-400">{confirmedCount} confirmadas</span>
              <span className="text-amber-400">{pendingCount} pendentes</span>
            </div>
          </div>
        </div>

        {/* Table */}
            <div className="bg-adventure-card/50 border border-neutral-300 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-neutral-300 text-xs uppercase tracking-wider text-slate-600 bg-adventure-card">
                  <th className="py-3 px-4 w-10"></th>
                  <th className="py-3 px-4 font-medium">Reserva</th>
                  <th className="py-3 px-4 font-medium">Passageiro</th>
                  <th className="py-3 px-4 font-medium">Viagem</th>
                  <th className="py-3 px-4 font-medium">Valor Total</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => {
                    const isExpanded = expandedRows.has(booking.id);
                    const trip = trips.find(t => t.id === booking.trip_id);
                    
                    return (
                      <Fragment key={booking.id}>
                        <tr className={`hover:bg-adventure-card/50 transition-colors ${isExpanded ? 'bg-adventure-card/30' : ''}`}>
                          <td className="py-3 px-4">
                            <button onClick={() => toggleRow(booking.id)} className="p-1 text-slate-600 hover:text-blue-500 rounded-md">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-xs text-slate-600">{booking.id.substring(0, 8).toUpperCase()}</div>
                            <div className="text-xs text-neutral-500 mt-0.5">{formatDate(booking.created_at)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{booking.passenger_name}</div>
                            <div className="text-xs text-slate-700 mt-0.5">{booking.passenger_phone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-slate-700">{trip?.title || 'Viagem Removida'}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-blue-400">
                            {formatCurrency(booking.total_amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                              {getPaymentStatusLabel(booking.payment_status)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {booking.payment_status === 'pending' && (
                                <button onClick={() => handleStatusChange(booking.id, 'confirmed')} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors" title="Confirmar Pagamento">
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {booking.payment_status !== 'cancelled' && (
                                <button onClick={() => handleStatusChange(booking.id, 'cancelled')} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Cancelar Reserva">
                                  <XIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-neutral-900/30">
                            <td colSpan={7} className="p-4 border-b border-neutral-800">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                <div>
                                  <h4 className="font-medium text-neutral-400 mb-2 flex items-center gap-1.5"><Users className="w-4 h-4" /> Dados do Cliente</h4>
                                  <div className="space-y-1 text-neutral-300">
                                    <p><span className="text-neutral-500">Documento:</span> {booking.passenger_document}</p>
                                    <p><span className="text-neutral-500">Emergência:</span> {booking.passenger_emergency_contact} ({booking.passenger_emergency_phone})</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-neutral-400 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4" /> Detalhes do Pacote</h4>
                                  <div className="space-y-1 text-neutral-300">
                                    <p><span className="text-neutral-500">Hospedagem:</span> {trip?.accommodations?.find(a => a.id === booking.accommodation_id)?.label || booking.accommodation_id}</p>
                                    <p><span className="text-neutral-500">Transporte:</span> {booking.transport_option_id ? (trip?.transport_options?.find(t => t.id === booking.transport_option_id)?.label || booking.transport_option_id) : 'Não incluso'}</p>
                                    {booking.coupon_id && <p><span className="text-neutral-500">Cupom:</span> {booking.coupon_id}</p>}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500">
                      Nenhuma reserva encontrada com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print View (Hidden in Screen) */}
      <div className="hidden print:block print:p-8">
        <h1 className="text-2xl font-bold mb-2 text-black">Lista de Passageiros - Aventure-se</h1>
        <p className="text-sm text-gray-600 mb-6">Impresso em: {new Date().toLocaleString('pt-BR')}</p>
        
        <table className="w-full text-left border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Nome</th>
              <th className="border border-gray-300 p-2">Documento</th>
              <th className="border border-gray-300 p-2">Telefone</th>
              <th className="border border-gray-300 p-2">Viagem</th>
              <th className="border border-gray-300 p-2">Hospedagem</th>
              <th className="border border-gray-300 p-2">Embarque</th>
              <th className="border border-gray-300 p-2 text-center w-16">Presença</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.filter(b => b.payment_status === 'confirmed').map((b, i) => {
              const trip = trips.find(t => t.id === b.trip_id);
              return (
                <tr key={i}>
                  <td className="border border-gray-300 p-2 font-medium">{b.passenger_name}</td>
                  <td className="border border-gray-300 p-2">{b.passenger_document}</td>
                  <td className="border border-gray-300 p-2">{b.passenger_phone}</td>
                  <td className="border border-gray-300 p-2">{trip?.title}</td>
                  <td className="border border-gray-300 p-2">{trip?.accommodations?.find(a => a.id === b.accommodation_id)?.label || '-'}</td>
                  <td className="border border-gray-300 p-2">{b.transport_option_id ? (trip?.transport_options?.find(t => t.id === b.transport_option_id)?.label || '-') : '-'}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <div className="w-5 h-5 border border-gray-400 mx-auto rounded-sm"></div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-gray-500">* Apenas reservas confirmadas são exibidas na lista de impressão.</p>
      </div>

    </div>
  );
}
