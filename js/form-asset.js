/* ==========================================================
   TRUE ROOF — PREMIUM LEAD FORM MODULE (2-Step + Fallback)
   - Always renders (even if Alpine is missing)
   - If Alpine is present: 2-step with x-show
   - If Alpine is missing: vanilla JS step switching
   - Handles injected DOM with Alpine.initTree()
   - Self-contained CSS
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

    responseSlaText: "Fast 2-Hour Response",
    showMessageField: true,
    suburbExamples: ["Ringwood", "Doncaster", "Glen Waverley", "Balwyn", "Reservoir"],

    submitCooldownMs: 25000,
    minTimeOnFormMs: 900, // bot check
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
        --tr-slate:#64748b;
        --tr-shadow: 0 25px 50px -12px rgba(0,0,0,.12);
        --tr-r: 24px;
        --tr-rs: 12px;
        --tr-font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      }

      /* IMPORTANT: keep x-cloak support, but we will NOT put x-cloak on the whole form */
      [x-cloak]{ display:none !important; }

      .tr-wrap{ max-width: 720px; margin: 0 auto; padding: 16px; font-family: var(--tr-font); }
      .tr-card{ background:#fff; border:1px solid var(--tr-border); border-radius:var(--tr-r); box-shadow:var(--tr-shadow); overflow:hidden; }
      .tr-head{ padding:18px; border-bottom:1px solid var(--tr-soft2); display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .tr-title{ margin:0; font-size:22px; font-weight:900; letter-spacing:-.02em; color:var(--tr-navy); }
      .tr-sub{ margin:4px 0 0; font-size:11px; font-weight:900; color:var(--tr-orange); text-transform:uppercase; letter-spacing:1px; }

      .tr-steps{ display:flex; gap:6px; background:var(--tr-soft2); padding:6px; border-radius:999px; }
      .tr-step{ padding:6px 10px; border-radius:999px; font-size:11px; font-weight:800; transition:.15s; white-space:nowrap; }
      .tr-step.on{ background:var(--tr-navy); color:#fff; }
      .tr-step.on.orange{ background:var(--tr-orange); }
      .tr-step.off{ color:#94a3b8; }

      .tr-body{ padding:18px; }
      .tr-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      @media (max-width:560px){ .tr-grid{ grid-template-columns:1fr; } }

      .tr-field{ display:flex; flex-direction:column; gap:6px; }
      .tr-label{ font-size:11px; font-weight:800; color:var(--tr-slate); text-transform:uppercase; letter-spacing:.08em; margin-left:4px; }

      .tr-input, .tr-select, .tr-textarea{
        width:100%; background:var(--tr-soft);
        border:2px solid var(--tr-soft2);
        border-radius:var(--tr-rs);
        padding:12px 14px;
        font-weight:650; font-size:14px;
        outline:none; transition:.15s;
      }
      .tr-input:focus, .tr-select:focus, .tr-textarea:focus{ border-color:var(--tr-orange); background:#fff; }
      .tr-textarea{ min-height:96px; resize:vertical; line-height:1.4; font-weight:600; }

      .tr-actions{ display:flex; gap:12px; align-items:center; margin-top:14px; }
      .tr-back{ width:56px; height:56px; border-radius:var(--tr-rs); border:1px solid var(--tr-border); background:#fff; cursor:pointer; font-size:18px; }
      .tr-btn{ height:56px; border-radius:var(--tr-rs); border:none; cursor:pointer; font-weight:900; font-size:17px; transition:.12s; width:100%; }
      .tr-btn:disabled{ opacity:.7; cursor:not-allowed; }
      .tr-btn:hover{ transform: translateY(-1px); }

      .tr-next{ background:var(--tr-navy); color:#fff; }
      .tr-submit{ background:var(--tr-orange); color:#fff; flex:1; box-shadow: 0 10px 15px -3px rgba(227,109,53,.25); }

      .tr-alert{
        display:none;
        margin-bottom:12px;
        padding:12px;
        border-radius:14px;
        background:#fef2f2;
        border:1px solid #fecaca;
        color:#7f1d1d;
        font-size:13px;
        font-weight:700;
        line-height:1.35;
      }

      .tr-success{ padding:52px 18px; text-align:center; }
      .tr-success h3{ margin:0 0 8px; font-size:22px; font-weight:950; color:var(--tr-navy); }
      .tr-success p{ margin:0 auto; max-width:46ch; color:#334155; font-weight:650; }
      .tr-note{ margin-top:10px; font-size:12px; color:#64748b; font-weight:650; }
      .tr-hp{ position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden; }
    `;
    document.head.appendChild(style);
  },

  renderFormHTML() {
    const cfg = this.config;
    const datalist = (cfg.suburbExamples || [])
      .map((s) => `<option value="${this._esc(s)}"></option>`)
      .join("");

    const msgField = cfg.showMessageField
      ? `
        <div class="tr-field" style="margin-top:12px;">
          <label class="tr-label" for="tr_message">Message (optional)</label>
          <textarea id="tr_message" name="message" class="tr-textarea"
            placeholder="Tell us what’s happening — leak location, cracked tiles, storm damage, etc."></textarea>
        </div>`
      : "";

    return `
      <div class="tr-wrap" data-tr-root>
        <!-- NOTE: NO x-cloak on the whole form. It must render even without Alpine. -->
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
              <!-- Step 1 -->
              <section data-tr-step="1" x-show="step === 1" x-ref="step1">
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
                  <input id="tr_suburb" name="suburb" required class="tr-input"
                         placeholder="e.g. Ringwood" autocomplete="address-level2" list="trSuburbList">
                  <datalist id="trSuburbList">${datalist}</datalist>
                </div>

                <div class="tr-actions">
                  <button type="button" class="tr-btn tr-next" data-tr-next @click="goNext()">Continue →</button>
                </div>

                <p class="tr-note">Urgent leak? Call the team — water damage gets expensive fast.</p>
              </section>

              <!-- Step 2 -->
              <!-- IMPORTANT: x-cloak ONLY on step 2, not the whole form -->
              <section data-tr-step="2" x-show="step === 2" x-cloak x-ref="step2">
                <div class="tr-grid">
                  <div class="tr-field" style="grid-column:1 / -1;">
                    <label class="tr-label" for="tr_fullName">Full name</label>
                    <input id="tr_fullName" name="fullName" required class="tr-input" placeholder="Your name" autocomplete="name">
                  </div>
                  <div class="tr-field">
                    <label class="tr-label" for="tr_phone">Mobile number</label>
                    <input id="tr_phone" name="phone" required class="tr-input" placeholder="04xx xxx xxx" inputmode="tel" autocomplete="tel">
                  </div>
                  <div class="tr-field">
                    <label class="tr-label" for="tr_email">Email</label>
                    <input id="tr_email" name="email" type="email" required class="tr-input" placeholder="you@example.com" autocomplete="email">
                  </div>
                </div>

                ${msgField}

                <!-- Anti-spam -->
                <div class="tr-hp" aria-hidden="true">
                  <label>Leave blank</label>
                  <input type="text" name="honeypot" tabindex="-1" autocomplete="off">
                </div>
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

    const root = targetEl.querySelector("[data-tr-root]");
    const AlpineRef = (typeof window !== "undefined" && (window.Alpine || globalThis.Alpine)) || null;

    // Always enable vanilla fallback (so it works without Alpine)
    this._initVanillaFallback(targetEl);

    // If Alpine is present, register + hydrate injected DOM
    if (AlpineRef) {
      // register once
      if (!window.__TR_LEADFORM_REGISTERED__) {
        AlpineRef.data("trLeadForm", () => this._alpineComponent(targetEl));
        window.__TR_LEADFORM_REGISTERED__ = true;
      }

      // CRITICAL: hydrate this injected subtree
      AlpineRef.initTree(root);

      // Alpine will handle step switching; vanilla listeners won’t break anything.
      // (They only toggle display if Alpine isn’t managing visibility.)
    } else {
      // If Alpine isn't present, ensure x-cloak sections are visible (step 2 remains hidden by vanilla)
      root.querySelectorAll("[x-cloak]").forEach((el) => el.removeAttribute("x-cloak"));
    }
  },

  _alpineComponent(targetEl) {
    const cfg = this.config;

    return {
      step: 1,
      loading: false,

      goNext() {
        const step1 = this.$refs.step1;
        if (!this._validate(step1)) return;
        this.step = 2;
        queueMicrotask(() => targetEl.querySelector("#tr_fullName")?.focus());
      },

      goBack() {
        this.step = 1;
        queueMicrotask(() => targetEl.querySelector("#tr_service")?.focus());
      },

      _validate(container) {
        const err = targetEl.querySelector("[data-tr-error]");
        if (err) err.style.display = "none";

        const required = container?.querySelectorAll("[required]") || [];
        for (const el of required) {
          if ((el.tagName === "INPUT" || el.tagName === "TEXTAREA") && el.value) {
            el.value = el.value.trim();
          }
          if (!el.checkValidity()) {
            el.reportValidity();
            if (err) {
              err.textContent = "Please complete the highlighted fields.";
              err.style.display = "block";
            }
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
        const err = targetEl.querySelector("[data-tr-error]");
        if (err) err.style.display = "none";

        if (!this._validate(this.$refs.step2)) return;

        const formEl = e.target;
        const fd = new FormData(formEl);

        // bot checks
        if (fd.get("honeypot")) return;
        const ts0 = Number(fd.get("tsStart") || Date.now());
        if (Date.now() - ts0 < cfg.minTimeOnFormMs) {
          if (err) {
            err.textContent = "Please try again (fast submit).";
            err.style.display = "block";
          }
          return;
        }
        if (!this._cooldownOK()) {
          if (err) {
            err.textContent = "Please wait a moment before sending again.";
            err.style.display = "block";
          }
          return;
        }

        this.loading = true;

        const params = new URLSearchParams();
        for (const [key, entryId] of Object.entries(cfg.mapping)) {
          params.append(entryId, String(fd.get(key) || ""));
        }

        try {
          // Google Forms no-cors: cannot confirm, so show optimistic success
          await fetch(cfg.endpoint, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
            body: params.toString(),
          });

          targetEl.innerHTML = `
            <div class="tr-wrap">
              <div class="tr-card">
                <div class="tr-success">
                  <h3>✅ Request received!</h3>
                  <p>Thanks — we’ll contact you shortly. If it’s urgent, call us now so we can prioritise the leak.</p>
                </div>
              </div>
            </div>
          `;
        } catch (ex) {
          console.error(ex);
          this.loading = false;
          if (err) {
            err.textContent =
              "Couldn’t send your request. Please try again, or call us for urgent leaks.";
            err.style.display = "block";
          }
        }
      },
    };
  },

  _initVanillaFallback(targetEl) {
    const form = targetEl.querySelector("[data-tr-form]");
    const step1 = targetEl.querySelector('[data-tr-step="1"]');
    const step2 = targetEl.querySelector('[data-tr-step="2"]');
    const nextBtn = targetEl.querySelector("[data-tr-next]");
    const backBtn = targetEl.querySelector("[data-tr-back]");
    const err = targetEl.querySelector("[data-tr-error]");
    const tsStart = targetEl.querySelector('input[name="tsStart"]');

    if (!form || !step1 || !step2 || !nextBtn) return;

    // Ensure a start timestamp exists (used by Alpine too)
    if (tsStart) tsStart.value = String(Date.now());

    // Vanilla visibility baseline (only used if Alpine isn't managing x-show)
    step1.style.display = "";
    step2.style.display = "none";

    const showErr = (msg) => {
      if (!err) return;
      if (!msg) {
        err.style.display = "none";
        err.textContent = "";
        return;
      }
      err.textContent = msg;
      err.style.display = "block";
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

    nextBtn.addEventListener("click", () => {
      // If Alpine is controlling x-show, don’t fight it.
      // Detect Alpine by presence of __x on wrapper (common) and just return.
      const wrapper = targetEl.querySelector('[x-data="trLeadForm()"]');
      if (wrapper && wrapper.__x) return;

      if (!validate(step1)) return;
      step1.style.display = "none";
      step2.style.display = "";
      targetEl.querySelector("#tr_fullName")?.focus();
    });

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        const wrapper = targetEl.querySelector('[x-data="trLeadForm()"]');
        if (wrapper && wrapper.__x) return;

        showErr("");
        step2.style.display = "none";
        step1.style.display = "";
        targetEl.querySelector("#tr_service")?.focus();
      });
    }

    // Vanilla submit (only if Alpine isn't managing @submit)
    form.addEventListener("submit", async (e) => {
      const wrapper = targetEl.querySelector('[x-data="trLeadForm()"]');
      if (wrapper && wrapper.__x) return; // Alpine owns it

      e.preventDefault();
      if (!validate(step2)) return;

      const fd = new FormData(form);
      if (fd.get("honeypot")) return;

      // bot timing
      const ts0 = Number(fd.get("tsStart") || Date.now());
      if (Date.now() - ts0 < this.config.minTimeOnFormMs) {
        showErr("Please try again (fast submit).");
        return;
      }

      const params = new URLSearchParams();
      for (const [key, entryId] of Object.entries(this.config.mapping)) {
        params.append(entryId, String(fd.get(key) || ""));
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
                <h3>✅ Request received!</h3>
                <p>Thanks — we’ll contact you shortly. If it’s urgent, call us now so we can prioritise the leak.</p>
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

  _esc(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },
};
