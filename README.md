# Folio — RAG study assistant frontend

React + TypeScript + Vite prototype with a responsive educational workspace.

## Run

```sh
npm install
npm run dev
```

## Screens

- `/`: overview
- `/courses` and `/courses/:courseId`: course creation, notebook creation, organized notes
- `/documents` and `/documents/:documentId`: upload metadata, search, filters, sample previews
- `/chat`: course, notebook, or file scoped sample answers with source links
- `/flashcards`: reveal, review, and session completion
- `/quizzes`: multiple-choice practice with feedback and scoring
- `/settings`: prototype preferences, sign-out, sample workspace reset
- `/login`, `/signup`, `/auth/callback`: Supabase email/password authentication with PKCE email confirmation

Study features use sample data. Course, notebook, and upload metadata persist in localStorage. Uploads do not store file bytes or extract document contents. Chat retrieves matching sample passages; it does not call an LLM. Flashcards and quizzes are curated samples. Profile preferences currently apply only within the settings screen. The demo workspace remains public regardless of authentication.

## Supabase authentication

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env` using `.env.example`. Enable email authentication, configure the site URL, and allow `http://localhost:5173/auth/callback` (or your actual development origin) and your production callback URL in Supabase Auth redirect settings. Email templates must use Supabase's confirmation URL so the PKCE redirect contains a code. Signup confirmation links must be opened in the same browser where authentication started.

The singleton client uses `flowType: 'pkce'` and `detectSessionInUrl: true`, letting Supabase exchange the callback code once. The callback reads the resulting session and handles failed or expired links. Signup collects full name, email, password (at least 8 characters), and password confirmation. The full name is stored as `user_metadata.full_name`; password confirmation is validated locally and never sent to Supabase. Sign-in uses email and password. Signup redirects immediately when a session is returned; otherwise it asks the user to confirm their email.

Reference: https://supabase.com/docs/guides/auth/sessions/pkce-flow

## Structure and backend integration

- `src/App.tsx`: routes only
- `src/pages`: route entry points composing components
- `src/components`: separate reusable TSX components
- `src/hooks`: custom workspace/session hooks
- `src/types`: ordinary application and component types
- `src/zodSchema`: runtime schemas and their inferred types
- `src/data`: validated sample workspace and practice content

Replace workspace provider actions with API calls, wire ingestion into document uploads, replace sample passage matching with your RAG endpoint, and load generated practice content from your backend. Keep incoming responses validated with Zod. Add authenticated route protection when connecting private user data.

## Verification

```sh
npm run build
npm run lint
```
