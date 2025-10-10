import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export interface PromptVariable {
  name: string;
  description?: string;
  default?: string;
}

export interface PromptPack {
  id: string;
  name: string;
  description: string;
  tags: string[];
  body: string;
  variables?: PromptVariable[];
}

const PROMPTS_DIR = path.join(process.cwd(), "codex", "prompts");

function assertString(value: unknown, message: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(message);
  }
  return value;
}

function assertStringArray(value: unknown, message: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(message);
  }
  return value as string[];
}

function validatePromptPack(candidate: unknown, filePath: string): PromptPack {
  if (!candidate || typeof candidate !== "object") {
    throw new Error(`Invalid prompt pack at ${filePath}`);
  }

  const pack = candidate as PromptPack;
  const id = assertString(pack.id, `Prompt pack missing id field: ${filePath}`);
  const name = assertString(pack.name, `Prompt pack missing name field: ${filePath}`);
  const description = assertString(
    pack.description,
    `Prompt pack missing description field: ${filePath}`
  );
  const body = assertString(pack.body, `Prompt pack missing body field: ${filePath}`);
  const tags = assertStringArray(pack.tags, `Prompt pack missing tags array: ${filePath}`);

  const variables = (pack.variables ?? []).map((variable) => {
    const variableName = assertString(
      variable.name,
      `Prompt variable missing name in ${filePath}`
    );
    return {
      ...variable,
      name: variableName,
    };
  });

  return {
    id,
    name,
    description,
    body,
    tags,
    variables,
  };
}

function loadPromptFromFile(filePath: string): PromptPack {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw);
  return validatePromptPack(parsed, filePath);
}

export const listPrompts = (): PromptPack[] => {
  if (!fs.existsSync(PROMPTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(PROMPTS_DIR)
    .filter((file) => file.endsWith(".yaml"))
    .map((file) => loadPromptFromFile(path.join(PROMPTS_DIR, file)));
};

export const getPrompt = (id: string): PromptPack => {
  const filePath = path.join(PROMPTS_DIR, `${id}.yaml`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt pack not found: ${id}`);
  }

  return loadPromptFromFile(filePath);
};
