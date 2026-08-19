-- Saved/favourited events — lets signed-in users bookmark events from the feed.

create table saved_events (
  user_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table saved_events enable row level security;

create policy "users manage their own saved events" on saved_events for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index idx_saved_events_user on saved_events (user_id);
