-- DEMO/SEED DATA EXPANSION — broader vendor/artist marketplace across service types.

do $$
declare
  kolkata_id uuid;
begin
  select id into kolkata_id from cities where slug = 'kolkata';

  insert into vendors (city_id, slug, name, service_type, bio, starting_price, rating, review_count, approval_status, verified)
  values
    (kolkata_id, 'dj-mira', 'DJ Mira', 'DJ', 'Techno • Progressive • Underground sets across Kolkata clubs.', 6500, 4.7, 63, 'APPROVED', true),
    (kolkata_id, 'dj-kabir', 'DJ Kabir', 'DJ', 'Bollywood mashups and open-format wedding sets.', 9000, 4.9, 112, 'APPROVED', true),
    (kolkata_id, 'spice-route-catering', 'Spice Route Catering', 'Catering', 'Bengali, North Indian and continental party menus.', 350, 4.5, 71, 'APPROVED', true),
    (kolkata_id, 'petal-and-pop-decor', 'Petal & Pop Decor', 'Decoration', 'Balloon installs, floral arches and theme setups.', 7000, 4.6, 44, 'APPROVED', true),
    (kolkata_id, 'framewerk-studios', 'Framewerk Studios', 'Photography', 'Candid event and party photography.', 9000, 4.8, 58, 'APPROVED', true),
    (kolkata_id, 'reel-motion-films', 'Reel Motion Films', 'Videography', 'Cinematic highlight reels for parties and weddings.', 15000, 4.7, 33, 'APPROVED', true),
    (kolkata_id, 'boom-av-sound-lights', 'Boom AV Sound & Lights', 'Sound & Lights', 'Full PA systems, dance floor lighting rigs.', 12000, 4.6, 40, 'APPROVED', true),
    (kolkata_id, 'the-punchline-standup', 'The Punchline', 'Comedian', 'Stand-up sets for private and corporate crowds.', 8000, 4.7, 29, 'APPROVED', true),
    (kolkata_id, 'host-with-rhea', 'Host with Rhea', 'Anchor', 'Bilingual event anchoring, weddings to corporate galas.', 6000, 4.8, 51, 'APPROVED', true),
    (kolkata_id, 'the-groove-collective', 'The Groove Collective', 'Dancer', 'Choreographed dance crew for sangeet and club nights.', 10000, 4.6, 22, 'APPROVED', true),
    (kolkata_id, 'the-midnight-owls-band', 'The Midnight Owls', 'Band', 'Live retro and Bollywood cover band.', 18000, 4.9, 37, 'APPROVED', true),
    (kolkata_id, 'anika-vocals', 'Anika Sen', 'Singer', 'Live vocalist — jazz, indie and Bollywood unplugged.', 7500, 4.8, 45, 'APPROVED', true)
  on conflict (slug) do nothing;
end $$;
