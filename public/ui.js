(function () {
  "use strict";
  const stack = document.createElement("div");
  stack.className = "site-toast-stack";
  stack.setAttribute("aria-live", "polite");
  stack.setAttribute("aria-relevant", "additions text");
  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(stack);
  });

  window.SiteUI = {
    notify: function (message, type) {
      const toast = document.createElement("div");
      toast.className = "site-toast" + (type ? " site-toast-" + type : "");
      toast.setAttribute("role", type === "error" ? "alert" : "status");
      toast.textContent = message;
      stack.appendChild(toast);
      while (stack.children.length > 3) stack.firstElementChild.remove();
      window.setTimeout(function () {
        toast.classList.add("is-leaving");
        window.setTimeout(function () { toast.remove(); }, 220);
      }, 4200);
    },
    confirm: function (message, options) {
      const settings = options || {};
      return new Promise(function (resolve) {
        const dialog = document.createElement("dialog");
        dialog.className = "site-confirm-dialog";
        const title = document.createElement("h2");
        title.className = "site-confirm-title";
        title.textContent = settings.title || "Onay gerekiyor";
        const description = document.createElement("p");
        description.className = "site-confirm-message";
        description.textContent = message;
        const actions = document.createElement("div");
        actions.className = "site-confirm-actions";
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className = "button button-quiet";
        cancel.textContent = settings.cancelLabel || "Vazgeç";
        const confirm = document.createElement("button");
        confirm.type = "button";
        confirm.className = "button " + (settings.destructive ? "button-danger" : "button-primary");
        confirm.textContent = settings.confirmLabel || "Onayla";
        actions.append(cancel, confirm);
        dialog.append(title, description, actions);
        document.body.appendChild(dialog);

        let settled = false;
        function finish(value) {
          if (settled) return;
          settled = true;
          if (dialog.open) dialog.close();
          dialog.remove();
          resolve(value);
        }
        cancel.addEventListener("click", function () { finish(false); });
        confirm.addEventListener("click", function () { finish(true); });
        dialog.addEventListener("cancel", function (event) {
          event.preventDefault();
          finish(false);
        });
        dialog.addEventListener("click", function (event) {
          if (event.target === dialog) finish(false);
        });
        dialog.showModal();
        confirm.focus();
      });
    }
  };
}());
