// gamma-wired-chaos-template.js
// Gamma production template for WIRED CHAOS brand presentations
// NSA-level, Apple-grade, SWARM Army integrated

const WIRED_CHAOS_BRAND = {
  name: 'WIRED CHAOS',
  tagline: 'The Next Apple. NSA-Grade. Blockchain. Automation. Legendary.',
  palette: {
    black: '#000000',
    neonCyan: '#00FFFF',
    glitchRed: '#FF3131',
    electricGreen: '#39FF14',
    accentPink: '#FF00FF',
  },
  fonts: {
    primary: 'Inter, Arial, sans-serif',
    code: 'Fira Mono, monospace',
  },
  logo: '/public/logo-wired-chaos.svg',
  heroImage: '/public/hero-wired-chaos.png',
  style: {
    borderRadius: '16px',
    boxShadow: '0 4px 32px 0 #00FFFF44',
    background: 'linear-gradient(135deg, #000 60%, #00FFFF 100%)',
  },
  voice: 'Bold, visionary, technical, secure, and inspiring.',
  mission: 'To build the most resilient, automated, and user-obsessed blockchain platform in the world.'
};

function buildGammaPresentation({ title, sections }) {
  return {
    title: title || `${WIRED_CHAOS_BRAND.name} – Executive Deck`,
    theme: {
      colors: WIRED_CHAOS_BRAND.palette,
      fonts: WIRED_CHAOS_BRAND.fonts,
      style: WIRED_CHAOS_BRAND.style,
      logo: WIRED_CHAOS_BRAND.logo,
      heroImage: WIRED_CHAOS_BRAND.heroImage,
    },
    slides: [
      {
        type: 'cover',
        title: WIRED_CHAOS_BRAND.name,
        subtitle: WIRED_CHAOS_BRAND.tagline,
        image: WIRED_CHAOS_BRAND.heroImage,
        logo: WIRED_CHAOS_BRAND.logo,
      },
      {
        type: 'mission',
        title: 'Our Mission',
        content: WIRED_CHAOS_BRAND.mission,
      },
      ...sections,
      {
        type: 'contact',
        title: 'Contact & Next Steps',
        content: 'wiredchaos.xyz | info@wiredchaos.xyz',
      },
    ],
    voice: WIRED_CHAOS_BRAND.voice,
  };
}

// Example usage:
// const deck = buildGammaPresentation({
//   title: 'WIRED CHAOS – Product Launch',
//   sections: [
//     { type: 'feature', title: 'NSA-Grade Security', content: 'Bearer token auth, CORS, circuit breakers, wallet gating, NDA digital signatures.' },
//     { type: 'integration', title: 'SWARM Army', content: 'Bots, automations, and real-time event systems using Cloudflare Durable Objects.' },
//     { type: 'blockchain', title: 'Multi-Chain Support', content: 'Ethereum, Solana, XRPL, Hedera, Dogecoin.' },
//     { type: 'ecosystem', title: 'Integrations', content: 'Notion, Gamma, Wix, Zapier, Discord, Telegram.' },
//   ]
// });
// Gamma.render(deck);

module.exports = { WIRED_CHAOS_BRAND, buildGammaPresentation };
