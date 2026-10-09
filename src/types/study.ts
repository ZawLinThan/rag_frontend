import type { ReactNode } from "react";
import type { WorkspaceType } from "../zodSchema/studySchema";
import type { Course } from ".";

export type WorkspaceContextType = WorkspaceType & {
  addNotebook: (courseId: string, name: string) => void;
  addCourse: (name: string) => void;
  addDocument: (file: File, courseId: string, notebook: string) => void;
  removeDocument: (id: string) => void;
};

export type ChildrenProps = { children: ReactNode };
export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sourceId?: string;
};

export type StudyCard = {
  question: string;
  answer: string;
  courseId: string;
  options: string[];
};

export type PageHeadingProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export type CourseCardProps = { course: Course };
export type AuthFormProps = { mode: "login" | "signup" };
