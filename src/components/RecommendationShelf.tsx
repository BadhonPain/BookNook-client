"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { A11y, Keyboard, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import BookCard from "@/components/BookCard";
import { useToast } from "@/components/ToastProvider";
import { apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Book, BookCategory } from "@/lib/types";

const categories: BookCategory[] = ["Fiction", "Science", "History", "Kids", "Others"];

type ReaderPreferences = {
  categories: BookCategory[];
  interests: string[];
};

type Recommendation = {
  book: Book;
  reasons: string[];
};

type RecommendationResponse = {
  recommendations: Recommendation[];
  preferences: ReaderPreferences;
  historyCount: number;
};

export default function RecommendationShelf() {
  const { data: session, isPending } = authClient.useSession();
  const { notify } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [favoriteCategories, setFavoriteCategories] = useState<BookCategory[]>([]);
  const [interestText, setInterestText] = useState("");
  const [historyCount, setHistoryCount] = useState(0);
  const [loadedIdentity, setLoadedIdentity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const email = session?.user?.email;
  const requestIdentity = email ? `${email}:${reloadKey}` : "";
  const loading = isPending || Boolean(email && loadedIdentity !== requestIdentity);

  useEffect(() => {
    if (isPending) return;
    if (!email) return;

    let active = true;
    apiRequest<RecommendationResponse>("/recommendations", { authenticated: true })
      .then((result) => {
        if (!active) return;
        setError("");
        setRecommendations(result.recommendations);
        setFavoriteCategories(result.preferences.categories);
        setInterestText(result.preferences.interests.join(", "));
        setHistoryCount(result.historyCount);
      })
      .catch((cause: Error) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoadedIdentity(requestIdentity);
      });

    return () => {
      active = false;
    };
  }, [email, isPending, reloadKey, requestIdentity]);

  function toggleCategory(category: BookCategory) {
    setFavoriteCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  async function savePreferences(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const interests = [...new Set(
      interestText.split(",").map((interest) => interest.trim()).filter(Boolean),
    )];
    setSaving(true);
    try {
      const result = await apiRequest<{ message: string; preferences: ReaderPreferences }>(
        "/recommendations/preferences",
        {
          method: "PUT",
          authenticated: true,
          body: JSON.stringify({ categories: favoriteCategories, interests }),
        },
      );
      setFavoriteCategories(result.preferences.categories);
      setInterestText(result.preferences.interests.join(", "));
      setReloadKey((current) => current + 1);
      notify(result.message);
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : "Your preferences could not be saved.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      aria-labelledby="recommendations-title"
      className="section-wrap carousel-section recommendation-section"
      id="for-you"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Picked around your reading</p>
          <h2 id="recommendations-title">Recommended for you</h2>
          <p className="carousel-description">
            Suggestions learn from books you have borrowed, favorite categories, and interests.
          </p>
        </div>
        {email && (
          <span className="recommendation-history">
            {historyCount} {historyCount === 1 ? "book" : "books"} in your history
          </span>
        )}
      </div>

      {isPending ? (
        <div aria-live="polite" className="loading-state" role="status">
          <div className="loading-content"><span className="spinner" /><span>Loading your reader profile...</span></div>
        </div>
      ) : !email ? (
        <div className="recommendation-sign-in">
          <p>Sign in to get book suggestions based on your reading and interests.</p>
          <Link className="button button-small" href="/login">Sign in</Link>
        </div>
      ) : (
        <>
          <form className="recommendation-preferences" onSubmit={(event) => void savePreferences(event)}>
            <fieldset>
              <legend>Favorite categories</legend>
              <div className="recommendation-category-list">
                {categories.map((category) => (
                  <label className="recommendation-choice" key={category}>
                    <input
                      checked={favoriteCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      type="checkbox"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="recommendation-interest">
              <span>Authors or interests</span>
              <input
                autoComplete="off"
                maxLength={1200}
                onChange={(event) => setInterestText(event.target.value)}
                placeholder="e.g. Ursula Le Guin, space, family"
                value={interestText}
              />
              <small>Separate authors, topics, or themes with commas.</small>
            </label>
            <button className="button button-small recommendation-save" disabled={saving} type="submit">
              {saving ? "Saving..." : "Update suggestions"}
            </button>
          </form>

          {loading ? (
            <div aria-live="polite" className="loading-state" role="status">
              <div className="loading-content"><span className="spinner" /><span>Finding your next read...</span></div>
            </div>
          ) : error ? (
            <div className="empty-state" role="alert">
              <h3>Your recommendations did not load</h3>
              <p>{error}</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="empty-state">
              <h3>We need a few more clues</h3>
              <p>Choose categories or interests above, or borrow a book to help us find a closer match.</p>
            </div>
          ) : (
            <Swiper
              aria-label="Books recommended for you"
              breakpoints={{
                0: { slidesPerView: 1.25, spaceBetween: 14 },
                420: { slidesPerView: 2, spaceBetween: 16 },
                640: { slidesPerView: 3, spaceBetween: 18 },
                900: { slidesPerView: 4, spaceBetween: 20 },
                1200: { slidesPerView: 5, spaceBetween: 22 },
              }}
              className="book-carousel recommendation-carousel"
              keyboard={{ enabled: true, onlyInViewport: true }}
              modules={[A11y, Keyboard, Navigation]}
              navigation={recommendations.length > 1}
              slidesPerView={1.25}
              spaceBetween={14}
              watchOverflow
            >
              {recommendations.map(({ book, reasons }) => (
                <SwiperSlide key={book._id}>
                  <div className="recommendation-card">
                    <BookCard book={book} />
                    <ul aria-label="Why this book was recommended" className="recommendation-reasons">
                      {reasons.map((reason) => <li key={reason}>{reason}</li>)}
                    </ul>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </>
      )}
    </section>
  );
}
