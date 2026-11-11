import pg from "pg";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const { Pool } = pg;
let pool;

export function getDb() {
  if (!pool) {
    const connectionString = process.env.NETLIFY_DB_URL || process.env.DATABASE_URL;
    pool = new Pool(connectionString ? { connectionString } : {
      host: process.env.PGHOST || "127.0.0.1",
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || "portfolio_app",
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || "ibrahim_can_duven_site",
      max: Number(process.env.PG_POOL_SIZE || 5),
      ...(process.env.PGSSL === "true" ? { ssl: { rejectUnauthorized: true } } : {})
    });
  }
  return { pool };
}

export async function initializeDatabase() {
  const db = getDb();
  await db.pool.query(`CREATE TABLE IF NOT EXISTS app_migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const migrationName = "20261111120000_create_site_tables.sql";
  const migrationPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../database/migrations", migrationName);
  const migrationSql = await readFile(migrationPath, "utf8");
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [86421001]);
    const { rows } = await client.query("SELECT 1 FROM app_migrations WHERE name = $1", [migrationName]);
    if (!rows.length) {
      await client.query(migrationSql);
      await client.query("INSERT INTO app_migrations (name) VALUES ($1)", [migrationName]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
