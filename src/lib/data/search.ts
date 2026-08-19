import { createClient } from "@/lib/supabase/server";

export interface SearchResults {
  events: { slug: string; title: string; starts_at: string }[];
  venues: { slug: string; name: string }[];
  vendors: { slug: string; name: string; service_type: string }[];
}

export async function searchCity(
  cityId: string,
  query: string,
): Promise<SearchResults> {
  const supabase = await createClient();
  const like = `%${query}%`;

  const [events, venues, vendors] = await Promise.all([
    supabase
      .from("events")
      .select("slug, title, starts_at")
      .eq("city_id", cityId)
      .eq("status", "PUBLISHED")
      .ilike("title", like)
      .limit(20),
    supabase
      .from("venues")
      .select("slug, name")
      .eq("city_id", cityId)
      .eq("approval_status", "APPROVED")
      .ilike("name", like)
      .limit(20),
    supabase
      .from("vendors")
      .select("slug, name, service_type")
      .eq("city_id", cityId)
      .eq("approval_status", "APPROVED")
      .ilike("name", like)
      .limit(20),
  ]);

  return {
    events: events.data ?? [],
    venues: venues.data ?? [],
    vendors: vendors.data ?? [],
  };
}
