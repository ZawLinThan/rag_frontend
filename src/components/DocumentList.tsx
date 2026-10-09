import { FileText, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useStudyMutation } from "../hooks/useStudyQueries";
import { deleteDocument } from "../lib/studyApi";
import { formatFileSize } from "../lib/utils";
import type { Course, Document, NoteBook } from "../types";

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
  const [confirm, setConfirm] = useState<string | null>(null);
  return (
    <section className="panel">
      {remove.error && (
        <p className="error" role="alert">
          {remove.error.message}
        </p>
      )}
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
          {confirm === document.id ? (
            <div className="inline-actions">
              <button
                className="button danger"
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(document.id, {
                    onSuccess: () => setConfirm(null),
                  })
                }
              >
                Confirm delete
              </button>
              <button
                className="button"
                disabled={remove.isPending}
                onClick={() => setConfirm(null)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="icon-button"
              aria-label={`Delete ${document.name}`}
              onClick={() => {
                remove.reset();
                setConfirm(document.id);
              }}
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>
      ))}
      {!documents.length && (
        <p className="empty">
          No documents here yet. Upload notes to a notebook to get started.
        </p>
      )}
    </section>
  );
};

export default DocumentList;
