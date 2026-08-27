// =====================================================
// AVENTURE-SE — Domain Types
// =====================================================

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  document: string;
  role: 'user' | 'admin';
  avatar_url: string;
  emergency_contact: string;
  emergency_phone: string;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  title: string;
  slug: string;
  destination: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  highlights: string[];
  not_included: string[];
  itinerary: ItineraryDay[];
  difficulty: 'leve' | 'moderado' | 'intenso' | 'extremo';
  cover_image: string;
  is_active: boolean;
  is_featured: boolean;
  status: 'active' | 'sold_out' | 'draft';
  min_age: number;
  meeting_point: string;
  meeting_time: string;
  created_at: string;
  updated_at: string;
  // Relations
  accommodations?: TripAccommodation[];
  transport_options?: TripTransportOption[];
  images?: TripImage[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface TripImage {
  id: string;
  trip_id: string;
  image_url: string;
  alt_text: string;
  order_index: number;
  created_at: string;
}

export interface TripAccommodation {
  id: string;
  trip_id: string;
  type: 'camping' | 'hostel' | 'suite' | 'pousada';
  label: string;
  description: string;
  amenities: string[];
  price: number;
  capacity: number;
  booked_count: number;
  check_in: string | null;
  check_out: string | null;
  created_at: string;
}

export interface TripTransportOption {
  id: string;
  trip_id: string;
  label: string;
  description: string;
  origin: string;
  has_transport: boolean;
  price: number;
  capacity: number;
  booked_count: number;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  trip_id: string;
  user_id: string;
  accommodation_id: string;
  transport_option_id: string | null;
  transport_included: boolean;
  coupon_id: string | null;
  passenger_name: string;
  passenger_document: string;
  passenger_phone: string;
  passenger_emergency_contact: string;
  passenger_emergency_phone: string;
  accommodation_price: number;
  transport_price: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'pix' | 'credit_card';
  payment_status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  payment_installments: number;
  payment_gateway_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  trip?: Trip;
  accommodation?: TripAccommodation;
  transport_option?: TripTransportOption;
  coupon?: Coupon;
  profile?: Profile;
}

export interface BookingFormData {
  passenger_name: string;
  passenger_document: string;
  passenger_phone: string;
  passenger_emergency_contact: string;
  passenger_emergency_phone: string;
  accommodation_id: string;
  transport_option_id: string;
  coupon_code: string;
  payment_method: 'pix' | 'credit_card';
  payment_installments: number;
}

export interface CheckoutSummary {
  trip: Trip;
  accommodation: TripAccommodation;
  transport: TripTransportOption;
  coupon: Coupon | null;
  accommodation_price: number;
  transport_price: number;
  subtotal: number;
  discount_amount: number;
  total: number;
}
