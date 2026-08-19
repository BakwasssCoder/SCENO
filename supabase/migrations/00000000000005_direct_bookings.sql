-- Generalize bookings beyond event tickets so a vendor or venue can also be
-- booked directly for personal use (outside the host party-builder flow).

alter table bookings alter column event_id drop not null;
alter table bookings add column vendor_id uuid references vendors(id);
alter table bookings add column venue_id uuid references venues(id);
alter table bookings add column booking_type text not null default 'EVENT_TICKET'
  check (booking_type in ('EVENT_TICKET', 'VENDOR_SERVICE', 'VENUE_RENTAL'));
alter table bookings add column booking_fee numeric(10,2) not null default 0;

alter table bookings add constraint booking_target_matches_type check (
  (booking_type = 'EVENT_TICKET' and event_id is not null)
  or (booking_type = 'VENDOR_SERVICE' and vendor_id is not null)
  or (booking_type = 'VENUE_RENTAL' and venue_id is not null)
);

create index idx_bookings_vendor on bookings (vendor_id);
create index idx_bookings_venue on bookings (venue_id);
