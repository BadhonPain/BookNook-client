import Link from "next/link";
import { ArrowRight, BookOpenCheck, Clock3, LibraryBig } from "lucide-react";
import HomeBookShelves from "@/components/HomeBookShelves";
import HeroSlider from "@/components/HeroSlider";
import RecommendationShelf from "@/components/RecommendationShelf";

const steps = [
  {
    number: "01",
    title: "Find your next read",
    description: "Explore a thoughtfully gathered shelf of stories, ideas, and discoveries.",
  },
  {
    number: "02",
    title: "Borrow with ease",
    description: "Choose an available book and keep it for a little while.",
  },
  {
    number: "03",
    title: "Pass it along",
    description: "Return your book when you are done and make room for another reader.",
  },
];

export default function Home() {
  return (
    <>
      <HeroSlider />

      <RecommendationShelf />

      <HomeBookShelves />

      <section className="reading-note">
        <div className="reading-note-inner">
          <div className="reading-note-icon" aria-hidden="true">
            <BookOpenCheck size={26} />
          </div>
          <div>
            <p className="eyebrow">A little more room to read</p>
            <h2>Good books are better shared.</h2>
            <p>
              BookNook makes it simple to discover a book, enjoy it at your own
              pace, and return it for the next reader.
            </p>
          </div>
          <Link className="button button-light" href="/books">
            Find a book <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="section-wrap how-section">
        <div className="section-heading section-heading-centered">
          <div>
            <p className="eyebrow">A simple way to share</p>
            <h2>Your next chapter, in three steps</h2>
          </div>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => {
            const Icon = [LibraryBig, Clock3, BookOpenCheck][index];
            return (
              <article className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>
                <div className="step-icon" aria-hidden="true">
                  <Icon size={22} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
