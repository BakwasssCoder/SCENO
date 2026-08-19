"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUnavailableVenueIds } from "@/lib/data/venues";

export async function checkVenueAvailability(cityId: string, date: string) {
  const unavailable = await getUnavailableVenueIds(cityId, date);
  return Array.from(unavailable);
}

async function requireUserAndCity(citySlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: city } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", citySlug)
    .single();
  if (!city) throw new Error("City not found");

  return { supabase, user, cityId: city.id };
}

async function getOrCreateDraftParty(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  cityId: string,
) {
  const { data: existing } = await supabase
    .from("party_projects")
    .select("id")
    .eq("host_id", userId)
    .eq("city_id", cityId)
    .eq("status", "DRAFT")
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("party_projects")
    .insert({ host_id: userId, city_id: cityId, event_type: "Other", status: "DRAFT" })
    .select("id")
    .single();

  if (error || !created) throw new Error("Could not start a party");
  return created.id;
}

export async function finalizeParty(
  citySlug: string,
  details: {
    eventType: string;
    guestCountRange: string;
    eventDate: string;
    venueId: string | null;
  },
  addons: { vendorId: string; label: string; price: number }[],
) {
  const { supabase, user, cityId } = await requireUserAndCity(citySlug);
  const projectId = await getOrCreateDraftParty(supabase, user.id, cityId);

  await supabase
    .from("party_projects")
    .update({
      event_type: details.eventType,
      guest_count_range: details.guestCountRange,
      event_date: details.eventDate,
      venue_id: details.venueId,
    })
    .eq("id", projectId);

  if (addons.length > 0) {
    await supabase.from("party_items").insert(
      addons.map((a) => ({
        party_project_id: projectId,
        vendor_id: a.vendorId,
        label: a.label,
        price: a.price,
      })),
    );
  }

  revalidatePath(`/${citySlug}/my-party`);
  redirect(`/${citySlug}/my-party`);
}

export async function addVenueToParty(citySlug: string, venueId: string) {
  const { supabase, user, cityId } = await requireUserAndCity(citySlug);
  const projectId = await getOrCreateDraftParty(supabase, user.id, cityId);

  await supabase
    .from("party_projects")
    .update({ venue_id: venueId })
    .eq("id", projectId);

  revalidatePath(`/${citySlug}/my-party`);
  redirect(`/${citySlug}/my-party`);
}

export async function addVendorToParty(
  citySlug: string,
  vendorId: string,
  label: string,
  price: number,
) {
  const { supabase, user, cityId } = await requireUserAndCity(citySlug);
  const projectId = await getOrCreateDraftParty(supabase, user.id, cityId);

  await supabase
    .from("party_items")
    .insert({ party_project_id: projectId, vendor_id: vendorId, label, price });

  revalidatePath(`/${citySlug}/my-party`);
  redirect(`/${citySlug}/my-party`);
}

export async function removePartyItem(citySlug: string, itemId: string) {
  const { supabase } = await requireUserAndCity(citySlug);
  await supabase.from("party_items").delete().eq("id", itemId);
  revalidatePath(`/${citySlug}/my-party`);
}

export async function setPartyDate(citySlug: string, formData: FormData) {
  const date = formData.get("date");
  if (typeof date !== "string" || !date) return;

  const { supabase, user, cityId } = await requireUserAndCity(citySlug);
  const projectId = await getOrCreateDraftParty(supabase, user.id, cityId);

  await supabase
    .from("party_projects")
    .update({ event_date: date })
    .eq("id", projectId);

  revalidatePath(`/${citySlug}/my-party`);
}

export async function submitPartyForCheckout(citySlug: string) {
  const { supabase, user, cityId } = await requireUserAndCity(citySlug);
  const projectId = await getOrCreateDraftParty(supabase, user.id, cityId);

  await supabase
    .from("party_projects")
    .update({ status: "PENDING_PAYMENT" })
    .eq("id", projectId);

  revalidatePath(`/${citySlug}/my-party`);
  redirect(`/${citySlug}/my-party/checkout`);
}

export async function removePartyVenue(citySlug: string, projectId: string) {
  const { supabase } = await requireUserAndCity(citySlug);
  await supabase
    .from("party_projects")
    .update({ venue_id: null })
    .eq("id", projectId);
  revalidatePath(`/${citySlug}/my-party`);
}
