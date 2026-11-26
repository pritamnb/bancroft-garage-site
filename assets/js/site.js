/* Bancroft Garage Ltd — site behaviour (no dependencies) */
(function () {
  "use strict";

  var script = document.currentScript;
  // Site root, worked out from this file's own URL so pages work at any depth.
  var ROOT = new URL("../../", script.src).href;
  var ICONS = ROOT + "assets/img/icons.svg";
  var PHONE = "020 7790 6128";
  var PHONE_HREF = "tel:02077906128";
  var EMAIL = "info@bancroftgarage.co.uk";

  document.documentElement.classList.add("js");

  function icon(name, extraClass) {
    return (
      '<svg class="icon' + (extraClass ? " " + extraClass : "") + '" aria-hidden="true" focusable="false">' +
      '<use href="' + ICONS + "#i-" + name + '"></use></svg>'
    );
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ---------- Services (single source for cards, drawer, form and assistant) ---------- */

  var SERVICES = {
    mot: {
      icon: "shield-check",
      title: "Class 4 MOT Testing",
      desc: "Official DVSA inspection with a free retest within 10 working days.",
      price: "from £45",
      cover: ["Emissions Analysis", "Brake Efficiency", "Safety Lights", "Steering Geometry", "Chassis Integrity", "Digital Pass Certificate"]
    },
    diagnostics: {
      icon: "cpu",
      title: "Engine Diagnostics",
      desc: "Dealer-level OBD2 & ECU fault code decoding with live sensor interrogation.",
      price: "from £65",
      cover: ["Check-Engine Warning Lights", "Limp Mode Resolution", "Injection Rail Timing", "Sensor Calibration", "DPF Regeneration"]
    },
    crash: {
      icon: "wrench",
      title: "Crash & Accident Repairs",
      desc: "Structural realignment and insurance-approved panel restoration.",
      price: "Free estimate",
      cover: ["Precision Jig Pulling", "Fender Reshaping", "Crash Bar Replacement", "Sub-Frame Realignment"]
    },
    bodywork: {
      icon: "sparkles",
      title: "Bodywork & Respraying",
      desc: "Oven-baked gloss finishes and computerised colour matching.",
      price: "Custom quote",
      cover: ["Scratch Eradication", "Rust Excision", "High-Build Primer", "2K Clear Coat", "Machine Polishing"]
    },
    brakes: {
      icon: "disc",
      title: "Brakes, Discs & Calipers",
      desc: "OEM pad replacements with rotor resurfacing.",
      price: "from £80",
      cover: ["Brake Fluid Boiling-Point Test", "ABS Checks", "Rotor Runout Measurement", "Hose Inspection"]
    },
    clutch: {
      icon: "settings-2",
      title: "Clutches & Gearboxes",
      desc: "Dual-mass flywheel resurfacing and transmission rebuilds.",
      price: "from £220",
      cover: ["Slipping Clutch Diagnosis", "Release Bearing Replacement", "Manual & Automatic Fluid Changes", "Mechatronic Testing"]
    },
    exhaust: {
      icon: "flame",
      title: "Exhausts & DPF",
      desc: "Bespoke welding, catalytic converter repair, backpressure testing.",
      price: "from £75",
      cover: ["Stainless Pipe Repair", "Manifold Gasket Sealing", "Oxygen Sensor Replacement", "Euro 6 Compliance Check"]
    },
    suspension: {
      icon: "compass",
      title: "Suspension & Wheel Alignment",
      desc: "Laser four-wheel tracking, strut replacement, bush pressing.",
      price: "from £60",
      cover: ["Knocking Diagnosis", "Coil Spring Checks", "Damper Inspection", "Pothole Damage Restoration"]
    },
    tyres: {
      icon: "circle-dot",
      title: "Tyres & Balancing",
      desc: "Premium, mid-range and budget fitting with laser balancing.",
      price: "from £55",
      cover: ["Tread Depth Audits", "Puncture Repairs", "TPMS Valve Programming", "Run-Flat Fitting For All Rim Sizes"]
    },
    aircon: {
      icon: "wind",
      title: "Air Conditioning",
      desc: "R134a & R1234yf regas with anti-bacterial decontamination.",
      price: "from £70",
      cover: ["Vacuum Decay Test", "Compressor Clutch Check", "Evaporator Leak Tracing", "Pollen Filter Replacement"]
    },
    servicing: {
      icon: "gauge",
      title: "Oil, Filter & Servicing",
      desc: "Synthetic lubricants tailored to European & Japanese engine specs.",
      price: "from £95",
      cover: ["60-Point Mechanical Audit", "OEM Filter Renewal", "Spark Plug Replacement", "Fluid Top-Up", "Service Book Validation"]
    }
  };

  /* ---------- Mobile navigation ---------- */

  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Open / closed status (workshop hours, London time) ---------- */

  function londonNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date());
    var out = {};
    parts.forEach(function (part) {
      out[part.type] = part.value;
    });
    return { day: out.weekday, minutes: (parseInt(out.hour, 10) % 24) * 60 + parseInt(out.minute, 10) };
  }

  function workshopStatus() {
    var now;
    try {
      now = londonNow();
    } catch (error) {
      return null;
    }
    var hours = { Mon: [510, 1080], Tue: [510, 1080], Wed: [510, 1080], Thu: [510, 1080], Fri: [510, 1080], Sat: [540, 780] };
    var today = hours[now.day];
    if (today && now.minutes >= today[0] && now.minutes < today[1]) {
      return { open: true, text: "Workshop open — bays in rotation" };
    }
    var next;
    if (today && now.minutes < today[0]) {
      next = now.day === "Sat" ? "opens 9.00am" : "opens 8.30am";
    } else if (now.day === "Fri") {
      next = "opens Sat 9.00am";
    } else if (now.day === "Sat" || now.day === "Sun") {
      next = "opens Mon 8.30am";
    } else {
      next = "opens 8.30am";
    }
    return { open: false, text: "Workshop closed — " + next };
  }

  var status = workshopStatus();
  if (status) {
    document.querySelectorAll("[data-status]").forEach(function (el) {
      el.dataset.state = status.open ? "open" : "closed";
      var label = el.querySelector("[data-status-text]");
      if (label) label.textContent = status.text;
    });
  }

  /* ---------- Hero glow follows the pointer ---------- */

  var hero = document.querySelector(".hero");
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (hero && finePointer) {
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", event.clientX - rect.left + "px");
      hero.style.setProperty("--my", event.clientY - rect.top + "px");
    });
  }

  /* ---------- Reveal on scroll ---------- */

  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- Quick quote ---------- */

  var quote = document.querySelector("[data-quote]");
  if (quote) {
    // Guide prices in pounds: [European, Japanese] for each fuel type.
    var PRICES = {
      mot: { petrol: [45, 45], diesel: [50, 45], hybrid: [50, 50], electric: [40, 40] },
      interim: { petrol: [95, 90], diesel: [105, 100], hybrid: [110, 105], electric: [85, 80] },
      full: { petrol: [180, 170], diesel: [200, 190], hybrid: [205, 195], electric: [160, 155] },
      diag: { petrol: [65, 60], diesel: [70, 70], hybrid: [75, 70], electric: [60, 55] }
    };
    var TURNAROUND = { mot: "about 45 minutes", interim: "same day", full: "1–2 days", diag: "same day" };
    var BOOK_AS = { mot: "mot", interim: "servicing", full: "servicing", diag: "diagnostics" };

    var service = quote.querySelector("#quote-service");
    var fuel = quote.querySelector("#quote-fuel");
    var origin = quote.querySelector("#quote-origin");
    var priceEl = quote.querySelector("[data-quote-price]");
    var turnEl = quote.querySelector("[data-quote-turnaround]");
    var bookEl = quote.querySelector("[data-quote-book]");
    var shown = null;
    var frame = null;

    var updateQuote = function () {
      var target = PRICES[service.value][fuel.value][origin.value === "japanese" ? 1 : 0];
      turnEl.textContent = TURNAROUND[service.value];
      var note = [service.options[service.selectedIndex].text, fuel.options[fuel.selectedIndex].text, origin.options[origin.selectedIndex].text].join(", ");
      bookEl.href = ROOT + "contact/?service=" + BOOK_AS[service.value] + "&note=" + encodeURIComponent("Quick quote: " + note + " (guide price from £" + target + ")");

      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (shown === null || reduce) {
        shown = target;
        priceEl.textContent = "£" + target;
        return;
      }
      cancelAnimationFrame(frame);
      var from = shown;
      var start = performance.now();
      var step = function (time) {
        var t = Math.min(1, (time - start) / 320);
        shown = Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3)));
        priceEl.textContent = "£" + shown;
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    [service, fuel, origin].forEach(function (el) {
      el.addEventListener("change", updateQuote);
    });
    updateQuote();
  }

  /* ---------- Service detail drawer ---------- */

  var drawer = null;
  var drawerReturnFocus = null;

  function buildDrawer() {
    drawer = document.createElement("div");
    drawer.className = "drawer";
    drawer.innerHTML =
      '<div class="drawer__backdrop" data-drawer-close></div>' +
      '<aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabindex="-1">' +
      '<div class="drawer__top"><span class="drawer__icon" data-drawer-icon></span>' +
      '<button class="icon-btn" type="button" data-drawer-close aria-label="Close service details">' + icon("x") + "</button></div>" +
      '<h2 class="h3 drawer__title" id="drawer-title"></h2>' +
      '<p class="drawer__desc"></p>' +
      '<div class="drawer__price"><span class="mono-label">Guide price</span><strong></strong></div>' +
      '<p class="eyebrow eyebrow--sm drawer__cover">What we cover</p>' +
      '<ul class="drawer__list"></ul>' +
      '<div class="drawer__actions">' +
      '<a class="btn btn--primary btn--block" data-drawer-book href="#">Book this service ' + icon("arrow-right") + "</a>" +
      '<a class="btn btn--ghost btn--block" href="' + PHONE_HREF + '">' + icon("phone") + " " + PHONE + "</a>" +
      "</div></aside>";
    document.body.appendChild(drawer);
    drawer.addEventListener("click", function (event) {
      if (event.target.closest("[data-drawer-close]")) closeDrawer();
    });
  }

  function openDrawer(key, trigger) {
    var item = SERVICES[key];
    if (!item) return;
    if (!drawer) buildDrawer();
    drawerReturnFocus = trigger || null;
    // Icon names and cover lines come from the SERVICES table above, never from user input.
    drawer.querySelector("[data-drawer-icon]").innerHTML = icon(item.icon);
    drawer.querySelector(".drawer__title").textContent = item.title;
    drawer.querySelector(".drawer__desc").textContent = item.desc;
    drawer.querySelector(".drawer__price strong").textContent = item.price;
    drawer.querySelector(".drawer__list").innerHTML = item.cover
      .map(function (line) {
        return "<li>" + icon("check") + "<span>" + escapeHtml(line) + "</span></li>";
      })
      .join("");
    drawer.querySelector("[data-drawer-book]").href = ROOT + "contact/?service=" + key;
    drawer.classList.add("is-open");
    document.body.style.overflow = "hidden";
    drawer.querySelector(".drawer__panel").focus();
  }

  function closeDrawer() {
    if (!drawer || !drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    document.body.style.overflow = "";
    if (drawerReturnFocus) drawerReturnFocus.focus();
  }

  document.addEventListener("click", function (event) {
    var card = event.target.closest("[data-service]");
    if (card) openDrawer(card.dataset.service, card);
  });

  /* ---------- Contact form ---------- */

  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get("service");
    var serviceSelect = form.querySelector("#need");
    if (wanted && SERVICES[wanted]) serviceSelect.value = SERVICES[wanted].title;
    var note = params.get("note");
    if (note) form.querySelector("#symptoms").value = note.slice(0, 400);

    var setError = function (input, message) {
      var holder = input.closest(".field");
      var existing = holder.querySelector(".field__error");
      if (existing) existing.remove();
      if (message) {
        input.setAttribute("aria-invalid", "true");
        var p = document.createElement("p");
        p.className = "field__error";
        p.id = input.id + "-error";
        p.textContent = message;
        holder.appendChild(p);
        input.setAttribute("aria-describedby", p.id);
      } else {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      }
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var phone = form.querySelector("#phone");
      var reg = form.querySelector("#reg");
      var symptoms = form.querySelector("#symptoms");
      var firstBad = null;

      var check = function (input, ok, message) {
        setError(input, ok ? "" : message);
        if (!ok && !firstBad) firstBad = input;
      };
      check(name, name.value.trim().length > 1, "Please tell us your name.");
      check(email, email.value.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), "That email address doesn't look right.");
      check(phone, phone.value.trim() !== "" || email.value.trim() !== "", "Add a phone number or an email so we can reply.");
      if (firstBad) {
        firstBad.focus();
        return;
      }

      var lines = [
        "Name: " + name.value.trim(),
        "Vehicle registration: " + (reg.value.trim() || "-"),
        "Email: " + (email.value.trim() || "-"),
        "Phone: " + (phone.value.trim() || "-"),
        "Service: " + serviceSelect.value,
        "",
        symptoms.value.trim() || "(no details given)"
      ];
      var mailto = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Callback / estimate request — " + serviceSelect.value) + "&body=" + encodeURIComponent(lines.join("\n"));

      var done = document.createElement("div");
      done.className = "form-done";
      done.setAttribute("role", "status");
      done.setAttribute("tabindex", "-1");
      done.innerHTML =
        '<p class="eyebrow">Almost there</p>' +
        '<h3 class="h3" style="margin-top:8px">Thanks, ' + escapeHtml(name.value.trim().split(/\s+/)[0]) + "</h3>" +
        "<p>This preview site is not connected to the workshop inbox yet, so nothing has been sent. To reach us now, email your request with one tap or call the workshop.</p>" +
        '<div class="form-done__actions">' +
        '<a class="btn btn--primary" href="' + escapeHtml(mailto) + '">Email this request ' + icon("arrow-right") + "</a>" +
        '<a class="btn btn--ghost" href="' + PHONE_HREF + '">' + icon("phone") + " " + PHONE + "</a>" +
        "</div>";
      form.hidden = true;
      form.insertAdjacentElement("afterend", done);
      done.focus();
    });
  }

  /* ---------- Assistant (scripted quick answers, no server) ---------- */

  var assistant = null;
  var assistantToggle = document.createElement("button");
  assistantToggle.className = "assistant-toggle";
  assistantToggle.type = "button";
  assistantToggle.setAttribute("aria-label", "Open the Bancroft assistant");
  assistantToggle.setAttribute("aria-expanded", "false");
  assistantToggle.innerHTML = icon("message-square", "icon--open") + icon("x", "icon--close");
  document.body.appendChild(assistantToggle);

  var contactLink = '<a href="' + ROOT + 'contact/">send a request</a>';
  var callLink = '<a href="' + PHONE_HREF + '">' + PHONE + "</a>";

  var ANSWERS = [
    {
      test: /retest|re-test/,
      reply: "Yes. If your car fails its MOT with us, the retest is free within 10 working days."
    },
    {
      test: /when.*mot|mot.*(due|expire|run out|date)/,
      reply:
        'You can check your MOT expiry date free on GOV.UK ("Check the MOT status of a vehicle") using your registration. A car needs its first MOT on the third anniversary of registration, then every year. You can test up to a month (minus a day) early and keep the same renewal date. To book, call ' + callLink + "."
    },
    {
      test: /open|hour|close|saturday|sunday|weekend|time/,
      reply: function () {
        var now = workshopStatus();
        return "We're open Monday to Friday 8.30am–6.00pm and Saturday 9.00am–1.00pm. We're closed on Sundays." + (now ? " Right now: " + now.text.toLowerCase() + "." : "");
      }
    },
    {
      test: /engine light|warning light|check engine|dash|limp|fault code|diagnos/,
      reply:
        "A check-engine light can be anything from a loose fuel cap to a sensor or emissions fault. If the light is flashing, or the car feels down on power, stop driving and call us on " + callLink + ". We can read the fault codes with dealer-level diagnostics, from £65 and usually the same day."
    },
    {
      test: /where|address|location|find you|direction|postcode|mile end|parking/,
      reply: 'We\'re at Railway Arch, 193 Bancroft Road, London E1 4ET, about two minutes from Mile End. <a href="https://www.google.com/maps/dir/?api=1&destination=193+Bancroft+Road%2C+London+E1+4ET" target="_blank" rel="noopener">Get directions</a>.'
    },
    {
      test: /mot/,
      reply: "A Class 4 MOT is from £45 and takes about 45 minutes, with a free retest within 10 working days. To book, call " + callLink + " or " + contactLink + "."
    },
    { test: /brake|disc|caliper|pad/, key: "brakes" },
    { test: /clutch|gearbox|flywheel|transmission/, key: "clutch" },
    { test: /tyre|tire|puncture|balanc/, key: "tyres" },
    { test: /exhaust|dpf|catalytic|emission/, key: "exhaust" },
    { test: /air ?con|a\/c|regas|climate/, key: "aircon" },
    { test: /body|respray|paint|scratch|dent|rust/, key: "bodywork" },
    { test: /crash|accident|insurance|collision/, key: "crash" },
    { test: /suspension|alignment|tracking|shock|pothole|knock/, key: "suspension" },
    { test: /service|servicing|oil|filter/, key: "servicing" },
    {
      test: /price|cost|quote|estimate|how much|cheap/,
      reply: 'Estimates are always free. Try the <a href="' + ROOT + '#estimate">quick quote</a> for a guide price, or call ' + callLink + " for a firm one."
    },
    {
      test: /book|appointment|slot|drop off/,
      reply: "The quickest way to book is to call " + callLink + ". You can also " + contactLink + " and we'll call you back."
    },
    {
      test: /phone|call|email|contact|speak|human|person/,
      reply: "Call the workshop on " + callLink + ' or email <a href="mailto:' + EMAIL + '">' + EMAIL + "</a>."
    },
    {
      test: /european|japanese|make|model|bmw|audi|vw|volkswagen|mercedes|toyota|honda|nissan|ford|vauxhall/,
      reply: "We look after all European and Japanese models, petrol, diesel, hybrid and electric. Call " + callLink + " if you'd like to check on a specific car."
    },
    {
      test: /^(hi|hello|hey|good (morning|afternoon|evening))\b/,
      reply: "Hello! Ask me about MOTs, opening hours, prices or where to find us."
    },
    { test: /thank/, reply: "You're welcome. Drive safe!" }
  ];

  function answerFor(question) {
    var text = question.toLowerCase();
    for (var i = 0; i < ANSWERS.length; i += 1) {
      var entry = ANSWERS[i];
      if (entry.test.test(text)) {
        if (entry.key) {
          var item = SERVICES[entry.key];
          return item.title + ": " + item.desc + " Guide price: " + item.price.toLowerCase() + ". To book, call " + callLink + " or " + contactLink + ".";
        }
        return typeof entry.reply === "function" ? entry.reply() : entry.reply;
      }
    }
    return "I only have quick answers to common questions here. For anything else, call the workshop on " + callLink + " or " + contactLink + " and we'll come back to you.";
  }

  function addMessage(kind, html) {
    var log = assistant.querySelector(".assistant__log");
    var bubble = document.createElement("div");
    bubble.className = "msg msg--" + kind;
    if (kind === "user") bubble.textContent = html;
    else bubble.innerHTML = html;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  }

  function ask(question) {
    var text = question.trim();
    if (!text) return;
    var chips = assistant.querySelector(".chips");
    if (chips) chips.remove();
    addMessage("user", text);
    window.setTimeout(function () {
      addMessage("bot", answerFor(text));
    }, 350);
  }

  function buildAssistant() {
    assistant = document.createElement("section");
    assistant.className = "assistant";
    assistant.id = "assistant";
    assistant.setAttribute("aria-label", "Bancroft assistant");
    assistant.innerHTML =
      '<header class="assistant__head">' +
      '<span class="assistant__badge">' + icon("wrench") + "</span>" +
      '<div><p class="assistant__name">Bancroft Assistant</p><p class="assistant__sub">Online · Quick answers</p></div>' +
      '<button class="icon-btn" type="button" data-assistant-close aria-label="Close assistant">' + icon("x") + "</button>" +
      "</header>" +
      '<div class="assistant__log" aria-live="polite">' +
      '<div class="msg msg--bot">Hi — I\'m the Bancroft assistant. Ask me about MOTs, repairs, warning lights or opening hours, and I\'ll point you the right way.</div>' +
      '<div class="chips">' +
      ["When is my MOT due?", "Opening hours this Saturday?", "Why is my check engine light on?", "Do you provide free retests?"]
        .map(function (q) {
          return '<button class="chip" type="button">' + q + "</button>";
        })
        .join("") +
      "</div></div>" +
      '<form class="assistant__form" autocomplete="off">' +
      '<label class="sr-only" for="assistant-input">Ask about your car</label>' +
      '<input id="assistant-input" type="text" maxlength="200" placeholder="Ask about your car...">' +
      '<button type="submit" aria-label="Send">' + icon("send") + "</button>" +
      "</form>";
    document.body.appendChild(assistant);

    assistant.addEventListener("click", function (event) {
      var chip = event.target.closest(".chip");
      if (chip) ask(chip.textContent);
      if (event.target.closest("[data-assistant-close]")) toggleAssistant(false);
    });
    assistant.querySelector("form").addEventListener("submit", function (event) {
      event.preventDefault();
      var input = assistant.querySelector("input");
      ask(input.value);
      input.value = "";
    });
  }

  function toggleAssistant(force) {
    if (!assistant) buildAssistant();
    var open = typeof force === "boolean" ? force : !assistant.classList.contains("is-open");
    assistant.classList.toggle("is-open", open);
    assistantToggle.setAttribute("aria-expanded", String(open));
    assistantToggle.setAttribute("aria-label", open ? "Close the Bancroft assistant" : "Open the Bancroft assistant");
    if (open) assistant.querySelector("input").focus();
    else assistantToggle.focus();
  }

  assistantToggle.addEventListener("click", function () {
    toggleAssistant();
  });

  /* ---------- Escape closes overlays ---------- */

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (drawer && drawer.classList.contains("is-open")) closeDrawer();
    else if (assistant && assistant.classList.contains("is-open")) toggleAssistant(false);
  });
})();
