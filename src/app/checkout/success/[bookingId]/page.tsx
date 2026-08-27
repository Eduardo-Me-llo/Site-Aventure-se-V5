'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, MessageCircle, Printer, Home, Backpack, Sun, Droplets, Flashlight, Mail, Info } from 'lucide-react';
import { VoucherCard } from '@/components/voucher-card';
import { getBookingById, getTripById } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      const b = getBookingById(bookingId);
      if (b) {
        setBooking(b);
        const t = getTripById(b.trip_id);
        setTrip(t);
      }
      setIsLoading(false);
    }
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-adventure-dark text-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking || !trip) {
    return (
      <div className="min-h-screen bg-adventure-dark text-slate-900 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Reserva não encontrada</h1>
        <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors">
          <Home className="w-4 h-4" /> Voltar ao Início
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const checklist = [
    { icon: <Info className="w-5 h-5 text-blue-400" />, text: "Documento de identidade original" },
    { icon: <Sun className="w-5 h-5 text-yellow-400" />, text: "Protetor solar e repelente" },
    { icon: <Droplets className="w-5 h-5 text-blue-400" />, text: "Roupa de banho e toalha" },
    { icon: <Backpack className="w-5 h-5 text-orange-400" />, text: "Chinelo ou papete" },
    { icon: <Flashlight className="w-5 h-5 text-zinc-400" />, text: "Lanterna e garrafa d'água" },
  ];

  return (
  <div className="min-h-screen bg-adventure-dark text-slate-900 pt-24 pb-16 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-75 opacity-70"></div>
        <div className="absolute top-40 right-1/4 w-4 h-4 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-80"></div>
        <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-blue-500 rounded-full animate-bounce opacity-70 delay-150"></div>
        
        {/* Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-500/20 rounded-full mb-6 relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
            <CheckCircle className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-transparent">
            Reserva Confirmada!
          </h1>
          <p className="text-xl text-slate-700">
            Código: <span className="font-mono font-bold text-slate-900 bg-adventure-card/80 px-3 py-1 rounded-md border border-neutral-300">{bookingId.toUpperCase()}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 animate-in fade-in slide-in-from-left-8 duration-700 delay-150">
            <VoucherCard booking={booking} trip={trip} />
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8 print:hidden">
              <a 
                href="#"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-900/20 group"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Entrar no Grupo WhatsApp
              </a>
              <button 
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-transparent border border-neutral-300 hover:border-blue-500 hover:bg-adventure-card text-slate-700 rounded-xl font-medium transition-all"
              >
                <Printer className="w-5 h-5" />
                Imprimir Voucher
              </button>
            </div>
            
            <div className="mt-6 text-center print:hidden">
              <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-blue-400 transition-colors">
                <Home className="w-4 h-4" /> Voltar ao Início
              </Link>
            </div>
          </div>

            <div className="lg:col-span-5 space-y-6 print:hidden animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
              <div className="bg-adventure-card/80 backdrop-blur-md border border-neutral-300 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-blue-400">
                  <Backpack className="w-5 h-5" />
                  O que levar na viagem
                </h3>
                <ul className="space-y-4">
                  {checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5">{item.icon}</div>
                      <span className="text-slate-700">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-adventure-card/60 backdrop-blur-md border border-neutral-300 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-900">Dúvidas? Fale conosco</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-3 text-slate-700 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-adventure-card/70">
                    <MessageCircle className="w-5 h-5" />
                    <span>(11) 99999-9999</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 text-slate-700 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-adventure-card/70">
                    <Mail className="w-5 h-5" />
                    <span>suporte@aventurese.com.br</span>
                  </a>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
