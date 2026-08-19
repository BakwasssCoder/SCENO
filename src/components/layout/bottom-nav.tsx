import Link from "next/link";
import { Home, Compass, PartyPopper, Heart, User } from "lucide-react";

export function BottomNav({
  citySlug,
  isAuthed,
}: {
  citySlug: string;
  isAuthed: boolean;
}) {
  const items = [
    { label: "Home", href: `/${citySlug}`, icon: Home },
    { label: "Explore", href: `/${citySlug}/explore`, icon: Compass },
    { label: "Host", href: `/${citySlug}/host`, icon: PartyPopper },
    { label: "Saved", href: isAuthed ? "/saved" : "/login", icon: Heart },
    { label: "Profile", href: isAuthed ? "/profile" : "/login", icon: User },
  ];

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground hover:text-electric-orange transition-colors"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
