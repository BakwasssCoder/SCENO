"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { MapPin, Users, ShieldCheck, Check, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkVenueAvailability, finalizeParty } from "@/lib/actions/party";
import type { VenueListing, VendorListing } from "@/lib/data/venues";

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

type Addon = { vendorId: string; label: string; price: number };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function maxDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 44);
  return d.toISOString().slice(0, 10);
}

export function PartyWizard({
  citySlug,
  cityId,
  isAuthed,
  venues,
  vendors,
}: {
  citySlug: string;
  cityId: string;
  isAuthed: boolean;
  venues: VenueListing[];
  vendors: VendorListing[];
}) {
  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState<string | null>(null);
  const [guestRange, setGuestRange] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [venueMode, setVenueMode] = useState<"browse" | "own" | null>(null);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [checkingAvailability, startAvailabilityCheck] = useTransition();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [saving, startSaving] = useTransition();

  const serviceTypes = useMemo(
    () => Array.from(new Set(vendors.map((v) => v.service_type))),
    [vendors],
  );

  useEffect(() => {
    if (step === 3 && date) {
      startAvailabilityCheck(async () => {
        const blocked = await checkVenueAvailability(cityId, date);
        setUnavailable(new Set(blocked));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, date, cityId]);

  const selectedVenue = venues.find((v) => v.id === venueId) ?? null;
  const venuePrice = venueMode === "browse" ? selectedVenue?.starting_price ?? 0 : 0;
  const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
  const total = venuePrice + addonsTotal;

  function toggleAddon(vendor: VendorListing) {
    setAddons((prev) =>
      prev.some((a) => a.vendorId === vendor.id)
        ? prev.filter((a) => a.vendorId !== vendor.id)
        : [
            ...prev,
            {
              vendorId: vendor.id,
              label: vendor.name,
              price: vendor.starting_price ?? 0,
            },
          ],
    );
  }

  function confirm() {
    if (!eventType || !guestRange || !date) return;
    startSaving(() => {
      finalizeParty(
        citySlug,
        { eventType, guestCountRange: guestRange, eventDate: date, venueId },
        addons,
      );
    });
  }

  if (!isAuthed) {
    return (
      <div className="comic-card mx-4 rounded-2xl bg-comic-yellow/30 p-8 text-center sm:mx-6">
        <p className="font-display text-xl">Sign in to start building.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a free account to pick a date, find a venue and add DJs,
          catering and decor.
        </p>
        <Link
          href="/login"
          className="comic-card mt-4 inline-block rounded-full bg-electric-orange px-6 py-2.5 font-display text-sm font-bold uppercase text-background"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Step 1 — event type */}
      <div>
        <StepLabel n={1} label="What are you hosting?" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EVENT_TYPES.map((t) => (
            <button
              key={t.label}
              onClick={() => {
                setEventType(t.label);
                setStep((s) => Math.max(s, 1));
              }}
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

      {/* Step 2 — guests */}
      {eventType && (
        <div>
          <StepLabel n={2} label="How many guests?" />
          <div className="flex flex-wrap gap-2">
            {GUEST_RANGES.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGuestRange(g);
                  setStep((s) => Math.max(s, 2));
                }}
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

      {/* Step 3 — date */}
      {eventType && guestRange && (
        <div>
          <StepLabel n={3} label="Date & time" />
          <input
            type="date"
            value={date}
            min={todayStr()}
            max={maxDateStr()}
            onChange={(e) => {
              setDate(e.target.value);
              setStep((s) => Math.max(s, 3));
              setVenueId(null);
              setVenueMode(null);
            }}
            className="comic-card rounded-xl bg-surface px-4 py-2.5 text-sm"
          />
        </div>
      )}

      {/* Step 4 — venue */}
      {eventType && guestRange && date && (
        <div>
          <StepLabel n={4} label="Venue" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => {
                setVenueMode("browse");
                setVenueId(null);
              }}
              className={cn(
                "comic-card flex items-center gap-3 rounded-xl p-4 text-left",
                venueMode === "browse"
                  ? "bg-electric-orange text-background"
                  : "bg-surface",
              )}
            >
              <MapPin className="h-5 w-5 shrink-0" />
              <span>
                <span className="block font-display">Choose Any Venue</span>
                <span className="block text-sm opacity-80">
                  Browse {venues.length} venues in the city
                </span>
              </span>
            </button>
            <button
              onClick={() => {
                setVenueMode("own");
                setVenueId(null);
                setStep((s) => Math.max(s, 4));
              }}
              className={cn(
                "comic-card flex items-center gap-3 rounded-xl p-4 text-left",
                venueMode === "own"
                  ? "bg-electric-orange text-background"
                  : "bg-surface",
              )}
            >
              <Home className="h-5 w-5 shrink-0" />
              <span>
                <span className="block font-display">Host at My Own Place</span>
                <span className="block text-sm opacity-80">
                  Skip the venue marketplace
                </span>
              </span>
            </button>
          </div>

          {venueMode === "browse" && (
            <div className="mt-4 flex flex-col gap-2">
              {checkingAvailability && (
                <p className="text-sm text-muted-foreground">
                  Checking availability for {date}...
                </p>
              )}
              {venues.map((v) => {
                const blocked = unavailable.has(v.id);
                const selected = venueId === v.id;
                return (
                  <button
                    key={v.id}
                    disabled={blocked}
                    onClick={() => {
                      setVenueId(v.id);
                      setStep((s) => Math.max(s, 4));
                    }}
                    className={cn(
                      "comic-card flex items-center justify-between rounded-xl p-4 text-left",
                      blocked && "opacity-40",
                      selected
                        ? "bg-electric-orange text-background"
                        : "bg-surface",
                    )}
                  >
                    <span>
                      <span className="flex items-center gap-1.5 font-display">
                        {v.name}
                        {v.verified && (
                          <ShieldCheck className="h-3.5 w-3.5 text-acid-green" />
                        )}
                      </span>
                      <span className="flex items-center gap-1 text-xs opacity-80">
                        <Users className="h-3 w-3" /> {v.capacity} capacity
                      </span>
                    </span>
                    <span className="text-sm font-bold">
                      {blocked
                        ? "Booked this date"
                        : v.starting_price
                          ? `₹${v.starting_price.toLocaleString("en-IN")}`
                          : "Available"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 5 — addons */}
      {eventType && guestRange && date && venueMode && (venueMode === "own" || venueId) && (
        <div>
          <StepLabel n={5} label="Add DJs, catering, decor & more (optional)" />
          <div className="flex flex-col gap-4">
            {serviceTypes.map((type) => (
              <div key={type}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-electric-orange">
                  {type}
                </p>
                <div className="flex flex-col gap-2">
                  {vendors
                    .filter((v) => v.service_type === type)
                    .map((vendor) => {
                      const added = addons.some((a) => a.vendorId === vendor.id);
                      return (
                        <button
                          key={vendor.id}
                          onClick={() => toggleAddon(vendor)}
                          className={cn(
                            "comic-card flex items-center justify-between rounded-xl p-3.5 text-left text-sm",
                            added
                              ? "bg-acid-green text-background"
                              : "bg-surface",
                          )}
                        >
                          <span>
                            {vendor.name}
                            {vendor.starting_price
                              ? ` · ₹${vendor.starting_price.toLocaleString("en-IN")}`
                              : ""}
                          </span>
                          {added ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-bold uppercase">Add</span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review */}
      {eventType && guestRange && date && venueMode && (venueMode === "own" || venueId) && (
        <div className="comic-card rounded-2xl bg-comic-yellow/30 p-5">
          <p className="font-display text-lg">
            {eventType} · {guestRange} guests · {date}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {venueMode === "own"
              ? "Hosting at your own place"
              : selectedVenue?.name}
            {addons.length > 0 &&
              ` · ${addons.length} add-on${addons.length > 1 ? "s" : ""}`}
          </p>
          <p className="mt-3 font-display text-2xl">
            ₹{total.toLocaleString("en-IN")} estimated
          </p>
          <button
            disabled={saving}
            onClick={confirm}
            className="comic-card mt-4 rounded-full bg-electric-orange px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-background"
          >
            {saving ? "Saving..." : "Confirm & Save Party"}
          </button>
        </div>
      )}
    </div>
  );
}

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
      Step {n} — {label}
    </p>
  );
}
