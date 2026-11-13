import { useId, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { useStudyMutation } from "../hooks/useStudyQueries";
import { uploadDocument } from "../lib/studyApi";
import type { UploadResult } from "../types";
import { uploadSchema } from "../zodSchema/studySchema";
import { formatFileSize } from "../lib/utils";

/** Reused for notes and sample tests; validation and transport share one path. */
const FileUpload = ({
  courseId,
  notebookId,
  multiple = true,
  onUploaded,
  label = "Drop your notes here, or click to browse",
  disabled = false,
}: {
  courseId: string;
  notebookId: string;
  multiple?: boolean;
  label?: string;
  onUploaded?: (result: UploadResult) => void;
  disabled?: boolean;
}) => {
  const upload = useStudyMutation(uploadDocument);
  const formId = useId();
  const [messages, setMessages] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<
    { file: File; hasMathFormula: boolean | null }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const unavailable = disabled || busy || !courseId || !notebookId;

  const handleFiles = (files: FileList | null) => {
    if (!files || unavailable || lock.current) return;
    setMessages([]);
    setErrors([]);
    const valid: { file: File; hasMathFormula: null }[] = [];
    for (const file of Array.from(files).slice(
      0,
      multiple ? files.length : 1,
    )) {
      if (
        !uploadSchema.safeParse({
          name: file.name,
          size: file.size,
          courseId,
          notebookId,
        }).success
      ) {
        setErrors((items) => [
          ...items,
          `${file.name}: choose a non-empty PDF, DOCX, or TXT file up to 20 MB.`,
        ]);
      } else {
        valid.push({ file, hasMathFormula: null });
      }
    }
    setPendingFiles(valid);
  };

  const uploadFiles = async () => {
    if (
      unavailable ||
      lock.current ||
      pendingFiles.some((item) => item.hasMathFormula === null)
    )
      return;
    lock.current = true;
    setBusy(true);
    setMessages([]);
    setErrors([]);
    try {
      const failed: typeof pendingFiles = [];
      for (const { file, hasMathFormula } of pendingFiles) {
        try {
          const result = await upload.mutateAsync({
            file,
            courseId,
            notebookId,
            hasMathFormula: hasMathFormula === true,
          });
          setMessages((items) => [
            ...items,
            `${file.name} (${formatFileSize(file.size)}) added.`,
          ]);
          onUploaded?.(result);
        } catch (error) {
          failed.push({ file, hasMathFormula });
          setErrors((items) => [
            ...items,
            `${file.name}: ${error instanceof Error ? error.message : "Upload failed."}`,
          ]);
        }
      }
      setPendingFiles(failed);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <div>
      <label
        className={`dropzone ${unavailable ? "upload-disabled" : ""}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
      >
        <UploadCloud size={30} />
        <strong>{busy ? "Adding your file…" : label}</strong>
        <span>PDF, DOCX, TXT · Up to 20 MB per file</span>
        <input
          type="file"
          disabled={unavailable}
          multiple={multiple}
          accept=".pdf,.docx,.txt"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      {pendingFiles.length > 0 && (
        <div className="upload-formula-choices">
          {pendingFiles.map(({ file, hasMathFormula }, index) => (
            <fieldset key={`${file.name}-${index}`} disabled={busy}>
              <legend>Does {file.name} contain mathematical formulas?</legend>
              {[true, false].map((answer) => (
                <label key={String(answer)}>
                  <input
                    type="radio"
                    name={`${formId}-formula-${index}`}
                    checked={hasMathFormula === answer}
                    onChange={() =>
                      setPendingFiles((items) =>
                        items.map((item, i) =>
                          i === index
                            ? { ...item, hasMathFormula: answer }
                            : item,
                        ),
                      )
                    }
                  />
                  {answer ? "Yes" : "No"}
                </label>
              ))}
            </fieldset>
          ))}
          <p className="helper">
            For PDFs, selecting Yes uses formula-aware extraction.
          </p>
          <button
            type="button"
            className="button"
            disabled={
              unavailable ||
              pendingFiles.some((item) => item.hasMathFormula === null)
            }
            onClick={() => void uploadFiles()}
          >
            {busy ? "Uploading…" : "Upload files"}
          </button>
        </div>
      )}
      {!courseId || !notebookId ? (
        <p className="helper">Choose a course and notebook before uploading.</p>
      ) : null}
      {messages.length > 0 && (
        <div role="status" className="notice">
          {messages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}
      {errors.length > 0 && (
        <div role="alert" className="error">
          {errors.map((error, index) => (
            <p key={`${index}-${error}`}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
