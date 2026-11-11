import { json, sessionIsValid } from "../lib/security.mjs";

export const config = { path: "/api/session" };

export default async function sessionHandler(request) {
  try { return json(200, { authenticated: await sessionIsValid(request) }); }
  catch { return json(503, { authenticated: false, message: "Oturum doğrulanamadı." }); }
}
