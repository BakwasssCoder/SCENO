import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Get In."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-bold text-electric-orange">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
