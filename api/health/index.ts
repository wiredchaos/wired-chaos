import express from "express";

const app = express();

app.get("/health", (_req, res) => res.json({ ok: true, service: "rld", ts: Date.now() }));

export default app;
