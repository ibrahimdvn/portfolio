(function () {
  "use strict";
  const form = document.getElementById("login-form");
  const password = document.getElementById("password");
  const error = document.getElementById("login-error");
  window.AdminAuth.isAuthenticated().then(function (authenticated) {
    if (authenticated) location.replace("yonetim.html");
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const submit = form.querySelector("[type=submit]");
    submit.disabled = true;
    error.hidden = true;
    window.AdminAuth.login(form.elements.username.value, password.value).then(function (result) {
      if (!result.ok) {
        error.textContent = result.body.message || (result.status === 429
          ? "Çok fazla başarısız deneme yapıldı. Bir süre sonra yeniden dene."
          : "Kullanıcı adı veya şifre hatalı. Yeniden dene.");
        error.hidden = false;
        password.select();
        submit.disabled = false;
        return;
      }
      location.replace("yonetim.html");
    });
  });
  document.getElementById("toggle-password").addEventListener("click", function (event) {
    const visible = password.type === "password";
    password.type = visible ? "text" : "password";
    event.currentTarget.textContent = visible ? "Gizle" : "Göster";
    event.currentTarget.setAttribute("aria-label", visible ? "Şifreyi gizle" : "Şifreyi göster");
  });
}());
