-- Atomic booking creation. Execute after schema.sql and operational migrations.

CREATE OR REPLACE FUNCTION public.create_booking(
  p_trip_id UUID,
  p_accommodation_id UUID,
  p_transport_option_id UUID,
  p_coupon_code TEXT,
  p_data JSONB
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  selected_trip public.trips;
  selected_accommodation public.trip_accommodations;
  selected_transport public.trip_transport_options;
  selected_coupon public.coupons;
  coupon_id UUID := NULL;
  subtotal NUMERIC(10, 2);
  discount NUMERIC(10, 2) := 0;
  booking public.bookings;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT * INTO selected_trip FROM public.trips WHERE id = p_trip_id AND is_active AND status <> 'draft';
  IF NOT FOUND THEN RAISE EXCEPTION 'TRIP_NOT_FOUND'; END IF;

  SELECT * INTO selected_accommodation FROM public.trip_accommodations WHERE id = p_accommodation_id AND trip_id = p_trip_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ACCOMMODATION_NOT_FOUND'; END IF;
  IF selected_accommodation.booked_count >= selected_accommodation.capacity THEN RAISE EXCEPTION 'ACCOMMODATION_SOLD_OUT'; END IF;

  SELECT * INTO selected_transport FROM public.trip_transport_options WHERE id = p_transport_option_id AND trip_id = p_trip_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'TRANSPORT_NOT_FOUND'; END IF;
  IF selected_transport.has_transport AND selected_transport.booked_count >= selected_transport.capacity THEN RAISE EXCEPTION 'TRANSPORT_SOLD_OUT'; END IF;

  subtotal := selected_accommodation.price + CASE WHEN selected_transport.has_transport THEN selected_transport.price ELSE 0 END;

  IF NULLIF(TRIM(p_coupon_code), '') IS NOT NULL THEN
    SELECT * INTO selected_coupon FROM public.coupons
    WHERE UPPER(code) = UPPER(TRIM(p_coupon_code)) AND is_active
      AND (expires_at IS NULL OR expires_at >= NOW())
      AND (max_uses IS NULL OR current_uses < max_uses)
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'COUPON_INVALID'; END IF;
    IF subtotal < COALESCE(selected_coupon.min_purchase, 0) THEN RAISE EXCEPTION 'COUPON_MINIMUM_NOT_REACHED'; END IF;
    coupon_id := selected_coupon.id;
    discount := CASE WHEN selected_coupon.discount_type = 'percentage'
      THEN ROUND(subtotal * selected_coupon.discount_value / 100, 2)
      ELSE LEAST(selected_coupon.discount_value, subtotal) END;
  END IF;

  INSERT INTO public.bookings (
    booking_code, trip_id, user_id, accommodation_id, transport_option_id,
    transport_included, coupon_id, passenger_name, passenger_document, passenger_phone,
    passenger_rg, passenger_rg_issuer, passenger_birth_date, passenger_neighborhood,
    passenger_emergency_contact, passenger_emergency_phone, passenger_health_condition,
    passenger_medication, passenger_physical_fitness, passenger_terms_accepted,
    accommodation_companions, departure_location, departure_time_preference,
    residence_location, referral_source, accommodation_price, transport_price,
    discount_amount, total_amount, payment_method, payment_option, payment_status,
    payment_installments
  ) VALUES (
    'AVT-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 8)),
    p_trip_id, current_user_id, p_accommodation_id, p_transport_option_id,
    selected_transport.has_transport, coupon_id,
    COALESCE(p_data->>'passenger_name', ''), COALESCE(p_data->>'passenger_document', ''), COALESCE(p_data->>'passenger_phone', ''),
    COALESCE(p_data->>'passenger_rg', ''), COALESCE(p_data->>'passenger_rg_issuer', ''), NULLIF(p_data->>'passenger_birth_date', '')::DATE, COALESCE(p_data->>'passenger_neighborhood', ''),
    COALESCE(p_data->>'passenger_emergency_contact', ''), COALESCE(p_data->>'passenger_emergency_phone', ''), COALESCE(p_data->>'passenger_health_condition', ''),
    COALESCE(p_data->>'passenger_medication', ''), COALESCE((p_data->>'passenger_physical_fitness')::BOOLEAN, false), COALESCE((p_data->>'passenger_terms_accepted')::BOOLEAN, false),
    COALESCE(p_data->>'accommodation_companions', ''), COALESCE(p_data->>'departure_location', ''), COALESCE(p_data->>'departure_time_preference', ''),
    COALESCE(p_data->>'residence_location', ''), COALESCE(p_data->>'referral_source', ''), selected_accommodation.price,
    CASE WHEN selected_transport.has_transport THEN selected_transport.price ELSE 0 END, discount, subtotal - discount,
    COALESCE(p_data->>'payment_method', 'pix')::TEXT, COALESCE(p_data->>'payment_option', 'pix_cash'), 'pending',
    COALESCE((p_data->>'payment_installments')::INTEGER, 1)
  ) RETURNING * INTO booking;

  UPDATE public.trip_accommodations SET booked_count = booked_count + 1 WHERE id = p_accommodation_id;
  IF selected_transport.has_transport THEN
    UPDATE public.trip_transport_options SET booked_count = booked_count + 1 WHERE id = p_transport_option_id;
  END IF;
  IF coupon_id IS NOT NULL THEN
    UPDATE public.coupons SET current_uses = current_uses + 1 WHERE id = coupon_id;
  END IF;

  INSERT INTO public.booking_status_history (booking_id, from_status, to_status, reason, changed_by)
  VALUES (booking.id, NULL, 'pending', 'Reserva criada', current_user_id);
  RETURN booking;
END;
$$;

REVOKE ALL ON FUNCTION public.create_booking(UUID, UUID, UUID, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_booking(UUID, UUID, UUID, TEXT, JSONB) TO authenticated;
