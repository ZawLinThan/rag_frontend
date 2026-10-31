import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  renameCourse,
  deleteCourse,
  editNotebook,
  deleteNotebook,
} from "../lib/studyApi";
import { studyKeys } from "../hooks/useStudyQueries";
import Modal from "./Modal";

export default function StudyRecordActions({
  kind,
  id,
  name,
}: {
  kind: "course" | "notebook";
  id: string;
  name: string;
}) {
  const [mode, setMode] = useState<"edit" | "delete" | null>(null);
  const [draft, setDraft] = useState(name);
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: async () => {
      if (mode === "delete") {
        if (kind === "course") await deleteCourse(id);
        else await deleteNotebook(id);
        return;
      }
      if (kind === "course") return renameCourse({ id, name: draft });
      return editNotebook({ id, noteBookName: draft });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: studyKeys.all });
      setMode(null);
    },
  });
  const open = (next: "edit" | "delete") => {
    save.reset();
    setDraft(name);
    setMode(next);
  };
  return (
    <>
      <div className="record-actions">
        <button
          type="button"
          className="icon-button"
          aria-label={`${kind === "course" ? "Rename" : "Edit"} ${name}`}
          title={kind === "course" ? "Rename course" : "Edit notebook"}
          onClick={() => open("edit")}
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={`Delete ${name}`}
          title={`Delete ${kind}`}
          onClick={() => open("delete")}
        >
          <Trash2 size={15} />
        </button>
      </div>
      {mode && (
        <Modal
          title={`${mode === "delete" ? "Delete" : kind === "course" ? "Rename" : "Edit"} ${kind}`}
          busy={save.isPending}
          onClose={() => setMode(null)}
        >
          <form
            className="inline-form record-edit-form"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate();
            }}
          >
            {mode === "edit" ? (
              <label>
                {kind === "course" ? "Course name" : "Notebook name"}
                <input
                  required
                  maxLength={255}
                  value={draft}
                  disabled={save.isPending}
                  onChange={(event) => setDraft(event.target.value)}
                />
              </label>
            ) : (
              <>
                <p>Delete “{name}”? This cannot be undone.</p>
                <p className="helper">
                  {kind === "course"
                    ? "A course must have no notebooks, documents, or decks before it can be deleted."
                    : "A notebook must have no documents before it can be deleted."}
                </p>
              </>
            )}
            {save.error && (
              <p className="error" role="alert">
                {save.error.message}
              </p>
            )}
            <div className="inline-actions record-modal-actions">
              <button
                className={`button ${mode === "delete" ? "danger" : "primary"}`}
                disabled={save.isPending || (mode === "edit" && !draft.trim())}
              >
                {save.isPending
                  ? "Saving…"
                  : mode === "delete"
                    ? "Delete"
                    : "Save changes"}
              </button>
              <button
                type="button"
                className="button"
                disabled={save.isPending}
                onClick={() => setMode(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
