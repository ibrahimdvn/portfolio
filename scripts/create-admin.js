"use strict";

const readline = require("node:readline");
const database = require("../database");

function ask(question) {
  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => prompt.question(question, (answer) => {
    prompt.close();
    resolve(answer.trim());
  }));
}

function askSecret(question) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    return Promise.reject(new Error("Parola gizli girişi için komutu etkileşimli bir terminalde çalıştır."));
  }

  process.stdout.write(question);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  return new Promise((resolve, reject) => {
    let value = "";
    function finish(error) {
      process.stdin.removeListener("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    }
    function onData(buffer) {
      for (const character of buffer.toString("utf8")) {
        if (character === "\u0003") return finish(new Error("İşlem iptal edildi."));
        if (character === "\r" || character === "\n") return finish();
        if (character === "\u0008" || character === "\u007f") {
          if (value.length) {
            value = Array.from(value).slice(0, -1).join("");
            process.stdout.write("\b \b");
          }
          continue;
        }
        if (character >= " ") {
          value += character;
          process.stdout.write("*");
        }
      }
    }
    process.stdin.on("data", onData);
  });
}

async function main() {
  await database.initialize();
  if (await database.hasAdmin()) throw new Error("Yönetici hesabı zaten mevcut; mevcut hesabı korudum.");

  const username = await ask("Yönetici kullanıcı adı: ");
  if (!username || username.length > 64) throw new Error("Kullanıcı adı 1–64 karakter olmalı.");

  const password = await askSecret("Yönetici parolası (giriş gizlidir): ");
  const confirmation = await askSecret("Parolayı tekrar gir: ");
  if (!password || password !== confirmation) throw new Error("Parolalar boş olamaz ve birbiriyle eşleşmeli.");

  await database.createAdmin(username, password);
  console.log("Yönetici hesabı oluşturuldu. Parola yalnızca hash olarak MySQL'e kaydedildi.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(async () => {
  await database.close().catch(() => {});
});
