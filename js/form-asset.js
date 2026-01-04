/* ==========================================================
   TRUE ROOF — FLAWLESS HYBRID FORM
   - Uses clean internal names for reliability
   - Uses the proven submitToGoogle mapping logic
   - Environment-safe (no dots in HTML name attributes)
   ========================================================== */

export const FormAsset = {
  config: {
    endpoint: "https://docs.google.com/forms/d/e/1FAIpQLSeXt8JeqI9PvhDWxu6cOOxX58kfs8J85UQGXk3Tc09HOUA2FA/formResponse",
    
    // PROVEN MAPPING (From your working code)
    mapping: {
      "service":      "entry.1354597159",
      "material":     "entry.214341972",
      "level":        "entry.1724291652",
      "suburb":       "entry.131318949",
      "fullName":     "entry.1890503231",
      "phone":        "entry.1596600455",
      "email":        "entry.1842144469",
      "message":      "entry.1638990837",
      "gclid":        "entry.2122671224",
      "utm_source":   "entry.89955284",
      "utm_medium":   "entry.1694441444",
      "landing_page": "entry.1645230369",
      "user_agent":   "entry.339828064"
    },
    suburbSuggestions: ["Ringwood", "Doncaster", "Glen Waverley", "Frankston", "Werribee"],
  },

  injectStyles() {
    if (document.getElementById("tr-form-styles")) return;
    const style = document.createElement("style");
    style.id = "tr-form-styles";
    style.textContent = `
      :root{ --tr-navy:#0a192f; --tr-orange:#e36d35; --tr-border:#e2e8f0; --tr-soft:#f8fafc; }
      .tr-wrap{ max-width: 500px; margin: 0 auto; font-family: sans-serif; }
      .tr-card{ background:#fff; border:1px solid var(--tr-border); border-radius:20px; padding:25px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
      .tr-hidden { display: none !important; }
      .tr-field { margin-bottom: 15px; display: flex; flex-direction: column; }
      .tr-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--tr-navy); margin-bottom: 5px; opacity: 0.7; }
      .tr-input, .tr-select, .tr-textarea { padding: 12px; border-radius: 10px; border: 2px solid var(--tr-border); outline: none; font-size: 14px; }
      .tr-input:focus { border-color: var(--tr-orange); }
      .tr-btn { background: var(--tr-navy); color: #fff; padding: 15px; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; margin-top: 10px; }
      .tr-submit { background: var(--tr-orange); }
      .tr-success { text-align: center; padding: 40px 20px; }
    `;
    document.head.appendChild(style);
  },

  renderFormHTML() {
    return `
      <div class="tr-wrap" data-tr-root>
        <div class="tr-card">
          <form data-tr-form novalidate>
            <div data-tr-step="1">
              <div class="tr-field">
                <label class="tr-label">Service Required</label>
                <select name="service" required class="tr-select">
                  <option value="">Select Service...</option>
                  <option>Full Roof Restoration</option>
                  <option>Roof Repairs & Leak Fixes</option>
                </select>
              </div>
              <div class="tr-field">
                <label class="tr-label">Suburb</label>
                <input type="text" name="suburb" required class="tr-input" placeholder="e.g. Ringwood">
              </div>
              <button type="button" class="tr-btn" data-tr-next>Next Step →</button>
            </div>

            <div data-tr-step="2" class="tr-hidden">
              <div class="tr-field">
                <label class="tr-label">Full Name</label>
                <input type="text" name="fullName" required class="tr-input">
              </div>
              <div class="tr-field">
                <label class="tr-label">Phone</label>
                <input type="tel" name="phone" required class="tr-input">
              </div>
              <div class="tr-field">
                <label class="tr-label">Email</label>
                <input type="email" name="email" required class="tr-input">
              </div>
              <textarea name="message" class="tr-hidden">Quote Request from Asset Form</textarea>
              <input type="text" name="honeypot" class="tr-hidden" tabindex="-1">
              
              <button type="submit" class="tr-btn tr-submit">Get Free Quote</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async submitToGoogle(formData) {
    const submissionData = new FormData();
    
    // 1. Map the clean names to Google IDs (The Flawless Logic)
    for (const [key, googleId] of Object.entries(this.config.mapping)) {
      if (formData.has(key)) {
        submissionData.append(googleId, formData.get(key));
      }
    }

    // 2. Add Tracking
    const urlParams = new URLSearchParams(window.location.search);
    submissionData.append(this.config.mapping.gclid, urlParams.get('gclid') || '');
    submissionData.append(this.config.mapping.utm_source, urlParams.get('utm_source') || document.referrer || 'Direct');
    submissionData.append(this.config.mapping.landing_page, window.location.pathname);
    submissionData.append(this.config.mapping.user_agent, navigator.userAgent);

    // 3. The Fetch (No-Cors)
    try {
      await fetch(this.config.endpoint, {
        method: "POST",
        mode: "no-cors",
        body: submissionData
      });
      return true;
    } catch (err) {
      console.error("Submission failed", err);
      return false;
    }
  },

  mount(targetEl) {
    this.injectStyles();
    targetEl.innerHTML = this.renderFormHTML();

    const form = targetEl.querySelector("[data-tr-form]");
    const s1 = targetEl.querySelector('[data-tr-step="1"]');
    const s2 = targetEl.querySelector('[data-tr-step="2"]');
    const root = targetEl.querySelector("[data-tr-root]");

    targetEl.querySelector("[data-tr-next]").onclick = () => {
      s1.classList.add("tr-hidden");
      s2.classList.remove("tr-hidden");
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      const rawData = new FormData(form);
      
      // Honeypot check
      if (rawData.get("honeypot")) return;

      const success = await this.submitToGoogle(rawData);
      
      if (success) {
        root.innerHTML = `<div class="tr-card tr-success"><h2>Sent!</h2><p>We will call you within 2 hours.</p></div>`;
      }
    };
  }
};
