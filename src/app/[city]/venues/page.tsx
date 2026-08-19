import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, ShieldCheck } from "lucide-react";
import { getCityBySlug } from "@/lib/data/cities";
import { getVenuesForCity } from "@/lib/data/venues";
import { PageHeader } from "@/components/comic/page-header";

export const metadata: Metadata = { title: "Venues" };

export default async function VenuesPage({ params }: PageProps<"/[city]/venues">) {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city || city.status !== "LIVE") notFound();

  const venues = await getVenuesForCity(city.id);

  return (
    <div className="flex flex-col gap-8 pb-16">
      <PageHeader
        eyebrow="🏟️ Venue Marketplace"
        title={`Venues in ${city.name}`}
        subtitle="Find a space and add it straight to your party."
      />

      <div className="px-4 sm:px-6">
        {venues.length === 0 ? (
          <div className="comic-card rounded-2xl bg-surface p-12 text-center">
            <p className="font-display text-xl">No venues yet 👀</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue, i) => (
              <Link
                key={venue.id}
                href={`/${citySlug}/venues/${venue.slug}`}
                className="comic-card flex flex-col gap-2 rounded-2xl bg-surface p-5"
                style={{
                  transform: `rotate(${i % 2 === 0 ? "-0.4deg" : "0.4deg"})`,
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg">{venue.name}</p>
                  {venue.verified && (
                    <span className="flex items-center gap-1 rounded-full bg-acid-green px-2 py-0.5 text-[10px] font-bold uppercase text-background">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
                {venue.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {venue.description}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between text-sm">
                  {venue.capacity && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {venue.capacity} capacity
                    </span>
                  )}
                  {venue.starting_price && (
                    <span className="font-display">
                      ₹{venue.starting_price.toLocaleString("en-IN")} starting
                    </span>
                  )}
                </div>
                {venue.amenities.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {venue.amenities.slice(0, 4).map((a) => (
                      <span
                        key={a}
                        className="rounded-full border border-foreground/20 bg-comic-yellow/40 px-2.5 py-0.5 text-xs font-medium text-foreground"
                      >
                        ✓ {a}
                      </span>
                    ))}
                  </div>
                )}
                <span className="mt-2 w-fit rounded-full bg-electric-orange px-4 py-1.5 text-xs font-bold uppercase text-background">
                  View Venue →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
