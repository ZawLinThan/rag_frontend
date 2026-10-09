import { z } from "zod";
export const envSchema = z.object({ url: z.url(), key: z.string().min(1) });
export type EnvType = z.infer<typeof envSchema>;
