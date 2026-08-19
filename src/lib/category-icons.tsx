import {
  Flame,
  Headphones,
  Mic2,
  Guitar,
  Sparkles as DanceIcon,
  Martini,
  Cake,
  Users,
  PartyPopper,
  Building2,
  Palette,
  Drama,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "club-nights": Flame,
  "dj-nights": Headphones,
  "live-music": Mic2,
  concerts: Guitar,
  dance: DanceIcon,
  "cocktail-nights": Martini,
  birthdays: Cake,
  "kitty-parties": Users,
  "private-parties": PartyPopper,
  corporate: Building2,
  workshops: Palette,
  shows: Drama,
  experiences: Sparkles,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? Sparkles;
}
