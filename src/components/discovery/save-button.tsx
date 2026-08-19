"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleSavedEvent } from "@/lib/actions/saved";
import { cn } from "@/lib/utils";

export function SaveButton({
  eventId,
  initialSaved,
  isAuthed,
}: {
  eventId: string;
  initialSaved: boolean;
  isAuthed: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save event"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthed) {
          router.push("/login");
          return;
        }
        startTransition(async () => {
          const result = await toggleSavedEvent(eventId, saved);
          if (result.status === "ok") setSaved(result.saved);
        });
      }}
      disabled={pending}
      className="comic-card flex h-9 w-9 items-center justify-center rounded-full bg-surface"
    >
      <Heart
        className={cn(
          "h-4 w-4",
          saved ? "fill-electric-orange text-electric-orange" : "text-foreground",
        )}
      />
    </button>
  );
}
