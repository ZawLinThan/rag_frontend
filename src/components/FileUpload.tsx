import { useRef, useState } from "react";
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
  const [messages, setMessages] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const unavailable = disabled || busy || !courseId || !notebookId;

  const handleFiles = async (files: FileList | null) => {
    if (!files || unavailable || lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessages([]);
    setErrors([]);
    try {
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
          continue;
        }
        try {
          const result = await upload.mutateAsync({
            file,
            courseId,
            notebookId,
          });
          setMessages((items) => [
            ...items,
            `${file.name} (${formatFileSize(file.size)}) added.`,
          ]);
          onUploaded?.(result);
        } catch (error) {
          setErrors((items) => [
            ...items,
            `${file.name}: ${error instanceof Error ? error.message : "Upload failed."}`,
          ]);
        }
      }
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
          void handleFiles(event.dataTransfer.files);
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
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
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
