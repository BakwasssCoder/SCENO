import { notFound } from "next/navigation";
import { getCities, getCityBySlug } from "@/lib/data/cities";
import { getCurrentUser } from "@/lib/data/auth";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function CityLayout({
  children,
  params,
}: LayoutProps<"/[city]">) {
  const { city: citySlug } = await params;
  const [cities, city, user] = await Promise.all([
    getCities(),
    getCityBySlug(citySlug),
    getCurrentUser(),
  ]);

  if (!city) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header cities={cities} currentCitySlug={city.slug} isAuthed={!!user} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <BottomNav citySlug={city.slug} isAuthed={!!user} />
    </div>
  );
}
