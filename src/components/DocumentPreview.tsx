import { useEffect, useState } from "react";
import { getDocumentFile } from "../lib/studyApi";
import type { Document } from "../types";

// DOCX is a ZIP archive. Extract its main XML document and render text only.
async function docxText(blob: Blob): Promise<string> {
  const bytes = await blob.arrayBuffer();
  const view = new DataView(bytes);
  let end = bytes.byteLength - 22;
  const earliest = Math.max(0, bytes.byteLength - 65557);
  while (end >= earliest && view.getUint32(end, true) !== 0x06054b50) {
    end--;
  }

  if (end < earliest) {
    throw new Error("Invalid DOCX file");
  }

  const entries = view.getUint16(end + 10, true);
  let offset = view.getUint32(end + 16, true);
  
  for (let i = 0; i < entries; i++) {
    if (view.getUint32(offset, true) !== 0x02014b50)
      throw new Error("Invalid DOCX archive");
    const method = view.getUint16(offset + 10, true);
    const size = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const name = new TextDecoder().decode(
      new Uint8Array(bytes, offset + 46, nameLength),
    );
    if (name === "word/document.xml") {
      const local = view.getUint32(offset + 42, true);
      if (view.getUint32(local, true) !== 0x04034b50)
        throw new Error("Invalid DOCX entry");
      const start =
        local +
        30 +
        view.getUint16(local + 26, true) +
        view.getUint16(local + 28, true);
      const compressed = new Blob([bytes.slice(start, start + size)]);
      const xml =
        method === 0
          ? await compressed.text()
          : method === 8
            ? await new Response(
                compressed
                  .stream()
                  .pipeThrough(new DecompressionStream("deflate-raw")),
              ).text()
            : (() => {
                throw new Error("Unsupported DOCX compression");
              })();
      const parsed = new DOMParser().parseFromString(xml, "application/xml");
      if (parsed.querySelector("parsererror"))
        throw new Error("Invalid DOCX content");
      const word =
        "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
      return Array.from(parsed.getElementsByTagNameNS(word, "p"), (paragraph) =>
        Array.from(
          paragraph.getElementsByTagNameNS(word, "t"),
          (text) => text.textContent ?? "",
        ).join(""),
      ).join("\n");
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error("DOCX document content not found");
}

export default function DocumentPreview({ document }: { document: Document }) {
  const [state, setState] = useState<{
    url?: string;
    text?: string;
    error?: string;
    loading: boolean;
  }>({ loading: true });
  useEffect(() => {
    let cancelled = false;
    let url: string | undefined;
    setState({ loading: true });
    void (async () => {
      try {
        const file = await getDocumentFile(document.id);
        const extension = document.originalName.split(".").pop()?.toLowerCase();
        const type = document.fileType.toLowerCase();
        const isPdf =
          extension === "pdf" || type === "application/pdf" || type === "pdf";
        const isText =
          extension === "txt" || type === "text/plain" || type === "txt";
        const isDocx =
          extension === "docx" ||
          type.includes("wordprocessingml") ||
          type === "docx";
        let text: string | undefined;
        let previewError: string | undefined;
        try {
          if (isText) text = await file.text();
          else if (isDocx) text = await docxText(file);
          else if (!isPdf)
            previewError = "Preview is not available for this file type.";
        } catch {
          previewError =
            "Could not render this document. You can download the original file.";
        }
        if (cancelled) return;
        url = URL.createObjectURL(
          new Blob([file], {
            type: isPdf ? "application/pdf" : "application/octet-stream",
          }),
        );
        setState({ loading: false, url, text, error: previewError });
      } catch {
        if (!cancelled)
          setState({
            loading: false,
            error: "Could not load this document. Please try again.",
          });
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [document.id, document.originalName, document.fileType]);

  return (
    <section className="document-preview" aria-label="Document preview">
      <h3>Preview</h3>
      {state.loading && <p>Loading document…</p>}
      {state.error && (
        <p className="notice" role="status">
          {state.error}
        </p>
      )}
      {state.text !== undefined && (
        <pre className="document-preview-text">
          {state.text || "This document has no text to display."}
        </pre>
      )}
      {state.url && !state.error && state.text === undefined && (
        <iframe
          className="document-preview-pdf"
          title={`Preview of ${document.name}`}
          src={state.url}
        />
      )}
      {state.url && (
        <a className="button" href={state.url} download={document.originalName}>
          Download original
        </a>
      )}
    </section>
  );
}
