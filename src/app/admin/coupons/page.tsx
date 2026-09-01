'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, X, Save, Tag, Percent, DollarSign, Calendar, ToggleLeft, ToggleRight, ChevronLeft, Copy, Ticket } from 'lucide-react';
import { getCoupons, saveCoupon, deleteCoupon } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Coupon } from '@/types';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = () => {
    try {
      setCoupons(getCoupons());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon({ ...coupon });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingCoupon({
      id: crypto.randomUUID(),
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_purchase: 0,
      max_uses: null,
      current_uses: 0,
      expires_at: null,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      deleteCoupon(id);
      loadCoupons();
    }
  };

  const handleToggleActive = (coupon: Coupon) => {
    saveCoupon({ ...coupon, is_active: !coupon.is_active });
    loadCoupons();
  };

  const handleSave = () => {
    if (editingCoupon && editingCoupon.code) {
      saveCoupon(editingCoupon as Coupon);
      setShowModal(false);
      setEditingCoupon(null);
      loadCoupons();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-adventure-dark text-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-adventure-dark text-slate-900 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-700 hover:text-amber-500 w-fit transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <Link href="/admin">Voltar ao Dashboard</Link>
        </div>

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f7f3e9] flex items-center gap-3">
              Gerenciar Cupons
            </h1>
            <p className="text-slate-700 mt-1">Crie códigos de desconto promocionais para seus clientes.</p>
          </div>
          <button 
            onClick={handleNew}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-medium py-2.5 px-4 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Novo Cupom
          </button>
        </header>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map(coupon => {
            const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false;
            const isDepleted = coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses;
            const canUse = coupon.is_active && !isExpired && !isDepleted;

            return (
              <div key={coupon.id} className="bg-adventure-card/50 border border-neutral-300 rounded-2xl p-6 flex flex-col relative overflow-hidden group">
                {/* Status Indicator Line */}
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  canUse ? 'bg-amber-500' : 'bg-neutral-700'
                }`}></div>

                <div className="flex justify-between items-start mb-4">
                  <div className="bg-adventure-card/80 border border-neutral-300 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span className="font-mono font-bold tracking-wider text-slate-900">{coupon.code}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(coupon)} className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 rounded-md transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(coupon.id)} className="p-1.5 text-neutral-400 hover:text-red-400 bg-neutral-800/50 hover:bg-neutral-800 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-black text-slate-900">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)}
                  </span>
                  <span className="text-sm text-slate-700">de desconto</span>
                </div>

                <div className="space-y-2.5 mb-6 flex-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-700">Compra Mínima:</span>
                    <span className="text-slate-700 font-medium">{coupon.min_purchase > 0 ? formatCurrency(coupon.min_purchase) : 'Livre'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Uso:</span>
                    <span className="text-slate-700 font-medium">
                      {coupon.current_uses} / {coupon.max_uses === null ? 'Ilimitado' : coupon.max_uses}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Validade:</span>
                    <span className={`font-medium ${isExpired ? 'text-red-400' : 'text-slate-700'}`}>
                      {coupon.expires_at ? formatDate(coupon.expires_at) : 'Sempre válido'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex w-2.5 h-2.5 rounded-full ${
                      canUse ? 'bg-blue-500 shadow-[0_0_8px_rgba(15,131,247,0.5)]' :
                      isExpired ? 'bg-red-500' : 
                      isDepleted ? 'bg-neutral-600' : 'bg-neutral-600'
                    }`}></span>
                    <span className="text-xs font-medium text-neutral-400">
                      {canUse ? 'Ativo' : isExpired ? 'Expirado' : isDepleted ? 'Esgotado' : 'Inativo'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleToggleActive(coupon)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      coupon.is_active ? 'text-amber-500 hover:text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {coupon.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    {coupon.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            );
          })}
          
          {coupons.length === 0 && (
            <div className="col-span-full py-12 text-center bg-adventure-card/50 border border-neutral-300 border-dashed rounded-2xl">
              <Ticket className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum cupom criado</h3>
              <p className="text-slate-700 text-sm">Crie seu primeiro cupom para oferecer descontos.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && editingCoupon && (
        <div className="fixed inset-0 z-50 bg-adventure-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-adventure-card border border-neutral-300 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-neutral-300 bg-adventure-card">
              <h2 className="text-xl font-bold text-slate-900">
                {editingCoupon.id && coupons.some(c => c.id === editingCoupon.id) ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-600 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              
              <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Código do Cupom</label>
                <input 
                  type="text" 
                  value={editingCoupon.code || ''} 
                  onChange={e => setEditingCoupon({...editingCoupon, code: e.target.value.toUpperCase().replace(/\s/g, '')})}
                  placeholder="EX: VERAO2024"
                  className="w-full bg-adventure-card border border-neutral-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono uppercase focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tipo de Desconto</label>
                  <select 
                    value={editingCoupon.discount_type} 
                    onChange={e => setEditingCoupon({...editingCoupon, discount_type: e.target.value as 'percentage' | 'fixed'})}
                    className="w-full bg-adventure-card border border-neutral-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 appearance-none"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Valor</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      {editingCoupon.discount_type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                    </div>
                    <input 
                      type="number" 
                      min="0"
                      value={editingCoupon.discount_value || 0} 
                      onChange={e => setEditingCoupon({...editingCoupon, discount_value: parseFloat(e.target.value)})}
                      className="w-full bg-adventure-card border border-neutral-300 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Compra Mínima (R$ 0 = sem limite)</label>
                <input 
                  type="number" 
                  min="0"
                  value={editingCoupon.min_purchase || 0} 
                  onChange={e => setEditingCoupon({...editingCoupon, min_purchase: parseFloat(e.target.value)})}
                  className="w-full bg-adventure-card border border-neutral-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Limite de Usos (vazio = ilimitado)</label>
                <input 
                  type="number" 
                  min="0"
                  value={editingCoupon.max_uses === null ? '' : editingCoupon.max_uses} 
                  onChange={e => setEditingCoupon({...editingCoupon, max_uses: e.target.value ? parseInt(e.target.value) : null})}
                  placeholder="Ilimitado"
                  className="w-full bg-adventure-card border border-neutral-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Data de Expiração (opcional)</label>
                <input 
                  type="date" 
                  value={editingCoupon.expires_at ? editingCoupon.expires_at.split('T')[0] : ''} 
                  onChange={e => setEditingCoupon({...editingCoupon, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

            </div>
            
            <div className="p-5 border-t border-neutral-300 flex justify-end gap-3 bg-adventure-card">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-adventure-card hover:bg-adventure-card/90 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={!editingCoupon.code}
                className="px-5 py-2.5 text-sm font-medium text-neutral-950 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar Cupom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
