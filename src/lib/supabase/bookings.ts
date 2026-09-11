import { createClient } from '@/lib/supabase/client';
import type { Booking, BookingFormData, Coupon, Trip, TripAccommodation, TripTransportOption } from '@/types';

export async function createBookingTransaction(
  trip: Trip,
  accommodation: TripAccommodation,
  transport: TripTransportOption,
  coupon: Coupon | null,
  formData: BookingFormData,
): Promise<Booking> {
  const { data, error } = await createClient().rpc('create_booking', {
    p_trip_id: trip.id,
    p_accommodation_id: accommodation.id,
    p_transport_option_id: transport.id,
    p_coupon_code: coupon?.code ?? '',
    p_data: formData,
  });
  if (error) throw error;
  return data as Booking;
}
