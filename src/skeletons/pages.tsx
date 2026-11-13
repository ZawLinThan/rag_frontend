import {
  ArrowLeft,
  ArrowRight,
  FileText,
  FolderOpen,
  GripVertical,
  Plus,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import WorkspaceSidebar from "../components/WorkspaceSidebar";
import {
  CollectionHeading,
  DocumentsWorkspace,
} from "../components/StudySurfaces";
import {
  OverviewHero,
  OverviewPracticePanels,
  OverviewTotals,
} from "../components/OverviewSections";
import {
  WorkspaceHeadingSkeleton,
  TimerMainSkeleton,
  SpotifyPanelSkeleton,
  AssistantConversationSkeleton,
  AssistantSourcesSkeleton,
} from "./WorkspaceSkeletons";
import {
  CardGridSkeleton,
  CourseGridSkeleton,
  DocumentListSkeleton,
  DocumentPreviewSkeleton,
  HeadingSkeleton,
  RecordActionsSkeleton,
  RowSkeleton,
  ScopeSkeleton,
  SearchSkeleton,
  SkeletonRegion,
  SkeletonText,
  ToolbarSkeleton,
  UploadSkeleton,
} from "./components";

export const CoursesContentSkeleton = () => (
  <>
    <SearchSkeleton placeholder="Search your courses…" />
    <CourseGridSkeleton count={6} />
  </>
);
export const DocumentsContentSkeleton = () => (
  <DocumentsWorkspace
    count={
      <span>
        <SkeletonText>4 documents</SkeletonText>
      </span>
    }
    toolbar={<ToolbarSkeleton placeholder="Search documents…" />}
    documents={<DocumentListSkeleton />}
    upload={
      <>
        <ScopeSkeleton />
        <UploadSkeleton />
      </>
    }
  />
);
export const FlashcardsContentSkeleton = () => (
  <>
    <ToolbarSkeleton placeholder="Search your decks…" />
    <CardGridSkeleton count={6} />
  </>
);
export const TestsContentSkeleton = () => (
  <section className="panel tests-library">
    <CollectionHeading
      title="Your tests"
      aside={
        <span>
          <SkeletonText>4 tests</SkeletonText>
        </span>
      }
    />
    {[1, 2, 3, 4].map((i) => (
      <RowSkeleton status={false} key={i} />
    ))}
  </section>
);
export const OverviewCoursesSkeleton = () => (
  <section className="overview-courses">
    <div className="section-heading">
      <h2>
        Your courses{" "}
        <span>
          <SkeletonText>4</SkeletonText>
        </span>
      </h2>
      <Link to="/courses">
        View all courses <ArrowRight size={16} />
      </Link>
    </div>
    <CourseGridSkeleton />
  </section>
);
const OverviewPageSkeleton = () => (
  <div className="overview-page">
    <HeadingSkeleton
      dynamic
      title="Welcome back, Student!"
      description="Pick up where you left off, or discover something new."
      action="Upload notes"
      icon={<Plus size={17} />}
    />
    <OverviewHero />
    <OverviewTotals loading />
    <OverviewCoursesSkeleton />
    <OverviewPracticePanels />
  </div>
);
const CoursesPageSkeleton = () => (
  <div className="courses-page study-page">
    <HeadingSkeleton
      title="My courses"
      description="Organize each course into notebooks, then bring your notes to life."
      action="New course"
      icon={<Plus size={17} />}
    />
    <CoursesContentSkeleton />
  </div>
);
export const CoursePageSkeleton = () => (
  <div className="course-page study-page">
    <Link className="back-link" to="/courses">
      <ArrowLeft size={16} /> My courses
    </Link>
    <HeadingSkeleton
      dynamic
      title="Introduction to the course"
      description="COURSE 101 · Current semester"
      action="Ask this course"
      icon={<Sparkles size={17} />}
    />
    <div className="notebook-create-action">
      <button className="button" type="button">
        <Plus size={16} /> New notebook
      </button>
    </div>
    <div className="notebook-grid">
      {[1, 2, 3].map((i) => (
        <div className="notebook-tile" key={i}>
          <button
            className={`panel notebook${i === 1 ? " selected" : ""}`}
            type="button"
          >
            <FolderOpen size={25} />
            <h3>
              <SkeletonText>Lecture notes</SkeletonText>
            </h3>
            <p>
              <SkeletonText>2 documents</SkeletonText>
            </p>
          </button>
          <div className="notebook-tile-actions">
            <button type="button" className="card-drag-handle">
              <GripVertical size={16} />
            </button>
            <RecordActionsSkeleton />
          </div>
        </div>
      ))}
    </div>
    <div className="section-heading">
      <h2>
        <SkeletonText>Lecture notes</SkeletonText>
      </h2>
      <div className="inline-actions">
        <span className="text-link">Create a test</span>
        <span className="text-link">Create flashcards</span>
      </div>
    </div>
    <UploadSkeleton />
    <DocumentListSkeleton />
    <button type="button" className="button">
      Ask this notebook <Sparkles size={16} />
    </button>
  </div>
);
const DocumentsPageSkeleton = () => (
  <div className="documents-page">
    <HeadingSkeleton
      title="My documents"
      description="Store your lecture notes, readings, and sample tests in course notebooks."
    />
    <DocumentsContentSkeleton />
  </div>
);
export const DocumentPageSkeleton = () => (
  <div className="document-page study-page">
    <Link className="back-link" to="/documents">
      <ArrowLeft size={16} /> My documents
    </Link>
    <HeadingSkeleton
      dynamic
      title="Lecture notes and readings.pdf"
      description="Course / Notebook"
    />
    <section className="panel reader">
      <span className="eyebrow">
        <FileText size={16} /> DOCUMENT DETAILS
      </span>
      <h2>
        <SkeletonText>Lecture notes and readings.pdf</SkeletonText>
      </h2>
      <p>
        <SkeletonText>2 MB · PDF · Ready</SkeletonText>
      </p>
      <p>
        <SkeletonText>Added 11/12/2026</SkeletonText>
      </p>
      <div className="inline-actions">
        <button className="button" type="button">
          Rename document
        </button>
        <button className="button primary" type="button">
          <Sparkles size={16} /> Ask this file
        </button>
      </div>
      <section className="document-preview">
        <h3>Preview</h3>
        <DocumentPreviewSkeleton />
      </section>
    </section>
  </div>
);
export const ChatPageSkeleton = () => (
  <div className="study-assistant study-page sk-workspace">
    <WorkspaceHeadingSkeleton />
    <div className="chat-history-layout">
      <div className="chat-layout">
        <AssistantConversationSkeleton />
        <AssistantSourcesSkeleton />
      </div>
    </div>
  </div>
);
const FlashcardsPageSkeleton = () => (
  <div className="fc-page study-page">
    <HeadingSkeleton
      title="Flashcards"
      description="Create your own cards or turn your notes into a practice deck."
      action="Create deck"
    />
    <FlashcardsContentSkeleton />
  </div>
);
const TestsPageSkeleton = () => (
  <div className="tests-page study-page">
    <HeadingSkeleton
      title="Tests"
      description="Practice with a test from your notebook or use a sample test as a reference."
      action="Create test"
    />
    <TestsContentSkeleton />
  </div>
);
const SettingsPageSkeleton = () => (
  <div className="settings-page study-page">
    <HeadingSkeleton
      title="Settings"
      description="A study space that works for you."
    />
    <section className="panel settings-panel">
      <h2>Study preferences</h2>
      <form>
        <label>
          Display name
          <input className="sk-control" readOnly />
        </label>
        <label>
          Daily study goal (minutes)
          <input
            className="sk-control"
            type="number"
            min="5"
            max="120"
            value="20"
            readOnly
          />
        </label>
        <button type="button" className="button primary">
          Save preferences
        </button>
      </form>
    </section>
    <section className="panel settings-panel">
      <h2>Account &amp; workspace</h2>
      <div className="inline-actions">
        <button type="button" className="button">
          Sign out
        </button>
      </div>
    </section>
  </div>
);
const TimerPageSkeleton = () => (
  <div className="timer-page study-page sk-workspace">
    <WorkspaceHeadingSkeleton timer />
    <div className="timer-music-layout">
      <TimerMainSkeleton />
      <SpotifyPanelSkeleton />
    </div>
  </div>
);

export function LayoutPageSkeleton({ pathname }: { pathname: string }) {
  const [page, detail] = pathname.split("/").filter(Boolean);
  const content =
    page === "courses" ? (
      detail ? (
        <CoursePageSkeleton />
      ) : (
        <CoursesPageSkeleton />
      )
    ) : page === "documents" ? (
      detail ? (
        <DocumentPageSkeleton />
      ) : (
        <DocumentsPageSkeleton />
      )
    ) : page === "chat" ? (
      <ChatPageSkeleton />
    ) : page === "timer" ? (
      <TimerPageSkeleton />
    ) : page === "flashcards" ? (
      <FlashcardsPageSkeleton />
    ) : page === "tests" || page === "quizzes" ? (
      <TestsPageSkeleton />
    ) : page === "settings" ? (
      <SettingsPageSkeleton />
    ) : !page ? (
      <OverviewPageSkeleton />
    ) : (
      <div className="panel completion route-message">
        <span className="eyebrow">404</span>
        <h1>This page took a study break.</h1>
        <p>Let’s get you back to your workspace.</p>
        <Link className="button primary" to="/">
          Back to overview
        </Link>
      </div>
    );
  return (
    <div className="app-layout">
      <div inert aria-hidden="true" className="workspace-sidebar-loading">
        <WorkspaceSidebar loading />
      </div>
      <div className="main-shell">
        <main className={page === "timer" ? "timer-workspace" : undefined}>
          <SkeletonRegion label="Loading your study workspace">
            {content}
          </SkeletonRegion>
        </main>
      </div>
    </div>
  );
}
