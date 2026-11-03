import {
  WorkspaceHeadingSkeleton,
  TimerMainSkeleton,
  TimerSettingsSkeleton,
  AssistantConversationSkeleton,
  AssistantSourcesSkeleton,
} from "./WorkspaceSkeletons";
import {
  CardGridSkeleton,
  CourseGridSkeleton,
  FormSkeleton,
  HeadingSkeleton,
  ListSkeleton,
  LinesSkeleton,
  ScopeSkeleton,
  SearchSkeleton,
  Skeleton,
  SkeletonRegion,
  ToolbarSkeleton,
  UploadSkeleton,
} from "./components";

const SectionHeading = () => (
  <div className="section-heading">
    <Skeleton className="sk-section-title" />
    <Skeleton className="sk-meta" />
  </div>
);
export const CoursesContentSkeleton = () => (
  <>
    <SearchSkeleton />
    <CourseGridSkeleton count={6} />
  </>
);
export const DocumentsContentSkeleton = () => (
  <>
    <section className="panel upload-panel">
      <ScopeSkeleton />
      <UploadSkeleton />
    </section>
    <ToolbarSkeleton />
    <ListSkeleton />
  </>
);
export const FlashcardsContentSkeleton = () => (
  <>
    <ToolbarSkeleton />
    <CardGridSkeleton count={6} />
  </>
);
export const TestsContentSkeleton = () => (
  <section className="panel">
    <SectionHeading />
    {[0, 1, 2, 3].map((i) => (
      <div className="document-row" key={i}>
        <Skeleton className="sk-file-icon" />
        <div className="document-info sk-row-copy">
          <Skeleton className="sk-row-title" />
          <Skeleton className="sk-row-meta" />
        </div>
        <Skeleton className="sk-action-icon" />
      </div>
    ))}
  </section>
);
export const OverviewPageSkeleton = () => (
  <>
    <HeadingSkeleton />
    <section className="hero-panel">
      <div className="sk-hero-copy">
        <Skeleton className="sk-label" />
        <Skeleton className="sk-hero-title" />
        <Skeleton className="sk-hero-title sk-medium" />
        <Skeleton className="sk-hero-description" />
        <Skeleton className="sk-button" />
      </div>
      <div className="hero-art">
        <Skeleton className="sk-hero-art" />
      </div>
    </section>
    <div className="stats-grid">
      {[0, 1, 2, 3].map((i) => (
        <div className="stat" key={i}>
          <Skeleton className="sk-icon" />
          <div className="sk-stat-copy">
            <Skeleton className="sk-stat-value" />
            <Skeleton className="sk-meta" />
          </div>
        </div>
      ))}
    </div>
    <SectionHeading />
    <CourseGridSkeleton />
    <div className="dashboard-bottom">
      {[0, 1].map((i) => (
        <section className="panel" key={i}>
          <LinesSkeleton />
          <div className="sk-panel-action">
            <Skeleton className="sk-button" />
          </div>
        </section>
      ))}
    </div>
  </>
);
export const CoursesPageSkeleton = () => (
  <>
    <HeadingSkeleton />
    <CoursesContentSkeleton />
  </>
);
export const CoursePageSkeleton = () => (
  <>
    <Skeleton className="sk-back" />
    <HeadingSkeleton />
    <div className="notebook-create-action">
      <Skeleton className="sk-button" />
    </div>
    <div className="notebook-grid">
      {[0, 1, 2].map((i) => (
        <div className="panel notebook sk-notebook" key={i}>
          <Skeleton className="sk-notebook-icon" />
          <Skeleton className="sk-card-title" />
          <Skeleton className="sk-meta" />
        </div>
      ))}
    </div>
    <SectionHeading />
    <UploadSkeleton />
    <ListSkeleton />
    <Skeleton className="sk-button" />
  </>
);
export const DocumentsPageSkeleton = () => (
  <>
    <HeadingSkeleton action={false} />
    <DocumentsContentSkeleton />
  </>
);
export const DocumentPageSkeleton = () => (
  <>
    <Skeleton className="sk-back" />
    <HeadingSkeleton action={false} />
    <section className="panel reader sk-reader">
      <Skeleton className="sk-label" />
      <Skeleton className="sk-section-title" />
      <Skeleton className="sk-meta" />
      <Skeleton className="sk-meta" />
      <div className="document-preview">
        <Skeleton className="sk-card-title" />
        <div className="document-preview-pdf sk-preview" />
      </div>
      <div className="inline-actions">
        <Skeleton className="sk-button" />
        <Skeleton className="sk-button" />
      </div>
    </section>
  </>
);
export const ChatPageSkeleton = () => (
  <div className="study-assistant sk-workspace" inert aria-hidden="true">
    <WorkspaceHeadingSkeleton />
    <div className="chat-history-layout">
      <div className="chat-layout">
        <AssistantConversationSkeleton />
        <AssistantSourcesSkeleton />
      </div>
    </div>
  </div>
);
export const FlashcardsPageSkeleton = () => (
  <>
    <HeadingSkeleton />
    <FlashcardsContentSkeleton />
  </>
);
export const TestsPageSkeleton = () => (
  <>
    <HeadingSkeleton />
    <TestsContentSkeleton />
  </>
);
export const SettingsPageSkeleton = () => (
  <>
    <HeadingSkeleton action={false} />
    <FormSkeleton />
    <FormSkeleton fields={1} />
  </>
);
export const TimerPageSkeleton = () => (
  <div className="timer-page sk-workspace" inert aria-hidden="true">
    <WorkspaceHeadingSkeleton timer />
    <div className="timer-layout">
      <TimerMainSkeleton />
      <TimerSettingsSkeleton />
    </div>
  </div>
);
export const AuthPageSkeleton = () => (
  <div className="skeleton-auth">
    <FormSkeleton />
    <FormSkeleton />
  </div>
);
export const CallbackPageSkeleton = () => (
  <section className="panel">
    <LinesSkeleton count={2} />
  </section>
);
export const NotFoundPageSkeleton = CallbackPageSkeleton;
export const QuizzesPageSkeleton = TestsPageSkeleton;
export const PageSkeleton = ({ pathname }: { pathname: string }) => {
  const parts = pathname.split("/").filter(Boolean);
  const content =
    parts[0] === "courses" ? (
      parts[1] ? (
        <CoursePageSkeleton />
      ) : (
        <CoursesPageSkeleton />
      )
    ) : parts[0] === "documents" ? (
      parts[1] ? (
        <DocumentPageSkeleton />
      ) : (
        <DocumentsPageSkeleton />
      )
    ) : parts[0] === "chat" ? (
      <ChatPageSkeleton />
    ) : parts[0] === "flashcards" ? (
      <FlashcardsPageSkeleton />
    ) : parts[0] === "tests" ? (
      <TestsPageSkeleton />
    ) : parts[0] === "quizzes" ? (
      <QuizzesPageSkeleton />
    ) : parts[0] === "settings" ? (
      <SettingsPageSkeleton />
    ) : parts[0] === "timer" ? (
      <TimerPageSkeleton />
    ) : !parts[0] ? (
      <OverviewPageSkeleton />
    ) : (
      <NotFoundPageSkeleton />
    );
  return (
    <SkeletonRegion label="Loading your study workspace">
      {content}
    </SkeletonRegion>
  );
};
export const LayoutPageSkeleton = ({ pathname }: { pathname: string }) => (
  <div className="app-layout skeleton-layout">
    <aside className="sidebar">
      <Skeleton className="sk-brand" />
      <div className="workspace-label">
        <Skeleton className="sk-label" />
      </div>
      <nav>
        {Array.from({ length: 7 }, (_, i) => (
          <div className="nav-item" key={i}>
            <Skeleton className="sk-nav-icon" />
            <Skeleton className="sk-nav-text" />
          </div>
        ))}
      </nav>
      <div className="nav-item">
        <Skeleton className="sk-nav-icon" />
        <Skeleton className="sk-nav-text" />
      </div>
      <div className="profile">
        <Skeleton className="sk-avatar" />
        <div className="sk-row-copy">
          <Skeleton className="sk-row-title" />
          <Skeleton className="sk-row-meta" />
        </div>
      </div>
    </aside>
    <div className="main-shell">
      <main>
        <PageSkeleton pathname={pathname} />
      </main>
    </div>
  </div>
);
