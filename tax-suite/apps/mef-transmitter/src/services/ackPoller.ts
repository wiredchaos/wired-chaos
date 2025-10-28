import { q } from "../db";
import { getAck } from "./irsClient";
import { storeAck } from "./storage";

export async function pollPending() {
  const { rows } = await q("SELECT id FROM submissions WHERE status IN ('SENT') LIMIT 50");
  for (const row of rows) {
    const id = row.id as string;
    const { status, data } = await getAck(id);
    if (status === 200 && data?.ackCode) {
      await storeAck(id, JSON.stringify(data));
      const newStatus = data.ackCode === "ACCEPTED" ? "ACCEPTED" : (data.ackCode === "REJECTED" ? "REJECTED" : "SENT");
      await q("UPDATE submissions SET status=$1, ackCode=$2, ackMessage=$3, updatedAt=NOW() WHERE id=$4",
        [newStatus, data.ackCode, data.message ?? null, id]);
    }
  }
}
