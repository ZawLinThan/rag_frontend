import type { Document } from "../types";

export function readyDocumentsInScope(
  documents: Document[],
  courseId: string,
  notebookId: string,
  fileId: string,
): Document[] {
  return documents.filter(
    (document) =>
      document.status === "ready" &&
      document.courseId === courseId &&
      (!notebookId || document.notebookId === notebookId) &&
      (!fileId || document.id === fileId),
  );
}
