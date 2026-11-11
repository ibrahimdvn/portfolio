"use strict";

const mysql = require("mysql2/promise");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const scrypt = promisify(crypto.scrypt);
const DUMMY_SALT = crypto.randomBytes(16);
const DUMMY_HASH = crypto.randomBytes(64);

const mysqlUrl = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL || process.env.DATABASE_URL;
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
  host: urlConfig.host || process.env.DB_HOST || process.env.MYSQLHOST,
  port: Number(urlConfig.port || process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  user: urlConfig.user || process.env.DB_USER || process.env.MYSQLUSER,
  password: urlConfig.password || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: urlConfig.database || process.env.DB_NAME || process.env.MYSQLDATABASE
};
const missing = Object.entries(dbConfig).filter(([key, value]) => key !== "port" && !value).map(([key]) => key);
if (missing.length) {
  throw new Error("MySQL bağlantı değişkenleri eksik: " + missing.join(", ") + ". DB_* veya MYSQL_URL/MYSQL_PUBLIC_URL bağlantı değişkenlerini yapılandır.");
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
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_sessions (
    id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    expires_at BIGINT UNSIGNED NOT NULL
  ) ENGINE=InnoDB`);
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_login_attempts (
    ip_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
    attempts TINYINT UNSIGNED NOT NULL,
    window_expires_at BIGINT UNSIGNED NOT NULL,
    blocked_until BIGINT UNSIGNED NOT NULL DEFAULT 0
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

async function saveAdminSession(tokenHash, expiresAt) {
  await pool.execute(`INSERT INTO admin_sessions (id, token_hash, expires_at) VALUES (1, ?, ?)
    ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), expires_at = VALUES(expires_at)`, [tokenHash, expiresAt]);
}

async function hasAdminSession(tokenHash) {
  const [rows] = await pool.execute("SELECT expires_at FROM admin_sessions WHERE id = 1 AND token_hash = ? LIMIT 1", [tokenHash]);
  return rows.length > 0 && Number(rows[0].expires_at) > Date.now();
}

async function deleteAdminSession(tokenHash) {
  await pool.execute("DELETE FROM admin_sessions WHERE id = 1 AND token_hash = ?", [tokenHash]);
}

async function isLoginBlocked(ipHash) {
  const [rows] = await pool.execute("SELECT blocked_until FROM admin_login_attempts WHERE ip_hash = ? LIMIT 1", [ipHash]);
  return rows.length > 0 && Number(rows[0].blocked_until) > Date.now();
}

async function recordLoginFailure(ipHash) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute("SELECT attempts, window_expires_at FROM admin_login_attempts WHERE ip_hash = ? FOR UPDATE", [ipHash]);
    const now = Date.now();
    let attempts = rows.length && Number(rows[0].window_expires_at) > now ? Number(rows[0].attempts) + 1 : 1;
    const windowExpiresAt = rows.length && Number(rows[0].window_expires_at) > now ? Number(rows[0].window_expires_at) : now + 15 * 60 * 1000;
    const blockedUntil = attempts >= 5 ? now + 15 * 60 * 1000 : 0;
    await connection.execute(`INSERT INTO admin_login_attempts (ip_hash, attempts, window_expires_at, blocked_until) VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE attempts = VALUES(attempts), window_expires_at = VALUES(window_expires_at), blocked_until = VALUES(blocked_until)`,
    [ipHash, attempts, windowExpiresAt, blockedUntil]);
    await connection.commit();
    return { blocked: attempts >= 5, retryAfter: attempts >= 5 ? Math.ceil((blockedUntil - now) / 1000) : 0 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function clearLoginFailures(ipHash) {
  await pool.execute("DELETE FROM admin_login_attempts WHERE ip_hash = ?", [ipHash]);
}

module.exports = {
  initialize, getContent, saveContent, createAdmin, hasAdmin, verifyAdmin,
  saveAdminSession, hasAdminSession, deleteAdminSession,
  isLoginBlocked, recordLoginFailure, clearLoginFailures,
  close: () => pool.end()
};
