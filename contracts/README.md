# API contract snapshot

`study-api.d.ts` is the backend's exported API contract, committed with this frontend. It has no imports from backend implementation files or database libraries. The frontend can be installed and checked without a backend checkout:

```sh
npm run check:contracts
```

The check compares frontend request/response types with this snapshot. Some declarations describe intended behavior for unimplemented handlers; chat contracts are not included. It does not check the running server or automatically detect backend changes. Update this artifact as part of reviewing an API change; HTTP API tests verify runtime behavior.

## Updating from a separate backend repository

In the backend repository:

```sh
npm run export:contracts
```

This creates `artifacts/study-api.d.ts`. Transfer that file (for example, from a backend release or CI artifact) to this repository's `contracts/study-api.d.ts`, review the diff, and run `npm run check:contracts`. Update the frontend types and callers if needed and commit the snapshot alongside them.

If both repositories are checked out locally, an explicit destination is also supported:

```sh
npm run export:contracts -- /absolute/path/to/frontend/contracts/study-api.d.ts
```

The backend's `src/types/studyApi.ts` is the source for this artifact. Keep it self-contained and describe JSON request/response payloads there rather than importing database records. The export command rejects imports to prevent reintroducing checkout dependencies.
