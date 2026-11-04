import type { Metadata } from "next";
import BooksCatalog from "@/components/BooksCatalog";

export const metadata: Metadata = {
  title: "All Books",
};

export default function BooksPage() {
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Take a look around</p>
        <h1>Books for every kind of curious</h1>
        <p>Browse a shared collection and find a book that feels just right for today.</p>
      </header>
      <section className="section-wrap">
        <BooksCatalog />
      </section>
    </>
  );
}
