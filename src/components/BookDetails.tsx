"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import BookCover from "@/components/BookCover";
import { useToast } from "@/components/ToastProvider";
import { apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Book } from "@/lib/types";

export default function BookDetails({ id }: { id: string }) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [pendingBorrow, setPendingBorrow] = useState(false);
  const { data: session } = authClient.useSession();
  const { notify } = useToast();

  function openBorrowDialog() {
    setBorrowOpen(true);
  }

  useEffect(() => {
    let active = true;
    apiRequest<Book>(`/books/${encodeURIComponent(id)}`)
      .then((item) => {
        if (active) setBook(item);
      })
      .catch((cause: Error) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function confirmBorrow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingBorrow(true);
    try {
      await apiRequest<{ message: string; borrow: unknown }>("/borrows", {
        method: "POST",
        authenticated: true,
        body: JSON.stringify({ bookId: id }),
      });
      setBook((current) =>
        current ? { ...current, totalCopies: current.totalCopies - 1 } : current,
      );
      setBorrowOpen(false);
      notify("Book borrowed. Happy reading!");
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : "The book could not be borrowed.", "error");
    } finally {
      setPendingBorrow(false);
    }
  }

  return (
    <RequireAuth>
      <section className="section-wrap">
        <Link className="text-link" href="/books">
          <ArrowLeft size={17} aria-hidden="true" /> Back to all books
        </Link>
        {loading ? (
          <div className="loading-state" aria-live="polite">
            <div className="loading-content">
              <span aria-hidden="true" className="spinner" />
              <span>Finding this book...</span>
            </div>
          </div>
        ) : error || !book ? (
          <div className="empty-state" role="alert">
            <h3>Book not found</h3>
            <p>{error || "This book may have been removed from the shelf."}</p>
          </div>
        ) : (
          <div className="detail-layout" style={{ marginTop: 28 }}>
            <div className="detail-cover">
              <BookCover image={book.image} key={book.image} title={book.title} variant="detail" />
            </div>
            <div className="detail-copy">
              <span className="category-pill">{book.category}</span>
              <h1>{book.title}</h1>
              <p className="detail-byline">A book by {book.author}</p>
              <p>{book.description}</p>
              <div className="detail-meta">
                <div className="meta-item">
                  <span><UserRound size={14} aria-hidden="true" /> Shared by</span>
                  <strong>{book.addedBy?.name || "A BookNook reader"}</strong>
                </div>
                <div className="meta-item">
                  <span><CalendarDays size={14} aria-hidden="true" /> Available copies</span>
                  <strong>{book.totalCopies}</strong>
                </div>
              </div>
              {book.totalCopies > 0 ? (
                <button className="button" onClick={openBorrowDialog} type="button">
                  Borrow this book
                </button>
              ) : (
                <button className="button" disabled type="button">Not available</button>
              )}
            </div>
          </div>
        )}
        {borrowOpen && book && (
          <div
            className="modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !pendingBorrow) setBorrowOpen(false);
            }}
          >
            <section aria-labelledby="borrow-title" aria-modal="true" className="modal-card" role="dialog">
              <h2 id="borrow-title">Borrow this book</h2>
              <p>
                Your book is due in seven days. You can see the return date in My Borrows.
              </p>
              <form className="form-stack" onSubmit={confirmBorrow}>
                <label className="form-field">
                  Your name
                  <input readOnly value={session?.user.name || ""} />
                </label>
                <label className="form-field">
                  Your email
                  <input readOnly type="email" value={session?.user.email || ""} />
                </label>
                <div className="modal-actions">
                  <button
                    className="button button-outline"
                    disabled={pendingBorrow}
                    onClick={() => setBorrowOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button className="button" disabled={pendingBorrow} type="submit">
                    {pendingBorrow ? "Borrowing..." : "Confirm borrow"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </section>
    </RequireAuth>
  );
}
