-- SCENO core schema: cities, identity/roles, categories, venues, events, tickets, bookings.
-- Modular monolith on Postgres. RLS enforces authorization at the data layer (never trust client-side checks).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- CITIES — multi-city from day one. No city-specific logic in app code;
-- everything (active status, launch copy) is data-driven from this table.
-- ─────────────────────────────────────────────────────────────────────────
create type city_status as enum ('LIVE', 'COMING_SOON', 'HIDDEN');

create table cities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  state text,
  status city_status not null default 'COMING_SOON',
  hero_headline text,
  hero_subheadline text,
  launch_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table city_notify_signups (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  constraint contact_required check (email is not null or phone is not null)
);

-- ─────────────────────────────────────────────────────────────────────────
-- IDENTITY — one account, multiple capabilities via roles (not separate
-- user systems per role).
-- ─────────────────────────────────────────────────────────────────────────
create type user_role as enum ('ATTENDEE', 'HOST', 'VENUE_OWNER', 'VENDOR', 'EVENT_ORGANIZER', 'ADMIN');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  home_city_id uuid references cities(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_roles (
  user_id uuid not null references profiles(id) on delete cascade,
  role user_role not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ─────────────────────────────────────────────────────────────────────────
-- CATEGORIES — admin-managed, data-driven discovery taxonomy.
-- ─────────────────────────────────────────────────────────────────────────
create table event_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  emoji text,
  sort_order int not null default 0,
  active boolean not null default true
);

-- ─────────────────────────────────────────────────────────────────────────
-- VENUES
-- ─────────────────────────────────────────────────────────────────────────
create type approval_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

create table venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete set null,
  city_id uuid not null references cities(id),
  slug text unique not null,
  name text not null,
  description text,
  capacity int,
  starting_price numeric(10,2),
  address text,
  latitude double precision,
  longitude double precision,
  amenities text[] not null default '{}',
  approval_status approval_status not null default 'PENDING',
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table venue_media (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  url text not null,
  sort_order int not null default 0
);

create table venue_availability (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  date date not null,
  status text not null default 'AVAILABLE' check (status in ('AVAILABLE', 'HOLD', 'BOOKED')),
  unique (venue_id, date)
);

-- ─────────────────────────────────────────────────────────────────────────
-- VENDORS / ARTISTS — DJs, catering, decor, photography, etc.
-- ─────────────────────────────────────────────────────────────────────────
create table vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete set null,
  city_id uuid not null references cities(id),
  slug text unique not null,
  name text not null,
  service_type text not null,
  bio text,
  starting_price numeric(10,2),
  rating numeric(2,1),
  review_count int not null default 0,
  approval_status approval_status not null default 'PENDING',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table vendor_media (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  url text not null,
  sort_order int not null default 0
);

create table vendor_packages (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null
);

-- ─────────────────────────────────────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────────────────────────────────────
create type event_visibility as enum ('PUBLIC', 'PRIVATE', 'UNLISTED');
create type event_status as enum ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

create table events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references profiles(id) on delete set null,
  city_id uuid not null references cities(id),
  venue_id uuid references venues(id),
  category_id uuid references event_categories(id),
  slug text unique not null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  visibility event_visibility not null default 'PUBLIC',
  status event_status not null default 'DRAFT',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  url text not null,
  sort_order int not null default 0
);

create table event_lineup (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  vendor_id uuid references vendors(id),
  display_name text not null,
  role text
);

create table event_tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  capacity int not null,
  sold int not null default 0,
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  sort_order int not null default 0
);

-- ─────────────────────────────────────────────────────────────────────────
-- BOOKINGS & PAYMENTS — explicit state machines, never a boolean `paid`.
-- ─────────────────────────────────────────────────────────────────────────
create type booking_status as enum (
  'DRAFT', 'PENDING_PAYMENT', 'PAYMENT_FAILED', 'CONFIRMED',
  'CHECKED_IN', 'COMPLETED', 'CANCEL_REQUESTED', 'REFUND_PENDING', 'REFUNDED'
);
create type payment_status as enum (
  'INITIATED', 'PENDING', 'SUCCESS', 'FAILED',
  'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id),
  user_id uuid references profiles(id),
  guest_name text,
  guest_phone text,
  guest_email text,
  status booking_status not null default 'DRAFT',
  total_amount numeric(10,2) not null default 0,
  qr_code text unique,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  constraint booker_identity check (user_id is not null or guest_name is not null)
);

create table booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  ticket_id uuid not null references event_tickets(id),
  quantity int not null,
  unit_price numeric(10,2) not null
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  status payment_status not null default 'INITIATED',
  amount numeric(10,2) not null,
  provider text,
  provider_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- PARTY BUILDER — host wizard: venue + vendors bundled into one project.
-- ─────────────────────────────────────────────────────────────────────────
create table party_projects (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references profiles(id) on delete cascade,
  city_id uuid not null references cities(id),
  event_type text not null,
  guest_count_range text,
  event_date date,
  venue_id uuid references venues(id),
  status text not null default 'DRAFT',
  created_at timestamptz not null default now()
);

create table party_items (
  id uuid primary key default gen_random_uuid(),
  party_project_id uuid not null references party_projects(id) on delete cascade,
  vendor_id uuid references vendors(id),
  vendor_package_id uuid references vendor_packages(id),
  label text not null,
  price numeric(10,2) not null
);

-- ─────────────────────────────────────────────────────────────────────────
-- Indexes for the query patterns discovery/checkout actually use.
-- ─────────────────────────────────────────────────────────────────────────
create index idx_events_city_status_starts on events (city_id, status, starts_at);
create index idx_events_category on events (category_id);
create index idx_venues_city_status on venues (city_id, approval_status);
create index idx_vendors_city_status on vendors (city_id, approval_status);
create index idx_bookings_event on bookings (event_id);
create index idx_bookings_user on bookings (user_id);
create index idx_venue_availability_venue_date on venue_availability (venue_id, date);
