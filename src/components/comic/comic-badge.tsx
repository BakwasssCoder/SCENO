import { cn } from "@/lib/utils";

const VARIANTS = {
  orange: "bg-electric-orange text-background",
  green: "bg-acid-green text-background",
  purple: "bg-electric-purple text-background",
  outline: "bg-transparent text-foreground border border-foreground/30",
} as const;

export function ComicBadge({
  children,
  variant = "orange",
  className,
  tilt = true,
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
  tilt?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide font-display",
        tilt && "-rotate-2",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
