"use client";

import { BookOpen } from "lucide-react";
import { useState } from "react";

type BookCoverProps = {
  image?: string;
  title: string;
  variant?: "card" | "detail";
};

export default function BookCover({ image, title, variant = "card" }: BookCoverProps) {
  const [unavailable, setUnavailable] = useState(!image);

  return (
    <div className={`book-cover-frame book-cover-frame-${variant}`}>
      {!unavailable && image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${title} book cover`}
          loading={variant === "card" ? "lazy" : undefined}
          onError={() => setUnavailable(true)}
          src={image}
        />
      ) : (
        <div className="book-cover-fallback" aria-label={`${title} cover unavailable`}>
          <BookOpen size={variant === "detail" ? 38 : 28} aria-hidden="true" />
          <span>{title}</span>
        </div>
      )}
    </div>
  );
}
