import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { getEventBySlug } from "@/lib/data/discovery";
import { getCurrentUser } from "@/lib/data/auth";
import { ComicBadge } from "@/components/comic/comic-badge";
import { TicketSelector } from "@/components/discovery/ticket-selector";

export async function generateMetadata({
  params,
}: PageProps<"/[city]/events/[slug]">): Promise<Metadata> {
  const { city, slug } = await params;
  const event = await getEventBySlug(city, slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.description ?? undefined,
    openGraph: event.media[0]
      ? { images: [{ url: event.media[0].url }] }
      : undefined,
  };
}

export default async function EventDetailPage({
  params,
}: PageProps<"/[city]/events/[slug]">) {
  const { city: citySlug, slug } = await params;
  const [event, user] = await Promise.all([
    getEventBySlug(citySlug, slug),
    getCurrentUser(),
  ]);
  if (!event) notFound();

  const cover = event.media[0]?.url;
  const starts = new Date(event.starts_at);
  const ends = event.ends_at ? new Date(event.ends_at) : null;
  const lowestPrice = event.tickets.length
    ? Math.min(...event.tickets.map((t) => t.price))
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
      <Link
        href={`/${citySlug}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="comic-card mt-4 overflow-hidden rounded-2xl bg-surface">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-6xl">
            {event.category?.emoji ?? "✨"}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <ComicBadge variant="orange" className="w-fit">
          {event.category?.emoji} {event.category?.name}
        </ComicBadge>

        <h1 className="text-impact text-3xl uppercase sm:text-4xl">
          {event.title}
        </h1>

        {event.venue && (
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {event.venue.name}
            {event.venue.address ? ` · ${event.venue.address}` : ""}
          </p>
        )}

        <p className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4" />
          {starts.toLocaleString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })}
          {ends
            ? ` – ${ends.toLocaleString("en-IN", { hour: "numeric", minute: "2-digit" })}`
            : ""}
        </p>

        {lowestPrice != null && (
          <p className="font-display text-2xl">
            ₹{lowestPrice.toLocaleString("en-IN")} onwards
          </p>
        )}

        {event.description && (
          <p className="mt-2 leading-relaxed text-foreground/90">
            {event.description}
          </p>
        )}
      </div>

      {event.tickets.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl uppercase tracking-tight">
            Tickets
          </h2>
          <div className="mt-4">
            <TicketSelector
              eventId={event.id}
              citySlug={citySlug}
              tickets={event.tickets}
              isAuthed={!!user}
            />
          </div>
        </div>
      )}
    </div>
  );
}
