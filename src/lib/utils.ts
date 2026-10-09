export { cn } from "cn";

/** Format a size in bytes using 1024-byte units and up to two decimal places. */
export const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
  const unitIndex = Math.min(
    Math.max(0, Math.floor(Math.log(bytes) / Math.log(1024))),
    units.length - 1,
  );
  const size = Number((bytes / 1024 ** unitIndex).toFixed(2));

  return `${size} ${units[unitIndex]}`;
};

/**
 * @description Get the Initials of the name
 *
 * @param name
 * @returns
 */
export const getNameInitials = (name: string) => {
  const names = name.trim().split(/\s+/).filter(Boolean);
  const initials = names.map((n) => n.charAt(0).toUpperCase());
  return initials.join("");
};

// Compatibility exports; all reads use the shared sample API store.
export {
  getCourses,
  getNotebooks,
  getNotebooksByCourseId,
  getDocuments,
} from "./studyApi";
