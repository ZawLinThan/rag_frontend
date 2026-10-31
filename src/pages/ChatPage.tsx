import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Send,
  FileText,
  Plus,
  PanelLeftOpen,
  PanelLeftClose,
  BookOpen,
  ArrowUpRight,
  Layers3,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useStudyData } from "../hooks/useStudyQueries";
import {
  createChatSession,
  sendChatMessage,
  getChatSessions,
  getChatSession,
  type ChatSource,
} from "../lib/chatApi";
import { readyDocumentsInScope } from "../lib/chatScope";
import { questionSchema } from "../zodSchema/studySchema";
import PageHeading from "../components/PageHeading";
import QueryState from "../components/QueryState";
import { useAuthStore } from "../stores/authStore";
import { getNameInitials } from "../lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: ChatSource[];
};
type Session = { id: string; scope: string };

const ChatPage = () => {
  const data = useStudyData();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const history = useQuery({
    queryKey: ["study", "chat-sessions"],
    queryFn: getChatSessions,
  });
  const [params] = useSearchParams();
  const [selectedCourse, setCourse] = useState(params.get("course") || "");
  const [notebook, setNotebook] = useState(params.get("notebook") || "");
  const [file, setFile] = useState(params.get("file") || "");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [restoredIds, setRestoredIds] = useState<string[] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const course = selectedCourse || data.courses[0]?.id || "";
  const scopedNotebooks = data.notebooks.filter(
    (item) => item.courseId === course,
  );
  const scopedFiles = data.documents.filter(
    (item) =>
      item.courseId === course && (!notebook || item.notebookId === notebook),
  );
  const sources =
    restoredIds === null
      ? readyDocumentsInScope(data.documents, course, notebook, file)
      : data.documents.filter(
          (item) => restoredIds.includes(item.id) && item.status === "ready",
        );
  const scope = sources
    .map((item) => item.id)
    .sort()
    .join(",");
  const scopeChanged =
    restoredIds === null && session !== null && session.scope !== scope;

  const reset = () => {
    setSession(null);
    setRestoredIds(null);
    setMessages([]);
    setError("");
  };

  const ask = async (value: string) => {
    if (lock.current) return;
    const result = questionSchema.safeParse({ question: value });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    if (!sources.length) {
      setError("No ready documents are available in this selection.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      let activeSession = session;
      if (
        !activeSession ||
        (restoredIds === null && activeSession.scope !== scope)
      ) {
        const id = await createChatSession(sources.map((item) => item.id));
        activeSession = { id, scope };
        setSession(activeSession);
        setMessages([]);
        void queryClient.invalidateQueries({
          queryKey: ["study", "chat-sessions"],
        });
      }
      const answer = await sendChatMessage(
        activeSession.id,
        result.data.question,
      );
      setMessages((previous) => [
        ...previous,
        {
          id: answer.userMessage.id,
          role: "user",
          text: answer.userMessage.content,
        },
        {
          id: answer.assistantMessage.id,
          role: "assistant",
          text: answer.answer,
          sources: answer.sources,
        },
      ]);
      setQuestion("");
      void queryClient.invalidateQueries({
        queryKey: ["study", "chat-sessions"],
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not answer your question. Please try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  const openSession = async (id: string) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const saved = await getChatSession(id);
      setRestoredIds(saved.documentIds);
      setSession({
        id: saved.id,
        scope: [...saved.documentIds].sort().join(","),
      });
      setMessages(
        saved.messages.map((message) => ({
          id: message.id,
          role: message.role,
          text: message.content,
          sources: message.sources,
        })),
      );
      const first = data.documents.find((document) =>
        saved.documentIds.includes(document.id),
      );
      if (first?.courseId) setCourse(first.courseId);
      setNotebook("");
      setFile("");
      setQuestion("");
      setHistoryOpen(false);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not open this conversation.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  if (data.isPending || data.error)
    return (
      <QueryState
        pending={data.isPending}
        error={data.error}
        retry={data.refetch}
      />
    );

  return (
    <div className="study-assistant">
      <PageHeading
        title="Study assistant"
        description="A little more clarity, one question at a time."
        action={
          <button className="button" disabled={busy} onClick={reset}>
            <Plus size={16} /> New conversation
          </button>
        }
      />
      <div
        className={`chat-history-layout ${historyOpen ? "history-open" : ""}`}
      >
        <aside
          id="chat-history"
          className="panel chat-history"
          aria-label="Chat history"
          aria-hidden={!historyOpen}
          inert={!historyOpen}
        >
          <div className="history-heading">
            <div>
              <span className="assistant-kicker">YOUR WORKSPACE</span>
              <h3>Conversations</h3>
            </div>
            <button
              className="history-close-button"
              type="button"
              aria-label="Close chat history"
              onClick={() => setHistoryOpen(false)}
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
          <p className="history-intro">Pick up where you left off.</p>
          {history.isPending && <p>Loading conversations…</p>}
          {history.error && (
            <p className="error" role="alert">
              Could not load chat history.{" "}
              <button
                className="text-link"
                onClick={() => void history.refetch()}
              >
                Try again
              </button>
            </p>
          )}
          {!history.isPending && !history.error && !history.data?.length && (
            <p>No conversations yet.</p>
          )}
          {[...(history.data ?? [])]
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((item) => (
              <button
                key={item.id}
                className={`chat-history-item ${session?.id === item.id ? "selected" : ""}`}
                disabled={busy}
                aria-current={session?.id === item.id ? "true" : undefined}
                onClick={() => void openSession(item.id)}
              >
                <strong>
                  {item.title ||
                    item.messages.find((message) => message.role === "user")
                      ?.content ||
                    "New conversation"}
                </strong>
                <small>{new Date(item.updatedAt).toLocaleDateString()}</small>
              </button>
            ))}
        </aside>
        <div className="chat-layout">
          <section className="panel chat-panel">
            <div className="chat-scope">
              <button
                className="history-toggle"
                type="button"
                aria-expanded={historyOpen}
                aria-controls="chat-history"
                aria-label="Open chat history"
                onClick={() => setHistoryOpen(true)}
              >
                <PanelLeftOpen size={17} />
              </button>
              <span className="scope-icon">
                <Sparkles size={17} />
              </span>
              <span className="scope-copy">
                <span className="assistant-kicker">CURRENT CONVERSATION</span>
                <strong>
                  {restoredIds !== null
                    ? "saved conversation"
                    : file
                      ? data.documents.find((item) => item.id === file)?.name
                      : notebook
                        ? scopedNotebooks.find((item) => item.id === notebook)
                            ?.noteBookName
                        : data.courses.find((item) => item.id === course)
                            ?.name || "your notes"}
                </strong>
              </span>
              <span className="scope-count">{sources.length} ready</span>
            </div>
            <div className="chat-messages" aria-live="polite">
              {messages.length === 0 ? (
                <div className="chat-welcome">
                  <span className="welcome-orbit">
                    <span className="large-spark">
                      <Sparkles size={28} />
                    </span>
                  </span>
                  <span className="assistant-kicker">YOUR STUDY COMPANION</span>
                  <h2>
                    {sources.length
                      ? "What are you curious about?"
                      : "Good questions start here."}
                  </h2>
                  <p>
                    {sources.length
                      ? "Ask anything about your selected notes. Your assistant will find relevant passages to guide the answer."
                      : "Choose a course and add documents to get started. Once processing is complete, your notes will be ready to explore here."}
                  </p>
                  {sources.length ? (
                    <div
                      className="assistant-prompts"
                      aria-label="Suggested questions"
                    >
                      {[
                        "Summarize the key ideas",
                        "Explain a difficult concept",
                        "Help me prepare for a test",
                      ].map((prompt) => (
                        <button
                          type="button"
                          key={prompt}
                          disabled={busy}
                          onClick={() => setQuestion(prompt)}
                        >
                          {prompt}
                          <ArrowUpRight size={15} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Link className="assistant-upload-link" to="/documents">
                      <BookOpen size={16} /> Go to my documents{" "}
                      <ArrowUpRight size={15} />
                    </Link>
                  )}
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    className={`message ${message.role}`}
                    key={message.id}
                    aria-label={
                      message.role === "user"
                        ? "Your message"
                        : "Assistant message"
                    }
                  >
                    <span className="message-avatar" aria-hidden="true">
                      {message.role === "user" ? (
                        getNameInitials(
                          user?.user_metadata?.full_name ||
                            user?.email ||
                            "Student",
                        ).slice(0, 2)
                      ) : (
                        <Sparkles size={16} />
                      )}
                    </span>
                    <div className="message-content">
                      <p>{message.text}</p>
                      {message.sources?.map((source) => (
                        <Link
                          className="citation"
                          key={source.chunkId}
                          to={`/documents/${source.documentId}`}
                        >
                          <FileText size={14} /> {source.documentName}
                          {source.pageNumber != null
                            ? ` · page ${source.pageNumber}`
                            : ""}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
              {busy && (
                <p role="status">
                  Searching your documents and preparing an answer…
                </p>
              )}
            </div>
            {scopeChanged && (
              <p className="notice">
                The ready documents have changed. Your next question will start
                a new conversation with the current selection.
              </p>
            )}
            <form
              className="chat-composer"
              onSubmit={(event) => {
                event.preventDefault();
                void ask(question);
              }}
            >
              <textarea
                aria-label="Your question"
                placeholder="Ask something about your notes…"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={2}
                disabled={busy || !sources.length}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    if (question.trim() && !busy && sources.length)
                      void ask(question);
                  }
                }}
              />
              <button
                className="button primary"
                aria-label="Send question"
                disabled={busy || !sources.length || !question.trim()}
              >
                <Send size={17} /> <span>Send</span>
              </button>
            </form>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <p className="chat-disclaimer">
              Answers use your selected notes · Enter to send, Shift + Enter for
              a new line
            </p>
          </section>
          <aside className="panel source-panel">
            <div className="sources-heading">
              <span className="sources-heading-icon">
                <Layers3 size={18} />
              </span>
              <div>
                <span className="assistant-kicker">STUDY MATERIAL</span>
                <h3>Your sources</h3>
              </div>
            </div>
            <p>Choose the notes your assistant should use.</p>
            {restoredIds !== null && (
              <div className="notice chat-restored-notice">
                This conversation uses its original {restoredIds.length}{" "}
                selected document{restoredIds.length === 1 ? "" : "s"}. Change a
                filter to start a new conversation.
                {sources.length < restoredIds.length &&
                  " Some documents are not ready and will not be searched."}
              </div>
            )}
            <label>
              Course
              <select
                value={course}
                disabled={busy}
                onChange={(event) => {
                  setCourse(event.target.value);
                  setNotebook("");
                  setFile("");
                  reset();
                }}
              >
                {!data.courses.length && <option value="">No courses</option>}
                {data.courses.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Notebook
              <select
                value={notebook}
                disabled={busy}
                onChange={(event) => {
                  setNotebook(event.target.value);
                  setFile("");
                  reset();
                }}
              >
                <option value="">All notebooks</option>
                {scopedNotebooks.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.noteBookName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Specific file
              <select
                value={file}
                disabled={busy}
                onChange={(event) => {
                  setFile(event.target.value);
                  reset();
                }}
              >
                <option value="">All files in scope</option>
                {scopedFiles.map((item) => (
                  <option
                    value={item.id}
                    key={item.id}
                    disabled={item.status !== "ready"}
                  >
                    {item.name}
                    {item.status !== "ready" ? ` (${item.status})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="source-list">
              <div className="sources-list-heading">
                <span className="assistant-kicker">READY TO SEARCH</span>
                <span>{sources.length}</span>
              </div>
              <div
                className="source-list-scroll"
                role="region"
                aria-label="Ready documents"
                tabIndex={0}
              >
                {sources.map((item) => (
                  <Link key={item.id} to={`/documents/${item.id}`}>
                    <span className="source-file-icon">
                      <FileText size={16} />
                    </span>
                    <span className="source-file-name">
                      {item.name}
                      <small>Ready to use</small>
                    </span>
                    <ArrowUpRight size={14} />
                  </Link>
                ))}
                {!sources.length && (
                  <div className="assistant-source-empty">
                    <BookOpen size={18} />
                    <strong>No ready sources yet</strong>
                    <span>
                      Documents appear here once processing is complete.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
