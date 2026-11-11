(function () {
  "use strict";

  const i18n = window.SiteI18n;

  function t(value) {
    return i18n ? i18n.t(value || "") : value || "";
  }

  function localized(item, field) {
    if (i18n && i18n.language === "en" && item[field + "En"]) return item[field + "En"];
    return t(item[field]);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function renderProjects(projects) {
    const target = document.getElementById("project-list");
    if (!target) return;
    if (!projects.length) {
      target.innerHTML = '<p class="empty-state">' + escapeHtml(t("Şu anda listelenecek bir proje yok.")) + '</p>';
      return;
    }
    target.innerHTML = projects.map(function (project, index) {
      const url = "detay.html?tip=proje&id=" + encodeURIComponent(project.id);
      return '<article class="project-item">' +
        '<span class="project-number">' + String(index + 1).padStart(2, "0") + '</span>' +
        '<div class="project-main"><p class="project-category">' + escapeHtml(localized(project, "category")) + '</p>' +
        '<h3><a href="' + url + '">' + escapeHtml(localized(project, "title")) + '<span class="project-subtitle"> — ' + escapeHtml(localized(project, "subtitle")) + '</span></a></h3>' +
        '<p class="project-summary">' + escapeHtml(localized(project, "summary")) + '</p></div>' +
        '<div class="project-meta"><span class="status-dot" aria-hidden="true"></span><span>' + escapeHtml(localized(project, "status")) + '</span>' +
        '<a class="arrow-link" href="' + url + '" aria-label="' + escapeHtml(localized(project, "title") + " " + t("projesini incele")) + '">↗</a></div></article>';
    }).join("");
  }

  function renderNotes(notes) {
    const target = document.getElementById("note-list");
    if (!target) return;
    if (!notes.length) {
      target.innerHTML = '<div class="notes-empty"><span class="notes-empty-index">' + escapeHtml(t("ARŞİV / 00")) + '</span><p>' + escapeHtml(t("Bu arşiv henüz ilk notunu bekliyor.")) + '</p><span>' + escapeHtml(t("Yeni araştırma ve yazılar zamanla burada yer alacak.")) + '</span></div>';
      return;
    }
    target.innerHTML = notes.slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    }).map(function (note, index) {
      const url = "detay.html?tip=not&id=" + encodeURIComponent(note.id);
      return '<article class="note-item"><span class="note-number">' + String(index + 1).padStart(2, "0") + '</span>' +
        '<div class="note-main"><p class="note-category">' + escapeHtml(localized(note, "category")) + '</p>' +
        '<h3><a href="' + url + '">' + escapeHtml(localized(note, "title")) + '</a></h3>' +
        '<p>' + escapeHtml(localized(note, "summary")) + '</p></div>' +
        '<div class="note-meta"><span>' + escapeHtml(note.date || t("Tarih eklenmedi")) + '</span>' +
        '<span>' + escapeHtml(localized(note, "readingTime") || t("Süre eklenmedi")) + '</span><a class="arrow-link" href="' + url + '" aria-label="' + escapeHtml(localized(note, "title") + " " + t("yazısını oku")) + '">↗</a></div></article>';
    }).join("");
  }

  function renderDetail(content) {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("tip");
    const id = params.get("id");
    const project = type === "proje" ? content.projects.find(function (item) { return item.id === id; }) : null;
    const note = type === "not" ? content.notes.find(function (item) { return item.id === id; }) : null;
    const item = project || note;
    const main = document.querySelector("[data-detail-root]");
    if (!main) return;
    if (!item) {
      document.title = t("İçerik bulunamadı") + " — İbrahim Can Düven";
      main.innerHTML = '<section class="detail-page section-shell"><a class="back-link" href="index.html#projeler">' + escapeHtml(t("← Ana sayfaya dön")) + '</a><p class="section-kicker">' + escapeHtml(t("İçerik bulunamadı")) + '</p><h1>' + escapeHtml(t("Bu sayfa mevcut değil.")) + '</h1><p>' + escapeHtml(t("İçerik kaldırılmış veya bağlantı değişmiş olabilir.")) + '</p></section>';
      return;
    }
    const isProject = Boolean(project);
    const title = isProject ? localized(item, "title") + " — " + localized(item, "subtitle") : localized(item, "title");
    document.title = title + " — İbrahim Can Düven";
    document.querySelector('meta[name="description"]').setAttribute("content", localized(item, "summary"));
    const contentBody = isProject
      ? '<div class="detail-prose"><p>' + escapeHtml(localized(item, "description")).replace(/\n/g, "<br>") + '</p>' +
        '<h2>' + escapeHtml(t("Temel yaklaşım")) + '</h2><ul>' + (i18n && i18n.language === "en" && item.principlesEn ? item.principlesEn : (item.principles || []).map(t)).map(function (principle) { return "<li>" + escapeHtml(principle) + "</li>"; }).join("") + '</ul></div>'
      : '<div class="detail-prose">' + escapeHtml(localized(item, "body") || "").split(/\n{2,}/).filter(Boolean).map(function (paragraph) { return "<p>" + paragraph.replace(/\n/g, "<br>") + "</p>"; }).join("") + '</div>';
    main.innerHTML = '<article class="detail-page section-shell">' +
      '<a class="back-link" href="index.html#' + (isProject ? "projeler" : "notlar") + '">' + escapeHtml(t(isProject ? "← Tüm projeler" : "← Tüm notlar")) + '</a>' +
      '<p class="section-kicker">' + escapeHtml(localized(item, "category")) + '</p>' +
      '<h1>' + escapeHtml(title) + '</h1><p class="detail-deck">' + escapeHtml(localized(item, "summary")) + '</p>' +
      '<div class="detail-meta"><span>' + escapeHtml(isProject ? localized(item, "status") : (item.date || t("Tarih eklenmedi"))) + '</span>' +
      (!isProject ? '<span>' + escapeHtml(localized(item, "readingTime") || t("Süre eklenmedi")) + '</span>' : (item.url ? '<a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(t("Projeyi görüntüle")) + ' ↗</a>' : "")) + '</div>' +
      contentBody + '<a class="back-link detail-back-bottom" href="index.html#' + (isProject ? "projeler" : "notlar") + '">' + escapeHtml(t("← Listeye dön")) + '</a></article>';
  }

  function initNavigation() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".primary-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });
  }

  function initBackToTop() {
    const button = document.querySelector(".back-to-top");
    if (!button) return;
    function updateButton() {
      const visible = window.scrollY > 420;
      button.classList.toggle("is-visible", visible);
      button.tabIndex = visible ? 0 : -1;
    }
    window.addEventListener("scroll", updateButton, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
    updateButton();
  }

  let content = null;
  fetch("/api/content", { cache: "no-store" }).then(function (response) {
    if (!response.ok) throw new Error("İçerik sunucudan alınamadı.");
    return response.json();
  }).then(function (result) {
    content = result.content && Array.isArray(result.content.projects) && Array.isArray(result.content.notes)
      ? result.content : { projects: [], notes: [] };
    renderProjects(content.projects);
    renderNotes(content.notes);
    renderDetail(content);
  }).catch(function (error) {
    console.error("MySQL içeriği alınamadı.", error);
    const projectList = document.getElementById("project-list");
    const noteList = document.getElementById("note-list");
    if (projectList) projectList.innerHTML = '<p class="empty-state">İçerik veritabanına şu anda ulaşılamıyor.</p>';
    if (noteList) noteList.innerHTML = '<p class="empty-state">İçerik veritabanına şu anda ulaşılamıyor.</p>';
  });
  initNavigation();
  initBackToTop();
  document.addEventListener("site-language-change", function () {
    if (!content) return;
    renderProjects(content.projects);
    renderNotes(content.notes);
    renderDetail(content);
  });
}());
