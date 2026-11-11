"use strict";

const crypto = require("node:crypto");
const api = require("../src/vercel-api");

module.exports = async function login(request, response) {
  api.secureHeaders(response);
  if (api.onlyMethod(request, response, "POST")) return;
  if (!api.sameOrigin(request)) {
    api.json(response, 403, { message: "İstek doğrulanamadı." });
    return;
  }
  try {
    await api.initializeDatabase();
    const addressHash = api.ipHash(request);
    if (await api.database.isLoginBlocked(addressHash)) {
      api.json(response, 429, { message: "Çok fazla başarısız deneme yapıldı. Bir süre sonra yeniden dene." }, { "Retry-After": "900" });
      return;
    }
    const body = api.parseBody(request);
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    let valid = false;
    if (username.length <= 64 && password.length <= 1024) valid = await api.database.verifyAdmin(username, password);
    if (!valid) {
      const result = await api.database.recordLoginFailure(addressHash);
      api.json(response, result.blocked ? 429 : 401, {
        message: result.blocked ? "Çok fazla başarısız deneme yapıldı. Bir süre sonra yeniden dene." : "Kullanıcı adı veya şifre hatalı. Yeniden dene."
      }, result.blocked ? { "Retry-After": String(result.retryAfter) } : {});
      return;
    }
    await api.database.clearLoginFailures(addressHash);
    const token = crypto.randomBytes(32).toString("base64url");
    const expiresAt = Date.now() + api.SESSION_TTL_MS;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await api.database.saveAdminSession(tokenHash, expiresAt);
    const cookie = api.SESSION_COOKIE + "=" + token + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + Math.floor(api.SESSION_TTL_MS / 1000);
    api.json(response, 200, { authenticated: true }, { "Set-Cookie": cookie });
  } catch (error) {
    api.json(response, 503, { message: "Giriş servisi şu anda kullanılamıyor." });
  }
};
