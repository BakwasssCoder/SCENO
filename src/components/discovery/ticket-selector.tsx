"use client";

import { useActionState, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { bookEventTickets, type BookTicketsState } from "@/lib/actions/tickets";
import { Input } from "@/components/ui/input";
import type { EventTicket } from "@/types/db";

const initialState: BookTicketsState = { status: "idle" };

export function TicketSelector({
  eventId,
  citySlug,
  tickets,
  isAuthed,
}: {
  eventId: string;
  citySlug: string;
  tickets: EventTicket[];
  isAuthed: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    bookEventTickets,
    initialState,
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const total = tickets.reduce(
    (sum, t) => sum + (quantities[t.id] ?? 0) * t.price,
    0,
  );
  const hasSelection = Object.values(quantities).some((q) => q > 0);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="citySlug" value={citySlug} />

      {tickets.map((ticket) => {
        const remaining = ticket.capacity - ticket.sold;
        const soldOut = remaining <= 0;
        const lowStock = !soldOut && remaining <= ticket.capacity * 0.1;
        const qty = quantities[ticket.id] ?? 0;

        return (
          <div
            key={ticket.id}
            className="comic-card flex items-center justify-between rounded-xl bg-surface p-4"
          >
            <div>
              <p className="font-medium">{ticket.name}</p>
              <p className="text-sm text-muted-foreground">
                {soldOut
                  ? "Sold out"
                  : lowStock
                    ? `Only ${remaining} left`
                    : "Available"}
              </p>
              <p className="font-display text-lg">
                ₹{ticket.price.toLocaleString("en-IN")}
              </p>
            </div>

            {soldOut ? (
              <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
                Sold Out
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setQuantities((q) => ({
                      ...q,
                      [ticket.id]: Math.max(0, (q[ticket.id] ?? 0) - 1),
                    }))
                  }
                  className="comic-card flex h-8 w-8 items-center justify-center rounded-full bg-background"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-4 text-center font-display">{qty}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantities((q) => ({
                      ...q,
                      [ticket.id]: Math.min(remaining, (q[ticket.id] ?? 0) + 1),
                    }))
                  }
                  className="comic-card flex h-8 w-8 items-center justify-center rounded-full bg-background"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <input type="hidden" name={`qty_${ticket.id}`} value={qty} />
              </div>
            )}
          </div>
        );
      })}

      {hasSelection && (
        <>
          {!isAuthed && (
            <div className="comic-card flex flex-col gap-2 rounded-xl bg-comic-yellow/30 p-4">
              <p className="text-xs font-bold uppercase tracking-wide">
                Your details
              </p>
              <Input name="guestName" placeholder="Name" required className="bg-background" />
              <Input name="guestPhone" placeholder="Mobile number" required className="bg-background" />
              <Input name="guestEmail" type="email" placeholder="Email (optional)" className="bg-background" />
            </div>
          )}

          {state.status === "error" && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="comic-card rounded-full bg-electric-orange px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-background"
          >
            {pending
              ? "..."
              : `Book Now · ₹${total.toLocaleString("en-IN")}`}
          </button>
        </>
      )}
    </form>
  );
}
