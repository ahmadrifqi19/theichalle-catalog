-- ==============================================================================
-- THE ICHALLE COLLECTION - DATABASE SCHEMA
-- Brand: The Ichalle Collection (@theichalle) - "Timeless Women Wear"
-- ==============================================================================

-- 1. Create products table
create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    slug text not null,
    description text default '',
    category text not null default 'Blouses',
    price numeric not null default 0,
    discount_price numeric,
    images text[] default '{}',
    shades text[] default '{}',
    sizes text[] default '{}',
    size_guide jsonb default '{"bust": "98-102 cm", "length": "120 cm", "fabric": "Premium Silk & Linen"}'::jsonb,
    status text not null default 'Ready Stock',
    is_featured boolean default false,
    marketplace_url text,
    custom_badge text default null
);

-- Migration support for products:
alter table public.products add column if not exists custom_badge text default null;

-- Index for faster queries
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_created_at on public.products(created_at desc);

-- 2. Create store_settings table
create table if not exists public.store_settings (
    id integer primary key default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    announcement_text text default '✨ Complimentary shipping for orders above Rp 500.000 | Discover the New Spring/Summer Collection',
    announcement_enabled boolean default true,
    hero_title text default 'Timeless Elegance, Effortlessly Worn.',
    hero_subtitle text default 'Thoughtfully designed silhouettes and curated luxury fabrics for the modern, graceful woman.',
    hero_image_url text default 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    whatsapp_number text default '6281234567890',
    instagram_url text default 'https://instagram.com/theichalle',
    tiktok_url text default 'https://tiktok.com/@theichalle',
    shopee_url text default 'https://shopee.co.id/theichalle',
    gmaps_url text default 'https://maps.google.com/?q=The+Ichalle+Boutique',
    ecatalogue_url text default '',
    store_address text default 'Jl. Boulevard Raya Blok AA No. 12, Jakarta Selatan, Indonesia',
    about_us text default 'The Ichalle Collection was founded with a singular devotion: creating timeless, elegant attire for women who value grace, modesty, and impeccable craftsmanship. Every stitch, fold, and silhouette is meticulously developed using premium fabrics that breathe and drape effortlessly. We believe elegance is not about standing out, but about being remembered.',
    terms_conditions text default '1. Orders are processed Monday through Saturday (excluding public holidays).\n2. Payment confirmation must be completed within 24 hours of order reservation.\n3. Colors in photos may slightly vary due to lighting and individual screen calibrations.\n4. Sizing tolerances are within 1-2 cm due to manual craftsmanship.',
    privacy_policy text default 'We respect your personal privacy. All details provided for orders (name, phone number, address) are strictly utilized for delivery, order verification, and brand updates. We do not sell or distribute personal data to third parties.',
    refund_policy text default 'We take pride in our product quality. If you receive a defective garment or incorrect item:\n1. Notify our concierge team via WhatsApp within 48 hours of package delivery.\n2. Products must be unwashed, unworn, with all original tags attached and packaging intact.\n3. An unboxing video without pause or cuts is required for all exchange or refund claims.',
    promo_popup_active boolean default false,
    promo_popup_image_url text default null,
    promo_popup_link text default null,
    categories text[] default '{"Blouses", "Dresses", "Sets", "Outerwear", "Skirts"}'::text[]
);

-- Migration support if table already exists:
alter table public.store_settings add column if not exists promo_popup_active boolean default false;
alter table public.store_settings add column if not exists promo_popup_image_url text default null;
alter table public.store_settings add column if not exists promo_popup_link text default null;
alter table public.store_settings add column if not exists categories text[] default '{"Blouses", "Dresses", "Sets", "Outerwear", "Skirts"}'::text[];

-- Insert default settings row if not exists
insert into public.store_settings (id)
values (1)
on conflict (id) do nothing;

-- 3. Row Level Security (RLS) Setup
alter table public.products enable row level security;
alter table public.store_settings enable row level security;

-- Products Policies:
-- Anyone can view products (Public Storefront)
create policy "Allow public read access to products"
    on public.products
    for select
    using (true);

-- Only authenticated users (Admin) can insert, update, delete products
create policy "Allow authenticated admin full access to products"
    on public.products
    for all
    to authenticated
    using (true)
    with check (true);

-- Store Settings Policies:
-- Anyone can read store settings
create policy "Allow public read access to store_settings"
    on public.store_settings
    for select
    using (true);

-- Only authenticated users (Admin) can update store settings
create policy "Allow authenticated admin update access to store_settings"
    on public.store_settings
    for all
    to authenticated
    using (true)
    with check (true);

-- 4. Storage Bucket Setup for 'catalog-images'
-- Note: In Supabase, bucket creation can also be done via Dashboard or SQL:
insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do update set public = true;

-- Storage RLS: Public can view images
create policy "Allow public read access to catalog-images"
    on storage.objects
    for select
    using (bucket_id = 'catalog-images');

-- Authenticated admins can upload, update, and delete images in catalog-images
create policy "Allow authenticated insert into catalog-images"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'catalog-images');

create policy "Allow authenticated update into catalog-images"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'catalog-images');

create policy "Allow authenticated delete from catalog-images"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'catalog-images');

