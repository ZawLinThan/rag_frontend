import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  studyQueries,
  useStudyData,
  useStudyMutation,
} from "../hooks/useStudyQueries";
import { renameDocument } from "../lib/studyApi";
import { formatFileSize } from "../lib/utils";
import PageHeading from "../components/PageHeading";
import QueryState from "../components/QueryState";

const DocumentPage = () => {
  const { documentId = "" } = useParams();
  const query = useQuery(studyQueries.document(documentId));
  const data = useStudyData();
  const rename = useStudyMutation(renameDocument);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  if (query.isPending || query.error || data.error)
    return (
      <QueryState
        pending={query.isPending}
        error={query.error ?? data.error}
        retry={() => {
          void query.refetch();
          void data.refetch();
        }}
      />
    );
  const document = query.data;
  if (!document) return <p className="empty">Document not found.</p>;
  return (
    <>
      <Link className="back-link" to="/documents">
        <ArrowLeft size={16} /> My documents
      </Link>
      <PageHeading
        title={document.name}
        description={`${data.courses.find((course) => course.id === document.courseId)?.name ?? "Unassigned course"} / ${data.notebooks.find((notebook) => notebook.id === document.notebookId)?.noteBookName ?? "Unassigned notebook"}`}
      />
      <section className="panel reader">
        <span className="eyebrow">
          <FileText size={16} /> DOCUMENT DETAILS
        </span>
        <h2>{document.originalName}</h2>
        <p>
          {formatFileSize(document.fileSize)} · {document.fileType} ·{" "}
          <strong>{document.status}</strong>
        </p>
        {document.errorMessage && (
          <p className="error" role="alert">
            {document.errorMessage}
          </p>
        )}
        <p>Added {new Date(document.createdAt).toLocaleDateString()}</p>
        {/* Backend Document has no public URL or extracted content field. Do not
          invent a PDF preview URL from r2Key; a signed read endpoint is needed. */}
        <div className="notice">
          Document previews will be available when a file-reading service is
          connected.
        </div>
        <div className="inline-actions">
          <button
            className="button"
            onClick={() => {
              setName(document.name);
              setEditing(true);
              rename.reset();
            }}
          >
            Rename document
          </button>
          {document.status === "ready" && (
            <Link
              className="button primary"
              to={`/chat?course=${document.courseId ?? ""}&file=${document.id}`}
            >
              <Sparkles size={16} /> Ask this file
            </Link>
          )}
        </div>
        {editing && (
          <form
            className="inline-form"
            onSubmit={(event) => {
              event.preventDefault();
              rename.mutate(
                { id: document.id, name },
                { onSuccess: () => setEditing(false) },
              );
            }}
          >
            <label>
              Document name
              <input
                required
                maxLength={255}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <button
              className="button primary"
              disabled={rename.isPending || !name.trim()}
            >
              Save
            </button>
            <button
              type="button"
              className="button"
              disabled={rename.isPending}
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
            {rename.error && (
              <p className="error" role="alert">
                {rename.error.message}
              </p>
            )}
          </form>
        )}
      </section>
    </>
  );
};

export default DocumentPage;
