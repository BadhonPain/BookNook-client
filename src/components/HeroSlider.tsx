"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { A11y, Autoplay, EffectFade, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const slides = [
  {
    eyebrow: "BookNook",
    title: <>Borrow, read,<br />return. Repeat.</>,
    description: "Seven days for every book. Return it with one click when you are done.",
    image:
      "https://images.unsplash.com/photo-1535403032362-006ffd1795ae?auto=format&fit=crop&w=2400&q=85",
  },
  {
    eyebrow: "Find your next chapter",
    title: <>A new story<br />is waiting for you.</>,
    description: "Explore a shared library and discover a book you will want to pass along.",
    image:
      "https://images.unsplash.com/photo-1616330682546-2468b2d8dd17?auto=format&fit=crop&w=2400&q=85",
  },
  {
    eyebrow: "Good books travel",
    title: <>Read a little.<br />Share a lot.</>,
    description: "Borrow what catches your eye, then make room for the next reader.",
    image:
      "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=2400&q=85",
  },
  {
    eyebrow: "Your next favorite",
    title: <>Turn the page.<br />Find your story.</>,
    description: "Browse the BookNook shelves and find your next great read.",
    image:
      "https://images.unsplash.com/photo-1677462998907-96f090f463ef?auto=format&fit=crop&w=2400&q=85",
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
    <div
      className="hero-slide"
      style={{
        backgroundImage: `linear-gradient(90deg, rgb(8 10 10 / 78%) 0%, rgb(8 10 10 / 54%) 45%, rgb(8 10 10 / 16%) 100%), url("${slide.image}")`,
      }}
    >
      <div className="hero-content">
        <div className="hero-copy">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h1>{slide.title}</h1>
          <p>{slide.description}</p>
          <Link className="button" href="/books">
            Browse Books
          </Link>
        </div>
      </div>
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
        modules={[A11y, Autoplay, EffectFade, Keyboard, Pagination]}
        pagination={{ clickable: true, el: ".hero-pagination" }}
        className="hero-swiper"
        a11y={{
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
