"use strict";

const mysql = require("mysql2/promise");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const scrypt = promisify(crypto.scrypt);

const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error("MySQL ayarları eksik: " + missing.join(", ") + ". .env dosyasındaki DB_* alanlarını doldur.");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
  queueLimit: 20,
  charset: "utf8mb4",
  ...(process.env.DB_SSL === "true" ? { ssl: { rejectUnauthorized: true } } : {})
});

async function initialize() {
  await pool.query(`CREATE TABLE IF NOT EXISTS site_content (
    id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    content_json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`);
  await pool.query("SELECT 1");
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_credentials (
    username VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
    password_salt CHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    password_hash CHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`);

  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const [rows] = await pool.query("SELECT username FROM admin_credentials LIMIT 1");
    if (!rows.length) await createAdmin(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
  }
}

async function getContent() {
  const [rows] = await pool.execute("SELECT content_json FROM site_content WHERE id = 1 LIMIT 1");
  if (!rows.length) return null;
  return JSON.parse(rows[0].content_json);
}

async function saveContent(content) {
  await pool.execute(`INSERT INTO site_content (id, content_json) VALUES (1, ?)
    ON DUPLICATE KEY UPDATE content_json = VALUES(content_json)`, [JSON.stringify(content)]);
}

async function createAdmin(username, password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  await pool.execute("INSERT INTO admin_credentials (username, password_salt, password_hash) VALUES (?, ?, ?)",
    [username.trim(), salt.toString("hex"), hash.toString("hex")]);
}

async function verifyAdmin(username, password) {
  const [rows] = await pool.execute("SELECT password_salt, password_hash FROM admin_credentials WHERE username = ? LIMIT 1", [username.trim()]);
  if (!rows.length) return false;
  const salt = Buffer.from(rows[0].password_salt, "hex");
  const stored = Buffer.from(rows[0].password_hash, "hex");
  const submitted = await scrypt(password, salt, stored.length, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return stored.length === submitted.length && crypto.timingSafeEqual(stored, submitted);
}

module.exports = { initialize, getContent, saveContent, verifyAdmin, close: () => pool.end() };
