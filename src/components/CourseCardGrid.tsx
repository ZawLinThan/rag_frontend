import { useCardOrderStore } from "../stores/cardOrderStore";
import { SortableCards, SortableCard } from "./SortableCards";
import { useAuthStore } from "../stores/authStore";
import type { Course, Document, NoteBook } from "../types";
import CourseCard from "./CourseCard";
import { reorderIds } from "../lib/reorder";

export default function CourseCardGrid({
  courses,
  documents,
  notebooks,
  search = "",
  limit,
}: {
  courses: Course[];
  documents: Document[];
  notebooks: NoteBook[];
  search?: string;
  limit?: number;
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const { courses: order, setCourses } = useCardOrderStore(
    userId ?? "anonymous",
  );
  const ordered = [...courses].sort((a, b) => {
    const left = order.indexOf(a.id);
    const right = order.indexOf(b.id);
    return (
      (left < 0 ? Number.MAX_SAFE_INTEGER : left) -
      (right < 0 ? Number.MAX_SAFE_INTEGER : right)
    );
  });
  const matching = ordered.filter((course) =>
    `${course.name} ${course.code ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const visible = limit ? matching.slice(0, limit) : matching;
  const move = (fromId: string, toId: string) => {
    const current = ordered.map((item) => item.id);
    const ids = reorderIds(current, fromId, toId);
    if (ids !== current) setCourses(ids);
  };
  return (
    <SortableCards ids={visible.map((course) => course.id)} grid onMove={move}>
      <div className="course-grid">
        {visible.map((course) => (
          <SortableCard
            key={course.id}
            id={course.id}
            label={course.name}
            className="reorderable-course"
          >
            {(handle) => (
              <>
                <CourseCard
                  course={course}
                  documentCount={
                    documents.filter(
                      (document) => document.courseId === course.id,
                    ).length
                  }
                  notebookCount={
                    notebooks.filter(
                      (notebook) => notebook.courseId === course.id,
                    ).length
                  }
                />
                <div className="course-order-controls">{handle}</div>
              </>
            )}
          </SortableCard>
        ))}
      </div>
    </SortableCards>
  );
}
