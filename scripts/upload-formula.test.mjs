import assert from "node:assert/strict";
import { test } from "node:test";
import axios from "axios";
import transport from "../src/lib/axios.ts";
import { uploadDocument } from "../src/lib/studyApi.ts";

test("upload confirmation carries each formula choice", async () => {
  transport.interceptors.request.clear();
  const choices = [];
  transport.defaults.adapter = async (config) => {
    let data;
    if (config.url === "/api/documents/presign") {
      data = { uploadUrl: "https://example.test/file", key: "user/file", expiresIn: 3600 };
    } else if (config.url === "/api/documents/confirm") {
      choices.push(JSON.parse(config.data).hasMathFormula);
      data = { documentId: "document", status: "queued" };
    } else {
      assert.equal(config.url, "/api/documents/document");
      data = { id: "document" };
    }
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
  axios.defaults.adapter = async (config) => ({ data: "", status: 200, statusText: "OK", headers: {}, config });
  const file = new File(["content"], "notes.pdf", { type: "application/pdf" });
  for (const hasMathFormula of [true, false]) {
    await uploadDocument({ file, courseId: "course", notebookId: "notebook", hasMathFormula });
  }
  assert.deepEqual(choices, [true, false]);
});
