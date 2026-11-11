import { clearSession, json, sameOrigin } from "../lib/security.mjs";

export const config = { path: "/api/logout" };

export default async function logoutHandler(request) {
  if (request.method !== "POST") return json(405, { message: "Bu istek yöntemi desteklenmiyor." }, { allow: "POST" });
  if (!sameOrigin(request)) return json(403, { message: "İstek doğrulanamadı." });
  try { return json(200, { authenticated: false }, { "set-cookie": await clearSession(request) }); }
  catch { return json(503, { message: "Oturum kapatılamadı." }); }
}
