import { Plus } from "lucide-react";
import {
  HeadingSkeleton,
  SkeletonIcon as Icon,
  SkeletonText,
} from "./components";
import { MusicProviderSelector } from "../components/MusicProviderSelector";
import "../timer.css";

export const WorkspaceHeadingSkeleton = ({
  timer = false,
}: {
  timer?: boolean;
}) => (
  <HeadingSkeleton
    title={timer ? "Focus timer" : "Study assistant"}
    description={
      timer
        ? "Make a little space for the work that matters."
        : "A little more clarity, one question at a time."
    }
    action={timer ? undefined : "New conversation"}
    icon={<Plus size={16} />}
    primary={false}
  />
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
      <span className="timer-state idle">
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
    <div className="timer-duration-controls">
      <div className="timer-duration-options">
        {["25 min", "50 min", "10 min", "Custom"].map((label) => (
          <button
            className={`button timer-duration-button${label === "25 min" ? " selected" : ""}`}
            type="button"
            key={label}
          >
            <SkeletonText>{label}</SkeletonText>
          </button>
        ))}
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
export const ConversationHistorySkeleton = ({
  count = 3,
}: {
  count?: number;
}) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <button className="chat-history-item" type="button" key={i}>
        <strong>
          <SkeletonText>A recent conversation</SkeletonText>
        </strong>
        <small>
          <SkeletonText>10/31/2026</SkeletonText>
        </small>
      </button>
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

export const SpotifyPanelSkeleton = () => (
  <section className="spotify-panel">
    <MusicProviderSelector provider="spotify" />
    <div className="spotify-heading">
      <div>
        <span className="timer-eyebrow">
          <SkeletonText>A SOUNDTRACK FOR YOUR SESSION</SkeletonText>
        </span>
        <h2>
          <Icon size={22} />
          <SkeletonText>Spotify</SkeletonText>
        </h2>
      </div>
      <span className="text-link">
        <SkeletonText>Open Spotify</SkeletonText>
        <Icon size={14} />
      </span>
    </div>
    <p className="spotify-intro">
      <SkeletonText>
        Set the mood. Keep your focus timer in view while you listen.
      </SkeletonText>
    </p>
    <div className="spotify-connection">
      <span className="spotify-connection-icon">
        <Icon size={21} />
      </span>
      <div>
        <strong>
          <SkeletonText>Bring your music along</SkeletonText>
        </strong>
        <p>
          <SkeletonText>
            Connect to see what’s playing, or paste a Spotify link below.
          </SkeletonText>
        </p>
      </div>
      <button className="button spotify-connect" disabled>
        <SkeletonText>Connect Spotify</SkeletonText>
      </button>
    </div>
    <div className="spotify-link-form">
      <label>
        <SkeletonText>Your playlist, album, or track</SkeletonText>
      </label>
      <div>
        <span className="spotify-link-icon">
          <Icon />
        </span>
        <input className="sk-control" disabled />
        <button className="button" disabled>
          <SkeletonText>Load player</SkeletonText>
        </button>
      </div>
    </div>
    <div className="spotify-empty">
      <Icon size={32} />
      <h3>
        <SkeletonText>A little music. A little momentum.</SkeletonText>
      </h3>
      <p>
        <SkeletonText>
          Copy a link from Spotify’s Share menu and load it here to start
          listening.
        </SkeletonText>
      </p>
      <span className="text-link">
        <SkeletonText>Find something on Spotify</SkeletonText>
        <Icon size={14} />
      </span>
    </div>
    <p className="spotify-footnote">
      <SkeletonText>
        Music provided by Spotify. Playback availability depends on your Spotify
        account and browser. Timer controls only affect your focus session.
      </SkeletonText>
    </p>
  </section>
);
