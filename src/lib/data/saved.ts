import { createClient } from "@/lib/supabase/server";
import type { DiscoveryEvent } from "@/types/db";

export async function getSavedEventIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_events")
    .select("event_id")
    .eq("user_id", userId);

  if (error) throw error;
  return new Set((data ?? []).map((r) => r.event_id));
}

const EVENT_SELECT = `
  id, slug, title, description, starts_at, ends_at, featured,
  city:cities ( slug, name ),
  venue:venues ( id, slug, name, address, capacity ),
  category:event_categories ( id, slug, name, emoji, sort_order, active ),
  media:event_media ( id, media_type, url, sort_order ),
  tickets:event_tickets ( id, name, price, capacity, sold )
`;

export async function getSavedEventsForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_events")
    .select(`event:events ( ${EVENT_SELECT} )`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? [])
    .map((r) => r.event)
    .filter(Boolean) as unknown as (DiscoveryEvent & {
    city: { slug: string; name: string };
  })[];
}
