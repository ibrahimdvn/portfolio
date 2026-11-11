import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const publicFiles = [
  "app.js", "auth.js", "detay.html", "favicon.svg", "giris.html", "giris.js",
  "i18n.js", "index.html", "logo.svg", "profile-photo.png", "styles.css",
  "ui.js", "yonetim.html", "yonetim.js"
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of publicFiles) {
  await cp(path.join(root, file), path.join(output, file));
}
console.log(`Netlify için ${publicFiles.length} statik dosya dist/ klasörüne hazırlandı.`);
