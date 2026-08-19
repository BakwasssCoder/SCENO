"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function bookDirectly(
  kind: "vendor" | "venue",
  id: string,
  price: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bookingFee = Math.round(price * 0.1 * 100) / 100;

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      booking_type: kind === "vendor" ? "VENDOR_SERVICE" : "VENUE_RENTAL",
      vendor_id: kind === "vendor" ? id : null,
      venue_id: kind === "venue" ? id : null,
      status: "PENDING_PAYMENT",
      total_amount: price,
      booking_fee: bookingFee,
    })
    .select("id")
    .single();

  if (error || !booking) throw new Error("Could not start booking");

  redirect(`/checkout/${booking.id}`);
}
