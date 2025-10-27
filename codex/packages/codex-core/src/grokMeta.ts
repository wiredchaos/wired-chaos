export const WIRED_CHAOS_GROK_DEFAULT = {
  artist: '@neurometax',
  copyright: '© WIRED CHAOS / 33.3FM DOGECHAIN — All Rights Reserved',
  collection: 'WIRED CHAOS Ecosystem',
  tag: 'GROK Metadata Integration'
} as const;

type GrokKind = 'storefront' | 'merch' | 'logo';

export function grokDescription(kind: GrokKind) {
  if (kind === 'storefront') {
    return 'Cyberpunk storefront in the WIRED CHAOS mall, glowing with neon cyan, glitch red, and electric green. Part of the 33.3FM DOGECHAIN broadcast ecosystem.';
  }
  if (kind === 'merch') {
    return 'Stealth apparel from WIRED CHAOS — cryptic glowing eyes and barbed wire woven into black streetwear. A hidden signal from the 33.3FM DOGECHAIN ecosystem.';
  }
  return 'Symbol of WIRED CHAOS — glowing red eyes and cyan barbed wire. A cryptic mark transmitting on 33.3FM DOGECHAIN.';
}
