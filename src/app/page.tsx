import { redirect } from "next/navigation";
import { getCities } from "@/lib/data/cities";

export default async function RootPage() {
  const cities = await getCities();
  const liveCity = cities.find((c) => c.status === "LIVE") ?? cities[0];
  redirect(`/${liveCity?.slug ?? "kolkata"}`);
}
