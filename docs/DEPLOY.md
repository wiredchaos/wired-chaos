# Deployment Guide — WIRED CHAOS META

This repository is pre-configured so you can deploy the NEURO SWARM control plane with minimal effort.

## Deploying the Control Plane to Vercel

1. Push this repository to GitHub (or your preferred Git provider).
2. In Vercel, click **New Project** and import this repository.
3. Set **Root Directory** to `apps/web`.
4. Keep the default build command (`next build`) and output settings.
5. If you add environment variables later, set them in **Settings → Environment Variables**.
6. Click **Deploy**. Vercel will install dependencies, run `next build`, and host the control plane.

## Running the Discord Bot on Railway or Render

1. Create a new service and point it to the repository root.
2. Set the project path to `apps/bot` (or configure a monorepo build command in your platform).
3. Install dependencies and build:
   - `npm install`
   - `npm run build`
4. Start the bot with `npm start`.
5. Provide environment variables based on `apps/bot/.env.example`:
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_APP_ID`
   - `DISCORD_GUILD_ID`
   - `APP_BASE_URL` (the deployed Vercel URL)

With these steps, the control plane deploys automatically on Vercel and the Discord bot is ready for long-lived hosts.
