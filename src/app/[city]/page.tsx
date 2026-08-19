import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityBySlug } from "@/lib/data/cities";
import {
  getCategories,
  getUpcomingEventsForCity,
  getEventCountsForCity,
} from "@/lib/data/discovery";
import { getCurrentUser } from "@/lib/data/auth";
import { getSavedEventIds } from "@/lib/data/saved";
import { ComingSoon } from "@/components/discovery/coming-soon";
import { Hero } from "@/components/discovery/hero";
import { CategoryRail } from "@/components/discovery/category-rail";
import { EventCard } from "@/components/discovery/event-card";

export async function generateMetadata({
  params,
}: PageProps<"/[city]">): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) return {};
  return {
    title:
      city.status === "LIVE"
        ? `${city.name} Tonight`
        : `${city.name} — Coming Soon`,
    description:
      city.hero_subheadline ??
      `Discover parties, club nights and events in ${city.name}.`,
  };
}

export default async function CityHomePage({ params }: PageProps<"/[city]">) {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) notFound();

  if (city.status !== "LIVE") {
    return <ComingSoon city={city} />;
  }

  const [categories, events, eventCount, user] = await Promise.all([
    getCategories(),
    getUpcomingEventsForCity(city.id),
    getEventCountsForCity(city.id),
    getCurrentUser(),
  ]);
  const savedIds = user ? await getSavedEventIds(user.id) : new Set<string>();

  return (
    <div className="flex flex-col gap-10 pb-16">
      <Hero city={city} eventCount={eventCount} />

      <section className="flex flex-col gap-4">
        <div className="px-4 sm:px-6">
          <h2 className="font-display text-2xl uppercase tracking-tight">
            Tonight in {city.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {eventCount} upcoming {eventCount === 1 ? "event" : "events"}
          </p>
        </div>
        <CategoryRail categories={categories} citySlug={city.slug} />
      </section>

      <section className="px-4 sm:px-6">
        {events.length === 0 ? (
          <div className="comic-card rounded-2xl bg-surface p-12 text-center">
            <p className="font-display text-xl">Nothing here yet 👀</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another date or check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                citySlug={city.slug}
                saved={savedIds.has(event.id)}
                isAuthed={!!user}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
