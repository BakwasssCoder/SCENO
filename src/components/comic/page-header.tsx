import { HalftonePanel } from "@/components/comic/halftone-panel";
import { ComicBadge } from "@/components/comic/comic-badge";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-border px-4 py-10 sm:px-6">
      <HalftonePanel className="-right-14 -top-14 text-electric-purple" />
      <ComicBadge variant="green" className="w-fit">
        {eyebrow}
      </ComicBadge>
      <h1 className="text-impact comic-panel-title mt-3 text-4xl uppercase sm:text-5xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-md text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
