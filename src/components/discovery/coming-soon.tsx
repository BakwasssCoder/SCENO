import { HalftonePanel } from "@/components/comic/halftone-panel";
import { NotifyForm } from "@/components/discovery/notify-form";
import type { City } from "@/types/db";

export function ComingSoon({ city }: { city: City }) {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <HalftonePanel className="-left-10 -top-10 text-electric-purple" />
      <HalftonePanel className="-right-10 bottom-10 text-electric-orange" />

      <span className="mb-6 text-5xl">👀</span>
      <h1 className="text-impact max-w-2xl text-4xl uppercase sm:text-6xl">
        {city.hero_headline ?? `${city.name}, your scene is loading.`}
      </h1>
      <p className="mt-5 max-w-md text-muted-foreground">
        {city.hero_subheadline ??
          "We're coming soon. Be the first to know when we launch."}
      </p>

      {city.launch_date && (
        <p className="mt-3 font-display text-sm uppercase tracking-wide text-acid-green">
          Targeting{" "}
          {new Date(city.launch_date).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </p>
      )}

      <div className="mt-8">
        <NotifyForm cityId={city.id} />
      </div>
    </div>
  );
}
