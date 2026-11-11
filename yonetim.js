(function () {
  "use strict";

  const STORAGE_KEY = "ibrahim-can-duven-site-content-v1";
  const i18n = window.SiteI18n;
  const projectForm = document.getElementById("project-form");
  const noteForm = document.getElementById("note-form");
  const status = document.getElementById("admin-status");
  let content = { projects: [], notes: [] };

  function t(value) {
    return i18n ? i18n.t(value || "") : value || "";
  }

  function localized(item, field) {
    if (i18n && i18n.language === "en" && item[field + "En"]) return item[field + "En"];
    return t(item[field]);
  }

  function loadLegacyContent() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return { projects: [], notes: [] };
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.projects) && Array.isArray(parsed.notes)) return parsed;
      throw new Error("İçerik dosyasının biçimi geçersiz.");
    } catch (error) {
      console.warn("Kayıtlı içerik yüklenemedi; varsayılan içerik kullanılıyor.", error);
      return { projects: [], notes: [] };
    }
  }

  async function saveContent() {
    try {
      const response = await fetch("/api/content", {
        method: "PUT", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content })
      });
      const result = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(result.message || "İçerik kaydedilemedi.");
      announce(t("İçerik veritabanına kaydedildi."));
      renderLists();
      return true;
    } catch (error) {
      announce(error.message || t("Veritabanına bağlanılamadı; içerik kaydedilemedi."));
      console.error("İçerik veritabanına kaydedilemedi.", error);
      return false;
    }
  }

  async function initializeContent() {
    try {
      if (!await window.AdminAuth.isAuthenticated()) return false;
      const response = await fetch("/api/content", { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error("Veritabanındaki içerik alınamadı.");
      const result = await response.json();
      if (result.content && Array.isArray(result.content.projects) && Array.isArray(result.content.notes)) {
        content = result.content;
      } else {
        content = loadLegacyContent();
        const saved = await saveContent();
        if (!saved) return;
        window.localStorage.removeItem(STORAGE_KEY);
      }
      renderLists();
      return true;
    } catch (error) {
      content = { projects: [], notes: [] };
      renderLists();
      announce(t("Veritabanına bağlanılamadı. Yönetim sunucusunu kontrol et."));
      console.error("İçerik başlatılırken veritabanı okunamadı.", error);
      return false;
    }
  }

  function announce(message) {
    status.textContent = message;
    if (window.SiteUI) window.SiteUI.notify(message);
  }

  function noteSlug(value) {
    const transliteration = { "ı": "i", "ğ": "g", "ü": "u", "ş": "s", "ö": "o", "ç": "c" };
    return value.toLowerCase().replace(/[ığüşöç]/g, function (character) { return transliteration[character]; })
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/g, "") || "not";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function renderLists() {
    document.getElementById("admin-project-list").innerHTML = content.projects.length
      ? content.projects.map(function (item) {
        return '<article class="admin-item"><div><strong>' + escapeHtml(localized(item, "title")) + '</strong><span>' + escapeHtml(localized(item, "status")) + '</span></div>' +
          '<div class="admin-item-actions"><button type="button" data-edit="project" data-id="' + escapeHtml(item.id) + '">' + escapeHtml(t("Düzenle")) + '</button><button type="button" data-delete="project" data-id="' + escapeHtml(item.id) + '">' + escapeHtml(t("Sil")) + '</button></div></article>';
      }).join("")
      : '<p class="admin-list-empty">' + escapeHtml(t("Henüz proje eklenmedi.")) + '</p>';
    document.getElementById("admin-note-list").innerHTML = content.notes.length
      ? content.notes.map(function (item) {
        return '<article class="admin-item"><div><strong>' + escapeHtml(localized(item, "title")) + '</strong><span>' + escapeHtml(localized(item, "category")) + ' · ' + escapeHtml(item.date || t("Tarih eklenmedi")) + '</span></div>' +
          '<div class="admin-item-actions"><button type="button" data-edit="note" data-id="' + escapeHtml(item.id) + '">' + escapeHtml(t("Düzenle")) + '</button><button type="button" data-delete="note" data-id="' + escapeHtml(item.id) + '">' + escapeHtml(t("Sil")) + '</button></div></article>';
      }).join("")
      : '<p class="admin-list-empty">' + escapeHtml(t("Henüz not eklenmedi.")) + '</p>';
  }

  function showForm(form) {
    projectForm.hidden = form !== projectForm;
    noteForm.hidden = form !== noteForm;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.querySelector("input:not([type=hidden]), textarea, select").focus({ preventScroll: true });
  }

  function resetForm(form) {
    form.reset();
    form.elements.originalId.value = "";
    form.hidden = true;
  }

  function fillProject(item) {
    const fields = projectForm.elements;
    fields.originalId.value = item.id;
    fields.id.value = item.id;
    fields.title.value = item.title || "";
    fields.subtitle.value = item.subtitle || "";
    fields.category.value = item.category || "";
    fields.status.value = item.status || "";
    fields.date.value = item.date || "";
    fields.url.value = item.url || "";
    fields.summary.value = item.summary || "";
    fields.description.value = item.description || "";
    fields.principles.value = (item.principles || []).join("\n");
    ["title", "subtitle", "category", "status", "summary", "description"].forEach(function (field) {
      fields[field + "En"].value = item[field + "En"] || "";
    });
    fields.principlesEn.value = (item.principlesEn || []).join("\n");
    document.getElementById("project-form-title").textContent = "Projeyi düzenle";
    if (i18n) i18n.apply();
    showForm(projectForm);
  }

  function fillNote(item) {
    const fields = noteForm.elements;
    fields.originalId.value = item.id;
    fields.id.value = item.id;
    fields.title.value = item.title || "";
    fields.category.value = item.category || "";
    fields.date.value = item.date || "";
    fields.readingTime.value = item.readingTime || "";
    fields.summary.value = item.summary || "";
    fields.body.value = item.body || "";
    ["title", "category", "readingTime", "summary", "body"].forEach(function (field) {
      fields[field + "En"].value = item[field + "En"] || "";
    });
    document.getElementById("note-form-title").textContent = "Notu düzenle";
    if (i18n) i18n.apply();
    showForm(noteForm);
  }

  document.getElementById("new-project").addEventListener("click", function () {
    resetForm(noteForm);
    resetForm(projectForm);
    document.getElementById("project-form-title").textContent = "Proje ekle";
    if (i18n) i18n.apply();
    showForm(projectForm);
  });
  projectForm.elements.id.addEventListener("input", function (event) {
    const value = event.currentTarget.value.trim();
    if (!/^https?:\/\//i.test(value)) return;
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
      const segments = parsed.pathname.split("/").filter(Boolean);
      const candidate = (segments.pop() || parsed.hostname.split(".")[0]).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
      if (!candidate) return;
      projectForm.elements.url.value = parsed.href;
      event.currentTarget.value = candidate;
      announce("Bağlantı proje URL alanına taşındı; bağlantı kimliği “" + candidate + "” olarak ayarlandı.");
    } catch (error) {
      return;
    }
  });
  document.getElementById("new-note").addEventListener("click", function () {
    resetForm(projectForm);
    resetForm(noteForm);
    document.getElementById("note-form-title").textContent = "Not ekle";
    if (i18n) i18n.apply();
    showForm(noteForm);
  });

  document.querySelectorAll("[data-cancel-form]").forEach(function (button) {
    button.addEventListener("click", function () { resetForm(button.closest("form")); });
  });

  document.querySelectorAll(".admin-item-list").forEach(function (list) {
    list.addEventListener("click", function (event) {
      const button = event.target.closest("button");
      if (!button) return;
      const type = button.dataset.edit || button.dataset.delete;
      const collection = type === "project" ? content.projects : content.notes;
      const index = collection.findIndex(function (item) { return item.id === button.dataset.id; });
      if (index < 0) return;
      if (button.dataset.edit) {
        if (type === "project") fillProject(collection[index]);
        else fillNote(collection[index]);
      } else {
        const item = collection[index];
        window.SiteUI.confirm('"' + item.title + '" ' + t("İçerik silinsin mi?"), {
          title: t("İçerik silinsin mi?"), confirmLabel: t("Sil"), destructive: true
        }).then(function (confirmed) {
          if (!confirmed) return;
          const currentIndex = collection.findIndex(function (entry) { return entry.id === item.id; });
          if (currentIndex < 0) return;
          collection.splice(currentIndex, 1);
          saveContent();
        });
      }
    });
  });

  projectForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const fields = projectForm.elements;
    const originalId = fields.originalId.value;
    const externalUrl = fields.url.value.trim();
    if (externalUrl) {
      try {
        const parsedUrl = new URL(externalUrl);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new Error("Unsupported protocol");
      } catch (error) {
        announce("Proje bağlantısı http:// veya https:// ile başlamalı.");
        fields.url.focus();
        return;
      }
    }
    const duplicate = content.projects.some(function (item) { return item.id === fields.id.value && item.id !== originalId; });
    if (duplicate) {
      announce(t("Bu bağlantı kimliği başka bir projede kullanılıyor."));
      fields.id.focus();
      return;
    }
    const project = {
      id: fields.id.value.trim(),
      title: fields.title.value.trim(),
      subtitle: fields.subtitle.value.trim(),
      category: fields.category.value.trim(),
      status: fields.status.value.trim(),
      date: fields.date.value.trim(),
      url: externalUrl,
      summary: fields.summary.value.trim(),
      description: fields.description.value.trim(),
      principles: fields.principles.value.split("\n").map(function (line) { return line.trim(); }).filter(Boolean),
      titleEn: fields.titleEn.value.trim(),
      subtitleEn: fields.subtitleEn.value.trim(),
      categoryEn: fields.categoryEn.value.trim(),
      statusEn: fields.statusEn.value.trim(),
      summaryEn: fields.summaryEn.value.trim(),
      descriptionEn: fields.descriptionEn.value.trim(),
      principlesEn: fields.principlesEn.value.split("\n").map(function (line) { return line.trim(); }).filter(Boolean)
    };
    const index = content.projects.findIndex(function (item) { return item.id === originalId; });
    if (index >= 0) content.projects[index] = project;
    else content.projects.push(project);
    saveContent().then(function (saved) { if (saved) resetForm(projectForm); });
  });

  noteForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const fields = noteForm.elements;
    const originalId = fields.originalId.value;
    const baseId = originalId ? fields.id.value : noteSlug(fields.title.value.trim());
    let noteId = baseId;
    let suffix = 2;
    while (content.notes.some(function (item) { return item.id === noteId && item.id !== originalId; })) {
      noteId = baseId.slice(0, 55) + "-" + suffix++;
    }
    const note = {
      id: noteId,
      title: fields.title.value.trim(),
      category: fields.category.value,
      date: fields.date.value.trim(),
      readingTime: fields.readingTime.value.trim(),
      summary: fields.summary.value.trim(),
      body: fields.body.value.trim(),
      titleEn: fields.titleEn.value.trim(),
      categoryEn: fields.categoryEn.value.trim(),
      readingTimeEn: fields.readingTimeEn.value.trim(),
      summaryEn: fields.summaryEn.value.trim(),
      bodyEn: fields.bodyEn.value.trim()
    };
    const index = content.notes.findIndex(function (item) { return item.id === originalId; });
    if (index >= 0) content.notes[index] = note;
    else content.notes.push(note);
    saveContent().then(function (saved) { if (saved) resetForm(noteForm); });
  });

  document.getElementById("export-content").addEventListener("click", function () {
    const file = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ibrahim-can-duven-icerikler.json";
    link.click();
    URL.revokeObjectURL(url);
    announce(t("İçerik yedeği indirildi."));
  });

  document.getElementById("import-content").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      try {
        const imported = JSON.parse(String(reader.result));
        if (!imported || !Array.isArray(imported.projects) || !Array.isArray(imported.notes)) {
          throw new Error("Yedek; projects ve notes listelerini içermelidir.");
        }
        window.SiteUI.confirm("İçe aktarma mevcut içeriklerin yerine geçecek. Devam edilsin mi?", {
          title: "Yedeği içe aktar", confirmLabel: "İçe aktar", destructive: true
        }).then(function (confirmed) {
          if (!confirmed) return;
          content = imported;
          saveContent();
        });
      } catch (error) {
        announce(t("Yedek içe aktarılamadı. JSON biçimini kontrol et."));
        console.error("İçerik yedeği geçersiz.", error);
      } finally {
        event.target.value = "";
      }
    });
    reader.addEventListener("error", function () {
      announce(t("Dosya okunamadı. Başka bir JSON dosyası dene."));
      event.target.value = "";
    });
    reader.readAsText(file);
  });

  window.AdminContentReady = initializeContent();
  document.addEventListener("site-language-change", renderLists);
}());
