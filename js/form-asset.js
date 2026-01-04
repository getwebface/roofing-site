/* ============================================
   PREMIUM NATIVE FORM ASSET MODULE
   Replaces Iframe embed with high-performance multi-step form
   ============================================ */

export const FormAsset = {
  // Field Mappings for your specific Google Form
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
   * Renders the HTML structure for the multi-step form
   */
  renderFormHTML() {
    return `
      <div id="true-roof-form" x-data="leadForm()" class="w-full max-w-xl mx-auto">
        <div class="relative bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden p-8">
          
          <div class="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
            <div>
              <h2 class="text-2xl font-black text-[#0a192f] tracking-tight leading-none">Get a Price.</h2>
              <p class="text-[10px] font-extrabold uppercase tracking-widest text-[#e36d35] mt-2 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Fast Estimate
              </p>
            </div>
            <div class="flex bg-slate-100 p-1 rounded-full">
               <div class="px-4 py-1 rounded-full text-[10px] font-bold transition-all" :class="step === 1 ? 'bg-[#0a192f] text-white shadow-lg' : 'text-slate-400'">1. Details</div>
               <div class="px-4 py-1 rounded-full text-[10px] font-bold transition-all" :class="step === 2 ? 'bg-[#e36d35] text-white shadow-lg' : 'text-slate-400'">2. Contact</div>
            </div>
          </div>

          <form @submit.prevent="submitForm($event)" class="space-y-4">
            <div x-show="step === 1" x-ref="step1" x-transition:enter="transition ease-out duration-300">
              <div class="grid grid-cols-1 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Service Required</label>
                  <select name="service" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-[#e36d35] font-bold text-sm">
                    <option value="" disabled selected>Select service...</option>
                    <option>Full Roof Restoration</option>
                    <option>Roof Repairs & Leak Fixes</option>
                    <option>Roof Painting & Sealing</option>
                    <option>Re-Bedding & Pointing</option>
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <select name="material" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-[#e36d35] font-bold text-sm">
                    <option value="" disabled selected>Material</option>
                    <option>Cement Tile</option>
                    <option>Terracotta</option>
                    <option>Metal/Colorbond</option>
                  </select>
                  <select name="level" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-[#e36d35] font-bold text-sm">
                    <option value="" disabled selected>Storey</option>
                    <option>Single Storey</option>
                    <option>Double Storey</option>
                  </select>
                </div>
                <input name="suburb" type="text" placeholder="Suburb (e.g. Ringwood)" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-[#e36d35] font-bold text-sm">
              </div>
              <button type="button" @click="validateStep1()" class="w-full bg-[#0a192f] text-white h-14 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all mt-6 shadow-xl">Next Step →</button>
            </div>

            <div x-show="step === 2" x-cloak x-transition:enter="transition ease-out duration-300">
              <div class="space-y-4">
                <input name="fullName" type="text" placeholder="Full Name" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-[#e36d35] font-bold text-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="phone" type="tel" placeholder="Mobile Number" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-[#e36d35] font-bold text-sm">
                  <input name="email" type="email" placeholder="Email Address" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-[#e36d35] font-bold text-sm">
                </div>
                <textarea name="message" placeholder="Additional details (optional)" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-[#e36d35] font-bold text-sm h-24"></textarea>
                <input type="text" name="honeypot" style="display:none" tabindex="-1">
              </div>
              <div class="flex gap-3 mt-6">
                <button type="button" @click="step = 1" class="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-slate-100 text-slate-400 hover:text-[#e36d35]">←</button>
                <button type="submit" :disabled="isLoading" class="flex-1 bg-[#e36d35] text-white h-14 rounded-xl font-bold text-lg hover:bg-[#c25626] transition-all shadow-lg shadow-orange-500/30">
                  <span x-show="!isLoading">Get My Free Quote</span>
                  <span x-show="isLoading" class="flex items-center justify-center gap-2">
                     <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  /**
   * Mounts the native form into the target element
   */
  mount(targetEl) {
    if (!targetEl) return;
    
    targetEl.innerHTML = this.renderFormHTML();

    // Initialize Alpine Logic if not already handled by parent
    if (!window.leadFormInitialized) {
      document.addEventListener('alpine:init', () => {
        Alpine.data('leadForm', () => ({
          step: 1,
          isLoading: false,
          validateStep1() {
            const inputs = this.$refs.step1.querySelectorAll('[required]');
            let valid = true;
            inputs.forEach(el => { if (!el.checkValidity()) { el.reportValidity(); valid = false; } });
            if (valid) this.step = 2;
          },
          async submitForm(event) {
            this.isLoading = true;
            const formData = new FormData(event.target);
            
            // Honeypot check
            if (formData.get('honeypot')) return;

            const submissionData = new URLSearchParams();
            for (const [key, googleId] of Object.entries(FormAsset.config.mapping)) {
              if (formData.has(key)) submissionData.append(googleId, formData.get(key));
            }

            try {
              await fetch(FormAsset.config.endpoint, {
                method: "POST",
                mode: "no-cors",
                body: submissionData
              });
              
              targetEl.innerHTML = `
                <div class="text-center p-12 bg-white rounded-[2rem] shadow-2xl border border-slate-200">
                  <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 class="text-3xl font-black text-[#0a192f]">Quote Sent!</h3>
                  <p class="text-slate-500 mt-4">We'll respond within 2 hours.</p>
                </div>
              `;
            } catch (err) {
              console.error("Submission failed", err);
            } finally {
              this.isLoading = false;
            }
          }
        }));
      });
      window.leadFormInitialized = true;
    }
  }
};
