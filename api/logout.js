"use strict";

const crypto = require("node:crypto");
const api = require("../src/vercel-api");

module.exports = async function logout(request, response) {
  api.secureHeaders(response);
  if (api.onlyMethod(request, response, "POST")) return;
  if (!api.sameOrigin(request)) {
    api.json(response, 403, { message: "İstek doğrulanamadı." });
    return;
  }
  try {
    await api.initializeDatabase();
    const token = api.sessionToken(request);
    if (token) {
      const hash = crypto.createHash("sha256").update(token).digest("hex");
      await api.database.deleteAdminSession(hash);
    }
    const cookie = api.SESSION_COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
    api.json(response, 200, { authenticated: false }, { "Set-Cookie": cookie });
  } catch (error) {
    api.json(response, 503, { message: "Oturum kapatılamadı." });
  }
};
