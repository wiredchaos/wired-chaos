import axios from "axios";
import { CONFIG } from "../config";
import { TaskEnvelope } from "../types/common";
import { SwarmTaskRequest, SwarmTaskResponse } from "../types/swarm";
import { log } from "./logger";

export async function routeToSwarm(task: TaskEnvelope): Promise<SwarmTaskResponse> {
  if (!CONFIG.wiredChaosEnabled) {
    log.info("WIRED_CHAOS_ENABLED=false, handling task locally", task.id);

    return {
      taskId: task.id,
      status: "completed",
      result: {
        text: "WIRED CHAOS META is not yet live. This is a local stubbed response.",
        metadata: {
          namespace: task.namespace,
          intent: task.intent,
          source: task.source
        }
      }
    };
  }

  try {
    const payload: SwarmTaskRequest = { task };
    const { data } = await axios.post<SwarmTaskResponse>(CONFIG.swarmEndpoint, payload, {
      headers: {
        Authorization: `Bearer ${CONFIG.swarmApiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 15_000
    });

    log.info("Swarm responded for task", task.id, "status:", data.status);
    return data;
  } catch (error: any) {
    log.error("Error calling Swarm:", error?.message || error);
    return {
      taskId: task.id,
      status: "failed",
      error: {
        code: "SWARM_ERROR",
        message: "Failed to reach WIRED CHAOS META Swarm"
      }
    };
  }
}
