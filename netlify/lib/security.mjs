import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "./database.mjs";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "icd_admin_session";
const SESSION_TTL_MS = 30 * 60 * 1000;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const DUMMY_SALT = Buffer.alloc(16, 7);
const DUMMY_HASH = Buffer.alloc(64, 9);

export function json(statusCode, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}

export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);
    return originUrl.host === requestUrl.host && originUrl.protocol === requestUrl.protocol;
  } catch {
    return false;
  }
}

function getCookie(request) {
  const cookies = request.headers.get("cookie") || "";
  for (const part of cookies.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === SESSION_COOKIE) return value.join("=");
  }
  return "";
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function cookie(token, maxAge, secure = true) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

export async function ensureAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password || username.length > 64 || password.length > 1024) {
    throw new Error("Administrator credentials are not configured.");
  }
  const db = getDb();
  const { rows: admins } = await db.pool.query("SELECT 1 FROM admin_credentials LIMIT 1");
  if (admins.length) return;
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, SCRYPT_OPTIONS);
  await db.pool.query(
    `INSERT INTO admin_credentials (username, password_salt, password_hash)
     SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT 1 FROM admin_credentials)
     ON CONFLICT (username) DO NOTHING`,
    [username, salt.toString("hex"), Buffer.from(hash).toString("hex")]
  );
}

export async function verifyAdmin(username, password) {
  const { rows } = await getDb().pool.query(
    "SELECT password_salt, password_hash FROM admin_credentials WHERE username = $1 LIMIT 1",
    [username]
  );
  const salt = rows.length ? Buffer.from(rows[0].password_salt, "hex") : DUMMY_SALT;
  const expected = rows.length ? Buffer.from(rows[0].password_hash, "hex") : DUMMY_HASH;
  const actual = Buffer.from(await scrypt(password, salt, expected.length, SCRYPT_OPTIONS));
  return rows.length > 0 && expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function sessionIsValid(request) {
  const token = getCookie(request);
  if (!token) return false;
  const { rows } = await getDb().pool.query(
    "SELECT 1 FROM admin_sessions WHERE id = 1 AND token_hash = $1 AND expires_at > $2",
    [digest(token), Date.now()]
  );
  return rows.length > 0;
}

export async function createSession(request) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await getDb().pool.query(
    `INSERT INTO admin_sessions (id, token_hash, expires_at) VALUES (1, $1, $2)
     ON CONFLICT (id) DO UPDATE SET token_hash = EXCLUDED.token_hash, expires_at = EXCLUDED.expires_at`,
    [digest(token), expiresAt]
  );
  return cookie(token, Math.floor(SESSION_TTL_MS / 1000), new URL(request.url).protocol === "https:");
}

export async function clearSession(request) {
  const token = getCookie(request);
  if (token) {
    await getDb().pool.query("DELETE FROM admin_sessions WHERE id = 1 AND token_hash = $1", [digest(token)]);
  }
  return cookie("", 0, new URL(request.url).protocol === "https:");
}

export function clientIp(request, context) {
  return context.ip || request.headers.get("x-nf-client-connection-ip") || "unknown";
}

export function hashIp(ip) {
  return digest(ip);
}

export async function getLoginThrottle(ipHash) {
  const { rows } = await getDb().pool.query(
    "SELECT attempts, window_expires_at, blocked_until FROM admin_login_attempts WHERE ip_hash = $1",
    [ipHash]
  );
  return rows[0] || null;
}

export async function recordLoginFailure(ipHash) {
  const now = Date.now();
  const windowEnd = now + 15 * 60 * 1000;
  await getDb().pool.query(
    `INSERT INTO admin_login_attempts (ip_hash, attempts, window_expires_at, blocked_until)
     VALUES ($1, 1, $2, 0)
     ON CONFLICT (ip_hash) DO UPDATE SET
       attempts = CASE WHEN admin_login_attempts.window_expires_at <= $3 THEN 1 ELSE admin_login_attempts.attempts + 1 END,
       window_expires_at = CASE WHEN admin_login_attempts.window_expires_at <= $3 THEN $2 ELSE admin_login_attempts.window_expires_at END,
       blocked_until = CASE
         WHEN admin_login_attempts.window_expires_at <= $3 THEN 0
         WHEN admin_login_attempts.attempts + 1 >= 5 THEN $3 + 900000
         ELSE admin_login_attempts.blocked_until END`,
    [ipHash, windowEnd, now]
  );
  return getLoginThrottle(ipHash);
}

export async function clearLoginFailures(ipHash) {
  await getDb().pool.query("DELETE FROM admin_login_attempts WHERE ip_hash = $1", [ipHash]);
}
