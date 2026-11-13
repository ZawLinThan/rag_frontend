# Folio — RAG study assistant frontend

React, TypeScript, and Vite frontend for a responsive study workspace. Integration is in progress: courses, notebooks, documents, and chat use the backend, while flashcard and test workflows still contain sample data or stubs. Backend ingestion is not yet implemented, so uploading a document does not currently produce usable study material.

## Run

From the `frontend` directory:

```sh
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the public credentials for the same Supabase project as the backend. Set `VITE_BACKEND_URL` to the backend origin (for example, `http://localhost:3000`), without `/api`. Start the backend and its worker as described in [the backend README](../backend/README.md). Browser uploads also require R2 CORS configuration.

## Screens

- `/`: overview
- `/courses` and `/courses/:courseId`: courses, notebooks, and their documents
- `/documents` and `/documents/:documentId`: uploads, search, metadata, and file previews
- `/chat`: document-scoped assistant and conversation history
- `/flashcards`: deck and card workflows under development
- `/tests`: practice test workflows under development; `/quizzes` redirects here
- `/timer`: focus timer
- `/settings`: sign-out and non-persistent preference form
- `/login`, `/signup`, `/auth/callback`: Supabase authentication

Workspace routes require authentication. The Axios client obtains the current Supabase session and sends its access token as a Bearer token. Study queries share a TanStack Query cache, which is cleared on account changes. See [backend connection notes](BACKEND_CONTRACTS.md) for endpoint and implementation status.

## Supabase authentication

Enable email authentication, configure the site URL, and allow `http://localhost:5173/auth/callback` (or your actual development origin) and your production callback URL in Supabase Auth redirect settings. Email templates must use Supabase's confirmation URL so the PKCE redirect contains a code. Signup confirmation links must be opened in the same browser where authentication started.

The singleton client uses `flowType: 'pkce'` and `detectSessionInUrl: true`. Signup collects full name, email, password (at least 8 characters), and password confirmation. The full name is stored as `user_metadata.full_name`; password confirmation is validated locally and never sent to Supabase. See the [Supabase PKCE documentation](https://supabase.com/docs/guides/auth/sessions/pkce-flow).

## Structure

- `src/App.tsx`: routes and authentication boundary
- `src/pages`, `src/components`: page and reusable UI components
- `src/skeletons`: page and reusable component loading placeholders
- `src/hooks`: workspace, study queries, and other hooks
- `src/lib/studyApi.ts`, `src/lib/chatApi.ts`: API and remaining sample adapters
- `src/types`, `src/zodSchema`: application types and runtime validation
- `contracts/`: backend type snapshot and [update instructions](contracts/README.md)

## Verification

```sh
npm run build
npm run lint
npm test
npm run check:contracts
```

The current build has TypeScript errors in the unfinished study API and reference-test flow. The study API test suite still expects the removed `resetSampleData` helper, so it currently fails. The contract check only compares TypeScript types to the snapshot; it does not exercise the server.

## Spotify

The focus timer offers Spotify, YouTube Music, and Apple Music players. Paste a share link to load an embedded player; playback availability depends on the service and content. Switching services closes the current player. Spotify also offers a music panel with an embedded player and optional currently-playing integration. See [Spotify setup and API contract](docs/spotify.md) for application registration, PKCE authorization, redirect requirements, and verification.
