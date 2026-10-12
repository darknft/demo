import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Keys can come from Vite env variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
// OR directly from localStorage if configured via the Supabase Admin UI
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Sanitizes Supabase Project URL.
 * Users frequently copy the REST endpoint ending in /rest/v1/ which causes PostgREST error PGRST125.
 * This strips trailing slashes and any /rest/v1 suffixes.
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Strip quotes if user copied with quotes
  url = url.replace(/^["']|["']$/g, '').trim();
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  // Strip /rest/v1 or /rest suffixes if mistakenly entered by the user
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/rest\/?$/i, '');
  // Strip trailing slashes again
  url = url.replace(/\/+$/, '');
  return url.trim();
}

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  let url = sanitizeSupabaseUrl(ENV_SUPABASE_URL);
  let anonKey = ENV_SUPABASE_ANON_KEY ? ENV_SUPABASE_ANON_KEY.trim() : '';

  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('sb_supabase_url');
    const localKey = localStorage.getItem('sb_supabase_anon_key');
    if (localUrl && localKey) {
      url = sanitizeSupabaseUrl(localUrl);
      anonKey = localKey.trim();
    }
  }

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http'))
  };
}

let supabaseInstance: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  const cleanUrl = sanitizeSupabaseUrl(url);

  // Re-instantiate if credentials changed or if currentUrl had /rest
  if (!supabaseInstance || currentUrl !== cleanUrl || currentKey !== anonKey || currentUrl.includes('/rest')) {
    try {
      supabaseInstance = createClient(cleanUrl, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      currentUrl = cleanUrl;
      currentKey = anonKey;
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = anonKey ? anonKey.trim() : '';
    if (cleanUrl && cleanKey) {
      localStorage.setItem('sb_supabase_url', cleanUrl);
      localStorage.setItem('sb_supabase_anon_key', cleanKey);
    } else {
      localStorage.removeItem('sb_supabase_url');
      localStorage.removeItem('sb_supabase_anon_key');
    }
    // Invalidate cached client
    supabaseInstance = null;
    currentUrl = '';
    currentKey = '';
  }
}

// SQL DDL schema script that the user can execute directly in Supabase SQL Editor
export const SUPABASE_SCHEMA_SQL = `-- =========================================================
-- SCHEMA COMPLETO PARA SUPABASE (Idempotente y Seguro)
-- Pega este script en 'SQL Editor' de tu proyecto Supabase y dale a RUN
-- =========================================================

-- 1. Tabla de Productos (Products)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  temperature_option TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  modifier_groups JSONB DEFAULT '[]'::jsonb,
  stars_awarded INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  delivery_type TEXT NOT NULL DEFAULT 'delivery',
  delivery_address TEXT,
  pickup_branch TEXT,
  delivery_notes TEXT,
  payment_method TEXT NOT NULL DEFAULT 'card',
  card_last4 TEXT,
  payment_status TEXT NOT NULL DEFAULT 'paid',
  status TEXT NOT NULL DEFAULT 'received',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  tip NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Configuración CMS (cms_config)
CREATE TABLE IF NOT EXISTS cms_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  brand_name TEXT DEFAULT 'Bean & Co',
  tagline TEXT,
  primary_color TEXT DEFAULT '#006241',
  dark_color TEXT DEFAULT '#1E3932',
  light_color TEXT DEFAULT '#D4E9E2',
  gold_color TEXT DEFAULT '#CBA258',
  cream_color TEXT DEFAULT '#F2F0EB',
  logo_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_badge TEXT,
  hero_image_url TEXT,
  announcement_bar TEXT,
  show_announcement BOOLEAN DEFAULT true,
  delivery_fee NUMERIC DEFAULT 2.99,
  free_delivery_threshold NUMERIC DEFAULT 25.0,
  points_per_dollar INTEGER DEFAULT 10,
  store_branches JSONB DEFAULT '[]'::jsonb,
  is_delivery_open BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Clientes (Customers)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  gender TEXT,
  birth_date DATE,
  age INTEGER,
  city TEXT,
  address TEXT,
  stars INTEGER DEFAULT 50,
  tier TEXT DEFAULT 'green',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migración segura de columnas si la tabla ya existía
ALTER TABLE cms_config ADD COLUMN IF NOT EXISTS dark_color TEXT DEFAULT '#1E3932';
ALTER TABLE cms_config ADD COLUMN IF NOT EXISTS light_color TEXT DEFAULT '#D4E9E2';
ALTER TABLE cms_config ADD COLUMN IF NOT EXISTS gold_color TEXT DEFAULT '#CBA258';
ALTER TABLE cms_config ADD COLUMN IF NOT EXISTS cream_color TEXT DEFAULT '#F2F0EB';
ALTER TABLE cms_config ADD COLUMN IF NOT EXISTS hero_badge TEXT;
ALTER TABLE cms_config ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE cms_config ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 2.99;
ALTER TABLE cms_config ADD COLUMN IF NOT EXISTS points_per_dollar INTEGER DEFAULT 10;
ALTER TABLE cms_config ADD COLUMN IF NOT EXISTS store_branches JSONB DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb;

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 6. Eliminar políticas anteriores para que el script se pueda re-ejecutar sin errores
DROP POLICY IF EXISTS "Permitir lectura publica de productos" ON products;
DROP POLICY IF EXISTS "Permitir escritura de productos" ON products;
DROP POLICY IF EXISTS "Permitir lectura publica de pedidos" ON orders;
DROP POLICY IF EXISTS "Permitir creacion de pedidos" ON orders;
DROP POLICY IF EXISTS "Permitir actualizacion de pedidos" ON orders;
DROP POLICY IF EXISTS "Permitir escritura de pedidos" ON orders;
DROP POLICY IF EXISTS "Permitir lectura publica de cms" ON cms_config;
DROP POLICY IF EXISTS "Permitir actualizacion de cms" ON cms_config;
DROP POLICY IF EXISTS "Permitir escritura de cms" ON cms_config;
DROP POLICY IF EXISTS "Permitir lectura publica de clientes" ON customers;
DROP POLICY IF EXISTS "Permitir escritura de clientes" ON customers;

-- 7. Políticas públicas permisivas para la aplicación web
CREATE POLICY "Permitir lectura publica de productos" ON products FOR SELECT USING (true);
CREATE POLICY "Permitir escritura de productos" ON products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir lectura publica de pedidos" ON orders FOR SELECT USING (true);
CREATE POLICY "Permitir escritura de pedidos" ON orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir lectura publica de cms" ON cms_config FOR SELECT USING (true);
CREATE POLICY "Permitir escritura de cms" ON cms_config FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir lectura publica de clientes" ON customers FOR SELECT USING (true);
CREATE POLICY "Permitir escritura de clientes" ON customers FOR ALL USING (true) WITH CHECK (true);

-- 8. Habilitar publicación en tiempo real (segura)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'cms_config') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE cms_config;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
`;
