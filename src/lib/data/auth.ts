import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, home_city_id")
    .eq("id", user.id)
    .maybeSingle();

  return { id: user.id, email: user.email ?? null, profile };
}
