-- =====================================================
-- AVENTURE-SE — Supabase Schema SQL
-- Plataforma de Turismo de Aventura
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- =====================================================

-- Habilita extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA: profiles
-- Extensão de auth.users com dados do aventureiro
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  document TEXT DEFAULT '',  -- CPF ou RG
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT DEFAULT '',
  emergency_contact TEXT DEFAULT '',
  emergency_phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA: trips
-- Pacotes de viagem / expedições
-- =====================================================
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  destination TEXT NOT NULL,
  location TEXT DEFAULT '',            -- Ex: "Ubatumirim, Ubatuba - SP"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  highlights TEXT[] DEFAULT '{}',      -- Array de destaques inclusos
  not_included TEXT[] DEFAULT '{}',    -- Itens não inclusos
  itinerary JSONB DEFAULT '[]',        -- Roteiro dia a dia [{day: 1, title: "", description: ""}]
  difficulty TEXT DEFAULT 'moderado' CHECK (difficulty IN ('leve', 'moderado', 'intenso', 'extremo')),
  cover_image TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'draft')),
  min_age INTEGER DEFAULT 18,
  meeting_point TEXT DEFAULT '',       -- Ponto de encontro
  meeting_time TEXT DEFAULT '',        -- Horário de embarque
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA: trip_images
-- Galeria de fotos por viagem
-- =====================================================
CREATE TABLE public.trip_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA: trip_accommodations
-- Opções de acomodação por viagem
-- =====================================================
CREATE TABLE public.trip_accommodations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('camping', 'hostel', 'suite', 'pousada')),
  label TEXT NOT NULL DEFAULT '',      -- Ex: "Camping Aventure-se", "Suíte Master"
  description TEXT DEFAULT '',
  amenities TEXT[] DEFAULT '{}',       -- Ex: ["Ar-condicionado", "Frigobar", "Café da manhã"]
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 0,
  booked_count INTEGER NOT NULL DEFAULT 0,
  check_in TEXT DEFAULT '',
  check_out TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA: trip_transport_options
-- Opções de transporte/logística por viagem
-- =====================================================
CREATE TABLE public.trip_transport_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Transporte da Excursão',
  description TEXT DEFAULT '',
  origin TEXT DEFAULT '',              -- Ex: "Rio de Janeiro"
  has_transport BOOLEAN NOT NULL DEFAULT true,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 0,
  booked_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA: coupons
-- Cupons de desconto promocionais
-- =====================================================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  min_purchase NUMERIC(10, 2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 7. TABELA: bookings
-- Reservas e vendas
-- =====================================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code TEXT UNIQUE NOT NULL,   -- Código único tipo "AVT-2026-XXXXX"
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  accommodation_id UUID NOT NULL REFERENCES public.trip_accommodations(id) ON DELETE RESTRICT,
  transport_option_id UUID REFERENCES public.trip_transport_options(id) ON DELETE SET NULL,
  transport_included BOOLEAN NOT NULL DEFAULT false,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  
  -- Dados do passageiro (snapshot no momento da compra)
  passenger_name TEXT NOT NULL,
  passenger_document TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  passenger_emergency_contact TEXT DEFAULT '',
  passenger_emergency_phone TEXT DEFAULT '',
  
  -- Valores
  accommodation_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  transport_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  
  -- Pagamento
  payment_method TEXT DEFAULT 'pix' CHECK (payment_method IN ('pix', 'credit_card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  payment_installments INTEGER DEFAULT 1,
  payment_gateway_id TEXT DEFAULT '',  -- ID da transação no gateway
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_trips_slug ON public.trips(slug);
CREATE INDEX idx_trips_active ON public.trips(is_active, status);
CREATE INDEX idx_trip_images_trip ON public.trip_images(trip_id);
CREATE INDEX idx_trip_accommodations_trip ON public.trip_accommodations(trip_id);
CREATE INDEX idx_trip_transport_trip ON public.trip_transport_options(trip_id);
CREATE INDEX idx_bookings_trip ON public.bookings(trip_id);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_code ON public.bookings(booking_code);
CREATE INDEX idx_coupons_code ON public.coupons(code);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_transport_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Helper: Verifica se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ---- PROFILES ----
-- Qualquer usuário autenticado pode ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Usuários podem inserir seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id AND role = 'user');

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND role = 'user');

-- ---- TRIPS ----
-- Leitura pública de viagens ativas
CREATE POLICY "Public can view active trips" ON public.trips
  FOR SELECT USING (is_active = true AND status != 'draft');

-- Admins podem fazer CRUD completo
CREATE POLICY "Admins can manage trips" ON public.trips
  FOR ALL USING (public.is_admin());

-- ---- TRIP IMAGES ----
-- Leitura pública
CREATE POLICY "Public can view trip images" ON public.trip_images
  FOR SELECT USING (true);

-- Admins podem gerenciar
CREATE POLICY "Admins can manage trip images" ON public.trip_images
  FOR ALL USING (public.is_admin());

-- ---- TRIP ACCOMMODATIONS ----
-- Leitura pública
CREATE POLICY "Public can view accommodations" ON public.trip_accommodations
  FOR SELECT USING (true);

-- Admins podem gerenciar
CREATE POLICY "Admins can manage accommodations" ON public.trip_accommodations
  FOR ALL USING (public.is_admin());

-- ---- TRIP TRANSPORT OPTIONS ----
-- Leitura pública
CREATE POLICY "Public can view transport options" ON public.trip_transport_options
  FOR SELECT USING (true);

-- Admins podem gerenciar
CREATE POLICY "Admins can manage transport options" ON public.trip_transport_options
  FOR ALL USING (public.is_admin());

-- ---- COUPONS ----
-- Leitura pública de cupons ativos (para validação no checkout)
CREATE POLICY "Public can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

-- Admins podem fazer CRUD completo
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (public.is_admin());

-- ---- BOOKINGS ----
-- Usuários podem ver suas próprias reservas
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Admins podem ver todas as reservas
CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (public.is_admin());

-- Usuários podem criar reservas para si
CREATE POLICY "Users can create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins podem atualizar qualquer reserva (status de pagamento, etc.)
CREATE POLICY "Admins can update bookings" ON public.bookings
  FOR UPDATE USING (public.is_admin());

-- =====================================================
-- TRIGGER: Atualiza updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Cria automaticamente o perfil público de cada novo usuário do Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, document)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'document', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SEED DATA: Réveillon Aventure-se 2026/2027 em Ubatuba
-- =====================================================

-- Viagem principal
INSERT INTO public.trips (
  id, title, slug, destination, location,
  start_date, end_date, description,
  highlights, not_included,
  difficulty, cover_image,
  is_active, is_featured, status,
  min_age, meeting_point, meeting_time
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Réveillon Aventure-se 2026/2027',
  'reveillon-ubatuba-2026',
  'Ubatumirim, Ubatuba',
  'Ubatumirim, Ubatuba - SP',
  '2026-12-29',
  '2027-01-03',
  E'A noite é reflexo do dia.\n\nPor isso, esse Réveillon começa muito antes da meia-noite.\n\nSerão 5 dias pé na areia para sair do automático, cuidar do corpo, respirar, se movimentar, conhecer pessoas, viver a natureza e recuperar energia.\n\nDurante o dia, o Aventure-se ganha uma experiência ainda mais voltada ao bem-estar, com Yoga, Breathwork, Acro Yoga, Futevôlei, Circuito Funcional, Massagem Tailandesa, caminhada, mar, momentos de presença e microexperiências sensoriais.\n\nQuando o sol se põe, a energia muda.\n\nSão 4 festas temáticas, música, encontros, surpresas e aquela conexão que faz cada edição ganhar uma história própria.\n\nDurante o dia, a gente cuida. À noite, a gente celebra.\n\nUm novo ano começa antes da contagem regressiva.\n\nTalvez você venha pela praia. Talvez pelas festas. Talvez pelas experiências. Ou talvez esteja simplesmente precisando de alguns dias para respirar e sentir a vida acontecendo de novo.\n\nNo fim, não importa apenas como você chega em Ubatumirim. Importa como você volta.\n\nCorpo em movimento. Mente presente. Gente de verdade. Natureza. Música. Celebração.\n\nA verdadeira virada começa dentro da gente. A meia-noite só celebra.',
  ARRAY[
    '5 dias de experiência em Ubatumirim',
    '4 festas temáticas pé na areia',
    'Yoga e Breathwork',
    'AcroYoga',
    'Futevôlei',
    'Circuito Funcional',
    'Massagem Tailandesa',
    'Experiências de bem-estar e conexão',
    'Microexperiências sensoriais',
    'Ritual especial da Virada',
    'Surpresas Aventure-se',
    'Seguro viagem'
  ],
  ARRAY[
    'Alimentação (exceto café da manhã na Pousada)',
    'Bebidas',
    'Despesas pessoais',
    'Ingressos para atividades opcionais externas'
  ],
  'leve',
  '/images/reveillon-cover.jpg',
  true,
  true,
  'active',
  18,
  'Rio de Janeiro - Ponto a definir',
  '06:00'
);

-- Acomodações
INSERT INTO public.trip_accommodations (id, trip_id, type, label, description, amenities, price, capacity, booked_count, check_in, check_out) VALUES
(
  'acc-camping-0001-0001-000000000001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'camping',
  'Camping Aventure-se',
  'Camping exclusivo para o nosso grupo e de frente para o mar, em área sombreada e com estrutura pé na areia. Conta com cozinha e geladeira, pontos de energia, desembarque próximo, facilidade para bagagens e possibilidade de estacionar e acampar no mesmo local para quem for de carro. É a escolha para quem quer viver Ubatumirim ainda mais conectado à natureza.',
  ARRAY['De frente para o mar', 'Área sombreada', 'Cozinha e geladeira', 'Pontos de energia', 'Estacionamento junto à barraca'],
  890.00,
  60,
  42,
  NULL,
  NULL
),
(
  'acc-pousad-0001-0001-000000000002',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'hostel',
  'Pousada',
  'Quartos para 2, 3 ou 4 pessoas com ar-condicionado, frigobar, roupa de cama, cama de casal + beliche, café da manhã, piscina, restaurante e estrutura de apoio na praia. Conforto e praticidade sem sair da experiência.',
  ARRAY['Ar-condicionado', 'Frigobar', 'Roupa de cama', 'Cama de casal + beliche', 'Café da manhã', 'Piscina', 'Restaurante', 'Estrutura de apoio na praia'],
  1490.00,
  40,
  31,
  '12:00',
  '11:00'
),
(
  'acc-suite-0001-0001-000000000003',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'suite',
  'Suíte Master',
  'Nossa categoria de maior conforto e privacidade, para até 4 pessoas. Ar-condicionado, frigobar, cama de casal + 2 camas auxiliares, banheiro com ducha quente, cozinha completa compartilhada entre os apartamentos, churrasqueira, fogão, forno, micro-ondas, geladeiras e freezer. A pousada e as Suítes Master ficam próximas da estrutura principal do evento.',
  ARRAY['Ar-condicionado', 'Frigobar', 'Cama de casal + 2 camas auxiliares', 'Banheiro com ducha quente', 'Cozinha completa compartilhada', 'Churrasqueira', 'Fogão e forno', 'Micro-ondas', 'Geladeiras e freezer'],
  1990.00,
  20,
  14,
  '10:00',
  '11:00'
);

-- Opções de transporte
INSERT INTO public.trip_transport_options (id, trip_id, label, description, origin, has_transport, price, capacity, booked_count) VALUES
(
  'trp-comtransp-0001-000000000001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Transporte Ida e Volta (Rio de Janeiro)',
  'Ida e volta saindo do Rio de Janeiro, com chegada próxima às hospedagens para tornar toda a logística mais simples.',
  'Rio de Janeiro',
  true,
  280.00,
  44,
  28
),
(
  'trp-semtransp-0001-000000000002',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Ir por conta própria',
  'Você irá por conta própria (carro, carona ou outro meio).',
  '',
  false,
  0.00,
  999,
  0
);

-- Cupons de desconto (seed)
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_purchase, max_uses, current_uses, expires_at, is_active) VALUES
(
  'cpn-00001-0001-0001-000000000001',
  'REVEILLON10',
  'percentage',
  10.00,
  500.00,
  50,
  12,
  '2026-12-28T23:59:59Z',
  true
),
(
  'cpn-00002-0001-0001-000000000002',
  'AVENTURA50',
  'fixed',
  50.00,
  800.00,
  30,
  5,
  '2026-12-20T23:59:59Z',
  true
),
(
  'cpn-00003-0001-0001-000000000003',
  'PRIMEIRAVIAGEM',
  'percentage',
  15.00,
  0.00,
  100,
  0,
  '2027-06-30T23:59:59Z',
  true
);

-- Bookings de exemplo (demonstração)
INSERT INTO public.bookings (
  id, booking_code, trip_id, user_id, accommodation_id, transport_option_id,
  transport_included, coupon_id, passenger_name, passenger_document, passenger_phone,
  passenger_emergency_contact, passenger_emergency_phone,
  accommodation_price, transport_price, discount_amount, total_amount,
  payment_method, payment_status, payment_installments, created_at
) VALUES
(
  'bkg-00001-0001-0001-000000000001',
  'AVT-2026-00001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- placeholder user_id
  'acc-pousad-0001-0001-000000000002',
  'trp-comtransp-0001-000000000001',
  true,
  'cpn-00001-0001-0001-000000000001',
  'Maria da Silva',
  '123.456.789-00',
  '(21) 99999-1234',
  'João da Silva',
  '(21) 98888-4321',
  1490.00,
  280.00,
  177.00,
  1593.00,
  'credit_card',
  'confirmed',
  3,
  '2026-08-15T14:30:00Z'
),
(
  'bkg-00002-0001-0001-000000000002',
  'AVT-2026-00002',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- placeholder user_id
  'acc-camping-0001-0001-000000000001',
  'trp-semtransp-0001-000000000002',
  false,
  NULL,
  'Pedro Santos',
  '987.654.321-00',
  '(11) 97777-5678',
  'Ana Santos',
  '(11) 96666-8765',
  890.00,
  0.00,
  0.00,
  890.00,
  'pix',
  'confirmed',
  1,
  '2026-08-16T10:15:00Z'
);
