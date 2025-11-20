import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  port: parseInt(process.env.PORT || "4000", 10),
  // Caffeine
  caffeineSigningSecret: process.env.CAFFEINE_SIGNING_SECRET || "",
  caffeineAppId: process.env.CAFFEINE_APP_ID || "",
  // Swarm / WIRED CHAOS META
  wiredChaosEnabled: process.env.WIRED_CHAOS_ENABLED === "true",
  swarmEndpoint: process.env.SWARM_ENDPOINT || "https://swarm.wiredchaos.local/tasks",
  swarmApiKey: process.env.SWARM_API_KEY || "",
  // Logging
  nodeEnv: process.env.NODE_ENV || "development"
};
