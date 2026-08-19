import Link from "next/link";
import { HalftonePanel } from "@/components/comic/halftone-panel";

export function AuthShell({
  eyebrow,
  title,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-16">
      <HalftonePanel className="-left-16 -top-10 text-electric-purple" />
      <HalftonePanel className="-right-16 bottom-0 text-electric-orange" />

      <div className="comic-card relative w-full max-w-sm rounded-2xl bg-surface p-8">
        <Link
          href="/kolkata"
          className="font-display text-lg font-bold uppercase tracking-tight"
        >
          SCENO
        </Link>
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-electric-orange">
          {eyebrow}
        </p>
        <h1 className="text-impact mt-1 text-3xl uppercase">{title}</h1>

        <div className="mt-6">{children}</div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      </div>
    </div>
  );
}
