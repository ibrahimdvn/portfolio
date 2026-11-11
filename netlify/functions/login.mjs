import {
  clearLoginFailures, clientIp, createSession, ensureAdmin, getLoginThrottle, hashIp,
  json, recordLoginFailure, sameOrigin, verifyAdmin
} from "./_shared/security.mjs";

export const config = { path: "/api/login" };

export default async function loginHandler(request, context) {
  if (request.method !== "POST") return json(405, { message: "Bu istek yöntemi desteklenmiyor." }, { allow: "POST" });
  if (!sameOrigin(request)) return json(403, { message: "İstek doğrulanamadı." });
  try {
    await ensureAdmin();
    const ipHash = hashIp(clientIp(request, context));
    const throttle = await getLoginThrottle(ipHash);
    if (throttle?.blocked_until > Date.now()) {
      const retry = Math.ceil((throttle.blocked_until - Date.now()) / 1000);
      return json(429, { message: "Çok fazla başarısız deneme yapıldı. Bir süre sonra yeniden dene." }, { "retry-after": String(retry) });
    }
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 4096) return json(400, { message: "Giriş bilgileri okunamadı." });
    let body;
    try { body = JSON.parse(raw || "{}"); } catch { return json(400, { message: "Giriş bilgileri okunamadı." }); }
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const valid = username.length <= 64 && password.length <= 1024 && await verifyAdmin(username, password);
    if (!valid) {
      const state = await recordLoginFailure(ipHash);
      const blocked = state?.blocked_until > Date.now();
      return json(blocked ? 429 : 401, { message: blocked ? "Çok fazla başarısız deneme yapıldı. Bir süre sonra yeniden dene." : "Kullanıcı adı veya şifre hatalı. Yeniden dene." });
    }
    await clearLoginFailures(ipHash);
    return json(200, { authenticated: true }, { "set-cookie": await createSession(request) });
  } catch {
    return json(503, { message: "Giriş hizmeti kullanılamıyor. Veritabanı ve yönetici ayarlarını kontrol et." });
  }
}
