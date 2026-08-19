-- Seed 45 days of availability per venue so date-based venue search has
-- real signal: mostly open, a handful of holds/bookings sprinkled in.

insert into venue_availability (venue_id, date, status)
select
  v.id,
  (current_date + s.d)::date,
  case
    when (hashtext(v.id::text || s.d::text) % 11) = 0 then 'BOOKED'
    when (hashtext(v.id::text || s.d::text) % 13) = 0 then 'HOLD'
    else 'AVAILABLE'
  end
from venues v
cross join generate_series(0, 44) as s(d)
on conflict (venue_id, date) do nothing;
