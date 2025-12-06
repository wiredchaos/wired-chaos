import voicepack from './voicepack.json';

type AgentId = keyof typeof voicepack;

type TemplateKey<T extends AgentId> = keyof (typeof voicepack)[T];

type TemplateVariables = Record<string, string | number>;

export function getReply<T extends AgentId>(agentId: T, templateKey: TemplateKey<T>, vars: TemplateVariables = {}): string {
  const templates = voicepack[agentId];
  const template = templates?.[templateKey];

  if (!template) {
    return 'Signal unavailable. Try again soon.';
  }

  return Object.entries(vars).reduce((result, [key, value]) => result.replace(new RegExp(`{${key}}`, 'g'), String(value)), template);
}
