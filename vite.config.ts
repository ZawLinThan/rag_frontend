import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Routing uses react-router-dom in App.tsx; no file-route generator is needed.
export default defineConfig({ plugins: [react(), tailwindcss()] });
