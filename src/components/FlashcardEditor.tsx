import { useState } from "react";
import { useStudyMutation } from "../hooks/useStudyQueries";
import { addFlashcard, updateFlashcard } from "../lib/studyApi";
import type { Flashcard } from "../types";
import Modal from "./Modal";

const FlashcardEditor = ({
  setId,
  card,
  onClose,
}: {
  setId: string;
  card?: Flashcard;
  onClose: () => void;
}) => {
  const [front, setFront] = useState(card?.front ?? "");
  const [back, setBack] = useState(card?.back ?? "");
  const save = useStudyMutation(
    async (input: { front: string; back: string }) =>
      card
        ? updateFlashcard({ ...input, setId, id: card.id })
        : addFlashcard({ ...input, setId }),
  );
  return (
    <Modal
      title={card ? "Edit card" : "New card"}
      busy={save.isPending}
      onClose={onClose}
    >
      <form
        className="fc-form"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate({ front, back }, { onSuccess: onClose });
        }}
      >
        <label>
          Question
          <textarea
            required
            maxLength={10000}
            value={front}
            onChange={(event) => setFront(event.target.value)}
          />
        </label>
        <label>
          Answer
          <textarea
            required
            maxLength={10000}
            value={back}
            onChange={(event) => setBack(event.target.value)}
          />
        </label>
        <div className="inline-actions">
          <button
            className="button primary"
            disabled={save.isPending || !front.trim() || !back.trim()}
          >
            {save.isPending ? "Saving…" : "Save card"}
          </button>
          <button
            type="button"
            className="button"
            disabled={save.isPending}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
        {save.error && (
          <p className="error" role="alert">
            {save.error.message}
          </p>
        )}
      </form>
    </Modal>
  );
};

export default FlashcardEditor;
