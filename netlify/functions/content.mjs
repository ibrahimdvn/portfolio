import { getDb } from "../lib/database.mjs";
import { json, sessionIsValid, sameOrigin } from "../lib/security.mjs";

export const config = { path: "/api/content" };

export default async function contentHandler(request) {
  try {
    if (request.method === "GET") {
      const { rows } = await getDb().pool.query("SELECT content_json FROM site_content WHERE id = 1");
      return json(200, { content: rows[0]?.content_json ?? { projects: [], notes: [] } });
    }
    if (request.method !== "PUT") return json(405, { message: "Bu istek yöntemi desteklenmiyor." }, { allow: "GET, PUT" });
    if (!sameOrigin(request)) return json(403, { message: "İstek doğrulanamadı." });
    if (!await sessionIsValid(request)) return json(401, { message: "İçeriği kaydetmek için yönetici girişi gerekli." });
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 2 * 1024 * 1024) return json(413, { message: "İçerik çok büyük." });
    let body;
    try { body = JSON.parse(raw || "{}"); } catch { return json(400, { message: "İçerik okunamadı." }); }
    const content = body?.content;
    if (!content || !Array.isArray(content.projects) || !Array.isArray(content.notes)) {
      return json(400, { message: "İçerik biçimi geçersiz." });
    }
    await getDb().pool.query(
      `INSERT INTO site_content (id, content_json) VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO UPDATE SET content_json = EXCLUDED.content_json, updated_at = NOW()`,
      [JSON.stringify(content)]
    );
    return json(200, { saved: true });
  } catch {
    return json(503, { message: "Veritabanı işlemi tamamlanamadı." });
  }
}
