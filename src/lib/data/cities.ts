import { createClient } from "@/lib/supabase/server";
import type { City } from "@/types/db";

export async function getCities(): Promise<City[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select(
      "id, slug, name, state, status, hero_headline, hero_subheadline, launch_date, sort_order",
    )
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select(
      "id, slug, name, state, status, hero_headline, hero_subheadline, launch_date, sort_order",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
