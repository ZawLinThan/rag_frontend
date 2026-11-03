# Backend connection notes

The frontend is partially connected. `src/lib/axios.ts` uses `VITE_BACKEND_URL` and sends the current Supabase access token. `src/hooks/useStudyQueries.ts` manages the shared study cache. The backend's self-contained type declarations are copied into `contracts/study-api.d.ts`; [the snapshot README](contracts/README.md) explains how to update and check them. These declarations include intended contracts for handlers that are not implemented, so a passing type check is not proof of runtime behavior.

## Current integration

| Area       | Backend routes and status                                                                                                                  | Frontend status                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Courses    | `/api/courses`: list, create, read, rename and delete handlers                                                                             | Live API calls for list, create, rename and delete.                                                    |
| Notebooks  | `/api/notebooks`: list (optional `courseId`), create, rename and delete handlers                                                           | Live API calls, including course-filtered reads.                                                       |
| Documents  | `/api/documents`: list (optional `notebookId`), read, rename, delete, file, presign and confirm handlers                                   | Live API calls. Preview reads `GET /:id/file` as a blob.                                               |
| Chat       | `/api/chat/sessions`, `/:id`, and `/:id/messages` are mounted; create, list, read and answer have implementations, while deletion is empty | Live create, history, detail and message calls. Retrieval depends on processed documents.              |
| Flashcards | `/api/flashcards` and card routes are mounted, but their controllers are empty                                                             | List and card reads use sample data; creation and update return `null`, and deletion is not connected. |
| Tests      | `/api/tests`, `/generate`, `/:id`, and `/:id/content` are mounted, but their controllers are empty                                         | Reads use an in-memory sample store; generation returns `null` and deletion is not connected.          |

Implemented course, notebook and document handlers generally return raw records or arrays; the frontend expects `{ error: string }` on failures. Consult the controllers for validation, status codes, and ownership behavior. Chat has its own response shapes in `src/lib/chatApi.ts`; those shapes are not covered by the study API snapshot.

## Document upload

1. `POST /api/documents/presign` receives `fileName`, `contentType`, and `size`, and returns `uploadUrl`, `key`, and `expiresIn`.
2. The browser sends the bytes to `uploadUrl` with `PUT` and the same content type.
3. `POST /api/documents/confirm` receives `name`, `originalName`, `r2Key`, `fileType`, `fileSize`, `courseId`, and `notebookId`. It returns HTTP 202 with `{ documentId, status: "queued" }`.
4. The frontend fetches `GET /api/documents/:id` for the returned document. Processing requires the worker; the current ingestion helpers throw `not implemented`, so completion is not yet available.

The returned presign contract has no public URL. The test-generation input still includes `referenceUrl`, while `UploadResult` contains only a document and `TestsPage` accesses `publicUrl`. This mismatch currently causes a TypeScript error and needs a design decision before reference-mode generation is connected.

## Remaining work

- Implement ingestion and verify status transitions, extraction, embeddings and retrieval end to end.
- Implement the flashcard and test handlers, content persistence and frontend transports. The controller comments and exported types describe intended behavior, not functioning endpoints.
- Resolve the reference-test upload URL contract and review scheduling. Settings preferences also have no persistent backend integration.
- Keep chat contracts and HTTP behavior synchronized separately; the study API type snapshot does not include them.

## Validation

Run `npm run check:contracts` in `frontend` for the snapshot comparison. Use the [backend HTTP acceptance tests](../backend/tests/README.md) to exercise server behavior with isolated services. `npm run build` currently fails on unfinished study API and reference-test code; `npm test` currently fails because the suite expects a `resetSampleData` helper that is no longer exported.
