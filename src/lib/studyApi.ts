import {
  sampleCourses,
  sampleDocuments,
  sampleNotebooks,
  studyCards,
  sampleWorkspace,
} from "../data/sampleData";
import { uploadSchema } from "../zodSchema/studySchema";
import type {
  CardInput,
  Course,
  CreateCourseInput,
  CreateNotebookInput,
  CreateSetInput,
  Document,
  Flashcard,
  FlashcardSet,
  GenerateFlashcardsInput,
  GenerateTestInput,
  NoteBook,
  SuccessfulPresignedUrlResponse,
  Test,
  TestContent,
  UploadInput,
  UploadResult,
} from "../types";
import api from "./axios";
import axios from "axios";

/**
 * Transport contracts use raw JSON records/arrays and ISO timestamp strings.
 * Uncomment each pending request and remove its sample branch when implemented.
 * confirmation uses local sample data.
 * Sample mutations persist until reset/reload and return detached records.
 */
/** Detach sample records from the mutable sample store. */
const clone = <T>(value: T): T => structuredClone(value);
/** Resolve a cloned sample payload in the same shape as a backend response. */
const response = async <T>(value: T): Promise<T> => clone(value);
/** Create an ISO timestamp matching serialized backend dates. */
const timestamp = () => new Date().toISOString();
const userId = "sample-user";
let courses = clone(sampleCourses);
let notebooks = clone(sampleNotebooks);
let documents = clone(sampleDocuments);
let sets: FlashcardSet[] = [];
let cards: Flashcard[] = [];
let tests: Test[] = [];
let contents: TestContent[] = [];
const referenceUrls = new Map<string, string>();

/** Build a sample card with scheduling defaults. */
const makeCard = (setId: string, input: CardInput): Flashcard => {
  const now = timestamp();
  return {
    id: crypto.randomUUID(),
    setId,
    ...input,
    sourceChunkId: null,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewAt: now,
    createdAt: now,
    updatedAt: now,
  };
};

/** Seed local decks and their cards from the sample course material. */
const seedSets = () => {
  sets = courses.map((course) => ({
    id: `sample-set-${course.id}`,
    userId,
    title: `${course.name} essentials`,
    courseId: course.id,
    documentId:
      documents.find((document) => document.courseId === course.id)?.id ?? null,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  }));
  cards = sets.flatMap((set) =>
    studyCards
      .filter((card) => card.courseId === set.courseId)
      .map((card) =>
        makeCard(set.id, { front: card.question, back: card.answer }),
      ),
  );
};
seedSets();
/** Find a sample record or reject a missing resource. */
const requireRecord = <T extends { id: string }>(
  items: T[],
  id: string,
  label: string,
): T => {
  const item = items.find((record) => record.id === id);
  if (!item) throw new Error(`${label} not found.`);
  return item;
};

/** Validate and trim a sample text field. */
const requireText = (text: string, max: number, label: string) => {
  if (!text.trim() || text.trim().length > max)
    throw new Error(`${label} must be between 1 and ${max} characters.`);
  return text.trim();
};

/**
 * List the authenticated user’s courses.
 * @returns Raw Course[] response with no envelope.
 */
export const getCourses = async (): Promise<Course[]> => {
  const { data } = await api.get<Course[]>(`/api/courses`);
  return data;

  return response(courses);
};

/**
 * List the authenticated user’s notebooks.
 * @returns Raw NoteBook[] response with no envelope.
 */
export const getNotebooks = async (): Promise<NoteBook[]> => {
  const { data } = await api.get<NoteBook[]>(`/api/notebooks`);
  return data;
};

/**
 * List notebooks belonging to the specified course.
 * @param id - Resource identifier.
 * @returns Raw NoteBook[] response with no envelope.
 */
export const getNotebooksByCourseId = async (
  id: string,
): Promise<NoteBook[]> => {
  const { data } = await api.get<NoteBook[]>(`/api/notebooks`, {
    params: { courseId: id },
  });
  return data;
};

/**
 * List document metadata and ingestion statuses.
 * @returns Raw Document[] response with no envelope.
 */
export const getDocuments = async (): Promise<Document[]> => {
  const { data } = await api.get<Document[]>(`/api/documents`);
  return data;
};

export const getDocumentsByNotebookId = async (
  id: string,
): Promise<Document[]> => {
  const { data } = await api.get<Document[]>("/api/documents", {
    params: { notebookId: id },
  });
  return data;
};

/**
 * Read one owned document and its ingestion status.
 * @param id - Resource identifier.
 * @returns Raw Document response with no envelope.
 */
export const getDocumentById = async (id: string): Promise<Document> => {
  const { data } = await api.get<Document>(
    `/api/documents/${encodeURIComponent(id)}`,
  );
  return data;
};

export const getDocumentFile = async (id: string): Promise<Blob> => {
  const { data } = await api.get<Blob>(
    `/api/documents/${encodeURIComponent(id)}/file`,
    { responseType: "blob" },
  );
  return data;
};

/**
 * Create a course and return the persisted record.
 * @param input - Name, optional code, and semester.
 * @returns The created Course record.
 */
export const createCourse = async (
  input: CreateCourseInput,
): Promise<Course> => {
  const { data } = await api.post<Course>("/api/courses", input);
  return data;

  return null;
};

/**
 * Create a notebook within an owned course.
 * @param input - Notebook name and course ID.
 * @returns The created notebook.
 */
export const createNotebook = async (
  input: CreateNotebookInput,
): Promise<NoteBook> => {
  const { data } = await api.post<NoteBook>("/api/notebooks", input);
  return data;

  const name = requireText(input.noteBookName, 255, "Notebook name");
  if (
    notebooks.some(
      (item) =>
        item.courseId === input.courseId &&
        item.noteBookName.toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw new Error("That notebook already exists in this course.");
  }
  return null;
};

/**
 * Request a live presigned R2 upload URL.
 * @param file - File name, MIME type, and byte size sent to the signing endpoint.
 * @returns Upload URL, object key, public URL, and expiry in seconds.
 */
export const getPresignedUrl = async (
  file: File,
): Promise<SuccessfulPresignedUrlResponse> => {
  const { data } = await api.post<SuccessfulPresignedUrlResponse>(
    "/api/documents/presign",
    {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    },
  );

  return data;
};

/**
 * Validate notebook scope, request a live presign, and PUT the file directly to R2.
 * Confirmation is pending: uncomment its request and remove the sample branch later.
 * @param input - File and selected course/notebook identifiers.
 * @returns Created document metadata and its reference URL.
 */
export const uploadDocument = async (
  input: UploadInput,
): Promise<UploadResult> => {
  const validation = uploadSchema.safeParse({
    name: input.file.name,
    size: input.file.size,
    courseId: input.courseId,
    notebookId: input.notebookId,
  });

  if (!validation.success)
    throw new Error("Choose a non-empty PDF, DOCX, or TXT file up to 20 MB.");

  const signed = await getPresignedUrl(input.file);

  // upload to R2
  try {
    await axios.put(signed.uploadUrl, input.file, {
      headers: {
        "Content-Type": input.file.type,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Upload failed: ${error.response?.status ?? error.message}`,
      );
    }
    throw error;
  }

  const res = await api.post<{ documentId: string; status: string }>(
    "/api/documents/confirm",
    {
      name: input.file.name,
      originalName: input.file.name,
      r2Key: signed.key,
      fileType: input.file.type,
      fileSize: input.file.size,
      courseId: input.courseId,
      notebookId: input.notebookId,
    },
  );
  return { document: await getDocumentById(res.data.documentId) };
};

/**
 * Rename a document without changing its R2 object key.
 * @param input - Document ID and new display name.
 * @returns Updated document metadata.
 */
export const renameDocument = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}): Promise<Document> => {
  const { data } = await api.patch<Document>(
    `/api/documents/${encodeURIComponent(id)}`,
    { name },
  );
  return data;

  const document = requireRecord(documents, id, "Document");
  document.name = requireText(name, 255, "Document name");
  document.updatedAt = timestamp();
  return response(document);
};

/**
 * Delete a document and its stored artifacts; reject referenced test files.
 * @param id - Owned document ID.
 * @returns No body (204).
 */
export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/api/documents/${encodeURIComponent(id)}`);
  return;
};

/**
 * List owned flashcard sets.
 * @returns Raw FlashcardSet array.
 */
export const getFlashcardSets = async (): Promise<FlashcardSet[]> => {
  // const { data } = await api.get<FlashcardSet[]>("/api/flashcards");
  // return data;

  return response(sets);
};

/**
 * List cards in an owned set.
 * @param setId - Parent set identifier.
 * @returns Raw Flashcard array.
 */
export const getFlashcards = async (setId: string): Promise<Flashcard[]> => {
  // const { data } = await api.get<Flashcard[]>(
  //   `/api/flashcards/${encodeURIComponent(setId)}`,
  // );
  // return data;

  requireRecord(sets, setId, "Deck");
  return response(cards.filter((card) => card.setId === setId));
};

/**
 * Create an empty manual flashcard set.
 * @param input - Title and optional course ID.
 * @returns Created flashcard set.
 */
export const createFlashcardSet = async (
  input: CreateSetInput,
): Promise<FlashcardSet> => {
  // const { data } = await api.post<FlashcardSet>("/api/flashcards", input);
  // return data;
  return null;
};

/**
 * Generate and persist cards from a ready course document.
 * @param input - Title, course ID, document ID, and count.
 * @returns Created set metadata; cards are fetched separately.
 */
export const generateFlashcards = async (
  input: GenerateFlashcardsInput,
): Promise<FlashcardSet> => {
  // const { data } = await api.post<FlashcardSet>("/api/flashcards/generate", input);
  // return data;
  return null;
};

/**
 * Add a manual card to an owned set.
 * @param input - Set ID, question, and answer.
 * @returns Created card with scheduling defaults.
 */
export const addFlashcard = async ({
  setId,
  ...input
}: CardInput & { setId: string }): Promise<Flashcard> => {
  // const { data } = await api.post<Flashcard>(
  //   `/api/flashcards/${encodeURIComponent(setId)}/cards`,
  //   input,
  // );
  // return data;
  return null;
};

/**
 * Update a card’s question and answer.
 * @param input - Set ID, card ID, question, and answer.
 * @returns Updated card.
 */
export const updateFlashcard = async ({
  setId,
  id,
  ...input
}: CardInput & { setId: string; id: string }): Promise<Flashcard> => {
  // const { data } = await api.patch<Flashcard>(
  //   `/api/flashcards/${encodeURIComponent(setId)}/cards/${encodeURIComponent(id)}`,
  //   input,
  // );
  // return data;
  return null;
};

/**
 * Delete a card belonging to the specified set.
 * @param input - Set ID and card ID.
 * @returns No body (204).
 */
export const deleteFlashcard = async ({
  setId,
  id,
}: {
  setId: string;
  id: string;
}): Promise<void> => {
  // await api.delete(
  //   `/api/flashcards/${encodeURIComponent(setId)}/cards/${encodeURIComponent(id)}`,
  // );
  // return;
  console.log(setId, id);
};

/**
 * Delete a flashcard set and cascade its cards.
 * @param id - Owned set ID.
 * @returns No body (204).
 */
export const deleteFlashcardSet = async (id: string): Promise<void> => {
  // await api.delete(`/api/flashcards/${encodeURIComponent(id)}`);
  // return;
};

/**
 * List owned tests.
 * @returns Raw Test array.
 */
export const getTests = async (): Promise<Test[]> => {
  // const { data } = await api.get<Test[]>("/api/tests");
  // return data;

  return response(tests);
};

/**
 * Read test metadata.
 * @param id - Owned test ID.
 * @returns Test record.
 */
export const getTest = async (id: string): Promise<Test> => {
  // const { data } = await api.get<Test>(`/api/tests/${encodeURIComponent(id)}`);
  // return data;

  return response(requireRecord(tests, id, "Test"));
};

/**
 * Read generated questions and answers.
 * @param id - Owned test ID.
 * @returns TestContent record.
 */
export const getTestContent = async (id: string): Promise<TestContent> => {
  // const { data } = await api.get<TestContent>(
  //   `/api/tests/${encodeURIComponent(id)}/content`,
  // );
  // return data;

  const content = contents.find((item) => item.testId === id);
  if (!content) throw new Error("Test content is unavailable.");
  return response(content);
};

/**
 * Generate a test from notebook documents and an optional reference file.
 * @param input - Title, notebook, mode, and optional reference file/URL.
 * @returns Persisted test metadata; content is fetched separately.
 */
export const generateTest = async (input: GenerateTestInput): Promise<Test> => {
  // const { data } = await api.post<Test>("/api/tests/generate", input);
  // return data;

  return null;
};

/**
 * Delete test metadata and generated content.
 * @param id - Owned test ID.
 * @returns No body (204).
 */
export const deleteTest = async (id: string): Promise<void> => {
  // await api.delete(`/api/tests/${encodeURIComponent(id)}`);
  // return;
};

/**
 * Read local chat preview text; this helper has no backend endpoint.
 * @param id - Sample document ID.
 * @returns Preview excerpt or a placeholder for uploaded files.
 */
export const getSampleExcerpt = (id: string) =>
  sampleWorkspace.documents.find((document) => document.id === id)?.content ??
  "This is a local upload placeholder. Document processing and answers will be available once the backend is connected.";

export async function renameCourse({
  id,
  name,
}: {
  id: string;
  name: string;
}): Promise<Course> {
  const { data } = await api.patch<Course>(
    `/api/courses/${encodeURIComponent(id)}`,
    { name },
  );
  return data;
}
export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/api/courses/${encodeURIComponent(id)}`);
}
export async function editNotebook({
  id,
  noteBookName,
}: {
  id: string;
  noteBookName: string;
}): Promise<NoteBook> {
  const { data } = await api.patch<NoteBook>(
    `/api/notebooks/${encodeURIComponent(id)}`,
    { noteBookName },
  );
  return data;
}
export async function deleteNotebook(id: string): Promise<void> {
  await api.delete(`/api/notebooks/${encodeURIComponent(id)}`);
}
