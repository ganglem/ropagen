// lib/db.ts
import {Pool, QueryResultRow} from "pg";

declare global {
    // eslint-disable-next-line no-var
    var __pgPool: Pool | undefined;
}

// In dev: Pool wiederverwenden (Hot Reload), in prod: normal erstellen
export const pool =
    global.__pgPool ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        // optional, je nach Provider nötig:
        // ssl: { rejectUnauthorized: false },
    });

if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

export async function sql<T extends QueryResultRow = any>(text: string, params: any[] = []) {
    return await pool.query<T>(text, params);
}
