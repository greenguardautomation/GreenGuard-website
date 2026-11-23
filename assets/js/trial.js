/* Free on-farm trial page (trial.html in English, da/trial.html in Danish): the sign-up form.
   Sent through Web3Forms to the same inboxes as the quote form (see the keys in reserve.js),
   with a subject that starts with "SALG | Gratis afprøvning" so it stands out in the inbox.
   The page language comes from <html lang="..">: "da" uses the Danish texts. */
(function () {
  "use strict";

  var ACCESS_KEY = "adc2c9d5-be7d-47c6-911f-358bbc07d0a1"; // sales@greenguardautomation.com (same key as reserve.js)
  var EXTRA_KEYS = ["4502db15-74ad-4461-a44f-1864c358ea1b"]; // btc@greenguardautomation.com
  var ENDPOINT = "https://api.web3forms.com/submit";
  var RECIPIENT = "sales@greenguardautomation.com";
  var COPY_TO = "btc@greenguardautomation.com";

  var form = document.getElementById("trial-form");
  if (!form) return;
  var DA = (document.documentElement.lang || "").toLowerCase().indexOf("da") === 0;
  var LOADED_AT = Date.now();

  var T = DA ? {
    first: "Skriv dit fornavn.", last: "Skriv dit efternavn.", phone: "Skriv dit telefonnummer, så vi kan ringe til dig.",
    emailBad: "Tjek e-mailadressen, den ser ikke færdig ud.", missing: "Udfyld de markerede felter.",
    sending: "Sender…", slow: "Sender stadig…", submit: "Skriv mig op",
    failed: "Det lykkedes ikke at sende. ", noAnswer: "Formularen svarer ikke lige nu. ",
    mailInstead: "Send det som e-mail i stedet", orCall: " eller ring på 22 86 23 23",
    thanks: function (n) { return "Tak, " + n + ". Vi ringer til dig, ser på om din bedrift kan søge, og giver besked, så snart næste ansøgningsrunde åbner."; },
    staff: { yes: "Ja", no: "Nej", unsure: "Ved ikke" }
  } : {
    first: "Enter your first name.", last: "Enter your last name.", phone: "Enter your phone number so we can call you.",
    emailBad: "Check the email address, it doesn't look complete.", missing: "Fill in the marked fields.",
    sending: "Sending…", slow: "Still sending…", submit: "Sign me up",
    failed: "It didn't send. ", noAnswer: "The form isn't answering right now. ",
    mailInstead: "Send it as an email instead", orCall: " or call +45 22 86 23 23",
    thanks: function (n) { return "Thanks, " + n + ". We'll call you, check whether your farm can apply, and let you know as soon as the next application round opens."; },
    staff: { yes: "Yes", no: "No", unsure: "Not sure" }
  };

  function setError(input, msg) {
    var wrap = input.closest(".field");
    var err = wrap.querySelector(".field-error");
    if (msg) {
      input.setAttribute("aria-invalid", "true");
      if (!err) { err = document.createElement("p"); err.className = "field-error"; err.id = input.id + "-err"; wrap.appendChild(err); }
      err.textContent = msg;
      input.setAttribute("aria-describedby", err.id);
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      if (err) err.remove();
    }
  }

  function leadSource() {
    var tag = "";
    try { var q = new URLSearchParams(window.location.search); tag = q.get("kilde") || q.get("src") || q.get("utm_source") || ""; } catch (e) {}
    var ref = document.referrer && document.referrer.indexOf(location.host) === -1 ? document.referrer : "";
    return [tag, ref].filter(Boolean).join(" · ") || (DA ? "Hjemmeside" : "Website");
  }

  form.addEventListener("input", function (e) { if (e.target.getAttribute("aria-invalid")) setError(e.target, ""); });

  var status = document.getElementById("trial-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = ""; status.classList.remove("is-error");
    var firstBad = null;
    [["t-first", T.first], ["t-last", T.last], ["t-phone", T.phone]].forEach(function (r) {
      var el = document.getElementById(r[0]);
      var bad = !el.value.trim();
      setError(el, bad ? r[1] : "");
      if (bad && !firstBad) firstBad = el;
    });
    var mail = document.getElementById("t-email");
    var mailBad = mail.value.trim() && !mail.checkValidity();
    setError(mail, mailBad ? T.emailBad : "");
    if (mailBad && !firstBad) firstBad = mail;
    if (firstBad) {
      firstBad.focus();
      status.classList.add("is-error");
      status.textContent = T.missing;
      return;
    }
    if (form.elements._honey.value && Date.now() - LOADED_AT < 4000) return;

    var data = new FormData(form);
    var name = (data.get("first_name") + " " + data.get("last_name")).trim();
    var staff = data.get("staff") ? T.staff[data.get("staff")] : "";
    var payload = {
      _subject: "SALG | Gratis afprøvning (SMV:Robot): " + (data.get("farm") || name),
      Kort_fortalt: ["Vil afprøve Ecoray gratis via SMV:Robot", data.get("area_ha") ? data.get("area_ha") + " ha" : "", data.get("crops") || "", data.get("place") || ""].filter(Boolean).join(" · "),
      Navn: name,
      Telefon: data.get("phone") || "",
      email: data.get("email") || "",
      Bedrift: data.get("farm") || "",
      CVR: data.get("cvr") || "",
      Hvor: data.get("place") || "",
      Dyrker: data.get("crops") || "",
      Areal_ha: data.get("area_ha") || "",
      Mindst_3_årsværk: staff,
      Besked: data.get("message") || "",
      Sprog: DA ? "Dansk" : "Engelsk",
      Kilde: leadSource(),
      Enhed: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "Mobil" : "Computer",
      _replyto: data.get("email") || ""
    };

    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = T.sending;

    var body = { access_key: ACCESS_KEY, subject: payload._subject, from_name: "GreenGuard SALG (hjemmeside)" };
    if (payload._replyto) body.replyto = payload._replyto;
    Object.keys(payload).forEach(function (k) { if (k.charAt(0) !== "_" && payload[k] !== "") body[k] = payload[k]; });

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
        EXTRA_KEYS.forEach(function (key) {
          var copy = {}; Object.keys(body).forEach(function (k) { copy[k] = body[k]; }); copy.access_key = key;
          try { fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(copy), keepalive: true }).catch(function () {}); } catch (e) {}
        });
        form.hidden = true;
        var done = document.getElementById("trial-done");
        document.getElementById("trial-done-text").textContent = T.thanks(data.get("first_name"));
        done.hidden = false;
        done.focus();
      })
      .catch(function (err) {
        window.clearTimeout(timer); window.clearTimeout(slowTimer);
        var timedOut = !!err && err.name === "AbortError";
        button.disabled = false;
        button.textContent = T.submit;
        var lines = Object.keys(payload).filter(function (k) { return k.charAt(0) !== "_" && payload[k] !== ""; }).map(function (k) { return (k === "email" ? "E-mail" : k.replace(/_/g, " ")) + ": " + payload[k]; });
        var link = document.createElement("a");
        link.href = "mailto:" + RECIPIENT + "?cc=" + COPY_TO + "&subject=" + encodeURIComponent(payload._subject) + "&body=" + encodeURIComponent(lines.join("\n"));
        link.textContent = T.mailInstead;
        status.classList.add("is-error");
        status.textContent = timedOut ? T.noAnswer : T.failed;
        status.appendChild(link);
        status.appendChild(document.createTextNode((timedOut ? T.orCall : "") + "."));
        status.scrollIntoView({ block: "center", behavior: "smooth" });
      });
  });
})();
