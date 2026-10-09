import { useState } from "react";
import { ArrowRight, Check, Layers, RotateCcw } from "lucide-react";
import type { Flashcard } from "../types";

/** Session-only recall; no backend rating endpoint exists yet. */
const FlashcardReview = ({ cards }: { cards: Flashcard[] }) => {
  const [queue, setQueue] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState<Flashcard[]>([]);
  const [known, setKnown] = useState(0);
  const current = queue[index];
  const start = (next: Flashcard[]) => {
    setQueue(next);
    setIndex(0);
    setFlipped(false);
    setMissed([]);
    setKnown(0);
  };
  const rate = (recalled: boolean) => {
    if (!current) return;
    if (recalled) setKnown((value) => value + 1);
    else setMissed((items) => [...items, current]);
    setIndex((value) => value + 1);
    setFlipped(false);
  };
  return (
    <div className="fc-review">
      {current ? (
        <>
          <div className="fc-row">
            <span className="fc-label">
              Card {index + 1} / {queue.length}
            </span>
            <span className="muted">
              {known} recalled · {missed.length} to revisit
            </span>
          </div>
          <progress
            aria-label="Review progress"
            value={index}
            max={queue.length}
          />
          <button
            className={`flashcard ${flipped ? "flipped" : ""}`}
            aria-label={flipped ? "Show question" : "Reveal answer"}
            onClick={() => setFlipped((value) => !value)}
          >
            <span className="eyebrow">
              <Layers size={16} />
              {flipped ? "ANSWER" : "QUESTION"}
            </span>
            <h2>{flipped ? current.back : current.front}</h2>
            <span className="muted">
              {flipped
                ? "Click to revisit the question"
                : "Think of your answer, then click to reveal"}
            </span>
          </button>
          <div className="inline-actions centered review-actions">
            {flipped ? (
              <>
                <button className="button" onClick={() => rate(false)}>
                  <RotateCcw size={16} /> Still learning
                </button>
                <button className="button primary" onClick={() => rate(true)}>
                  <Check size={16} /> Got it
                </button>
              </>
            ) : (
              <button
                className="button primary"
                onClick={() => setFlipped(true)}
              >
                Reveal answer <ArrowRight size={16} />
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="fc-complete" role="status">
          <Check size={28} />
          <h2>
            {queue.length
              ? "One step closer to knowing it."
              : "No cards to review yet."}
          </h2>
          <p>
            {queue.length
              ? `You recalled ${known} of ${queue.length} cards.`
              : "Add cards to this deck to start practicing."}
          </p>
          <div className="inline-actions centered">
            {missed.length > 0 && (
              <button className="button primary" onClick={() => start(missed)}>
                Review {missed.length} missed cards
              </button>
            )}
            <button
              className="button"
              disabled={!cards.length}
              onClick={() => start(cards)}
            >
              <RotateCcw size={16} /> Review all
            </button>
          </div>
        </div>
      )}
      <p className="fc-note centered">
        Recall results are for this session. Scheduled reviews are not available
        yet.
      </p>
    </div>
  );
};

export default FlashcardReview;
