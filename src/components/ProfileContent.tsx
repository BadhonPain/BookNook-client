"use client";

import RequireAuth from "@/components/RequireAuth";
import { authClient } from "@/lib/auth-client";

export default function ProfileContent() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <RequireAuth>
      <header className="page-header">
        <p className="eyebrow">Your BookNook account</p>
        <h1>My profile</h1>
        <p>Your reader details, all in one place.</p>
      </header>
      <section className="content-narrow">
        {user && (
          <div className="form-card profile-card">
            <div className="profile-large-avatar" aria-hidden="true">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" src={user.image} />
              ) : user.name.slice(0, 1).toUpperCase()}
            </div>
            <h2>{user.name}</h2>
            <p className="form-card-intro">{user.email}</p>
          </div>
        )}
      </section>
    </RequireAuth>
  );
}
