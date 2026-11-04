"use client";

import Link from "next/link";
import { ArrowRight, BookPlus } from "lucide-react";
import { useSyncExternalStore } from "react";
import { A11y, Autoplay, EffectFade, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    eyebrow: "A neighborhood of good reads",
    title: <>Find a story<br />that <em>stays</em> with you.</>,
    description:
      "Explore a shared world of books, discover new perspectives, and let great stories travel further.",
  },
  {
    eyebrow: "Curiosity lives here",
    title: <>Follow a thought.<br />Meet a <em>new world.</em></>,
    description: "From faraway histories to fresh ideas, there is always another page to turn.",
  },
  {
    eyebrow: "Read a little. Share a lot.",
    title: <>Pass a good book<br />to the <em>next reader.</em></>,
    description: "Borrow what catches your eye, then return it when your next chapter is done.",
  },
];

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const subscribeToReducedMotion = (onChange: () => void) => {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const getReducedMotionSnapshot = () => window.matchMedia(reducedMotionQuery).matches;
const getReducedMotionServerSnapshot = () => false;

function BookIllustration() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="book-stack">
        <div className="book-cover book-cover-one">
          <span className="book-cover-title">The<br />Quiet<br />Garden</span>
        </div>
        <div className="book-cover book-cover-two">
          <span className="book-cover-title">A Map<br />of Small<br />Wonders</span>
        </div>
        <div className="book-cover book-cover-three">
          <span className="book-cover-title">Letters<br />from<br />Elsewhere</span>
        </div>
        <div className="hero-stamp">stories<br />to share</div>
      </div>
    </div>
  );
}

export default function HeroSlider() {
  const isMounted = useSyncExternalStore(
    subscribeToMount,
    getClientSnapshot,
    getServerSnapshot,
  );
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const heroContent = (slide: (typeof slides)[number]) => (
    <div className="hero-content">
      <div className="hero-copy">
        <p className="eyebrow">{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <p>{slide.description}</p>
        <Link className="button" href="/books">
          Browse books <ArrowRight size={17} aria-hidden="true" />
        </Link>
        <Link className="button button-outline hero-secondary-action" href="/add-book">
          <BookPlus size={17} aria-hidden="true" /> Share a book
        </Link>
      </div>
      <BookIllustration />
    </div>
  );

  if (!isMounted) {
    return (
      <section aria-label="Welcome to BookNook" className="hero-section">
        {heroContent(slides[0])}
      </section>
    );
  }

  return (
    <section aria-label="Welcome to BookNook" className="hero-section">
      <Swiper
        autoplay={
          prefersReducedMotion
            ? false
            : {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
        }
        effect="fade"
        fadeEffect={{ crossFade: true }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        loop
        modules={[A11y, Autoplay, EffectFade, Keyboard, Navigation, Pagination]}
        navigation
        pagination={{ clickable: true, el: ".hero-pagination" }}
        className="hero-swiper"
        a11y={{
          prevSlideMessage: "Previous slide",
          nextSlideMessage: "Next slide",
          paginationBulletMessage: "Go to slide {{index}}",
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.eyebrow}>
            {heroContent(slide)}
            <span className="sr-only">Slide {index + 1} of {slides.length}</span>
          </SwiperSlide>
        ))}
        <div className="hero-pagination" />
      </Swiper>
    </section>
  );
}
