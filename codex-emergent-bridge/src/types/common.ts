export interface TaskEnvelope {
  id: string;
  source: "caffeine";
  userId: string;
  sessionId?: string;
  channel: "chat" | "story" | "narrative" | "admin";
  namespace: "BUSINESS" | "EDUCATION" | "ARG";
  intent: string;
  payload: unknown;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
