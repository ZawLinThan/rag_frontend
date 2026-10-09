import { z } from "zod";
export const themeSchema = z.enum(["light", "dark"]);
export type ThemeType = z.infer<typeof themeSchema>;
