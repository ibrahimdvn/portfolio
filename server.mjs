import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeDatabase } from "./netlify/lib/database.mjs";
import { sessionIsValid } from "./netlify/lib/security.mjs";
import contentHandler from "./netlify/functions/content.mjs";
import loginHandler from "./netlify/functions/login.mjs";
import logoutHandler from "./netlify/functions/logout.mjs";
import sessionHandler from "./netlify/functions/session.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
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
  ".png": "image/png"
};
const API_HANDLERS = new Map([
  ["/api/content", contentHandler],
  ["/api/login", loginHandler],
  ["/api/logout", logoutHandler],
  ["/api/session", sessionHandler]
]);

function securityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
}

async function readRequest(request, limit = 2 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error("Request too large"), { statusCode: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function toWebRequest(request, url) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
  }
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await readRequest(request);
  return new Request(url, { method: request.method, headers, body });
}

async function sendApiResponse(request, response, url, handler) {
  const webRequest = await toWebRequest(request, url);
  const webResponse = await handler(webRequest, { ip: request.socket.remoteAddress || "unknown" });
  response.statusCode = webResponse.status;
  webResponse.headers.forEach((value, name) => response.setHeader(name, value));
  response.end(Buffer.from(await webResponse.arrayBuffer()));
}

async function serveStatic(request, response, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch { response.writeHead(400).end("Bad request"); return; }
  const fileName = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const filePath = path.resolve(ROOT, fileName);
  if (path.dirname(filePath) !== ROOT || !PUBLIC_FILES.has(path.basename(filePath))) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
    return;
  }
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const content = await readFile(filePath);
    response.writeHead(200, {
      "content-type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-store",
      "content-length": content.length
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
  }
}

const server = createServer(async (request, response) => {
  securityHeaders(response);
  let url;
  try {
    const protocol = request.socket.encrypted ? "https" : "http";
    url = new URL(request.url, `${protocol}://${request.headers.host || "localhost"}`);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  try {
    const handler = API_HANDLERS.get(url.pathname);
    if (handler) {
      await sendApiResponse(request, response, url, handler);
      return;
    }
    if (url.pathname === "/yonetim.html" && request.method === "GET") {
      const webRequest = await toWebRequest(request, url);
      if (!await sessionIsValid(webRequest)) {
        response.writeHead(302, { location: "/giris.html?next=yonetim.html", "cache-control": "no-store" }).end();
        return;
      }
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { allow: "GET, HEAD", "content-type": "text/plain; charset=utf-8" }).end("Method not allowed");
      return;
    }
    await serveStatic(request, response, url.pathname);
  } catch (error) {
    const statusCode = Number(error.statusCode) || 500;
    response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    response.end(JSON.stringify({ message: statusCode === 413 ? "İstek çok büyük." : "Sunucu isteği tamamlayamadı." }));
    if (statusCode >= 500) console.error("İstek işlenemedi:", error.name || "Error");
  }
});

try {
  await initializeDatabase();
  server.listen(PORT, HOST, () => console.log(`Site ve PostgreSQL API hazır: http://${HOST}:${PORT}`));
} catch (error) {
  console.error("PostgreSQL bağlantısı kurulamadı. .env içindeki PGHOST, PGPORT, PGUSER, PGPASSWORD ve PGDATABASE ayarlarını kontrol et.");
  console.error("Hata türü:", error.name || "Error");
  process.exitCode = 1;
}
