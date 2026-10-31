import { WorkspaceContext } from "../hooks/useWorkspace";
import { useStudyData, useStudyMutation } from "../hooks/useStudyQueries";
import {
  createCourse,
  createNotebook,
  deleteDocument,
  getSampleExcerpt,
  uploadDocument,
} from "../lib/studyApi";
import { formatFileSize } from "../lib/utils";
import QueryState from "./QueryState";
import type { ChildrenProps } from "../types/study";

/**
 * Compatibility view model for the unchanged study assistant and sample quiz.
 * Names/content/size are presentation fields, not API DTOs. All source records
 * come from the same TanStack cache as courses/documents. Backend Document has
 * no extracted content response; sample excerpts stay behind getSampleExcerpt.
 */
const WorkspaceProvider = ({ children }: ChildrenProps) => {
  const data = useStudyData();
  const courseMutation = useStudyMutation(createCourse);
  const notebookMutation = useStudyMutation(createNotebook);
  const uploadMutation = useStudyMutation(uploadDocument);
  const deleteMutation = useStudyMutation(deleteDocument);
  if (data.isPending || data.error)
    return (
      <QueryState
        pending={data.isPending}
        error={data.error}
        retry={data.refetch}
      />
    );
  return (
    <WorkspaceContext.Provider
      value={{
        courses: data.courses.map((course) => ({
          id: course.id,
          name: course.name,
          code: course.code ?? "",
          color: "sage",
          description: course.semester ?? "",
          notebooks: data.notebooks
            .filter((notebook) => notebook.courseId === course.id)
            .map((notebook) => notebook.noteBookName),
        })),
        documents: data.documents.map((document) => ({
          id: document.id,
          name: document.name,
          courseId: document.courseId ?? "",
          notebook:
            data.notebooks.find(
              (notebook) => notebook.id === document.notebookId,
            )?.noteBookName ?? "Unassigned",
          size: formatFileSize(document.fileSize),
          uploaded: document?.r2Key?.startsWith("samples/")
            ? "Sample material"
            : "Added locally",
          content: getSampleExcerpt(document.id),
        })),
        addCourse: (name) =>
          courseMutation.mutate({ name, code: null, semester: null }),
        addNotebook: (courseId, noteBookName) =>
          notebookMutation.mutate({ courseId, noteBookName }),
        addDocument: (file, courseId, notebook) => {
          const notebookId = data.notebooks.find(
            (item) =>
              item.courseId === courseId && item.noteBookName === notebook,
          )?.id;
          if (notebookId) uploadMutation.mutate({ file, courseId, notebookId });
        },
        removeDocument: (id) => deleteMutation.mutate(id),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;
