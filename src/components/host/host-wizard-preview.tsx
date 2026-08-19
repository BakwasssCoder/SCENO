"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { emoji: "🎂", label: "Birthday" },
  { emoji: "👯", label: "Kitty Party" },
  { emoji: "🎉", label: "Private Party" },
  { emoji: "🎧", label: "Club Night" },
  { emoji: "🎓", label: "College Event" },
  { emoji: "🏢", label: "Corporate Event" },
  { emoji: "💍", label: "Wedding / Celebration" },
  { emoji: "✨", label: "Other" },
];

const GUEST_RANGES = ["10–25", "25–50", "50–100", "100–250", "250+"];

export function HostWizardPreview() {
  const [eventType, setEventType] = useState<string | null>(null);
  const [guestRange, setGuestRange] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Step 1 — What are you hosting?
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EVENT_TYPES.map((t) => (
            <button
              key={t.label}
              onClick={() => setEventType(t.label)}
              className={cn(
                "comic-card flex flex-col items-center gap-1.5 rounded-xl p-4 text-sm font-medium",
                eventType === t.label
                  ? "bg-electric-orange text-background"
                  : "bg-surface text-foreground",
              )}
            >
              <span className="text-2xl">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {eventType && (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Step 2 — How many guests?
          </p>
          <div className="flex flex-wrap gap-2">
            {GUEST_RANGES.map((g) => (
              <button
                key={g}
                onClick={() => setGuestRange(g)}
                className={cn(
                  "comic-card rounded-full px-5 py-2.5 text-sm font-bold",
                  guestRange === g
                    ? "bg-electric-orange text-background"
                    : "bg-surface text-foreground",
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {eventType && guestRange && (
        <div className="comic-card rounded-2xl bg-comic-yellow/30 p-5">
          <p className="font-display text-lg">
            {eventType} · {guestRange} guests
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to pick a date, find a venue, and start adding DJs,
            catering and decor. Full account sign-in and the live party
            builder are launching in the next build.
          </p>
        </div>
      )}
    </div>
  );
}
