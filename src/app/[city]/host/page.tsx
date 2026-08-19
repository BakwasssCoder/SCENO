import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityBySlug } from "@/lib/data/cities";
import { HostWizardPreview } from "@/components/host/host-wizard-preview";
import { PageHeader } from "@/components/comic/page-header";

export const metadata: Metadata = { title: "Host Your Own" };

export default async function HostPage({ params }: PageProps<"/[city]/host">) {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city || city.status !== "LIVE") notFound();

  return (
    <div className="flex flex-col gap-10 pb-24">
      <PageHeader
        eyebrow="🎉 Got a party idea?"
        title="Build it here."
        subtitle={`Pick a venue, add DJs, catering, decor and more — see one live estimate for the whole party in ${city.name}.`}
      />

      <section className="px-4 sm:px-6">
        <HostWizardPreview />
      </section>
    </div>
  );
}
