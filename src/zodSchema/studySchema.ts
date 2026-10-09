import { z } from "zod";
/** Legacy presentation model for the unchanged study assistant, not an API DTO. */
export const courseSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(255),
  code: z.string(),
  color: z.string().default("sage"),
  description: z.string(),
  notebooks: z.array(z.string()),
});
export type CourseType = z.infer<typeof courseSchema>;
export const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  courseId: z.string().min(1),
  notebook: z.string().min(1),
  size: z.string(),
  uploaded: z.string(),
  content: z.string(),
});
export type DocumentType = z.infer<typeof documentSchema>;
export const workspaceSchema = z.object({
  courses: z.array(courseSchema),
  documents: z.array(documentSchema),
});
export type WorkspaceType = z.infer<typeof workspaceSchema>;
export const questionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Enter a question.")
    .max(2000, "Keep questions under 2,000 characters."),
});
export type QuestionType = z.infer<typeof questionSchema>;
export const uploadSchema = z.object({
  name: z
    .string()
    .regex(/\.(pdf|txt|docx)$/i, "Choose a PDF, TXT, or DOCX file."),
  size: z
    .number()
    .positive()
    .max(20 * 1024 * 1024, "Files must be under 20 MB."),
  courseId: z.string().min(1),
  notebookId: z.string().min(1),
});
export type UploadType = z.infer<typeof uploadSchema>;
export const settingsSchema = z.object({
  name: z.string().trim().min(2),
  goal: z.coerce.number().min(5).max(120),
});
export type SettingsType = z.infer<typeof settingsSchema>;
