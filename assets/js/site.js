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

  // Language links remember the visitor's choice, so the automatic choice of Danish stops once they pick English.
  document.querySelectorAll("a[data-lang]").forEach(function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("gg-lang", a.getAttribute("data-lang")); } catch (e) {}
    });
  });

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

  // Launch offer: a slim bar with the days left until the order deadline (15 December 2026, Danish time).
  // It disappears by itself after the deadline. Not shown on the quote pages, which carry the deadline already.
  (function () {
    var end = Date.parse("2026-12-15T23:59:59+01:00");
    var days = Math.ceil((end - Date.now()) / 86400000);
    var cta = document.querySelector('.nav a.btn[href*="reserve"]');
    if (days < 1 || !cta || document.getElementById("reserve-form")) return;
    try { if (sessionStorage.getItem("gg-offer-closed")) return; } catch (e) {}
    var da = (document.documentElement.lang || "").toLowerCase().indexOf("da") === 0;
    var left = da ? (days === 1 ? "Sidste dag" : days + " dage tilbage") : (days === 1 ? "Last day" : days + " days left");
    var bar = document.createElement("div");
    bar.className = "offer-bar";
    var text = document.createElement("span");
    var narrow = window.innerWidth < 480; // phones get the short version, so the bar stays two lines
    text.textContent = (narrow ? (da ? "Introtilbud: spar 50.000 kr. pr. modul. " : "Launch offer: save €7,000 per module. ")
      : (da ? "Introtilbud på de første 20 moduler: spar 50.000 kr. pr. modul. " : "Launch offer on the first 20 modules: save €7,000 per module. ")) + left + ".";
    var link = document.createElement("a");
    link.href = cta.href;
    link.textContent = da ? "Få et tilbud" : "Get a quote";
    var x = document.createElement("button");
    x.type = "button";
    x.setAttribute("aria-label", da ? "Luk" : "Close");
    x.textContent = "\u00d7";
    x.addEventListener("click", function () {
      bar.remove();
      spacer.style.paddingBottom = "";
      document.documentElement.style.removeProperty("--bar-h");
      try { sessionStorage.setItem("gg-offer-closed", "1"); } catch (e) {}
    });
    bar.appendChild(text); bar.appendChild(link); bar.appendChild(x);
    document.body.appendChild(bar);
    // Room for the bar at the very end of the page, added to the footer so no bare strip shows under it.
    var spacer = document.querySelector("footer") || document.body;
    spacer.style.paddingBottom = (parseFloat(window.getComputedStyle(spacer).paddingBottom) || 0) + bar.offsetHeight + "px";
    document.documentElement.style.setProperty("--bar-h", bar.offsetHeight + "px");
  })();

  // Current year in footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
