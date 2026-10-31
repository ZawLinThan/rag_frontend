import { SortableCards, SortableCard } from "../components/SortableCards";
import { useCardOrderStore } from "../stores/cardOrderStore";
import { useAuthStore } from "../stores/authStore";
import { reorderIds } from "../lib/reorder";
import StudyRecordActions from "../components/StudyRecordActions";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Sparkles, FolderOpen, ArrowLeft, Plus } from "lucide-react";
import {
  studyQueries,
  useStudyData,
  useStudyMutation,
} from "../hooks/useStudyQueries";
import { createNotebook } from "../lib/studyApi";
import PageHeading from "../components/PageHeading";
import QueryState from "../components/QueryState";
import DocumentList from "../components/DocumentList";
import FileUpload from "../components/FileUpload";
import Modal from "../components/Modal";

const CoursePage = () => {
  const { courseId } = useParams();
  const data = useStudyData();
  const userId = useAuthStore((state) => state.user?.id);
  const { notebooks: notebookOrders, setNotebooks } = useCardOrderStore(
    userId ?? "anonymous",
  );
  const create = useStudyMutation(createNotebook);
  const [selected, setSelected] = useState("");
  const [name, setName] = useState("");
  const [creatingNotebook, setCreatingNotebook] = useState(false);
  const course = data.courses.find((item) => item.id === courseId);
  const notebookQuery = useQuery(studyQueries.courseNotebooks(courseId ?? ""));
  const order = notebookOrders[courseId ?? ""] ?? [];
  const notebooks = [...(notebookQuery.data ?? [])].sort((a, b) => {
    const left = order.indexOf(a.id);
    const right = order.indexOf(b.id);
    return (
      (left < 0 ? Number.MAX_SAFE_INTEGER : left) -
      (right < 0 ? Number.MAX_SAFE_INTEGER : right)
    );
  });
  const moveNotebook = (from: string, to: string) => {
    setSelected(notebookId);
    if (courseId)
      setNotebooks(
        courseId,
        reorderIds(
          notebooks.map((item) => item.id),
          from,
          to,
        ),
      );
  };
  const notebookId = notebooks.some((notebook) => notebook.id === selected)
    ? selected
    : (notebooks[0]?.id ?? "");
  const notebook = notebooks.find((item) => item.id === notebookId);
  const documentQuery = useQuery(studyQueries.notebookDocuments(notebookId));

  if (
    data.isPending ||
    data.error ||
    notebookQuery.isLoading ||
    notebookQuery.error
  )
    return (
      <QueryState
        pending={data.isPending || notebookQuery.isLoading}
        error={data.error ?? notebookQuery.error}
        retry={() => {
          void data.refetch();
          void notebookQuery.refetch();
        }}
      />
    );

  if (!course)
    return (
      <div className="empty">
        Course not found. <Link to="/courses">Back to courses</Link>
      </div>
    );

  return (
    <>
      <Link className="back-link" to="/courses">
        <ArrowLeft size={16} /> My courses
      </Link>
      <PageHeading
        title={course.name}
        description={[course.code, course.semester].filter(Boolean).join(" · ")}
        action={
          <Link className="button primary" to={`/chat?course=${course.id}`}>
            <Sparkles size={17} /> Ask this course
          </Link>
        }
      />
      <div className="notebook-create-action">
        <button
          type="button"
          className="button"
          onClick={() => {
            create.reset();
            setCreatingNotebook(true);
          }}
        >
          <Plus size={16} /> New notebook
        </button>
      </div>
      {creatingNotebook && (
        <Modal
          title="Create a notebook"
          busy={create.isPending}
          onClose={() => setCreatingNotebook(false)}
        >
          <form
            className="inline-form"
            onSubmit={(event) => {
              event.preventDefault();
              create.mutate(
                { courseId: course.id, noteBookName: name },
                {
                  onSuccess: (created) => {
                    setSelected(created.id);
                    setName("");
                    setCreatingNotebook(false);
                  },
                },
              );
            }}
          >
            <label>
              New notebook
              <input
                required
                maxLength={255}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Week 5 lecture notes"
              />
            </label>
            <button
              className="button"
              disabled={create.isPending || !name.trim()}
            >
              <Plus size={16} />
              {create.isPending ? "Creating…" : "Create notebook"}
            </button>
            <button
              type="button"
              className="button"
              disabled={create.isPending}
              onClick={() => setCreatingNotebook(false)}
            >
              Cancel
            </button>
            {create.error && (
              <p className="error" role="alert">
                {create.error.message}
              </p>
            )}
          </form>
        </Modal>
      )}
      <SortableCards
        ids={notebooks.map((item) => item.id)}
        grid
        onMove={moveNotebook}
      >
        <div className="notebook-grid">
          {notebooks.map((item) => (
            <SortableCard
              className="notebook-tile"
              key={item.id}
              id={item.id}
              label={item.noteBookName}
            >
              {(handle) => (
                <>
                  <button
                    aria-pressed={notebookId === item.id}
                    className={`panel notebook ${notebookId === item.id ? "selected" : ""}`}
                    onClick={() => setSelected(item.id)}
                  >
                    <FolderOpen size={25} />
                    <h3>{item.noteBookName}</h3>
                    <p>
                      {
                        data.documents.filter(
                          (document) => document.notebookId === item.id,
                        ).length
                      }{" "}
                      documents
                    </p>
                  </button>
                  <div className="notebook-tile-actions">
                    {handle}
                    <StudyRecordActions
                      kind="notebook"
                      id={item.id}
                      name={item.noteBookName}
                    />
                  </div>
                </>
              )}
            </SortableCard>
          ))}
        </div>
      </SortableCards>
      {!notebooks.length ? (
        <p className="empty">
          Create a notebook to start adding documents to this course.
        </p>
      ) : (
        <>
          <div className="section-heading">
            <h2>{notebook?.noteBookName}</h2>
            <div className="inline-actions">
              <Link
                className="text-link"
                to={`/tests?course=${course.id}&notebook=${notebookId}`}
              >
                Create a test
              </Link>
              <Link
                className="text-link"
                to={`/flashcards?course=${course.id}`}
              >
                Create flashcards
              </Link>
            </div>
          </div>
          <FileUpload
            key={notebookId}
            courseId={course.id}
            notebookId={notebookId}
          />
          {documentQuery.isLoading || documentQuery.error ? (
            <QueryState
              pending={documentQuery.isLoading}
              error={documentQuery.error}
              retry={() => void documentQuery.refetch()}
            />
          ) : (
            <DocumentList
              documents={documentQuery.data ?? []}
              courses={data.courses}
              notebooks={notebooks}
            />
          )}
          <Link
            className="button"
            to={`/chat?course=${course.id}&notebook=${encodeURIComponent(notebookId)}`}
          >
            Ask this notebook <Sparkles size={16} />
          </Link>
        </>
      )}
    </>
  );
};

export default CoursePage;
