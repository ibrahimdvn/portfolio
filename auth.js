(function () {
  "use strict";

  async function request(path, options) {
    try {
      const response = await fetch(path, Object.assign({
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" }
      }, options || {}));
      let body = {};
      try { body = await response.json(); } catch (error) { /* Empty response body. */ }
      return { ok: response.ok, status: response.status, body: body };
    } catch (error) {
      return { ok: false, status: 0, body: { message: "Sunucuya bağlanılamadı. Siteyi güvenli sunucu üzerinden aç." } };
    }
  }

  window.AdminAuth = {
    isAuthenticated: async function () {
      const result = await request("/api/session", { method: "GET", headers: {} });
      return result.ok && result.body.authenticated === true;
    },
    login: async function (username, password) {
      return request("/api/login", { method: "POST", body: JSON.stringify({ username: username, password: password }) });
    },
    logout: async function () {
      await request("/api/logout", { method: "POST", body: "{}" });
      window.location.replace("giris.html");
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.endsWith("yonetim.html")) {
      const adminMain = document.querySelector(".admin-main");
      if (adminMain) adminMain.hidden = true;
      Promise.all([
        window.AdminAuth.isAuthenticated(),
        window.AdminContentReady || Promise.resolve(true)
      ]).then(function (results) {
        const authenticated = results[0];
        if (authenticated) {
          if (adminMain) adminMain.hidden = false;
          window.setInterval(function () {
            window.AdminAuth.isAuthenticated().then(function (stillAuthenticated) {
              if (stillAuthenticated) return;
              if (adminMain) adminMain.hidden = true;
              window.location.replace("giris.html?next=yonetim.html&expired=1");
            });
          }, 10000);
        } else {
          window.location.replace("giris.html?next=yonetim.html");
        }
      });
    }
    document.querySelectorAll("[data-logout]").forEach(function (button) {
      button.addEventListener("click", window.AdminAuth.logout);
    });
  });
}());
