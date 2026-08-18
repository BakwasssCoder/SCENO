-- DEMO/SEED DATA — clearly marked, for local development only.
-- Do not treat as real production content (see project section 69/70).

insert into cities (slug, name, state, status, hero_headline, hero_subheadline, sort_order, launch_date) values
  ('kolkata', 'Kolkata', 'West Bengal', 'LIVE', 'KOLKATA TONIGHT.', 'Find what''s happening tonight. Join the party. Or build your own.', 1, null),
  ('patna', 'Patna', 'Bihar', 'COMING_SOON', 'PATNA, YOUR SCENE IS LOADING.', 'We''re coming soon. Be the first to know when we launch.', 2, '2026-11-01');

insert into event_categories (slug, name, emoji, sort_order) values
  ('club-nights', 'Club Nights', '🔥', 1),
  ('dj-nights', 'DJ Nights', '🎧', 2),
  ('live-music', 'Live Music', '🎤', 3),
  ('concerts', 'Concerts', '🎸', 4),
  ('dance', 'Dance', '💃', 5),
  ('cocktail-nights', 'Cocktail Nights', '🍸', 6),
  ('birthdays', 'Birthdays', '🎂', 7),
  ('kitty-parties', 'Kitty Parties', '👯', 8),
  ('private-parties', 'Private Parties', '🎉', 9),
  ('corporate', 'Corporate', '🏢', 10),
  ('workshops', 'Workshops', '🎨', 11),
  ('shows', 'Shows', '🎭', 12),
  ('experiences', 'Experiences', '✨', 13);

do $$
declare
  kolkata_id uuid;
  cat_club uuid;
  cat_dj uuid;
  cat_live uuid;
  cat_cocktail uuid;
  venue_xyz uuid;
  venue_rooftop uuid;
  venue_indie uuid;
  event1 uuid;
  event2 uuid;
  event3 uuid;
  event4 uuid;
begin
  select id into kolkata_id from cities where slug = 'kolkata';
  select id into cat_club from event_categories where slug = 'club-nights';
  select id into cat_dj from event_categories where slug = 'dj-nights';
  select id into cat_live from event_categories where slug = 'live-music';
  select id into cat_cocktail from event_categories where slug = 'cocktail-nights';

  insert into venues (city_id, slug, name, description, capacity, starting_price, address, amenities, approval_status, verified)
  values
    (kolkata_id, 'xyz-club', 'XYZ Club', 'Kolkata''s biggest dance floor and sound system.', 520, 25000, 'Park Street, Kolkata',
      array['Parking','AC','Sound','DJ area'], 'APPROVED', true),
    (kolkata_id, 'the-rooftop', 'The Rooftop', 'Open-air rooftop venue with skyline views.', 150, 25000, 'Ballygunge, Kolkata',
      array['Parking','AC','Sound','DJ area','Catering','Private space'], 'APPROVED', true),
    (kolkata_id, 'indie-house', 'Indie House', 'Intimate live-music venue for acoustic sets.', 90, 15000, 'Salt Lake, Kolkata',
      array['Sound','Private space'], 'APPROVED', true)
  returning id into venue_xyz;

  select id into venue_xyz from venues where slug = 'xyz-club';
  select id into venue_rooftop from venues where slug = 'the-rooftop';
  select id into venue_indie from venues where slug = 'indie-house';

  insert into vendors (city_id, slug, name, service_type, bio, starting_price, rating, review_count, approval_status, verified)
  values
    (kolkata_id, 'dj-rishab', 'DJ Rishab', 'DJ', 'House • Bollywood • EDM. 87 events played across Kolkata.', 7000, 4.8, 87, 'APPROVED', true),
    (kolkata_id, 'saanvi-events-catering', 'Saanvi Events Catering', 'Catering', 'Full-service catering for parties of all sizes.', 400, 4.6, 52, 'APPROVED', true),
    (kolkata_id, 'lumen-decor', 'Lumen Decor', 'Decoration', 'Theme decor, balloon art, floral setups.', 8000, 4.7, 39, 'APPROVED', true);

  insert into events (organizer_id, city_id, venue_id, category_id, slug, title, description, starts_at, ends_at, visibility, status, featured)
  values
    (null, kolkata_id, venue_xyz, cat_club, 'neon-saturday', 'Neon Saturday',
      'Kolkata''s biggest Saturday night. Neon lights, house beats, all night.', now() + interval '1 day' + interval '22 hours', now() + interval '2 days' + interval '2 hours',
      'PUBLIC', 'PUBLISHED', true)
    returning id into event1;

  insert into events (organizer_id, city_id, venue_id, category_id, slug, title, description, starts_at, ends_at, visibility, status, featured)
  values
    (null, kolkata_id, venue_rooftop, cat_cocktail, 'kolkata-rooftop-sessions', 'Kolkata Rooftop Sessions',
      'Sundown cocktails and chill beats above the city.', now() + interval '2 days' + interval '19 hours', now() + interval '2 days' + interval '23 hours',
      'PUBLIC', 'PUBLISHED', false)
    returning id into event2;

  insert into events (organizer_id, city_id, venue_id, category_id, slug, title, description, starts_at, ends_at, visibility, status, featured)
  values
    (null, kolkata_id, venue_xyz, cat_dj, 'friday-after-dark', 'Friday After Dark',
      'Weekly Friday club night with rotating resident DJs.', now() + interval '5 days' + interval '22 hours', now() + interval '6 days' + interval '2 hours',
      'PUBLIC', 'PUBLISHED', false)
    returning id into event3;

  insert into events (organizer_id, city_id, venue_id, category_id, slug, title, description, starts_at, ends_at, visibility, status, featured)
  values
    (null, kolkata_id, venue_indie, cat_live, 'indie-night-kolkata', 'Indie Night Kolkata',
      'Live acoustic sets from Kolkata''s indie scene.', now() + interval '3 days' + interval '20 hours', now() + interval '3 days' + interval '23 hours',
      'PUBLIC', 'PUBLISHED', false)
    returning id into event4;

  insert into event_tickets (event_id, name, price, capacity, sold, sort_order) values
    (event1, 'General', 799, 400, 340, 1),
    (event1, 'Couple', 1399, 100, 40, 2),
    (event1, 'VIP', 2999, 20, 3, 3),
    (event2, 'General', 999, 100, 20, 1),
    (event3, 'General', 599, 350, 50, 1),
    (event4, 'General', 499, 80, 12, 1);

  insert into event_lineup (event_id, display_name, role) values
    (event1, 'DJ Rishab', 'Headliner'),
    (event3, 'DJ Rishab', 'Resident DJ');

  insert into event_media (event_id, media_type, url, sort_order) values
    (event1, 'image', '/demo/events/neon-saturday.jpg', 1),
    (event2, 'image', '/demo/events/rooftop-sessions.jpg', 1),
    (event3, 'image', '/demo/events/friday-after-dark.jpg', 1),
    (event4, 'image', '/demo/events/indie-night.jpg', 1);
end $$;
