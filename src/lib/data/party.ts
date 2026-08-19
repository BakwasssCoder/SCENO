import { createClient } from "@/lib/supabase/server";

export interface DraftParty {
  id: string;
  status: string;
  event_type: string;
  guest_count_range: string | null;
  event_date: string | null;
  venue: { id: string; name: string; starting_price: number | null } | null;
  items: { id: string; label: string; price: number }[];
}

const PARTY_SELECT =
  "id, status, event_type, guest_count_range, event_date, venue:venues ( id, name, starting_price ), items:party_items ( id, label, price )";

export async function getDraftParty(
  userId: string,
  cityId: string,
): Promise<DraftParty | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("party_projects")
    .select(PARTY_SELECT)
    .eq("host_id", userId)
    .eq("city_id", cityId)
    .eq("status", "DRAFT")
    .maybeSingle();

  return data as unknown as DraftParty | null;
}

export async function getLatestPartyProject(
  userId: string,
  cityId: string,
): Promise<DraftParty | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("party_projects")
    .select(PARTY_SELECT)
    .eq("host_id", userId)
    .eq("city_id", cityId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as unknown as DraftParty | null;
}
