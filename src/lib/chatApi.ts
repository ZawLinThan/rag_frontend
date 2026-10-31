import api from "./axios";

export type ChatSource = {
  chunkId: string;
  documentId: string;
  documentName: string;
  pageNumber: number | null;
  content: string;
  score: number | null;
};

export type StoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
};

export type ChatSessionSummary = {
  id: string;
  title: string | null;
  updatedAt: string;
  messages: StoredChatMessage[];
};

export type ChatSessionDetail = ChatSessionSummary & { documentIds: string[] };

export async function getChatSessions(): Promise<ChatSessionSummary[]> {
  const { data } = await api.get<ChatSessionSummary[]>("/api/chat/sessions");
  return data;
}

export async function getChatSession(id: string): Promise<ChatSessionDetail> {
  const { data } = await api.get<ChatSessionDetail>(
    `/api/chat/sessions/${encodeURIComponent(id)}`,
  );
  return data;
}

export type ChatAnswer = {
  userMessage: { id: string; content: string };
  assistantMessage: { id: string; content: string };
  answer: string;
  sources: ChatSource[];
};

export async function createChatSession(
  documentIds: string[],
): Promise<string> {
  const { data } = await api.post<{ sessionId: string }>("/api/chat/sessions", {
    documentIds,
  });
  return data.sessionId;
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
): Promise<ChatAnswer> {
  const { data } = await api.post<ChatAnswer>(
    `/api/chat/sessions/${encodeURIComponent(sessionId)}/messages`,
    { message },
  );
  return data;
}
