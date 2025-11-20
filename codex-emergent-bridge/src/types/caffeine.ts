export interface CaffeineEvent {
  id: string;
  type: "message.created" | "session.started" | "session.ended" | string;
  appId: string;
  userId: string;
  sessionId?: string;
  timestamp: string;
  data: {
    text?: string;
    metadata?: Record<string, unknown>;
  };
  signature?: string;
}
