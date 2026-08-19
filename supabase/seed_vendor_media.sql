-- Attach a banner image to every vendor based on their service type.

insert into vendor_media (vendor_id, media_type, url, sort_order)
select
  v.id,
  'image',
  '/demo/vendors/' || (
    case v.service_type
      when 'DJ' then 'dj'
      when 'Catering' then 'catering'
      when 'Decoration' then 'decoration'
      when 'Photography' then 'photography'
      when 'Videography' then 'videography'
      when 'Sound & Lights' then 'sound-lights'
      when 'Comedian' then 'comedian'
      when 'Anchor' then 'anchor'
      when 'Dancer' then 'dancer'
      when 'Band' then 'band'
      when 'Singer' then 'singer'
      else 'dj'
    end
  ) || '.svg',
  1
from vendors v
where not exists (
  select 1 from vendor_media m where m.vendor_id = v.id
);
