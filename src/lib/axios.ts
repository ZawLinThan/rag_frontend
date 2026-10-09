import axios from "axios";
import { createClient } from "./supabase/client";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const { data, error } = await createClient().auth.getSession();
  if (error)
    throw new Error("Unable to refresh your session. Please sign in again.");
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in before making this request.");
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Backend declares failures as { error: string }. Surface that message through
// TanStack's Error state
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const data: unknown = error.response?.data;
      if (
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof data.error === "string"
      ) {
        return Promise.reject(new Error(data.error));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
