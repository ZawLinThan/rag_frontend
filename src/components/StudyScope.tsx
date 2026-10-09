import type { Course, NoteBook } from "../types";

/** Shared controlled selection. A course switch always clears the notebook ID. */
const StudyScope = ({
  courses,
  notebooks,
  courseId,
  notebookId,
  onChange,
  disabled = false,
}: {
  courses: Course[];
  notebooks: NoteBook[];
  courseId: string;
  notebookId: string;
  onChange: (courseId: string, notebookId: string) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="upload-controls">
      <label>
        Course
        <select
          required
          disabled={disabled}
          value={courseId}
          onChange={(event) => onChange(event.target.value, "")}
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Notebook
        <select
          required
          disabled={disabled || !courseId}
          value={notebookId}
          onChange={(event) => onChange(courseId, event.target.value)}
        >
          <option value="">Select a notebook</option>
          {notebooks
            .filter((notebook) => notebook.courseId === courseId)
            .map((notebook) => (
              <option key={notebook.id} value={notebook.id}>
                {notebook.noteBookName}
              </option>
            ))}
        </select>
      </label>
    </div>
  );
};

export default StudyScope;
