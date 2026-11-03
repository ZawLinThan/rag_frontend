import type { CSSProperties, ReactNode } from "react";

export const Skeleton = ({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) => (
  <span className={`skeleton ${className}`} style={style} aria-hidden="true" />
);
export const SkeletonRegion = ({
  children,
  label = "Loading content",
}: {
  children: ReactNode;
  label?: string;
}) => (
  <div role="status" aria-label={label} aria-busy="true">
    <span className="sr-only">{label}…</span>
    <div aria-hidden="true">{children}</div>
  </div>
);
export const HeadingSkeleton = ({ action = true }: { action?: boolean }) => (
  <div className="page-heading">
    <div className="page-heading-copy sk-heading-copy">
      <Skeleton className="sk-title" />
      <Skeleton className="sk-subtitle" />
    </div>
    <div className="page-heading-actions">
      {action && <Skeleton className="sk-button" />}
      <Skeleton className="sk-theme" />
    </div>
  </div>
);
export const LinesSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="skeleton-stack">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton
        key={i}
        className={i === count - 1 ? "sk-line sk-short" : "sk-line"}
      />
    ))}
  </div>
);
export const CourseCardSkeleton = () => (
  <div className="reorderable-course">
    <div className="course-card sk-course">
      <Skeleton className="sk-code" />
      <Skeleton className="sk-card-title" />
      <div className="sk-course-description">
        <Skeleton className="sk-line sk-medium" />
      </div>
      <div className="course-card-bottom">
        <Skeleton className="sk-meta" />
        <Skeleton className="sk-meta" />
      </div>
    </div>
  </div>
);
export const CourseGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="course-grid">
    {Array.from({ length: count }, (_, i) => (
      <CourseCardSkeleton key={i} />
    ))}
  </div>
);
export const DeckSkeleton = () => (
  <div className="fc-deck">
    <div className="fc-row">
      <Skeleton className="sk-icon" />
      <Skeleton className="sk-pill" />
    </div>
    <div>
      <Skeleton className="sk-card-title" />
      <Skeleton className="sk-deck-description" />
    </div>
    <div className="fc-row">
      <Skeleton className="sk-meta" />
      <Skeleton className="sk-button" />
    </div>
  </div>
);
export const CardSkeleton = DeckSkeleton;
export const CardGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="fc-page">
    <div className="fc-grid">
      {Array.from({ length: count }, (_, i) => (
        <DeckSkeleton key={i} />
      ))}
    </div>
  </div>
);
export const RowSkeleton = ({ status = true }: { status?: boolean }) => (
  <div className="document-row">
    <Skeleton className="sk-file-icon" />
    <div className="document-info sk-row-copy">
      <Skeleton className="sk-row-title" />
      <Skeleton className="sk-row-meta" />
    </div>
    {status && <Skeleton className="sk-pill" />}
    <Skeleton className="sk-action-icon" />
  </div>
);
export const ListSkeleton = ({
  count = 4,
  status = true,
}: {
  count?: number;
  status?: boolean;
}) => (
  <section className="panel">
    {Array.from({ length: count }, (_, i) => (
      <RowSkeleton key={i} status={status} />
    ))}
  </section>
);
export const DocumentListSkeleton = ListSkeleton;
export const SearchSkeleton = () => (
  <div className="search-field sk-search">
    <Skeleton className="sk-search-icon" />
    <Skeleton className="sk-search-text" />
  </div>
);
export const ToolbarSkeleton = () => (
  <div className="toolbar">
    <SearchSkeleton />
    <Skeleton className="sk-select" />
  </div>
);
export const ScopeSkeleton = () => (
  <div className="upload-controls">
    {[0, 1].map((i) => (
      <div className="sk-field" key={i}>
        <Skeleton className="sk-label" />
        <Skeleton className="sk-input" />
      </div>
    ))}
  </div>
);
export const UploadSkeleton = () => (
  <div className="dropzone sk-dropzone">
    <Skeleton className="sk-upload-icon" />
    <Skeleton className="sk-upload-title" />
    <Skeleton className="sk-upload-subtitle" />
    <Skeleton className="sk-upload-subtitle" />
  </div>
);
export const FormSkeleton = ({ fields = 3 }: { fields?: number }) => (
  <div className="panel skeleton-stack">
    {Array.from({ length: fields }, (_, i) => (
      <div className="sk-field" key={i}>
        <Skeleton className="sk-label" />
        <Skeleton className="sk-input" />
      </div>
    ))}
    <Skeleton className="sk-button" />
  </div>
);
export const DocumentPreviewSkeleton = () => (
  <SkeletonRegion label="Loading document preview">
    <div className="document-preview-pdf sk-preview" />
  </SkeletonRegion>
);
export const TestPreviewSkeleton = () => (
  <section className="panel test-preview">
    <div className="section-heading">
      <Skeleton className="sk-card-title" />
      <Skeleton className="sk-pill" />
    </div>
    <div className="notice">
      <Skeleton className="sk-line sk-medium" />
    </div>
    {[0, 1, 2].map((i) => (
      <section className="test-question" key={i}>
        <Skeleton className="sk-label" />
        <Skeleton className="sk-question" />
        {[0, 1, 2, 3].map((j) => (
          <div className="test-option" key={j}>
            <Skeleton className="sk-radio" />
            <Skeleton className="sk-line sk-medium" />
          </div>
        ))}
      </section>
    ))}
    <div className="inline-actions">
      <Skeleton className="sk-button" />
      <Skeleton className="sk-button" />
    </div>
  </section>
);
