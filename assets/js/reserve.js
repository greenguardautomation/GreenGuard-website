/* Reserve page (reserve.html in English, reserver.html in Danish): live summary and form submission.
   Submissions are emailed to GreenGuard through Web3Forms (web3forms.com),
   because GitHub Pages cannot run server code. Each access key below belongs to one inbox:
   ACCESS_KEY sends to sales@greenguardautomation.com, and every key in EXTRA_KEYS gets a copy.
   To change an inbox, create a form for the new address in the Web3Forms account and swap the key.
   The keys are not secrets; each can only send mail to its own inbox.
   The page language comes from <html lang="..">: "da" uses the Danish texts. */
(function () {
  "use strict";

  var ACCESS_KEY = "adc2c9d5-be7d-47c6-911f-358bbc07d0a1"; // Web3Forms key for sales@greenguardautomation.com
  // Extra inboxes that get the same mail. The free plan sends to one inbox per key, so each extra inbox needs its own key.
  var EXTRA_KEYS = ["4502db15-74ad-4461-a44f-1864c358ea1b"]; // btc@greenguardautomation.com
  var ENDPOINT = "https://api.web3forms.com/submit";
  var RECIPIENT = "sales@greenguardautomation.com"; // used by the "send it as an email instead" fallback
  var COPY_TO = "btc@greenguardautomation.com";      // copied on that fallback email
  var MODULE_WIDTH_M = 0.6;      // 60 cm per module
  var HA_MIN_PER_MODULE = 0.06;  // capacity range per module (1–3 km/h over 60 cm), depends on weed pressure
  var HA_MAX_PER_MODULE = 0.18;
  var SPEED_KMH = { low: 3, medium: 2, high: 1 }; // driving speed by weed pressure in the row, the brochure's 1–3 km/h
  var DAY_HOURS = 10;
  // PTO generator by number of modules, and the tractor PTO power each model needs. Same figures as the brochure's price and model tables.
  var GENERATOR_DKK = { 2: 31500, 3: 39000, 4: 45500, 5: 52000, 6: 60000, 8: 75000, 10: 90000 };
  var GENERATOR_EUR = { 2: 4200, 3: 5200, 4: 6100, 5: 7000, 6: 8000, 8: 10000, 10: 12000 };
  var PTO_HP = { 2: 30, 3: 40, 4: 55, 5: 65, 6: 75, 8: 100, 10: 120 };
  var INTRO_PRICE_DKK = 225000;  // per module, first 20 modules ordered by 15 December 2026 (excl. VAT and generator)
  var RENT_PRICE_DKK = 100000;   // per module for the whole 2027 season, ordered by 15 December 2026
  var STD_PRICE_DKK = 275000, STD_PRICE_EUR = 37000; // standard price per module, as in the brochure
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
    withGen: " inkl. PTO-generator", withoutGen: " uden generator", genNone: "0 kr.", genAsk: "vi regner den med i tilbuddet",
    genHint: function (hp) { return "Ecoray kører på 230 V fra en PTO-generator. Traktorens PTO skal være godkendt til mindst " + hp + " hk."; },
    genYes: "Ja, købes med", genNo: "Nej, har egen 230 V",
    save: function (x) { return "Du sparer " + x; },
    left: function (d) { return d === 1 ? "Sidste dag for introprisen · kun de første 20 moduler" : "Introprisen gælder " + d + " dage endnu · kun de første 20 moduler"; },
    offer: { buy: "Køb", rent: "Leje i 2027", demo: "Demo først", call: "Ring mig op", trial: "Gratis afprøvning (SMV:Robot)" },
    trialSubmit: "Skriv mig op til afprøvning",
    trialThanks: function (name) { return "Tak, " + name + ". Vi ringer til dig, ser på om din bedrift kan søge SMV:Robot, og giver besked, så snart næste ansøgningsrunde åbner."; },
    staff: { yes: "Ja", no: "Nej", unsure: "Ved ikke" },
    thanks: function (name, email, n) {
      return "Tak, " + name + ". Vi kontakter dig på " + email + " med et tilbud på " + n + (n === "1" ? " modul." : " moduler.");
    },
    contact: "Skriv et telefonnummer eller en e-mail, så vi kan kontakte dig.",
    callSubmit: "Ring mig op",
    callThanks: function (name) { return "Tak, " + name + ". Vi kontakter dig hurtigst muligt til en uforpligtende snak."; },
    weeds: { low: "Lavt", medium: "Middel", high: "Højt" },
    perDay: function (ha) { return "Ca. " + ha + " hektar på en arbejdsdag på " + DAY_HOURS + " timer"; },
    perPass: function (area, h) { return "Dine " + area + " ha: ca. " + h + " timer pr. overkørsel"; },
    orderSubmit: "Send bestilling", titleQuote: "Få et tilbud", titleOrder: "Bestil Ecoray", doneOrder: "Tak for din bestilling",
    orderThanks: function (name) { return "Tak, " + name + ". Vi sender dig aftalen til underskrift. Bestillingen er først bindende, når aftalen er underskrevet."; },
    daysLeft: function (d) { return d === 1 ? "Sidste dag for introprisen" : "Introprisen gælder " + d + " dage endnu"; },
    failed: "Din forespørgsel blev ikke sendt. Prøv igen, eller ",
    missing: "Vi mangler lidt: udfyld felterne markeret med rødt ovenfor.",
    mailInstead: "send den som e-mail i stedet",
    slow: "Sender… et øjeblik",
    noAnswer: "Vi fik ikke svar fra formulartjenesten, så din forespørgsel er måske ikke sendt. For at være sikker: ",
    orCall: " eller ring 22 86 23 23",
    none: "Ikke angivet"
  } : {
    module: " module, about ", modules: " modules, about ", width: " m working width",
    first: "Enter your first name.", last: "Enter your last name.",
    email: "Enter an email address so we can send your quote.",
    emailBad: "Check the email address, it doesn't look complete.",
    sending: "Sending…", submit: "Get my quote",
    priceBuy: "Introductory price", priceRent: "Rental 2027", priceDemo: "Introductory price if you buy",
    withGen: " incl. PTO generator", withoutGen: " without generator", genNone: "€0", genAsk: "we include it in the quote",
    genHint: function (hp) { return "Ecoray runs on 230 V from a PTO generator. The tractor's PTO must be rated for at least " + hp + " hp."; },
    genYes: "Yes, bought with the machine", genNo: "No, has own 230 V",
    save: function (x) { return "You save " + x; },
    left: function (d) { return d === 1 ? "Last day for the introductory price · first 20 modules only" : "Introductory price ends in " + d + " days · first 20 modules only"; },
    offer: { buy: "Buy", rent: "Rent in 2027", demo: "Demo first", call: "Just call me", trial: "Free trial (SMV:Robot)" },
    trialSubmit: "Sign me up for a trial",
    trialThanks: function (name) { return "Thanks, " + name + ". We'll call you, check whether your farm can apply for SMV:Robot, and let you know as soon as the next application round opens."; },
    staff: { yes: "Yes", no: "No", unsure: "Not sure" },
    thanks: function (name, email, n) {
      return "Thanks, " + name + ". We'll contact you at " + email + " with a quote for " + n + (n === "1" ? " module." : " modules.");
    },
    contact: "Enter a phone number or an email address so we can reach you.",
    callSubmit: "Call me",
    callThanks: function (name) { return "Thanks, " + name + ". We'll be in touch as soon as we can, with no commitment."; },
    weeds: { low: "Low", medium: "Medium", high: "High" },
    perDay: function (ha) { return "About " + ha + " hectares in a " + DAY_HOURS + "-hour working day"; },
    perPass: function (area, h) { return "Your " + area + " ha: about " + h + " hours per pass"; },
    orderSubmit: "Send order", titleQuote: "Get a quote", titleOrder: "Order Ecoray", doneOrder: "Thank you for your order",
    orderThanks: function (name) { return "Thanks, " + name + ". We'll send you the agreement to sign. The order is only binding once the agreement is signed."; },
    daysLeft: function (d) { return d === 1 ? "Last day for the introductory price" : "Introductory price ends in " + d + " days"; },
    failed: "Your request wasn't sent. Try again, or ",
    missing: "A few details are missing: fill in the fields marked in red above.",
    mailInstead: "send it as an email instead",
    slow: "Sending… one moment",
    noAnswer: "The form service did not answer, so your request may not have been sent. To be sure: ",
    orCall: " or call +45 22 86 23 23",
    none: "Not specified"
  };

  var form = document.getElementById("reserve-form");
  if (!form) return;

  // The machine in the visual: plain boxes drawn with CSS 3D, one per module. Drag or use the slider to turn it.
  window.ggRig = (function () {
    var rig = document.getElementById("rig"), stage = document.getElementById("rig-stage");
    if (!rig || !stage) return null;
    var buttons = document.querySelectorAll(".rig-views button");
    var W = 100, H = 192, D = 100, GAP = 3, LIFT = 46;
    var VIEWS = { front: [-28, -17], back: [152, -17], under: [-12, 66] }; // turn, tilt in degrees
    var n = 0, turn = -28, tilt = -17, scale = 1, touched = false, floor = null, anim = 0;
    function face(cls, w, h, tf, img) {
      var el = document.createElement("div");
      el.className = "rig-face rig-face--" + cls;
      el.style.cssText = "width:" + w + "px;height:" + h + "px;left:" + (-w / 2) + "px;top:" + (-h / 2) + "px;transform:" + tf + ";" + (img ? "background-image:url(assets/media/" + img + "?v=4)" : "");
      stage.appendChild(el);
    }
    function build() {
      stage.textContent = "";
      var total = n * W + (n - 1) * GAP, y = -LIFT / 2;
      floor = document.createElement("div");
      floor.className = "rig-floor";
      var fw = total + 150, fd = D + 170;
      floor.style.cssText = "width:" + fw + "px;height:" + fd + "px;left:" + (-fw / 2) + "px;top:" + (-fd / 2) + "px;transform:translate3d(0," + (y + H / 2 + LIFT) + "px,0) rotateX(90deg)";
      stage.appendChild(floor);
      for (var i = 0; i < n; i++) {
        var x = (i - (n - 1) / 2) * (W + GAP);
        face("back", W, H, "translate3d(" + x + "px," + y + "px," + (-D / 2) + "px) rotateY(180deg)", "module-back.webp");
        face("left", D, H, "translate3d(" + (x - W / 2) + "px," + y + "px,0) rotateY(-90deg)", "module-side.webp");
        face("right", D, H, "translate3d(" + (x + W / 2) + "px," + y + "px,0) rotateY(90deg)", "module-side.webp");
        face("top", W, D, "translate3d(" + x + "px," + (y - H / 2) + "px,0) rotateX(90deg)");
        face("under", W, D, "translate3d(" + x + "px," + (y + H / 2) + "px,0) rotateX(-90deg)", "module-under.webp");
        face("front", W, H, "translate3d(" + x + "px," + y + "px," + (D / 2) + "px)", "module-front.webp");
      }
      fit();
    }
    function fit() {
      var total = n * W + (n - 1) * GAP;
      scale = Math.min(rig.clientWidth * 0.9 / (total + 70), rig.clientHeight * 0.86 / (H + LIFT + 110), 2.3);
      render();
    }
    // Matte shading: how much a face with normal (x, y, z) catches a light from the upper left front, after turn and tilt.
    function light(x, y, z) {
      var a = turn * Math.PI / 180, b = tilt * Math.PI / 180;
      var x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
      var y2 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b);
      var d = x1 * -0.36 + y2 * -0.56 + z2 * 0.75;
      return (0.6 + 0.66 * Math.max(0, d)).toFixed(3);
    }
    function render() {
      stage.style.transform = "scale(" + scale.toFixed(4) + ") rotateX(" + tilt.toFixed(2) + "deg) rotateY(" + turn.toFixed(2) + "deg)";
      rig.style.setProperty("--lf", light(0, 0, 1));
      rig.style.setProperty("--lb", light(0, 0, -1));
      rig.style.setProperty("--lr", light(1, 0, 0));
      rig.style.setProperty("--ll", light(-1, 0, 0));
      rig.style.setProperty("--lt", light(0, -1, 0));
      rig.style.setProperty("--lu", (1.15 * light(0, 1, 0)).toFixed(3));
      if (floor) floor.style.opacity = Math.max(0, Math.min(1, -tilt / 12)); // no shadow in the way when seen from below
    }
    function set(a, b) { turn = a; tilt = Math.max(-70, Math.min(80, b)); render(); }
    function mark(name) { buttons.forEach(function (btn) { btn.classList.toggle("is-on", btn.getAttribute("data-view") === name); }); }
    function go(name) { // glide to a named view, the short way round
      var v = VIEWS[name], from = [turn, tilt], t0 = null, id = ++anim;
      var dt = ((v[0] - turn) % 360 + 540) % 360 - 180;
      mark(name);
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { set(from[0] + dt, v[1]); return; }
      var step = function (ts) {
        if (id !== anim) return;
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / 700), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        set(from[0] + dt * e, from[1] + (v[1] - from[1]) * e);
        if (k < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }
    var start = null;
    rig.addEventListener("pointerdown", function (e) { touched = true; anim++; start = { x: e.clientX, y: e.clientY, turn: turn, tilt: tilt, mouse: e.pointerType === "mouse" }; rig.classList.add("is-dragging"); try { rig.setPointerCapture(e.pointerId); } catch (err) {} });
    rig.addEventListener("pointermove", function (e) {
      if (!start) return;
      // Sideways turns it. Up and down tilts it with a mouse; on a touch screen that gesture scrolls the page, so the buttons do the tilting.
      set(start.turn + (e.clientX - start.x) * 0.45, start.mouse ? start.tilt + (e.clientY - start.y) * 0.4 : start.tilt);
      mark("");
    });
    ["pointerup", "pointercancel"].forEach(function (ev) { rig.addEventListener(ev, function () { start = null; rig.classList.remove("is-dragging"); }); });
    buttons.forEach(function (btn) { btn.addEventListener("click", function () { touched = true; go(btn.getAttribute("data-view")); }); });
    window.addEventListener("resize", fit);
    // A slow sway until the visitor takes over, unless they prefer reduced motion.
    if (!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      var s0 = null;
      var sway = function (ts) {
        if (touched) return;
        if (s0 === null) s0 = ts;
        set(-28 + 16 * Math.sin((ts - s0) / 2600), -17);
        window.requestAnimationFrame(sway);
      };
      window.requestAnimationFrame(sway);
    }
    return { setModules: function (m) { if (m !== n) { n = m; build(); } } };
  })();

  var sumWidth = document.getElementById("sum-width");
  var sumCapacity = document.getElementById("sum-capacity");
  var caption = document.getElementById("visual-caption");
  var sumPrice = document.getElementById("sum-price");
  var priceLabel = document.getElementById("price-label");
  var status = document.getElementById("form-status");
  var LOADED_AT = Date.now();

  function num(x) { return DA ? x.toFixed(1).replace(/\.0$/, "").replace(".", ",") : x.toFixed(1).replace(/\.0$/, ""); }
  function fmtWidth(n) { return num(n * MODULE_WIDTH_M) + " m"; }
  function num2(x) { return DA ? x.toFixed(2).replace(".", ",") : x.toFixed(2); }
  function weedsValue() {
    var w = form.querySelector('input[name="weeds"]:checked');
    return w ? w.value : "medium";
  }
  function speedKmh() { return SPEED_KMH[weedsValue()]; }
  // Hectares per hour = working width (m) x speed (km/h) / 10.
  function capacity(n) { return n * MODULE_WIDTH_M * speedKmh() / 10; }
  function fmtCapacity(n) { return num2(capacity(n)); }
  function orderNow() {
    var o = offerValue(), box = form.elements.order_now;
    return (o === "buy" || o === "rent") && box && box.checked;
  }
  function submitLabel() { var o = offerValue(); return o === "call" ? T.callSubmit : o === "trial" ? T.trialSubmit : (orderNow() ? T.orderSubmit : T.submit); }
  function fmtMoney(x) { return DA ? x.toLocaleString(LOCALE) + " kr." : "€" + x.toLocaleString(LOCALE); }
  function offerValue() {
    var o = form.querySelector('input[name="offer"]:checked');
    return o ? o.value : "buy";
  }
  // Where the visitor came from: a ?kilde= tag on the link (the QR code adds one), else the page that linked here.
  function leadSource() {
    var tag = "";
    try { var q = new URLSearchParams(window.location.search); tag = q.get("kilde") || q.get("src") || q.get("utm_source") || ""; } catch (e) {}
    try { if (tag) sessionStorage.setItem("gg-kilde", tag); else tag = sessionStorage.getItem("gg-kilde") || ""; } catch (e) {}
    var known = { qr: "QR-kode (brochure eller flyer)", agromek: "Agromek-standen", mail: "Link i e-mail", linkedin: "LinkedIn" };
    if (tag) return known[tag.toLowerCase()] || tag.slice(0, 60);
    var ref = document.referrer;
    if (!ref) return "Direkte (adressen skrevet selv eller åbnet fra en app)";
    try {
      var u = new URL(ref), host = u.hostname.replace(/^www\./, "");
      return host === "greenguardautomation.com" ? "Hjemmesiden, fra siden " + u.pathname : host;
    } catch (e) { return ref.slice(0, 80); }
  }
  function wantsGenerator() {
    var g = form.querySelector('input[name="generator"]:checked');
    return !g || g.value === "yes";
  }
  function generatorPrice(n) { return (DA ? GENERATOR_DKK : GENERATOR_EUR)[n] || 0; }
  // Buying: modules at the introductory price, plus the generator when chosen. Renting: the season price per module.
  function fmtPrice(n, offer) {
    var rent = DA ? RENT_PRICE_DKK : RENT_PRICE_EUR, buy = DA ? INTRO_PRICE_DKK : INTRO_PRICE_EUR;
    if (offer === "rent") return fmtMoney(n * rent);
    return fmtMoney(n * buy + (wantsGenerator() ? generatorPrice(n) : 0));
  }

  function updateSummary() {
    var checked = form.querySelector('input[name="modules"]:checked');
    var n = checked ? parseInt(checked.value, 10) : 5;
    var offer = offerValue();
    sumWidth.textContent = fmtWidth(n);
    sumCapacity.textContent = fmtCapacity(n);
    var sumSpeed = document.getElementById("sum-speed");
    if (sumSpeed) sumSpeed.textContent = num(speedKmh());
    if (window.ggRig) window.ggRig.setModules(n);
    var work = document.getElementById("sum-work");
    if (work) {
      var cap = capacity(n), area = parseFloat(form.elements.area_ha.value);
      var line = T.perDay(num(cap * DAY_HOURS));
      if (area > 0) line += ". " + T.perPass(num(area), Math.round(area / cap));
      work.textContent = line + ".";
    }
    if (sumPrice) sumPrice.textContent = fmtPrice(n, offer);
    if (priceLabel) priceLabel.textContent = offer === "rent" ? T.priceRent : (offer === "demo" ? T.priceDemo : T.priceBuy) + (wantsGenerator() ? T.withGen : T.withoutGen);
    // Standard price struck through, and what the introductory price saves. Not shown for rental.
    var stdUnit = DA ? STD_PRICE_DKK : STD_PRICE_EUR, introUnit = DA ? INTRO_PRICE_DKK : INTRO_PRICE_EUR, renting = offer === "rent";
    var stdLine = document.getElementById("std-line"), stdPrice = document.getElementById("std-price"), badge = document.getElementById("save-badge"), only = document.getElementById("only-20");
    if (stdPrice) stdPrice.textContent = fmtMoney(n * stdUnit + (wantsGenerator() ? generatorPrice(n) : 0));
    if (badge) badge.textContent = T.save(fmtMoney(n * (stdUnit - introUnit)));
    [stdLine, badge, only].forEach(function (el) { if (el) el.hidden = renting || offer === "call" || offer === "trial"; });
    var genPrice = document.getElementById("gen-price"), genNone = document.getElementById("gen-none"), genHint = document.getElementById("gen-hint");
    if (genPrice) genPrice.textContent = offer === "rent" ? T.genAsk : "+ " + fmtMoney(generatorPrice(n));
    if (genNone) genNone.textContent = offer === "rent" ? "" : T.genNone;
    if (genHint) genHint.textContent = T.genHint(PTO_HP[n]);
    caption.textContent = n + (n === 1 ? T.module : T.modules) + num(n * MODULE_WIDTH_M) + T.width;
    // "Just call me": hide everything except the contact details.
    // "Free trial" (SMV:Robot): no prices, modules or ordering, but keep the crops and the farm details.
    var call = offer === "call", trial = offer === "trial";
    form.parentNode.querySelectorAll("[data-detail]").forEach(function (el) { el.hidden = call || (trial && !el.hasAttribute("data-trial-keep")); });
    var hint = document.getElementById("call-hint");
    if (hint) hint.hidden = !call;
    var trialHint = document.getElementById("trial-hint");
    if (trialHint) trialHint.hidden = !trial;
    var dl = document.getElementById("deadline");
    if (dl && dl.getAttribute("data-on")) dl.hidden = trial;
    // "Other" crop: room to write which ones.
    var otherBox = form.querySelector('input[name="crops"][data-other]'), otherField = document.getElementById("other-crops");
    if (otherBox && otherField) otherField.hidden = !otherBox.checked;
    var tick = document.getElementById("order-tick");
    if (tick) tick.hidden = !(offer === "buy" || offer === "rent");
    form.querySelector('button[type="submit"]').textContent = submitLabel();
    // The switch at the top mirrors the order tick at the bottom.
    var ordering = orderNow(), title = document.getElementById("order-title");
    if (title) title.textContent = ordering ? T.titleOrder : T.titleQuote;
    document.querySelectorAll("#mode-switch button").forEach(function (btn) {
      var on = (btn.getAttribute("data-mode") === "order") === ordering;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  // "Order now" at the top: ordering means buying or renting, so a demo or call-back choice switches to buying.
  function setOrderMode(on) {
    if (on && offerValue() !== "buy" && offerValue() !== "rent") form.querySelector('input[name="offer"][value="buy"]').checked = true;
    form.elements.order_now.checked = on;
    updateSummary();
  }
  document.querySelectorAll("#mode-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () { setOrderMode(btn.getAttribute("data-mode") === "order"); });
  });

  // Days left until the order deadline (15 December 2026, Danish time). Hidden after the deadline.
  var deadline = document.getElementById("deadline");
  if (deadline) {
    var daysLeft = Math.ceil((Date.parse("2026-12-15T23:59:59+01:00") - Date.now()) / 86400000);
    if (daysLeft >= 1) { deadline.textContent = T.left(daysLeft); deadline.hidden = false; deadline.setAttribute("data-on", "1"); }
  }
  form.addEventListener("change", function (e) {
    if (["modules", "offer", "weeds", "order_now", "crops", "generator"].indexOf(e.target.name) !== -1) updateSummary();
  });
  ["area_ha"].forEach(function (k) {
    form.elements[k].addEventListener("input", updateSummary);
  });
  // A link with #afproevning or #trial opens the form with the free trial chosen.
  if (/^#(afproevning|trial)$/i.test(window.location.hash)) form.querySelector('input[name="offer"][value="trial"]').checked = true;
  updateSummary();
  if (/^#(bestil|order)$/i.test(window.location.hash)) setOrderMode(true);

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
    var call = offerValue() === "call", trial = offerValue() === "trial";
    var phone = document.getElementById("f-phone");
    var hasPhone = !!phone.value.trim();
    // A call-back needs a first name and a phone number or an email. A free trial needs a full name and a phone
    // number or an email. A quote needs full name and email.
    var rules = call ? [["f-first", T.first], ["f-email", T.contact]]
      : trial ? [["f-first", T.first], ["f-last", T.last], ["f-email", T.contact]]
      : [["f-first", T.first], ["f-last", T.last], ["f-email", T.email]];
    setError(document.getElementById("f-last"), "");
    rules.forEach(function (pair) {
      var input = document.getElementById(pair[0]);
      var empty = !input.value.trim();
      var bad = (empty && !((call || trial) && input.type === "email" && hasPhone)) || (!empty && input.type === "email" && !input.checkValidity());
      var msg = bad ? (input.type === "email" && !empty ? T.emailBad : pair[1]) : "";
      setError(input, msg);
      if (bad && !first) first = input;
    });
    if (first) {
      first.focus({ preventScroll: true });
      first.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    return !first;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    status.classList.remove("is-error");
    if (!validate()) {
      // Say it next to the button too, so a press never looks like nothing happened.
      status.classList.add("is-error");
      status.textContent = T.missing;
      return;
    }
    // Spam bots fill the hidden field within moments of loading the page. A browser's autofill can fill it too,
    // so a filled field only stops the form when it is also sent implausibly fast.
    if (form.elements._honey.value && Date.now() - LOADED_AT < 4000) return;

    var data = new FormData(form);
    var crops = data.getAll("crops");
    var n = parseInt(data.get("modules"), 10);
    var offer = offerValue();
    var ordering = orderNow();
    // The mail GreenGuard receives. Danish labels, the person first, then what they want, then the farm.
    // The order of the keys is the order of the lines in the mail.
    var name = (data.get("first_name") + " " + data.get("last_name")).trim();
    var kind = offer === "rent" ? "leje" : offer === "demo" ? "demo" : "køb";
    var model = "Ecoray " + n + " (" + n + " moduler, " + fmtWidth(n) + ")";
    var cropList = crops.slice();
    var otherCrops = form.querySelector('input[name="crops"][data-other]').checked ? (data.get("other_crops") || "") : "";
    if (otherCrops) { // the written crops replace the bare "Other"
      var otherValue = form.querySelector('input[name="crops"][data-other]').value;
      cropList = cropList.filter(function (c) { return c !== otherValue; });
      cropList.push(otherCrops);
    }
    var area = data.get("area_ha") || "";
    var gen = offer === "rent" ? (wantsGenerator() ? "Ja, ønsker generator" : "Nej, har egen 230 V")
      : (wantsGenerator() ? "Ja, købes med (" + fmtMoney(generatorPrice(n)) + ")" : "Nej, har egen 230 V");
    var price = fmtPrice(n, offer) + (offer === "rent" ? " for sæsonen 2027" : (wantsGenerator() ? " inkl. generator" : " uden generator"));
    var hours = parseFloat(area) > 0 ? ", ca. " + Math.round(parseFloat(area) / capacity(n)) + " timer pr. overkørsel på " + num(parseFloat(area)) + " ha" : "";
    var payload = {
      // Every subject starts with SALG, so a sales lead stands out in a shared inbox.
      _subject: "SALG | " + (offer === "call" ? "Ring mig op: " + name
        : offer === "trial" ? "Gratis afprøvning (SMV:Robot): " + (data.get("farm") || name)
        : (ordering ? "BESTILLING (" : "Tilbud (") + kind + "): " + (data.get("farm") || data.get("last_name"))),
      Kort_fortalt: offer === "call" ? "Vil ringes op" + (data.get("phone") ? " på " + data.get("phone") : "")
        : offer === "trial" ? ["Vil afprøve Ecoray gratis via SMV:Robot", area ? area + " ha" : "", cropList.join(", ")].filter(Boolean).join(" · ")
        : [(ordering ? "BESTILLER NU" : "Vil have tilbud") + " (" + kind + ")", "Ecoray " + n, price, area ? area + " ha" : "", cropList.join(", ")].filter(Boolean).join(" · "),
      Navn: name,
      Telefon: data.get("phone") || "",
      email: data.get("email"),
      Bedrift: data.get("farm") || "",
      Land: data.get("country"),
      Vil_gerne: T.offer[offer] + (ordering ? " – BESTILLER NU, send aftale til underskrift" : ""),
      Mindst_3_årsværk: offer === "trial" && data.get("staff") ? ({ yes: "Ja", no: "Nej", unsure: "Ved ikke" })[data.get("staff")] : "",
      Model: model,
      Generator: gen,
      Pris_uden_moms: price,
      Sparer: offer === "rent" ? "" : fmtMoney(n * ((DA ? STD_PRICE_DKK : STD_PRICE_EUR) - (DA ? INTRO_PRICE_DKK : INTRO_PRICE_EUR))) + " i forhold til standardprisen",
      Dyrker: cropList.join(", "),
      Areal_ha: area,
      Rækker_eller_bede: data.get("row_layout") || "",
      Ukrudtstryk: ["Lavt", "Middel", "Højt"][["low", "medium", "high"].indexOf(weedsValue())] + " (ca. " + speedKmh() + " km/t)",
      Kapacitet: fmtCapacity(n) + " ha i timen" + hours,
      Besked: data.get("message") || "",
      Nyhedsmail: data.get("updates") ? "Ja tak" : "",
      Sprog: DA ? "Dansk" : "Engelsk",
      Kilde: leadSource(),
      Enhed: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "Mobil" : "Computer",
      _replyto: data.get("email")
    };
    if (offer === "call") {
      ["Bedrift", "Land", "Model", "Generator", "Pris_uden_moms", "Sparer", "Dyrker", "Areal_ha", "Rækker_eller_bede", "Ukrudtstryk", "Kapacitet"].forEach(function (k) { delete payload[k]; });
    }
    if (offer === "trial") {
      ["Model", "Generator", "Pris_uden_moms", "Sparer", "Ukrudtstryk", "Kapacitet"].forEach(function (k) { delete payload[k]; });
    }
    if (!payload._replyto) delete payload._replyto;

    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = T.sending;

    // What the form service receives: its own fields first, then every filled-in answer.
    var body = { access_key: ACCESS_KEY, subject: payload._subject, from_name: "GreenGuard SALG (hjemmeside)" };
    if (payload._replyto) body.replyto = payload._replyto;
    Object.keys(payload).forEach(function (k) { if (k.charAt(0) !== "_" && payload[k] !== "") body[k] = payload[k]; });

    // Normally answered within a second. Wait up to 30 seconds, say so after a few, and never hang for ever.
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl ? window.setTimeout(function () { ctrl.abort(); }, 30000) : 0;
    var slowTimer = window.setTimeout(function () { button.textContent = T.slow; }, 5000);
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        window.clearTimeout(timer); window.clearTimeout(slowTimer);
        if (!res.ok || String(res.body.success) !== "true") throw new Error(res.body.message || "Failed");
        // Copies to the extra inboxes. The visitor is not kept waiting for these.
        EXTRA_KEYS.forEach(function (key) {
          var copy = {}; Object.keys(body).forEach(function (k) { copy[k] = body[k]; }); copy.access_key = key;
          try { fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(copy), keepalive: true }).catch(function () {}); } catch (e) {}
        });
        document.getElementById("order-form-wrap").hidden = true;
        var done = document.getElementById("order-done");
        var doneTitle = document.getElementById("done-title");
        if (doneTitle && ordering && offer !== "call") doneTitle.textContent = T.doneOrder;
        document.getElementById("done-text").textContent = offer === "call" ? T.callThanks(data.get("first_name")) : offer === "trial" ? T.trialThanks(data.get("first_name")) : ordering ? T.orderThanks(data.get("first_name")) : T.thanks(data.get("first_name"), data.get("email"), data.get("modules"));
        done.hidden = false;
        done.focus();
        window.scrollTo({ top: 0 });
      })
      .catch(function (err) {
        window.clearTimeout(timer); window.clearTimeout(slowTimer);
        var timedOut = !!err && err.name === "AbortError";
        button.disabled = false;
        button.textContent = submitLabel();
        // The request is never lost: the same details can go as an ordinary email from the visitor's own mail program.
        var lines = Object.keys(payload).filter(function (k) { return k.charAt(0) !== "_" && payload[k] !== ""; }).map(function (k) { return (k === "email" ? "E-mail" : k.replace(/_/g, " ")) + ": " + payload[k]; });
        var link = document.createElement("a");
        link.href = "mailto:" + RECIPIENT + "?cc=" + COPY_TO + "&subject=" + encodeURIComponent(payload._subject) + "&body=" + encodeURIComponent(lines.join("\n"));
        link.textContent = T.mailInstead;
        status.classList.add("is-error");
        status.textContent = timedOut ? T.noAnswer : T.failed;
        status.appendChild(link);
        status.appendChild(document.createTextNode((timedOut ? T.orCall : "") + "."));
        // The form service's own explanation, in small print, so the cause can be read off the page.
        var why = err && err.name === "AbortError" ? "No answer from the form service within 30 seconds." : (err && err.message ? String(err.message) : "");
        if (why) { var small = document.createElement("small"); small.className = "form-why"; small.textContent = why.slice(0, 220); status.appendChild(small); }
        status.scrollIntoView({ block: "center", behavior: "smooth" });
      });
  });
})();
