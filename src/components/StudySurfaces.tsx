import type { ReactNode } from "react";
import { Search } from "lucide-react";

export function CollectionHeading({
  id,
  title,
  aside,
}: {
  id?: string;
  title: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="collection-heading">
      <h2 id={id}>{title}</h2>
      {aside}
    </header>
  );
}

export function SearchField({ children }: { children: ReactNode }) {
  return (
    <div className="search-field">
      <Search size={18} aria-hidden="true" />
      {children}
    </div>
  );
}

export function DocumentsWorkspace({
  count,
  toolbar,
  documents,
  upload,
}: {
  count: ReactNode;
  toolbar: ReactNode;
  documents: ReactNode;
  upload: ReactNode;
}) {
  return (
    <div className="documents-workspace">
      <section
        className="panel documents-library"
        aria-labelledby="document-library-heading"
      >
        <CollectionHeading
          id="document-library-heading"
          title="Document library"
          aside={count}
        />
        {toolbar}
        {documents}
      </section>
      <section
        className="panel upload-panel"
        aria-labelledby="document-upload-heading"
      >
        <h2 id="document-upload-heading">Upload documents</h2>
        {upload}
      </section>
    </div>
  );
}

export function RecordRow({
  icon,
  info,
  status,
  action,
}: {
  icon: ReactNode;
  info: ReactNode;
  status?: ReactNode;
  action: ReactNode;
}) {
  return (
    <div className="document-row">
      <span className="file-icon">{icon}</span>
      {info}
      {status}
      {action}
    </div>
  );
}

export function DeckSurface({
  badge,
  children,
  actions,
}: {
  badge: ReactNode;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <article className="fc-deck">
      <div className="fc-row">{badge}</div>
      <div className="fc-deck-copy">{children}</div>
      <div className="fc-row fc-deck-actions">{actions}</div>
    </article>
  );
}
