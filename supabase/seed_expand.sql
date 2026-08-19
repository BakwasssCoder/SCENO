-- DEMO/SEED DATA EXPANSION — more Kolkata venues + ~45 more events across every category.
-- Clearly marked demo content for local development only.

do $$
declare
  kolkata_id uuid;
  v_banquet uuid;
  v_comedy uuid;
  v_studio uuid;
  v_lounge uuid;
  v_terrace uuid;
  venue_ids uuid[];
  cat record;
  titles text[];
  t text;
  v_pick uuid;
  d int;
  hr int;
  price numeric;
  new_event uuid;
  idx int;
begin
  select id into kolkata_id from cities where slug = 'kolkata';

  insert into venues (city_id, slug, name, description, capacity, starting_price, address, amenities, approval_status, verified)
  values
    (kolkata_id, 'the-grand-banquet', 'The Grand Banquet', 'Large banquet hall for weddings, corporate events and big celebrations.', 400, 60000, 'Alipore, Kolkata', array['Parking','AC','Sound','Catering','Private space'], 'APPROVED', true),
    (kolkata_id, 'laugh-track-comedy-club', 'Laugh Track Comedy Club', 'Kolkata''s home for stand-up and improv.', 120, 10000, 'Camac Street, Kolkata', array['Sound','AC'], 'APPROVED', true),
    (kolkata_id, 'the-studio-kolkata', 'The Studio Kolkata', 'Flexible workshop and event studio space.', 60, 6000, 'Gariahat, Kolkata', array['AC','Private space'], 'APPROVED', true),
    (kolkata_id, 'velvet-lounge', 'Velvet Lounge', 'Intimate cocktail lounge with live DJ sets.', 130, 18000, 'Park Street, Kolkata', array['AC','Sound','DJ area'], 'APPROVED', true),
    (kolkata_id, 'skyline-terrace', 'Skyline Terrace', 'Open-air terrace with skyline views, ideal for private parties.', 180, 22000, 'New Town, Kolkata', array['Parking','Sound','Private space','Catering'], 'APPROVED', true)
  on conflict (slug) do nothing;

  select id into v_banquet from venues where slug = 'the-grand-banquet';
  select id into v_comedy from venues where slug = 'laugh-track-comedy-club';
  select id into v_studio from venues where slug = 'the-studio-kolkata';
  select id into v_lounge from venues where slug = 'velvet-lounge';
  select id into v_terrace from venues where slug = 'skyline-terrace';

  venue_ids := array(select id from venues where city_id = kolkata_id);

  for cat in
    select id, slug from event_categories
  loop
    titles := case cat.slug
      when 'club-nights' then array['Midnight Riot','Bassline Kolkata','Saturday Stampede']
      when 'dj-nights' then array['Deep House Sessions','Analog Nights','Selector''s Choice']
      when 'live-music' then array['Unplugged at Indie House','Songwriters'' Circle','Acoustic Sundowns']
      when 'concerts' then array['Riff City Live','Kolkata Rock Federation','Guitar Nights']
      when 'dance' then array['Salsa Sundays','Bollywood Beats','Dance Floor Diaries']
      when 'cocktail-nights' then array['Sundown Sours','Mixology Night','Velvet Hour']
      when 'birthdays' then array['Aanya Turns 25','Rohan''s Big Night','Priya''s Birthday Bash']
      when 'kitty-parties' then array['Friday Night Crew Kitty','Ladies Who Lunch','Kitty Party Classic']
      when 'private-parties' then array['The Chatterjee Housewarming','Private Terrace Bash','Founders'' Night']
      when 'corporate' then array['TechCorp Annual Mixer','Startup Sundowner','Year End Wrap Party']
      when 'workshops' then array['Mixology 101','Intro to DJing','Flower Styling Workshop']
      when 'shows' then array['Stand-up Saturday','Improv Night Kolkata','Open Mic Comedy']
      when 'experiences' then array['Silent Disco Kolkata','Rooftop Cinema Night','Wine & Paint Evening']
      else array['Kolkata Night Out']
    end;

    idx := 0;
    foreach t in array titles loop
      idx := idx + 1;
      d := 2 + (idx * 3) + (ascii(substr(cat.slug, 1, 1)) % 5);
      hr := 18 + (idx % 5);
      price := 399 + (idx * 250) + (ascii(substr(cat.slug, 2, 1)) % 7) * 100;
      v_pick := venue_ids[1 + (idx + length(cat.slug)) % array_length(venue_ids, 1)];

      insert into events (organizer_id, city_id, venue_id, category_id, slug, title, description, starts_at, ends_at, visibility, status, featured)
      values (
        null, kolkata_id, v_pick, cat.id,
        lower(regexp_replace(t, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(cat.slug, 1, 3) || '-' || idx,
        t,
        t || ' — one of Kolkata''s ' || (select name from event_categories where id = cat.id) || ' picks this month.',
        now() + (d || ' days')::interval + (hr || ' hours')::interval,
        now() + (d || ' days')::interval + ((hr + 3) || ' hours')::interval,
        'PUBLIC', 'PUBLISHED', (idx = 1)
      )
      on conflict (slug) do nothing
      returning id into new_event;

      if new_event is not null then
        insert into event_tickets (event_id, name, price, capacity, sold, sort_order) values
          (new_event, 'General', price, 150, floor(random() * 90), 1),
          (new_event, 'VIP', price * 2.2, 30, floor(random() * 10), 2);

        insert into event_media (event_id, media_type, url, sort_order) values
          (new_event, 'image', '/demo/categories/' || cat.slug || '.svg', 1);
      end if;

      new_event := null;
    end loop;
  end loop;
end $$;
