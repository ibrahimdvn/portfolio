"use strict";

const api = require("../src/vercel-api");

module.exports = async function content(request, response) {
  api.secureHeaders(response);
  response.setHeader("Cache-Control", "no-store");
  try {
    await api.initializeDatabase();
    if (request.method === "GET") {
      api.json(response, 200, { content: await api.database.getContent() });
      return;
    }
    if (request.method !== "PUT") {
      api.json(response, 405, { message: "Bu istek yöntemi desteklenmiyor." }, { Allow: "GET, PUT" });
      return;
    }
    if (!api.sameOrigin(request)) {
      api.json(response, 403, { message: "İstek doğrulanamadı." });
      return;
    }
    if (!await api.isAuthenticated(request)) {
      api.json(response, 401, { message: "İçeriği kaydetmek için yönetici girişi gerekli." });
      return;
    }
    const body = api.parseBody(request);
    const content = body.content;
    if (!content || !Array.isArray(content.projects) || !Array.isArray(content.notes)) {
      api.json(response, 400, { message: "İçerik biçimi geçersiz." });
      return;
    }
    await api.database.saveContent(content);
    api.json(response, 200, { saved: true });
  } catch (error) {
    api.json(response, 500, { message: "İçerik servisi şu anda kullanılamıyor." });
  }
};
