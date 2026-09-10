"use strict";

// Presentation gate only: GitHub Pages assets remain publicly accessible.
(() => {
  const form = document.getElementById("password-form");
  const input = document.getElementById("site-password");
  const error = document.getElementById("password-error");

  input.addEventListener("input", () => {
    error.textContent = "";
    input.removeAttribute("aria-invalid");
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (input.value !== "112358") {
      error.textContent = "Password is incorrect";
      input.setAttribute("aria-invalid", "true");
      input.focus();
      input.select();
      return;
    }

    input.value = "";
    const content = document.getElementById("project-content");
    document.body.replaceChildren(content.content.cloneNode(true));
    document.dispatchEvent(new Event("site:unlocked"));
    const main = document.getElementById("main");
    main.tabIndex = -1;
    main.focus({ preventScroll: true });
    const target = document.getElementById(location.hash.slice(1)) || main;
    target.scrollIntoView({ block: "start" });
  });
})();
