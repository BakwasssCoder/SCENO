"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: AuthState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide">
          Email
        </label>
        <Input id="email" name="email" type="email" required placeholder="you@email.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-bold uppercase tracking-wide">
          Password
        </label>
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="mt-2 font-display text-sm font-bold uppercase tracking-wide"
      >
        {pending ? "..." : "Get In"}
      </Button>
    </form>
  );
}
