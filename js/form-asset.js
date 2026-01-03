/* ============================================
   FORM ASSET MODULE
   Handles Google Form embed mounting
   ============================================ */

export const FormAsset = {
  // Form configurations (Google Form embed URLs)
  forms: {
    lead_default: {
      embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfA3rKzlgI0-53nK4yXU7l78tlOzQbJ7aTvopgDlOS3JaIEZg/viewform?embedded=true',
      height: '600px',
      title: 'Request Free Inspection'
    },
    // Add more form variants as needed
    lead_storm: {
      embedUrl: '<https://docs.google.com/forms/d/e/1FAIpQLSfA3rKzlgI0-53nK4yXU7l78tlOzQbJ7aTvopgDlOS3JaIEZg/viewform?embedded=true',
      height: '600px',
      title: 'Emergency Storm Damage Assessment'
    }
  },

  /**
   * Render a placeholder skeleton while form loads
   * @returns {string} HTML string for placeholder
   */
  renderPlaceholder() {
    return `
      <div class="form-placeholder" data-loading="true">
        <div class="form-placeholder-header">
          <div class="form-placeholder-title"></div>
          <div class="form-placeholder-subtitle"></div>
        </div>
        <div class="form-placeholder-field"></div>
        <div class="form-placeholder-field"></div>
        <div class="form-placeholder-field"></div>
        <div class="form-placeholder-button"></div>
        <style>
          .form-placeholder {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            min-height: 400px;
          }
          .form-placeholder[data-loading="true"] .form-placeholder-title,
          .form-placeholder[data-loading="true"] .form-placeholder-subtitle,
          .form-placeholder[data-loading="true"] .form-placeholder-field,
          .form-placeholder[data-loading="true"] .form-placeholder-button {
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: var(--radius-sm);
          }
          .form-placeholder-header {
            margin-bottom: var(--space-xl);
          }
          .form-placeholder-title {
            height: 32px;
            width: 60%;
            margin-bottom: var(--space-md);
          }
          .form-placeholder-subtitle {
            height: 20px;
            width: 80%;
          }
          .form-placeholder-field {
            height: 48px;
            margin-bottom: var(--space-md);
          }
          .form-placeholder-button {
            height: 48px;
            width: 200px;
            margin-top: var(--space-lg);
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        </style>
      </div>
    `;
  },

  /**
   * Mount a Google Form iframe into target element
   * @param {HTMLElement} targetEl - Element to mount form into
   * @param {string} formKey - Key from forms config (e.g., 'lead_default')
   * @param {Object} options - Additional options
   */
  mount(targetEl, formKey = 'lead_default', options = {}) {
    if (!targetEl) {
      console.error('[FormAsset] Target element not found');
      return;
    }

    const formConfig = this.forms[formKey];
    if (!formConfig) {
      console.error(`[FormAsset] Form config not found for key: ${formKey}`);
      targetEl.innerHTML = `
        <div class="form-error">
          <p>Form configuration error. Please contact us directly.</p>
        </div>
      `;
      return;
    }

    // Show placeholder first
    targetEl.innerHTML = this.renderPlaceholder();

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = formConfig.embedUrl;
    iframe.width = '100%';
    iframe.height = options.height || formConfig.height;
    iframe.frameBorder = '0';
    iframe.marginHeight = '0';
    iframe.marginWidth = '0';
    iframe.title = formConfig.title;
    iframe.style.border = 'none';
    iframe.style.borderRadius = 'var(--radius-lg)';
    iframe.style.background = 'white';

    // Add loading handler
    iframe.addEventListener('load', () => {
      // Replace placeholder with iframe after load
      targetEl.innerHTML = '';
      targetEl.appendChild(iframe);
      
      // Track form exposure
      if (window.Tracker) {
        window.Tracker.logEvent('form_mounted', {
          formKey,
          timestamp: Date.now()
        });
      }
    });

    // Add error handler
    iframe.addEventListener('error', () => {
      console.error('[FormAsset] Failed to load form iframe');
      targetEl.innerHTML = `
        <div class="form-error">
          <p>Unable to load form. Please try refreshing the page or contact us directly.</p>
        </div>
      `;
      
      if (window.Tracker) {
        window.Tracker.logEvent('form_load_error', {
          formKey,
          timestamp: Date.now()
        });
      }
    });

    // Set a timeout to replace placeholder even if load event doesn't fire
    setTimeout(() => {
      if (targetEl.querySelector('.form-placeholder')) {
        targetEl.innerHTML = '';
        targetEl.appendChild(iframe);
      }
    }, 3000);
  },

  /**
   * Render a simple CTA button as fallback (no form)
   * @param {HTMLElement} targetEl - Element to mount CTA into
   * @param {Object} options - CTA options
   */
  renderCTA(targetEl, options = {}) {
    const {
      text = 'Request Free Inspection',
      phone = '1300 ROOFING',
      href = 'tel:1300766346'
    } = options;

    targetEl.innerHTML = `
      <div class="form-cta-fallback">
        <h3>${text}</h3>
        <p>Call us now for immediate assistance</p>
        <a href="${href}" class="btn btn-primary btn-large" data-goal="cta-phone">
          📞 ${phone}
        </a>
      </div>
      <style>
        .form-cta-fallback {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: var(--space-2xl);
          text-align: center;
        }
        .form-cta-fallback h3 {
          color: white;
          margin-bottom: var(--space-md);
        }
        .form-cta-fallback p {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: var(--space-xl);
        }
      </style>
    `;
  }
};

// Make available globally for router
if (typeof window !== 'undefined') {
  window.FormAsset = FormAsset;
}
