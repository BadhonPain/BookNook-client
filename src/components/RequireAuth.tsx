"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [isPending, pathname, router, session]);

  if (isPending || !session) {
    return (
      <div className="loading-state" aria-live="polite">
        <div className="loading-content">
          <span aria-hidden="true" className="spinner" />
          <span>Checking your account...</span>
        </div>
      </div>
    );
  }

  return children;
}
