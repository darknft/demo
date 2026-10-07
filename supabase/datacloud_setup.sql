-- =====================================================================
-- Integración tienda -> Supabase -> Data Cloud
-- Ejecutar en Supabase: SQL Editor -> New query -> Run
-- Ejecuta las PARTES 1 a 4 primero. La sección EN TIEMPO REAL va al final,
-- cuando las funciones ya estén desplegadas y probadas a mano.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PARTE 1. Columnas de control y llaves únicas
-- ---------------------------------------------------------------------
alter table public.purchases add column if not exists synced_at timestamptz;
alter table public.customers add column if not exists synced_at timestamptz;
alter table public.customers add column if not exists updated_at timestamptz default now();

-- Necesarias para "on conflict". Si fallan por duplicados, avísame.
create unique index if not exists purchases_purchase_id_uq on public.purchases (purchase_id);
create unique index if not exists customers_customer_id_uq on public.customers (customer_id);

-- ---------------------------------------------------------------------
-- PARTE 2. Quitar el trigger anterior (usaba user_id, que es igual para todos)
-- ---------------------------------------------------------------------
drop trigger if exists trg_order_to_purchases on public.orders;
drop function if exists public.order_to_purchases();

-- ---------------------------------------------------------------------
-- PARTE 3. Cada pedido nuevo crea/actualiza el cliente y sus compras
--   - customer_id = email en minúsculas (identificador estable)
--   - una fila en purchases por cada producto del pedido
-- ---------------------------------------------------------------------
create or replace function public.sync_order_row(o public.orders)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id text := coalesce(nullif(lower(trim(o.customer_email)), ''), 'guest-' || o.id);
  v_first text := nullif(split_part(trim(o.customer_name), ' ', 1), '');
  v_last  text := nullif(trim(substr(trim(o.customer_name), length(split_part(trim(o.customer_name), ' ', 1)) + 1)), '');
begin
  -- Cliente: se crea con la fecha del primer pedido; si cambian nombre o teléfono,
  -- se marca para reenviar (synced_at = null)
  insert into customers (customer_id, first_name, last_name, email, phone,
                         registration_date, updated_at, synced_at)
  values (v_customer_id, v_first, v_last, nullif(lower(trim(o.customer_email)), ''),
          nullif(o.customer_phone, ''), o.created_at, now(), null)
  on conflict (customer_id) do update set
    first_name = coalesce(excluded.first_name, customers.first_name),
    last_name  = coalesce(excluded.last_name,  customers.last_name),
    phone      = coalesce(excluded.phone,      customers.phone),
    updated_at = now(),
    synced_at  = null
  where (customers.first_name, customers.last_name, customers.phone)
        is distinct from
        (coalesce(excluded.first_name, customers.first_name),
         coalesce(excluded.last_name,  customers.last_name),
         coalesce(excluded.phone,      customers.phone));

  -- Compras: una por producto. Los puntos canjeados van solo en la primera línea.
  insert into purchases (purchase_id, customer_id, product_id, product_name,
                         total_amount, purchase_date, fulfillment_type,
                         is_reward_redemption, points_redeemed)
  select
    o.id || '-' || coalesce(item->>'id', n::text),
    v_customer_id,
    item->>'productId',
    item->>'productName',
    coalesce((item->>'unitPrice')::numeric, 0) * coalesce((item->>'quantity')::int, 1),
    o.created_at,
    o.delivery_type,
    coalesce(o.points_redeemed, 0) > 0,
    case when n = 1 then coalesce(o.points_redeemed, 0) else 0 end
  from jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) with ordinality as t(item, n)
  on conflict (purchase_id) do nothing;
end;
$$;

create or replace function public.trg_sync_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_order_row(new);
  return new;
end;
$$;

drop trigger if exists trg_sync_order on public.orders;
create trigger trg_sync_order
after insert on public.orders
for each row execute function public.trg_sync_order();

-- ---------------------------------------------------------------------
-- PARTE 4. Cargar los pedidos que ya existen (se puede repetir sin duplicar)
-- ---------------------------------------------------------------------
select public.sync_order_row(o) from public.orders o order by o.created_at;

-- Revisa el resultado:
-- select * from customers order by updated_at desc;
-- select * from purchases order by purchase_date desc;


-- =====================================================================
-- PARTE 5. ENVÍO EN TIEMPO REAL: cada pedido nuevo llama a las funciones
-- (ejecutar solo cuando ya probaste las funciones a mano con curl)
-- =====================================================================

-- 5a. Extensión para hacer llamadas HTTP desde Postgres (asíncronas:
--     no frenan el pedido aunque Salesforce tarde o falle)
create extension if not exists pg_net;

-- 5b. Guardar URL y secreto en Vault. Cambia PEGA_AQUI_TU_SYNC_SECRET por el
--     MISMO valor que pusiste con `npx supabase secrets set SYNC_SECRET=...`
select vault.create_secret('https://osamnncgtueznvkajwcm.supabase.co', 'project_url');
select vault.create_secret('PEGA_AQUI_TU_SYNC_SECRET', 'sync_secret');

-- 5c. Función que dispara las dos Edge Functions
create or replace function public.call_datacloud_sync()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url    text := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url');
  v_secret text := (select decrypted_secret from vault.decrypted_secrets where name = 'sync_secret');
  v_headers jsonb := jsonb_build_object('Content-Type', 'application/json', 'x-sync-secret', v_secret);
begin
  perform net.http_post(url := v_url || '/functions/v1/sync-customers-to-datacloud',
                        headers := v_headers, body := '{}'::jsonb, timeout_milliseconds := 30000);
  perform net.http_post(url := v_url || '/functions/v1/sync-purchases-to-datacloud',
                        headers := v_headers, body := '{}'::jsonb, timeout_milliseconds := 30000);
end;
$$;

-- 5d. El trigger de pedidos ahora también dispara el envío
create or replace function public.trg_sync_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_order_row(new);
  begin
    perform public.call_datacloud_sync();
  exception when others then
    -- Si la llamada falla, el pedido se guarda igual; se reenviará con el próximo pedido
    raise warning 'No se pudo disparar la sincronización con Data Cloud: %', sqlerrm;
  end;
  return new;
end;
$$;

-- 5e. Prueba manual (envía lo pendiente sin hacer un pedido):
-- select public.call_datacloud_sync();

-- Ver las respuestas de las funciones (espera unos segundos):
-- select id, status_code, content, created from net._http_response order by created desc limit 10;

-- ---------------------------------------------------------------------
-- OPCIONAL. Red de seguridad: reintento cada 15 minutos por si algún envío
-- falló (requiere la extensión pg_cron). Si no hay nada pendiente, la
-- función responde sin llamar a Salesforce.
-- ---------------------------------------------------------------------
-- create extension if not exists pg_cron;
-- select cron.schedule('datacloud-retry', '*/15 * * * *', $job$ select public.call_datacloud_sync(); $job$);
-- Para quitarlo: select cron.unschedule('datacloud-retry');
