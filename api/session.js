"use strict";

const api = require("../src/vercel-api");

module.exports = async function session(request, response) {
  api.secureHeaders(response);
  if (api.onlyMethod(request, response, "GET")) return;
  try {
    await api.initializeDatabase();
    api.json(response, 200, { authenticated: await api.isAuthenticated(request) });
  } catch (error) {
    api.json(response, 503, { message: "Oturum doğrulanamadı." });
  }
};
