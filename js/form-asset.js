/* ==========================================================
   TRUE ROOF — PREMIUM LEAD FORM MODULE (2-Step)
   Self-contained • Alpine-safe • Accessible • Spam-resistant
   Works even when Tailwind/site CSS is missing
   ========================================================== */

export const FormAsset = {
  config: {
    endpoint:
      "https://docs.google.com/forms/d/e/1FAIpQLSeXt8JeqI9PvhDWxu6cOOxX58kfs8J85UQGXk3Tc09HOUA2FA/formResponse",
    mapping: {
      service: "entry.1354597159",
      material: "entry.214341972",
      level: "entry.1724291652",
      suburb: "entry.131318949",
      fullName: "entry.1890503231",
      phone: "entry.1596600455",
      email: "entry.1842144469",
      message: "entry.1638990837",
    },

    // UX + anti-spam + behavior
    responseSlaText: "Fast 2-Hour Response",
    successTitle: "✅ Request received!",
    successBody:
      "Thanks — we’ll contact you shortly. If it’s urgent, call us now and we’ll prioritise your leak.",
    submitCooldownMs: 25_000, // blocks rapid repeat submits on same device
    optimisticSuccessDelayMs: 900, // Google Forms no-cors can’t confirm; show success after short delay
    enableMessageField: true, // if you want a message box on step 2
    suburbSuggestions: [
      "Ringwood",
      "Doncaster",
      "Balwyn",
      "Glen Waverley",
      "Reservoir",
      "St Kilda",
    ],
  },

  // ---------- Styles ----------
  injectStyles() {
    if (document.getElementById("tr-form-styles")) return;

    const style = document.createElement("style");
    style.id = "tr-form-styles";
    style.textContent = `
      :root{
        --tr-navy:#0a192f;
        --tr-orange:#e36d35;
        --tr-slate:#64748b;
        --tr-border:#e2e8f0;
        --tr-bg:#ffffff;
        --tr-soft:#f8fafc;
        --tr-soft2:#f1f5f9;
        --tr-danger:#b91c1c;
        --tr-radius:24px;
        --tr-radius-sm:12px;
        --tr-shadow: 0 25px 50px -12px rgba(0,0,0,.12);
        --tr-font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
      }
      [x-cloak]{ display:none !important; }

      .tr-wrap{ max-width: 720px; margin: 0 auto; padding: 16px; font-family: var(--tr-font); }
      .tr-card{ background:var(--tr-bg); border:1px solid var(--tr-border); border-radius:var(--tr-radius); box-shadow:var(--tr-shadow); overflow:hidden; }
      .tr-header{ padding: 18px 18px 14px; border-bottom:1px solid var(--tr-soft2); display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .tr-title{ margin:0; font-size: 22px; font-weight: 900; letter-spacing: -0.02em; color:var(--tr-navy); }
      .tr-sub{ margin:4px 0 0; font-size: 11px; font-weight: 900; color:var(--tr-orange); text-transform: uppercase; letter-spacing: 1px; }
      .tr-steps{ display:flex; gap:6px; background:var(--tr-soft2); padding:6px; border-radius:999px; }
      .tr-step{ padding: 6px 10px; border-radius:999px; font-size: 11px; font-weight: 800; transition: .15s ease; user-select:none; white-space:nowrap; }
      .tr-step.is-on{ background: var(--tr-navy); color:#fff; }
      .tr-step.is-on.orange{ background: var(--tr-orange); color:#fff; }
      .tr-step.is-off{ color: #94a3b8; }

      .tr-body{ padding: 18px; }
      .tr-grid{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width:560px){ .tr-grid{ grid-template-columns:1fr; } }

      .tr-field{ display:flex; flex-direction:column; gap:6px; }
      .tr-label{ font-size: 11px; font-weight: 800; color:var(--tr-slate); text-transform: uppercase; letter-spacing: .08em; margin-left: 4px;}
      .tr-help{ font-size: 12px; color: #64748b; margin: 0 0 2px 4px; }
      .tr-input, .tr-select, .tr-textarea{
        width:100%;
        background:var(--tr-soft);
        border:2px solid var(--tr-soft2);
        border-radius:var(--tr-radius-sm);
        padding: 12px 14px;
        font-weight: 650;
        font-size: 14px;
        outline:none;
        transition: border-color .15s ease, background .15s ease, transform .05s ease;
        color:#0f172a;
      }
      .tr-textarea{ min-height: 96px; resize: vertical; line-height:1.4; font-weight:600; }
      .tr-input:focus, .tr-select:focus, .tr-textarea:focus{ border-color: var(--tr-orange); background:#fff; }
      .tr-input:active, .tr-select:active, .tr-textarea:active{ transform: translateY(0.5px); }

      .tr-actions{ display:flex; gap: 12px; align-items:center; margin-top: 14px; }
      .tr-back{
        width: 56px; height: 56px;
        border-radius: var(--tr-radius-sm);
        border:1px solid var(--tr-border);
        background:#fff;
        cursor:pointer;
        font-size: 18px;
      }
      .tr-btn{
        border: none;
        cursor: pointer;
        height: 56px;
        border-radius: var(--tr-radius-sm);
        font-weight: 900;
        font-size: 17px;
        transition: transform .12s ease, filter .12s ease;
        width:100%;
      }
      .tr-btn:disabled{ cursor:not-allowed; opacity:.7; }
      .tr-btn:hover{ transform: translateY(-1px); filter: brightness(1.02); }

      .tr-btn-next{ background: var(--tr-navy); color:#fff; }
      .tr-btn-submit{
        background: var(--tr-orange);
        color:#fff;
        box-shadow: 0 10px 15px -3px rgba(227,109,53,.25);
        flex: 1;
      }

      .tr-alert{
        display:flex; gap:10px; align-items:flex-start;
        background: #fff7ed;
        border:1px solid #fed7aa;
        color:#7c2d12;
        padding: 12px 12px;
        border-radius: 14px;
        margin-bottom: 12px;
        font-size: 13px;
        line-height: 1.35;
      }
      .tr-err{
        background: #fef2f2;
        border-color: #fecaca;
        color: #7f1d1d;
      }
      .tr-note{
        margin-top: 10px;
        font-size: 12px;
        color:#64748b;
      }
      .tr-sr{ position:absolute !important; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
      .tr-success{
        padding: 52px 18px;
        text-align:center;
      }
      .tr-success h3{ margin:0 0 8px; font-size: 22px; font-weight: 950; color: var(--tr-navy); }
      .tr-success p{ margin: 0 auto; max-width: 46ch; color:#334155; font-weight:600; }
      .tr-success small{ display:block; margin-top: 12px; color:#64748b; font-weight:650; }
      .tr-link{ color: var(--tr-orange); font-weight:900; text-decoration:none; }
      .tr-link:hover{ text-decoration:underline; }

      /* honeypot hidden but still in DOM */
      .tr-hp{ position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden; }
    `;
    document.head.appendChild(style);
  },

  // ---------- HTML ----------
  renderFormHTML() {
    const cfg = this.config;
    const suggestions = (cfg.suburbSuggestions || [])
      .map((s) => `<option value="${this._escapeHtml(s)}"></option>`)
      .join("");

    const messageField = cfg.enableMessageField
      ? `
        <div class="tr-field">
          <label class="tr-label" for="tr_message">Message (optional)</label>
          <textarea id="tr_message" name="message" class="tr-textarea" placeholder="Tell us what’s happening — leak location, storm damage, cracked tiles, etc."></textarea>
        </div>
      `
      : ``;

    return `
      <div class="tr-wrap" data-tr-root>
        <div class="tr-card" x-data="trLeadForm()" x-init="init()" x-cloak>
          <div class="tr-header">
            <div>
              <h2 class="tr-title">Get a Quote</h2>
              <p class="tr-sub">${this._escapeHtml(cfg.responseSlaText || "")}</p>
            </div>
            <div class="tr-steps" aria-label="Form steps">
              <div class="tr-step" :class="step === 1 ? 'is-on' : 'is-off'">1. Details</div>
              <div class="tr-step" :class="step === 2 ? 'is-on orange' : 'is-off'">2. Contact</div>
            </div>
          </div>

          <div class="tr-body">
            <div class="tr-alert tr-err" x-show="error" role="alert" aria-live="polite">
              <strong>Fix this:</strong>
              <span x-text="error"></span>
            </div>

            <div class="tr-alert" x-show="note" role="status" aria-live="polite">
              <strong>Heads up:</strong>
              <span x-text="note"></span>
            </div>

            <form @submit.prevent="submitForm($event)" novalidate>
              <!-- Step 1 -->
              <section x-show="step === 1" x-ref="step1">
                <div class="tr-field">
                  <label class="tr-label" for="tr_service">Service</label>
                  <select id="tr_service" name="service" required class="tr-select">
                    <option value="" disabled selected>Select service…</option>
                    <option>Full Roof Restoration</option>
                    <option>Roof Repairs & Leak Fixes</option>
                    <option>Roof Painting & Sealing</option>
                  </select>
                </div>

                <div class="tr-grid" style="margin-top:12px;">
                  <div class="tr-field">
                    <label class="tr-label" for="tr_material">Roof material</label>
                    <select id="tr_material" name="material" required class="tr-select">
                      <option value="" disabled selected>Choose…</option>
                      <option>Tile</option>
                      <option>Metal</option>
                    </select>
                  </div>

                  <div class="tr-field">
                    <label class="tr-label" for="tr_level">Home height</label>
                    <select id="tr_level" name="level" required class="tr-select">
                      <option value="" disabled selected>Choose…</option>
                      <option>Single</option>
                      <option>Double</option>
                      <option>Triple+</option>
                    </select>
                  </div>
                </div>

                <div class="tr-field" style="margin-top:12px;">
                  <label class="tr-label" for="tr_suburb">Suburb</label>
                  <input id="tr_suburb" name="suburb" type="text" class="tr-input" placeholder="e.g. Ringwood" required autocomplete="address-level2" list="trSuburbList">
                  <datalist id="trSuburbList">${suggestions}</datalist>
                  <p class="tr-help">Melbourne & surrounds — we’ll confirm your area fast.</p>
                </div>

                <div class="tr-actions">
                  <button type="button" class="tr-btn tr-btn-next" @click="goNext()">Continue →</button>
                </div>

                <p class="tr-note">
                  Prefer calling? Use the phone number on the site — leak issues are usually time-sensitive.
                </p>
              </section>

              <!-- Step 2 -->
              <section x-show="step === 2" x-ref="step2">
                <div class="tr-grid">
                  <div class="tr-field" style="grid-column: 1 / -1;">
                    <label class="tr-label" for="tr_fullName">Full name</label>
                    <input id="tr_fullName" name="fullName" type="text" class="tr-input" placeholder="Your name" required autocomplete="name">
                  </div>

                  <div class="tr-field">
                    <label class="tr-label" for="tr_phone">Mobile number</label>
                    <input id="tr_phone" name="phone" type="tel" class="tr-input" placeholder="04xx xxx xxx" required inputmode="tel" autocomplete="tel">
                  </div>

                  <div class="tr-field">
                    <label class="tr-label" for="tr_email">Email</label>
                    <input id="tr_email" name="email" type="email" class="tr-input" placeholder="you@example.com" required autocomplete="email">
                  </div>
                </div>

                <div style="margin-top:12px;">
                  ${messageField}
                </div>

                <!-- Anti-spam: honeypot + timestamp -->
                <div class="tr-hp" aria-hidden="true">
                  <label>Leave this field blank</label>
                  <input type="text" name="honeypot" tabindex="-1" autocomplete="off">
                </div>
                <input type="hidden" name="tsStart" x-ref="tsStart">
                <input type="hidden" name="pageUrl" :value="pageUrl">
                <input type="hidden" name="userAgent" :value="ua">

                <div class="tr-actions">
                  <button type="button" class="tr-back" @click="goBack()" aria-label="Back">←</button>
                  <button type="submit" class="tr-btn tr-btn-submit" :disabled="loading">
                    <span x-show="!loading">Send Request</span>
                    <span x-show="loading">Sending…</span>
                  </button>
                </div>

                <p class="tr-note">
                  By sending, you agree we can contact you about your roof enquiry.
                </p>
              </section>
            </form>
          </div>
        </div>

        <!-- Alpine missing fallback (simple single-step form) -->
        <noscript>
          <div class="tr-card" style="margin-top:12px;">
            <div class="tr-body">
              <p style="margin:0; font-weight:800; color:#0f172a;">
                JavaScript is required for the step form. Please enable it, or contact us directly.
              </p>
            </div>
          </div>
        </noscript>
      </div>
    `;
  },

  // ---------- Mount + Alpine / vanilla init ----------
  mount(targetEl, overrides = {}) {
    if (!targetEl) return;

    // merge config overrides safely
    this.config = this._deepMerge(this.config, overrides);

    this.injectStyles();
    targetEl.innerHTML = this.renderFormHTML();

    const root = targetEl.querySelector("[data-tr-root]");

    // If Alpine is present, register + initTree reliably (handles "injected DOM" gotcha)
    if (typeof window !== "undefined" && window.Alpine) {
      // Register once (important: avoids re-register warnings)
      if (!window.__TR_FORM_ALPINE_REGISTERED__) {
        window.Alpine.data("trLeadForm", () => this._alpineComponentFactory(targetEl));
        window.__TR_FORM_ALPINE_REGISTERED__ = true;
      }

      // Critical: hydrate injected DOM
      window.Alpine.initTree(root);

      return;
    }

    // If Alpine is missing, provide a basic vanilla fallback (still submits)
    this._vanillaFallbackInit(targetEl);
  },

  // ---------- Alpine component factory ----------
  _alpineComponentFactory(targetEl) {
    const cfg = this.config;

    return {
      step: 1,
      loading: false,
      error: "",
      note: "",
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
      _ts0: Date.now(),

      init() {
        // timestamp start: bot timing check uses this
        if (this.$refs.tsStart) this.$refs.tsStart.value = String(this._ts0);

        // Optional friendly note for mobile users
        this.note = "";
      },

      goNext() {
        this.error = "";
        const ok = this._validateStep(this.$refs.step1);
        if (!ok) return;

        this.step = 2;

        // focus first field in step 2 for better UX/accessibility
        queueMicrotask(() => {
          const el = targetEl.querySelector("#tr_fullName");
          if (el) el.focus();
        });
      },

      goBack() {
        this.error = "";
        this.step = 1;
        queueMicrotask(() => {
          const el = targetEl.querySelector("#tr_service");
          if (el) el.focus();
        });
      },

      _validateStep(stepEl) {
        if (!stepEl) return true;

        // Run native validity checks, but also ensure a clean error message
        const required = stepEl.querySelectorAll("[required]");
        for (const el of required) {
          // Clean up whitespace-only inputs
          if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
            el.value = (el.value || "").trim();
          }

          if (!el.checkValidity()) {
            el.reportValidity();
            this.error = "Please complete the highlighted fields.";
            return false;
          }
        }

        // extra phone sanity (AU mobiles commonly start 04)
        const phone = targetEl.querySelector("#tr_phone");
        if (phone && phone.value) {
          const digits = phone.value.replace(/[^\d+]/g, "");
          if (digits.length < 8) {
            phone.focus();
            this.error = "Please enter a valid phone number.";
            return false;
          }
        }

        return true;
      },

      _cooldownOK() {
        try {
          const key = "tr_form_last_submit";
          const last = Number(localStorage.getItem(key) || "0");
          const now = Date.now();
          if (now - last < cfg.submitCooldownMs) return false;
          localStorage.setItem(key, String(now));
          return true;
        } catch {
          return true; // if storage blocked, don’t block submitting
        }
      },

      _botChecks(fd) {
        // 1) honeypot
        if (fd.get("honeypot")) return "Spam detected.";

        // 2) time-on-form (bots often submit instantly)
        const tsStart = Number(fd.get("tsStart") || this._ts0);
        const elapsed = Date.now() - tsStart;
        if (elapsed < 900) return "Please try again (fast submit).";

        return "";
      },

      async submitForm(e) {
        this.error = "";
        this.note = "";

        // validate step 2 fields
        const ok = this._validateStep(this.$refs.step2);
        if (!ok) return;

        if (!this._cooldownOK()) {
          this.error = "Please wait a moment before sending again.";
          return;
        }

        this.loading = true;

        const formEl = e.target;
        const fd = new FormData(formEl);

        const botMsg = this._botChecks(fd);
        if (botMsg) {
          this.loading = false;
          this.error = botMsg;
          return;
        }

        // Normalize some values
        fd.set("suburb", String(fd.get("suburb") || "").trim());
        fd.set("fullName", String(fd.get("fullName") || "").trim());
        fd.set("email", String(fd.get("email") || "").trim());
        fd.set("phone", String(fd.get("phone") || "").trim());

        // Build Google Forms params from mapping
        const params = new URLSearchParams();
        for (const [fieldKey, entryId] of Object.entries(cfg.mapping)) {
          params.append(entryId, String(fd.get(fieldKey) || ""));
        }

        // Optional: also capture page metadata into message if you want it (doesn't require extra form fields)
        // You can remove this block if you don’t want it.
        const metaLine = `\n\n---\nPage: ${fd.get("pageUrl") || ""}\nUA: ${fd.get("userAgent") || ""}`;
        if (cfg.enableMessageField && cfg.mapping.message) {
          const current = params.get(cfg.mapping.message) || "";
          params.set(cfg.mapping.message, (current + metaLine).trim());
        }

        // IMPORTANT GOTCHA:
        // Google Forms + no-cors means you cannot read the response or confirm success.
        // Best practice: optimistic success UI + gentle retry messaging.
        try {
          await fetch(cfg.endpoint, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: params.toString(),
          });

          // tiny delay feels more natural + avoids instant swap
          setTimeout(() => {
            this.loading = false;
            targetEl.innerHTML = this._successHTML();
          }, cfg.optimisticSuccessDelayMs);
        } catch (err) {
          console.error(err);
          this.loading = false;
          this.error =
            "Something went wrong sending your request. Please try again, or call us for urgent leaks.";
        }
      },

      _successHTML() {
        const title = cfg.successTitle || "✅ Success!";
        const body = cfg.successBody || "We’ll contact you soon.";
        return `
          <div class="tr-wrap">
            <div class="tr-card">
              <div class="tr-success">
                <h3>${FormAsset._escapeHtml(title)}</h3>
                <p>${FormAsset._escapeHtml(body)}</p>
                <small>If you don’t hear back, check spam folder or call the team.</small>
              </div>
            </div>
          </div>
        `;
      },
    };
  },

  // ---------- Vanilla fallback init (no Alpine present) ----------
  _vanillaFallbackInit(targetEl) {
    const form = targetEl.querySelector("form");
    const step1 = targetEl.querySelector('[x-ref="step1"]') || targetEl.querySelector("section");
    const step2 = targetEl.querySelector('[x-ref="step2"]');
    const nextBtn = targetEl.querySelector(".tr-btn-next");
    const backBtn = targetEl.querySelector(".tr-back");
    const errorBox = targetEl.querySelector(".tr-alert.tr-err");

    if (!form || !nextBtn || !step1 || !step2) return;

    // show step1, hide step2
    step1.style.display = "";
    step2.style.display = "none";

    const showError = (msg) => {
      if (!errorBox) return;
      errorBox.style.display = msg ? "flex" : "none";
      const span = errorBox.querySelector("span");
      if (span) span.textContent = msg || "";
    };
    showError("");

    nextBtn.addEventListener("click", () => {
      showError("");
      const required = step1.querySelectorAll("[required]");
      for (const el of required) {
        if (!el.checkValidity()) {
          el.reportValidity();
          showError("Please complete the highlighted fields.");
          return;
        }
      }
      step1.style.display = "none";
      step2.style.display = "";
      const name = targetEl.querySelector("#tr_fullName");
      if (name) name.focus();
    });

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        showError("");
        step2.style.display = "none";
        step1.style.display = "";
        const s = targetEl.querySelector("#tr_service");
        if (s) s.focus();
      });
    }

    // basic submit: same Google Forms post
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      showError("");

      // validate step2
      const required = step2.querySelectorAll("[required]");
      for (const el of required) {
        if (!el.checkValidity()) {
          el.reportValidity();
          showError("Please complete the highlighted fields.");
          return;
        }
      }

      const fd = new FormData(form);
      if (fd.get("honeypot")) return;

      const params = new URLSearchParams();
      for (const [fieldKey, entryId] of Object.entries(this.config.mapping)) {
        params.append(entryId, String(fd.get(fieldKey) || ""));
      }

      try {
        await fetch(this.config.endpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: params.toString(),
        });

        targetEl.innerHTML = `
          <div class="tr-wrap">
            <div class="tr-card">
              <div class="tr-success">
                <h3>${this._escapeHtml(this.config.successTitle)}</h3>
                <p>${this._escapeHtml(this.config.successBody)}</p>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error(err);
        showError("Couldn’t send your request. Please try again or call us for urgent leaks.");
      }
    });
  },

  // ---------- helpers ----------
  _escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  _deepMerge(base, overrides) {
    if (!overrides) return base;
    const out = Array.isArray(base) ? [...base] : { ...base };
    for (const [k, v] of Object.entries(overrides)) {
      if (v && typeof v === "object" && !Array.isArray(v) && typeof base?.[k] === "object") {
        out[k] = this._deepMerge(base[k], v);
      } else {
        out[k] = v;
      }
    }
    return out;
  },
};
