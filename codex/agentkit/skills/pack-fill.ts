import { PromptPack } from "../../prompts/utils";

type PromptRegistryTool = {
  get: (id: string) => Promise<PromptPack>;
};

type AgentModel = {
  generate: (options: { prompt: string }) => Promise<unknown>;
};

type AgentContext = {
  tools: Record<string, unknown>;
  model: AgentModel;
};

function fillTemplate(template: string, prompt: PromptPack, vars: Record<string, string>): string {
  const defaults = Object.fromEntries(
    (prompt.variables ?? []).map((variable) => [variable.name, variable.default ?? ""])
  );
  const merged = { ...defaults, ...vars };

  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    if (merged[key] === undefined) {
      throw new Error(`Missing variable for prompt pack: ${key}`);
    }

    return String(merged[key]);
  });
}

function resolvePromptsRegistry(tools: Record<string, unknown>): PromptRegistryTool {
  const registry = tools["prompts-registry"] as PromptRegistryTool | undefined;
  if (!registry || typeof registry.get !== "function") {
    throw new Error("Prompts registry MCP tool is not configured on the agent context.");
  }

  return registry;
}

export async function runPromptPack(
  agent: AgentContext,
  packId: string,
  vars: Record<string, string>
): Promise<unknown> {
  const registry = resolvePromptsRegistry(agent.tools);
  const prompt = await registry.get(packId);
  const promptBody = fillTemplate(prompt.body, prompt, vars);
  return agent.model.generate({ prompt: promptBody });
}
