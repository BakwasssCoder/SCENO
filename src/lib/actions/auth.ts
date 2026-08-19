"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  status: "idle" | "error";
  message?: string;
};

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { status: "error", message: "Wrong email or password." };
  }

  revalidatePath("/", "layout");
  redirect("/profile");
}

const RegisterSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = RegisterSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Fill in your name, a valid email, and a 6+ character password.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });

  if (error) {
    return {
      status: "error",
      message: error.message.includes("already registered")
        ? "That email is already registered."
        : "Something went wrong. Try again.",
    };
  }

  revalidatePath("/", "layout");

  if (!data.session) {
    return {
      status: "error",
      message: "Check your email to confirm your account, then sign in.",
    };
  }

  redirect("/profile");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
