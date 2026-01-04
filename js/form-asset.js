/* ==========================================================
   TRUE ROOF — PREMIUM 2-STEP GOOGLE FORM MODULE (STRICT MAP)
   ✅ Always renders (no dependency on Tailwind)
   ✅ Works with or without Alpine
   ✅ Posts EXACT Google Form entry IDs (incl. tracking fields)
   ✅ Captures gclid / utm_source / utm_medium / landing page / user agent
   ✅ Cleaner UI, less “clunky”, better spacing + typography
   ========================================================== */

export const FormAsset = {
  config: {
    // 1) Submission Endpoint (STRICT)
    endpoint:
      "https://docs.google.com/forms/d/e/1FAIpQLSeXt8JeqI9PvhDWxu6cOOxX58kfs8J85UQGXk3Tc09HOUA2FA/formResponse",

    // 2) Field Mapping (STRICT)
    mapping: {
      service: "entry.1354597159",
      material: "entry.214341972",
      level: "entry.1724291652",
      suburb: "entry.131318949",
      fullName: "entry.1890503231",
      phone: "entry.1596600455",
      email: "entry.1842144469",
      message: "entry.1638990837",

      // 3) Metadata & Tracking Fields (STRICT)
      gclid: "entry.2122671224",
      utm_source: "entry.89955284",
      utm_medium: "entry.1694441444",
      landing_page: "entry.1645230369",
      user_agent: "entry.339828064",
    },

    responseSlaText: "Fast 2-Hour Response",
    suburbSuggestions: ["Ringwood", "Doncaster", "Glen Waverley", "Balwyn", "Reservoir"],
    minTimeOnFormMs: 900,
    submitCooldownMs: 25000,
  },

  injectStyles() {
    if (document.getElementById("tr-form-styles")) return;

    const style = document.createElement("style");
    style.id = "tr-form-styles";
    style.textContent = `
      :root{
        --tr-navy:#0a192f;
        --tr-orange:#e36d35;
        --tr-border:#e2e8f0;
        --tr-soft:#f8fafc;
        --tr-soft2:#f1f5f9;
        --tr-text:#0f172a;
        --tr-muted:#64748b;
        --tr-shadow: 0 22px 44px -16px rgba(0,0,0,.18);
        --tr-r: 22px;
        --tr-rs: 12px;
        --tr-font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      }
      [x-cloak]{ display:none !important; }

      .tr-wrap{ max-width: 760px; margin: 0 auto; padding: 16px; font-family: var(--tr-font); color: var(--tr-text); }
      .tr-card{ background:#fff; border:1px solid var(--tr-border); border-radius:var(--tr-r); box-shadow:var(--tr-shadow); overflow:hidden; }

      .tr-head{ padding: 18px 18px 14px; border-bottom:1px solid var(--tr-soft2); display:flex; align-items:center; justify-content:space-between; gap: 14px; }
      .tr-title{ margin:0; font-size: 22px; font-weight: 950; letter-spacing:-.02em; color: var(--tr-navy); }
      .tr-sub{ margin: 4px 0 0; font-size: 11px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; color: var(--tr-orange); }

      .tr-steps{ display:flex; gap:6px; background: var(--tr-soft2); padding: 6px; border-radius: 999px; }
      .tr-step{ padding: 6px 10px; border-radius: 999px; font-size: 11px; font-weight: 900; white-space:nowrap; user-select:none; transition:.15s ease; }
      .tr-step.on{ background: var(--tr-navy); color:#fff; }
      .tr-step.on.orange{ background: var(--tr-orange); }
      .tr-step.off{ color:#94a3b8; }

      .tr-body{ padding: 18px; }
      .tr-grid{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 560px){ .tr-grid{ grid-template-columns:1fr; } }

      .tr-field{ display:flex; flex-direction:column; gap: 6px; }
      .tr-label{ font-size: 11px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; color: var(--tr-muted); margin-left: 4px; }
      .tr-help{ margin: 2px 0 0 4px; font-size: 12px; font-weight: 650; color: #64748b; }

      .tr-input, .tr-select, .tr-textarea{
        width:100%;
        background: var(--tr-soft);
        border: 2px solid var(--tr-soft2);
        border-radius: var(--tr-rs);
        padding: 12px 14px;
        font-size: 14px;
        font-weight: 650;
        outline: none;
        transition: border-color .15s ease, background .15s ease;
      }
      .tr-input:focus, .tr-select:focus, .tr-textarea:focus{ background:#fff; border-color: var(--tr-orange); }
      .tr-textarea{ min-height: 108px; resize: vertical; line-height: 1.45; font-weight: 600; }

      .tr-actions{ display:flex; gap: 12px; align-items:center; margin-top: 14px; }
      .tr-back{
        width: 54px; height: 54px;
        border-radius: var(--tr-rs);
        border: 1px solid var(--tr-border);
        background: #fff;
        cursor: pointer;
        font-size: 18px;
      }
      .tr-btn{
        height: 54px;
        border-radius: var(--tr-rs);
        border: none;
        cursor: pointer;
        font-size: 16px;
        font-weight: 950;
        transition: transform .12s ease, filter .12s ease;
        width: 100%;
      }
      .tr-btn:hover{ transform: translateY(-1px); filter: brightness(1.02); }
      .tr-btn:disabled{ opacity:.7; cursor:not-allowed; transform:none; }

      .tr-next{ background: var(--tr-navy); color:#fff; }
      .tr-submit{
        background: var(--tr-orange);
        color:#fff;
        flex: 1;
        box-shadow: 0 10px 16px -6px rgba(227,109,53,.35);
      }

      .tr-alert{
        display:none;
        margin-bottom: 12px;
        padding: 12px;
        border-radius: 14px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #7f1d1d;
        font-size: 13px;
        font-weight: 750;
        line-height: 1.35;
      }

      .tr-note{ margin-top: 10px; font-size: 12px; font-weight: 650; color: #64748b; }

      .tr-success{ padding: 52px 18px; text-align:center; }
      .tr-success h3{ margin:0 0 8px; font-size: 22px; font-weight: 980; color: var(--tr-navy); }
      .tr-success p{ margin:0 auto; max-width: 48ch; font-weight: 650; color: #334155; }

      .tr-hp{ position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden; }
    `;
    document.head.appendChild(style);
  },

  renderFormHTML() {
    const cfg = this.config;
    const datalist = (cfg.suburbSuggestions || [])
      .map((s) => `<option value="${this._esc(s)}"></option>`)
      .join("");

    return `
      <div class="tr-wrap" data-tr-root>
        <div class="tr-card" x-data="trLeadForm()">
          <div class="tr-head">
            <div>
              <h2 class="tr-title">Get a Quote</h2>
              <p class="tr-sub">${this._esc(cfg.responseSlaText)}</p>
            </div>
            <div class="tr-steps" aria-label="Form steps">
              <div class="tr-step" :class="step === 1 ? 'on' : 'off'">1. Details</div>
              <div class="tr-step" :class="step === 2 ? 'on orange' : 'off'">2. Contact</div>
            </div>
          </div>

          <div class="tr-body">
            <div class="tr-alert" data-tr-error role="alert" aria-live="polite"></div>

            <form data-tr-form novalidate @submit.prevent="submitForm($event)">
              <!-- STEP 1 -->
              <section data-tr-step="1" x-show="step === 1" x-ref="step1">
                <div class="tr-field">
                  <label class="tr-label" for="tr_service">Service required</label>
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
                    <label class="tr-label" for="tr_level">Building height</label>
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
                  <input id="tr_suburb" name="suburb" required class="tr-input"
                         placeholder="e.g. Ringwood" autocomplete="address-level2" list="trSuburbList">
                  <datalist id="trSuburbList">${datalist}</datalist>
                  <p class="tr-help">Melbourne & surrounds — we’ll confirm your area quickly.</p>
                </div>

                <div class="tr-actions">
                  <button type="button" class="tr-btn tr-next" data-tr-next @click="goNext()">Continue →</button>
                </div>

                <p class="tr-note">Tip: if water is actively dripping, call now to reduce ceiling damage.</p>
              </section>

              <!-- STEP 2 -->
              <section data-tr-step="2" x-show="step === 2" x-cloak x-ref="step2">
                <div class="tr-field">
                  <label class="tr-label" for="tr_fullName">Full name</label>
                  <input id="tr_fullName" name="fullName" required class="tr-input"
                         placeholder="Your name" autocomplete="name">
                </div>

                <div class="tr-grid" style="margin-top:12px;">
                  <div class="tr-field">
                    <label class="tr-label" for="tr_phone">Phone number</label>
                    <input id="tr_phone" name="phone" required class="tr-input"
                           placeholder="04xx xxx xxx" inputmode="tel" autocomplete="tel">
                  </div>
                  <div class="tr-field">
                    <label class="tr-label" for="tr_email">Email address</label>
                    <input id="tr_email" name="email" type="email" required class="tr-input"
                           placeholder="you@example.com" autocomplete="email">
                  </div>
                </div>

                <div class="tr-field" style="margin-top:12px;">
                  <label class="tr-label" for="tr_message">Message / details</label>
                  <textarea id="tr_message" name="message" class="tr-textarea" required
                    placeholder="Where is the leak? Any cracked tiles, storm damage, or ceiling stains?"></textarea>
                </div>

                <!-- Spam trap -->
                <div class="tr-hp" aria-hidden="true">
                  <label>Leave blank</label>
                  <input type="text" name="honeypot" tabindex="-1" autocomplete="off">
                </div>

                <!-- Hidden tracking inputs (we populate these automatically) -->
                <input type="hidden" name="gclid" value="">
                <input type="hidden" name="utm_source" value="">
                <input type="hidden" name="utm_medium" value="">
                <input type="hidden" name="landing_page" value="">
                <input type="hidden" name="user_agent" value="">
                <input type="hidden" name="tsStart" value="">

                <div class="tr-actions">
                  <button type="button" class="tr-back" data-tr-back @click="goBack()" aria-label="Back">←</button>
                  <button type="submit" class="tr-btn tr-submit" data-tr-submit :disabled="loading">
                    <span x-show="!loading">Send Request</span>
                    <span x-show="loading">Sending…</span>
                  </button>
                </div>

                <p class="tr-note">We’ll contact you to confirm roof access and give a clear quote.</p>
              </section>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  mount(targetEl) {
    if (!targetEl) return;
    this.injectStyles();
    targetEl.innerHTML = this.renderFormHTML();

    // Always set tracking + vanilla fallback (so it works even if Alpine isn't present)
    this._populateTracking(targetEl);
    this._initVanillaFallback(targetEl);

    const root = targetEl.querySelector("[data-tr-root]");
    const AlpineRef = (typeof window !== "undefined" && (window.Alpine || globalThis.Alpine)) || null;

    // If Alpine exists, register + hydrate injected subtree
    if (AlpineRef) {
      if (!window.__TR_LEADFORM_REGISTERED__) {
        AlpineRef.data("trLeadForm", () => this._alpineComponent(targetEl));
        window.__TR_LEADFORM_REGISTERED__ = true;
      }
      AlpineRef.initTree(root);
    } else {
      // If no Alpine, ensure x-cloak does not permanently hide step 2
      root.querySelectorAll("[x-cloak]").forEach((el) => el.removeAttribute("x-cloak"));
    }
  },

  _alpineComponent(targetEl) {
    const cfg = this.config;

    return {
      step: 1,
      loading: false,

      goNext() {
        this._hideErr();
        if (!this._validate(targetEl.querySelector('[data-tr-step="1"]'))) return;
        this.step = 2;
        queueMicrotask(() => targetEl.querySelector("#tr_fullName")?.focus());
      },

      goBack() {
        this._hideErr();
        this.step = 1;
        queueMicrotask(() => targetEl.querySelector("#tr_service")?.focus());
      },

      _errEl() {
        return targetEl.querySelector("[data-tr-error]");
      },

      _showErr(msg) {
        const el = this._errEl();
        if (!el) return;
        el.textContent = msg;
        el.style.display = "block";
      },

      _hideErr() {
        const el = this._errEl();
        if (!el) return;
        el.style.display = "none";
        el.textContent = "";
      },

      _validate(container) {
        const required = container?.querySelectorAll("[required]") || [];
        for (const el of required) {
          if ((el.tagName === "INPUT" || el.tagName === "TEXTAREA") && el.value) {
            el.value = el.value.trim();
          }
          if (!el.checkValidity()) {
            el.reportValidity();
            this._showErr("Please complete the highlighted fields.");
            return false;
          }
        }
        return true;
      },

      _cooldownOK() {
        try {
          const k = "tr_last_submit";
          const last = Number(localStorage.getItem(k) || "0");
          const now = Date.now();
          if (now - last < cfg.submitCooldownMs) return false;
          localStorage.setItem(k, String(now));
          return true;
        } catch {
          return true;
        }
      },

      async submitForm(e) {
        this._hideErr();

        const step2 = targetEl.querySelector('[data-tr-step="2"]');
        if (!this._validate(step2)) return;

        const formEl = e.target;
        const fd = new FormData(formEl);

        // spam checks
        if (fd.get("honeypot")) return;
        const ts0 = Number(fd.get("tsStart") || Date.now());
        if (Date.now() - ts0 < cfg.minTimeOnFormMs) {
          this._showErr("Please try again.");
          return;
        }
        if (!this._cooldownOK()) {
          this._showErr("Please wait a moment before sending again.");
          return;
        }

        // Ensure tracking fields exist (in case mount order changes)
        FormAsset._populateTracking(targetEl);

        this.loading = true;

        // STRICT: send Google Form entry IDs ONLY (field + tracking)
        const payload = FormAsset._buildGooglePayloadFromForm(formEl);

        try {
          // IMPORTANT: Google Forms typically requires urlencoded body
          // and no-cors means we can't read the response even if it succeeds.
          await fetch(cfg.endpoint, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
            body: payload.toString(),
          });

          targetEl.innerHTML = `
            <div class="tr-wrap">
              <div class="tr-card">
                <div class="tr-success">
                  <h3>✅ Request received!</h3>
                  <p>Thanks — we’ll contact you shortly. If it’s urgent, call now so we can prioritise the leak.</p>
                </div>
              </div>
            </div>
          `;
        } catch (ex) {
          console.error(ex);
          this.loading = false;
          this._showErr("Couldn’t send your request. Please try again, or call us for urgent leaks.");
        }
      },
    };
  },

  _initVanillaFallback(targetEl) {
    const cfg = this.config;
    const form = targetEl.querySelector("[data-tr-form]");
    const step1 = targetEl.querySelector('[data-tr-step="1"]');
    const step2 = targetEl.querySelector('[data-tr-step="2"]');
    const nextBtn = targetEl.querySelector("[data-tr-next]");
    const backBtn = targetEl.querySelector("[data-tr-back]");
    const err = targetEl.querySelector("[data-tr-error]");
    const ts = targetEl.querySelector('input[name="tsStart"]');

    if (!form || !step1 || !step2 || !nextBtn) return;

    // populate timestamp for bot check
    if (ts && !ts.value) ts.value = String(Date.now());

    // baseline display for non-Alpine
    step1.style.display = "";
    step2.style.display = "none";

    const showErr = (msg) => {
      if (!err) return;
      if (!msg) {
        err.style.display = "none";
        err.textContent = "";
        return;
      }
      err.style.display = "block";
      err.textContent = msg;
    };

    const validate = (container) => {
      showErr("");
      const required = container.querySelectorAll("[required]");
      for (const el of required) {
        if ((el.tagName === "INPUT" || el.tagName === "TEXTAREA") && el.value) {
          el.value = el.value.trim();
        }
        if (!el.checkValidity()) {
          el.reportValidity();
          showErr("Please complete the highlighted fields.");
          return false;
        }
      }
      return true;
    };

    // if Alpine owns the DOM, don't fight it
    const alpineWrapper = () => targetEl.querySelector('[x-data="trLeadForm()"]');
    const alpineActive = () => alpineWrapper()?.__x;

    nextBtn.addEventListener("click", () => {
      if (alpineActive()) return;
      if (!validate(step1)) return;
      step1.style.display = "none";
      step2.style.display = "";
      targetEl.querySelector("#tr_fullName")?.focus();
    });

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (alpineActive()) return;
        showErr("");
        step2.style.display = "none";
        step1.style.display = "";
        targetEl.querySelector("#tr_service")?.focus();
      });
    }

    form.addEventListener("submit", async (e) => {
      if (alpineActive()) return;
      e.preventDefault();

      if (!validate(step2)) return;

      const fd = new FormData(form);
      if (fd.get("honeypot")) return;

      const ts0 = Number(fd.get("tsStart") || Date.now());
      if (Date.now() - ts0 < cfg.minTimeOnFormMs) {
        showErr("Please try again.");
        return;
      }

      FormAsset._populateTracking(targetEl);
      const payload = FormAsset._buildGooglePayloadFromForm(form);

      try {
        await fetch(cfg.endpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: payload.toString(),
        });

        targetEl.innerHTML = `
          <div class="tr-wrap">
            <div class="tr-card">
              <div class="tr-success">
                <h3>✅ Request received!</h3>
                <p>Thanks — we’ll contact you shortly. If it’s urgent, call now so we can prioritise the leak.</p>
              </div>
            </div>
          </div>
        `;
      } catch (ex) {
        console.error(ex);
        showErr("Couldn’t send your request. Please try again or call us for urgent leaks.");
      }
    });
  },

  // ----------------------------------------------------------
  // Tracking fields (STRICT) — write into hidden inputs
  // ----------------------------------------------------------
  _populateTracking(targetEl) {
    const setVal = (name, val) => {
      const el = targetEl.querySelector(`input[name="${name}"]`);
      if (el) el.value = String(val ?? "");
    };

    const url = (typeof window !== "undefined" && window.location) ? window.location : null;
    const ref = (typeof document !== "undefined") ? document.referrer : "";
    const ua = (typeof navigator !== "undefined") ? navigator.userAgent : "";

    let gclid = "";
    let utmSource = "";
    let utmMedium = "";

    if (url) {
      const sp = new URLSearchParams(url.search || "");
      gclid = sp.get("gclid") || "";
      utmSource = sp.get("utm_source") || ref || "";
      utmMedium = sp.get("utm_medium") || "";
      setVal("landing_page", url.pathname || "");
    } else {
      setVal("landing_page", "");
    }

    setVal("gclid", gclid);
    setVal("utm_source", utmSource);
    setVal("utm_medium", utmMedium);
    setVal("user_agent", ua);

    // also set timestamp start if empty
    const ts = targetEl.querySelector('input[name="tsStart"]');
    if (ts && !ts.value) ts.value = String(Date.now());
  },

  // ----------------------------------------------------------
  // STRICT: translate HTML fields -> Google entry IDs
  // ----------------------------------------------------------
  _buildGooglePayloadFromForm(formEl) {
    const cfg = this.config;
    const fd = new FormData(formEl);
    const p = new URLSearchParams();

    // Ensure all required strict fields exist (empty string if missing)
    const read = (k) => String(fd.get(k) ?? "").trim();

    // core fields
    p.set(cfg.mapping.service, read("service"));
    p.set(cfg.mapping.material, read("material"));
    p.set(cfg.mapping.level, read("level"));
    p.set(cfg.mapping.suburb, read("suburb"));
    p.set(cfg.mapping.fullName, read("fullName"));
    p.set(cfg.mapping.phone, read("phone"));
    p.set(cfg.mapping.email, read("email"));
    p.set(cfg.mapping.message, read("message"));

    // tracking fields (from hidden inputs)
    p.set(cfg.mapping.gclid, read("gclid"));
    p.set(cfg.mapping.utm_source, read("utm_source"));
    p.set(cfg.mapping.utm_medium, read("utm_medium"));
    p.set(cfg.mapping.landing_page, read("landing_page"));
    p.set(cfg.mapping.user_agent, read("user_agent"));

    return p;
  },

  _esc(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },
};
