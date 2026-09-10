import { createClient } from '@/lib/supabase/client';
import type { Booking, Coupon, Trip } from '@/types';

export type AboutContent = {
  heroTitle: string;
  heroDescription: string;
  proposalTitle: string;
  proposalDescription: string;
  impactValue: string;
  impactDescription: string;
  experienceValue: string;
  experienceDescription: string;
};

export const defaultAboutContent: AboutContent = {
  heroTitle: 'Viajar é encontrar novas versões de si.',
  heroDescription: 'O Aventure-se nasceu para aproximar pessoas de paisagens extraordinárias e criar viagens em grupo com cuidado, liberdade e boas histórias para contar.',
  proposalTitle: 'Uma viagem pode mudar a forma como você olha para o mundo.',
  proposalDescription: 'Acreditamos que a melhor aventura não é só aquela com paisagens incríveis, mas também com tempo para respirar, conectar e sentir o lugar com profundidade.',
  impactValue: '15+',
  impactDescription: 'destinos selecionados com foco em experiência e autenticidade.',
  experienceValue: '2k+',
  experienceDescription: 'aventureiros que já viveram jornadas inspiradoras com a gente.',
};

export type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  document: string;
  status: 'active' | 'blocked';
  created_at: string;
};

function getClient() {
  return createClient();
}

export async function getAdminTrips(): Promise<Trip[]> {
  const { data, error } = await getClient()
    .from('trips')
    .select('*, images:trip_images(*), accommodations:trip_accommodations(*), transport_options:trip_transport_options(*)')
    .order('start_date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Trip[];
}

export async function saveAdminTrip(trip: Trip): Promise<void> {
  const client = getClient();
  const { accommodations = [], transport_options = [], images = [], ...tripData } = trip;
  const { error: tripError } = await client.from('trips').upsert(tripData);
  if (tripError) throw tripError;

  const { error: accommodationError } = await client.from('trip_accommodations').upsert(
    accommodations,
  );
  if (accommodationError) throw accommodationError;

  const { error: transportError } = await client.from('trip_transport_options').upsert(transport_options);
  if (transportError) throw transportError;

  if (images.length > 0) {
    const { error: imageError } = await client.from('trip_images').upsert(images);
    if (imageError) throw imageError;
  }
}

export async function deleteAdminTrip(id: string): Promise<void> {
  const { error } = await getClient().from('trips').delete().eq('id', id);
  if (error) throw error;
}

export async function getAdminCoupons(): Promise<Coupon[]> {
  const { data, error } = await getClient().from('coupons').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Coupon[];
}

export async function saveAdminCoupon(coupon: Coupon): Promise<void> {
  const { error } = await getClient().from('coupons').upsert(coupon);
  if (error) throw error;
}

export async function deleteAdminCoupon(id: string): Promise<void> {
  const { error } = await getClient().from('coupons').delete().eq('id', id);
  if (error) throw error;
}

export async function getAdminBookings(): Promise<Booking[]> {
  const { data, error } = await getClient()
    .from('bookings')
    .select('*, trip:trips(*), accommodation:trip_accommodations(*), transport_option:trip_transport_options(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function updateAdminBookingStatus(id: string, status: Booking['payment_status']): Promise<void> {
  const { error } = await getClient().from('bookings').update({ payment_status: status }).eq('id', id);
  if (error) throw error;
}

export async function getCommitmentTerms(): Promise<string> {
  const { data, error } = await getClient().from('site_settings').select('value').eq('key', 'commitment_terms').maybeSingle();
  if (error) return '';
  return data?.value || '';
}

export async function saveCommitmentTerms(value: string): Promise<void> {
  const { data: userData } = await getClient().auth.getUser();
  const { error } = await getClient().from('site_settings').upsert({
    key: 'commitment_terms',
    value,
    updated_by: userData.user?.id ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getAboutContent(): Promise<AboutContent> {
  const { data, error } = await getClient().from('site_settings').select('value').eq('key', 'about_content').maybeSingle();
  if (error || !data?.value) return defaultAboutContent;
  try { return { ...defaultAboutContent, ...JSON.parse(data.value) }; } catch { return defaultAboutContent; }
}

export async function saveAboutContent(content: AboutContent): Promise<void> {
  const { data: userData } = await getClient().auth.getUser();
  const { error } = await getClient().from('site_settings').upsert({ key: 'about_content', value: JSON.stringify(content), updated_by: userData.user?.id ?? null, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function uploadTripImage(file: File, folder: string): Promise<string> {
  const client = getClient();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from('trip-images').upload(path, file, { upsert: false });
  if (error) throw error;
  return client.storage.from('trip-images').getPublicUrl(path).data.publicUrl;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const client = getClient();
  const { data, error } = await client
    .from('profiles')
    .select('user_id, full_name, phone, document, status, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    const fallback = await client.from('profiles').select('user_id, full_name, phone, document, created_at').order('created_at', { ascending: false });
    if (fallback.error) throw fallback.error;
    return (fallback.data ?? []).map((profile) => ({ id: profile.user_id, full_name: profile.full_name, email: '', phone: profile.phone, document: profile.document, status: 'active' as const, created_at: profile.created_at }));
  }
  return (data ?? []).map((profile) => ({
    id: profile.user_id,
    full_name: profile.full_name,
    email: '',
    phone: profile.phone,
    document: profile.document,
    status: profile.status,
    created_at: profile.created_at,
  }));
}

export async function updateAdminUserStatus(id: string, status: AdminUser['status']): Promise<void> {
  const { error } = await getClient().from('profiles').update({ status, updated_at: new Date().toISOString() }).eq('user_id', id);
  if (error) throw error;
}
