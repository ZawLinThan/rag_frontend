import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkles, Send, FileText, Plus } from "lucide-react";
import { useWorkspace } from "../hooks/useWorkspace";
import { questionSchema } from "../zodSchema/studySchema";
import type { Message } from "../types/study";
import PageHeading from "../components/PageHeading";

const ChatPage = () => {
  const { courses, documents } = useWorkspace();
  const [params] = useSearchParams();
  const [course, setCourse] = useState(
    params.get("course") || courses[0]?.id || "",
  );
  const [notebook, setNotebook] = useState(params.get("notebook") || "");
  const [file, setFile] = useState(params.get("file") || "");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const sources = documents.filter(
    (d) =>
      d.courseId === course &&
      (!notebook || d.notebook === notebook) &&
      (!file || d.id === file),
  );
  const ask = (value: string) => {
    const result = questionSchema.safeParse({ question: value });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    const words = result.data.question
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
    const ranked = sources
      .map((d) => ({
        d,
        score: words.filter((w) => d.content.toLowerCase().includes(w)).length,
      }))
      .sort((a, b) => b.score - a.score);
    const source = ranked.find(
      (s) => s.score > 0 && s.d.uploaded !== "Added locally",
    )?.d;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: result.data.question },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: source
          ? `Here is a relevant excerpt from your sample notes:\n\n${source.content}\n\nTry explaining the main idea in your own words, then use a practice card to check your understanding.`
          : "I couldn’t find a matching passage in this scope’s sample notes. Try a question about a concept in the document preview, or choose a different source. Live AI answers will be available when your backend is connected.",
        sourceId: source?.id,
      },
    ]);
    setQuestion("");
  };
  return (
    <>
      <PageHeading
        title="Study assistant"
        description="Explore ideas with answers grounded in the notes you choose."
        action={
          <button className="button" onClick={() => setMessages([])}>
            <Plus size={16} />
            New conversation
          </button>
        }
      />
      <div className="chat-layout">
        <section className="panel chat-panel">
          <div className="chat-scope">
            <Sparkles size={17} />
            <span>
              Studying{" "}
              <strong>
                {file
                  ? documents.find((d) => d.id === file)?.name
                  : notebook || courses.find((c) => c.id === course)?.name}
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
                <p>
                  Ask a question, unpack an idea, or find a connection.
                  <br />
                  Your selected notes are the starting point.
                </p>
                <div className="suggestions">
                  {(course === "psy"
                    ? ["What is retrieval practice?", "Explain working memory."]
                    : course === "math"
                      ? [
                          "What does a derivative measure?",
                          "Explain the power rule.",
                        ]
                      : [
                          "What do mitochondria do?",
                          "Explain DNA transcription.",
                        ]
                  ).map((q) => (
                    <button key={q} onClick={() => ask(q)}>
                      {q}
                      <span>↗</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div className={`message ${m.role}`} key={m.id}>
                  <span className="message-avatar">
                    {m.role === "user" ? "JS" : <Sparkles size={16} />}
                  </span>
                  <div>
                    <strong>
                      {m.role === "user" ? "You" : "Folio · Sample response"}
                    </strong>
                    <p>{m.text}</p>
                    {m.sourceId && (
                      <Link
                        className="citation"
                        to={`/documents/${m.sourceId}`}
                      >
                        <FileText size={14} />
                        Source:{" "}
                        {documents.find((d) => d.id === m.sourceId)?.name}
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <textarea
              aria-label="Your question"
              placeholder="Ask something about your notes…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
            />
            <button className="button primary" aria-label="Send question">
              <Send size={18} />
            </button>
          </form>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <p className="chat-disclaimer">
            Prototype responses use sample excerpts. Always check the source.
          </p>
        </section>
        <aside className="panel source-panel">
          <h3>Your sources</h3>
          <p>Choose what your conversation draws from.</p>
          <label>
            Course
            <select
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                setNotebook("");
                setFile("");
                setMessages([]);
              }}
            >
              {courses.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Notebook
            <select
              value={notebook}
              onChange={(e) => {
                setNotebook(e.target.value);
                setFile("");
                setMessages([]);
              }}
            >
              <option value="">All notebooks</option>
              {courses
                .find((c) => c.id === course)
                ?.notebooks.map((n) => (
                  <option key={n}>{n}</option>
                ))}
            </select>
          </label>
          <label>
            Specific file
            <select
              value={file}
              onChange={(e) => {
                setFile(e.target.value);
                setMessages([]);
              }}
            >
              <option value="">All files in scope</option>
              {documents
                .filter(
                  (d) =>
                    d.courseId === course &&
                    (!notebook || d.notebook === notebook),
                )
                .map((d) => (
                  <option value={d.id} key={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </label>
          <div className="source-list">
            <span className="eyebrow">{sources.length} SELECTED DOCUMENTS</span>
            {sources.map((d) => (
              <Link key={d.id} to={`/documents/${d.id}`}>
                <FileText size={16} />
                {d.name}
              </Link>
            ))}
          </div>
          <div className="notice">
            A focused source helps you ask better questions.
          </div>
        </aside>
      </div>
    </>
  );
};

export default ChatPage;
