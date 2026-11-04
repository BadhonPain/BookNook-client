import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="loading-state"><span className="spinner" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
