"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { useToast } from "@/components/ToastProvider";
import { apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Borrow } from "@/lib/types";

function formatDate(value: string | undefined) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function BorrowRows({
  borrows,
  onReturn,
  returningId,
}: {
  borrows: Borrow[];
  onReturn?: (borrow: Borrow) => void;
  returningId?: string;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Book</th>
            <th>Borrowed</th>
            <th>Return by</th>
            <th>{onReturn ? "Action" : "Status"}</th>
          </tr>
        </thead>
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
                  <span>
                    <strong>{borrow.bookTitle}</strong>
                    {borrow.bookAuthor && <small>{borrow.bookAuthor}</small>}
                  </span>
                </Link>
              </td>
              <td>{formatDate(borrow.borrowDate)}</td>
              <td>{formatDate(borrow.returnDate)}</td>
              <td>
                {onReturn ? (
                  <button
                    className="button button-small"
                    disabled={returningId === borrow._id}
                    onClick={() => onReturn(borrow)}
                    type="button"
                  >
                    {returningId === borrow._id ? "Returning..." : "Return book"}
                  </button>
                ) : (
                  <>
                    <span className="borrow-status borrow-status-returned">Returned</span>
                    {borrow.updatedAt && (
                      <small className="borrow-returned-date">Returned {formatDate(borrow.updatedAt)}</small>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MyBorrowsContent() {
  const { data: session, isPending } = authClient.useSession();
  const { notify } = useToast();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [history, setHistory] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returningId, setReturningId] = useState("");
  const email = session?.user?.email;

  useEffect(() => {
    if (isPending || !email) return;
    let active = true;
    Promise.all([
      apiRequest<Borrow[]>("/borrows", { authenticated: true }),
      apiRequest<Borrow[]>("/borrows/history", { authenticated: true }),
    ])
      .then(([activeBorrows, previousBorrows]) => {
        if (!active) return;
        setBorrows(activeBorrows);
        setHistory(previousBorrows);
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
  }, [email, isPending]);

  async function returnBook(borrow: Borrow) {
    setReturningId(borrow._id);
    try {
      const result = await apiRequest<{ message: string; returnedAt: string }>(
        `/borrows/${encodeURIComponent(borrow._id)}`,
        { method: "DELETE", authenticated: true },
      );
      setBorrows((current) => current.filter((item) => item._id !== borrow._id));
      setHistory((current) => [
        { ...borrow, returned: true, updatedAt: result.returnedAt },
        ...current,
      ]);
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
        <p className="eyebrow">Your reading record</p>
        <h1>My borrows</h1>
        <p>See what you are reading now and revisit the books you have returned.</p>
      </header>
      <section className="section-wrap borrow-record-section">
        {loading || isPending ? (
          <div className="loading-state" aria-live="polite">
            <div className="loading-content"><span className="spinner" /><span>Loading your borrow records...</span></div>
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <h3>Your borrow records did not load</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <section aria-labelledby="active-borrows-title" className="borrow-record-group">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">On your shelf now</p>
                  <h2 id="active-borrows-title">Current borrows</h2>
                </div>
                <span className="borrow-record-count">{borrows.length} active</span>
              </div>
              {borrows.length ? (
                <BorrowRows borrows={borrows} onReturn={(borrow) => void returnBook(borrow)} returningId={returningId} />
              ) : (
                <div className="empty-state">
                  <h3>No books currently borrowed</h3>
                  <p>Books you borrow will appear here until you return them.</p>
                  <Link className="button" href="/books" style={{ marginTop: 18 }}>Browse books</Link>
                </div>
              )}
            </section>

            <section aria-labelledby="borrow-history-title" className="borrow-record-group">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Books passed along</p>
                  <h2 id="borrow-history-title">Previous borrows</h2>
                </div>
                <span className="borrow-record-count">
                  {history.length} {history.length === 1 ? "book" : "books"}
                </span>
              </div>
              {history.length ? (
                <BorrowRows borrows={history} />
              ) : (
                <div className="empty-state">
                  <h3>Your reading history starts here</h3>
                  <p>When you return a book, its borrow record will be saved here.</p>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </RequireAuth>
  );
}
