import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, ShieldCheck, MapPin } from "lucide-react";
import { getCityBySlug } from "@/lib/data/cities";
import { getVenuesForCity } from "@/lib/data/venues";
import { getCurrentUser } from "@/lib/data/auth";
import { AddToPartyDialog } from "@/components/discovery/add-to-party-dialog";

export async function generateMetadata({
  params,
}: PageProps<"/[city]/venues/[slug]">): Promise<Metadata> {
  const { city: citySlug, slug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) return {};
  const venues = await getVenuesForCity(city.id);
  const venue = venues.find((v) => v.slug === slug);
  return venue ? { title: venue.name } : {};
}

export default async function VenueDetailPage({
  params,
}: PageProps<"/[city]/venues/[slug]">) {
  const { city: citySlug, slug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city || city.status !== "LIVE") notFound();

  const [venues, user] = await Promise.all([
    getVenuesForCity(city.id),
    getCurrentUser(),
  ]);
  const venue = venues.find((v) => v.slug === slug);
  if (!venue) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-4 sm:px-6">
      <Link
        href={`/${citySlug}/venues`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to venues
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-impact text-3xl uppercase sm:text-4xl">
          {venue.name}
        </h1>
        {venue.verified && <ShieldCheck className="h-6 w-6 text-acid-green" />}
      </div>

      {venue.address && (
        <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4" /> {venue.address}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        {venue.capacity && (
          <span className="comic-card flex items-center gap-1.5 rounded-full bg-surface px-4 py-2">
            <Users className="h-4 w-4" /> {venue.capacity} capacity
          </span>
        )}
        {venue.starting_price && (
          <span className="comic-card rounded-full bg-comic-yellow px-4 py-2 font-display text-[#0b0b0d]">
            ₹{venue.starting_price.toLocaleString("en-IN")} starting
          </span>
        )}
      </div>

      {venue.description && (
        <p className="mt-6 leading-relaxed text-foreground/90">
          {venue.description}
        </p>
      )}

      {venue.amenities.length > 0 && (
        <div className="comic-card mt-6 rounded-2xl bg-surface p-5">
          <h2 className="font-display text-lg uppercase tracking-tight">
            Amenities
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {venue.amenities.map((a) => (
              <span
                key={a}
                className="rounded-full border border-foreground/20 bg-comic-yellow/40 px-3 py-1 text-sm font-medium text-foreground"
              >
                ✓ {a}
              </span>
            ))}
          </div>
        </div>
      )}

      <AddToPartyDialog
        kind="venue"
        id={venue.id}
        citySlug={citySlug}
        label={venue.name}
        price={venue.starting_price ?? 0}
        isAuthed={!!user}
        triggerLabel="Add to My Party"
        triggerClassName="comic-card mt-8 inline-block rounded-full bg-electric-orange px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-background"
      />
    </div>
  );
}
