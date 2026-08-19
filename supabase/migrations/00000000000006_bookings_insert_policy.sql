-- Missing INSERT policy on bookings meant every signed-in booking attempt
-- was silently blocked by RLS (no policy = deny by default).

create policy "users create own bookings" on bookings for insert
  with check (user_id = auth.uid());
