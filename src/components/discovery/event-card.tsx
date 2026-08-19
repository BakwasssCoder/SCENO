import Link from "next/link";
import { MapPin } from "lucide-react";
import { ComicBadge } from "@/components/comic/comic-badge";
import { SaveButton } from "@/components/discovery/save-button";
import type { DiscoveryEvent } from "@/types/db";

function isTonight(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function lowestPrice(event: DiscoveryEvent) {
  if (!event.tickets.length) return null;
  return Math.min(...event.tickets.map((t) => t.price));
}

export function EventCard({
  event,
  citySlug,
  saved = false,
  isAuthed = false,
}: {
  event: DiscoveryEvent;
  citySlug: string;
  saved?: boolean;
  isAuthed?: boolean;
}) {
  const price = lowestPrice(event);
  const tonight = isTonight(event.starts_at);
  const cover = event.media[0]?.url;

  return (
    <Link
      href={`/${citySlug}/events/${event.slug}`}
      className="comic-card group flex flex-col overflow-hidden rounded-2xl bg-surface"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            {event.category?.emoji ?? "✨"}
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {tonight && <ComicBadge variant="orange">🔥 Tonight</ComicBadge>}
          {event.featured && !tonight && (
            <ComicBadge variant="purple">Featured</ComicBadge>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <SaveButton eventId={event.id} initialSaved={saved} isAuthed={isAuthed} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="font-display text-lg leading-tight">{event.title}</p>
        {event.venue && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {event.venue.name}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {new Date(event.starts_at).toLocaleString("en-IN", {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-display text-sm">
            {price != null ? `₹${price.toLocaleString("en-IN")} onwards` : ""}
          </span>
          <span className="rounded-full bg-electric-orange px-3 py-1 text-xs font-bold text-background">
            Get Entry →
          </span>
        </div>
      </div>
    </Link>
  );
}
