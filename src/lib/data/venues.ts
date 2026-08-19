import { createClient } from "@/lib/supabase/server";

export interface VenueListing {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  capacity: number | null;
  starting_price: number | null;
  address: string | null;
  amenities: string[];
  verified: boolean;
  media: { url: string; media_type: string }[];
}

export async function getVenuesForCity(cityId: string): Promise<VenueListing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select(
      "id, slug, name, description, capacity, starting_price, address, amenities, verified, media:venue_media ( url, media_type )",
    )
    .eq("city_id", cityId)
    .eq("approval_status", "APPROVED")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as VenueListing[];
}

export async function getUnavailableVenueIds(
  cityId: string,
  date: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venue_availability")
    .select("venue_id, venues!inner ( city_id )")
    .eq("date", date)
    .neq("status", "AVAILABLE")
    .eq("venues.city_id", cityId);

  if (error) throw error;
  return new Set((data ?? []).map((r) => r.venue_id as string));
}

export interface VendorListing {
  id: string;
  slug: string;
  name: string;
  service_type: string;
  bio: string | null;
  starting_price: number | null;
  rating: number | null;
  review_count: number;
  verified: boolean;
  media: { url: string; media_type: string }[];
}

export async function getVendorsForCity(cityId: string): Promise<VendorListing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select(
      "id, slug, name, service_type, bio, starting_price, rating, review_count, verified, media:vendor_media ( url, media_type )",
    )
    .eq("city_id", cityId)
    .eq("approval_status", "APPROVED")
    .order("rating", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as VendorListing[];
}
