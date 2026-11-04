"use client";

import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BookCard, { BookCardSkeleton } from "@/components/BookCard";
import { apiRequest } from "@/lib/api";
import type { Book, BookCategory } from "@/lib/types";

const categories: Array<BookCategory | "All categories"> = [
  "All categories",
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Others",
];

const pageSize = 9;
type SortMode = "newest" | "oldest" | "title";

export default function BooksCatalog() {
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All categories");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [availability, setAvailability] = useState<"all" | "available">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (category !== "All categories") params.set("category", category);
    if (availability === "available") params.set("available", "true");
    const queryString = params.toString();
    apiRequest<Book[]>(queryString ? `/books?${queryString}` : "/books")
      .then((items) => {
        if (active) setBooks(items);
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
  }, [availability, category]);

  const filteredBooks = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    const filtered = books.filter((book) => {
      const matchesCategory = category === "All categories" || book.category === category;
      const matchesSearch =
        !search ||
        book.title.toLocaleLowerCase().includes(search) ||
        book.author.toLocaleLowerCase().includes(search);
      const matchesAvailability = availability === "all" || book.totalCopies > 0;
      return matchesCategory && matchesSearch && matchesAvailability;
    });
    return filtered.sort((left, right) => {
      if (sortMode === "title") return left.title.localeCompare(right.title);
      const leftDate = Date.parse(left.createdAt || left.addedAt);
      const rightDate = Date.parse(right.createdAt || right.addedAt);
      const dateOrder =
        (Number.isNaN(leftDate) ? 0 : leftDate) -
        (Number.isNaN(rightDate) ? 0 : rightDate);
      return sortMode === "newest" ? -dateOrder : dateOrder;
    });
  }, [availability, books, category, query, sortMode]);

  const pageCount = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const visibleBooks = filteredBooks.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="catalog-controls">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search books by title or author</span>
          <input
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by title or author"
            type="search"
            value={query}
          />
        </label>
        <div className="catalog-filter-group">
          <label className="catalog-filter">
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span className="sr-only">Filter by category</span>
            <select
              className="select-field"
              onChange={(event) => {
                setCategory(event.target.value as (typeof categories)[number]);
                setPage(1);
                setError("");
                setLoading(true);
              }}
              value={category}
            >
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="catalog-filter">
            <span className="sr-only">Filter by availability</span>
            <select
              className="select-field"
              onChange={(event) => {
                setAvailability(event.target.value as typeof availability);
                setPage(1);
                setError("");
                setLoading(true);
              }}
              value={availability}
            >
              <option value="all">All availability</option>
              <option value="available">Available now</option>
            </select>
          </label>
          <label className="catalog-filter">
            <span className="sr-only">Sort books</span>
            <select
              className="select-field"
              onChange={(event) => {
                setSortMode(event.target.value as SortMode);
                setPage(1);
              }}
              value={sortMode}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A to Z</option>
            </select>
          </label>
        </div>
      </div>
      {loading ? (
        <div aria-label="Loading books" className="book-grid" role="status">
          {Array.from({ length: 6 }, (_, index) => <BookCardSkeleton key={index} />)}
        </div>
      ) : error ? (
        <div className="empty-state" role="alert">
          <h3>We could not load the catalog</h3>
          <p>{error}</p>
        </div>
      ) : filteredBooks.length ? (
        <>
          <p aria-live="polite" className="catalog-result-count">
            {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"}
          </p>
          <div className="book-grid">
            {visibleBooks.map((book) => <BookCard book={book} key={book._id} />)}
          </div>
          {pageCount > 1 && (
            <nav aria-label="Book pages" className="pagination">
              <button
                aria-label="Previous page"
                className="pagination-button"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                type="button"
              >
                <ChevronLeft size={17} />
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  aria-current={pageNumber === page ? "page" : undefined}
                  aria-label={`Page ${pageNumber}`}
                  className={`pagination-button${pageNumber === page ? " pagination-button-active" : ""}`}
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  type="button"
                >
                  {pageNumber}
                </button>
              ))}
              <button
                aria-label="Next page"
                className="pagination-button"
                disabled={page === pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                type="button"
              >
                <ChevronRight size={17} />
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h3>No matching books yet</h3>
          <p>Try a different title, author, or category.</p>
        </div>
      )}
    </>
  );
}
