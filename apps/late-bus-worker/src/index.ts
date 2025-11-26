import routes from "./routes";

export default {
  fetch: (req: Request, env: Record<string, string>) => routes.handleRequest(req, env as any),
};
