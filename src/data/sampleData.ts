import { workspaceSchema } from "../zodSchema/studySchema";
import type { StudyCard } from "../types/study";
import type { Course, Document, NoteBook } from "../types";

export const sampleWorkspace = workspaceSchema.parse({
  courses: [
    {
      id: "bio",
      name: "Introduction to Biology",
      code: "BIO 101",
      description:
        "Explore the building blocks of life, from cells to ecosystems.",
      notebooks: ["Cell biology", "Genetics", "Ecology"],
    },
    {
      id: "psy",
      name: "Cognitive Psychology",
      code: "PSY 204",
      description: "Understand how we think, learn, and remember.",
      notebooks: ["Memory & learning", "Attention"],
    },
    {
      id: "math",
      name: "Calculus I",
      code: "MATH 120",
      description: "Build intuition for limits, derivatives, and integration.",
      notebooks: ["Derivatives", "Integrals"],
    },
    {
      id: "cs",
      name: "Data Structures & algorithms",
      code: "CS1332",
      description: "Build intuition for limits, derivatives, and integration.",
      notebooks: ["Derivatives", "Integrals"],
    },
  ],
  documents: [
    {
      id: "cells",
      name: "Cell structure & function.pdf",
      courseId: "bio",
      notebook: "Cell biology",
      size: "2.4 MB",
      uploaded: "Sample material",
      content:
        "Cells are the basic units of life. The cell membrane controls movement of substances into and out of a cell. The nucleus stores DNA. Mitochondria produce ATP through cellular respiration. Ribosomes synthesize proteins. Plant cells also contain chloroplasts, which convert light energy into chemical energy through photosynthesis.",
    },
    {
      id: "genetics",
      name: "Week 4 — Genetics notes.pdf",
      courseId: "bio",
      notebook: "Genetics",
      size: "1.8 MB",
      uploaded: "Sample material",
      content:
        "DNA carries genetic information. A gene is a segment of DNA that encodes a functional product. During transcription, DNA is copied into RNA. During translation, ribosomes use messenger RNA to assemble a protein. Mendel’s law of segregation states that allele pairs separate during gamete formation.",
    },
    {
      id: "memory",
      name: "Memory & learning.pdf",
      courseId: "psy",
      notebook: "Memory & learning",
      size: "3.1 MB",
      uploaded: "Sample material",
      content:
        "Working memory temporarily holds and manipulates information. Long-term memory stores information over extended periods. Retrieval practice strengthens learning by recalling information without looking at notes. Spaced repetition distributes practice across time, improving retention compared with massed practice.",
    },
    {
      id: "limits",
      name: "Derivatives study guide.pdf",
      courseId: "math",
      notebook: "Derivatives",
      size: "1.2 MB",
      uploaded: "Sample material",
      content:
        "A derivative measures instantaneous rate of change. Geometrically, it gives the slope of the tangent to a curve. The power rule states that the derivative of x to the power n is n times x to the power n minus one. A limit describes the value a function approaches as its input approaches a given point.",
    },
  ],
});
const sampleUserId = "sample-user";
const sampleTimestamp = "2026-10-01T12:00:00.000Z";

export const sampleCourses: Course[] = sampleWorkspace.courses.map(
  (course) => ({
    id: course.id,
    userId: sampleUserId,
    name: course.name,
    code: course.code,
    semester: "Fall 2026",
    createdAt: sampleTimestamp,
    updatedAt: sampleTimestamp,
  }),
);

export const sampleNotebooks: NoteBook[] = sampleWorkspace.courses.flatMap(
  (course) =>
    course.notebooks.map((name, index) => ({
      id: `${course.id}-notebook-${index + 1}`,
      userId: sampleUserId,
      noteBookName: name,
      courseId: course.id,
    })),
);

export const sampleDocuments: Document[] = sampleWorkspace.documents.map(
  (document) => {
    const notebook = sampleNotebooks.find(
      (item) =>
        item.courseId === document.courseId &&
        item.noteBookName === document.notebook,
    );
    if (!notebook) {
      throw new Error(`Missing sample notebook for document ${document.id}`);
    }
    return {
      id: document.id,
      userId: sampleUserId,
      name: document.name,
      originalName: document.name,
      fileType: "pdf",
      fileSize: Math.round(Number.parseFloat(document.size) * 1024 * 1024),
      status: "ready",
      r2Key: `samples/${document.id}.pdf`,
      errorMessage: null,
      courseId: document.courseId,
      notebookId: notebook.id,
      createdAt: sampleTimestamp,
      updatedAt: sampleTimestamp,
    };
  },
);

export const studyCards: StudyCard[] = [
  {
    courseId: "bio",
    question: "What is the primary function of mitochondria?",
    answer: "Produce ATP through cellular respiration.",
    options: [
      "Store genetic information.",
      "Produce ATP through cellular respiration.",
      "Synthesize proteins.",
      "Control cell entry and exit.",
    ],
  },
  {
    courseId: "bio",
    question: "What happens during transcription?",
    answer: "DNA is copied into RNA.",
    options: [
      "RNA is assembled into DNA.",
      "Proteins are broken down.",
      "DNA is copied into RNA.",
      "Cells divide into gametes.",
    ],
  },
  {
    courseId: "psy",
    question: "What is retrieval practice?",
    answer: "Recalling information without looking at notes.",
    options: [
      "Reading notes repeatedly.",
      "Recalling information without looking at notes.",
      "Studying everything in one session.",
      "Highlighting a textbook.",
    ],
  },
  {
    courseId: "math",
    question: "What does a derivative measure?",
    answer: "Instantaneous rate of change.",
    options: [
      "The area under a curve.",
      "Total accumulated change.",
      "Instantaneous rate of change.",
      "The average of all inputs.",
    ],
  },
];
