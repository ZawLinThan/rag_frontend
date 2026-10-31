import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import * as api from "../lib/studyApi";
import type {
  Course,
  NoteBook,
  Document,
  FlashcardSet,
  Flashcard,
  Test,
  UploadResult,
} from "../types";

/** One cache namespace, shared by every screen and the chat compatibility view. */
export const studyKeys = {
  all: ["study"] as const,
  courses: ["study", "courses"] as const,
  notebooks: ["study", "notebooks"] as const,
  courseNotebooks: (id: string) => ["study", "course-notebooks", id] as const,
  documents: ["study", "documents"] as const,
  notebookDocuments: (id: string) =>
    ["study", "notebook-documents", id] as const,
  document: (id: string) => ["study", "document", id] as const,
  sets: ["study", "flashcard-sets"] as const,
  cards: (id: string) => ["study", "flashcards", id] as const,
  tests: ["study", "tests"] as const,
  test: (id: string) => ["study", "test", id] as const,
  testContent: (id: string) => ["study", "test-content", id] as const,
};
export const studyQueries = {
  courses: () =>
    queryOptions({ queryKey: studyKeys.courses, queryFn: api.getCourses }),
  notebooks: () =>
    queryOptions({ queryKey: studyKeys.notebooks, queryFn: api.getNotebooks }),
  courseNotebooks: (id: string) =>
    queryOptions({
      queryKey: studyKeys.courseNotebooks(id),
      queryFn: () => api.getNotebooksByCourseId(id),
      enabled: !!id,
    }),
  notebookDocuments: (id: string) =>
    queryOptions({
      queryKey: studyKeys.notebookDocuments(id),
      queryFn: () => api.getDocumentsByNotebookId(id),
      enabled: !!id,
      refetchInterval: (query) =>
        query.state.data?.some((document) =>
          ["pending", "queued", "processing"].includes(document.status),
        )
          ? 2000
          : false,
    }),
  documents: () =>
    queryOptions({
      queryKey: studyKeys.documents,
      queryFn: api.getDocuments,
      refetchInterval: (query) =>
        query.state.data?.some(
          (document) =>
            document.status === "pending" || document.status === "processing",
        )
          ? 2000
          : false,
    }),
  document: (id: string) =>
    queryOptions({
      queryKey: studyKeys.document(id),
      queryFn: () => api.getDocumentById(id),
      enabled: !!id,
      refetchInterval: (query) =>
        query.state.data?.status === "pending" ||
        query.state.data?.status === "processing"
          ? 2000
          : false,
    }),
  sets: () =>
    queryOptions({ queryKey: studyKeys.sets, queryFn: api.getFlashcardSets }),
  cards: (id: string) =>
    queryOptions({
      queryKey: studyKeys.cards(id),
      queryFn: () => api.getFlashcards(id),
      enabled: !!id,
    }),
  tests: () =>
    queryOptions({ queryKey: studyKeys.tests, queryFn: api.getTests }),
  test: (id: string) =>
    queryOptions({
      queryKey: studyKeys.test(id),
      queryFn: () => api.getTest(id),
      enabled: !!id,
    }),
  testContent: (id: string) =>
    queryOptions({
      queryKey: studyKeys.testContent(id),
      queryFn: () => api.getTestContent(id),
      enabled: !!id,
    }),
};
export const useStudyData = () => {
  const courses = useQuery(studyQueries.courses());
  const notebooks = useQuery(studyQueries.notebooks());
  const documents = useQuery(studyQueries.documents());
  return {
    courses: courses.data ?? [],
    notebooks: notebooks.data ?? [],
    documents: documents.data ?? [],
    isPending: courses.isPending || notebooks.isPending || documents.isPending,
    error: courses.error ?? notebooks.error ?? documents.error,
    refetch: () =>
      Promise.all([
        courses.refetch(),
        notebooks.refetch(),
        documents.refetch(),
      ]),
  };
};
/**
 * Reconcile successful writes immediately, before dependent queries refetch.
 * Failed writes never reach this function, so the previous cache stays intact.
 * @param client - Shared TanStack client.
 * @param mutationFn - Adapter used to identify delete/reset operations.
 * @param input - Submitted identifiers and fields.
 * @param result - Confirmed server response (or the equivalent sample response).
 */
export const reconcileStudyMutation = <TInput, TResult>(
  client: QueryClient,
  mutationFn: (input: TInput) => Promise<TResult>,
  input: TInput,
  result: TResult,
) => {
  const operation: unknown = mutationFn;
  const upsert = <T extends { id: string }>(
    key: readonly string[],
    record: T,
  ) => {
    client.setQueryData<T[]>(key, (previous) =>
      previous
        ? previous.some((item) => item.id === record.id)
          ? previous.map((item) => (item.id === record.id ? record : item))
          : [...previous, record]
        : undefined,
    );
  };

  if (operation === api.deleteDocument) {
    const id = input as string;
    client.setQueryData<Document[]>(studyKeys.documents, (previous) =>
      previous?.filter((item) => item.id !== id),
    );
    client.setQueryData<FlashcardSet[]>(studyKeys.sets, (previous) =>
      previous?.map((set) =>
        set.documentId === id ? { ...set, documentId: null } : set,
      ),
    );
    client.removeQueries({ queryKey: studyKeys.document(id), exact: true });
    return;
  }

  if (operation === api.deleteFlashcardSet) {
    const id = input as string;
    client.setQueryData<FlashcardSet[]>(studyKeys.sets, (previous) =>
      previous?.filter((item) => item.id !== id),
    );
    client.removeQueries({ queryKey: studyKeys.cards(id), exact: true });
    return;
  }

  if (operation === api.deleteFlashcard) {
    const { setId, id } = input as { setId: string; id: string };
    client.setQueryData<Flashcard[]>(studyKeys.cards(setId), (previous) =>
      previous?.filter((item) => item.id !== id),
    );
    return;
  }

  if (operation === api.deleteTest) {
    const id = input as string;
    client.setQueryData<Test[]>(studyKeys.tests, (previous) =>
      previous?.filter((item) => item.id !== id),
    );
    client.removeQueries({ queryKey: studyKeys.test(id), exact: true });
    client.removeQueries({ queryKey: studyKeys.testContent(id), exact: true });
    return;
  }

  // Record shape also supports adapters wrapped by components (e.g. card editing).
  const record = result as
    | Course
    | NoteBook
    | Document
    | FlashcardSet
    | Flashcard
    | Test
    | UploadResult;
  if (!record || typeof record !== "object") return;

  if ("document" in record) {
    upsert(studyKeys.documents, record.document);
    client.setQueryData(
      studyKeys.document(record.document.id),
      record.document,
    );
  } else if ("r2Key" in record) {
    upsert(studyKeys.documents, record);
    client.setQueryData(studyKeys.document(record.id), record);
  } else if ("setId" in record) {
    upsert(studyKeys.cards(record.setId), record);
  } else if ("noteBookName" in record) {
    upsert(studyKeys.notebooks, record);
  } else if ("documentId" in record) {
    upsert(studyKeys.sets, record);
  } else if ("referenceFileId" in record) {
    upsert(studyKeys.tests, record);
    client.setQueryData(studyKeys.test(record.id), record);
  } else {
    upsert(studyKeys.courses, record);
  }
};

/**
 * Apply successful mutation responses to the shared cache, then refetch dependencies.
 * Current study actions create/edit/delete records and reconcile after success.
 * @param mutationFn - API adapter returning the persisted record or void for deletes.
 * @returns TanStack mutation state and execution methods.
 */
export const useStudyMutation = <TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (result, input) => {
      reconcileStudyMutation(client, mutationFn, input, result);
      // Broad invalidation is deliberate: document/deck changes affect counts,
      // notebook scopes, chat sources, lists, details, and generated resources.
      await client.invalidateQueries({ queryKey: studyKeys.all });
    },
  });
};
