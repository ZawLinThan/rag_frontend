import { FileText, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { useStudyMutation } from "../hooks/useStudyQueries";
import { deleteDocument } from "../lib/studyApi";
import { formatFileSize } from "../lib/utils";
import type { Course, Document, NoteBook } from "../types";
import Modal from "./Modal";

const DocumentList = ({
  documents,
  courses,
  notebooks,
}: {
  documents: Document[];
  courses: Course[];
  notebooks: NoteBook[];
}) => {
  const remove = useStudyMutation(deleteDocument);
  const [target, setTarget] = useState<Pick<Document, "id" | "name"> | null>(
    null,
  );
  const [deletedName, setDeletedName] = useState("");
  const deleting = useRef(false);
  const close = () => {
    if (!deleting.current) setTarget(null);
  };

  return (
    <section className="panel">
      <div role="status">
        {deletedName && <p className="notice">Deleted “{deletedName}”.</p>}
      </div>
      {documents.map((document) => (
        <div className="document-row" key={document.id}>
          <span className="file-icon">
            <FileText size={20} />
          </span>
          <Link className="document-info" to={`/documents/${document.id}`}>
            <strong>{document.name}</strong>
            <small>
              {courses.find((course) => course.id === document.courseId)
                ?.name ?? "Unassigned course"}{" "}
              ·{" "}
              {notebooks.find((notebook) => notebook.id === document.notebookId)
                ?.noteBookName ?? "Unassigned notebook"}{" "}
              · {formatFileSize(document.fileSize)}
            </small>
          </Link>
          <span className={`status document-status-${document.status}`}>
            {document.status}
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label={`Delete ${document.name}`}
            onClick={() => {
              remove.reset();
              setDeletedName("");
              setTarget({ id: document.id, name: document.name });
            }}
          >
            <Trash2 size={17} />
          </button>
        </div>
      ))}
      {!documents.length && (
        <p className="empty">
          No documents here yet. Upload notes to a notebook to get started.
        </p>
      )}
      {target && (
        <Modal title="Delete document" busy={remove.isPending} onClose={close}>
          <form
            className="inline-form record-edit-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (deleting.current) return;
              deleting.current = true;
              remove.mutate(target.id, {
                onSuccess: () => {
                  setDeletedName(target.name);
                  setTarget(null);
                },
                onSettled: () => {
                  deleting.current = false;
                },
              });
            }}
          >
            <p>Delete “{target.name}”? This cannot be undone.</p>
            <div role="status">
              {remove.isPending && <p>Deleting “{target.name}”…</p>}
            </div>
            {remove.error && (
              <p className="error" role="alert">
                {remove.error.message}
              </p>
            )}
            <div className="inline-actions record-modal-actions">
              <button
                type="button"
                className="button"
                disabled={remove.isPending}
                onClick={close}
              >
                Cancel
              </button>
              <button className="button danger" disabled={remove.isPending}>
                {remove.isPending ? "Deleting…" : "Delete document"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

export default DocumentList;
