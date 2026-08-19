"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotifyForm } from "@/components/discovery/notify-form";
import type { City } from "@/types/db";
import { cn } from "@/lib/utils";

export function CitySwitcher({
  cities,
  currentCitySlug,
}: {
  cities: City[];
  currentCitySlug: string;
}) {
  const [open, setOpen] = useState(false);
  const current = cities.find((c) => c.slug === currentCitySlug);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:border-electric-orange/60 transition-colors"
      >
        <MapPin className="h-3.5 w-3.5 text-electric-orange" />
        {current?.name ?? "Select city"}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase tracking-tight">
              Your City
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            {cities.map((city) => {
              const isLive = city.status === "LIVE";
              const isCurrent = city.slug === currentCitySlug;
              return (
                <div
                  key={city.id}
                  className={cn(
                    "rounded-xl border p-4 transition-colors",
                    isCurrent
                      ? "border-electric-orange bg-electric-orange/10"
                      : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg">{city.name}</p>
                      <p
                        className={cn(
                          "text-xs font-semibold uppercase tracking-wide",
                          isLive ? "text-acid-green" : "text-muted-foreground",
                        )}
                      >
                        {isLive ? "● Live now" : "○ Coming soon"}
                      </p>
                    </div>
                    {isLive && (
                      <Link
                        href={`/${city.slug}`}
                        onClick={() => setOpen(false)}
                        className="rounded-full bg-electric-orange px-4 py-1.5 text-sm font-bold text-background"
                      >
                        Enter
                      </Link>
                    )}
                  </div>
                  {!isLive && (
                    <div className="mt-3">
                      <NotifyForm cityId={city.id} />
                    </div>
                  )}
                </div>
              );
            })}
            <p className="pt-1 text-center text-xs text-muted-foreground">
              More cities coming soon.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
