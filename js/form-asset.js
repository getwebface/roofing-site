/* ==========================================================
   TRUE ROOF — PREMIUM GOOGLE FORM (STRICT ENTRY NAMES)
   - Uses exact Google entry IDs as input names (no mapping risk)
   - Submits via POST to formResponse using a hidden iframe (reliable)
   - Two-step UX + validation + tracking fields
   ========================================================== */

export const FormAsset = {
  config: {
    // MUST be the *public* formResponse URL for the correct form
    endpoint:
      "https://docs.google.com/forms/d/e/1FAIpQLSeXt8JeqI9PvhDWxu6cOOxX58kfs8J85UQGXk3Tc09HOUA2FA/formResponse",

    // EXACT entry IDs you provided (STRICT)
    entry: {
      // Core fields
      service: "entry.1354597159",
      material: "entry.214341972",
      level: "entry.1724291652",
      suburb: "entry.131318949",
      fullName: "entry.1890503231",
      phone: "entry.1596600455",
      email: "entry.1842144469",
      message: "entry.1638990837",

      // Tracking fields
      gclid: "entry.2122671224",
      utm_source: "entry.89955284",
      utm_medium: "entry.1694441444",
      landing_page: "entry.1645230369",
      user_agent: "entry.339828064",
    },

    suburbSuggestions: ["Ringwood", "Doncaster", "Glen Waverley", "Balwyn", "Reservoir"],
    responseSlaText: "Fast 2-Hour Response",
    minTimeOnFormMs: 900,
    submitCooldownMs: 25000,
  },

  injectStyles() {
    if (document.getElementById("tr-form-styles")) return;
    const style = document.createElement("style");
    style.id = "tr-form-styles";
    style.textContent = `
      :root{
        --tr-navy:#0a192f; --tr-orange:#e36d35; --tr-border:#e2e8f0;
        --tr-soft:#f8fafc; --tr-soft2:#f1f5f9;
        --tr-text:#0f172a; --tr-muted:#64748b;
        --tr-shadow: 0 22px 44px -16px rgba(0,0,0,.18);
        --tr-r: 22px; --tr-rs: 12px;
        --tr-font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      }
      .tr-wrap{ max-width: 760px; margin: 0 auto; padding: 16px; font-family: var(--tr-font); color: var(--tr-text); }
      .tr-card{ background:#fff; border:1px solid var(--tr-border); border-radius:var(--tr-r); box-shadow:var(--tr-shadow); overflow:hidden; }
      .tr-head{ padding:18px 18px 14px; border-bottom:1px solid var(--tr-soft2); display:flex; align-items:center; justify-content:space-between; gap:14px; }
      .tr-title{ margin:0; font-size:22px; font-weight:950; letter-spacing:-.02em; color: var(--tr-navy); }
      .tr-sub{ margin:4px 0 0; font-size:11px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; color: var(--tr-orange); }

      .tr-steps{ display:flex; gap:6px; background: var(--tr-soft2); padding:6px; border-radius:999px; }
      .tr-step{ padding:6px 10px; border-radius:999px; font-size:11px; font-weight:900; white-space:nowrap; user-select:none; }
      .tr-step.on{ background: var(--tr-navy); color:#fff; }
      .tr-step.on.orange{ background: var(--tr-orange); }
      .tr-step.off{ color:#94a3b8; }

      .tr-body{ padding:18px; }
      .tr-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      @media (max-width:560px){ .tr-grid{ grid-template-columns:1fr; } }

      .tr-field{ display:flex; flex-direction:column; gap:6px; }
      .tr-label{ font-size:11px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; color: var(--tr-muted); margin-left:4px; }
      .tr-help{ margin:2px 0 0 4px; font-size:12px; font-weight:650; color:#64748b; }

      .tr-input, .tr-select, .tr-textarea{
        width:100%; background: var(--tr-soft);
        border:2px solid var(--tr-soft2);
        border-radius: var(--tr-rs);
        padding:12px 14px;
        font-size:14px; font-weight:650;
        outline:none; transition:.15s;
      }
      .tr-input:focus, .tr-select:focus, .tr-textarea:focus{ background:#fff; border-color: var(--tr-orange); }
      .tr-textarea{ min-height:108px; resize:vertical; line-height:1.45; font-weight:600; }

      .tr-actions{ display:flex; gap:12px; align-items:center; margin-top:14px; }
      .tr-back{ width:54px; height:54px; border-radius: var(--tr-rs); border:1px solid var(--tr-border); background:#fff; cursor:pointer; font-size:18px; }
      .tr-btn{ height:54px; border-radius: var(--tr-rs); border:none; cursor:pointer; font-size:16px; font-weight:950; width:100%; transition:.12s; }
      .tr-btn:hover{ transform: translateY(-1px); filter: brightness(1.02); }
      .tr-btn:disabled{ opacity:.7; cursor:not-allowed; transform:none; }
      .tr-next{ background: var(--tr-navy); color:#fff; }
      .tr-submit{ background: var(--tr-orange); color:#fff; flex:1; box-shadow:0 10px 16px -6px rgba(227,109,53,.35); }

      .tr-alert{
        display:none; margin-bottom:12px;
        padding:12px; border-radius:14px;
        background:#fef2f2; border:1px solid #fecaca;
        color:#7f1d1d; font-size:13px; font-weight:750; line-height:1.35;
      }
      .tr-note{ margin-top:10px; font-size:12px; font-weight:650; color:#64748b; }

      .tr-success{ padding:52px 18px; text-align:center; }
      .tr-success h3{ margin:0 0 8px; font-size:22px; font-weight:980; color: var(--tr-navy); }
      .tr-success p{ margin:0 auto; max-width:48ch; font-weight:650; color:#334155; }

      .tr-hidden{ display:none !important; }
      .tr-hp{ position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden; }
      iframe.tr-iframe{ width:0; height:0; border:0; position:absolute; left:-9999px; top:-9999px; }
    `;
    document.head.appendChild(style);
  },

  renderFormHTML() {
    const c = this.config;
    const e = c.entry;

    const datalist = (c.suburbSuggestions || [])
      .map((s) => `<option value="${this._esc(s)}"></option>`)
      .join("");

    // IMPORTANT: input/select names are the Google entry IDs (STRICT)
    return `
      <div class="tr-wrap" data-tr-root>
        <div class="tr-card">
          <div class="tr-head">
            <div>
              <h2 class="tr-title">Get a Quote</h2>
              <p class="tr-sub">${this._esc(c.responseSlaText)}</p>
            </div>
            <div class="tr-steps" aria-label="Form steps">
              <div class="tr-step on" data-tr-dot1>1. Details</div>
              <div class="tr-step off" data-tr-dot2>2. Contact</div>
            </div>
          </div>

          <div class="tr-body">
            <div class="tr-alert" data-tr-error role="alert" aria-live="polite"></div>

            <iframe class="tr-iframe" name="tr_hidden_iframe" title="hidden"></iframe>

            <form data-tr-form method="POST" action="${this._esc(c.endpoint)}" target="tr_hidden_iframe" novalidate>
              <!-- STEP 1 -->
              <section data-tr-step="1">
                <div class="tr-field">
                  <label class="tr-label" for="tr_service">Service type</label>
                  <select id="tr_service" name="${e.service}" required class="tr-select">
                    <option value="" disabled selected>Select service…</option>
                    <option>Full Roof Restoration</option>
                    <option>Roof Repairs & Leak Fixes</option>
                    <option>Roof Painting & Sealing</option>
                    <option>Re-Bedding & Pointing</option>
                  </select>
                </div>

                <div class="tr-grid" style="margin-top:12px;">
                  <div class="tr-field">
                    <label class="tr-label" for="tr_material">Roof material</label>
                    <select id="tr_material" name="${e.material}" required class="tr-select">
                      <option value="" disabled selected>Choose…</option>
                      <option>Cement Tile</option>
                      <option>Terracotta</option>
                      <option>Metal/Colorbond</option>
                    </select>
                  </div>

                  <div class="tr-field">
                    <label class="tr-label" for="tr_level">House level</label>
                    <select id="tr_level" name="${e.level}" required class="tr-select">
                      <option value="" disabled selected>Choose…</option>
                      <option>Single Storey</option>
                      <option>Double Storey</option>
                    </select>
                  </div>
                </div>

                <div class="tr-field" style="margin-top:12px;">
                  <label class="tr-label" for="tr_suburb">Suburb</label>
                  <input id="tr_suburb" name="${e.suburb}" required class="tr-input"
                         placeholder="e.g. Ringwood" autocomplete="address-level2" list="trSuburbList">
                  <datalist id="trSuburbList">${datalist}</datalist>
                  <p class="tr-help">Melbourne & surrounds — we’ll confirm your area quickly.</p>
                </div>

                <div class="tr-actions">
                  <button type="button" class="tr-btn tr-next" data-tr-next>Continue →</button>
                </div>

                <p class="tr-note">Tip: if water is actively dripping, call now to reduce ceiling damage.</p>
              </section>

              <!-- STEP 2 -->
              <section data-tr-step="2" class="tr-hidden">
                <div class="tr-field">
                  <label class="tr-label" for="tr_fullName">Full name</label>
                  <input id="tr_fullName" name="${e.fullName}" required class="tr-input" placeholder="Your name" autocomplete="name">
                </div>

                <div class="tr-grid" style="margin-top:12px;">
                  <div class="tr-field">
                    <label class="tr-label" for="tr_phone">Phone number</label>
                    <input id="tr_phone" name="${e.phone}" required class="tr-input" placeholder="04xx xxx xxx" inputmode="tel" autocomplete="tel">
                  </div>
                  <div class="tr-field">
                    <label class="tr-label" for="tr_email">Email address</label>
                    <input id="tr_email" name="${e.email}" type="email" required class="tr-input" placeholder="you@example.com" autocomplete="email">
                  </div>
                </div>

                <div class="tr-field" style="margin-top:12px;">
                  <label class="tr-label" for="tr_message">Message</label>
                  <textarea id="tr_message" name="${e.message}" required class="tr-textarea"
                    placeholder="Where is the leak? Any cracked tiles, storm damage, or ceiling stains?"></textarea>
                </div>

                <!-- Honeypot -->
                <div class="tr-hp" aria-hidden="true">
                  <label>Leave blank</label>
                  <input type="text" name="company" tabindex="-1" autocomplete="off">
                </div>

                <!-- Tracking fields (STRICT entry IDs) -->
                <input type="hidden" name="${e.gclid}" value="" data-tr-track="gclid">
                <input type="hidden" name="${e.utm_source}" value="" data-tr-track="utm_source">
                <input type="hidden" name="${e.utm_medium}" value="" data-tr-track="utm_medium">
                <input type="hidden" name="${e.landing_page}" value="" data-tr-track="landing_page">
                <input type="hidden" name="${e.user_agent}" value="" data-tr-track="user_agent">

                <!-- Bot timing + cooldown -->
                <input type="hidden" name="tr_tsStart" value="" data-tr-ts>

                <div class="tr-actions">
                  <button type="button" class="tr-back" data-tr-back aria-label="Back">←</button>
                  <button type="submit" class="tr-btn tr-submit" data-tr-submit>Send Request</button>
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
    const form = targetEl.querySelector("[data-tr-form]");
    const step1 = targetEl.querySelector('[data-tr-step="1"]');
    const step2 = targetEl.querySelector('[data-tr-step="2"]');
    const nextBtn = targetEl.querySelector("[data-tr-next]");
    const backBtn = targetEl.querySelector("[data-tr-back]");
    const err = targetEl.querySelector("[data-tr-error]");
    const tsStart = targetEl.querySelector("[data-tr-ts]");
    const dot1 = targetEl.querySelector("[data-tr-dot1]");
    const dot2 = targetEl.querySelector("[data-tr-dot2]");

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

    // Tracking fill (STRICT IDs, but set via data attributes)
    this._populateTracking(targetEl);

    // Timestamp start (bot check)
    if (tsStart) tsStart.value = String(Date.now());

    // Step navigation
    nextBtn?.addEventListener("click", () => {
      if (!validate(step1)) return;
      step1.classList.add("tr-hidden");
      step2.classList.remove("tr-hidden");
      dot1?.classList.remove("on");
      dot1?.classList.add("off");
      dot2?.classList.remove("off");
      dot2?.classList.add("on", "orange");
      targetEl.querySelector("#tr_fullName")?.focus();
    });

    backBtn?.addEventListener("click", () => {
      showErr("");
      step2.classList.add("tr-hidden");
      step1.classList.remove("tr-hidden");
      dot2?.classList.remove("on", "orange");
      dot2?.classList.add("off");
      dot1?.classList.remove("off");
      dot1?.classList.add("on");
      targetEl.querySelector("#tr_service")?.focus();
    });

    // Submit handling (iframe POST)
    form?.addEventListener("submit", (e) => {
      // Validate step 2
      if (!validate(step2)) {
        e.preventDefault();
        return;
      }

      // Honeypot
      const hp = form.querySelector('input[name="company"]');
      if (hp && hp.value) {
        e.preventDefault();
        return;
      }

      // Bot timing
      const started = Number(tsStart?.value || Date.now());
      if (Date.now() - started < this.config.minTimeOnFormMs) {
        e.preventDefault();
        showErr("Please try again.");
        return;
      }

      // Cooldown
      if (!this._cooldownOK()) {
        e.preventDefault();
        showErr("Please wait a moment before sending again.");
        return;
      }

      // Refresh tracking right before submit (in case SPA route/UTM changed)
      this._populateTracking(targetEl);

      // Optimistic success UI (because iframe submit gives no readable response)
      // Let the POST proceed; swap UI immediately after.
      queueMicrotask(() => {
        root.innerHTML = `
          <div class="tr-card">
            <div class="tr-success">
              <h3>✅ Request received!</h3>
              <p>Thanks — we’ll contact you shortly. If it’s urgent, call now so we can prioritise the leak.</p>
            </div>
          </div>
        `;
      });
    });
  },

  _cooldownOK() {
    try {
      const k = "tr_last_submit";
      const last = Number(localStorage.getItem(k) || "0");
      const now = Date.now();
      if (now - last < this.config.submitCooldownMs) return false;
      localStorage.setItem(k, String(now));
      return true;
    } catch {
      return true;
    }
  },

  _populateTracking(targetEl) {
    const set = (key, val) => {
      const el = targetEl.querySelector(`[data-tr-track="${key}"]`);
      if (el) el.value = String(val ?? "");
    };

    const loc = typeof window !== "undefined" ? window.location : null;
    const ref = typeof document !== "undefined" ? document.referrer : "";
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

    let gclid = "";
    let utm_source = "";
    let utm_medium = "";
    let landing = "";

    if (loc) {
      const sp = new URLSearchParams(loc.search || "");
      gclid = sp.get("gclid") || "";
      utm_source = sp.get("utm_source") || ref || "";
      utm_medium = sp.get("utm_medium") || "";
      landing = loc.pathname || "";
    }

    set("gclid", gclid);
    set("utm_source", utm_source);
    set("utm_medium", utm_medium);
    set("landing_page", landing);
    set("user_agent", ua);
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
