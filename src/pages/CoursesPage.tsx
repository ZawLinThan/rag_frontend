import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useStudyData, useStudyMutation } from "../hooks/useStudyQueries";
import { createCourse } from "../lib/studyApi";
import CourseCardGrid from "../components/CourseCardGrid";
import PageHeading from "../components/PageHeading";
import QueryState from "../components/QueryState";
import Modal from "../components/Modal";

const CoursesPage = () => {
  const data = useStudyData();
  const create = useStudyMutation(createCourse);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [semester, setSemester] = useState("");
  const visible = data.courses.filter((course) =>
    `${course.name} ${course.code ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="My courses"
        description="Organize each course into notebooks, then bring your notes to life."
        action={
          <button
            className="button primary"
            onClick={() => {
              create.reset();
              setCreating(true);
            }}
          >
            <Plus size={17} /> New course
          </button>
        }
      />
      {creating && (
        <Modal
          title="Create a course"
          busy={create.isPending}
          onClose={() => setCreating(false)}
        >
          <form
            className="panel inline-form"
            onSubmit={(event) => {
              event.preventDefault();
              create.mutate(
                { name, code: code || null, semester: semester || null },
                {
                  onSuccess: () => {
                    setName("");
                    setCode("");
                    setSemester("");
                    setCreating(false);
                  },
                },
              );
            }}
          >
            <label>
              Course name
              <input
                required
                maxLength={255}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Organic Chemistry"
              />
            </label>
            <label>
              Course code (optional)
              <input
                maxLength={50}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="CHEM 201"
              />
            </label>
            <label>
              Semester (optional)
              <input
                maxLength={50}
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                placeholder="Fall 2026"
              />
            </label>
            <button
              className="button primary"
              disabled={create.isPending || !name.trim()}
            >
              {create.isPending ? "Creating…" : "Create course"}
            </button>
            <button
              type="button"
              className="button"
              disabled={create.isPending}
              onClick={() => setCreating(false)}
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
      <QueryState
        pending={data.isPending}
        error={data.error}
        retry={data.refetch}
      />
      {!data.isPending && !data.error && (
        <>
          <div className="search-field">
            <Search size={18} />
            <input
              aria-label="Search courses"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your courses…"
            />
          </div>
          <CourseCardGrid
            courses={data.courses}
            documents={data.documents}
            notebooks={data.notebooks}
            search={search}
          />
          {!visible.length && (
            <p className="empty">
              {data.courses.length
                ? "No courses match your search."
                : "Create your first course, then add a notebook for your notes."}
            </p>
          )}
        </>
      )}
    </>
  );
};

export default CoursesPage;
