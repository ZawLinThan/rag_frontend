import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import * as api from "../src/lib/studyApi.ts";
import transport from "../src/lib/axios.ts";
import axios from "axios";
import {
  studyQueries,
  studyKeys,
  reconcileStudyMutation,
} from "../src/hooks/useStudyQueries.ts";

// Keep the production presign/PUT flow live in the adapter, but isolate network I/O in tests.
transport.interceptors.request.clear();
const networkCalls = [];
transport.defaults.adapter = async (config) => {
  networkCalls.push(config.url);
  assert.equal(config.url, "/api/documents/presign");
  const payload = JSON.parse(config.data);
  return {
    data: {
      uploadUrl: "https://uploads.example.test/file",
      key: `sample-user/${payload.fileName}`,
      publicUrl: "https://files.example.test/file",
      expiresIn: 3600,
    },
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  };
};
axios.defaults.adapter = async (config) => {
  networkCalls.push(config.url);
  assert.equal(config.method, "put");
  return { data: "", status: 200, statusText: "OK", headers: {}, config };
};

beforeEach(async () => {
  networkCalls.length = 0;
  await api.resetSampleData();
});

test("course and notebook creation is reflected in shared cached reads", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  });
  const original = await client.fetchQuery(studyQueries.courses());
  const created = await api.createCourse({
    name: "Computer Science",
    code: "CS 101",
    semester: null,
  });
  await api.createNotebook({
    courseId: created.id,
    noteBookName: "Algorithms",
  });
  await client.invalidateQueries({ queryKey: studyKeys.all });
  const updated = await client.fetchQuery(studyQueries.courses());
  assert.equal(updated.length, original.length + 1);
  assert.equal(
    updated.find((course) => course.id === created.id).userId,
    "sample-user",
  );
  const notebooks = await client.fetchQuery(studyQueries.notebooks());
  assert.equal(
    notebooks.find((notebook) => notebook.courseId === created.id).noteBookName,
    "Algorithms",
  );
  await assert.rejects(
    api.createNotebook({ courseId: created.id, noteBookName: "algorithms" }),
    /already exists/,
  );
  updated[0].name = "Tampered";
  assert.notEqual((await api.getCourses())[0].name, "Tampered");
  client.clear();
});

test("shared uploads enforce scope and size and support rename/delete", async () => {
  const notebook = (await api.getNotebooks())[0];
  const file = new File(["study material"], "lecture.txt", {
    type: "text/plain",
  });
  const input = { file, courseId: notebook.courseId, notebookId: notebook.id };
  const signed = await api.getPresignedUrl(file);
  assert.deepEqual(Object.keys(signed).sort(), [
    "expiresIn",
    "key",
    "publicUrl",
    "uploadUrl",
  ]);
  const uploaded = await api.uploadDocument(input);
  assert.equal(uploaded.document.status, "ready");
  assert.equal(uploaded.document.fileSize, file.size);
  assert.equal(
    (
      await api.renameDocument({
        id: uploaded.document.id,
        name: "Renamed notes",
      })
    ).name,
    "Renamed notes",
  );
  await assert.rejects(
    api.uploadDocument({ ...input, courseId: "psy" }),
    /selected course/,
  );
  await assert.rejects(
    api.uploadDocument({ ...input, file: new File(["bad"], "bad.exe") }),
    /PDF/,
  );
  await assert.rejects(
    api.uploadDocument({ ...input, file: new File([], "empty.pdf") }),
    /non-empty/,
  );
  await api.deleteDocument(uploaded.document.id);
  assert.equal(
    (await api.getDocuments()).some(
      (document) => document.id === uploaded.document.id,
    ),
    false,
  );
});

test("manual and generated decks share card CRUD and set deletion cascades", async () => {
  const deck = await api.createFlashcardSet({
    title: "My deck",
    courseId: null,
  });
  assert.equal((await api.getFlashcards(deck.id)).length, 0);
  const card = await api.addFlashcard({
    setId: deck.id,
    front: "Question",
    back: "Answer",
  });
  await api.updateFlashcard({
    setId: deck.id,
    id: card.id,
    front: "Updated question",
    back: "Updated answer",
  });
  assert.equal((await api.getFlashcards(deck.id))[0].front, "Updated question");
  const other = await api.createFlashcardSet({
    title: "Other",
    courseId: null,
  });
  await assert.rejects(
    api.deleteFlashcard({ setId: other.id, id: card.id }),
    /does not belong/,
  );
  await api.deleteFlashcard({ setId: deck.id, id: card.id });
  assert.equal((await api.getFlashcards(deck.id)).length, 0);
  const document = (await api.getDocuments())[0];
  const generated = await api.generateFlashcards({
    title: "Generated",
    courseId: document.courseId,
    documentId: document.id,
    count: 3,
  });
  assert.equal(generated.documentId, document.id);
  assert.equal((await api.getFlashcards(generated.id)).length, 3);
  await api.deleteFlashcardSet(generated.id);
  await assert.rejects(api.getFlashcards(generated.id), /not found/);
});

test("notebook and reference tests return metadata/content and protect referenced files", async () => {
  const notebook = (await api.getNotebooks())[0];
  const input = {
    title: "Notebook practice",
    notebookId: notebook.id,
    mode: "notebook",
    referenceFileId: null,
    referenceUrl: null,
  };
  const test = await api.generateTest(input);
  assert.equal(test.referenceFileId, null);
  assert.ok((await api.getTestContent(test.id)).questions.length);
  const uploaded = await api.uploadDocument({
    file: new File(["sample questions"], "sample-test.txt"),
    courseId: notebook.courseId,
    notebookId: notebook.id,
  });
  const reference = await api.generateTest({
    ...input,
    title: "Reference practice",
    mode: "reference",
    referenceFileId: uploaded.document.id,
    referenceUrl: uploaded.publicUrl,
  });
  assert.equal(reference.referenceFileId, uploaded.document.id);
  await assert.rejects(
    api.deleteDocument(uploaded.document.id),
    /Delete tests/,
  );
  await api.deleteTest(reference.id);
  await api.deleteDocument(uploaded.document.id);
  const empty = await api.createNotebook({
    courseId: notebook.courseId,
    noteBookName: "Empty",
  });
  await assert.rejects(
    api.generateTest({ ...input, notebookId: empty.id }),
    /Upload ready/,
  );
  await api.resetSampleData();
  assert.equal((await api.getTests()).length, 0);
});

test("confirmed results update lists/details before refetch and deletes remove dependent cache", async () => {
  const client = new QueryClient();
  client.setQueryData(studyKeys.courses, await api.getCourses());
  const input = { name: "Confirmed", code: null, semester: null };
  const created = await api.createCourse(input);
  reconcileStudyMutation(client, api.createCourse, input, created);
  assert.equal(client.getQueryData(studyKeys.courses).at(-1).id, created.id);

  const document = (await api.getDocuments())[0];
  client.setQueryData(studyKeys.documents, await api.getDocuments());
  const rename = { id: document.id, name: "Server name" };
  const updated = await api.renameDocument(rename);
  reconcileStudyMutation(client, api.renameDocument, rename, updated);
  assert.equal(
    client.getQueryData(studyKeys.document(document.id)).name,
    "Server name",
  );
  const previous = client.getQueryData(studyKeys.documents);
  await assert.rejects(api.renameDocument({ id: document.id, name: "" }));
  assert.equal(client.getQueryData(studyKeys.documents), previous);

  await api.deleteDocument(document.id);
  reconcileStudyMutation(client, api.deleteDocument, document.id, undefined);
  assert.equal(
    client
      .getQueryData(studyKeys.documents)
      .some((item) => item.id === document.id),
    false,
  );
  assert.equal(client.getQueryData(studyKeys.document(document.id)), undefined);
  client.clear();
});

test("only presign and R2 PUT are live while confirmation remains a sample", async () => {
  const notebook = (await api.getNotebooks())[0];
  await api.uploadDocument({
    file: new File(["notes"], "notes.txt", { type: "text/plain" }),
    courseId: notebook.courseId,
    notebookId: notebook.id,
  });
  assert.deepEqual(networkCalls, [
    "/api/documents/presign",
    "https://uploads.example.test/file",
  ]);
});
