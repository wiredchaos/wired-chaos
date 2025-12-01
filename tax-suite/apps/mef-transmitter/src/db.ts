import pg from "pg";

const connectionString = process.env.PG_URL;
if (!connectionString) {
  throw new Error("PG_URL not configured");
}

const pool = new pg.Pool({ connectionString });

export const q = (text: string, params?: any[]) => pool.query(text, params);
