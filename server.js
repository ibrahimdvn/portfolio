"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const database = require("./database");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SESSION_COOKIE = "icd_admin_session";
const SESSION_TTL_MS = 30 * 60 * 1000;
const sessions = new Map();
const loginAttempts = new Map();
const PUBLIC_FILES = new Set([
  "app.js", "auth.js", "detay.html", "favicon.svg", "giris.html", "giris.js",
  "i18n.js", "index.html", "logo.svg", "profile-photo.png", "styles.css",
  "ui.js", "yonetim.html", "yonetim.js"
]);
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8"
};
function sendJson(response, status, data, extraHeaders) {
  response.writeHead(status, Object.assign({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }, extraHeaders || {}));
  response.end(JSON.stringify(data));
}

function cookies(request) {
  const result = {};
  (request.headers.cookie || "").split(";").forEach(function (part) {
    const separator = part.indexOf("=");
    if (separator < 0) return;
    const key = part.slice(0, separator).trim();
    try { result[key] = decodeURIComponent(part.slice(separator + 1).trim()); } catch (error) { result[key] = ""; }
  });
  return result;
}

function isAuthenticated(request) {
  const token = cookies(request)[SESSION_COOKIE];
  const session = token && sessions.get(token);
  if (!session) return false;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return false;
  try { return new URL(origin).host === request.headers.host; } catch (error) { return false; }
}

function attemptState(ip) {
  const now = Date.now();
  if (loginAttempts.size >= 10000 && !loginAttempts.has(ip)) {
    for (const [key, value] of loginAttempts) {
      if (value.resetAt <= now && value.blockedUntil <= now) loginAttempts.delete(key);
    }
    while (loginAttempts.size >= 10000) loginAttempts.delete(loginAttempts.keys().next().value);
  }
  let state = loginAttempts.get(ip);
  if (!state || state.resetAt <= now) {
    state = { count: 0, resetAt: now + 15 * 60 * 1000, blockedUntil: 0 };
    loginAttempts.set(ip, state);
  }
  return state;
}

async function readJson(request, maxBytes) {
  const limit = maxBytes || 4096;
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > limit) throw new Error("Request too large");
  }
  return JSON.parse(body || "{}");
}

function serveFile(request, response, pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const requested = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = path.resolve(ROOT, "." + requested);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  const filename = path.basename(filePath).toLowerCase();
  const relativeParts = path.relative(ROOT, filePath).split(path.sep);
  if (filename.startsWith(".") || relativeParts.length !== 1 || !PUBLIC_FILES.has(filename)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  fs.stat(filePath, function (statError, stat) {
    if (statError || !stat.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    if (request.method === "HEAD") response.end();
    else fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer(async function (request, response) {
  const production = IS_PRODUCTION;
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  if (production) response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch (error) { sendJson(response, 400, { message: "Geçersiz istek." }); return; }

  if (pathname === "/api/session" && request.method === "GET") {
    sendJson(response, 200, { authenticated: isAuthenticated(request) });
    return;
  }

  if (pathname === "/api/content" && request.method === "GET") {
    try { sendJson(response, 200, { content: await database.getContent() }); }
    catch (error) { sendJson(response, 500, { message: "Kayıtlı içerik okunamadı." }); }
    return;
  }

  if (pathname === "/api/content" && request.method === "PUT") {
    if (!sameOrigin(request)) { sendJson(response, 403, { message: "İstek doğrulanamadı." }); return; }
    if (!isAuthenticated(request)) { sendJson(response, 401, { message: "İçeriği kaydetmek için yönetici girişi gerekli." }); return; }
    let body;
    try { body = await readJson(request, 2 * 1024 * 1024); }
    catch (error) { sendJson(response, 400, { message: "İçerik okunamadı." }); return; }
    const content = body.content;
    if (!content || !Array.isArray(content.projects) || !Array.isArray(content.notes)) {
      sendJson(response, 400, { message: "İçerik biçimi geçersiz." }); return;
    }
    try {
      await database.saveContent(content);
      sendJson(response, 200, { saved: true });
    } catch (error) { sendJson(response, 500, { message: "İçerik veritabanına kaydedilemedi." }); }
    return;
  }

  if (pathname === "/api/login" && request.method === "POST") {
    if (!sameOrigin(request)) { sendJson(response, 403, { message: "İstek doğrulanamadı." }); return; }
    const ip = request.socket.remoteAddress || "unknown";
    const state = attemptState(ip);
    if (state.blockedUntil > Date.now()) {
      const retrySeconds = Math.ceil((state.blockedUntil - Date.now()) / 1000);
      sendJson(response, 429, { message: "Çok fazla başarısız deneme yapıldı. Bir süre sonra yeniden dene." }, { "Retry-After": String(retrySeconds) });
      return;
    }
    let body;
    try { body = await readJson(request); }
    catch (error) { sendJson(response, 400, { message: "Giriş bilgileri okunamadı." }); return; }
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (username.length > 64 || password.length > 1024) {
      state.count += 1;
      if (state.count >= 5) state.blockedUntil = Date.now() + 15 * 60 * 1000;
      sendJson(response, state.blockedUntil ? 429 : 401, { message: "Kullanıcı adı veya şifre hatalı. Yeniden dene." });
      return;
    }
    let valid = false;
    try { valid = await database.verifyAdmin(username, password); }
    catch (error) { sendJson(response, 503, { message: "Giriş veritabanına erişilemedi." }); return; }
    if (!valid) {
      state.count += 1;
      if (state.count >= 5) state.blockedUntil = Date.now() + 15 * 60 * 1000;
      sendJson(response, state.blockedUntil ? 429 : 401, {
        message: state.blockedUntil ? "Çok fazla başarısız deneme yapıldı. Bir süre sonra yeniden dene." : "Kullanıcı adı veya şifre hatalı. Yeniden dene."
      });
      return;
    }
    loginAttempts.delete(ip);
    // Keep one administrator session active across all browsers and devices.
    sessions.clear();
    const token = crypto.randomBytes(32).toString("base64url");
    sessions.set(token, { expiresAt: Date.now() + SESSION_TTL_MS });
    const cookie = SESSION_COOKIE + "=" + token + "; Path=/; HttpOnly; SameSite=Strict; Max-Age=" + Math.floor(SESSION_TTL_MS / 1000) + (production ? "; Secure" : "");
    sendJson(response, 200, { authenticated: true }, { "Set-Cookie": cookie });
    return;
  }

  if (pathname === "/api/logout" && request.method === "POST") {
    if (!sameOrigin(request)) { sendJson(response, 403, { message: "İstek doğrulanamadı." }); return; }
    const token = cookies(request)[SESSION_COOKIE];
    if (token) sessions.delete(token);
    const cookie = SESSION_COOKIE + "=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0" + (production ? "; Secure" : "");
    sendJson(response, 200, { authenticated: false }, { "Set-Cookie": cookie });
    return;
  }

  if (pathname === "/yonetim.html" && !isAuthenticated(request)) {
    response.writeHead(302, { Location: "/giris.html?next=yonetim.html", "Cache-Control": "no-store" });
    response.end();
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { message: "Bu istek yöntemi desteklenmiyor." }, { Allow: "GET, HEAD" });
    return;
  }
  try { serveFile(request, response, pathname); }
  catch (error) { sendJson(response, 400, { message: "Geçersiz istek." }); }
});

async function start() {
  try {
    await database.initialize();
    server.listen(PORT, IS_PRODUCTION ? "0.0.0.0" : "127.0.0.1", function () {
      console.log("MySQL bağlantısı hazır. Site http://localhost:" + PORT + " adresinde çalışıyor.");
    });
  } catch (error) {
    console.error("MySQL'e bağlanılamadı. .env içindeki DB_HOST, DB_PORT, DB_USER, DB_PASSWORD ve DB_NAME ayarlarını ve MySQL servisinin çalıştığını kontrol et.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

start();
