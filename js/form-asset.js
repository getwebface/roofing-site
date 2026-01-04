/* ==========================================================
   TRUE ROOF — LUXURY HEADLESS FORM (2026 EDITION)
   - High-fidelity UI with Glassmorphism
   - Robust mapping logic (Flawless Submission)
   - Fully Responsive & Multi-step
   ========================================================== */

export const FormAsset = {
  config: {
    endpoint: "https://docs.google.com/forms/d/e/1FAIpQLSeXt8JeqI9PvhDWxu6cOOxX58kfs8J85UQGXk3Tc09HOUA2FA/formResponse",
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
    }
  },

  injectStyles() {
    if (document.getElementById("tr-premium-styles")) return;
    const style = document.createElement("style");
    style.id = "tr-premium-styles";
    style.textContent = `
      :root {
        --tr-navy: #0a192f;
        --tr-navy-light: #112240;
        --tr-orange: #e36d35;
        --tr-orange-dark: #c25626;
        --tr-gold: #FFD700;
        --tr-glass: rgba(255, 255, 255, 0.9);
        --tr-shadow: 0 20px 50px rgba(0,0,0,0.15);
      }

      .tr-container {
        max-width: 550px;
        margin: 20px auto;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        perspective: 1000px;
      }

      .tr-card {
        background: var(--tr-glass);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.7);
        border-radius: 28px;
        box-shadow: var(--tr-shadow);
        overflow: hidden;
        transition: transform 0.4s ease;
      }

      .tr-header {
        background: var(--tr-navy);
        padding: 30px;
        color: white;
        position: relative;
      }

      .tr-header::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--tr-orange), var(--tr-gold));
      }

      .tr-badge {
        display: inline-block;
        background: rgba(227, 109, 53, 0.2);
        color: var(--tr-orange);
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        padding: 4px 12px;
        border-radius: 20px;
        margin-bottom: 12px;
      }

      .tr-title { font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
      .tr-title span { color: var(--tr-orange); }

      .tr-progress {
        display: flex;
        gap: 8px;
        margin-top: 20px;
      }

      .tr-dot {
        height: 4px;
        flex: 1;
        background: rgba(255,255,255,0.1);
        border-radius: 2px;
        transition: 0.3s;
      }

      .tr-dot.active { background: var(--tr-orange); }

      .tr-content { padding: 35px; }

      .tr-group { margin-bottom: 24px; }

      .tr-label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--tr-navy);
        margin-bottom: 8px;
        letter-spacing: 0.5px;
        opacity: 0.6;
      }

      .tr-input, .tr-select, .tr-textarea {
        width: 100%;
        padding: 14px 18px;
        border-radius: 14px;
        border: 2px solid #edf2f7;
        background: #f8fafc;
        font-size: 15px;
        font-weight: 600;
        color: var(--tr-navy);
        transition: all 0.2s;
        box-sizing: border-box;
      }

      .tr-input:focus, .tr-select:focus {
        border-color: var(--tr-orange);
        background: #fff;
        box-shadow: 0 0 0 4px rgba(227, 109, 53, 0.1);
        outline: none;
      }

      .tr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

      .tr-btn-main {
        width: 100%;
        background: var(--tr-navy);
        color: white;
        border: none;
        padding: 18px;
        border-radius: 16px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        box-shadow: 0 10px 20px rgba(10, 25, 47, 0.2);
      }

      .tr-btn-main:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 30px rgba(10, 25, 47, 0.3);
      }

      .tr-btn-submit {
        background: linear-gradient(135deg, var(--tr-orange), var(--tr-orange-dark));
        box-shadow: 0 10px 20px rgba(227, 109, 53, 0.3);
      }

      .tr-btn-submit:hover {
        box-shadow: 0 15px 30px rgba(227, 109, 53, 0.4);
      }

      .tr-footer-text {
        text-align: center;
        font-size: 12px;
        color: #94a3b8;
        margin-top: 25px;
        font-weight: 500;
      }

      .tr-success-ui { text-align: center; padding: 60px 20px; }
      .tr-success-icon { 
        width: 60px; height: 60px; background: #def7ec; color: #03543f; 
        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
        margin: 0 auto 20px; font-size: 30px;
      }

      .tr-hidden { display: none !important; }
      
      @media (max-width: 480px) {
        .tr-grid { grid-template-columns: 1fr; }
        .tr-content { padding: 25px; }
      }
    `;
    document.head.appendChild(style);
  },

  renderFormHTML() {
    return `
      <div class="tr-container" data-tr-root>
        <div class="tr-card">
          <div class="tr-header">
            <span class="tr-badge">Dulux Accredited Applicator</span>
            <h2 class="tr-title">Get Expert <span>Quote</span></h2>
            <div class="tr-progress">
              <div class="tr-dot active" data-tr-dot="1"></div>
              <div class="tr-dot" data-tr-dot="2"></div>
            </div>
          </div>

          <form data-tr-form class="tr-content">
            <div data-tr-step="1">
              <div class="tr-group">
                <label class="tr-label">Service Required</label>
                <select name="service" required class="tr-select">
                  <option value="" disabled selected>Select service type...</option>
                  <option>Full Roof Restoration</option>
                  <option>Roof Repairs & Leak Fixes</option>
                  <option>Roof Painting & Sealing</option>
                  <option>Re-Bedding & Pointing</option>
                </select>
              </div>

              <div class="tr-grid">
                <div class="tr-group">
                  <label class="tr-label">Roof Material</label>
                  <select name="material" required class="tr-select">
                    <option value="" disabled selected>Material</option>
                    <option>Cement Tile</option>
                    <option>Terracotta</option>
                    <option>Metal / Colorbond</option>
                  </select>
                </div>
                <div class="tr-group">
                  <label class="tr-label">Storey Level</label>
                  <select name="level" required class="tr-select">
                    <option value="" disabled selected>Height</option>
                    <option>Single Storey</option>
                    <option>Double Storey</option>
                  </select>
                </div>
              </div>

              <div class="tr-group">
                <label class="tr-label">Property Location</label>
                <input type="text" name="suburb" required class="tr-input" placeholder="Enter Suburb (e.g. Ringwood)">
              </div>

              <button type="button" class="tr-btn-main" data-tr-next>
                Continue to Contact
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>

            <div data-tr-step="2" class="tr-hidden">
              <div class="tr-group">
                <label class="tr-label">Your Name</label>
                <input type="text" name="fullName" required class="tr-input" placeholder="Full Name">
              </div>

              <div class="tr-grid">
                <div class="tr-group">
                  <label class="tr-label">Mobile Number</label>
                  <input type="tel" name="phone" required class="tr-input" placeholder="04xx xxx xxx">
                </div>
                <div class="tr-group">
                  <label class="tr-label">Email Address</label>
                  <input type="email" name="email" required class="tr-input" placeholder="name@email.com">
                </div>
              </div>

              <div class="tr-group">
                <label class="tr-label">Project Notes (Optional)</label>
                <textarea name="message" class="tr-textarea" placeholder="Any specific issues like leaks or storm damage?"></textarea>
              </div>

              <input type="text" name="honeypot" class="tr-hidden" tabindex="-1">
              
              <button type="submit" class="tr-btn-main tr-btn-submit" data-tr-submit>
                Confirm Quote Request
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
              
              <button type="button" style="background:none; border:none; color:#64748b; font-size:12px; margin-top:15px; cursor:pointer; font-weight:600; width:100%" data-tr-back>
                Go back to details
              </button>
            </div>

            <p class="tr-footer-text">🛡️ Your data is secure & we respond within 2 hours.</p>
          </form>
        </div>
      </div>
    `;
  },

  async submitToGoogle(rawData) {
    const submissionData = new FormData();
    for (const [key, googleId] of Object.entries(this.config.mapping)) {
      if (rawData.has(key)) {
        submissionData.append(googleId, rawData.get(key));
      }
    }

    // Capture standard tracking
    submissionData.append(this.config.mapping.gclid, new URLSearchParams(window.location.search).get('gclid') || '');
    submissionData.append(this.config.mapping.landing_page, window.location.pathname);
    submissionData.append(this.config.mapping.user_agent, navigator.userAgent);

    try {
      await fetch(this.config.endpoint, { method: "POST", mode: "no-cors", body: submissionData });
      return true;
    } catch (e) { return false; }
  },

  mount(targetEl) {
    if (!targetEl) return;
    this.injectStyles();
    targetEl.innerHTML = this.renderFormHTML();

    const root = targetEl.querySelector("[data-tr-root]");
    const form = targetEl.querySelector("[data-tr-form]");
    const s1 = targetEl.querySelector('[data-tr-step="1"]');
    const s2 = targetEl.querySelector('[data-tr-step="2"]');
    const dots = targetEl.querySelectorAll('[data-tr-dot]');

    targetEl.querySelector("[data-tr-next]").onclick = () => {
      const inputs = s1.querySelectorAll('[required]');
      let valid = true;
      inputs.forEach(i => { if(!i.checkValidity()) { i.reportValidity(); valid = false; } });
      
      if (valid) {
        s1.classList.add("tr-hidden");
        s2.classList.remove("tr-hidden");
        dots[1].classList.add("active");
      }
    };

    targetEl.querySelector("[data-tr-back]").onclick = () => {
      s2.classList.add("tr-hidden");
      s1.classList.remove("tr-hidden");
      dots[1].classList.remove("active");
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = targetEl.querySelector("[data-tr-submit]");
      btn.innerText = "Processing...";
      btn.disabled = true;

      const success = await this.submitToGoogle(new FormData(form));
      
      if (success) {
        root.innerHTML = `
          <div class="tr-card tr-success-ui">
            <div class="tr-success-icon">✓</div>
            <h2 style="color:#0a192f; font-weight:900">Request Received</h2>
            <p style="color:#64748b; line-height:1.6">Thank you for choosing True Roof. Our specialist will review your property and contact you shortly.</p>
          </div>
        `;
      }
    };
  }
};
