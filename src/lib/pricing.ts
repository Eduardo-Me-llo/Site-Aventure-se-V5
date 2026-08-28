import { TripAccommodation } from '@/types';

export type PaymentMethod = 'pix' | 'credit_card';

export const TRANSPORT_PRICE = 250;
export const PIX_DISCOUNT = 40;

export function getAccommodationBasePrice(accommodation: TripAccommodation): number {
  return accommodation.price;
}

export function getAccommodationPrice(
  accommodation: TripAccommodation,
  hasTransport: boolean,
  paymentMethod: PaymentMethod,
): number {
  const basePrice = getAccommodationBasePrice(accommodation);
  const transportPrice = hasTransport ? TRANSPORT_PRICE : 0;
  const pixDiscount = paymentMethod === 'pix' ? PIX_DISCOUNT : 0;

  return basePrice + transportPrice - pixDiscount;
}

export function getPackagePrice(
  accommodation: TripAccommodation | undefined,
  hasTransport: boolean,
  paymentMethod: PaymentMethod,
): number {
  if (!accommodation) return 0;
  return getAccommodationPrice(accommodation, hasTransport, paymentMethod);
}
