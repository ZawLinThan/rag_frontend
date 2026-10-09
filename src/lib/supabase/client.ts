import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { envSchema } from "../../zodSchema/envSchema";

const config = envSchema.safeParse({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
});

export const supabase = config.success
  ? createSupabaseClient(config.data.url, config.data.key, {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const createClient = () => {
  if (!supabase)
    throw new Error(
      "Add your Supabase URL and publishable key to frontend/.env.",
    );
  return supabase;
};
