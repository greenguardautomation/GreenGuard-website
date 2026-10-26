/* GreenGuard Automation — shared page behaviour */
(function () {
  "use strict";

  // Nav turns solid once the visitor scrolls past the first screen-ish.
  var nav = document.querySelector(".nav");
  if (nav && !nav.classList.contains("nav--light") && !nav.hasAttribute("data-stay-clear")) {
    var onScroll = function () {
      nav.classList.toggle("is-solid", window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile menu
  var menuBtn = document.querySelector(".menu-btn");
  var sheet = document.getElementById("menu");
  if (menuBtn && sheet) {
    var closeBtn = sheet.querySelector(".sheet-close");
    var open = function () {
      sheet.classList.add("is-open");
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      (sheet.querySelector("a") || closeBtn).focus();
    };
    var close = function () {
      sheet.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      menuBtn.focus();
    };
    menuBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sheet.classList.contains("is-open")) close();
    });
  }

  // Background videos: pause for visitors who prefer reduced motion.
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("video[autoplay]").forEach(function (v) {
      v.removeAttribute("autoplay");
      v.pause();
    });
  }

  // Current year in footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
