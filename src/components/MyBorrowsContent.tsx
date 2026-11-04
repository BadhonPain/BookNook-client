"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { useToast } from "@/components/ToastProvider";
import { apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Borrow } from "@/lib/types";

function formatDate(value: string) {
  const date = value.slice(0, 10);
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return "Date unavailable";
  return `${month}/${day}/${year}`;
}

export default function MyBorrowsContent() {
  const { data: session } = authClient.useSession();
  const { notify } = useToast();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returningId, setReturningId] = useState("");

  useEffect(() => {
    if (!session) return;
    let active = true;
    apiRequest<Borrow[]>("/borrows", { authenticated: true })
      .then((items) => {
        if (active) setBorrows(items);
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
  }, [session]);

  async function returnBook(borrow: Borrow) {
    setReturningId(borrow._id);
    try {
      const result = await apiRequest<{ message: string }>(
        `/borrows/${encodeURIComponent(borrow._id)}`,
        { method: "DELETE", authenticated: true },
      );
      setBorrows((current) => current.filter((item) => item._id !== borrow._id));
      notify(result.message);
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : "The book could not be returned.", "error");
    } finally {
      setReturningId("");
    }
  }

  return (
    <RequireAuth>
      <header className="page-header">
        <p className="eyebrow">Your current reads</p>
        <h1>Books you have borrowed</h1>
        <p>Keep track of your return dates and pass each book on when you are done.</p>
      </header>
      <section className="section-wrap">
        {loading ? (
          <div className="loading-state" aria-live="polite">
            <div className="loading-content"><span className="spinner" /><span>Checking your borrowed books...</span></div>
          </div>
        ) : error ? (
          <div className="empty-state" role="alert"><h3>Your borrows did not load</h3><p>{error}</p></div>
        ) : borrows.length === 0 ? (
          <div className="empty-state">
            <h3>No borrowed books just yet</h3>
            <p>When you borrow a book, it will show up here.</p>
            <Link className="button" href="/books" style={{ marginTop: 18 }}>Browse books</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Book</th><th>Borrowed</th><th>Return by</th><th>Action</th></tr></thead>
              <tbody>
                {borrows.map((borrow) => (
                  <tr key={borrow._id}>
                    <td>
                      <Link className="borrow-book-link" href={`/books/${borrow.bookId}`}>
                        <span className="borrow-thumb">
                          {borrow.bookImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img alt="" src={borrow.bookImage} />
                          ) : null}
                        </span>
                        {borrow.bookTitle}
                      </Link>
                    </td>
                    <td>{formatDate(borrow.borrowDate)}</td>
                    <td>{formatDate(borrow.returnDate)}</td>
                    <td>
                      <button
                        className="button button-small"
                        disabled={returningId === borrow._id}
                        onClick={() => void returnBook(borrow)}
                        type="button"
                      >
                        {returningId === borrow._id ? "Returning..." : "Return book"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </RequireAuth>
  );
}
