"use strict";

const mysql = require("mysql2/promise");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const scrypt = promisify(crypto.scrypt);
const DUMMY_SALT = crypto.randomBytes(16);
const DUMMY_HASH = crypto.randomBytes(64);

const mysqlUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
let urlConfig = {};
if (mysqlUrl) {
  try {
    const parsed = new URL(mysqlUrl);
    if (parsed.protocol !== "mysql:") throw new Error("Unsupported protocol");
    urlConfig = {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: decodeURIComponent(parsed.pathname.replace(/^\//, ""))
    };
  } catch {
    throw new Error("MYSQL_URL veya DATABASE_URL geçerli bir MySQL bağlantı adresi değil.");
  }
}
const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || urlConfig.host,
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || urlConfig.port || 3306),
  user: process.env.DB_USER || process.env.MYSQLUSER || urlConfig.user,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || urlConfig.password,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || urlConfig.database
};
const missing = Object.entries(dbConfig).filter(([key, value]) => key !== "port" && !value).map(([key]) => key);
if (missing.length) {
  throw new Error("MySQL bağlantı değişkenleri eksik: " + missing.join(", ") + ". Railway'de MYSQL_URL ya da MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD ve MYSQLDATABASE değerlerini uygulama servisine bağla.");
}

const pool = mysql.createPool({
  ...dbConfig,
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

async function hasAdmin() {
  const [rows] = await pool.query("SELECT username FROM admin_credentials LIMIT 1");
  return rows.length > 0;
}

async function verifyAdmin(username, password) {
  const [rows] = await pool.execute("SELECT password_salt, password_hash FROM admin_credentials WHERE username = ? LIMIT 1", [username.trim()]);
  const salt = rows.length ? Buffer.from(rows[0].password_salt, "hex") : DUMMY_SALT;
  const stored = rows.length ? Buffer.from(rows[0].password_hash, "hex") : DUMMY_HASH;
  const submitted = await scrypt(password, salt, stored.length, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return rows.length > 0 && stored.length === submitted.length && crypto.timingSafeEqual(stored, submitted);
}

module.exports = { initialize, getContent, saveContent, createAdmin, hasAdmin, verifyAdmin, close: () => pool.end() };
