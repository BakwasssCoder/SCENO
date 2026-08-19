import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ShieldCheck } from "lucide-react";
import { getCityBySlug } from "@/lib/data/cities";
import { getVendorsForCity } from "@/lib/data/venues";
import { getCurrentUser } from "@/lib/data/auth";
import { PageHeader } from "@/components/comic/page-header";
import { AddToPartyDialog } from "@/components/discovery/add-to-party-dialog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Artists & Vendors" };

export default async function ArtistsPage({
  params,
  searchParams,
}: PageProps<"/[city]/artists">) {
  const { city: citySlug } = await params;
  const { type } = await searchParams;
  const activeType = typeof type === "string" ? type : undefined;

  const city = await getCityBySlug(citySlug);
  if (!city || city.status !== "LIVE") notFound();

  const [vendors, user] = await Promise.all([
    getVendorsForCity(city.id),
    getCurrentUser(),
  ]);
  const serviceTypes = Array.from(new Set(vendors.map((v) => v.service_type)));
  const visible = activeType
    ? vendors.filter((v) => v.service_type === activeType)
    : vendors;

  return (
    <div className="flex flex-col gap-8 pb-16">
      <PageHeader
        eyebrow="🎤 Local Talent Marketplace"
        title="Discover Local Talent"
        subtitle={`DJs, catering, decor and more — from ${city.name}'s own scene.`}
      />

      <div className="px-4 sm:px-6">
        <div className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={`/${citySlug}/artists`}
            className={cn(
              "comic-card shrink-0 snap-start rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide",
              !activeType
                ? "bg-electric-orange text-background"
                : "bg-surface text-foreground",
            )}
          >
            All
          </Link>
          {serviceTypes.map((t) => (
            <Link
              key={t}
              href={`/${citySlug}/artists?type=${encodeURIComponent(t)}`}
              className={cn(
                "comic-card shrink-0 snap-start rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide",
                activeType === t
                  ? "bg-electric-orange text-background"
                  : "bg-surface text-foreground",
              )}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6">
        {visible.length === 0 ? (
          <div className="comic-card rounded-2xl bg-surface p-12 text-center">
            <p className="font-display text-xl">No artists listed yet 👀</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {visible.map((vendor) => {
              const cover = vendor.media[0]?.url;
              return (
                <div
                  key={vendor.id}
                  className="comic-card flex overflow-hidden rounded-2xl bg-surface"
                >
                  <div className="relative w-2/5 shrink-0 bg-muted">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        🎤
                      </div>
                    )}
                  </div>

                  <div className="flex w-3/5 flex-col gap-1.5 border-l-2 border-foreground p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-lg leading-tight">
                        {vendor.name}
                      </p>
                      {vendor.verified && (
                        <ShieldCheck className="h-4 w-4 shrink-0 text-acid-green" />
                      )}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wide text-electric-orange">
                      {vendor.service_type}
                    </p>
                    {vendor.bio && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {vendor.bio}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2 text-sm">
                      {vendor.rating != null && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-acid-green text-acid-green" />
                          {vendor.rating} · {vendor.review_count}
                        </span>
                      )}
                      {vendor.starting_price && (
                        <span className="font-display">
                          ₹{vendor.starting_price.toLocaleString("en-IN")}+
                        </span>
                      )}
                    </div>
                    <AddToPartyDialog
                      kind="vendor"
                      id={vendor.id}
                      citySlug={citySlug}
                      label={vendor.name}
                      price={vendor.starting_price ?? 0}
                      isAuthed={!!user}
                      triggerClassName="mt-2 w-fit rounded-full bg-electric-orange px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-background"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
