import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/auth";
import { getSavedEventsForUser } from "@/lib/data/saved";
import { EventCard } from "@/components/discovery/event-card";
import { ComicBadge } from "@/components/comic/comic-badge";
import { HalftonePanel } from "@/components/comic/halftone-panel";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const events = await getSavedEventsForUser(user.id);

  return (
    <div className="relative overflow-hidden pb-24">
      <HalftonePanel className="-left-16 -top-10 text-electric-orange" />
      <div className="relative px-4 py-10 sm:px-6">
        <ComicBadge variant="orange" className="w-fit">
          ❤️ Saved
        </ComicBadge>
        <h1 className="text-impact mt-3 text-4xl uppercase sm:text-5xl">
          Your Saved Events
        </h1>

        {events.length === 0 ? (
          <div className="comic-card mt-8 rounded-2xl bg-surface p-12 text-center">
            <p className="font-display text-xl">Nothing saved yet 👀</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap the heart on any event to save it here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                citySlug={event.city.slug}
                saved
                isAuthed
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
