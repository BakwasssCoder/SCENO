import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityBySlug } from "@/lib/data/cities";
import { getCategories, getEventsForExplore } from "@/lib/data/discovery";
import { getCurrentUser } from "@/lib/data/auth";
import { getSavedEventIds } from "@/lib/data/saved";
import { CategoryRail } from "@/components/discovery/category-rail";
import { EventCard } from "@/components/discovery/event-card";
import { PageHeader } from "@/components/comic/page-header";

export const metadata: Metadata = { title: "Explore" };

export default async function ExplorePage({
  params,
  searchParams,
}: PageProps<"/[city]/explore">) {
  const { city: citySlug } = await params;
  const { category } = await searchParams;
  const categorySlug = typeof category === "string" ? category : undefined;

  const city = await getCityBySlug(citySlug);
  if (!city || city.status !== "LIVE") notFound();

  const [categories, events, user] = await Promise.all([
    getCategories(),
    getEventsForExplore(city.id, { categorySlug }),
    getCurrentUser(),
  ]);
  const savedIds = user ? await getSavedEventIds(user.id) : new Set<string>();

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="flex flex-col gap-6 pb-16">
      <PageHeader
        eyebrow="🧭 Explore"
        title={`Explore ${city.name}`}
        subtitle={
          activeCategory
            ? `${activeCategory.emoji} ${activeCategory.name}`
            : "Everything happening, all in one place."
        }
      />

      <CategoryRail
        categories={categories}
        citySlug={city.slug}
        activeSlug={categorySlug}
      />

      <section className="px-4 sm:px-6">
        {events.length === 0 ? (
          <div className="comic-card rounded-2xl bg-surface p-12 text-center">
            <p className="font-display text-xl">Nothing here yet 👀</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another category or check back soon.
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
