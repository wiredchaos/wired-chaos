// config/groups.js
// Update these URLs anytime. If an invite expires, users get a mail fallback automatically.
export const GROUPS = {
  wc:  { name: "WIRED CHAOS Group", url: "https://t.me/YOUR_MAIN" },
  vrg: { name: "VRG-33-589 Group",  url: "https://t.me/YOUR_VRG"  },
  b2b: { name: "B2B / Professional", url: "/b2b" } // can be a form page
};

// Fallback email recipients if an invite is expired or unknown
export const FALLBACK_EMAILS = [
  "chaoswired@gmail.com",
  "Neurod1975@gmail.com",
  "neuro@wiredchaos.xyz"
];