"use strict";

const crypto = require("node:crypto");
const database = require("./database");

let initialization;
const SESSION_COOKIE = "icd_admin_session";
const SESSION_TTL_MS = 30 * 60 * 1000;

function initializeDatabase() {
  if (!initialization) {
    initialization = database.initialize().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

function secureHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

function json(response, status, value, headers) {
  response.writeHead(status, Object.assign({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }, headers || {}));
  response.end(JSON.stringify(value));
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  const host = request.headers.host;
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

function sessionToken(request) {
  const cookies = String(request.headers.cookie || "").split(";");
  for (const part of cookies) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== SESSION_COOKIE) continue;
    try { return decodeURIComponent(part.slice(separator + 1).trim()); } catch { return ""; }
  }
  return "";
}

async function isAuthenticated(request) {
  const token = sessionToken(request);
  if (!token) return false;
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return database.hasAdminSession(hash);
}

function parseBody(request) {
  const length = Number(request.headers["content-length"] || 0);
  if (length > 2 * 1024 * 1024) throw new Error("Request too large");
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");
  return {};
}

function ipHash(request) {
  const forwarded = request.headers["x-forwarded-for"];
  const ip = request.headers["x-real-ip"] || (forwarded && forwarded.split(",")[0].trim()) || request.socket?.remoteAddress || "unknown";
  return crypto.createHash("sha256").update(String(ip)).digest("hex");
}

function onlyMethod(request, response, method) {
  if (request.method === method) return false;
  json(response, 405, { message: "Bu istek yöntemi desteklenmiyor." }, { Allow: method });
  return true;
}

module.exports = {
  database, SESSION_COOKIE, SESSION_TTL_MS, initializeDatabase,
  secureHeaders, json, sameOrigin, sessionToken, isAuthenticated,
  parseBody, ipHash, onlyMethod
};
