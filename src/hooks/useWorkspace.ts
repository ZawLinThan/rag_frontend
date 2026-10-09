import { createContext, useContext } from "react";
import type { WorkspaceContextType } from "../types/study";

export const WorkspaceContext = createContext<WorkspaceContextType | null>(
  null,
);

export const useWorkspace = () => {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Workspace provider missing");
  return value;
};
