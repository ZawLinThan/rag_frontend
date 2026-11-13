import { SkeletonText } from "../skeletons/components";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Layers,
  ListChecks,
  Files,
  GraduationCap,
} from "lucide-react";

export function OverviewTotals({
  courses,
  documents,
  decks,
  tests,
  loading = false,
}: {
  courses?: number;
  documents?: number;
  decks?: number;
  tests?: number;
  loading?: boolean;
}) {
  return (
    <section className="stats-grid" aria-label="Study totals">
      {[
        {
          icon: GraduationCap,
          value: courses,
          label: "Active courses",
        },
        {
          icon: Files,
          value: documents,
          label: "Study documents",
        },
        {
          icon: Layers,
          value: decks,
          label: "Flashcard decks",
        },
        {
          icon: ListChecks,
          value: tests,
          label: "Generated tests",
        },
      ].map(({ icon: Icon, value, label }) => (
        <div className="stat" key={label}>
          <span>
            <Icon size={21} />
          </span>
          <div>
            <strong>
              {loading ? (
                <SkeletonText>00</SkeletonText>
              ) : (
                (value ?? <span aria-label="Count unavailable">—</span>)
              )}
            </strong>
            <p>{label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function OverviewHero() {
  return (
    <section className="hero-panel">
      <div>
        <span className="hero-label">
          <Sparkles size={15} />
          YOUR PERSONAL STUDY COMPANION
        </span>
        <h2>
          Less searching.
          <br />
          More understanding.
        </h2>
        <p>
          Turn your course notes into clear answers, useful flashcards,
          <br className="desktop-break" /> and moments that make it all click.
        </p>
        <Link className="button" to="/chat">
          Ask your study assistant <ArrowRight size={17} />
        </Link>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="floating-tag tag-one">
          <Sparkles size={16} />
          Connect the dots
        </div>
        <div className="paper back-paper" />
        <div className="paper front-paper">
          <span className="paper-icon">
            <GraduationCap size={28} />
          </span>
          <strong>Aha, now I get it.</strong>
          <div className="paper-line" />
          <div className="paper-line short" />
          <div className="paper-highlight">
            A little clarity goes a long way.
          </div>
        </div>
        <div className="floating-tag tag-two">
          <span className="check-dot">✓</span>Grounded in your notes
        </div>
      </div>
    </section>
  );
}

export function OverviewPracticePanels() {
  return (
    <div className="dashboard-bottom">
      <section className="panel">
        <div className="section-heading">
          <h2>Ready for a little practice?</h2>
          <Layers size={20} />
        </div>
        <p>
          Make what you’ve learned stick. Review a few cards or put your
          knowledge to the test.
        </p>
        <div className="inline-actions">
          <Link className="button" to="/flashcards">
            Review flashcards <ArrowRight size={16} />
          </Link>
          <Link className="text-link" to="/tests">
            Create a test <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <section className="panel tip-panel">
        <span className="eyebrow">THE STUDY CORNER</span>
        <h3>Recall it. Don’t just reread it.</h3>
        <p>
          Close your notes and explain an idea in your own words. Retrieval
          practice helps build lasting memories.
        </p>
        <span className="tip-source">A small habit. A lasting difference.</span>
      </section>
    </div>
  );
}
