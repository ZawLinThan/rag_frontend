import { CourseCardContent } from "../components/CourseCard";
import type { ReactNode } from "react";
import { ArrowRight, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import PageHeadingFrame from "../components/PageHeadingFrame";
import {
  DeckSurface,
  RecordRow,
  SearchField,
} from "../components/StudySurfaces";
import StudyScope from "../components/StudyScope";
import { UploadDropzone } from "../components/UploadDropzone";

export function SkeletonText({ children }: { children: ReactNode }) {
  return <span className="skeleton sk-text">{children}</span>;
}

export function SkeletonIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      className="skeleton sk-ui-icon"
      width={size}
      height={size}
      aria-hidden="true"
    />
  );
}

export function SkeletonRegion({
  children,
  label = "Loading content",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div
      className="skeleton-region"
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <span className="sr-only">{label}…</span>
      <div aria-hidden="true" inert>
        {children}
      </div>
    </div>
  );
}

export function HeadingSkeleton({
  title,
  description,
  action,
  icon,
  primary = true,
  dynamic = false,
}: {
  title: string;
  description: string;
  action?: string;
  icon?: ReactNode;
  primary?: boolean;
  dynamic?: boolean;
}) {
  return (
    <PageHeadingFrame
      title={dynamic ? <SkeletonText>{title}</SkeletonText> : title}
      description={
        dynamic ? <SkeletonText>{description}</SkeletonText> : description
      }
      actions={
        <>
          {action && (
            <button
              className={primary ? "button primary" : "button"}
              type="button"
            >
              {icon ?? <Plus size={16} />}
              <SkeletonText>{action}</SkeletonText>
            </button>
          )}
          <button className="button theme-toggle" type="button">
            <SkeletonIcon size={16} />
          </button>
        </>
      }
    />
  );
}

export function RecordActionsSkeleton() {
  return (
    <>
      <button type="button">
        <Pencil size={16} />
      </button>
      <button type="button">
        <Trash2 size={16} />
      </button>
    </>
  );
}

export function CourseGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="course-grid">
      {Array.from({ length: count }, (_, i) => (
        <div className="reorderable-course" key={i}>
          <div className="course-card sage">
            <CourseCardContent
              code={<SkeletonText>COURSE 101</SkeletonText>}
              name={<SkeletonText>Introduction to the course</SkeletonText>}
              semester={<SkeletonText>Current semester</SkeletonText>}
              documents={<SkeletonText>2 documents</SkeletonText>}
              notebooks={<SkeletonText>2 notebooks</SkeletonText>}
            />
          </div>
          <div className="course-order-controls">
            <RecordActionsSkeleton />
            <button className="card-drag-handle" type="button">
              <GripVertical size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="fc-grid">
      {Array.from({ length: count }, (_, i) => (
        <DeckSurface
          key={i}
          badge={
            <>
              <span className="fc-icon">
                <SkeletonIcon size={22} />
              </span>
              <span className="fc-label">
                <SkeletonText>10 cards</SkeletonText>
              </span>
            </>
          }
          actions={
            <div className="fc-deck-buttons">
              <button className="button primary" type="button">
                <SkeletonText>Study deck</SkeletonText>
                <ArrowRight size={16} />
              </button>
              <button className="button" type="button">
                <SkeletonText>Manage</SkeletonText>
              </button>
            </div>
          }
        >
          <h3>
            <SkeletonText>Practice questions</SkeletonText>
          </h3>
          <p>
            <SkeletonText>Introduction to the course</SkeletonText>
          </p>
          <p>
            <SkeletonText>Your own questions &amp; answers</SkeletonText>
          </p>
        </DeckSurface>
      ))}
    </div>
  );
}

export function RowSkeleton({ status = true }: { status?: boolean }) {
  return (
    <RecordRow
      icon={<SkeletonIcon size={20} />}
      info={
        <div className={status ? "document-info" : "document-info test-open"}>
          <strong>
            <SkeletonText>
              {status ? "Lecture notes and readings.pdf" : "Practice test"}
            </SkeletonText>
          </strong>
          <small>
            <SkeletonText>
              {status
                ? "Course · Notebook · 2 MB"
                : "Generated practice · 11/12/2026"}
            </SkeletonText>
          </small>
        </div>
      }
      status={
        status && (
          <span className="status">
            <SkeletonText>Ready</SkeletonText>
          </span>
        )
      }
      action={
        <button className="icon-button" type="button">
          <SkeletonIcon size={17} />
        </button>
      }
    />
  );
}
export function DocumentListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="panel document-list">
      {Array.from({ length: count }, (_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

export function SearchSkeleton({ placeholder }: { placeholder: string }) {
  return (
    <SearchField>
      <input className="sk-control" readOnly placeholder={placeholder} />
    </SearchField>
  );
}
export function ToolbarSkeleton({ placeholder }: { placeholder: string }) {
  return (
    <div className="toolbar">
      <SearchSkeleton placeholder={placeholder} />
      <select className="filter sk-control" defaultValue="">
        <option value="">All courses</option>
      </select>
    </div>
  );
}
export function ScopeSkeleton() {
  return (
    <StudyScope
      courses={[]}
      notebooks={[]}
      courseId=""
      notebookId=""
      onChange={() => {}}
    />
  );
}
export function UploadSkeleton() {
  return (
    <div>
      <UploadDropzone />
    </div>
  );
}

export function DocumentPreviewSkeleton({ text = false }: { text?: boolean }) {
  return (
    <SkeletonRegion label="Loading document preview">
      {text ? (
        <pre className="document-preview-text sk-text-preview">
          {[1, 2, 3].map((i) => (
            <span key={i}>
              <SkeletonText>Document text will appear here.</SkeletonText>
              {"\n"}
            </span>
          ))}
        </pre>
      ) : (
        <div className="document-preview-pdf skeleton" />
      )}
      <button className="button" type="button">
        Download original
      </button>
    </SkeletonRegion>
  );
}

export function TestPreviewSkeleton() {
  return (
    <section className="panel test-preview">
      <div className="section-heading">
        <h2>
          <SkeletonText>Practice test</SkeletonText>
        </h2>
        <span className="status">
          <SkeletonText>3 questions</SkeletonText>
        </span>
      </div>
      <p className="notice">
        <SkeletonText>Read each question and select an answer.</SkeletonText>
      </p>
      {[1, 2, 3].map((i) => (
        <section className="test-question" key={i}>
          <span className="eyebrow">
            <SkeletonText>QUESTION {i}</SkeletonText>
          </span>
          <h3>
            <SkeletonText>
              Which answer best describes this concept?
            </SkeletonText>
          </h3>
          <fieldset>
            {[1, 2, 3, 4].map((j) => (
              <label className="test-option" key={j}>
                <input type="radio" />
                <SkeletonText>Sample answer option</SkeletonText>
              </label>
            ))}
          </fieldset>
        </section>
      ))}
      <div className="inline-actions">
        <button className="button primary" type="button">
          <SkeletonText>Reveal sample answer key</SkeletonText>
        </button>
        <button className="button" type="button">
          <SkeletonText>Start again</SkeletonText>
        </button>
      </div>
    </section>
  );
}

export function FlashcardListSkeleton() {
  return (
    <>
      <div className="fc-row">
        <h3>Questions &amp; answers</h3>
        <button className="button" type="button">
          <Plus size={16} /> Add card
        </button>
      </div>
      {[1, 2, 3].map((i) => (
        <div className="fc-card-row" key={i}>
          <div className="card-order-controls">
            <button className="card-drag-handle" type="button">
              <GripVertical size={16} />
            </button>
          </div>
          <div>
            <span className="fc-label">
              <SkeletonText>Card {i}</SkeletonText>
            </span>
            <h3>
              <SkeletonText>Question about your course</SkeletonText>
            </h3>
            <p>
              <SkeletonText>Answer and explanation</SkeletonText>
            </p>
          </div>
          <div className="inline-actions">
            <button className="icon-button" type="button">
              <Pencil size={17} />
            </button>
            <button className="icon-button fc-danger" type="button">
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
