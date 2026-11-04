"use client";

import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import BookEditor from "@/components/BookEditor";

export default function AddBookContent() {
  const router = useRouter();

  return (
    <RequireAuth>
      <header className="page-header">
        <p className="eyebrow">Make room on the shared shelf</p>
        <h1>Add a book</h1>
        <p>Share a book with the BookNook community and help another reader find it.</p>
      </header>
      <section className="content-narrow">
        <div className="form-card">
          <h2>Book details</h2>
          <p className="form-card-intro">Tell readers a little about the book you are sharing.</p>
          <BookEditor onSaved={(book) => router.push(`/books/${book._id}`)} />
        </div>
      </section>
    </RequireAuth>
  );
}
