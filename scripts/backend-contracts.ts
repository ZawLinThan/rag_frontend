/** Compile-time comparison against the versioned API snapshot; no backend checkout required. */
import type {
  SuccessfulPresignedUrlResponse as BackendPresign,
  Course as ApiCourse,
  NoteBook as ApiNotebook,
  Document as ApiDocument,
  Flashcard as ApiFlashcard,
  FlashcardSet as ApiSet,
  Test as ApiTest,
  TestContent as ApiTestContent,
  CreateCourseInput as ApiCreateCourse,
  CreateNotebookInput as ApiCreateNotebook,
  CreateSetInput as ApiCreateSet,
  CardInput as ApiCardInput,
  GenerateFlashcardsInput as ApiGenerateFlashcards,
  GenerateTestInput as ApiGenerateTest,
} from "../contracts/study-api";
import type {
  Course,
  NoteBook,
  Document,
  Flashcard,
  FlashcardSet,
  Test,
  SuccessfulPresignedUrlResponse,
  TestContent,
  CreateCourseInput,
  CreateNotebookInput,
  CreateSetInput,
  CardInput,
  GenerateFlashcardsInput,
  GenerateTestInput,
} from "../src/types";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;
export type BackendContracts = [
  Assert<Equal<SuccessfulPresignedUrlResponse, BackendPresign>>,
  Assert<Equal<Course, ApiCourse>>,
  Assert<Equal<NoteBook, ApiNotebook>>,
  Assert<Equal<Document, ApiDocument>>,
  Assert<Equal<Flashcard, ApiFlashcard>>,
  Assert<Equal<FlashcardSet, ApiSet>>,
  Assert<Equal<Test, ApiTest>>,
  Assert<Equal<TestContent, ApiTestContent>>,
  Assert<Equal<CreateCourseInput, ApiCreateCourse>>,
  Assert<Equal<CreateNotebookInput, ApiCreateNotebook>>,
  Assert<Equal<CreateSetInput, ApiCreateSet>>,
  Assert<Equal<CardInput, ApiCardInput>>,
  Assert<Equal<GenerateFlashcardsInput, ApiGenerateFlashcards>>,
  Assert<Equal<GenerateTestInput, ApiGenerateTest>>,
];
