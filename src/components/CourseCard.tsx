import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { Course } from "../types";

export function CourseCardContent({
  code,
  name,
  semester,
  documents,
  notebooks,
}: {
  code: ReactNode;
  name: ReactNode;
  semester: ReactNode;
  documents: ReactNode;
  notebooks: ReactNode;
}) {
  return (
    <>
      <span className="course-code">{code}</span>
      <h3>{name}</h3>
      <p>{semester}</p>
      <div className="course-card-bottom">
        <span>
          <FileText size={14} />
          {documents}
        </span>
        <span>{notebooks}</span>
      </div>
    </>
  );
}

const CourseCard = ({
  course,
  documentCount = 0,
  notebookCount = 0,
}: {
  course: Course;
  documentCount?: number;
  notebookCount?: number;
}) => {
  return (
    <Link to={`/courses/${course.id}`} className="course-card sage">
      <CourseCardContent
        code={course.code ?? "COURSE"}
        name={course.name}
        semester={course.semester ?? "Your study workspace"}
        documents={`${documentCount} ${documentCount === 1 ? "document" : "documents"}`}
        notebooks={`${notebookCount} ${notebookCount === 1 ? "notebook" : "notebooks"}`}
      />
    </Link>
  );
};

export default CourseCard;
