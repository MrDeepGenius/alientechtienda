create table products(
 id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
 name text not null, description text default '', price numeric not null, old_price numeric default 0,
 category text not null default 'Accesorios', stock int not null default 0, sku text,
 images text[] default '{}', main_image text, active boolean default true,
 on_offer boolean default false, free_shipping boolean default true);
create table shipping_zones(
 id uuid primary key default gen_random_uuid(), name text not null,
 kind text not null default 'percent' check (kind in ('free','percent','pickup')),
 percent numeric default 0, min_amount numeric default 0, conditions text default '',
 cash_on_delivery boolean default false, active boolean default true);
create table settings(key text primary key, value text default '');
create table orders(
 id uuid primary key default gen_random_uuid(), number bigint generated always as identity,
 created_at timestamptz default now(), customer jsonb, items jsonb,
 subtotal numeric, shipping numeric, total numeric, zone_name text, payment_method text,
 status text default 'pendiente', notes text);
-- Todo el acceso es desde el servidor con service role: se bloquea el acceso anónimo.
alter table products enable row level security;
alter table shipping_zones enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
insert into storage.buckets(id,name,public) values('products','products',true) on conflict do nothing;
insert into settings(key,value) values('whatsapp',''),('alias',''),('cbu',''),('titular',''),('instrucciones','Enviá el comprobante por WhatsApp indicando tu número de pedido.');
insert into shipping_zones(name,kind,percent,min_amount,cash_on_delivery,conditions) values
('Rosario','free',0,0,true,'Envío incluido en el precio'),
('Retiro coordinado','pickup',0,0,false,'Coordinamos día y horario'),
('Gálvez','percent',4,3000,false,''),
('Funes','percent',4,3000,false,''),
('Roldán','percent',5,3500,false,'');

-- ===== Etapa 2: stock atómico, seguimiento y Mercado Pago (si ya corriste el schema, ejecutá solo esta parte) =====
alter table orders add column if not exists mp_payment_id text;
alter table orders add column if not exists tracking text default '';

create or replace function take_stock(p_items jsonb) returns boolean language plpgsql as $$
declare i jsonb; n int;
begin
  for i in select * from jsonb_array_elements(p_items) loop
    update products set stock = stock - (i->>'qty')::int
      where id = (i->>'id')::uuid and active and stock >= (i->>'qty')::int;
    get diagnostics n = row_count;
    if n = 0 then raise exception 'sin_stock'; end if;
  end loop;
  return true;
end $$;

create or replace function restore_stock(p_items jsonb) returns boolean language plpgsql as $$
declare i jsonb;
begin
  for i in select * from jsonb_array_elements(p_items) loop
    update products set stock = stock + (i->>'qty')::int where id = (i->>'id')::uuid;
  end loop;
  return true;
end $$;

revoke all on function take_stock(jsonb), restore_stock(jsonb) from public, anon, authenticated;
grant execute on function take_stock(jsonb), restore_stock(jsonb) to service_role;
