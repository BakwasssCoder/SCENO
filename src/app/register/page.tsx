import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Join the scene"
      title="Sign Up."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-electric-orange">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
