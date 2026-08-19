import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/category-icons";
import type { EventCategory } from "@/types/db";

export function CategoryRail({
  categories,
  citySlug,
  activeSlug,
}: {
  categories: EventCategory[];
  citySlug: string;
  activeSlug?: string;
}) {
  return (
    <div className="px-4 sm:px-6">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pl-0.5 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => {
          const active = cat.slug === activeSlug;
          const Icon = getCategoryIcon(cat.slug);
          return (
            <Link
              key={cat.id}
              href={
                active
                  ? `/${citySlug}/explore`
                  : `/${citySlug}/explore?category=${cat.slug}`
              }
              className={cn(
                "comic-card flex shrink-0 snap-start flex-col items-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap",
                active
                  ? "bg-electric-orange text-background"
                  : "bg-surface text-foreground hover:bg-electric-orange/10",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 border-foreground",
                  active ? "bg-background" : "bg-comic-yellow",
                )}
              >
                <Icon
                  className={cn(
                    "h-4.5 w-4.5",
                    active ? "text-electric-orange" : "text-[#0b0b0d]",
                  )}
                  strokeWidth={2.5}
                />
              </span>
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
