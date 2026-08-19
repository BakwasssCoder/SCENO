import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search as SearchIcon, MapPin, Mic2, Ticket } from "lucide-react";
import { getCityBySlug } from "@/lib/data/cities";
import { searchCity } from "@/lib/data/search";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/comic/page-header";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  params,
  searchParams,
}: PageProps<"/[city]/search">) {
  const { city: citySlug } = await params;
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const city = await getCityBySlug(citySlug);
  if (!city || city.status !== "LIVE") notFound();

  const results = query.length > 1 ? await searchCity(city.id, query) : null;
  const totalResults = results
    ? results.events.length + results.venues.length + results.vendors.length
    : 0;

  return (
    <div className="flex flex-col gap-8 pb-24">
      <PageHeader
        eyebrow="🔎 Find your scene"
        title="Search"
        subtitle={`Events, venues and artists in ${city.name}.`}
      />

      <div className="px-4 sm:px-6">
        <form className="flex gap-2">
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="DJ nights, XYZ Club, DJ Rishab..."
            className="comic-card bg-surface"
            autoFocus
          />
          <button
            type="submit"
            className="comic-card flex items-center gap-1.5 rounded-md bg-electric-orange px-4 py-2 text-sm font-bold uppercase text-background"
          >
            <SearchIcon className="h-4 w-4" /> Go
          </button>
        </form>
      </div>

      {results && (
        <div className="flex flex-col gap-8 px-4 sm:px-6">
          {totalResults === 0 ? (
            <div className="comic-card rounded-2xl bg-surface p-12 text-center">
              <p className="font-display text-xl">
                No results for &ldquo;{query}&rdquo; 👀
              </p>
            </div>
          ) : (
            <>
              {results.events.length > 0 && (
                <section>
                  <h2 className="mb-3 font-display text-lg uppercase tracking-tight">
                    Events
                  </h2>
                  <div className="flex flex-col gap-2">
                    {results.events.map((e) => (
                      <Link
                        key={e.slug}
                        href={`/${citySlug}/events/${e.slug}`}
                        className="comic-card flex items-center gap-3 rounded-xl bg-surface p-4"
                      >
                        <Ticket className="h-4 w-4 text-electric-orange" />
                        {e.title}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {results.venues.length > 0 && (
                <section>
                  <h2 className="mb-3 font-display text-lg uppercase tracking-tight">
                    Venues
                  </h2>
                  <div className="flex flex-col gap-2">
                    {results.venues.map((v) => (
                      <Link
                        key={v.slug}
                        href={`/${citySlug}/venues/${v.slug}`}
                        className="comic-card flex items-center gap-3 rounded-xl bg-surface p-4"
                      >
                        <MapPin className="h-4 w-4 text-electric-orange" />
                        {v.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {results.vendors.length > 0 && (
                <section>
                  <h2 className="mb-3 font-display text-lg uppercase tracking-tight">
                    Artists & Vendors
                  </h2>
                  <div className="flex flex-col gap-2">
                    {results.vendors.map((v) => (
                      <Link
                        key={v.slug}
                        href={`/${citySlug}/artists?type=${encodeURIComponent(v.service_type)}`}
                        className="comic-card flex items-center gap-3 rounded-xl bg-surface p-4"
                      >
                        <Mic2 className="h-4 w-4 text-electric-orange" />
                        {v.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
