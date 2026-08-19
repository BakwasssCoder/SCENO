"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const BookSchema = z.object({
  eventId: z.string().uuid(),
  citySlug: z.string(),
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
  guestEmail: z.string().email().optional().or(z.literal("")),
});

export type BookTicketsState = {
  status: "idle" | "error";
  message?: string;
};

export async function bookEventTickets(
  _prev: BookTicketsState,
  formData: FormData,
): Promise<BookTicketsState> {
  const parsed = BookSchema.safeParse({
    eventId: formData.get("eventId"),
    citySlug: formData.get("citySlug"),
    guestName: formData.get("guestName") || undefined,
    guestPhone: formData.get("guestPhone") || undefined,
    guestEmail: formData.get("guestEmail") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: "Something went wrong. Try again." };
  }
  const { eventId, guestName, guestPhone, guestEmail } = parsed.data;

  const quantities: Record<string, number> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("qty_")) {
      const ticketId = key.slice(4);
      const qty = Number(value);
      if (qty > 0) quantities[ticketId] = qty;
    }
  }

  if (Object.keys(quantities).length === 0) {
    return { status: "error", message: "Select at least one ticket." };
  }

  const authed = await createClient();
  const {
    data: { user },
  } = await authed.auth.getUser();

  if (!user && (!guestName || !guestPhone)) {
    return { status: "error", message: "Enter your name and mobile number." };
  }

  // Service role: prices/capacity are re-derived from the DB, never trusted
  // from the client, and guest (unauthenticated) bookings need to bypass RLS
  // since there is no session to authorize them under.
  const service = createServiceClient();

  const { data: event } = await service
    .from("events")
    .select("id, status")
    .eq("id", eventId)
    .eq("status", "PUBLISHED")
    .maybeSingle();
  if (!event) {
    return { status: "error", message: "This event is no longer available." };
  }

  const { data: tickets } = await service
    .from("event_tickets")
    .select("id, price, capacity, sold")
    .in("id", Object.keys(quantities));
  if (!tickets || tickets.length === 0) {
    return { status: "error", message: "Selected tickets not found." };
  }

  let total = 0;
  const items: { ticket_id: string; quantity: number; unit_price: number }[] = [];
  for (const ticket of tickets) {
    const qty = quantities[ticket.id];
    const remaining = ticket.capacity - ticket.sold;
    if (qty > remaining) {
      return { status: "error", message: "Not enough tickets left." };
    }
    total += qty * Number(ticket.price);
    items.push({ ticket_id: ticket.id, quantity: qty, unit_price: Number(ticket.price) });
  }

  const { data: booking, error } = await service
    .from("bookings")
    .insert({
      event_id: eventId,
      booking_type: "EVENT_TICKET",
      user_id: user?.id ?? null,
      guest_name: user ? null : guestName,
      guest_phone: user ? null : guestPhone,
      guest_email: user ? null : guestEmail || null,
      status: "PENDING_PAYMENT",
      total_amount: total,
      booking_fee: 0,
    })
    .select("id")
    .single();

  if (error || !booking) {
    return { status: "error", message: "Could not create booking." };
  }

  await service.from("booking_items").insert(
    items.map((i) => ({ ...i, booking_id: booking.id })),
  );

  redirect(`/checkout/${booking.id}`);
}
