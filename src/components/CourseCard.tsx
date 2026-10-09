import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course } from "../types";

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
      <span className="course-code">{course.code ?? "COURSE"}</span>
      <h3>{course.name}</h3>
      <p>{course.semester ?? "Your study workspace"}</p>
      <div className="course-card-bottom">
        <span>
          <FileText size={14} />
          {documentCount} documents
        </span>
        <span>{notebookCount} notebooks</span>
      </div>
    </Link>
  );
};

export default CourseCard;
