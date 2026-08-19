"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleSavedEvent(eventId: string, currentlySaved: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error" as const, message: "Sign in to save events." };
  }

  if (currentlySaved) {
    await supabase
      .from("saved_events")
      .delete()
      .eq("user_id", user.id)
      .eq("event_id", eventId);
  } else {
    await supabase
      .from("saved_events")
      .insert({ user_id: user.id, event_id: eventId });
  }

  revalidatePath("/saved");
  return { status: "ok" as const, saved: !currentlySaved };
}
