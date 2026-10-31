import { test } from "node:test";
import assert from "node:assert/strict";
import { readyDocumentsInScope } from "../src/lib/chatScope.ts";
import {
  createChatSession,
  sendChatMessage,
  getChatSessions,
  getChatSession,
} from "../src/lib/chatApi.ts";
import api from "../src/lib/axios.ts";

test("scope includes only ready documents in the chosen course, notebook and file", () => {
  const documents = [
    { id: "a", courseId: "c", notebookId: "n", status: "ready" },
    { id: "b", courseId: "c", notebookId: "n", status: "processing" },
    { id: "d", courseId: "c", notebookId: "other", status: "ready" },
    { id: "e", courseId: "other", notebookId: "n", status: "ready" },
  ];
  assert.deepEqual(
    readyDocumentsInScope(documents, "c", "", "").map((d) => d.id),
    ["a", "d"],
  );
  assert.deepEqual(
    readyDocumentsInScope(documents, "c", "n", "").map((d) => d.id),
    ["a"],
  );
  assert.deepEqual(readyDocumentsInScope(documents, "c", "n", "b"), []);
  assert.deepEqual(
    readyDocumentsInScope(documents, "c", "n", "a").map((d) => d.id),
    ["a"],
  );
});

test("loads chat history and saved session details", async () => {
  const original = api.get;
  const calls = [];
  api.get = async (url) => {
    calls.push(url);
    return {
      data:
        url === "/api/chat/sessions"
          ? [{ id: "session" }]
          : {
              id: "session",
              documentIds: ["document"],
              messages: [
                { content: "Answer", sources: [{ chunkId: "chunk" }] },
              ],
            },
    };
  };
  try {
    assert.equal((await getChatSessions())[0].id, "session");
    const saved = await getChatSession("session");
    assert.deepEqual(saved.documentIds, ["document"]);
    assert.equal(saved.messages[0].sources[0].chunkId, "chunk");
    assert.deepEqual(calls, [
      "/api/chat/sessions",
      "/api/chat/sessions/session",
    ]);
  } finally {
    api.get = original;
  }
});

test("chat sends document IDs and questions to the backend endpoints", async () => {
  const original = api.post;
  const calls = [];
  api.post = async (url, body) => {
    calls.push([url, body]);
    return {
      data:
        calls.length === 1
          ? { sessionId: "session" }
          : { answer: "Answer", sources: [] },
    };
  };
  try {
    const session = await createChatSession(["doc-1", "doc-2"]);
    const response = await sendChatMessage(session, "Question?");
    assert.equal(response.answer, "Answer");
    assert.deepEqual(calls, [
      ["/api/chat/sessions", { documentIds: ["doc-1", "doc-2"] }],
      ["/api/chat/sessions/session/messages", { message: "Question?" }],
    ]);
  } finally {
    api.post = original;
  }
});
