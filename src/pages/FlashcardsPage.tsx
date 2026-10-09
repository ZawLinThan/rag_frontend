import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  studyQueries,
  useStudyData,
  useStudyMutation,
} from "../hooks/useStudyQueries";
import {
  createFlashcardSet,
  deleteFlashcard,
  deleteFlashcardSet,
  generateFlashcards,
} from "../lib/studyApi";
import PageHeading from "../components/PageHeading";
import QueryState from "../components/QueryState";
import FlashcardReview from "../components/FlashcardReview";
import FlashcardEditor from "../components/FlashcardEditor";
import type { Flashcard, FlashcardSet } from "../types";

const DeckTile = ({
  deck,
  courseName,
  onSelect,
}: {
  deck: FlashcardSet;
  courseName: string;
  onSelect: (id: string, reviewing: boolean) => void;
}) => {
  const query = useQuery(studyQueries.cards(deck.id));
  return (
    <article className="fc-deck">
      <div className="fc-row">
        <span className="fc-icon">
          <Layers size={22} />
        </span>
        <span className="fc-label">
          {query.isPending
            ? "Loading cards…"
            : `${query.data?.length ?? 0} cards`}
        </span>
      </div>
      <div>
        <h3>{deck.title}</h3>
        <p>{courseName}</p>
        <p>
          {deck.documentId
            ? "Generated from a document"
            : "Your own questions & answers"}
        </p>
      </div>
      {query.error && <QueryState error={query.error} retry={query.refetch} />}
      <div className="fc-row">
        <button
          className="button primary"
          disabled={!query.data?.length}
          onClick={() => onSelect(deck.id, true)}
        >
          Study deck <ArrowRight size={16} />
        </button>
        <button className="button" onClick={() => onSelect(deck.id, false)}>
          Manage
        </button>
      </div>
    </article>
  );
};

const FlashcardsPage = () => {
  const data = useStudyData();
  const sets = useQuery(studyQueries.sets());
  const [params] = useSearchParams();
  const [filter, setFilter] = useState(params.get("course") ?? "");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewRound, setReviewRound] = useState(0);
  const [editor, setEditor] = useState<Flashcard | "new" | null>(null);
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(params.get("course") ?? "");
  const [documentId, setDocumentId] = useState("");
  const [count, setCount] = useState(5);
  const [confirm, setConfirm] = useState<{
    kind: "deck" | "card";
    id: string;
  } | null>(null);
  const cardQuery = useQuery(studyQueries.cards(selectedId));
  const create = useStudyMutation(createFlashcardSet);
  const generate = useStudyMutation(generateFlashcards);
  const removeDeck = useStudyMutation(deleteFlashcardSet);
  const removeCard = useStudyMutation(deleteFlashcard);
  const selected = sets.data?.find((set) => set.id === selectedId);
  const visible = (sets.data ?? []).filter(
    (set) =>
      (!filter || set.courseId === filter) &&
      set.title.toLowerCase().includes(search.toLowerCase()),
  );
  const readyDocuments = data.documents.filter(
    (document) => document.courseId === courseId && document.status === "ready",
  );
  const select = (id: string, review: boolean) => {
    setSelectedId(id);
    setReviewing(review);
    setReviewRound((value) => value + 1);
    setEditor(null);
    setConfirm(null);
  };
  const created = (set: FlashcardSet) => {
    setCreating(false);
    setTitle("");
    select(set.id, false);
  };
  const saving = create.isPending || generate.isPending;
  return (
    <div className="fc-page">
      <PageHeading
        title="Flashcards"
        description="Create your own cards or turn your notes into a practice deck."
        action={
          <button
            className="button primary"
            onClick={() => {
              create.reset();
              generate.reset();
              setCreating(!creating);
            }}
          >
            <Plus size={16} /> Create deck
          </button>
        }
      />
      <QueryState
        pending={data.isPending || sets.isPending}
        error={data.error ?? sets.error}
        retry={() => {
          void data.refetch();
          void sets.refetch();
        }}
      />
      {creating && (
        <form
          className="fc-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (mode === "manual")
              create.mutate(
                { title, courseId: courseId || null },
                { onSuccess: created },
              );
            else
              generate.mutate(
                { title, courseId, documentId, count },
                { onSuccess: created },
              );
          }}
        >
          <h2>Create a study deck</h2>
          <div
            className="mode-options"
            role="group"
            aria-label="Deck creation mode"
          >
            <button
              type="button"
              className={`button ${mode === "manual" ? "primary" : ""}`}
              disabled={saving}
              aria-pressed={mode === "manual"}
              onClick={() => {
                setMode("manual");
                create.reset();
                generate.reset();
              }}
            >
              <Pencil size={16} /> Write my own
            </button>
            <button
              type="button"
              className={`button ${mode === "ai" ? "primary" : ""}`}
              disabled={saving}
              aria-pressed={mode === "ai"}
              onClick={() => {
                setMode("ai");
                create.reset();
                generate.reset();
              }}
            >
              <Sparkles size={16} /> Generate from notes
            </button>
          </div>
          <label>
            Deck title
            <input
              required
              maxLength={255}
              value={title}
              disabled={saving}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Cell biology · Week 1"
            />
          </label>
          <label>
            Course{mode === "manual" ? " (optional)" : ""}
            <select
              required={mode === "ai"}
              value={courseId}
              disabled={saving}
              onChange={(event) => {
                setCourseId(event.target.value);
                setDocumentId("");
              }}
            >
              <option value="">
                {mode === "manual" ? "Unassigned" : "Select a course"}
              </option>
              {data.courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>
          {mode === "ai" && (
            <>
              <label>
                Source document
                <select
                  required
                  value={documentId}
                  disabled={saving || !courseId}
                  onChange={(event) => setDocumentId(event.target.value)}
                >
                  <option value="">Select ready notes</option>
                  {readyDocuments.map((document) => (
                    <option key={document.id} value={document.id}>
                      {document.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Number of cards
                <input
                  required
                  type="number"
                  min={1}
                  max={20}
                  value={count}
                  disabled={saving}
                  onChange={(event) => setCount(Number(event.target.value))}
                />
              </label>
              <p className="fc-note">
                Only documents marked ready can be used. Sample generation
                demonstrates the workflow without analyzing files.
              </p>
            </>
          )}
          <div className="inline-actions">
            <button
              className="button primary"
              disabled={
                saving ||
                !title.trim() ||
                (mode === "ai" && (!documentId || !courseId))
              }
            >
              {saving
                ? "Creating…"
                : mode === "ai"
                  ? "Generate deck"
                  : "Create deck"}
            </button>
            <button
              type="button"
              className="button"
              disabled={saving}
              onClick={() => setCreating(false)}
            >
              Cancel
            </button>
          </div>
          <QueryState error={create.error ?? generate.error} />
        </form>
      )}
      {!data.isPending &&
        !sets.isPending &&
        !data.error &&
        !sets.error &&
        (!selected ? (
          <>
            <div className="fc-tools">
              <div className="search-field">
                <Search size={18} />
                <input
                  aria-label="Search decks"
                  placeholder="Search your decks…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select
                aria-label="Filter decks by course"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="">All courses</option>
                {data.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="fc-grid">
              {visible.map((set) => (
                <DeckTile
                  key={set.id}
                  deck={set}
                  courseName={
                    data.courses.find((course) => course.id === set.courseId)
                      ?.name ?? "Unassigned course"
                  }
                  onSelect={select}
                />
              ))}
            </div>
            {!visible.length && (
              <div className="fc-complete">
                <BookOpen size={32} />
                <h2>No decks here yet</h2>
                <p>Create a deck or try another search.</p>
                <button
                  className="button"
                  onClick={() => {
                    setFilter("");
                    setSearch("");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="fc-row">
              <button className="button" onClick={() => select("", false)}>
                <ArrowLeft size={16} /> All decks
              </button>
              <span className="muted">
                {data.courses.find((course) => course.id === selected.courseId)
                  ?.name ?? "Unassigned course"}
              </span>
            </div>
            <div className="fc-row section-heading">
              <div>
                <h2>{selected.title}</h2>
                <p className="fc-note">{cardQuery.data?.length ?? 0} cards</p>
              </div>
              <div className="inline-actions">
                <button
                  className="button"
                  onClick={() => {
                    setReviewing(false);
                    setEditor(null);
                  }}
                >
                  Manage cards
                </button>
                <button
                  className="button primary"
                  disabled={!cardQuery.data?.length}
                  onClick={() => {
                    setReviewing(true);
                    setReviewRound((value) => value + 1);
                    setEditor(null);
                    setConfirm(null);
                  }}
                >
                  <BookOpen size={16} /> Start review
                </button>
              </div>
            </div>
            <QueryState
              pending={cardQuery.isPending}
              error={cardQuery.error}
              retry={cardQuery.refetch}
            />
            {cardQuery.data &&
              !cardQuery.error &&
              (reviewing ? (
                <FlashcardReview
                  key={`${selected.id}-${reviewRound}`}
                  cards={cardQuery.data}
                />
              ) : (
                <>
                  <div className="fc-row">
                    <h3>Questions & answers</h3>
                    <button className="button" onClick={() => setEditor("new")}>
                      <Plus size={16} /> Add card
                    </button>
                  </div>
                  {editor && (
                    <FlashcardEditor
                      key={editor === "new" ? "new" : editor.id}
                      setId={selected.id}
                      card={editor === "new" ? undefined : editor}
                      onClose={() => setEditor(null)}
                    />
                  )}
                  {cardQuery.data.map((card, index) => (
                    <article className="fc-card-row" key={card.id}>
                      <div>
                        <span className="fc-label">Card {index + 1}</span>
                        <h3>{card.front}</h3>
                        <p>{card.back}</p>
                      </div>
                      <div className="inline-actions">
                        <button
                          className="icon-button"
                          aria-label={`Edit card ${index + 1}`}
                          onClick={() => setEditor(card)}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="icon-button fc-danger"
                          aria-label={`Delete card ${index + 1}`}
                          onClick={() => {
                            removeCard.reset();
                            setConfirm({ kind: "card", id: card.id });
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </article>
                  ))}
                  {!cardQuery.data.length && (
                    <p className="fc-note">
                      Add your first question and answer to start practicing.
                    </p>
                  )}
                  <button
                    className="button fc-danger review-actions"
                    onClick={() => {
                      removeDeck.reset();
                      setConfirm({ kind: "deck", id: selected.id });
                    }}
                  >
                    <Trash2 size={16} /> Delete deck
                  </button>
                  {confirm && (
                    <div className="fc-form" role="alert">
                      <h3>
                        {confirm.kind === "deck"
                          ? "Delete this deck and all its cards?"
                          : "Delete this card?"}
                      </h3>
                      <p className="fc-note">This action cannot be undone.</p>
                      <div className="inline-actions">
                        <button
                          className="button fc-danger"
                          disabled={
                            removeCard.isPending || removeDeck.isPending
                          }
                          onClick={() => {
                            if (confirm.kind === "deck")
                              removeDeck.mutate(confirm.id, {
                                onSuccess: () => select("", false),
                              });
                            else
                              removeCard.mutate(
                                { setId: selected.id, id: confirm.id },
                                {
                                  onSuccess: () => {
                                    setConfirm(null);
                                    setEditor(null);
                                  },
                                },
                              );
                          }}
                        >
                          Delete
                        </button>
                        <button
                          className="button"
                          disabled={
                            removeCard.isPending || removeDeck.isPending
                          }
                          onClick={() => setConfirm(null)}
                        >
                          Cancel
                        </button>
                      </div>
                      <QueryState
                        error={removeCard.error ?? removeDeck.error}
                      />
                    </div>
                  )}
                </>
              ))}
          </>
        ))}
    </div>
  );
};

export default FlashcardsPage;
