/* ============================================
   TRUE ROOF - PREMIUM NATIVE FORM MODULE
   Cleaned & Self-Contained for GitHub Projects
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
      "email":        "entry.1842144469",
      "message":      "entry.1638990837"
    }
  },

  /**
   * Self-contained styles to prevent the "messy" look 
   * if Tailwind or site CSS is missing.
   */
  injectStyles() {
    if (document.getElementById('tr-form-styles')) return;
    const style = document.createElement('style');
    style.id = 'tr-form-styles';
    style.textContent = `
      .tr-form-card { font-family: 'Plus Jakarta Sans', sans-serif; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); overflow: hidden; }
      .tr-input { width: 100%; background: #f8fafc; border: 2px solid #f1f5f9; border-radius: 12px; padding: 12px 16px; font-weight: 600; font-size: 14px; transition: all 0.2s; outline: none; }
      .tr-input:focus { border-color: #e36d35; background: #fff; }
      .tr-btn-next { background: #0a192f; color: #fff; width: 100%; height: 56px; border-radius: 12px; font-weight: 700; font-size: 18px; cursor: pointer; border: none; transition: 0.2s; }
      .tr-btn-next:hover { background: #1a2a44; transform: translateY(-1px); }
      .tr-btn-submit { background: #e36d35; color: #fff; flex: 1; height: 56px; border-radius: 12px; font-weight: 700; font-size: 18px; cursor: pointer; border: none; box-shadow: 0 10px 15px -3px rgba(227, 109, 53, 0.3); }
      .tr-step-dot { px-4 py-1; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
      [x-cloak] { display: none !important; }
    `;
    document.head.appendChild(style);
  },

  renderFormHTML() {
    return `
      <div id="tr-form-wrapper" x-data="trLeadForm()" class="max-w-xl mx-auto p-4">
        <div class="tr-form-card">
          <div class="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 style="margin:0; font-size: 24px; font-weight: 900; color: #0a192f;">Get a Quote</h2>
              <p style="margin:4px 0 0; font-size: 10px; font-weight: 800; color: #e36d35; text-transform: uppercase; letter-spacing: 1px;">Fast 2-Hour Response</p>
            </div>
            <div class="flex gap-2 bg-slate-100 p-1 rounded-full">
               <div :class="step === 1 ? 'bg-[#0a192f] text-white' : 'text-slate-400'" class="px-3 py-1 rounded-full text-[10px] font-bold transition-all">1. Details</div>
               <div :class="step === 2 ? 'bg-[#e36d35] text-white' : 'text-slate-400'" class="px-3 py-1 rounded-full text-[10px] font-bold transition-all">2. Contact</div>
            </div>
          </div>

          <form @submit.prevent="submitForm($event)" class="p-6">
            <div x-show="step === 1" x-ref="step1" class="space-y-4">
              <div class="space-y-1">
                <label style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-left: 4px;">Service</label>
                <select name="service" required class="tr-input">
                  <option value="" disabled selected>Select service...</option>
                  <option>Full Roof Restoration</option>
                  <option>Roof Repairs & Leak Fixes</option>
                  <option>Roof Painting & Sealing</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-3" style="display: grid; grid-template-columns: 1fr 1fr;">
                <select name="material" required class="tr-input"><option value="" disabled selected>Material</option><option>Tile</option><option>Metal</option></select>
                <select name="level" required class="tr-input"><option value="" disabled selected>Height</option><option>Single</option><option>Double</option></select>
              </div>
              <input name="suburb" type="text" placeholder="Suburb (e.g. Ringwood)" required class="tr-input">
              <button type="button" @click="validate()" class="tr-btn-next">Continue →</button>
            </div>

            <div x-show="step === 2" x-cloak class="space-y-4">
              <input name="fullName" type="text" placeholder="Full Name" required class="tr-input">
              <input name="phone" type="tel" placeholder="Mobile Number" required class="tr-input">
              <input name="email" type="email" placeholder="Email Address" required class="tr-input">
              <input type="text" name="honeypot" style="display:none">
              <div class="flex gap-3" style="display: flex; gap: 12px;">
                <button type="button" @click="step = 1" style="width: 56px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer;">←</button>
                <button type="submit" :disabled="loading" class="tr-btn-submit">
                  <span x-show="!loading">Send Request</span>
                  <span x-show="loading">Sending...</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  mount(targetEl) {
    if (!targetEl) return;
    this.injectStyles();
    targetEl.innerHTML = this.renderFormHTML();

    // Init Alpine Logic
    if (typeof Alpine !== 'undefined') {
      Alpine.data('trLeadForm', () => ({
        step: 1, loading: false,
        validate() {
          const inputs = this.$refs.step1.querySelectorAll('[required]');
          let valid = true;
          inputs.forEach(i => { if(!i.checkValidity()) { i.reportValidity(); valid = false; } });
          if(valid) this.step = 2;
        },
        async submitForm(e) {
          this.loading = true;
          const fd = new FormData(e.target);
          if (fd.get('honeypot')) return;

          const params = new URLSearchParams();
          for (const [key, val] of Object.entries(FormAsset.config.mapping)) {
            params.append(val, fd.get(key));
          }

          try {
            await fetch(FormAsset.config.endpoint, { method: "POST", mode: "no-cors", body: params });
            targetEl.innerHTML = `<div style="padding: 60px; text-align: center;"><h2>✅ Success!</h2><p>We'll contact you in 2 hours.</p></div>`;
          } catch (err) { console.error(err); }
        }
      }));
    }
  }
};
