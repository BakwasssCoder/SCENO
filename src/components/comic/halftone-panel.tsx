import { cn } from "@/lib/utils";

/** A corner-anchored halftone dot cluster — decorative texture, used once per section max. */
export function HalftonePanel({
  className,
  color = "text-electric-orange",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "halftone pointer-events-none absolute h-40 w-40 opacity-20",
        color,
        className,
      )}
    />
  );
}
