"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const NotifySchema = z.object({
  cityId: z.string().uuid(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(6).optional().or(z.literal("")),
});

export type NotifyState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function notifyCityLaunch(
  _prev: NotifyState,
  formData: FormData,
): Promise<NotifyState> {
  const parsed = NotifySchema.safeParse({
    cityId: formData.get("cityId"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email or phone." };
  }

  const { cityId, email, phone } = parsed.data;
  if (!email && !phone) {
    return { status: "error", message: "Enter an email or phone number." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("city_notify_signups").insert({
    city_id: cityId,
    email: email || null,
    phone: phone || null,
  });

  if (error) {
    return { status: "error", message: "Something went wrong. Try again." };
  }

  return { status: "success", message: "You're on the list." };
}
