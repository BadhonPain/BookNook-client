"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import BookEditor from "@/components/BookEditor";
import RequireAuth from "@/components/RequireAuth";
import { useToast } from "@/components/ToastProvider";
import { apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Book } from "@/lib/types";

export default function MyBooksContent() {
  const { data: session } = authClient.useSession();
  const { notify } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    if (!session?.user.email) return;
    let active = true;
    apiRequest<Book[]>("/books", { authenticated: true })
      .then((items) => {
        if (active) {
          setBooks(items.filter((book) => book.addedBy.email === session.user.email));
          setError("");
        }
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
  }, [session?.user.email]);

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      const result = await apiRequest<{ message: string }>(
        `/books/${encodeURIComponent(deleting._id)}`,
        { method: "DELETE", authenticated: true },
      );
      setBooks((current) => current.filter((book) => book._id !== deleting._id));
      notify(result.message);
      setDeleting(null);
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : "The book could not be deleted.", "error");
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <RequireAuth>
      <header className="page-header">
        <p className="eyebrow">Your shared shelf</p>
        <h1>Books you have added</h1>
        <p>Update your listings or remove a book when it is no longer available.</p>
      </header>
      <section className="section-wrap">
        {loading ? (
          <div className="loading-state" aria-live="polite">
            <div className="loading-content"><span className="spinner" /><span>Gathering your books...</span></div>
          </div>
        ) : error ? (
          <div className="empty-state" role="alert"><h3>Your books did not load</h3><p>{error}</p></div>
        ) : books.length === 0 ? (
          <div className="empty-state"><h3>Your shelf is ready for its first book</h3><p>Add a book to share it with other readers.</p></div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Title</th><th>Author</th><th>Category</th><th>Available</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td><span className="category-pill">{book.category}</span></td>
                    <td>{book.totalCopies}</td>
                    <td>
                      <div className="table-actions">
                        <button aria-label={`Edit ${book.title}`} className="icon-button" onClick={() => setEditing(book)} type="button">
                          <Pencil size={16} />
                        </button>
                        <button aria-label={`Delete ${book.title}`} className="icon-button icon-button-danger" onClick={() => setDeleting(book)} type="button">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setEditing(null);
        }}>
          <section aria-labelledby="edit-book-title" aria-modal="true" className="modal-card edit-modal" role="dialog">
            <h2 id="edit-book-title">Edit book details</h2>
            <BookEditor
              book={editing}
              onSaved={(updated) => {
                setBooks((current) => current.map((item) => item._id === updated._id ? updated : item));
                setEditing(null);
              }}
            />
            <button className="button button-outline modal-cancel" onClick={() => setEditing(null)} type="button">Cancel</button>
          </section>
        </div>
      )}

      {deleting && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !deletePending) setDeleting(null);
        }}>
          <section aria-labelledby="delete-book-title" aria-modal="true" className="modal-card" role="dialog">
            <h2 id="delete-book-title">Remove this book?</h2>
            <p><strong>{deleting.title}</strong> will be removed from the shared catalog. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="button button-outline" disabled={deletePending} onClick={() => setDeleting(null)} type="button">Keep book</button>
              <button className="button button-danger" disabled={deletePending} onClick={confirmDelete} type="button">
                {deletePending ? "Removing..." : "Remove book"}
              </button>
            </div>
          </section>
        </div>
      )}
    </RequireAuth>
  );
}
