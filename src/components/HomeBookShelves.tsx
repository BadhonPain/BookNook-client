import BookCarousel from "@/components/BookCarousel";

export default function HomeBookShelves() {
  return (
    <>
      <BookCarousel
        description="A look through the books readers have added to our shared library."
        endpoint="/books?limit=10"
        eyebrow="A little of everything"
        sectionId="featured-books"
        title="Featured books"
      />
      <BookCarousel
        description="Books readers have borrowed most often from the BookNook shelves."
        endpoint="/books?sort=mostBorrowed&limit=10"
        eyebrow="Loved and passed along"
        emptyTitle="The first borrowed book will appear here"
        emptyDescription="Once readers start borrowing books, the most-read titles will appear here."
        sectionId="most-borrowed"
        title="Most borrowed"
      />
      <BookCarousel
        description="The latest books added by readers, ready for their next chapter."
        endpoint="/books?limit=6"
        eyebrow="Fresh on the shelf"
        sectionId="new-arrivals"
        title="New arrivals"
      />
    </>
  );
}
