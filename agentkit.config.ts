import { PromptsRegistry } from "./codex/mcp/prompts-registry";

const existingTools: Array<Record<string, unknown>> = [];

export const agentkitConfig = {
  tools: [
    { kind: "mcp", name: "prompts-registry", url: "ws://localhost:4010" },
    ...existingTools,
  ],
  registries: {
    "prompts-registry": PromptsRegistry,
  },
};

export type AgentKitConfig = typeof agentkitConfig;
