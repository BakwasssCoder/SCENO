"use client";

import { useActionState } from "react";
import { notifyCityLaunch, type NotifyState } from "@/lib/actions/notify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: NotifyState = { status: "idle" };

export function NotifyForm({ cityId }: { cityId: string }) {
  const [state, formAction, pending] = useActionState(
    notifyCityLaunch,
    initialState,
  );

  if (state.status === "success") {
    return (
      <p className="font-display text-lg text-acid-green">{state.message}</p>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-3">
      <input type="hidden" name="cityId" value={cityId} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          name="email"
          placeholder="you@email.com"
          className="bg-surface"
          aria-label="Email"
        />
        <Button
          type="submit"
          disabled={pending}
          className="shrink-0 font-display uppercase tracking-wide"
        >
          {pending ? "..." : "Notify Me"}
        </Button>
      </div>
      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </form>
  );
}
