-- Row Level Security: the database is the last line of defense.
-- Server code should still check roles, but these policies hold even if it doesn't.

alter table cities enable row level security;
alter table city_notify_signups enable row level security;
alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table event_categories enable row level security;
alter table venues enable row level security;
alter table venue_media enable row level security;
alter table venue_availability enable row level security;
alter table vendors enable row level security;
alter table vendor_media enable row level security;
alter table vendor_packages enable row level security;
alter table events enable row level security;
alter table event_media enable row level security;
alter table event_lineup enable row level security;
alter table event_tickets enable row level security;
alter table bookings enable row level security;
alter table booking_items enable row level security;
alter table payments enable row level security;
alter table party_projects enable row level security;
alter table party_items enable row level security;

create function has_role(target uuid, r user_role) returns boolean
  language sql security definer stable as $$
    select exists (select 1 from user_roles where user_id = target and role = r);
  $$;

create function is_admin() returns boolean
  language sql security definer stable as $$
    select has_role(auth.uid(), 'ADMIN');
  $$;

-- Public read: cities, categories, published/public events, approved venues/vendors.
create policy "cities are publicly readable" on cities for select using (true);
create policy "anyone can signal city interest" on city_notify_signups for insert with check (true);
create policy "categories are publicly readable" on event_categories for select using (active or is_admin());

create policy "own profile readable/writable" on profiles for select using (auth.uid() = id or is_admin());
create policy "own profile insert" on profiles for insert with check (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id or is_admin());

create policy "own roles readable" on user_roles for select using (auth.uid() = user_id or is_admin());
create policy "admin manages roles" on user_roles for all using (is_admin()) with check (is_admin());

create policy "approved venues are public" on venues for select
  using (approval_status = 'APPROVED' or owner_id = auth.uid() or is_admin());
create policy "owners manage own venues" on venues for insert with check (owner_id = auth.uid() or is_admin());
create policy "owners update own venues" on venues for update
  using (owner_id = auth.uid() or is_admin());

create policy "venue media follows venue visibility" on venue_media for select
  using (exists (select 1 from venues v where v.id = venue_id
    and (v.approval_status = 'APPROVED' or v.owner_id = auth.uid() or is_admin())));
create policy "owners manage own venue media" on venue_media for all
  using (exists (select 1 from venues v where v.id = venue_id and (v.owner_id = auth.uid() or is_admin())));

create policy "venue availability is public" on venue_availability for select using (true);
create policy "owners manage own venue availability" on venue_availability for all
  using (exists (select 1 from venues v where v.id = venue_id and (v.owner_id = auth.uid() or is_admin())));

create policy "approved vendors are public" on vendors for select
  using (approval_status = 'APPROVED' or owner_id = auth.uid() or is_admin());
create policy "owners manage own vendor profile" on vendors for insert with check (owner_id = auth.uid() or is_admin());
create policy "owners update own vendor profile" on vendors for update
  using (owner_id = auth.uid() or is_admin());

create policy "vendor media follows vendor visibility" on vendor_media for select
  using (exists (select 1 from vendors v where v.id = vendor_id
    and (v.approval_status = 'APPROVED' or v.owner_id = auth.uid() or is_admin())));
create policy "owners manage own vendor media" on vendor_media for all
  using (exists (select 1 from vendors v where v.id = vendor_id and (v.owner_id = auth.uid() or is_admin())));

create policy "vendor packages are public" on vendor_packages for select using (true);
create policy "owners manage own vendor packages" on vendor_packages for all
  using (exists (select 1 from vendors v where v.id = vendor_id and (v.owner_id = auth.uid() or is_admin())));

create policy "published public events are visible" on events for select
  using (
    (status = 'PUBLISHED' and visibility in ('PUBLIC', 'UNLISTED'))
    or organizer_id = auth.uid()
    or is_admin()
  );
create policy "organizers create events" on events for insert with check (organizer_id = auth.uid() or is_admin());
create policy "organizers update own events" on events for update
  using (organizer_id = auth.uid() or is_admin());

create policy "event media follows event visibility" on event_media for select
  using (exists (select 1 from events e where e.id = event_id
    and (e.status = 'PUBLISHED' or e.organizer_id = auth.uid() or is_admin())));
create policy "organizers manage own event media" on event_media for all
  using (exists (select 1 from events e where e.id = event_id and (e.organizer_id = auth.uid() or is_admin())));

create policy "event lineup follows event visibility" on event_lineup for select
  using (exists (select 1 from events e where e.id = event_id
    and (e.status = 'PUBLISHED' or e.organizer_id = auth.uid() or is_admin())));
create policy "organizers manage own event lineup" on event_lineup for all
  using (exists (select 1 from events e where e.id = event_id and (e.organizer_id = auth.uid() or is_admin())));

create policy "tickets follow event visibility" on event_tickets for select
  using (exists (select 1 from events e where e.id = event_id
    and (e.status = 'PUBLISHED' or e.organizer_id = auth.uid() or is_admin())));
create policy "organizers manage own tickets" on event_tickets for all
  using (exists (select 1 from events e where e.id = event_id and (e.organizer_id = auth.uid() or is_admin())));

-- Bookings: guests can create (checkout is server-mediated via service role);
-- reads are restricted to the booking's own user or the event organizer.
create policy "users see own bookings" on bookings for select
  using (user_id = auth.uid() or is_admin()
    or exists (select 1 from events e where e.id = event_id and e.organizer_id = auth.uid()));
create policy "users update own bookings" on bookings for update
  using (user_id = auth.uid() or is_admin());

create policy "booking items follow booking" on booking_items for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or is_admin())));

create policy "payments follow booking" on payments for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or is_admin())));

create policy "hosts manage own party projects" on party_projects for all
  using (host_id = auth.uid() or is_admin());

create policy "party items follow project" on party_items for all
  using (exists (select 1 from party_projects p where p.id = party_project_id and (p.host_id = auth.uid() or is_admin())));
