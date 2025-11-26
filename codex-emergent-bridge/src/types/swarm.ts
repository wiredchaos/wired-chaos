import { TaskEnvelope } from "./common";

export interface SwarmTaskRequest {
  task: TaskEnvelope;
}

export interface SwarmTaskResponse {
  taskId: string;
  status: "queued" | "running" | "completed" | "failed";
  result?: {
    text?: string;
    actions?: Array<{
      type: string;
      payload: unknown;
    }>;
    metadata?: Record<string, unknown>;
  };
  error?: {
    code: string;
    message: string;
  };
}
