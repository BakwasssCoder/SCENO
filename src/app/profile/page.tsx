import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Heart, Ticket, PartyPopper } from "lucide-react";
import { getCurrentUser } from "@/lib/data/auth";
import { logout } from "@/lib/actions/auth";
import { HalftonePanel } from "@/components/comic/halftone-panel";
import { ComicBadge } from "@/components/comic/comic-badge";

export const metadata: Metadata = { title: "My Scene" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = user.profile?.full_name || user.email || "You";

  return (
    <div className="relative overflow-hidden pb-24">
      <HalftonePanel className="-right-16 -top-10 text-electric-purple" />
      <div className="relative px-4 py-10 sm:px-6">
        <ComicBadge variant="green" className="w-fit">
          🎟️ My Scene
        </ComicBadge>
        <h1 className="text-impact mt-3 text-4xl uppercase sm:text-5xl">
          {name}
        </h1>
        {user.email && (
          <p className="mt-1 text-muted-foreground">{user.email}</p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/saved"
            className="comic-card flex flex-col items-center gap-2 rounded-2xl bg-surface p-6 text-center"
          >
            <Heart className="h-6 w-6 text-electric-orange" />
            <p className="font-display">Saved Events</p>
          </Link>
          <div className="comic-card flex flex-col items-center gap-2 rounded-2xl bg-surface p-6 text-center opacity-70">
            <Ticket className="h-6 w-6 text-electric-orange" />
            <p className="font-display">My Bookings</p>
            <p className="text-xs text-muted-foreground">Coming next</p>
          </div>
          <div className="comic-card flex flex-col items-center gap-2 rounded-2xl bg-surface p-6 text-center opacity-70">
            <PartyPopper className="h-6 w-6 text-electric-orange" />
            <p className="font-display">Hosted Events</p>
            <p className="text-xs text-muted-foreground">Coming next</p>
          </div>
        </div>

        <form action={logout} className="mt-10">
          <button className="comic-card flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-sm font-bold uppercase tracking-wide">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
