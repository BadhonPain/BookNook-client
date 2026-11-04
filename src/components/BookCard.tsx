import Link from "next/link";
import { Eye } from "lucide-react";
import BookCover from "@/components/BookCover";
import type { Book } from "@/lib/types";

export default function BookCard({ book }: { book: Book }) {
  return (
    <article className="book-card">
      <div className="book-card-image">
        <BookCover image={book.image} title={book.title} />
        <span className={`availability-pill${book.totalCopies > 0 ? "" : " availability-unavailable"}`}>
          {book.totalCopies > 0
            ? `${book.totalCopies} ${book.totalCopies === 1 ? "copy" : "copies"} available`
            : "Currently borrowed"}
        </span>
      </div>
      <div className="book-card-content">
        <span className="category-pill">{book.category}</span>
        <h3>{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <Link className="button button-outline button-small" href={`/books/${book._id}`}>
          <Eye size={16} aria-hidden="true" /> View details
        </Link>
      </div>
    </article>
  );
}

export function BookCardSkeleton() {
  return (
    <article aria-hidden="true" className="book-card book-card-skeleton">
      <div className="book-card-image skeleton-block" />
      <div className="book-card-content">
        <span className="skeleton-line skeleton-category" />
        <span className="skeleton-line skeleton-title" />
        <span className="skeleton-line skeleton-author" />
        <span className="skeleton-line skeleton-action" />
      </div>
    </article>
  );
}
