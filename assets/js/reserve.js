/* Reserve page (reserve.html in English, reserver.html in Danish): live summary and form submission.
   Submissions are emailed to GreenGuard through FormSubmit (formsubmit.co),
   because GitHub Pages cannot run server code. To change the receiving inbox,
   edit RECIPIENT below. The first submission to a new address triggers a
   one-time activation email from FormSubmit that must be confirmed.
   The page language comes from <html lang="..">: "da" uses the Danish texts. */
(function () {
  "use strict";

  var RECIPIENT = "contact@greenguardautomation.dk";
  var ENDPOINT = "https://formsubmit.co/ajax/" + RECIPIENT;
  var MODULE_WIDTH_M = 1.0;      // 1 m per module
  var HA_MIN_PER_MODULE = 0.1;   // capacity range per module, depends on weed pressure
  var HA_MAX_PER_MODULE = 0.3;
  var INTRO_PRICE_DKK = 225000;  // per module, first 20 modules ordered by 15 December 2026 (excl. VAT and generator)
  var RENT_PRICE_DKK = 100000;   // per module for the whole 2027 season, ordered by 15 December 2026

  var DA = (document.documentElement.lang || "").toLowerCase().indexOf("da") === 0;
  var LOCALE = DA ? "da-DK" : "en-GB";

  var T = DA ? {
    module: " modul, ca. ", modules: " moduler, ca. ", width: " m arbejdsbredde",
    first: "Skriv dit fornavn.", last: "Skriv dit efternavn.",
    email: "Skriv din e-mail, så vi kan sende dig et tilbud.",
    emailBad: "Tjek e-mailadressen, den ser ikke færdig ud.",
    sending: "Sender…", submit: "Reserver Ecoray",
    priceBuy: "Intropris", priceRent: "Leje i 2027", priceDemo: "Intropris, hvis du køber",
    offer: { buy: "Køb", rent: "Leje i 2027", demo: "Demo først" },
    thanks: function (name, email, n) {
      return "Tak, " + name + ". Vi kontakter dig på " + email + " med et tilbud på " + n + (n === "1" ? " modul." : " moduler.");
    },
    failed: "Din reservation blev ikke sendt. Tjek din forbindelse og prøv igen, eller skriv til ",
    none: "Ikke angivet"
  } : {
    module: " module, about ", modules: " modules, about ", width: " m working width",
    first: "Enter your first name.", last: "Enter your last name.",
    email: "Enter an email address so we can send your quote.",
    emailBad: "Check the email address, it doesn't look complete.",
    sending: "Sending reservation…", submit: "Reserve Ecoray",
    priceBuy: "Introductory price", priceRent: "Rental 2027", priceDemo: "Introductory price if you buy",
    offer: { buy: "Buy", rent: "Rent in 2027", demo: "Demo first" },
    thanks: function (name, email, n) {
      return "Thanks, " + name + ". We'll contact you at " + email + " with a quote for " + n + (n === "1" ? " module." : " modules.");
    },
    failed: "Your reservation wasn't sent. Check your connection and try again, or email us at ",
    none: "Not specified"
  };

  var form = document.getElementById("reserve-form");
  if (!form) return;

  var sumWidth = document.getElementById("sum-width");
  var sumCapacity = document.getElementById("sum-capacity");
  var caption = document.getElementById("visual-caption");
  var sumPrice = document.getElementById("sum-price");
  var priceLabel = document.getElementById("price-label");
  var status = document.getElementById("form-status");

  function num(x) { return DA ? x.toFixed(1).replace(/\.0$/, "").replace(".", ",") : x.toFixed(1).replace(/\.0$/, ""); }
  function fmtWidth(n) { return num(n * MODULE_WIDTH_M) + " m"; }
  function fmtCapacity(n) { return num(n * HA_MIN_PER_MODULE) + "–" + num(n * HA_MAX_PER_MODULE); }
  function fmtDkk(x) { return DA ? x.toLocaleString(LOCALE) + " kr." : x.toLocaleString(LOCALE) + " DKK"; }
  function offerValue() {
    var o = form.querySelector('input[name="offer"]:checked');
    return o ? o.value : "buy";
  }
  function fmtPrice(n, offer) { return fmtDkk(n * (offer === "rent" ? RENT_PRICE_DKK : INTRO_PRICE_DKK)); }

  function updateSummary() {
    var checked = form.querySelector('input[name="modules"]:checked');
    var n = checked ? parseInt(checked.value, 10) : 5;
    var offer = offerValue();
    sumWidth.textContent = fmtWidth(n);
    sumCapacity.textContent = fmtCapacity(n);
    if (sumPrice) sumPrice.textContent = fmtPrice(n, offer);
    if (priceLabel) priceLabel.textContent = offer === "rent" ? T.priceRent : (offer === "demo" ? T.priceDemo : T.priceBuy);
    caption.textContent = n + (n === 1 ? T.module : T.modules) + num(n * MODULE_WIDTH_M) + T.width;
  }
  form.addEventListener("change", function (e) {
    if (e.target.name === "modules" || e.target.name === "offer") updateSummary();
  });
  updateSummary();

  function setError(input, message) {
    var id = input.id + "-error";
    var existing = document.getElementById(id);
    if (message) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", id);
      if (!existing) {
        existing = document.createElement("p");
        existing.className = "field-error";
        existing.id = id;
        input.insertAdjacentElement("afterend", existing);
      }
      existing.textContent = message;
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      if (existing) existing.remove();
    }
  }

  function validate() {
    var first = null;
    [["f-first", T.first], ["f-last", T.last], ["f-email", T.email]].forEach(function (pair) {
      var input = document.getElementById(pair[0]);
      var bad = !input.value.trim() || (input.type === "email" && !input.checkValidity());
      var msg = bad ? (input.type === "email" && input.value.trim() ? T.emailBad : pair[1]) : "";
      setError(input, msg);
      if (bad && !first) first = input;
    });
    if (first) first.focus();
    return !first;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    status.classList.remove("is-error");
    if (!validate()) return;
    if (form.elements._honey.value) return; // spam bot

    var data = new FormData(form);
    var crops = data.getAll("crops");
    var n = parseInt(data.get("modules"), 10);
    var offer = offerValue();
    var payload = {
      _subject: "Ecoray " + (offer === "rent" ? "leje" : offer === "demo" ? "demo" : "reservation") + ": " + (data.get("farm") || data.get("last_name")),
      _template: "table",
      _captcha: "false",
      wants: T.offer[offer],
      modules: data.get("modules"),
      working_width: fmtWidth(n),
      capacity_ha_per_hour: fmtCapacity(n),
      price_excl_vat_and_generator: fmtPrice(n, offer),
      crops: crops.length ? crops.join(", ") : T.none,
      farm: data.get("farm") || "",
      row_crop_area_ha: data.get("area_ha") || "",
      country: data.get("country"),
      name: data.get("first_name") + " " + data.get("last_name"),
      email: data.get("email"),
      phone: data.get("phone") || "",
      message: data.get("message") || "",
      page_language: DA ? "Dansk" : "English",
      _replyto: data.get("email")
    };

    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = T.sending;

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok || String(res.body.success) !== "true") throw new Error(res.body.message || "Failed");
        document.getElementById("order-form-wrap").hidden = true;
        var done = document.getElementById("order-done");
        document.getElementById("done-text").textContent = T.thanks(data.get("first_name"), data.get("email"), payload.modules);
        done.hidden = false;
        done.focus();
        window.scrollTo({ top: 0 });
      })
      .catch(function () {
        button.disabled = false;
        button.textContent = T.submit;
        status.classList.add("is-error");
        status.innerHTML = T.failed + '<a href="mailto:' + RECIPIENT + '">' + RECIPIENT + "</a>.";
      });
  });
})();
