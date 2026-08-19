import { createClient } from "@/lib/supabase/server";
import type { DiscoveryEvent, EventCategory } from "@/types/db";

const EVENT_SELECT = `
  id, slug, title, description, starts_at, ends_at, featured,
  venue:venues ( id, slug, name, address, capacity ),
  category:event_categories ( id, slug, name, emoji, sort_order, active ),
  media:event_media ( id, media_type, url, sort_order ),
  tickets:event_tickets ( id, name, price, capacity, sold )
`;

export async function getCategories(): Promise<EventCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_categories")
    .select("id, slug, name, emoji, sort_order, active")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getUpcomingEventsForCity(
  cityId: string,
  limit = 12,
): Promise<DiscoveryEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("city_id", cityId)
    .eq("status", "PUBLISHED")
    .eq("visibility", "PUBLIC")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as DiscoveryEvent[];
}

export async function getEventsForExplore(
  cityId: string,
  options: { categorySlug?: string; limit?: number } = {},
): Promise<DiscoveryEvent[]> {
  const supabase = await createClient();
  const select = options.categorySlug
    ? EVENT_SELECT.replace(
        "category:event_categories (",
        "category:event_categories!inner (",
      )
    : EVENT_SELECT;

  let query = supabase
    .from("events")
    .select(select)
    .eq("city_id", cityId)
    .eq("status", "PUBLISHED")
    .eq("visibility", "PUBLIC")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(options.limit ?? 60);

  if (options.categorySlug) {
    query = query.eq("category.slug", options.categorySlug);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as DiscoveryEvent[];
}

export async function getEventCountsForCity(cityId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("city_id", cityId)
    .eq("status", "PUBLISHED")
    .eq("visibility", "PUBLIC")
    .gte("starts_at", new Date().toISOString());

  if (error) throw error;
  return count ?? 0;
}

export async function getEventBySlug(
  citySlug: string,
  eventSlug: string,
): Promise<DiscoveryEvent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`${EVENT_SELECT}, city:cities!inner ( slug )`)
    .eq("slug", eventSlug)
    .eq("city.slug", citySlug)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as DiscoveryEvent | null;
}
