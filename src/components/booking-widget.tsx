'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trip } from '@/types';
import { formatCurrency, getRemainingSpots, getScarcityBadge, getAccommodationIcon } from '@/lib/utils';
import { Shield, CreditCard, Zap } from 'lucide-react';
import { getPackagePrice, TRANSPORT_PRICE } from '@/lib/pricing';

interface BookingWidgetProps {
  trip: Trip;
  initialAccommodationId?: string | null;
}

export function BookingWidget({ trip, initialAccommodationId }: BookingWidgetProps) {
  const [selectedAccId, setSelectedAccId] = useState<string>(initialAccommodationId || '');
  const [selectedTrpId, setSelectedTrpId] = useState<string>('transport'); // 'transport' or 'none'

  useEffect(() => {
    if (initialAccommodationId && trip.accommodations?.some(accommodation => accommodation.id === initialAccommodationId)) {
      setSelectedAccId(initialAccommodationId);
      return;
    }
    if (trip.accommodations && trip.accommodations.length > 0) {
      const firstAvail = trip.accommodations.find(a => (a.capacity - a.booked_count) > 0);
      if (firstAvail) setSelectedAccId(firstAvail.id);
    }
  }, [trip, initialAccommodationId]);

  const selectedAcc = trip.accommodations?.find(a => a.id === selectedAccId);
  const accPrice = selectedAcc ? selectedAcc.price : 0;
  const firstTransport = trip.transport_options?.find(transport => transport.has_transport);
  const trpPrice = selectedTrpId === 'transport' ? TRANSPORT_PRICE : 0;
  const totalPrice = getPackagePrice(selectedAcc, selectedTrpId === 'transport', 'credit_card');
  const installmentPrice = totalPrice / 12;

  const isSoldOut = !trip.accommodations || trip.accommodations.every(a => (a.capacity - a.booked_count) <= 0);

  return (
    <div className="sticky top-24 rounded-2xl bg-[#f7f3e9]/80 backdrop-blur-xl border border-slate-200/40 p-6 shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Reserve sua vaga</h3>
        <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
          Vagas limitadas
        </span>
      </div>

      {/* Accommodations */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Acomodação</label>
        <div className="space-y-2">
          {trip.accommodations?.map(acc => {
            const available = acc.capacity - acc.booked_count;
            const disabled = available <= 0;
            const selected = selectedAccId === acc.id;
            const iconEmoji = getAccommodationIcon(acc.type);
            const badge = getScarcityBadge(acc.capacity, acc.booked_count);

            return (
              <button
                key={acc.id}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedAccId(acc.id)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  disabled ? 'opacity-50 cursor-not-allowed bg-adventure-card/30 border-neutral-300/20' :
                    selected ? 'bg-adventure-card/40 border-neutral-300' :
                  'bg-adventure-card/30 border-neutral-300/20 hover:border-neutral-300/40'
                }`}
              >
                <div className={`p-2 rounded-lg ${selected ? 'bg-blue-500/20 text-blue-400' : 'bg-adventure-card/40 text-slate-700'}`}>
                  <span className="text-xl leading-none">{iconEmoji}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-slate-900">{acc.label}</span>
                    <span className="font-semibold text-blue-400">{formatCurrency(acc.price)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                      <span className={`text-xs ${disabled ? 'text-red-400' : 'text-slate-700'}`}>
                      {disabled ? 'Esgotado' : `${available} vaga${available !== 1 ? 's' : ''} restante${available !== 1 ? 's' : ''}`}
                    </span>
                    {badge && <span className="text-xs">{badge.text}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transport */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Transporte</label>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setSelectedTrpId('transport')}
            className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${
              selectedTrpId === 'transport' ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(15,131,247,0.1)]' : 'bg-adventure-card/30 border-neutral-300/20 hover:border-neutral-300/40'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-900">Com transporte</span>
              <span className="font-semibold text-blue-400">{formatCurrency(firstTransport?.price || 0)}</span>
            </div>
            <p className="text-xs text-slate-700">Saindo de {firstTransport?.origin || ''}</p>
          </button>
          
          <button
            type="button"
            onClick={() => setSelectedTrpId('none')}
            className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${
              selectedTrpId === 'none' ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(15,131,247,0.1)]' : 'bg-adventure-card/30 border-neutral-300/20 hover:border-neutral-300/40'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-900">Ir por conta própria</span>
              <span className="font-semibold text-gray-400">Incluso</span>
            </div>
            <p className="text-xs text-slate-700">Encontro direto no local</p>
          </button>
        </div>
      </div>

      {/* Price Calculator */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <div className="flex justify-between text-sm text-slate-700">
          <span>Acomodação</span>
          <span>{formatCurrency(accPrice)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-700">
          <span>Transporte</span>
          <span>{selectedTrpId === 'transport' ? formatCurrency(trpPrice) : 'Incluso'}</span>
        </div>
            <div className="pt-2 flex justify-between items-end">
            <span className="text-slate-900 font-medium">Total</span>
          <div className="text-right">
            <span className="text-3xl font-bold text-blue-400 leading-none">{formatCurrency(totalPrice)}</span>
            <p className="text-sm text-slate-700 mt-1">ou 12x de {formatCurrency(installmentPrice)}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link 
        href={!selectedAccId || isSoldOut ? '#' : `/checkout/${trip.id}?acc=${selectedAccId}&trp=${selectedTrpId === 'transport' ? firstTransport?.id || 'trp-with' : 'trp-without'}`}
        className={`w-full py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 ${
          !selectedAccId || isSoldOut 
            ? 'bg-adventure-card/40 text-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-[0_0_20px_rgba(15,131,247,0.25)] hover:shadow-[0_0_30px_rgba(15,131,247,0.4)]'
        }`}
      >
        Garantir minha vaga
      </Link>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
        <div className="flex flex-col items-center text-center gap-1">
          <Shield size={18} className="text-blue-400" />
          <span className="text-[10px] text-slate-700 uppercase tracking-wider">Pagamento seguro</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1">
          <CreditCard size={18} className="text-blue-400" />
          <span className="text-[10px] text-slate-700 uppercase tracking-wider">Até 12x no cartão</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1">
          <Zap size={18} className="text-blue-400" />
          <span className="text-[10px] text-slate-700 uppercase tracking-wider">PIX com desconto</span>
        </div>
      </div>
    </div>
  );
}
