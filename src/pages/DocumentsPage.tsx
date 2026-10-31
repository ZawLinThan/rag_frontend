import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useStudyData } from "../hooks/useStudyQueries";
import PageHeading from "../components/PageHeading";
import QueryState from "../components/QueryState";
import StudyScope from "../components/StudyScope";
import FileUpload from "../components/FileUpload";
import DocumentList from "../components/DocumentList";

const DocumentsPage = () => {
  const data = useStudyData();
  const [params] = useSearchParams();
  const [courseId, setCourseId] = useState(params.get("course") ?? "");
  const [notebookId, setNotebookId] = useState(params.get("notebook") ?? "");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(params.get("course") ?? "");
  const selectedCourse = data.courses.some((course) => course.id === courseId)
    ? courseId
    : (data.courses[0]?.id ?? "");
  const scopedNotebooks = data.notebooks.filter(
    (notebook) => notebook.courseId === selectedCourse,
  );
  const selectedNotebook = scopedNotebooks.some(
    (notebook) => notebook.id === notebookId,
  )
    ? notebookId
    : (scopedNotebooks[0]?.id ?? "");
  return (
    <>
      <PageHeading
        title="My documents"
        description="Store your lecture notes, readings, and sample tests in course notebooks."
      />
      <QueryState
        pending={data.isPending}
        error={data.error}
        retry={data.refetch}
      />
      {!data.isPending && !data.error && (
        <>
          <section className="panel upload-panel">
            <StudyScope
              courses={data.courses}
              notebooks={data.notebooks}
              courseId={selectedCourse}
              notebookId={selectedNotebook}
              onChange={(course, notebook) => {
                setCourseId(course);
                setNotebookId(notebook);
              }}
            />
            <FileUpload
              key={`${selectedCourse}-${selectedNotebook}`}
              courseId={selectedCourse}
              notebookId={selectedNotebook}
            />
          </section>
          <div className="toolbar">
            <div className="search-field">
              <Search size={18} />
              <input
                aria-label="Search documents"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search documents…"
              />
            </div>
            <select
              aria-label="Filter documents by course"
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
          <DocumentList
            documents={data.documents.filter(
              (document) =>
                (!filter || document.courseId === filter) &&
                document?.name?.toLowerCase().includes(search.toLowerCase()),
            )}
            courses={data.courses}
            notebooks={data.notebooks}
          />
        </>
      )}
    </>
  );
};

export default DocumentsPage;
