import { UploadCloud } from "lucide-react";
import type { DragEventHandler, ChangeEventHandler } from "react";

export function UploadDropzone({
  label = "Drop your notes here, or click to browse",
  busy = false,
  unavailable = false,
  multiple = true,
  onDrop,
  onChange,
}: {
  label?: string;
  busy?: boolean;
  unavailable?: boolean;
  multiple?: boolean;
  onDrop?: DragEventHandler<HTMLLabelElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label
      aria-busy={busy}
      className={`dropzone ${unavailable ? "upload-disabled" : ""}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <UploadCloud size={30} />
      <strong>{busy ? "Adding your file…" : label}</strong>
      <span>PDF, DOCX, TXT · Up to 20 MB per file</span>
      <input
        type="file"
        disabled={unavailable}
        multiple={multiple}
        accept=".pdf,.docx,.txt"
        onChange={onChange}
      />
    </label>
  );
}
