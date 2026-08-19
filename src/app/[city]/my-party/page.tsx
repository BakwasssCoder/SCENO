import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { X, Plus, CalendarDays } from "lucide-react";
import { getCityBySlug } from "@/lib/data/cities";
import { getCurrentUser } from "@/lib/data/auth";
import { getDraftParty } from "@/lib/data/party";
import {
  removePartyItem,
  removePartyVenue,
  setPartyDate,
  submitPartyForCheckout,
} from "@/lib/actions/party";
import { PageHeader } from "@/components/comic/page-header";

export const metadata: Metadata = { title: "My Party" };

export default async function MyPartyPage({
  params,
}: PageProps<"/[city]/my-party">) {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city || city.status !== "LIVE") notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const party = await getDraftParty(user.id, city.id);
  const venuePrice = party?.venue?.starting_price
    ? Number(party.venue.starting_price)
    : 0;
  const itemsTotal = (party?.items ?? []).reduce(
    (sum, item) => sum + Number(item.price),
    0,
  );
  const total = venuePrice + itemsTotal;
  const isEmpty = !party || (!party.venue && itemsTotal === 0);

  return (
    <div className="flex flex-col gap-8 pb-24">
      <PageHeader
        eyebrow="🎉 Your Build"
        title="My Party"
        subtitle="Everything you've added so far, with a live running total."
      />

      <div className="flex flex-col gap-4 px-4 sm:px-6">
        <form
          action={setPartyDate.bind(null, citySlug)}
          className="comic-card flex flex-wrap items-center gap-3 rounded-xl bg-surface p-4"
        >
          <CalendarDays className="h-5 w-5 text-electric-orange" />
          <label htmlFor="event_date" className="text-sm font-bold">
            Party date
          </label>
          <input
            id="event_date"
            type="date"
            name="date"
            defaultValue={party?.event_date ?? undefined}
            min={new Date().toISOString().slice(0, 10)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            className="comic-card ml-auto rounded-full bg-comic-yellow px-4 py-1.5 text-xs font-bold uppercase text-[#0b0b0d]"
          >
            Save Date
          </button>
        </form>

        {isEmpty ? (
          <div className="comic-card rounded-2xl bg-surface p-12 text-center">
            <p className="font-display text-xl">Your party is empty 👀</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse venues and artists, then add them here.
            </p>
          </div>
        ) : (
          <>
            {party.venue && (
              <form
                action={removePartyVenue.bind(null, citySlug, party.id)}
                className="comic-card flex items-center justify-between rounded-xl bg-surface p-4"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-electric-orange">
                    Venue
                  </p>
                  <p className="font-display">{party.venue.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display">
                    ₹{venuePrice.toLocaleString("en-IN")}
                  </span>
                  <button
                    type="submit"
                    aria-label="Remove venue"
                    className="rounded-full p-1.5 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {party.items.map((item) => (
              <form
                key={item.id}
                action={removePartyItem.bind(null, citySlug, item.id)}
                className="comic-card flex items-center justify-between rounded-xl bg-surface p-4"
              >
                <p className="font-display">{item.label}</p>
                <div className="flex items-center gap-3">
                  <span className="font-display">
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </span>
                  <button
                    type="submit"
                    aria-label="Remove"
                    className="rounded-full p-1.5 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ))}

            <div className="comic-card mt-2 flex items-center justify-between rounded-xl bg-comic-yellow/40 p-4">
              <span className="font-display text-lg">Estimated Total</span>
              <span className="font-display text-lg">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            <form action={submitPartyForCheckout.bind(null, citySlug)}>
              <button
                type="submit"
                className="comic-card w-full rounded-full bg-electric-orange px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-background"
              >
                Proceed to Checkout →
              </button>
            </form>
          </>
        )}

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${citySlug}/venues`}
            className="comic-card flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-xs font-bold uppercase tracking-wide"
          >
            <Plus className="h-3.5 w-3.5" /> Add a Venue
          </Link>
          <Link
            href={`/${citySlug}/artists`}
            className="comic-card flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-xs font-bold uppercase tracking-wide"
          >
            <Plus className="h-3.5 w-3.5" /> Add DJs, Catering & More
          </Link>
        </div>
      </div>
    </div>
  );
}
