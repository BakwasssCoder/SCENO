import { getCities } from "@/lib/data/cities";
import { getCurrentUser } from "@/lib/data/auth";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cities, user] = await Promise.all([getCities(), getCurrentUser()]);
  const liveCity = cities.find((c) => c.status === "LIVE") ?? cities[0];
  const citySlug = liveCity?.slug ?? "kolkata";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header cities={cities} currentCitySlug={citySlug} isAuthed={!!user} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <BottomNav citySlug={citySlug} isAuthed={!!user} />
    </div>
  );
}
