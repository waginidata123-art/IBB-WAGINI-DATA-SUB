-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('user', 'agent', 'admin');
CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE public.kyc_status AS ENUM ('not_started', 'pending', 'verified', 'rejected');
CREATE TYPE public.txn_status AS ENUM ('INITIATED','PENDING','PROCESSING','SUCCESS','FAILED','REVERSED','REFUNDED');
CREATE TYPE public.wallet_txn_type AS ENUM ('CREDIT','DEBIT','REFUND','REVERSAL','COMMISSION');
CREATE TYPE public.service_code AS ENUM ('airtime','data','electricity','cable','exams','nin');

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  status public.account_status NOT NULL DEFAULT 'active',
  kyc_status public.kyc_status NOT NULL DEFAULT 'not_started',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== ROLES =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- ===== WALLETS =====
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency TEXT NOT NULL DEFAULT 'NGN',
  status public.account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type public.wallet_txn_type NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  previous_balance NUMERIC(14,2) NOT NULL,
  new_balance NUMERIC(14,2) NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  status public.txn_status NOT NULL DEFAULT 'SUCCESS',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wallet_txn_user ON public.wallet_transactions(user_id, created_at DESC);
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- ===== SERVICES & PRODUCTS =====
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code public.service_code NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  maintenance_message TEXT,
  provider TEXT NOT NULL DEFAULT 'vtpass',
  min_amount NUMERIC(14,2) NOT NULL DEFAULT 50,
  max_amount NUMERIC(14,2) NOT NULL DEFAULT 500000,
  service_charge NUMERIC(14,2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT UPDATE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.service_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  network TEXT,
  category TEXT,
  product_code TEXT NOT NULL,
  provider_service_id TEXT,
  name TEXT NOT NULL,
  provider_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  agent_price NUMERIC(14,2),
  commission NUMERIC(14,2) NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (service_id, product_code)
);
CREATE INDEX idx_products_service ON public.service_products(service_id, network);
GRANT SELECT ON public.service_products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_products TO authenticated;
GRANT ALL ON public.service_products TO service_role;
ALTER TABLE public.service_products ENABLE ROW LEVEL SECURITY;

-- ===== SERVICE TRANSACTIONS =====
CREATE TABLE public.service_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_type public.service_code NOT NULL,
  provider TEXT NOT NULL DEFAULT 'vtpass',
  product_id UUID REFERENCES public.service_products(id),
  product_name TEXT,
  amount NUMERIC(14,2) NOT NULL,
  cost NUMERIC(14,2) NOT NULL DEFAULT 0,
  profit NUMERIC(14,2) NOT NULL DEFAULT 0,
  commission NUMERIC(14,2) NOT NULL DEFAULT 0,
  status public.txn_status NOT NULL DEFAULT 'INITIATED',
  customer_reference TEXT,
  provider_reference TEXT,
  transaction_reference TEXT NOT NULL UNIQUE,
  request_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_stx_user ON public.service_transactions(user_id, created_at DESC);
CREATE INDEX idx_stx_status ON public.service_transactions(status, created_at DESC);
CREATE INDEX idx_stx_customer ON public.service_transactions(customer_reference);
GRANT SELECT ON public.service_transactions TO authenticated;
GRANT ALL ON public.service_transactions TO service_role;
ALTER TABLE public.service_transactions ENABLE ROW LEVEL SECURITY;

-- ===== PAYMENTS =====
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gateway TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  fee NUMERIC(14,2) NOT NULL DEFAULT 0,
  payment_reference TEXT NOT NULL UNIQUE,
  gateway_reference TEXT,
  status public.txn_status NOT NULL DEFAULT 'PENDING',
  credited BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pay_user ON public.payment_transactions(user_id, created_at DESC);
GRANT SELECT ON public.payment_transactions TO authenticated;
GRANT ALL ON public.payment_transactions TO service_role;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- ===== API PROVIDERS =====
CREATE TABLE public.api_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  service_types public.service_code[] NOT NULL DEFAULT '{}',
  status public.account_status NOT NULL DEFAULT 'active',
  mode TEXT NOT NULL DEFAULT 'sandbox',
  secret_env_keys TEXT[] NOT NULL DEFAULT '{}',
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_response_ms INT,
  error_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.api_providers TO authenticated;
GRANT ALL ON public.api_providers TO service_role;
ALTER TABLE public.api_providers ENABLE ROW LEVEL SECURITY;

-- ===== NOTIFICATIONS =====
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON public.notifications(user_id, read, created_at DESC);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ===== AUDIT LOGS =====
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ===== PLATFORM SETTINGS =====
CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND status = (SELECT p.status FROM public.profiles p WHERE p.user_id = auth.uid()) AND kyc_status = (SELECT p.kyc_status FROM public.profiles p WHERE p.user_id = auth.uid()));
CREATE POLICY "admin profile update" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "own wallet read" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "own wallet txn read" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "services public read" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "services admin update" ON public.services FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "products read" ON public.service_products FOR SELECT TO authenticated USING (enabled = true OR public.is_admin());
CREATE POLICY "products admin write" ON public.service_products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "own stx read" ON public.service_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "own payments read" ON public.payment_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "providers admin" ON public.api_providers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "own notif read" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own notif update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "audit admin read" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "audit admin insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin() AND actor_id = auth.uid());

CREATE POLICY "settings read" ON public.platform_settings FOR SELECT TO anon, authenticated USING (is_public = true OR public.is_admin());
CREATE POLICY "settings admin write" ON public.platform_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ===== TRIGGERS =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_wallets_updated BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.service_products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_stx_updated BEFORE UPDATE ON public.service_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_pay_updated BEFORE UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- New user: profile + wallet + default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email, ''), NEW.raw_user_meta_data->>'phone');
  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (NEW.id, 'account', 'Welcome to IBB Wagini Data Sub', 'Your account is ready. Fund your wallet to start buying airtime, data and more.');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== ATOMIC WALLET OPERATIONS (service_role only) =====
CREATE OR REPLACE FUNCTION public.wallet_apply(
  _user_id UUID, _type public.wallet_txn_type, _amount NUMERIC, _reference TEXT, _description TEXT
) RETURNS public.wallet_transactions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w public.wallets%ROWTYPE; prev NUMERIC; nxt NUMERIC; row public.wallet_transactions%ROWTYPE;
BEGIN
  IF _amount <= 0 THEN RAISE EXCEPTION 'INVALID_AMOUNT'; END IF;
  SELECT * INTO row FROM public.wallet_transactions WHERE reference = _reference;
  IF FOUND THEN RETURN row; END IF; -- idempotent
  SELECT * INTO w FROM public.wallets WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'WALLET_NOT_FOUND'; END IF;
  IF w.status <> 'active' THEN RAISE EXCEPTION 'WALLET_INACTIVE'; END IF;
  prev := w.balance;
  IF _type = 'DEBIT' THEN
    IF prev < _amount THEN RAISE EXCEPTION 'INSUFFICIENT_BALANCE'; END IF;
    nxt := prev - _amount;
  ELSE
    nxt := prev + _amount;
  END IF;
  UPDATE public.wallets SET balance = nxt WHERE id = w.id;
  INSERT INTO public.wallet_transactions (wallet_id, user_id, type, amount, previous_balance, new_balance, reference, description)
  VALUES (w.id, _user_id, _type, _amount, prev, nxt, _reference, _description) RETURNING * INTO row;
  RETURN row;
END; $$;
REVOKE ALL ON FUNCTION public.wallet_apply(UUID, public.wallet_txn_type, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_apply(UUID, public.wallet_txn_type, NUMERIC, TEXT, TEXT) TO service_role;

-- ===== SEED =====
INSERT INTO public.services (code, name, description, enabled, sort_order, min_amount, max_amount) VALUES
('airtime','Airtime','Instant airtime top-up for MTN, Airtel, Glo and 9mobile', true, 1, 50, 50000),
('data','Data','Affordable SME, Gifting and Corporate data bundles', true, 2, 50, 100000),
('electricity','Electricity','Prepaid and postpaid electricity bills with instant tokens', true, 3, 500, 500000),
('cable','Cable TV','DSTV, GOtv and Startimes subscriptions', true, 4, 500, 200000),
('exams','Exams','WAEC, NECO, NABTEB and JAMB PINs', true, 5, 500, 100000),
('nin','NIN Verification','Secure identity verification services', false, 6, 100, 50000);

INSERT INTO public.api_providers (code, name, service_types, status, mode, secret_env_keys, configuration) VALUES
('vtpass','VTpass', ARRAY['airtime','data','electricity','cable','exams']::public.service_code[], 'active', 'sandbox', ARRAY['VTPASS_API_KEY','VTPASS_SECRET_KEY','VTPASS_PUBLIC_KEY'], '{"sandbox_url":"https://sandbox.vtpass.com/api","live_url":"https://vtpass.com/api"}'),
('monnify','Monnify', ARRAY[]::public.service_code[], 'pending', 'sandbox', ARRAY['MONNIFY_API_KEY','MONNIFY_SECRET_KEY','MONNIFY_CONTRACT_CODE'], '{"type":"payment_gateway"}'),
('flutterwave','Flutterwave', ARRAY[]::public.service_code[], 'pending', 'sandbox', ARRAY['FLUTTERWAVE_SECRET_KEY'], '{"type":"payment_gateway"}'),
('termii','Termii SMS', ARRAY[]::public.service_code[], 'pending', 'live', ARRAY['TERMII_API_KEY'], '{"type":"sms"}');

INSERT INTO public.platform_settings (key, value, description, is_public) VALUES
('platform_name', '"IBB Wagini Data Sub"', 'Public platform name', true),
('support_email', '"support@ibbwagini.com"', 'Support email', true),
('support_phone', '"+234 800 000 0000"', 'Support phone', true),
('maintenance_mode', 'false', 'Global maintenance mode', true),
('min_wallet_funding', '100', 'Minimum wallet funding (NGN)', true),
('max_wallet_funding', '1000000', 'Maximum wallet funding (NGN)', true),
('notifications', '{"email":true,"sms":false,"in_app":true}', 'Notification channels', false);

INSERT INTO public.service_products (service_id, network, category, product_code, name, provider_cost, selling_price, commission)
SELECT s.id, n.network, 'airtime', lower(n.network)||'-airtime', n.network||' Airtime', 0, 0, 0
FROM public.services s CROSS JOIN (VALUES ('MTN'),('Airtel'),('Glo'),('9mobile')) AS n(network) WHERE s.code='airtime';

INSERT INTO public.service_products (service_id, network, category, product_code, name, provider_cost, selling_price, commission)
SELECT s.id, p.network, 'SME', p.code, p.name, p.cost, p.price, 10 FROM public.services s CROSS JOIN (VALUES
('MTN','mtn-sme-500mb','500MB - 30 Days',130,150),
('MTN','mtn-sme-1gb','1GB - 30 Days',240,270),
('MTN','mtn-sme-2gb','2GB - 30 Days',480,540),
('MTN','mtn-sme-5gb','5GB - 30 Days',1200,1350),
('Airtel','airtel-1gb','1GB - 30 Days',250,290),
('Airtel','airtel-2gb','2GB - 30 Days',500,580),
('Glo','glo-1gb','1GB - 30 Days',230,260),
('Glo','glo-2gb','2GB - 30 Days',450,520),
('9mobile','9mobile-1gb','1GB - 30 Days',220,250)
) AS p(network,code,name,cost,price) WHERE s.code='data';

INSERT INTO public.service_products (service_id, network, category, product_code, name, provider_cost, selling_price, commission)
SELECT s.id, p.network, p.cat, p.code, p.name, p.cost, p.price, 50 FROM public.services s CROSS JOIN (VALUES
('DSTV','cable','dstv-padi','DStv Padi',3600,3600),
('DSTV','cable','dstv-yanga','DStv Yanga',5100,5100),
('DSTV','cable','dstv-compact','DStv Compact',15700,15700),
('GOtv','cable','gotv-smallie','GOtv Smallie',1900,1900),
('GOtv','cable','gotv-jinja','GOtv Jinja',3900,3900),
('GOtv','cable','gotv-max','GOtv Max',8500,8500),
('Startimes','cable','startimes-nova','Startimes Nova',1900,1900),
('Startimes','cable','startimes-basic','Startimes Basic',3700,3700)
) AS p(network,cat,code,name,cost,price) WHERE s.code='cable';

INSERT INTO public.service_products (service_id, network, category, product_code, name, provider_cost, selling_price, commission)
SELECT s.id, p.network, 'exam', p.code, p.name, p.cost, p.price, 100 FROM public.services s CROSS JOIN (VALUES
('WAEC','waec-result','WAEC Result Checker PIN',3400,3600),
('NECO','neco-result','NECO Result Checker Token',1200,1400),
('NABTEB','nabteb-result','NABTEB Result Checker PIN',900,1100),
('JAMB','jamb-utme','JAMB UTME e-PIN',7200,7500)
) AS p(network,code,name,cost,price) WHERE s.code='exams';

INSERT INTO public.service_products (service_id, network, category, product_code, name, provider_cost, selling_price, commission)
SELECT s.id, p.network, 'disco', p.code, p.name, 0, 0, 100 FROM public.services s CROSS JOIN (VALUES
('IKEDC','ikeja-electric','Ikeja Electric'),
('EKEDC','eko-electric','Eko Electric'),
('AEDC','abuja-electric','Abuja Electric'),
('KEDCO','kano-electric','Kano Electric'),
('PHED','portharcourt-electric','Port Harcourt Electric'),
('IBEDC','ibadan-electric','Ibadan Electric'),
('KAEDCO','kaduna-electric','Kaduna Electric'),
('JED','jos-electric','Jos Electric')
) AS p(network,code,name) WHERE s.code='electricity';