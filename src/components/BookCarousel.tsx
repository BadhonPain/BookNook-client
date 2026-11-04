"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { A11y, Keyboard, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import BookCard, { BookCardSkeleton } from "@/components/BookCard";
import { apiRequest } from "@/lib/api";
import type { Book } from "@/lib/types";

type BookCarouselProps = {
  title: string;
  eyebrow: string;
  description: string;
  endpoint: string;
  sectionId: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export default function BookCarousel({
  title,
  eyebrow,
  description,
  endpoint,
  sectionId,
  emptyTitle = "This shelf is waiting for its first book",
  emptyDescription = "As readers share more books, they will appear here.",
}: BookCarouselProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<Book[]>(endpoint)
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
  }, [endpoint]);

  return (
    <section aria-labelledby={`${sectionId}-title`} className="section-wrap carousel-section" id={sectionId}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${sectionId}-title`}>{title}</h2>
          <p className="carousel-description">{description}</p>
        </div>
        <Link className="text-link" href="/books">
          See all books <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <div aria-label={`Loading ${title.toLowerCase()}`} className="book-carousel-skeleton" role="status">
          {Array.from({ length: 4 }, (_, index) => <BookCardSkeleton key={index} />)}
        </div>
      ) : error ? (
        <div className="empty-state" role="status">
          <h3>This shelf is taking a moment</h3>
          <p>{error} Please try again shortly.</p>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <h3>{emptyTitle}</h3>
          <p>{emptyDescription}</p>
        </div>
      ) : (
        <Swiper
          aria-label={title}
          breakpoints={{
            0: { slidesPerView: 1.25, spaceBetween: 14 },
            420: { slidesPerView: 2, spaceBetween: 16 },
            640: { slidesPerView: 3, spaceBetween: 18 },
            900: { slidesPerView: 4, spaceBetween: 20 },
            1200: { slidesPerView: 5, spaceBetween: 22 },
          }}
          className="book-carousel"
          keyboard={{ enabled: true, onlyInViewport: true }}
          modules={[A11y, Keyboard, Navigation]}
          navigation={books.length > 1}
          slidesPerView={1.25}
          spaceBetween={14}
          watchOverflow
          a11y={{
            prevSlideMessage: `Previous ${title.toLowerCase()}`,
            nextSlideMessage: `Next ${title.toLowerCase()}`,
          }}
        >
          {books.map((book) => (
            <SwiperSlide key={book._id}>
              <BookCard book={book} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}
