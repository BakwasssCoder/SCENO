import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/data/auth";
import { HalftonePanel } from "@/components/comic/halftone-panel";
import { ComicBadge } from "@/components/comic/comic-badge";

export const metadata: Metadata = { title: "Checkout" };

interface BookingRow {
  id: string;
  booking_type: "EVENT_TICKET" | "VENDOR_SERVICE" | "VENUE_RENTAL";
  total_amount: number;
  booking_fee: number;
  status: string;
  user_id: string | null;
  guest_name: string | null;
  vendor: { name: string } | null;
  venue: { name: string } | null;
  event: { title: string } | null;
  items: { quantity: number; unit_price: number; ticket: { name: string } | null }[];
}

export default async function CheckoutPage({
  params,
}: PageProps<"/checkout/[bookingId]">) {
  const { bookingId } = await params;

  // Guest ticket bookings have no session to authorize under, so this page
  // is fetched with the service client and instead treats the booking's
  // unguessable id as the access token (like a magic link) for guests.
  const service = createServiceClient();
  const { data } = await service
    .from("bookings")
    .select(
      "id, booking_type, total_amount, booking_fee, status, user_id, guest_name, vendor:vendors ( name ), venue:venues ( name ), event:events ( title ), items:booking_items ( quantity, unit_price, ticket:event_tickets ( name ) )",
    )
    .eq("id", bookingId)
    .maybeSingle();

  const booking = data as unknown as BookingRow | null;
  if (!booking) notFound();

  if (booking.user_id) {
    const user = await getCurrentUser();
    if (!user || user.id !== booking.user_id) notFound();
  }

  const name =
    booking.event?.title ?? booking.vendor?.name ?? booking.venue?.name ?? "Booking";
  const dueNow =
    booking.booking_type === "EVENT_TICKET"
      ? booking.total_amount
      : booking.booking_fee;

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
      <HalftonePanel className="-left-14 -top-10 text-electric-orange" />

      <div className="comic-card relative w-full max-w-md rounded-2xl bg-surface p-8">
        <ComicBadge variant="orange" className="w-fit">
          Pending Payment
        </ComicBadge>
        <h1 className="text-impact mt-3 text-3xl uppercase">{name}</h1>
        {booking.guest_name && (
          <p className="mt-1 text-sm text-muted-foreground">
            Booked by {booking.guest_name}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 text-sm">
          {booking.items.length > 0 &&
            booking.items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.ticket?.name ?? "Ticket"} × {item.quantity}
                </span>
                <span>
                  ₹{(item.quantity * Number(item.unit_price)).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {booking.booking_type === "EVENT_TICKET" ? "Ticket total" : "Service total"}
            </span>
            <span>₹{Number(booking.total_amount).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between font-display text-base">
            <span>Due now</span>
            <span>₹{Number(dueNow).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="comic-card mt-6 flex items-start gap-3 rounded-xl bg-comic-yellow/30 p-4">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">
            Payment isn&apos;t connected yet — this booking is saved as{" "}
            <strong>Pending Payment</strong>. Once a payment gateway is
            wired up, you&apos;ll pay right here to confirm and get your
            QR entry pass.
          </p>
        </div>
      </div>
    </div>
  );
}
