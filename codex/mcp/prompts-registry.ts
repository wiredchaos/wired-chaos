import { getPrompt, listPrompts, PromptPack } from "../prompts/utils";

export const PromptsRegistry = {
  list: async (): Promise<PromptPack[]> => listPrompts(),
  get: async (id: string): Promise<PromptPack> => getPrompt(id),
  search: async (query: string): Promise<PromptPack[]> => {
    const prompts = await listPrompts();
    const normalized = query.toLowerCase();
    return prompts.filter((prompt) =>
      prompt.tags.some((tag) => tag.toLowerCase().includes(normalized))
    );
  },
};
