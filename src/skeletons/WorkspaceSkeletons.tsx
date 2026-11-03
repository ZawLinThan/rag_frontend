import type { ReactNode } from "react";
import "../timer.css";

/** Keep the real font metrics and line wrapping while replacing the ink. */
export const SkeletonText = ({ children }: { children: ReactNode }) => (
  <span className="skeleton sk-text">{children}</span>
);
const Icon = ({ size = 17 }: { size?: number }) => (
  <svg
    className="skeleton sk-ui-icon"
    width={size}
    height={size}
    style={{ width: size, height: size }}
    aria-hidden="true"
  />
);
export const WorkspaceHeadingSkeleton = ({
  timer = false,
}: {
  timer?: boolean;
}) => (
  <div className="page-heading">
    <div className="page-heading-copy">
      <h1>
        <SkeletonText>{timer ? "Focus timer" : "Study assistant"}</SkeletonText>
      </h1>
      <p>
        <SkeletonText>
          {timer
            ? "Make a little space for the work that matters."
            : "A little more clarity, one question at a time."}
        </SkeletonText>
      </p>
    </div>
    <div className="page-heading-actions">
      {!timer && (
        <button className="button" disabled>
          <Icon size={16} />
          <SkeletonText>New conversation</SkeletonText>
        </button>
      )}
      <button
        className="button theme-toggle"
        disabled
        aria-label="Loading appearance"
      >
        <Icon size={16} />
      </button>
    </div>
  </div>
);
export const TimerMainSkeleton = () => (
  <section className="timer-main">
    <div className="timer-main-top">
      <div>
        <span className="timer-eyebrow">
          <SkeletonText>YOUR MOMENT TO FOCUS</SkeletonText>
        </span>
        <h2>
          <SkeletonText>Settle into your flow.</SkeletonText>
        </h2>
        <p>
          <SkeletonText>One thing at a time. You’ve got this.</SkeletonText>
        </p>
      </div>
      <span className="timer-state">
        <span />
        <SkeletonText>Ready</SkeletonText>
      </span>
    </div>
    <div className="timer-clock-wrap">
      <div className="timer-clock">
        <svg viewBox="0 0 240 240" aria-hidden="true">
          <circle className="timer-ring-track" cx="120" cy="120" r="108" />
        </svg>
        <div className="timer-clock-content">
          <span className="timer-clock-label">
            <SkeletonText>READY WHEN YOU ARE</SkeletonText>
          </span>
          <span className="timer-digits">
            <SkeletonText>25:00</SkeletonText>
          </span>
          <span className="timer-clock-caption">
            <SkeletonText>A moment for your mind.</SkeletonText>
          </span>
        </div>
      </div>
    </div>
    <div className="timer-actions">
      <button className="button primary timer-primary" disabled>
        <Icon />
        <SkeletonText>Start focusing</SkeletonText>
      </button>
    </div>
    <div className="timer-footer">
      <span>
        <SkeletonText>
          Your timer stays with you as you explore your workspace.
        </SkeletonText>
      </span>
    </div>
  </section>
);
export const TimerSettingsSkeleton = () => (
  <aside className="timer-settings">
    <div className="timer-settings-heading">
      <span className="timer-settings-icon">
        <Icon size={18} />
      </span>
      <div>
        <span className="timer-eyebrow">
          <SkeletonText>MAKE IT YOURS</SkeletonText>
        </span>
        <h3>
          <SkeletonText>Set your time</SkeletonText>
        </h3>
      </div>
    </div>
    <p>
      <SkeletonText>Choose a rhythm that works for you.</SkeletonText>
    </p>
    <div className="timer-presets">
      {[
        ["25", "Quick focus", "Build momentum"],
        ["50", "Deep work", "Find your flow"],
        ["10", "Short break", "Take a breath"],
      ].map(([minutes, title, description]) => (
        <button className="timer-preset" disabled key={minutes}>
          <span className="timer-preset-number">
            <SkeletonText>{minutes}</SkeletonText>
            <small>
              <SkeletonText>MIN</SkeletonText>
            </small>
          </span>
          <span className="timer-preset-copy">
            <strong>
              <SkeletonText>{title}</SkeletonText>
            </strong>
            <small>
              <SkeletonText>{description}</SkeletonText>
            </small>
          </span>
        </button>
      ))}
    </div>
    <label className="timer-custom">
      <span>
        <SkeletonText>Or set your own</SkeletonText>
      </span>
      <span className="timer-custom-input">
        <input
          type="number"
          value="25"
          disabled
          readOnly
          className="sk-control"
        />
        <span>
          <SkeletonText>minutes</SkeletonText>
        </span>
      </span>
    </label>
    <p className="timer-helper">
      <SkeletonText>Choose any length from 1 to 240 minutes.</SkeletonText>
    </p>
    <div className="timer-tip">
      <span>
        <SkeletonText>✦</SkeletonText>
      </span>
      <div>
        <strong>
          <SkeletonText>A gentle reminder</SkeletonText>
        </strong>
        <p>
          <SkeletonText>
            A focused session is a fresh start, not a race.
          </SkeletonText>
        </p>
      </div>
    </div>
    <span className="timer-back-link">
      <SkeletonText>Explore your courses</SkeletonText>
      <Icon size={15} />
    </span>
  </aside>
);
export const ConversationHistorySkeleton = ({
  count = 3,
}: {
  count?: number;
}) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <div className="chat-history-item" key={i}>
        <strong>
          <SkeletonText>A recent conversation</SkeletonText>
        </strong>
        <small>
          <SkeletonText>10/31/2026</SkeletonText>
        </small>
      </div>
    ))}
  </>
);
export const AssistantConversationSkeleton = () => (
  <section className="panel chat-panel">
    <div className="chat-scope">
      <span className="history-toggle">
        <Icon />
      </span>
      <span className="scope-icon">
        <Icon />
      </span>
      <span className="scope-copy">
        <span className="assistant-kicker">
          <SkeletonText>CURRENT CONVERSATION</SkeletonText>
        </span>
        <strong>
          <SkeletonText>your notes</SkeletonText>
        </strong>
      </span>
      <span className="scope-count">
        <SkeletonText>0 ready</SkeletonText>
      </span>
    </div>
    <div className="chat-messages">
      <div className="chat-welcome">
        <span className="welcome-orbit">
          <span className="large-spark">
            <Icon size={28} />
          </span>
        </span>
        <span className="assistant-kicker">
          <SkeletonText>YOUR STUDY COMPANION</SkeletonText>
        </span>
        <h2>
          <SkeletonText>Good questions start here.</SkeletonText>
        </h2>
        <p>
          <SkeletonText>
            Choose a course and add documents to get started. Once processing is
            complete, your notes will be ready to explore here.
          </SkeletonText>
        </p>
        <span className="assistant-upload-link">
          <Icon size={16} />
          <SkeletonText>Go to my documents</SkeletonText>
          <Icon size={15} />
        </span>
      </div>
    </div>
    <div className="chat-composer">
      <textarea
        rows={2}
        disabled
        className="sk-control"
        value="Ask something about your notes…"
        readOnly
      />
      <button className="button primary" disabled>
        <Icon />
        <span>
          <SkeletonText>Send</SkeletonText>
        </span>
      </button>
    </div>
    <p className="chat-disclaimer">
      <SkeletonText>
        Answers use your selected notes · Enter to send, Shift + Enter for a new
        line
      </SkeletonText>
    </p>
  </section>
);
export const AssistantSourcesSkeleton = () => (
  <aside className="panel source-panel">
    <div className="sources-heading">
      <span className="sources-heading-icon">
        <Icon size={18} />
      </span>
      <div>
        <span className="assistant-kicker">
          <SkeletonText>STUDY MATERIAL</SkeletonText>
        </span>
        <h3>
          <SkeletonText>Your sources</SkeletonText>
        </h3>
      </div>
    </div>
    <p>
      <SkeletonText>Choose the notes your assistant should use.</SkeletonText>
    </p>
    {[
      ["Course", "Select a course"],
      ["Notebook", "All notebooks"],
      ["Specific file", "All files in scope"],
    ].map(([label, option]) => (
      <label key={label}>
        <SkeletonText>{label}</SkeletonText>
        <select disabled className="sk-control">
          <option>{option}</option>
        </select>
      </label>
    ))}
    <div className="source-list">
      <div className="sources-list-heading">
        <span className="assistant-kicker">
          <SkeletonText>READY TO SEARCH</SkeletonText>
        </span>
        <span>
          <SkeletonText>0</SkeletonText>
        </span>
      </div>
      <div className="source-list-scroll">
        <div className="assistant-source-empty">
          <Icon size={18} />
          <strong>
            <SkeletonText>No ready sources yet</SkeletonText>
          </strong>
          <span>
            <SkeletonText>
              Documents appear here once processing is complete.
            </SkeletonText>
          </span>
        </div>
      </div>
    </div>
  </aside>
);
