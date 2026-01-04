/* ============================================
   TRUE ROOF - RE-ENGINEERED FORM ASSET
   Fixes: Initialization timing & Step progression
   ============================================ */

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
      "email":        "entry.1842144469"
    }
  },

  // Self-contained styling to ensure layout integrity
  injectStyles() {
    if (document.getElementById('tr-form-styles')) return;
    const style = document.createElement('style');
    style.id = 'tr-form-styles';
    style.textContent = `
      #tr-form-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; color: #0a192f; }
      .tr-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; }
      .tr-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
      .tr-body { padding: 24px; }
      .tr-field { margin-bottom: 16px; }
      .tr-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; color: #64748b; }
      .tr-input { width: 100%; padding: 12px; border: 2px solid #f1f5f9; border-radius: 10px; font-weight: 600; outline: none; transition: 0.2s; box-sizing: border-box; }
      .tr-input:focus { border-color: #e36d35; }
      .tr-btn-main { background: #0a192f; color: #fff; border: none; padding: 16px; border-radius: 12px; font-weight: 700; font-size: 16px; width: 100%; cursor: pointer; transition: 0.2s; }
      .tr-btn-main:hover { background: #1a2a44; }
      .tr-btn-submit { background: #e36d35; flex: 1; }
      .tr-btn-submit:hover { background: #c25626; }
      [x-cloak] { display: none !important; }
    `;
    document.head.appendChild(style);
  },

  mount(targetEl) {
    if (!targetEl) return;
    this.injectStyles();

    // 1. Define the HTML
    targetEl.innerHTML = `
      <div id="tr-form-wrapper" x-data="trLeadForm()" x-cloak>
        <div class="tr-card">
          <div class="tr-header">
            <div>
              <h3 style="margin:0; font-size: 20px; font-weight: 800;">Get a Quote</h3>
              <p style="margin:0; font-size: 10px; color: #e36d35; font-weight: 700;">MELBOURNE ROOFING EXPERTS</p>
            </div>
            <div style="background: #f1f5f9; padding: 4px; border-radius: 20px; display: flex; gap: 4px;">
              <span :style="step === 1 ? 'background:#0a192f; color:#fff' : 'color:#94a3b8'" style="padding: 4px 12px; border-radius: 15px; font-size: 10px; font-weight: 700;">1. Details</span>
              <span :style="step === 2 ? 'background:#e36d35; color:#fff' : 'color:#94a3b8'" style="padding: 4px 12px; border-radius: 15px; font-size: 10px; font-weight: 700;">2. Contact</span>
            </div>
          </div>

          <form @submit.prevent="submitForm($event)" class="tr-body">
            <div x-show="step === 1" x-ref="step1">
              <div class="tr-field">
                <label class="tr-label">Service</label>
                <select name="service" required class="tr-input">
                  <option value="" selected disabled>Select a service...</option>
                  <option>Full Roof Restoration</option>
                  <option>Roof Repairs & Leak Fixes</option>
                  <option>Roof Painting</option>
                </select>
              </div>
              <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                <div style="flex: 1;">
                  <label class="tr-label">Material</label>
                  <select name="material" required class="tr-input">
                    <option>Tile</option>
                    <option>Metal</option>
                  </select>
                </div>
                <div style="flex: 1;">
                  <label class="tr-label">Height</label>
                  <select name="level" required class="tr-input">
                    <option>Single Storey</option>
                    <option>Double Storey</option>
                  </select>
                </div>
              </div>
              <div class="tr-field">
                <label class="tr-label">Suburb</label>
                <input name="suburb" type="text" placeholder="e.g. Ringwood" required class="tr-input">
              </div>
              <button type="button" @click="validateStep()" class="tr-btn-main">Continue to Contact</button>
            </div>

            <div x-show="step === 2">
              <div class="tr-field"><label class="tr-label">Name</label><input name="fullName" type="text" required class="tr-input"></div>
              <div class="tr-field"><label class="tr-label">Phone</label><input name="phone" type="tel" required class="tr-input"></div>
              <div class="tr-field"><label class="tr-label">Email</label><input name="email" type="email" required class="tr-input"></div>
              <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button type="button" @click="step = 1" style="width: 50px; background: #f1f5f9; border: none; border-radius: 10px; cursor: pointer;">←</button>
                <button type="submit" class="tr-btn-main tr-btn-submit" :disabled="loading">
                  <span x-show="!loading">Get Free Quote</span>
                  <span x-show="loading">Sending...</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    // 2. Register Component & Force Initialize
    if (typeof Alpine !== 'undefined') {
      Alpine.data('trLeadForm', () => ({
        step: 1,
        loading: false,
        validateStep() {
          const fields = this.$refs.step1.querySelectorAll('[required]');
          let valid = true;
          fields.forEach(f => { if(!f.checkValidity()) { f.reportValidity(); valid = false; } });
          if(valid) this.step = 2;
        },
        async submitForm(e) {
          this.loading = true;
          const fd = new FormData(e.target);
          const params = new URLSearchParams();
          for (const [key, val] of Object.entries(FormAsset.config.mapping)) {
            params.append(val, fd.get(key));
          }
          try {
            await fetch(FormAsset.config.endpoint, { method: "POST", mode: "no-cors", body: params });
            targetEl.innerHTML = `<div style="text-align:center; padding: 40px;"><h3>✅ Sent!</h3><p>Talk soon.</p></div>`;
          } catch (err) { console.error(err); this.loading = false; }
        }
      }));

      // This is the "Magic" line that makes the buttons work after mounting
      Alpine.initTree(targetEl); 
    }
  }
};
