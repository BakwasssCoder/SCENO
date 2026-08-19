"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PartyPopper, Ticket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addVenueToParty, addVendorToParty } from "@/lib/actions/party";
import { bookDirectly } from "@/lib/actions/bookings";

export function AddToPartyDialog({
  kind,
  id,
  citySlug,
  label,
  price,
  isAuthed,
  triggerClassName,
  triggerLabel = "Add to Party +",
}: {
  kind: "vendor" | "venue";
  id: string;
  citySlug: string;
  label: string;
  price: number;
  isAuthed: boolean;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const bookingFee = Math.round(price * 0.1);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isAuthed) {
            router.push("/login");
            return;
          }
          setOpen(true);
        }}
        className={triggerClassName}
      >
        {triggerLabel}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="comic-card bg-surface sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl uppercase tracking-tight">
              {label}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <button
              disabled={pending}
              onClick={() =>
                startTransition(() => {
                  if (kind === "venue") addVenueToParty(citySlug, id);
                  else addVendorToParty(citySlug, id, label, price);
                })
              }
              className="comic-card flex items-start gap-3 rounded-xl bg-comic-yellow/30 p-4 text-left"
            >
              <PartyPopper className="mt-0.5 h-5 w-5 shrink-0 text-electric-orange" />
              <span>
                <span className="block font-display">Add to My Party</span>
                <span className="block text-sm text-muted-foreground">
                  Building a full event? Add this to your party project.
                </span>
              </span>
            </button>

            <button
              disabled={pending}
              onClick={() =>
                startTransition(() => {
                  bookDirectly(kind, id, price);
                })
              }
              className="comic-card flex items-start gap-3 rounded-xl bg-surface p-4 text-left"
            >
              <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-electric-orange" />
              <span>
                <span className="block font-display">Book for Personal Use</span>
                <span className="block text-sm text-muted-foreground">
                  Just booking this yourself — pay a ₹{bookingFee.toLocaleString("en-IN")} booking fee (10%) to confirm.
                </span>
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
