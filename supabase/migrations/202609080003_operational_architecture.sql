-- Operational tables for activities, payments, booking history and audit.
-- Execute after schema.sql and the auth/profile migrations.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'blocked'));

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS passenger_rg TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS passenger_rg_issuer TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS passenger_birth_date DATE,
  ADD COLUMN IF NOT EXISTS passenger_neighborhood TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS passenger_health_condition TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS passenger_medication TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS passenger_physical_fitness BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS passenger_terms_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accommodation_companions TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS departure_location TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS departure_time_preference TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS residence_location TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS referral_source TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_option TEXT NOT NULL DEFAULT 'pix_cash';

ALTER TABLE public.trip_accommodations
  ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT USING (key = 'commitment_terms');

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.site_settings (key, value)
VALUES ('commitment_terms', 'Declaro que li e aceito o termo de compromisso do Aventure-se.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value)
VALUES ('about_content', '{"heroTitle":"Viajar é encontrar novas versões de si.","heroDescription":"O Aventure-se nasceu para aproximar pessoas de paisagens extraordinárias e criar viagens em grupo com cuidado, liberdade e boas histórias para contar.","proposalTitle":"Uma viagem pode mudar a forma como você olha para o mundo.","proposalDescription":"Acreditamos que a melhor aventura não é só aquela com paisagens incríveis, mas também com tempo para respirar, conectar e sentir o lugar com profundidade.","impactValue":"15+","impactDescription":"destinos selecionados com foco em experiência e autenticidade.","experienceValue":"2k+","experienceDescription":"aventureiros que já viveram jornadas inspiradoras com a gente."}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-images', 'trip-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view trip images storage" ON storage.objects;
CREATE POLICY "Public can view trip images storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'trip-images');

DROP POLICY IF EXISTS "Admins can upload trip images storage" ON storage.objects;
CREATE POLICY "Admins can upload trip images storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'trip-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update trip images storage" ON storage.objects;
CREATE POLICY "Admins can update trip images storage" ON storage.objects
  FOR UPDATE USING (bucket_id = 'trip-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'trip-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete trip images storage" ON storage.objects;
CREATE POLICY "Admins can delete trip images storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'trip-images' AND public.is_admin());

CREATE TABLE IF NOT EXISTS public.trip_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  activity_date DATE,
  start_time TIME,
  end_time TIME,
  location TEXT DEFAULT '',
  capacity INTEGER,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_optional BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_payment_id TEXT UNIQUE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'credit_card')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'paid', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL CHECK (to_status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  reason TEXT DEFAULT '',
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_activities_trip
  ON public.trip_activities(trip_id, activity_date, sort_order);
CREATE INDEX IF NOT EXISTS idx_booking_payments_booking
  ON public.booking_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking
  ON public.booking_status_history(booking_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record
  ON public.audit_logs(table_name, record_id, created_at);

ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view trip activities" ON public.trip_activities;
CREATE POLICY "Public can view trip activities" ON public.trip_activities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage trip activities" ON public.trip_activities;
CREATE POLICY "Admins can manage trip activities" ON public.trip_activities
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can view own booking payments" ON public.booking_payments;
CREATE POLICY "Users can view own booking payments" ON public.booking_payments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = booking_payments.booking_id AND bookings.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins can view booking payments" ON public.booking_payments;
CREATE POLICY "Admins can view booking payments" ON public.booking_payments
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage booking payments" ON public.booking_payments;
CREATE POLICY "Admins can manage booking payments" ON public.booking_payments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can view own booking history" ON public.booking_status_history;
CREATE POLICY "Users can view own booking history" ON public.booking_status_history
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = booking_status_history.booking_id AND bookings.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins can manage booking history" ON public.booking_status_history;
CREATE POLICY "Admins can manage booking history" ON public.booking_status_history
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_trip_activities_updated_at ON public.trip_activities;
CREATE TRIGGER set_trip_activities_updated_at
  BEFORE UPDATE ON public.trip_activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_booking_payments_updated_at ON public.booking_payments;
CREATE TRIGGER set_booking_payments_updated_at
  BEFORE UPDATE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
