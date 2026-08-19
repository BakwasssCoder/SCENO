import Link from "next/link";
import { Search, Heart, User } from "lucide-react";
import { CitySwitcher } from "@/components/layout/city-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { City } from "@/types/db";

export function Header({
  cities,
  currentCitySlug,
  isAuthed,
}: {
  cities: City[];
  currentCitySlug: string;
  isAuthed: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${currentCitySlug}`}
            className="font-display text-xl font-bold tracking-tight uppercase"
          >
            SCENO
          </Link>
          <CitySwitcher cities={cities} currentCitySlug={currentCitySlug} />
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href={`/${currentCitySlug}/explore`}
            className="hover:text-electric-orange transition-colors"
          >
            Explore
          </Link>
          <Link
            href={`/${currentCitySlug}/host`}
            className="hover:text-electric-orange transition-colors"
          >
            Host
          </Link>
          <Link
            href={`/${currentCitySlug}/venues`}
            className="hover:text-electric-orange transition-colors"
          >
            Venues
          </Link>
          <Link
            href={`/${currentCitySlug}/artists`}
            className="hover:text-electric-orange transition-colors"
          >
            Artists
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle />
          <Link
            href={`/${currentCitySlug}/search`}
            aria-label="Search"
            className="hidden rounded-full p-2 hover:bg-surface sm:block"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href={isAuthed ? "/saved" : "/login"}
            aria-label="Saved"
            className="hidden rounded-full p-2 hover:bg-surface sm:block"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href={isAuthed ? "/profile" : "/login"}
            aria-label="Profile"
            className="rounded-full p-2 hover:bg-surface"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
