'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, X, Save, MapPin, Calendar, ChevronLeft, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { getAdminTrips, saveAdminTrip, deleteAdminTrip, uploadTripImage } from '@/lib/supabase/admin-data';
import { formatCurrency, formatDateRange, getRemainingSpots } from '@/lib/utils';
import { Trip, TripAccommodation, TripTransportOption, TripImage } from '@/types';

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Partial<Trip> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const data = await getAdminTrips();
      setTrips(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(JSON.parse(JSON.stringify(trip)));
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingTrip({
      id: crypto.randomUUID(),
      title: '',
      slug: '',
      destination: '',
      location: '',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000).toISOString(),
      description: '',
      cover_image: '',
      images: [],
      difficulty: 'leve',
      highlights: [],
      accommodations: [],
      transport_options: [],
      is_active: true,
      is_featured: false,
      status: 'draft',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta viagem?')) {
      await deleteAdminTrip(id);
      await loadTrips();
    }
  };

  const handleSave = async () => {
    if (editingTrip) {
      if (!editingTrip.title?.trim() || !editingTrip.slug?.trim() || !editingTrip.destination?.trim()) {
        alert('Preencha título, slug e destino antes de salvar.');
        return;
      }
      await saveAdminTrip(editingTrip as Trip);
      setShowModal(false);
      setEditingTrip(null);
      await loadTrips();
    }
  };

  const handleTripImageUpload = async (file: File, accommodationIndex?: number) => {
    if (!editingTrip) return;
    setUploadingImage(true);
    try {
      const url = await uploadTripImage(file, editingTrip.id || 'new-trip');
      if (typeof accommodationIndex === 'number') {
        updateAccommodation(accommodationIndex, { image_url: url });
      } else {
        setEditingTrip({ ...editingTrip, cover_image: url });
      }
    } catch (error) {
      console.error(error);
      alert('Não foi possível enviar a imagem. Verifique o bucket trip-images e as permissões de administrador.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryImageUpload = async (file: File) => {
    if (!editingTrip) return;
    setUploadingImage(true);
    try {
      const url = await uploadTripImage(file, `${editingTrip.id || 'new-trip'}/gallery`);
      const images = [...(editingTrip.images || []), {
        id: crypto.randomUUID(), trip_id: editingTrip.id || '', image_url: url,
        alt_text: editingTrip.title || 'Imagem da viagem', order_index: (editingTrip.images || []).length,
        created_at: new Date().toISOString(),
      } satisfies TripImage];
      setEditingTrip({ ...editingTrip, images });
    } catch (error) {
      console.error(error);
      alert('Não foi possível enviar a imagem da galeria.');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateAccommodation = (index: number, changes: Partial<TripAccommodation>) => {
    if (!editingTrip) return;
    const accommodations = [...(editingTrip.accommodations || [])];
    accommodations[index] = { ...accommodations[index], ...changes };
    setEditingTrip({ ...editingTrip, accommodations });
  };

  const addAccommodation = () => {
    if (!editingTrip) return;
    const accommodation: TripAccommodation = {
      id: crypto.randomUUID(), trip_id: editingTrip.id || '', type: 'pousada', label: 'Nova acomodação',
      description: '', amenities: [], price: 0, capacity: 0, booked_count: 0, check_in: null, check_out: null,
      created_at: new Date().toISOString(),
    };
    setEditingTrip({ ...editingTrip, accommodations: [...(editingTrip.accommodations || []), accommodation] });
  };

  const removeAccommodation = (index: number) => {
    if (!editingTrip) return;
    setEditingTrip({ ...editingTrip, accommodations: (editingTrip.accommodations || []).filter((_, itemIndex) => itemIndex !== index) });
  };

  const updateTransport = (index: number, changes: Partial<TripTransportOption>) => {
    if (!editingTrip) return;
    const transportOptions = [...(editingTrip.transport_options || [])];
    transportOptions[index] = { ...transportOptions[index], ...changes };
    setEditingTrip({ ...editingTrip, transport_options: transportOptions });
  };

  const addTransport = () => {
    if (!editingTrip) return;
    const transport: TripTransportOption = {
      id: crypto.randomUUID(), trip_id: editingTrip.id || '', label: 'Novo transporte', description: '', origin: '',
      has_transport: true, price: 0, capacity: 0, booked_count: 0, created_at: new Date().toISOString(),
    };
    setEditingTrip({ ...editingTrip, transport_options: [...(editingTrip.transport_options || []), transport] });
  };

  const removeTransport = (index: number) => {
    if (!editingTrip) return;
    setEditingTrip({ ...editingTrip, transport_options: (editingTrip.transport_options || []).filter((_, itemIndex) => itemIndex !== index) });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-adventure-dark text-slate-900 p-8 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-adventure-dark text-slate-900 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-500 w-fit transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <Link href="/admin">Voltar ao Dashboard</Link>
        </div>

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f7f3e9] flex items-center gap-3">
              Gerenciar Viagens
            </h1>
            <p className="text-slate-700 mt-1">Crie, edite e acompanhe o status dos pacotes de viagem.</p>
          </div>
          <button 
            onClick={handleNew}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium py-2.5 px-4 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Nova Viagem
          </button>
        </header>

        {/* Trips Table */}
        <div className="bg-adventure-card/50 border border-neutral-300 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-neutral-300 text-sm text-slate-600 bg-adventure-card">
                  <th className="py-4 px-6 font-medium">Viagem / Destino</th>
                  <th className="py-4 px-6 font-medium">Datas</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium">Ocupação (Total)</th>
                  <th className="py-4 px-6 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {trips.length > 0 ? (
                  trips.map((trip) => {
                    const accommodations = trip.accommodations || [];
                    const totalCapacity = accommodations.reduce((acc, curr) => acc + curr.capacity, 0);
                    const totalOccupied = accommodations.reduce((acc, curr) => acc + (curr.booked_count || 0), 0);
                    const occupationPercent = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;
                    
                      return (
                      <tr key={trip.id} className="hover:bg-adventure-card/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-900">{trip.title}</p>
                          <p className="text-xs text-slate-700 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {trip.destination}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-slate-700 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-neutral-500" />
                            {formatDateRange(trip.start_date, trip.end_date)}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium 
                            ${trip.status === 'active' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                              trip.status === 'sold_out' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                              'bg-adventure-card text-slate-700 border border-neutral-300'}`}>
                            {trip.status === 'active' ? 'Ativo' : trip.status === 'sold_out' ? 'Esgotado' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-adventure-card rounded-full overflow-hidden w-24">
                              <div 
                                className={`h-full rounded-full ${occupationPercent >= 100 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, occupationPercent)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-slate-700">{totalOccupied}/{totalCapacity}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(trip)} className="p-2 text-slate-700 hover:text-blue-500 bg-adventure-card/50 hover:bg-adventure-card rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(trip.id)} className="p-2 text-slate-700 hover:text-red-400 bg-adventure-card/50 hover:bg-adventure-card rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500">
                      Nenhuma viagem cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && editingTrip && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-3 sm:p-6">
          <div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                {editingTrip.id && trips.some(t => t.id === editingTrip.id) ? 'Editar Viagem' : 'Nova Viagem'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Configure os dados publicados, preços, imagens e logística.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} aria-label="Fechar edição" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 space-y-6 sm:p-7">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Título</label>
                  <input 
                    type="text" 
                    value={editingTrip.title || ''} 
                    onChange={e => setEditingTrip({...editingTrip, title: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Slug (URL)</label>
                  <input 
                    type="text" 
                    value={editingTrip.slug || ''} 
                    onChange={e => setEditingTrip({...editingTrip, slug: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Destino</label>
                  <input 
                    type="text" 
                    value={editingTrip.destination || ''} 
                    onChange={e => setEditingTrip({...editingTrip, destination: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Localização (Ex: SP, RJ)</label>
                  <input 
                    type="text" 
                    value={editingTrip.location || ''} 
                    onChange={e => setEditingTrip({...editingTrip, location: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Data de Início</label>
                  <input 
                    type="datetime-local" 
                    value={editingTrip.start_date ? new Date(editingTrip.start_date).toISOString().slice(0,16) : ''} 
                    onChange={e => setEditingTrip({...editingTrip, start_date: new Date(e.target.value).toISOString()})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Data de Término</label>
                  <input 
                    type="datetime-local" 
                    value={editingTrip.end_date ? new Date(editingTrip.end_date).toISOString().slice(0,16) : ''} 
                    onChange={e => setEditingTrip({...editingTrip, end_date: new Date(e.target.value).toISOString()})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Status</label>
                  <select 
                    value={editingTrip.status || 'draft'} 
                    onChange={e => setEditingTrip({...editingTrip, status: e.target.value as any})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="active">Ativo</option>
                    <option value="draft">Rascunho</option>
                    <option value="sold_out">Esgotado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Dificuldade</label>
                  <select 
                    value={editingTrip.difficulty || 'leve'} 
                    onChange={e => setEditingTrip({...editingTrip, difficulty: e.target.value as any})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="leve">Leve</option>
                    <option value="moderado">Moderado</option>
                    <option value="intenso">Intenso</option>
                    <option value="extremo">Extremo</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-300">Imagem de capa (URL)</label>
                  <input
                    type="url"
                    value={editingTrip.cover_image || ''}
                    onChange={e => setEditingTrip({...editingTrip, cover_image: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <label className="flex items-center gap-2 text-sm text-neutral-300">
                    <input type="checkbox" checked={editingTrip.is_active ?? false} onChange={e => setEditingTrip({...editingTrip, is_active: e.target.checked})} className="h-4 w-4 accent-blue-500" />
                    Publicar no site
                  </label>
                  <label className="flex items-center gap-2 text-sm text-neutral-300">
                    <input type="checkbox" checked={editingTrip.is_featured ?? false} onChange={e => setEditingTrip({...editingTrip, is_featured: e.target.checked})} className="h-4 w-4 accent-blue-500" />
                    Mostrar em destaque
                  </label>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Imagem de capa do aparelho</label>
                  <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploadingImage} onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleTripImageUpload(file); }} className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-500 file:px-3 file:py-2 file:font-medium file:text-neutral-950" />
                  {uploadingImage && <p className="text-xs text-blue-400">Enviando imagem...</p>}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Galeria da viagem</label>
                  <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploadingImage} onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleGalleryImageUpload(file); }} className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-500 file:px-3 file:py-2 file:font-medium file:text-neutral-950" />
                  {(editingTrip.images || []).length > 0 && <div className="grid grid-cols-3 gap-2">{(editingTrip.images || []).map((image) => <img key={image.id} src={image.image_url} alt={image.alt_text} className="h-20 w-full rounded-lg object-cover" />)}</div>}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Descrição</label>
                <textarea 
                  rows={4}
                  value={editingTrip.description || ''} 
                  onChange={e => setEditingTrip({...editingTrip, description: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-3 rounded-2xl border border-neutral-800 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">Acomodações e preços</h3>
                    <p className="text-xs text-neutral-500">Defina as opções que aparecerão no checkout.</p>
                  </div>
                  <button type="button" onClick={addAccommodation} className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-neutral-950 hover:bg-blue-400"><Plus className="h-4 w-4" /> Adicionar</button>
                </div>
                {(editingTrip.accommodations || []).map((accommodation, index) => (
                  <div key={accommodation.id} className="grid grid-cols-1 gap-3 rounded-xl bg-neutral-950 p-3 sm:grid-cols-4">
                    <input value={accommodation.label} onChange={e => updateAccommodation(index, { label: e.target.value })} placeholder="Nome" className="sm:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" />
                    <input value={accommodation.image_url || ''} onChange={e => updateAccommodation(index, { image_url: e.target.value })} placeholder="URL da imagem" className="sm:col-span-4 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" />
                    <label className="sm:col-span-4 text-xs text-neutral-400">Imagem do aparelho
                      <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploadingImage} onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleTripImageUpload(file, index); }} className="mt-1 block w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300 file:mr-3 file:rounded file:border-0 file:bg-blue-500 file:px-2 file:py-1 file:font-medium file:text-neutral-950" />
                    </label>
                    <input type="number" min="0" step="0.01" value={accommodation.price} onChange={e => updateAccommodation(index, { price: Number(e.target.value) })} placeholder="Preço" className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" />
                    <div className="flex gap-2">
                      <input type="number" min="0" value={accommodation.capacity} onChange={e => updateAccommodation(index, { capacity: Number(e.target.value) })} placeholder="Vagas" className="min-w-0 flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" />
                      <button type="button" onClick={() => removeAccommodation(index)} aria-label="Remover acomodação" className="rounded-lg px-2 text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <textarea value={accommodation.description} onChange={e => updateAccommodation(index, { description: e.target.value })} placeholder="Descrição da acomodação" className="sm:col-span-4 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" rows={2} />
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-2xl border border-neutral-800 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">Transportes e preços</h3>
                    <p className="text-xs text-neutral-500">Configure transfer, origem e valor adicional.</p>
                  </div>
                  <button type="button" onClick={addTransport} className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-neutral-950 hover:bg-blue-400"><Plus className="h-4 w-4" /> Adicionar</button>
                </div>
                {(editingTrip.transport_options || []).map((transport, index) => (
                  <div key={transport.id} className="grid grid-cols-1 gap-3 rounded-xl bg-neutral-950 p-3 sm:grid-cols-5">
                    <input value={transport.label} onChange={e => updateTransport(index, { label: e.target.value })} placeholder="Opção" className="sm:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" />
                    <input value={transport.origin} onChange={e => updateTransport(index, { origin: e.target.value })} placeholder="Origem" className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" />
                    <input type="number" min="0" step="0.01" value={transport.price} onChange={e => updateTransport(index, { price: Number(e.target.value) })} placeholder="Preço" className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" />
                    <button type="button" onClick={() => removeTransport(index)} aria-label="Remover transporte" className="rounded-lg px-2 text-red-400 hover:bg-red-500/10 sm:justify-self-end"><Trash2 className="h-4 w-4" /></button>
                    <textarea value={transport.description} onChange={e => updateTransport(index, { description: e.target.value })} placeholder="Descrição do transporte" className="sm:col-span-5 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" rows={2} />
                  </div>
                ))}
              </div>

            </div>
            
            <div className="p-6 border-t border-neutral-800 flex justify-end gap-3 sticky bottom-0 bg-neutral-900 rounded-b-2xl z-10">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2.5 text-sm font-medium text-neutral-950 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar Viagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
