import { getDatabase } from "@netlify/database";

let database;

export function getDb() {
  database ??= getDatabase();
  return database;
}
