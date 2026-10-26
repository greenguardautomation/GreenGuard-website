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

  // Film player: any [data-film] button opens the dialog and plays with sound.
  var film = document.getElementById("film");
  if (film && film.showModal) {
    var filmVideo = film.querySelector("video");
    var opener = null;
    document.querySelectorAll("[data-film]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        opener = btn;
        if (filmVideo.getAttribute("src") !== btn.dataset.film) filmVideo.src = btn.dataset.film;
        film.showModal();
        var p = filmVideo.play();
        if (p && p.catch) p.catch(function () {});
      });
    });
    var closeFilm = function () { if (film.open) film.close(); };
    film.querySelector(".film-close").addEventListener("click", closeFilm);
    film.addEventListener("click", function (e) { if (e.target === film) closeFilm(); });
    film.addEventListener("close", function () {
      filmVideo.pause();
      if (opener) opener.focus();
    });
  } else {
    // Very old browsers: open the file directly.
    document.querySelectorAll("[data-film]").forEach(function (btn) {
      btn.addEventListener("click", function () { window.location.href = btn.dataset.film; });
    });
  }

  // Current year in footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
