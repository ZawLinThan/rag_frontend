import { useEffect, useState } from "react";
import { themeSchema } from "../zodSchema/themeSchema";
import type { ThemeType } from "../zodSchema/themeSchema";
const initialTheme = (): ThemeType => {
  try {
    const saved = themeSchema.safeParse(localStorage.getItem("folio-theme"));
    if (saved.success) return saved.data;
  } catch {
    /* Use system preference when storage is unavailable. */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};
export const useTheme = () => {
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("folio-theme", theme);
    } catch {
      /* Theme still applies for this session. */
    }
  }, [theme]);
  return {
    theme,
    toggleTheme: () =>
      setTheme((current) => (current === "dark" ? "light" : "dark")),
  };
};
