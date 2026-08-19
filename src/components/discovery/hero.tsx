import Link from "next/link";
import { HalftonePanel } from "@/components/comic/halftone-panel";
import { ComicBadge } from "@/components/comic/comic-badge";
import type { City } from "@/types/db";

export function Hero({
  city,
  eventCount,
}: {
  city: City;
  eventCount: number;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <HalftonePanel className="-right-16 -top-16 h-72 w-72 text-electric-orange" />
      <HalftonePanel className="-left-20 bottom-0 h-64 w-64 text-electric-purple" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-electric-purple/20 via-transparent to-transparent"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-24">
        {eventCount > 0 && (
          <ComicBadge variant="green" className="w-fit">
            🔥 {eventCount} things happening
          </ComicBadge>
        )}

        <h1 className="text-impact max-w-3xl text-5xl uppercase sm:text-7xl">
          What&apos;s
          <br />
          the scene?
        </h1>

        <p className="max-w-md text-lg text-muted-foreground">
          {city.hero_subheadline ??
            "Find what's happening tonight. Join the party. Or build your own."}
        </p>

        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href={`/${city.slug}/explore`}
            className="rounded-full bg-electric-orange px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-background hover:brightness-110 transition"
          >
            Explore Tonight
          </Link>
          <Link
            href={`/${city.slug}/host`}
            className="rounded-full border border-foreground/30 bg-transparent px-6 py-3 font-display text-sm font-bold uppercase tracking-wide hover:border-electric-orange hover:text-electric-orange transition"
          >
            Host Your Own
          </Link>
        </div>
      </div>
    </section>
  );
}
