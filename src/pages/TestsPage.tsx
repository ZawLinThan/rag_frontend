import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  studyQueries,
  useStudyData,
  useStudyMutation,
} from "../hooks/useStudyQueries";
import { deleteTest, generateTest } from "../lib/studyApi";
import PageHeading from "../components/PageHeading";
import StudyScope from "../components/StudyScope";
import FileUpload from "../components/FileUpload";
import QueryState from "../components/QueryState";
import TestPreview from "../components/TestPreview";
import Modal from "../components/Modal";
import type { UploadResult } from "../types";

const TestsPage = () => {
  const data = useStudyData();
  const tests = useQuery(studyQueries.tests());
  const generate = useStudyMutation(generateTest);
  const remove = useStudyMutation(deleteTest);
  const [params] = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState<"notebook" | "reference">("notebook");
  const [courseId, setCourseId] = useState(params.get("course") ?? "");
  const [notebookId, setNotebookId] = useState(params.get("notebook") ?? "");
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState<UploadResult | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const readyNotes = data.documents.filter(
    (document) =>
      document.notebookId === notebookId &&
      document.status === "ready" &&
      document.id !== reference?.document.id,
  );
  const referenceReady =
    reference &&
    data.documents.some(
      (document) =>
        document.id === reference.document.id &&
        document.notebookId === notebookId &&
        document.courseId === courseId &&
        document.status === "ready",
    );
  const validScope = data.notebooks.some(
    (notebook) => notebook.id === notebookId && notebook.courseId === courseId,
  );
  return (
    <>
      <PageHeading
        title="Tests"
        description="Practice with a test from your notebook or use a sample test as a reference."
        action={
          <button
            className="button primary"
            onClick={() => {
              setCreating(true);
              generate.reset();
            }}
          >
            <Plus size={16} /> Create test
          </button>
        }
      />
      <QueryState
        pending={data.isPending || tests.isPending}
        error={data.error ?? tests.error}
        retry={() => {
          void data.refetch();
          void tests.refetch();
        }}
      />
      {creating && (
        <Modal
          title="Create a practice test"
          busy={generate.isPending}
          onClose={() => setCreating(false)}
        >
          <form
            className="panel generation-form"
            onSubmit={(event) => {
              event.preventDefault();
              generate.mutate(
                {
                  title,
                  notebookId,
                  mode,
                  referenceFileId:
                    mode === "reference"
                      ? (reference?.document.id ?? null)
                      : null,
                  referenceUrl:
                    /** redesign, publicUrl is/will be deleted*/
                    mode === "reference"
                      ? (reference?.publicUrl ?? null)
                      : null,
                },
                {
                  onSuccess: (test) => {
                    setSelectedId(test.id);
                    setCreating(false);
                    setTitle("");
                  },
                },
              );
            }}
          >
            <p>What would you like to practice?</p>
            <div
              className="mode-options"
              role="group"
              aria-label="Test generation mode"
            >
              <button
                type="button"
                className={`button ${mode === "notebook" ? "primary" : ""}`}
                aria-pressed={mode === "notebook"}
                disabled={generate.isPending}
                onClick={() => {
                  setMode("notebook");
                  generate.reset();
                }}
              >
                <Sparkles size={16} /> From a notebook
              </button>
              <button
                type="button"
                className={`button ${mode === "reference" ? "primary" : ""}`}
                aria-pressed={mode === "reference"}
                disabled={generate.isPending}
                onClick={() => {
                  setMode("reference");
                  generate.reset();
                }}
              >
                <FileText size={16} /> Mimic a sample test
              </button>
            </div>
            <label>
              Test title
              <input
                required
                maxLength={100}
                disabled={generate.isPending}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Genetics midterm practice"
              />
            </label>
            <StudyScope
              courses={data.courses}
              notebooks={data.notebooks}
              courseId={courseId}
              notebookId={notebookId}
              disabled={generate.isPending}
              onChange={(course, notebook) => {
                setCourseId(course);
                setNotebookId(notebook);
                setReference(null);
                generate.reset();
              }}
            />
            {mode === "reference" && (
              <div>
                <p className="helper">
                  Upload a sample test to guide the format and style of the
                  generated test. Your chosen notebook provides the study
                  material.
                </p>
                <FileUpload
                  key={`${courseId}-${notebookId}`}
                  courseId={courseId}
                  notebookId={notebookId}
                  multiple={false}
                  disabled={generate.isPending}
                  label="Upload a sample test"
                  onUploaded={setReference}
                />
                {referenceReady && (
                  <p className="notice" role="status">
                    Reference: {reference.document.name}
                  </p>
                )}
              </div>
            )}
            <p className="helper">
              {readyNotes.length} ready study documents in this notebook.{" "}
              {notebookId && !readyNotes.length && (
                <Link
                  to={`/documents?course=${courseId}&notebook=${notebookId}`}
                >
                  Upload study notes first.
                </Link>
              )}
            </p>
            <div className="inline-actions">
              <button
                className="button primary"
                disabled={
                  generate.isPending ||
                  !title.trim() ||
                  !validScope ||
                  !readyNotes.length ||
                  (mode === "reference" && !referenceReady)
                }
              >
                <Sparkles size={16} />
                {generate.isPending ? "Generating…" : "Generate test"}
              </button>
              <button
                type="button"
                className="button"
                disabled={generate.isPending}
                onClick={() => setCreating(false)}
              >
                Cancel
              </button>
            </div>
            <QueryState error={generate.error} />
          </form>
        </Modal>
      )}
      {selectedId ? (
        <>
          <button className="button" onClick={() => setSelectedId("")}>
            <ArrowLeft size={16} /> All tests
          </button>
          <TestPreview key={selectedId} id={selectedId} />
        </>
      ) : (
        !tests.isPending &&
        !tests.error && (
          <section className="panel">
            <div className="section-heading">
              <h2>Your tests</h2>
              <span>{tests.data?.length ?? 0} tests</span>
            </div>
            {tests.data?.map((test) => (
              <div className="document-row" key={test.id}>
                <span className="file-icon">
                  <FileText size={20} />
                </span>
                <button
                  className="document-info test-open"
                  onClick={() => setSelectedId(test.id)}
                >
                  <strong>{test.title ?? "Untitled test"}</strong>
                  <small>
                    {test.referenceFileId
                      ? "Based on a sample test"
                      : "Generated practice"}{" "}
                    · {new Date(test.createdAt).toLocaleDateString()}
                  </small>
                </button>
                <button
                  className="icon-button"
                  aria-label={`Delete ${test.title ?? "test"}`}
                  onClick={() => {
                    remove.reset();
                    setConfirm(test.id);
                  }}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            {!tests.data?.length && (
              <p className="empty">
                No tests yet. Choose a notebook to create your first practice
                test.
              </p>
            )}
            {confirm && (
              <div className="notice" role="alert">
                <p>Delete this generated test?</p>
                <div className="inline-actions">
                  <button
                    className="button danger"
                    disabled={remove.isPending}
                    onClick={() =>
                      remove.mutate(confirm, {
                        onSuccess: () => setConfirm(null),
                      })
                    }
                  >
                    Delete test
                  </button>
                  <button
                    className="button"
                    disabled={remove.isPending}
                    onClick={() => setConfirm(null)}
                  >
                    Cancel
                  </button>
                </div>
                <QueryState error={remove.error} />
              </div>
            )}
          </section>
        )
      )}
    </>
  );
};

export default TestsPage;
