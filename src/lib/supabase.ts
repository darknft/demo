import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Keys can come from Vite env variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
// OR directly from localStorage if configured via the Supabase Admin UI
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  let url = ENV_SUPABASE_URL;
  let anonKey = ENV_SUPABASE_ANON_KEY;

  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('sb_supabase_url');
    const localKey = localStorage.getItem('sb_supabase_anon_key');
    if (localUrl && localKey) {
      url = localUrl.trim();
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

  // Re-instantiate if credentials changed
  if (!supabaseInstance || currentUrl !== url || currentKey !== anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      currentUrl = url;
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
    if (url && anonKey) {
      localStorage.setItem('sb_supabase_url', url.trim());
      localStorage.setItem('sb_supabase_anon_key', anonKey.trim());
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
export const SUPABASE_SCHEMA_SQL = `-- SCHEMA COMPLETO PARA SUPABASE
-- Ejecuta este script en el 'SQL Editor' de tu proyecto de Supabase

-- 1. Tabla de Productos
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Configuración CMS
CREATE TABLE IF NOT EXISTS cms_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  brand_name TEXT DEFAULT 'Starbucks Coffee',
  tagline TEXT,
  primary_color TEXT DEFAULT '#006241',
  secondary_color TEXT DEFAULT '#1E3932',
  cream_color TEXT DEFAULT '#F2F0EB',
  dark_color TEXT DEFAULT '#212121',
  logo_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  announcement_bar TEXT,
  show_announcement BOOLEAN DEFAULT true,
  free_delivery_threshold NUMERIC DEFAULT 10,
  is_delivery_open BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar Row Level Security (RLS) con políticas públicas de lectura/escritura (para prototipos y tiendas de muestra)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_config ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para la demo en GitHub Pages (puedes restringirlas luego con Supabase Auth)
CREATE POLICY "Permitir lectura publica de productos" ON products FOR SELECT USING (true);
CREATE POLICY "Permitir escritura de productos" ON products FOR ALL USING (true);

CREATE POLICY "Permitir lectura publica de pedidos" ON orders FOR SELECT USING (true);
CREATE POLICY "Permitir creacion de pedidos" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion de pedidos" ON orders FOR UPDATE USING (true);

CREATE POLICY "Permitir lectura publica de cms" ON cms_config FOR SELECT USING (true);
CREATE POLICY "Permitir actualizacion de cms" ON cms_config FOR ALL USING (true);

-- Notificaciones en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE cms_config;
`;
