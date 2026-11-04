import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found">
      <div>
        <p className="eyebrow">This page wandered off the shelf</p>
        <h1>404</h1>
        <p>We could not find the page you were looking for.</p>
        <Link className="button" href="/">
          <ArrowLeft size={17} aria-hidden="true" /> Back to home
        </Link>
      </div>
    </main>
  );
}
