-- =====================================================================
-- Migración v2: cambios de registro de usuarios + esquema final de Data Cloud
-- Ejecutar COMPLETO en Supabase: SQL Editor -> New query -> Run
-- Se puede ejecutar más de una vez sin duplicar nada.
-- EJECUTAR ANTES de publicar la nueva versión de la tienda.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PARTE 1. Columnas que necesita el código nuevo de la tienda
-- (sin ellas, los pedidos y el CMS dejan de guardarse)
-- ---------------------------------------------------------------------
alter table public.orders     add column if not exists timeline jsonb default '[]'::jsonb;
alter table public.orders     add column if not exists updated_at timestamptz default now();
alter table public.cms_config add column if not exists dark_color text default '#1E3932';
alter table public.cms_config add column if not exists light_color text default '#D4E9E2';
alter table public.cms_config add column if not exists gold_color text default '#CBA258';
alter table public.cms_config add column if not exists cream_color text default '#F2F0EB';
alter table public.cms_config add column if not exists hero_badge text;
alter table public.cms_config add column if not exists hero_image_url text;
alter table public.cms_config add column if not exists delivery_fee numeric default 2.99;
alter table public.cms_config add column if not exists points_per_dollar integer default 10;
alter table public.cms_config add column if not exists store_branches jsonb default '[]'::jsonb;

-- ---------------------------------------------------------------------
-- PARTE 2. Tabla de usuarios registrados (opción A)
-- La tienda guarda aquí los registros; "customers" queda para Data Cloud.
-- ---------------------------------------------------------------------
create table if not exists public.store_users (
  id text primary key,
  name text not null,
  email text not null unique,
  phone text not null default '',
  gender text,
  birth_date date,
  age integer,
  city text,
  address text,
  stars integer default 50,
  tier text default 'green',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.store_users enable row level security;
drop policy if exists "Permitir lectura publica de usuarios" on public.store_users;
drop policy if exists "Permitir escritura de usuarios" on public.store_users;
create policy "Permitir lectura publica de usuarios" on public.store_users for select using (true);
create policy "Permitir escritura de usuarios" on public.store_users for all using (true) with check (true);

grant select, insert, update on public.store_users to anon, authenticated;
grant all on public.store_users to service_role;

-- ---------------------------------------------------------------------
-- PARTE 3. Columnas nuevas para el esquema final de Data Cloud
-- ---------------------------------------------------------------------
-- Customer: gender y age ya existían; falta birthday
alter table public.customers add column if not exists birthday date;

-- Purchase: 11 campos nuevos
alter table public.purchases add column if not exists order_id text;
alter table public.purchases add column if not exists first_name text;
alter table public.purchases add column if not exists last_name text;
alter table public.purchases add column if not exists email text;
alter table public.purchases add column if not exists unit_price numeric;
alter table public.purchases add column if not exists quantity integer;
alter table public.purchases add column if not exists purchase_status text;
alter table public.purchases add column if not exists currency_code text default 'USD';
alter table public.purchases add column if not exists purchase_channel text default 'Web';
alter table public.purchases add column if not exists created_date timestamptz;
alter table public.purchases add column if not exists last_modified_date timestamptz default now();

-- ---------------------------------------------------------------------
-- PARTE 4. Pedido nuevo -> cliente + compras (ahora con los campos nuevos)
-- ---------------------------------------------------------------------
create or replace function public.sync_order_row(o public.orders)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := nullif(lower(trim(o.customer_email)), '');
  v_customer_id text := coalesce(nullif(lower(trim(o.customer_email)), ''), 'guest-' || o.id);
  v_first text := nullif(split_part(trim(o.customer_name), ' ', 1), '');
  v_last  text := nullif(trim(substr(trim(o.customer_name), length(split_part(trim(o.customer_name), ' ', 1)) + 1)), '');
begin
  insert into customers (customer_id, first_name, last_name, email, phone,
                         registration_date, updated_at, synced_at)
  values (v_customer_id, v_first, v_last, v_email,
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

  insert into purchases (purchase_id, customer_id, product_id, product_name,
                         total_amount, purchase_date, fulfillment_type,
                         is_reward_redemption, points_redeemed,
                         order_id, first_name, last_name, email,
                         unit_price, quantity, purchase_status,
                         currency_code, purchase_channel,
                         created_date, last_modified_date)
  select
    o.id || '-' || coalesce(item->>'id', n::text),
    v_customer_id,
    item->>'productId',
    item->>'productName',
    coalesce((item->>'unitPrice')::numeric, 0) * coalesce((item->>'quantity')::int, 1),
    o.created_at,
    o.delivery_type,
    coalesce(o.points_redeemed, 0) > 0,
    case when n = 1 then coalesce(o.points_redeemed, 0) else 0 end,
    o.id, v_first, v_last, v_email,
    coalesce((item->>'unitPrice')::numeric, 0),
    coalesce((item->>'quantity')::int, 1),
    o.status,
    'USD', 'Web',
    o.created_at, now()
  from jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) with ordinality as t(item, n)
  on conflict (purchase_id) do nothing;
end;
$$;

-- ---------------------------------------------------------------------
-- PARTE 5. Cambio de estado del pedido -> actualizar purchaseStatus
-- ---------------------------------------------------------------------
create or replace function public.trg_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update purchases
     set purchase_status = new.status,
         last_modified_date = now(),
         synced_at = null
   where order_id = new.id;
  begin
    perform public.call_datacloud_sync();
  exception when others then
    raise warning 'No se pudo disparar la sincronización con Data Cloud: %', sqlerrm;
  end;
  return new;
end;
$$;

drop trigger if exists trg_order_status on public.orders;
create trigger trg_order_status
after update of status on public.orders
for each row
when (old.status is distinct from new.status)
execute function public.trg_order_status();

-- ---------------------------------------------------------------------
-- PARTE 6. Usuario registrado -> cliente de Data Cloud (gender, age, birthday, city)
-- ---------------------------------------------------------------------
create or replace function public.sync_store_user_row(u public.store_users)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id text := nullif(lower(trim(u.email)), '');
  v_first text := nullif(split_part(trim(u.name), ' ', 1), '');
  v_last  text := nullif(trim(substr(trim(u.name), length(split_part(trim(u.name), ' ', 1)) + 1)), '');
  v_age integer := coalesce(u.age, case when u.birth_date is not null
                                        then date_part('year', age(u.birth_date))::int end);
begin
  if v_customer_id is null then
    return;
  end if;

  insert into customers (customer_id, first_name, last_name, email, phone, city,
                         gender, age, birthday, registration_date, updated_at, synced_at)
  values (v_customer_id, v_first, v_last, v_customer_id, nullif(u.phone, ''), nullif(u.city, ''),
          nullif(u.gender, ''), v_age, u.birth_date, coalesce(u.created_at, now()), now(), null)
  on conflict (customer_id) do update set
    first_name        = coalesce(excluded.first_name, customers.first_name),
    last_name         = coalesce(excluded.last_name,  customers.last_name),
    email             = coalesce(excluded.email,      customers.email),
    phone             = coalesce(excluded.phone,      customers.phone),
    city              = coalesce(excluded.city,       customers.city),
    gender            = coalesce(excluded.gender,     customers.gender),
    age               = coalesce(excluded.age,        customers.age),
    birthday          = coalesce(excluded.birthday,   customers.birthday),
    registration_date = least(customers.registration_date, excluded.registration_date),
    updated_at        = now(),
    synced_at         = null
  where (customers.first_name, customers.last_name, customers.email, customers.phone,
         customers.city, customers.gender, customers.age, customers.birthday)
        is distinct from
        (coalesce(excluded.first_name, customers.first_name),
         coalesce(excluded.last_name,  customers.last_name),
         coalesce(excluded.email,      customers.email),
         coalesce(excluded.phone,      customers.phone),
         coalesce(excluded.city,       customers.city),
         coalesce(excluded.gender,     customers.gender),
         coalesce(excluded.age,        customers.age),
         coalesce(excluded.birthday,   customers.birthday));
end;
$$;

create or replace function public.trg_store_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_store_user_row(new);
  begin
    perform public.call_datacloud_sync();
  exception when others then
    raise warning 'No se pudo disparar la sincronización con Data Cloud: %', sqlerrm;
  end;
  return new;
end;
$$;

drop trigger if exists trg_store_user on public.store_users;
create trigger trg_store_user
after insert or update on public.store_users
for each row execute function public.trg_store_user();

-- ---------------------------------------------------------------------
-- PARTE 7. Completar los datos que ya existen y reenviarlos con los campos nuevos
-- ---------------------------------------------------------------------
-- Compras que vienen de pedidos de la tienda
update public.purchases p
   set order_id         = o.id,
       first_name       = nullif(split_part(trim(o.customer_name), ' ', 1), ''),
       last_name        = nullif(trim(substr(trim(o.customer_name), length(split_part(trim(o.customer_name), ' ', 1)) + 1)), ''),
       email            = nullif(lower(trim(o.customer_email)), ''),
       unit_price       = coalesce((t.item->>'unitPrice')::numeric, p.total_amount),
       quantity         = coalesce((t.item->>'quantity')::int, 1),
       purchase_status  = o.status,
       created_date     = o.created_at
  from public.orders o
  cross join lateral jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) with ordinality as t(item, n)
 where p.purchase_id = o.id || '-' || coalesce(t.item->>'id', t.n::text)
   and p.order_id is null;

-- Compras cargadas a mano (sin pedido en la tienda)
update public.purchases
   set order_id     = coalesce(order_id, purchase_id),
       unit_price   = coalesce(unit_price, total_amount),
       quantity     = coalesce(quantity, 1),
       created_date = coalesce(created_date, purchase_date)
 where order_id is null or unit_price is null or quantity is null or created_date is null;

update public.purchases
   set currency_code      = coalesce(currency_code, 'USD'),
       purchase_channel   = coalesce(purchase_channel, 'Web'),
       last_modified_date = now(),
       synced_at          = null;

-- Usuarios ya registrados -> clientes
select public.sync_store_user_row(u) from public.store_users u order by u.created_at;

-- Reenviar todos los clientes con los campos nuevos
update public.customers set synced_at = null;

-- ---------------------------------------------------------------------
-- PARTE 8. Revisión
-- ---------------------------------------------------------------------
-- select count(*) as compras_pendientes from purchases where synced_at is null;
-- select count(*) as clientes_pendientes from customers where synced_at is null;
-- Después de desplegar las Edge Functions nuevas, enviar todo con:
-- select public.call_datacloud_sync();
