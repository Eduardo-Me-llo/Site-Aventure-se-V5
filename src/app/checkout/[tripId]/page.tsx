'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  CreditCard, QrCode, Tag, Copy, Check, ChevronRight, ChevronLeft, 
  Shield, Lock, Loader2, User, Phone, FileText, AlertCircle, Clock 
} from 'lucide-react';
import { getTripById, validateCoupon, calculateDiscount, createBooking, confirmBooking } from '@/lib/store';
import { formatCurrency, formatDateRange } from '@/lib/utils';
import { BookingFormData, Coupon } from '@/types';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPackagePrice, PIX_DISCOUNT } from '@/lib/pricing';
import { createBookingTransaction } from '@/lib/supabase/bookings';

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tripId = params.tripId as string;
  const accId = searchParams.get('acc');
  const trpId = searchParams.get('trp');
  
  const [trip, setTrip] = useState<any>(null);
  const [selectedAcc, setSelectedAcc] = useState<any>(null);
  const [selectedTrp, setSelectedTrp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    passenger_name: '',
    passenger_document: '',
    passenger_phone: '',
    passenger_rg: '', passenger_rg_issuer: '', passenger_birth_date: '', passenger_neighborhood: '',
    passenger_emergency_contact: '',
    passenger_emergency_phone: '', passenger_health_condition: '', passenger_medication: '',
    passenger_physical_fitness: false, passenger_terms_accepted: false, accommodation_companions: '',
    departure_location: '', departure_time_preference: '', residence_location: '', referral_source: '',
    payment_option: 'pix_cash'
  });
  const [commitmentTerms, setCommitmentTerms] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{success: boolean, message: string} | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixTimer, setPixTimer] = useState(1800); // 30 minutes
  const [copied, setCopied] = useState(false);
  
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: 1
  });

  useEffect(() => {
    const fetchTrip = async () => {
      setIsLoading(true);
      try {
        const tripData = await getTripById(tripId);
        if (!tripData) {
          setError('Viagem não encontrada.');
          setIsLoading(false);
          return;
        }
        
        setTrip(tripData);
        
        if (accId && tripData.accommodations) {
          const acc = tripData.accommodations.find((a: any) => a.id === accId);
          if (acc) setSelectedAcc(acc);
        }
        
        if (trpId && tripData.transport_options) {
          const trp = tripData.transport_options.find((t: any) => t.id === trpId || (trpId === 'transport' && t.has_transport));
          if (trp) setSelectedTrp(trp);
        }
        
      } catch (err) {
        setError('Erro ao carregar dados da viagem.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrip();
  }, [tripId, accId, trpId]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void createClient().from('site_settings').select('value').eq('key', 'commitment_terms').maybeSingle()
      .then(({ data }) => setCommitmentTerms(data?.value || ''));
  }, []);

  useEffect(() => {
    if (paymentMethod === 'pix' && currentStep === 2) {
      const timer = setInterval(() => {
        setPixTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentMethod, currentStep]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCardData((prev: any) => ({ ...prev, [name]: value }));
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    
    const result = await validateCoupon(couponCode, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponResult({ success: true, message: 'Cupom aplicado com sucesso!' });
    } else {
      setAppliedCoupon(null);
      setCouponResult({ success: false, message: result.error || 'Cupom inválido.' });
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136a1f4e...');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setCurrentStep(3);
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const finalFormData: BookingFormData = {
        passenger_name: formData.passenger_name,
        passenger_document: formData.passenger_document,
        passenger_phone: formData.passenger_phone,
        passenger_rg: formData.passenger_rg,
        passenger_rg_issuer: formData.passenger_rg_issuer,
        passenger_birth_date: formData.passenger_birth_date,
        passenger_neighborhood: formData.passenger_neighborhood,
        passenger_health_condition: formData.passenger_health_condition,
        passenger_medication: formData.passenger_medication,
        passenger_physical_fitness: formData.passenger_physical_fitness,
        passenger_terms_accepted: formData.passenger_terms_accepted,
        accommodation_companions: formData.accommodation_companions,
        departure_location: formData.departure_location,
        departure_time_preference: formData.departure_time_preference,
        residence_location: formData.residence_location,
        referral_source: formData.referral_source,
        passenger_emergency_contact: formData.passenger_emergency_contact,
        passenger_emergency_phone: formData.passenger_emergency_phone,
        accommodation_id: selectedAcc?.id || '',
        transport_option_id: selectedTrp?.id || '',
        coupon_code: appliedCoupon?.code || '',
        payment_method: paymentMethod,
        payment_installments: paymentMethod === 'credit_card' ? Number(cardData.installments) : 1
        , payment_option: formData.payment_option
      };
      
      const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      const booking = isSupabaseConfigured && isUuid(trip.id) && isUuid(selectedAcc.id) && isUuid(selectedTrp.id)
        ? await createBookingTransaction(trip, selectedAcc, selectedTrp, appliedCoupon, finalFormData)
        : await createBooking(trip, selectedAcc, selectedTrp, appliedCoupon, finalFormData);
      if (isSupabaseConfigured && isUuid(booking.id)) {
        router.push(`/checkout/success/${booking.id}`);
      } else {
        await confirmBooking(booking.id);
        router.push(`/checkout/success/${booking.id}`);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setCurrentStep(2);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-adventure-dark flex flex-col items-center justify-center text-blue-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-slate-700">Carregando informações do checkout...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-adventure-dark flex flex-col items-center justify-center text-slate-700 p-6">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ops! Algo deu errado.</h1>
        <p className="mb-6 text-slate-700">{error || 'Não foi possível carregar o checkout.'}</p>
        <button 
          onClick={() => router.back()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  const basePrice = trip.price || 0;
  const accPrice = selectedAcc?.price || 0;
  const trpPrice = selectedTrp?.price || 0;
  const subtotal = basePrice + (selectedAcc
    ? getPackagePrice(selectedAcc, Boolean(selectedTrp?.has_transport), 'credit_card')
    : trpPrice);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = calculateDiscount(appliedCoupon, subtotal);
  }
  
  const pixDiscount = paymentMethod === 'pix' ? PIX_DISCOUNT : 0;
  const total = subtotal - discountAmount - pixDiscount;

  return (
    <div className="min-h-screen bg-adventure-dark pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Progress Bar */}
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 -z-10 rounded-full transition-all duration-500"
              style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
            ></div>
            
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                  ${currentStep > step ? 'bg-blue-500 text-white' : 
                    currentStep === step ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 
                    'bg-slate-800 text-slate-400 border border-slate-700'}`}
                >
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                <span className={`mt-2 text-xs sm:text-sm font-medium ${currentStep >= step ? 'text-blue-400' : 'text-slate-500'}`}>
                  {step === 1 ? 'Dados' : step === 2 ? 'Pagamento' : 'Confirmação'}
                </span>
              </div>
            ))}
          </div>
        </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column - Form */}
          <div className="w-full lg:w-3/5">
            {currentStep === 1 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <User className="w-6 h-6 mr-3 text-blue-500" />
                  Dados do Passageiro
                </h2>
                
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setCurrentStep(2); }}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
                    <input 
                      required
                      type="text" 
                      name="passenger_name"
                      value={formData.passenger_name}
                      onChange={handleInputChange}
                      className="w-full bg-adventure-card border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition-all"
                      placeholder="Como consta no documento"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">CPF</label>
                      <input 
                        required
                        type="text" 
                        name="passenger_document"
                        value={formData.passenger_document}
                        onChange={handleInputChange}
                        className="w-full bg-adventure-card border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition-all"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
                      <input 
                        required
                        type="tel" 
                        name="passenger_phone"
                        value={formData.passenger_phone}
                        onChange={handleInputChange}
                        className="w-full bg-adventure-card border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Número do RG*</label><input required name="passenger_rg" value={formData.passenger_rg} onChange={handleInputChange} className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Órgão expedidor*</label><input required name="passenger_rg_issuer" value={formData.passenger_rg_issuer} onChange={handleInputChange} className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Data de nascimento*</label><input required type="date" name="passenger_birth_date" value={formData.passenger_birth_date} onChange={handleInputChange} className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Bairro onde mora?</label><input name="passenger_neighborhood" value={formData.passenger_neighborhood} onChange={handleInputChange} className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1.5">Local onde mora?</label><input name="residence_location" value={formData.residence_location} onChange={handleInputChange} className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900" /></div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-slate-500" />
                      Contato de Emergência
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do contato</label>
                        <input 
                          type="text" 
                          name="passenger_emergency_contact"
                          value={formData.passenger_emergency_contact}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition-all"
                          placeholder="Nome do parente ou amigo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone de emergência</label>
                        <input 
                          type="tel" 
                          name="passenger_emergency_phone"
                          value={formData.passenger_emergency_phone}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition-all"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 border-t border-slate-200 pt-5">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Problema de saúde? Se sim, qual?*</label><textarea required name="passenger_health_condition" value={formData.passenger_health_condition} onChange={handleInputChange} rows={2} className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Faz uso de medicamento? Se sim, qual?</label><textarea name="passenger_medication" value={formData.passenger_medication} onChange={handleInputChange} rows={2} className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Quem dividirá a acomodação com você?</label><textarea name="accommodation_companions" value={formData.accommodation_companions} onChange={handleInputChange} rows={2} className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-sm font-medium text-slate-700 mb-1.5">Local de saída</label><select name="departure_location" value={formData.departure_location} onChange={handleInputChange} className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900"><option value="">Selecione</option><option>Posto Select - Niterói</option><option>Praça Afonso Pena - Tijuca</option></select></div><div><label className="block text-sm font-medium text-slate-700 mb-1.5">Horário de saída*</label><select required name="departure_time_preference" value={formData.departure_time_preference} onChange={handleInputChange} className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900"><option value="">Selecione</option><option value="morning">Dia 29 de manhã cedinho</option><option value="night">Dia 29 à noite, pós-expediente</option></select></div></div>
                    <input name="referral_source" value={formData.referral_source} onChange={handleInputChange} placeholder="Indicação" className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900" />
                    <label className="flex items-center gap-3 text-sm text-slate-700"><input required type="checkbox" checked={formData.passenger_physical_fitness} onChange={(event) => setFormData((prev: any) => ({ ...prev, passenger_physical_fitness: event.target.checked }))} /> Declaro aptidão física para a viagem.*</label>
                    <label className="flex items-start gap-3 text-sm text-slate-700"><input required type="checkbox" checked={formData.passenger_terms_accepted} onChange={(event) => setFormData((prev: any) => ({ ...prev, passenger_terms_accepted: event.target.checked }))} /><span>Declaro que aceito os termos do Aventure-se.* <Link href="/termos" target="_blank" className="text-blue-600 underline">Ler termo de compromisso</Link></span></label>
                    {commitmentTerms && <div className="max-h-32 overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">{commitmentTerms}</div>}
                  </div>
                  
                  <div className="pt-6">
                    <button 
                      type="submit"
                      className="w-full flex items-center justify-center py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20"
                    >
                      Continuar
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xl">
                <div className="flex items-center mb-6">
                  <button onClick={() => setCurrentStep(1)} className="mr-3 text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-2xl font-bold text-slate-900">Pagamento</h2>
                </div>
                
                {/* Coupon Section */}
                      <div className="mb-8 p-5 bg-adventure-card rounded-xl border border-neutral-300">
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-blue-500" />
                    Cupom de desconto
                  </label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="min-w-0 flex-1 bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2 text-slate-900 outline-none uppercase"
                      placeholder="CÓDIGO"
                    />
                    <button 
                      onClick={applyCoupon}
                      className="px-5 py-2 bg-adventure-card/80 hover:bg-adventure-card text-blue-400 rounded-lg font-medium transition-colors border border-neutral-300"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponResult && (
                    <p className={`mt-2 text-sm flex items-center ${couponResult.success ? 'text-blue-400' : 'text-rose-400'}`}>
                      {couponResult.success ? <Check className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                      {couponResult.message}
                    </p>
                  )}
                </div>
                
                {/* Payment Methods */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`flex-1 py-4 flex flex-col items-center justify-center rounded-xl border-2 transition-all ${
                      paymentMethod === 'pix' 
                        ? 'border-blue-500 bg-blue-50 text-slate-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <QrCode className="w-6 h-6 mb-2" />
                    <span className="font-medium">PIX</span>
                    <span className="text-xs text-blue-500 mt-1">5% de desconto</span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex-1 py-4 flex flex-col items-center justify-center rounded-xl border-2 transition-all ${
                      paymentMethod === 'credit_card' 
                        ? 'border-blue-500 bg-blue-50 text-slate-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mb-2" />
                    <span className="font-medium">Cartão de Crédito</span>
                    <span className="text-xs mt-1 opacity-70">Até 12x</span>
                  </button>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Forma de pagamento*</label>
                  <select required value={formData.payment_option} onChange={handleInputChange} name="payment_option" className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-slate-900">
                    <option value="pix_cash">PIX à vista com desconto</option>
                    <option value="pix_5x">PIX parcelado em 5x</option>
                    <option value="entry_installments">Entrada + parcelado</option>
                    {Array.from({ length: 11 }, (_, index) => index + 2).map((installment) => <option key={installment} value={`installments_${installment}`}>Parcelado em {installment}x</option>)}
                    <option value="other">Outro</option>
                  </select>
                </div>
                
                {/* PIX Tab */}
                {paymentMethod === 'pix' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="inline-flex items-center justify-center bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium mb-6">
                      <Clock className="w-4 h-4 mr-2" />
                      Expira em {formatTime(pixTimer)}
                    </div>
                    
                    {/* Simulated QR Code */}
                    <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-white rounded-xl p-3 mb-6 relative shadow-sm">
                      <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-0.5">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div key={i} className={`bg-slate-900 ${Math.random() > 0.4 ? 'opacity-100' : 'opacity-0'}`}></div>
                        ))}
                      </div>
                      {/* Corner markers */}
                      <div className="absolute top-4 left-4 w-10 h-10 border-4 border-slate-900"></div>
                      <div className="absolute top-4 right-4 w-10 h-10 border-4 border-slate-900"></div>
                      <div className="absolute bottom-4 left-4 w-10 h-10 border-4 border-slate-900"></div>
                    </div>
                    
                    <div className="mb-6 text-left">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Código Copia e Cola</label>
                      <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <input 
                          type="text" 
                          readOnly 
                          value="00020126580014br.gov.bcb.pix0136a1f4e..." 
                          className="flex-1 bg-transparent px-4 py-3 text-slate-700 outline-none font-mono text-sm"
                        />
                        <button 
                          onClick={copyPixCode}
                          className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center"
                        >
                          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={processPayment}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all"
                    >
                      Já realizei o pagamento
                    </button>
                  </div>
                )}
                
                {/* Credit Card Tab */}
                {paymentMethod === 'credit_card' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); processPayment(); }}>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Número do cartão</label>
                        <div className="relative">
                          <input 
                            required
                            type="text" 
                            name="number"
                            value={cardData.number}
                            onChange={handleCardChange}
                            className="w-full bg-adventure-card border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 pl-12 text-slate-900 placeholder-slate-500 outline-none transition-all"
                            placeholder="0000 0000 0000 0000"
                          />
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome no cartão</label>
                        <input 
                          required
                          type="text" 
                          name="name"
                          value={cardData.name}
                          onChange={handleCardChange}
                          className="w-full bg-adventure-card border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition-all"
                          placeholder="Nome impresso no cartão"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Validade</label>
                          <input 
                            required
                            type="text" 
                            name="expiry"
                            value={cardData.expiry}
                            onChange={handleCardChange}
                            className="w-full bg-adventure-card border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition-all"
                            placeholder="MM/AA"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">CVV</label>
                          <input 
                            required
                            type="text" 
                            name="cvv"
                            value={cardData.cvv}
                            onChange={handleCardChange}
                            className="w-full bg-adventure-card border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition-all"
                            placeholder="123"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Parcelamento</label>
                        <select 
                          name="installments"
                          value={cardData.installments}
                          onChange={handleCardChange}
                          className="w-full bg-adventure-card border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-slate-900 outline-none transition-all appearance-none"
                        >
                          {Array.from({ length: 12 }).map((_, i) => {
                            const inst = i + 1;
                            const instValue = total / inst;
                            return (
                              <option key={inst} value={inst}>
                                {inst}x de {formatCurrency(instValue)} {inst === 1 ? 'sem juros' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      
                      <button 
                        type="submit"
                        className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20"
                      >
                        Finalizar Compra
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="bg-adventure-card border border-neutral-300 rounded-2xl p-12 shadow-xl flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                  <div className="relative bg-slate-950 p-4 rounded-full border border-slate-800">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Processando pagamento...</h2>
                <p className="text-slate-700">Por favor, não feche esta página.</p>
              </div>
            )}
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-2/5 sticky top-24">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">
                Resumo da Compra
              </h3>
              
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-1">{trip.title}</h4>
                <p className="text-sm text-slate-400">
                  {formatDateRange(trip.startDate, trip.endDate)} • {trip.durationDays} dias
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pacote Base</span>
                  <span className="text-white font-medium">{formatCurrency(basePrice)}</span>
                </div>
                
                {selectedAcc && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Acomodação: {selectedAcc.name}</span>
                    <span className="text-white font-medium">{formatCurrency(accPrice)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Transporte: {selectedTrp ? selectedTrp.name : 'Por conta própria'}</span>
                  <span className="text-white font-medium">{selectedTrp ? formatCurrency(trpPrice) : 'Grátis'}</span>
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="text-white">{formatCurrency(subtotal)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-blue-400">
                    <span className="flex items-center"><Tag className="w-3 h-3 mr-1" /> Cupom ({appliedCoupon.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                
                {paymentMethod === 'pix' && pixDiscount > 0 && (
                  <div className="flex justify-between text-sm text-blue-400">
                    <span className="flex items-center"><QrCode className="w-3 h-3 mr-1" /> Desconto PIX (5%)</span>
                    <span>-{formatCurrency(pixDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-end pt-2">
                  <span className="text-base font-medium text-slate-300">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white block">{formatCurrency(total)}</span>
                    {paymentMethod === 'credit_card' && (
                      <span className="text-xs text-slate-400">
                        Em até 12x de {formatCurrency(total / 12)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center gap-6 text-slate-500 text-xs">
                <div className="flex flex-col items-center">
                  <Shield className="w-5 h-5 mb-1 text-blue-500/70" />
                  <span>Pagamento seguro</span>
                </div>
                <div className="flex flex-col items-center">
                  <Lock className="w-5 h-5 mb-1 text-blue-500/70" />
                  <span>Dados protegidos</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
