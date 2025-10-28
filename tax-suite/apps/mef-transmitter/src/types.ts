export type EFileStatus = "QUEUED" | "SENT" | "ACCEPTED" | "REJECTED" | "ERROR";

export interface Submission {
  id: string;
  clientId: string;
  taxYear: string;
  status: EFileStatus;
  createdAt: string;
  updatedAt: string;
  ackCode?: string;
  ackMessage?: string;
}
