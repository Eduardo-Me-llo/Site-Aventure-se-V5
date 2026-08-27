// =====================================================
// AVENTURE-SE — Data Store (LocalStorage-based)
// Repositório centralizado de estado para modo offline
// =====================================================

import { Trip, TripAccommodation, TripTransportOption, Coupon, Booking, BookingFormData } from '@/types';
import { MOCK_TRIPS, MOCK_COUPONS, MOCK_BOOKINGS } from '@/lib/mock-data';
import { generateBookingCode, getRemainingSpots } from '@/lib/utils';

const STORAGE_KEYS = {
  TRIPS: 'aventurese_trips',
  COUPONS: 'aventurese_coupons',
  BOOKINGS: 'aventurese_bookings',
  USERS: 'aventurese_users',
  HOME_IMAGE: 'aventurese_home_image',
  AUTH: 'aventurese_auth',
} as const;

export interface RegisteredUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  document: string;
  status: 'active' | 'blocked';
  created_at: string;
}

// ---- Helpers ----

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ---- Initialize ----

function initializeStore(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.TRIPS)) {
    setToStorage(STORAGE_KEYS.TRIPS, MOCK_TRIPS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
    setToStorage(STORAGE_KEYS.COUPONS, MOCK_COUPONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    setToStorage(STORAGE_KEYS.BOOKINGS, MOCK_BOOKINGS);
  }
}

// ---- TRIPS ----

export function getTrips(): Trip[] {
  initializeStore();
  return getFromStorage<Trip[]>(STORAGE_KEYS.TRIPS, MOCK_TRIPS);
}

export function getActiveTrips(): Trip[] {
  return getTrips().filter(t => t.is_active && t.status !== 'draft');
}

export function getFeaturedTrips(): Trip[] {
  return getTrips().filter(t => t.is_featured && t.is_active);
}

export function getTripBySlug(slug: string): Trip | undefined {
  return getTrips().find(t => t.slug === slug);
}

export function getTripById(id: string): Trip | undefined {
  return getTrips().find(t => t.id === id);
}

export function saveTrip(trip: Trip): void {
  const trips = getTrips();
  const index = trips.findIndex(t => t.id === trip.id);
  if (index >= 0) {
    trips[index] = { ...trip, updated_at: new Date().toISOString() };
  } else {
    trips.push(trip);
  }
  setToStorage(STORAGE_KEYS.TRIPS, trips);
}

export function deleteTrip(id: string): void {
  const trips = getTrips().filter(t => t.id !== id);
  setToStorage(STORAGE_KEYS.TRIPS, trips);
}

// ---- USERS ----

export function getRegisteredUsers(): RegisteredUser[] {
  return getFromStorage<RegisteredUser[]>(STORAGE_KEYS.USERS, []);
}

export function saveRegisteredUser(user: RegisteredUser): void {
  const users = getRegisteredUsers();
  const index = users.findIndex(item => item.id === user.id);
  if (index >= 0) users[index] = user;
  else users.push(user);
  setToStorage(STORAGE_KEYS.USERS, users);
}

export function updateRegisteredUserStatus(id: string, status: RegisteredUser['status']): void {
  const user = getRegisteredUsers().find(item => item.id === id);
  if (user) saveRegisteredUser({ ...user, status });
}

export function getHomeImage(): string {
  return getFromStorage<string>(STORAGE_KEYS.HOME_IMAGE, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85');
}

export function saveHomeImage(imageUrl: string): void {
  setToStorage(STORAGE_KEYS.HOME_IMAGE, imageUrl);
}

// ---- COUPONS ----

export function getCoupons(): Coupon[] {
  initializeStore();
  return getFromStorage<Coupon[]>(STORAGE_KEYS.COUPONS, MOCK_COUPONS);
}

export function getCouponByCode(code: string): Coupon | undefined {
  return getCoupons().find(c => c.code.toUpperCase() === code.toUpperCase());
}

export function validateCoupon(code: string, purchaseAmount: number): { valid: boolean; coupon?: Coupon; error?: string } {
  const coupon = getCouponByCode(code);
  
  if (!coupon) return { valid: false, error: 'Cupom não encontrado' };
  if (!coupon.is_active) return { valid: false, error: 'Cupom inativo' };
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return { valid: false, error: 'Cupom expirado' };
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) return { valid: false, error: 'Cupom esgotado' };
  if (coupon.min_purchase && purchaseAmount < coupon.min_purchase) {
    return { valid: false, error: `Valor mínimo de compra: R$ ${coupon.min_purchase.toFixed(2).replace('.', ',')}` };
  }

  return { valid: true, coupon };
}

export function calculateDiscount(coupon: Coupon, amount: number): number {
  if (coupon.discount_type === 'percentage') {
    return Math.round((amount * coupon.discount_value / 100) * 100) / 100;
  }
  return Math.min(coupon.discount_value, amount);
}

export function saveCoupon(coupon: Coupon): void {
  const coupons = getCoupons();
  const index = coupons.findIndex(c => c.id === coupon.id);
  if (index >= 0) {
    coupons[index] = coupon;
  } else {
    coupons.push(coupon);
  }
  setToStorage(STORAGE_KEYS.COUPONS, coupons);
}

export function deleteCoupon(id: string): void {
  const coupons = getCoupons().filter(c => c.id !== id);
  setToStorage(STORAGE_KEYS.COUPONS, coupons);
}

// ---- BOOKINGS ----

export function getBookings(): Booking[] {
  initializeStore();
  return getFromStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, MOCK_BOOKINGS);
}

export function getBookingsByTrip(tripId: string): Booking[] {
  return getBookings().filter(b => b.trip_id === tripId);
}

export function getBookingById(id: string): Booking | undefined {
  return getBookings().find(b => b.id === id);
}

export function getBookingByCode(code: string): Booking | undefined {
  return getBookings().find(b => b.booking_code === code);
}

export function createBooking(
  trip: Trip,
  accommodation: TripAccommodation,
  transport: TripTransportOption,
  coupon: Coupon | null,
  formData: BookingFormData
): Booking {
  const accommodationPrice = accommodation.price;
  const transportPrice = transport.has_transport ? transport.price : 0;
  const subtotal = accommodationPrice + transportPrice;
  const discountAmount = coupon ? calculateDiscount(coupon, subtotal) : 0;
  const total = subtotal - discountAmount;

  const booking: Booking = {
    id: `bkg-${Date.now()}`,
    booking_code: generateBookingCode(),
    trip_id: trip.id,
    user_id: 'current-user',
    accommodation_id: accommodation.id,
    transport_option_id: transport.id,
    transport_included: transport.has_transport,
    coupon_id: coupon?.id || null,
    passenger_name: formData.passenger_name,
    passenger_document: formData.passenger_document,
    passenger_phone: formData.passenger_phone,
    passenger_emergency_contact: formData.passenger_emergency_contact,
    passenger_emergency_phone: formData.passenger_emergency_phone,
    accommodation_price: accommodationPrice,
    transport_price: transportPrice,
    discount_amount: discountAmount,
    total_amount: total,
    payment_method: formData.payment_method,
    payment_status: 'pending',
    payment_installments: formData.payment_installments,
    payment_gateway_id: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Save booking
  const bookings = getBookings();
  bookings.push(booking);
  setToStorage(STORAGE_KEYS.BOOKINGS, bookings);

  // Update accommodation booked_count
  const trips = getTrips();
  const tripIndex = trips.findIndex(t => t.id === trip.id);
  if (tripIndex >= 0 && trips[tripIndex].accommodations) {
    const accIndex = trips[tripIndex].accommodations!.findIndex(a => a.id === accommodation.id);
    if (accIndex >= 0) {
      trips[tripIndex].accommodations![accIndex].booked_count += 1;
    }
    // Update transport booked_count
    if (transport.has_transport && trips[tripIndex].transport_options) {
      const trpIndex = trips[tripIndex].transport_options!.findIndex(t => t.id === transport.id);
      if (trpIndex >= 0) {
        trips[tripIndex].transport_options![trpIndex].booked_count += 1;
      }
    }
    setToStorage(STORAGE_KEYS.TRIPS, trips);
  }

  // Update coupon usage
  if (coupon) {
    const coupons = getCoupons();
    const cpnIndex = coupons.findIndex(c => c.id === coupon.id);
    if (cpnIndex >= 0) {
      coupons[cpnIndex].current_uses += 1;
      setToStorage(STORAGE_KEYS.COUPONS, coupons);
    }
  }

  return booking;
}

export function confirmBooking(bookingId: string): void {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  if (index >= 0) {
    bookings[index].payment_status = 'confirmed';
    bookings[index].updated_at = new Date().toISOString();
    setToStorage(STORAGE_KEYS.BOOKINGS, bookings);
  }
}

export function updateBookingStatus(bookingId: string, status: Booking['payment_status']): void {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  if (index >= 0) {
    bookings[index].payment_status = status;
    bookings[index].updated_at = new Date().toISOString();
    setToStorage(STORAGE_KEYS.BOOKINGS, bookings);
  }
}

// ---- DASHBOARD METRICS ----

export interface DashboardMetrics {
  totalRevenue: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalPassengers: number;
  occupancyRate: number;
  transportOccupancy: number;
  revenueByAccommodation: { type: string; revenue: number; count: number }[];
  recentBookings: Booking[];
}

export function getDashboardMetrics(tripId?: string): DashboardMetrics {
  const allBookings = tripId ? getBookingsByTrip(tripId) : getBookings();
  const confirmedBookings = allBookings.filter(b => b.payment_status === 'confirmed');
  const pendingBookings = allBookings.filter(b => b.payment_status === 'pending');

  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.total_amount, 0);

  // Occupancy calculation
  const trips = getTrips();
  let totalCapacity = 0;
  let totalBooked = 0;
  let totalTransportCapacity = 0;
  let totalTransportBooked = 0;

  const targetTrips = tripId ? trips.filter(t => t.id === tripId) : trips;
  targetTrips.forEach(trip => {
    trip.accommodations?.forEach(acc => {
      totalCapacity += acc.capacity;
      totalBooked += acc.booked_count;
    });
    trip.transport_options?.forEach(trp => {
      if (trp.has_transport) {
        totalTransportCapacity += trp.capacity;
        totalTransportBooked += trp.booked_count;
      }
    });
  });

  // Revenue by accommodation type
  const revenueMap: Record<string, { revenue: number; count: number }> = {};
  confirmedBookings.forEach(b => {
    const trip = getTripById(b.trip_id);
    const acc = trip?.accommodations?.find(a => a.id === b.accommodation_id);
    const type = acc?.label || acc?.type || 'Desconhecido';
    if (!revenueMap[type]) revenueMap[type] = { revenue: 0, count: 0 };
    revenueMap[type].revenue += b.total_amount;
    revenueMap[type].count += 1;
  });

  return {
    totalRevenue,
    confirmedBookings: confirmedBookings.length,
    pendingBookings: pendingBookings.length,
    totalPassengers: confirmedBookings.length,
    occupancyRate: totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0,
    transportOccupancy: totalTransportCapacity > 0 ? Math.round((totalTransportBooked / totalTransportCapacity) * 100) : 0,
    revenueByAccommodation: Object.entries(revenueMap).map(([type, data]) => ({ type, ...data })),
    recentBookings: allBookings.slice(-5).reverse(),
  };
}

// ---- AUTH (Simplified) ----

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: {
    id: string;
    email: string;
    full_name: string;
  } | null;
}

export function getAuthState(): AuthState {
  return getFromStorage<AuthState>(STORAGE_KEYS.AUTH, {
    isAuthenticated: false,
    isAdmin: false,
    user: null,
  });
}

export function loginAsAdmin(): void {
  setToStorage(STORAGE_KEYS.AUTH, {
    isAuthenticated: true,
    isAdmin: true,
    user: {
      id: 'admin-001',
      email: 'admin@aventurese.com.br',
      full_name: 'Administrador',
    },
  });
}

export function loginAsUser(name: string, email: string, details?: Pick<RegisteredUser, 'phone' | 'document'>): void {
  const existingUser = getRegisteredUsers().find(user => user.email.toLowerCase() === email.toLowerCase());
  saveRegisteredUser(existingUser || {
    id: `user-${Date.now()}`,
    full_name: name,
    email,
    phone: details?.phone || '',
    document: details?.document || '',
    status: 'active',
    created_at: new Date().toISOString(),
  });
  setToStorage(STORAGE_KEYS.AUTH, {
    isAuthenticated: true,
    isAdmin: false,
    user: {
      id: `user-${Date.now()}`,
      email,
      full_name: name,
    },
  });
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.AUTH);
}
