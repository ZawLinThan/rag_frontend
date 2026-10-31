import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Send,
  FileText,
  Plus,
  PanelLeftOpen,
  PanelLeftClose,
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

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: ChatSource[];
};
type Session = { id: string; scope: string };

const ChatPage = () => {
  const data = useStudyData();
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
    <>
      <PageHeading
        title="Study assistant"
        description="Explore ideas with answers grounded in the notes you choose."
        action={
          <button className="button" disabled={busy} onClick={reset}>
            <Plus size={16} /> New conversation
          </button>
        }
      />
      <div className="chat-history-controls">
        <button
          className="button"
          aria-expanded={historyOpen}
          aria-controls="chat-history"
          onClick={() => setHistoryOpen((open) => !open)}
        >
          {historyOpen ? (
            <PanelLeftClose size={16} />
          ) : (
            <PanelLeftOpen size={16} />
          )}{" "}
        </button>
      </div>
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
          <h3>Chat history</h3>
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
              <Sparkles size={17} />
              <span>
                Studying{" "}
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
            </div>
            <div className="chat-messages" aria-live="polite">
              {messages.length === 0 ? (
                <div className="chat-welcome">
                  <span className="large-spark">
                    <Sparkles size={30} />
                  </span>
                  <h2>Let’s make it click.</h2>
                  <p>Ask a question about your ready documents.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div className={`message ${message.role}`} key={message.id}>
                    <span className="message-avatar">
                      {message.role === "user" ? "You" : <Sparkles size={16} />}
                    </span>
                    <div>
                      <strong>
                        {message.role === "user" ? "You" : "Folio"}
                      </strong>
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
              />
              <button
                className="button primary"
                aria-label="Send question"
                disabled={busy || !sources.length || !question.trim()}
              >
                <Send size={18} />
              </button>
            </form>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <p className="chat-disclaimer">
              Answers are based on selected ready documents. Check the cited
              sources.
            </p>
          </section>
          <aside className="panel source-panel">
            <h3>Your sources</h3>
            <p>Choose what your conversation draws from.</p>
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
              <span className="eyebrow">{sources.length} READY DOCUMENTS</span>
              {sources.map((item) => (
                <Link key={item.id} to={`/documents/${item.id}`}>
                  <FileText size={16} />
                  {item.name}
                </Link>
              ))}
            </div>
            {!sources.length && (
              <div className="notice">
                No ready documents in this selection. Documents become available
                here after processing is complete.
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
