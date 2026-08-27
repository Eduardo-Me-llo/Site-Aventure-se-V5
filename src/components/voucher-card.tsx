'use client';

import { Booking, Trip } from '@/types';
import { formatCurrency, formatDateRange, formatDate } from '@/lib/utils';
import { MapPin, Calendar, User, Phone, Bus, Printer, QrCode, Ticket } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';

interface VoucherCardProps {
  booking: Booking;
  trip: Trip;
}

export function VoucherCard({ booking, trip }: VoucherCardProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 print:shadow-none print:border-none print:m-0 print:w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex justify-between items-center text-white">
        <div>
          <BrandLogo className="h-16 w-40 brightness-0 invert" />
          <p className="text-blue-100 text-sm uppercase tracking-wider font-semibold mt-1">Voucher de Embarque</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Código da Reserva</p>
          <div className="border border-dashed border-blue-300/50 bg-blue-800/30 px-4 py-2 rounded font-mono text-xl font-bold tracking-widest">
            {booking.booking_code}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Trip Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-700 text-sm mb-1">
              <MapPin className="w-4 h-4" /> Destino
            </div>
            <p className="font-semibold text-slate-900 text-lg">{trip.destination}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-700 text-sm mb-1">
              <Calendar className="w-4 h-4" /> Data
            </div>
            <p className="font-semibold text-slate-900">{formatDateRange(trip.start_date, trip.end_date)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Ticket className="w-4 h-4" /> Hospedagem
            </div>
            <p className="font-semibold text-gray-900">{trip.accommodations?.find(a => a.id === booking.accommodation_id)?.label || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Bus className="w-4 h-4" /> Transporte
            </div>
            <p className="font-semibold text-gray-900">
              {booking.transport_included ? `Sim (saindo de ${trip.transport_options?.find(t => t.has_transport)?.origin || ''})` : 'Por conta própria'}
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-gray-200 border-dashed" />

        {/* Passenger Info & QR Code */}
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="space-y-4 flex-1">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Dados do Passageiro</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm text-slate-700">Nome</p>
                  <p className="font-medium text-slate-900">{booking.passenger_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ticket className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Documento</p>
                  <p className="font-medium text-gray-900">{booking.passenger_document}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium text-gray-900">{booking.passenger_phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-adventure-card/50 rounded-xl border border-neutral-300">
            {/* Fake QR Code Grid */}
            <div className="w-32 h-32 grid grid-cols-8 grid-rows-8 gap-0.5 p-2 bg-white border border-gray-200 rounded-lg">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className={`w-full h-full ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-white'}`} />
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 uppercase tracking-wider">
              <QrCode className="w-3 h-3" /> Scanner Exclusivo
            </p>
          </div>
        </div>

        {/* Meeting Point */}
        {booking.transport_included && (
          <>
            <div className="h-px w-full bg-gray-200 border-dashed" />
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wider mb-1">Ponto de Encontro</h4>
                <p className="text-blue-800 font-medium">{trip.meeting_point}</p>
                <p className="text-blue-600 text-sm mt-1">Chegue com 30 minutos de antecedência.</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-blue-600 uppercase tracking-wider mb-1">Horário</p>
                <p className="font-bold text-blue-900 text-xl">{trip.meeting_time}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-adventure-card/50 p-6 flex justify-between items-center border-t border-neutral-300">
        <div>
          <p className="text-slate-700 text-sm">Total pago</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(booking.total_amount)}</p>
        </div>
        <div className="text-right flex items-center gap-4">
          <p className="text-sm font-medium text-blue-600 print:block hidden">
            Apresente este voucher no embarque
          </p>
          <button
            onClick={handlePrint}
            className="print:hidden flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Imprimir Voucher
          </button>
        </div>
      </div>
    </div>
  );
}
