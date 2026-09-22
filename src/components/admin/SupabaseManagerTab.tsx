import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Shield,
  Key,
  Globe,
  UploadCloud,
  DownloadCloud,
  Check,
  Code
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  getSupabaseClient,
  SUPABASE_SCHEMA_SQL
} from '../../lib/supabase';
import { useStore } from '../../context/StoreContext';

export const SupabaseManagerTab: React.FC = () => {
  const { products, setProducts, orders, setOrders, cmsConfig, setCmsConfig, addNotification } = useStore() as any;

  const [creds, setCreds] = useState(getSupabaseCredentials());
  const [urlInput, setUrlInput] = useState(creds.url);
  const [anonKeyInput, setAnonKeyInput] = useState(creds.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const current = getSupabaseCredentials();
    setCreds(current);
    setUrlInput(current.url);
    setAnonKeyInput(current.anonKey);
  }, []);

  const handleSave = () => {
    saveSupabaseCredentials(urlInput, anonKeyInput);
    const updated = getSupabaseCredentials();
    setCreds(updated);
    setTestResult(null);
    addNotification('Configuración Guardada', 'Credenciales de Supabase actualizadas.', 'system');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const client = getSupabaseClient();
      if (!client) {
        setTestResult({
          success: false,
          message: 'No se ha configurado la URL o el Anon Key de Supabase.'
        });
        setIsTesting(false);
        return;
      }

      // Try reading from products or cms_config
      const { data, error } = await client.from('products').select('id').limit(1);

      if (error) {
        // Table might not exist yet
        if (error.code === '42P01') {
          setTestResult({
            success: true,
            message: 'Conexión a Supabase exitosa. Falta crear las tablas (ejecuta el script SQL abajo).'
          });
        } else {
          setTestResult({
            success: false,
            message: `Error de Supabase: ${error.message} (${error.code || 'sin código'})`
          });
        }
      } else {
        setTestResult({
          success: true,
          message: `¡Conexión y tablas verificadas exitosamente! (Registros detectados: ${data?.length ?? 0})`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Error al conectar: ${err.message || 'Error de red'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Push local catalog & CMS to Supabase
  const handleUploadAllToSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      alert('Primero guarda credenciales válidas de Supabase.');
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Upload products
      const mappedProducts = products.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        short_description: p.shortDescription || '',
        long_description: p.longDescription || '',
        base_price: p.basePrice || 0,
        sale_price: p.salePrice || null,
        image_url: p.imageUrl || '',
        available: p.available ?? true,
        featured: p.featured ?? false,
        temperature_option: p.temperatureOption || 'no_aplica',
        variants: p.variants || [],
        modifier_groups: p.modifierGroups || [],
        stars_awarded: p.starsAwarded || 10,
        updated_at: new Date().toISOString()
      }));

      const { error: prodErr } = await client.from('products').upsert(mappedProducts, { onConflict: 'id' });
      if (prodErr) throw prodErr;

      // 2. Upload CMS config
      const cmsRow = {
        id: 'default',
        brand_name: cmsConfig.brandName,
        tagline: cmsConfig.tagline,
        primary_color: cmsConfig.primaryColor,
        secondary_color: cmsConfig.secondaryColor,
        cream_color: cmsConfig.creamColor,
        dark_color: cmsConfig.darkColor,
        logo_url: cmsConfig.logoUrl,
        hero_title: cmsConfig.heroTitle,
        hero_subtitle: cmsConfig.heroSubtitle,
        announcement_bar: cmsConfig.announcementText,
        show_announcement: cmsConfig.showAnnouncement,
        free_delivery_threshold: cmsConfig.freeDeliveryThreshold,
        is_delivery_open: cmsConfig.isDeliveryOpen,
        updated_at: new Date().toISOString()
      };
      const { error: cmsErr } = await client.from('cms_config').upsert([cmsRow], { onConflict: 'id' });
      if (cmsErr) throw cmsErr;

      addNotification('Sincronización Exitosa', `Se subieron ${products.length} productos y la configuración CMS a Supabase.`, 'system');
      alert(`¡Éxito! Se han subido ${products.length} productos y la configuración del CMS a tu base de datos Supabase.`);
    } catch (err: any) {
      console.error(err);
      alert(`Error al sincronizar con Supabase: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull products & CMS from Supabase to local state
  const handleDownloadFromSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      alert('Primero guarda credenciales válidas de Supabase.');
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Fetch products
      const { data: dbProducts, error: prodErr } = await client.from('products').select('*');
      if (prodErr) throw prodErr;

      if (dbProducts && dbProducts.length > 0) {
        const formatted = dbProducts.map((row: any) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          shortDescription: row.short_description,
          longDescription: row.long_description,
          basePrice: Number(row.base_price),
          salePrice: row.sale_price ? Number(row.sale_price) : undefined,
          imageUrl: row.image_url,
          available: Boolean(row.available),
          featured: Boolean(row.featured),
          temperatureOption: row.temperature_option,
          variants: row.variants || [],
          modifierGroups: row.modifier_groups || [],
          starsAwarded: row.stars_awarded || 10
        }));
        setProducts(formatted);
      }

      // 2. Fetch CMS
      const { data: dbCms, error: cmsErr } = await client.from('cms_config').select('*').eq('id', 'default').maybeSingle();
      if (!cmsErr && dbCms) {
        setCmsConfig((prev: any) => ({
          ...prev,
          brandName: dbCms.brand_name || prev.brandName,
          tagline: dbCms.tagline || prev.tagline,
          primaryColor: dbCms.primary_color || prev.primaryColor,
          secondaryColor: dbCms.secondary_color || prev.secondaryColor,
          creamColor: dbCms.cream_color || prev.creamColor,
          darkColor: dbCms.dark_color || prev.darkColor,
          logoUrl: dbCms.logo_url || prev.logoUrl,
          heroTitle: dbCms.hero_title || prev.heroTitle,
          heroSubtitle: dbCms.hero_subtitle || prev.heroSubtitle,
          announcementText: dbCms.announcement_bar || prev.announcementText,
          showAnnouncement: dbCms.show_announcement ?? prev.showAnnouncement,
          freeDeliveryThreshold: Number(dbCms.free_delivery_threshold || prev.freeDeliveryThreshold),
          isDeliveryOpen: dbCms.is_delivery_open ?? prev.isDeliveryOpen
        }));
      }

      // 3. Fetch Orders
      const { data: dbOrders, error: ordErr } = await client.from('orders').select('*').order('created_at', { ascending: false });
      if (!ordErr && dbOrders && dbOrders.length > 0) {
        const formattedOrders = dbOrders.map((ord: any) => ({
          id: ord.id,
          userId: ord.user_id,
          customerName: ord.customer_name,
          customerEmail: ord.customer_email,
          customerPhone: ord.customer_phone,
          deliveryType: ord.delivery_type,
          deliveryAddress: ord.delivery_address,
          pickupBranch: ord.pickup_branch,
          deliveryNotes: ord.delivery_notes,
          paymentMethod: ord.payment_method,
          cardLast4: ord.card_last4,
          paymentStatus: ord.payment_status,
          status: ord.status,
          items: ord.items || [],
          subtotal: Number(ord.subtotal),
          discount: Number(ord.discount || 0),
          deliveryFee: Number(ord.delivery_fee || 0),
          tip: Number(ord.tip || 0),
          total: Number(ord.total),
          pointsEarned: ord.points_earned || 0,
          pointsRedeemed: ord.points_redeemed || 0,
          createdAt: ord.created_at || new Date().toISOString(),
          estimatedTimeMinutes: 25,
          timeline: [
            { status: 'received', label: 'Pedido Confirmado', time: '10:00 AM', completed: true, description: 'Confirmado en base de datos.' }
          ]
        }));
        setOrders(formattedOrders);
      }

      addNotification('Datos Descargados', 'Se sincronizó el catálogo desde Supabase.', 'system');
      alert(`¡Catálogo y pedidos descargados con éxito desde Supabase!`);
    } catch (err: any) {
      console.error(err);
      alert(`Error al descargar de Supabase: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-emerald-950 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-emerald-800 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>Base de Datos PostgreSQL en la Nube</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Integración Nativa con Supabase
            </h2>
            <p className="text-emerald-100/80 text-sm max-w-2xl leading-relaxed">
              Supabase es una base de datos PostgreSQL alojada en la nube con API REST y tiempo real.
              Es 100% compatible con <strong>GitHub Pages</strong> porque tus credenciales anónimas públicas se comunican directamente por HTTPS de forma segura mediante Row Level Security (RLS).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleCopySql}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-extrabold text-xs transition-all shadow-md cursor-pointer"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4 text-emerald-950" />}
              <span>{copiedSql ? '¡SQL Copiado al Portapapeles!' : 'Copiar Script SQL'}</span>
            </button>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 shadow-sm cursor-pointer"
            >
              <span>Abrir Panel Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${creds.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Estado de la Conexión: {creds.isConfigured ? 'Credenciales Configuradas' : 'Modo Offline / LocalStorage'}
              </h3>
              <p className="text-xs text-stone-500">
                {creds.isConfigured
                  ? 'La aplicación puede sincronizar catálogo, productos y pedidos con tu base de datos Supabase.'
                  : 'Ingresa la URL y Anon Key de tu proyecto en Supabase para sincronizar en la nube.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Probando...' : 'Probar Conexión'}</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-xl flex items-start gap-3 text-xs ${
              testResult.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{testResult.success ? 'Conexión Correcta' : 'Error de Conexión'}</p>
              <p className="mt-0.5">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>Project URL (VITE_SUPABASE_URL)</span>
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://xyzabcdefg.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none font-mono"
            />
            <span className="text-[10px] text-stone-400 block">
              Encuéntralo en tu proyecto Supabase: Project Settings &gt; API &gt; Project URL.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-stone-500" />
              <span>Anon Public Key (VITE_SUPABASE_ANON_KEY)</span>
            </label>
            <input
              type="password"
              value={anonKeyInput}
              onChange={e => setAnonKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none font-mono"
            />
            <span className="text-[10px] text-stone-400 block">
              Usa la clave <strong>anon / public</strong> (nunca service_role).
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#006241] hover:bg-[#004d33] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Guardar Credenciales
            </button>
            <button
              onClick={() => {
                setUrlInput('');
                setAnonKeyInput('');
                saveSupabaseCredentials('', '');
                setCreds(getSupabaseCredentials());
                addNotification('Desconectado', 'Se removieron las credenciales locales de Supabase.', 'system');
              }}
              className="px-3.5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-600 text-xs font-semibold cursor-pointer"
            >
              Limpiar
            </button>
          </div>

          {/* Sincronización Manual */}
          {creds.isConfigured && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleUploadAllToSupabase}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                title="Subir productos actuales y configuración a Supabase"
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSyncing ? 'Subiendo...' : 'Subir Catálogo a Supabase'}</span>
              </button>

              <button
                onClick={handleDownloadFromSupabase}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold cursor-pointer disabled:opacity-50"
                title="Descargar productos y pedidos de Supabase a la tienda"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isSyncing ? 'Descargando...' : 'Descargar de Supabase'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SQL Script to create tables in Supabase */}
      <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-stone-100">
                Script SQL para Supabase (Tablas de Productos, Pedidos y CMS)
              </h3>
              <p className="text-xs text-stone-400">
                Copia y pega este script en el <strong>SQL Editor</strong> de tu panel de Supabase para inicializar las tablas y políticas RLS.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySql}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0"
          >
            {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
          </button>
        </div>

        <pre className="bg-stone-950 text-emerald-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-72 border border-stone-800/80 leading-relaxed">
          {SUPABASE_SCHEMA_SQL}
        </pre>
      </div>

      {/* GitHub Pages Deployment Instructions */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            🚀
          </div>
          <div>
            <h3 className="font-bold text-base text-stone-900">
              Guía Paso a Paso: Subir a GitHub Pages con Supabase
            </h3>
            <p className="text-xs text-stone-500">
              Sigue estos 4 sencillos pasos para tener tu tienda online en GitHub Pages con base de datos en la nube.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-xs text-stone-900">Crea tu proyecto en Supabase</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Entra a <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">supabase.com</a> y crea un proyecto nuevo gratuito. Ve a la pestaña <strong>SQL Editor</strong>, pega el script de arriba y dale clic a <strong>Run</strong>.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-xs text-stone-900">Sube el código a tu repositorio GitHub</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Crea un repositorio en GitHub (ej. <code>cafeshop</code>) y haz push de tu proyecto. El archivo ya preparado <code>.github/workflows/deploy.yml</code> compilará y publicará automáticamente la web en GitHub Pages.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-xs text-stone-900">Agrega Secrets en GitHub (Opcional)</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              En tu repositorio de GitHub ve a <em>Settings &gt; Secrets and variables &gt; Actions</em> y crea:
              <br />• <code>VITE_SUPABASE_URL</code>
              <br />• <code>VITE_SUPABASE_ANON_KEY</code>
              <br />(O configúralas directamente desde el panel de administración de la tienda una vez publicada).
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center">
              4
            </span>
            <h4 className="font-bold text-xs text-stone-900">Activa GitHub Pages</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              En tu repositorio ve a <em>Settings &gt; Pages</em> y en <strong>Source</strong> selecciona <strong>GitHub Actions</strong>. En 1 minuto tu tienda estará online en:
              <br /><code className="text-emerald-800 font-bold">https://tu-usuario.github.io/cafeshop/</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
