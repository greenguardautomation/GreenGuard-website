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
  var MODULE_WIDTH_M = 0.6;      // 60 cm per module
  var HA_MIN_PER_MODULE = 0.06;  // capacity range per module (1–3 km/h over 60 cm), depends on weed pressure
  var HA_MAX_PER_MODULE = 0.18;
  // Speed follows the weeds in the row: one module hits about SHOTS_PER_SECOND weeds a second,
  // so speed = shots / (weeds per metre of row x rows under one module), kept inside the brochure's 1–3 km/h.
  var SHOTS_PER_SECOND = 8;      // per module (2 lasers). Change here if the machine figure changes.
  var MIN_KMH = 1, MAX_KMH = 3;
  var WEEDS_PER_M = { low: 8, medium: 12, high: 25 }; // typical value for each choice: under 10, 10–15, 15–30
  var DAY_HOURS = 10;
  var INTRO_PRICE_DKK = 225000;  // per module, first 20 modules ordered by 15 December 2026 (excl. VAT and generator)
  var RENT_PRICE_DKK = 100000;   // per module for the whole 2027 season, ordered by 15 December 2026
  var INTRO_PRICE_EUR = 30000;   // the same offers in euros, as in the English brochure (shown on the English page)
  var RENT_PRICE_EUR = 13500;

  var DA = (document.documentElement.lang || "").toLowerCase().indexOf("da") === 0;
  var LOCALE = DA ? "da-DK" : "en-GB";

  var T = DA ? {
    module: " modul, ca. ", modules: " moduler, ca. ", width: " m arbejdsbredde",
    first: "Skriv dit fornavn.", last: "Skriv dit efternavn.",
    email: "Skriv din e-mail, så vi kan sende dig et tilbud.",
    emailBad: "Tjek e-mailadressen, den ser ikke færdig ud.",
    sending: "Sender…", submit: "Send mig et tilbud",
    priceBuy: "Intropris", priceRent: "Leje i 2027", priceDemo: "Intropris, hvis du køber",
    offer: { buy: "Køb", rent: "Leje i 2027", demo: "Demo først", call: "Ring mig op" },
    thanks: function (name, email, n) {
      return "Tak, " + name + ". Vi kontakter dig på " + email + " med et tilbud på " + n + (n === "1" ? " modul." : " moduler.");
    },
    contact: "Skriv et telefonnummer eller en e-mail, så vi kan kontakte dig.",
    callSubmit: "Ring mig op",
    callThanks: function (name) { return "Tak, " + name + ". Vi kontakter dig hurtigst muligt til en uforpligtende snak."; },
    weeds: { low: "Lavt", medium: "Middel", high: "Højt" },
    speedLine: function (v, d, r) { return "Ca. " + v + " km/t ved " + d + " ukrudt pr. meter række og " + r + (r === "1" ? " række" : " rækker") + " pr. modul."; },
    tooMany: " Så højt tryk kræver mere end én overkørsel eller flere moduler. Vi regner på det i tilbuddet.",
    perDay: function (ha) { return "Ca. " + ha + " hektar på en arbejdsdag på " + DAY_HOURS + " timer"; },
    perPass: function (area, h) { return "Dine " + area + " ha: ca. " + h + " timer pr. overkørsel"; },
    orderSubmit: "Send bestilling",
    orderThanks: function (name) { return "Tak, " + name + ". Vi sender dig aftalen til underskrift. Bestillingen er først bindende, når aftalen er underskrevet."; },
    daysLeft: function (d) { return d === 1 ? "Sidste dag for introprisen" : "Introprisen gælder " + d + " dage endnu"; },
    failed: "Din forespørgsel blev ikke sendt. Tjek din forbindelse og prøv igen, eller skriv til ",
    none: "Ikke angivet"
  } : {
    module: " module, about ", modules: " modules, about ", width: " m working width",
    first: "Enter your first name.", last: "Enter your last name.",
    email: "Enter an email address so we can send your quote.",
    emailBad: "Check the email address, it doesn't look complete.",
    sending: "Sending…", submit: "Get my quote",
    priceBuy: "Introductory price", priceRent: "Rental 2027", priceDemo: "Introductory price if you buy",
    offer: { buy: "Buy", rent: "Rent in 2027", demo: "Demo first", call: "Just call me" },
    thanks: function (name, email, n) {
      return "Thanks, " + name + ". We'll contact you at " + email + " with a quote for " + n + (n === "1" ? " module." : " modules.");
    },
    contact: "Enter a phone number or an email address so we can reach you.",
    callSubmit: "Call me",
    callThanks: function (name) { return "Thanks, " + name + ". We'll be in touch as soon as we can, with no commitment."; },
    weeds: { low: "Low", medium: "Medium", high: "High" },
    speedLine: function (v, d, r) { return "About " + v + " km/h at " + d + " weeds per metre of row and " + r + (r === "1" ? " row" : " rows") + " per module."; },
    tooMany: " Pressure this high needs more than one pass or more modules. We work it out in the quote.",
    perDay: function (ha) { return "About " + ha + " hectares in a " + DAY_HOURS + "-hour working day"; },
    perPass: function (area, h) { return "Your " + area + " ha: about " + h + " hours per pass"; },
    orderSubmit: "Send order",
    orderThanks: function (name) { return "Thanks, " + name + ". We'll send you the agreement to sign. The order is only binding once the agreement is signed."; },
    daysLeft: function (d) { return d === 1 ? "Last day for the introductory price" : "Introductory price ends in " + d + " days"; },
    failed: "Your request wasn't sent. Check your connection and try again, or email us at ",
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
  function num2(x) { return DA ? x.toFixed(2).replace(".", ",") : x.toFixed(2); }
  function weedsValue() {
    var w = form.querySelector('input[name="weeds"]:checked');
    return w ? w.value : "medium";
  }
  function growMode() {
    var g = form.querySelector('input[name="growing"]:checked');
    return g ? g.getAttribute("data-grow") : "beds";
  }
  // Rows under one 60 cm module: from the row spacing, or from rows per bed and track width.
  function rowsPerModule() {
    var cm = MODULE_WIDTH_M * 100, r = 1;
    if (growMode() === "rows") {
      var s = parseFloat(form.elements.row_spacing_cm.value);
      if (s > 0) r = Math.max(1, Math.floor(cm / s));
    } else {
      var per = parseFloat(form.elements.rows_per_bed.value), track = parseFloat(form.elements.track_width_cm.value);
      if (per > 0 && track > 0) r = per * cm / track;
    }
    return Math.max(0.25, r);
  }
  function weedsPerMetre() {
    var own = parseFloat(form.elements.weeds_per_m.value);
    return own > 0 ? own : WEEDS_PER_M[weedsValue()];
  }
  function neededKmh() { return SHOTS_PER_SECOND * 3.6 / (weedsPerMetre() * rowsPerModule()); }
  function speedKmh() { return Math.min(MAX_KMH, Math.max(MIN_KMH, neededKmh())); }
  // Hectares per hour = working width (m) x speed (km/h) / 10.
  function capacity(n) { return n * MODULE_WIDTH_M * speedKmh() / 10; }
  function fmtCapacity(n) { return num2(capacity(n)); }
  function orderNow() {
    var o = offerValue(), box = form.elements.order_now;
    return (o === "buy" || o === "rent") && box && box.checked;
  }
  function submitLabel() { return offerValue() === "call" ? T.callSubmit : (orderNow() ? T.orderSubmit : T.submit); }
  function fmtMoney(x) { return DA ? x.toLocaleString(LOCALE) + " kr." : "€" + x.toLocaleString(LOCALE); }
  function offerValue() {
    var o = form.querySelector('input[name="offer"]:checked');
    return o ? o.value : "buy";
  }
  function fmtPrice(n, offer) {
    var rent = DA ? RENT_PRICE_DKK : RENT_PRICE_EUR, buy = DA ? INTRO_PRICE_DKK : INTRO_PRICE_EUR;
    return fmtMoney(n * (offer === "rent" ? rent : buy));
  }

  function updateSummary() {
    var checked = form.querySelector('input[name="modules"]:checked');
    var n = checked ? parseInt(checked.value, 10) : 5;
    var offer = offerValue();
    sumWidth.textContent = fmtWidth(n);
    // A typed number picks the matching choice.
    var own = parseFloat(form.elements.weeds_per_m.value);
    if (own > 0) form.querySelector('input[name="weeds"][value="' + (own < 10 ? "low" : own <= 15 ? "medium" : "high") + '"]').checked = true;
    sumCapacity.textContent = fmtCapacity(n);
    var sumSpeed = document.getElementById("sum-speed");
    if (sumSpeed) sumSpeed.textContent = num(speedKmh());
    var weedResult = document.getElementById("weed-result");
    if (weedResult) weedResult.textContent = T.speedLine(num(speedKmh()), num(weedsPerMetre()), num(rowsPerModule())) + (neededKmh() < MIN_KMH - 0.05 ? T.tooMany : "");
    var img = document.getElementById("visual-img");
    if (img) { var src = "assets/media/ecoray-row-" + n + ".webp?v=2"; if (img.getAttribute("src") !== src) { img.removeAttribute("width"); img.removeAttribute("height"); img.src = src; } }
    var work = document.getElementById("sum-work");
    if (work) {
      var cap = capacity(n), area = parseFloat(form.elements.area_ha.value);
      var line = T.perDay(num(cap * DAY_HOURS));
      if (area > 0) line += ". " + T.perPass(num(area), Math.round(area / cap));
      work.textContent = line + ".";
    }
    // Beds or rows: show only the fields that fit.
    var grow = growMode();
    form.querySelectorAll("[data-for]").forEach(function (el) { el.hidden = el.getAttribute("data-for") !== grow; });
    if (sumPrice) sumPrice.textContent = fmtPrice(n, offer);
    if (priceLabel) priceLabel.textContent = offer === "rent" ? T.priceRent : (offer === "demo" ? T.priceDemo : T.priceBuy);
    caption.textContent = n + (n === 1 ? T.module : T.modules) + num(n * MODULE_WIDTH_M) + T.width;
    // "Just call me": hide everything except the contact details.
    var call = offer === "call";
    form.parentNode.querySelectorAll("[data-detail]").forEach(function (el) { el.hidden = call; });
    var hint = document.getElementById("call-hint");
    if (hint) hint.hidden = !call;
    var tick = document.getElementById("order-tick");
    if (tick) tick.hidden = !(offer === "buy" || offer === "rent");
    form.querySelector('button[type="submit"]').textContent = submitLabel();
  }

  // Days left until the order deadline (15 December 2026, Danish time). Hidden after the deadline.
  var deadline = document.getElementById("deadline");
  if (deadline) {
    var daysLeft = Math.ceil((Date.parse("2026-12-15T23:59:59+01:00") - Date.now()) / 86400000);
    if (daysLeft >= 1) { deadline.textContent = T.daysLeft(daysLeft); deadline.hidden = false; }
  }
  form.addEventListener("change", function (e) {
    if (e.target.name === "weeds") form.elements.weeds_per_m.value = ""; // a choice replaces a typed number
    if (["modules", "offer", "weeds", "growing", "order_now"].indexOf(e.target.name) !== -1) updateSummary();
  });
  ["area_ha", "weeds_per_m", "row_spacing_cm", "track_width_cm", "rows_per_bed"].forEach(function (k) {
    form.elements[k].addEventListener("input", updateSummary);
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
    var call = offerValue() === "call";
    var phone = document.getElementById("f-phone");
    var hasPhone = !!phone.value.trim();
    // A call-back needs a first name and a phone number or an email. A quote needs full name and email.
    var rules = call ? [["f-first", T.first], ["f-email", T.contact]] : [["f-first", T.first], ["f-last", T.last], ["f-email", T.email]];
    setError(document.getElementById("f-last"), "");
    rules.forEach(function (pair) {
      var input = document.getElementById(pair[0]);
      var empty = !input.value.trim();
      var bad = (empty && !(call && input.type === "email" && hasPhone)) || (!empty && input.type === "email" && !input.checkValidity());
      var msg = bad ? (input.type === "email" && !empty ? T.emailBad : pair[1]) : "";
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
    var growEl = form.querySelector('input[name="growing"]:checked');
    var isRows = !!growEl && growEl.getAttribute("data-grow") === "rows";
    var ordering = orderNow();
    var payload = {
      _subject: (offer === "call" ? "Ecoray: ring mig op: " + (data.get("first_name") + " " + data.get("last_name")).trim()
        : (orderNow() ? "Ecoray BESTILLING (" : "Ecoray tilbud (") + (offer === "rent" ? "leje" : offer === "demo" ? "demo" : "køb") + "): " + (data.get("farm") || data.get("last_name"))),
      _template: "table",
      _captcha: "false",
      wants: T.offer[offer] + (orderNow() ? " – BESTILLER NU, send aftale til underskrift" : ""),
      modules: data.get("modules"),
      working_width: fmtWidth(n),
      weed_pressure_in_row: T.weeds[weedsValue()] + ", ca. " + num(weedsPerMetre()) + " ukrudt pr. meter række" + (form.elements.weeds_per_m.value ? " (tastet selv)" : " (typisk for valget)"),
      rows_per_module: num(rowsPerModule()),
      speed_km_per_hour: num(speedKmh()) + (neededKmh() < MIN_KMH - 0.05 ? " (trykket kræver under 1 km/t: flere overkørsler eller moduler)" : ""),
      capacity_ha_per_hour: fmtCapacity(n),
      price_excl_vat_and_generator: fmtPrice(n, offer),
      crops: crops.length ? crops.join(", ") : T.none,
      farm: data.get("farm") || "",
      row_crop_area_ha: data.get("area_ha") || "",
      growing: data.get("growing") || "",
      row_spacing_cm: isRows ? (data.get("row_spacing_cm") || "") : "",
      track_width_cm: isRows ? "" : (data.get("track_width_cm") || ""),
      rows_per_bed: isRows ? "" : (data.get("rows_per_bed") || ""),
      country: data.get("country"),
      name: (data.get("first_name") + " " + data.get("last_name")).trim(),
      email: data.get("email"),
      phone: data.get("phone") || "",
      message: data.get("message") || "",
      keep_me_updated: data.get("updates") ? "Ja" : "Nej",
      page_language: DA ? "Dansk" : "English",
      _replyto: data.get("email")
    };
    if (offer === "call") {
      ["modules", "working_width", "capacity_ha_per_hour", "price_excl_vat_and_generator", "crops", "farm", "row_crop_area_ha", "growing", "row_spacing_cm", "track_width_cm", "rows_per_bed", "weed_pressure_in_row", "rows_per_module", "speed_km_per_hour", "country"].forEach(function (k) { delete payload[k]; });
    }
    if (!payload._replyto) delete payload._replyto;

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
        document.getElementById("done-text").textContent = offer === "call" ? T.callThanks(data.get("first_name")) : ordering ? T.orderThanks(data.get("first_name")) : T.thanks(data.get("first_name"), data.get("email"), data.get("modules"));
        done.hidden = false;
        done.focus();
        window.scrollTo({ top: 0 });
      })
      .catch(function () {
        button.disabled = false;
        button.textContent = submitLabel();
        status.classList.add("is-error");
        status.innerHTML = T.failed + '<a href="mailto:' + RECIPIENT + '">' + RECIPIENT + "</a>.";
      });
  });
})();
