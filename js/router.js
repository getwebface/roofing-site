/* ============================================
   ROUTER MODULE
   Orchestrates page initialization, data fetching, and slot filling
   ============================================ */

import { Weather } from './weather.js';
import { Experiments } from './experiments.js';
import { Tracker } from './tracker.js';
import { FormAsset } from './form-asset.js';

export const Router = {
  // Configuration
  config: {
    sheetsEndpoint: 'https://script.google.com/macros/s/AKfycbwADS3bPMhTMpCn9irmp5ajAqk6EPVfEDpIiH_5FnaX14ttuOf-hysKi4FXK0F_qFWrSg/exec',
    enableSheetsFetch: false, // Set to true when sheets are ready
    fallbackToDefaults: true
  },

  // State
  pageType: null,
  slug: null,
  weatherData: null,
  buckets: null,
  sheetData: null,

  /**
   * Initialize router and orchestrate page setup
   */
  async init() {
    console.log('[Router] Initializing...');
    
    // 1. Detect page type and slug
    this.detectPage();
    
    // 2. Initialize tracker
    Tracker.init({
      webhookUrl: 'https://script.google.com/macros/s/AKfycbwADS3bPMhTMpCn9irmp5ajAqk6EPVfEDpIiH_5FnaX14ttuOf-hysKi4FXK0F_qFWrSg/exec'
    });
    
    // 3. Fetch weather (async, non-blocking)
    this.fetchWeather();
    
    // 4. Assign experiment buckets
    this.assignBuckets();
    
    // 5. Fetch sheet data (async)
    if (this.config.enableSheetsFetch) {
      await this.fetchSheetData();
    }
    
    // 6. Process all sections
    this.processSections();
    
    // 7. Mount forms
    this.mountForms();
    
    console.log('[Router] Initialization complete');
  },

  /**
   * Detect page type and slug from URL
   */
  detectPage() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
      this.pageType = 'home';
      this.slug = 'home';
    } else if (path.includes('/services/')) {
      this.pageType = 'service';
      this.slug = path.split('/services/')[1].replace('.html', '');
    } else if (path.includes('/areas/')) {
      this.pageType = 'local';
      this.slug = path.split('/areas/')[1].replace('.html', '');
    } else {
      this.pageType = 'other';
      this.slug = 'unknown';
    }
    
    console.log('[Router] Page detected:', { pageType: this.pageType, slug: this.slug });
  },

  /**
   * Fetch weather data
   */
  async fetchWeather() {
    try {
      this.weatherData = await Weather.fetch();
      Tracker.setWeatherData(this.weatherData);
      console.log('[Router] Weather fetched:', this.weatherData.derived.mode);
    } catch (error) {
      console.error('[Router] Weather fetch failed:', error);
    }
  },

  /**
   * Assign experiment buckets
   */
  assignBuckets() {
    // Get experiment config from sheet data (if available)
    const experimentConfig = this.sheetData?.experiments || {};
    
    this.buckets = Experiments.assignBuckets(experimentConfig);
    console.log('[Router] Buckets assigned:', this.buckets);
  },

  /**
   * Fetch sheet data
   */
  async fetchSheetData() {
    try {
      const url = `${this.config.sheetsEndpoint}?slug=${this.slug}&pageType=${this.pageType}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Sheets API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate schema
      if (this.validateSheetData(data)) {
        this.sheetData = data;
        console.log('[Router] Sheet data fetched and validated');
      } else {
        throw new Error('Sheet data validation failed');
      }
      
    } catch (error) {
      console.error('[Router] Sheet fetch failed:', error);
      Tracker.logEvent('sheet_fetch_error', { error: error.message });
      
      if (this.config.fallbackToDefaults) {
        console.log('[Router] Falling back to hardcoded defaults');
      }
    }
  },

  /**
   * Validate sheet data schema
   * @param {Object} data - Sheet data
   * @returns {boolean} Valid or not
   */
  validateSheetData(data) {
    if (!data || typeof data !== 'object') {
      console.error('[Router] Invalid data structure');
      return false;
    }
    
    // Check for required fields
    const requiredFields = ['slug', 'pageType'];
    for (const field of requiredFields) {
      if (!data[field]) {
        console.error(`[Router] Missing required field: ${field}`);
        return false;
      }
    }
    
    // Validate sections array
    if (data.sections && !Array.isArray(data.sections)) {
      console.error('[Router] Sections must be an array');
      return false;
    }
    
    // Validate string lengths (prevent XSS/overflow)
    const maxLengths = {
      headline: 200,
      body: 1000,
      cta_text: 100,
      microcopy: 200
    };
    
    if (data.copy) {
      for (const [key, value] of Object.entries(data.copy)) {
        if (typeof value === 'string') {
          const maxLength = maxLengths[key] || 500;
          if (value.length > maxLength) {
            console.error(`[Router] ${key} exceeds max length of ${maxLength}`);
            return false;
          }
        }
      }
    }
    
    // Validate arrays have reasonable caps
    if (data.sections && data.sections.length > 20) {
      console.error('[Router] Too many sections (max 20)');
      return false;
    }
    
    return true;
  },

  /**
   * Process all sections on the page
   */
  processSections() {
    const sections = document.querySelectorAll('[data-section-id]');
    
    sections.forEach(section => {
      const sectionId = section.getAttribute('data-section-id');
      
      // Apply theme token
      this.applyTheme(section);
      
      // Fill slots with copy
      this.fillSlots(section);
      
      // Apply weather-based adjustments
      this.applyWeatherAdjustments(section);
      
      // Register with tracker
      const exposure = Experiments.createExposurePayload(
        this.buckets,
        this.getCopiedApplied(section)
      );
      Tracker.registerSection(section, { exposure });
      Tracker.setExposure(sectionId, exposure);
    });
    
    console.log(`[Router] Processed ${sections.length} sections`);
  },

  /**
   * Apply theme token to section
   * @param {HTMLElement} section - Section element
   */
  applyTheme(section) {
    const themeToken = Experiments.getThemeToken(this.buckets.styleBucket);
    section.setAttribute('data-theme', themeToken);
  },

  /**
   * Fill slots in a section with copy
   * @param {HTMLElement} section - Section element
   */
  fillSlots(section) {
    const sectionId = section.getAttribute('data-section-id');
    const slots = section.querySelectorAll('[data-slot]');
    
    slots.forEach(slot => {
      const slotName = slot.getAttribute('data-slot');
      
      // Get copy from sheet data or keep default
      const copy = this.getCopyForSlot(slotName, sectionId);
      
      if (copy !== null) {
        // Apply copy based on element type
        if (slot.tagName === 'INPUT' || slot.tagName === 'TEXTAREA') {
          slot.placeholder = copy;
        } else if (slot.tagName === 'IMG') {
          slot.alt = copy;
        } else {
          // For most elements, set text content
          // Preserve HTML structure for complex slots
          if (typeof copy === 'string') {
            slot.textContent = copy;
          }
        }
      }
    });
  },

  /**
   * Get copy for a specific slot
   * @param {string} slotName - Slot name
   * @param {string} sectionId - Section ID
   * @returns {string|null} Copy text or null to keep default
   */
  getCopyForSlot(slotName, sectionId) {
    // If no sheet data, keep defaults
    if (!this.sheetData || !this.sheetData.copy) {
      return null;
    }
    
    // Build copy key with context
    const copyKey = Experiments.getCopyKey(
      this.buckets.copyBucket,
      slotName,
      {
        weatherMode: this.weatherData?.derived.mode,
        pageType: this.pageType
      }
    );
    
    // Look up copy in sheet data
    const copy = this.sheetData.copy[copyKey] || this.sheetData.copy[slotName];
    
    return copy || null;
  },

  /**
   * Apply weather-based adjustments
   * @param {HTMLElement} section - Section element
   */
  applyWeatherAdjustments(section) {
    if (!this.weatherData) return;
    
    // Update weather badge
    const wxBadge = section.querySelector('[data-slot="wx_banner_text"]');
    if (wxBadge) {
      const badgeContent = Weather.getBadgeContent(this.weatherData);
      wxBadge.setAttribute('data-mode', this.weatherData.derived.mode);
      
      const iconEl = wxBadge.querySelector('.wx-badge-icon');
      const textEl = wxBadge.querySelector('span:not(.wx-badge-icon)');
      
      if (iconEl) iconEl.textContent = badgeContent.icon;
      if (textEl) textEl.textContent = badgeContent.text;
    }
    
    // Update microcopy if weather override exists
    const microOverride = Weather.getMicroOverride(this.weatherData);
    if (microOverride) {
      const microcopyEl = section.querySelector('[data-slot="microcopy"]');
      if (microcopyEl) {
        microcopyEl.textContent = microOverride;
      }
    }
  },

  /**
   * Mount forms in sections
   */
  mountForms() {
    const formMounts = document.querySelectorAll('[data-slot="lead_form_mount"]');
    
    formMounts.forEach(mount => {
      const formKey = mount.getAttribute('data-form-key') || 'lead_default';
      
      // Determine which form to show based on weather
      let actualFormKey = formKey;
      if (this.weatherData?.derived.mode === 'storm') {
        actualFormKey = 'lead_storm';
      }
      
      // Mount the form
      FormAsset.mount(mount, actualFormKey);
    });
    
    console.log(`[Router] Mounted ${formMounts.length} forms`);
  },

  /**
   * Get copy that was actually applied to a section
   * @param {HTMLElement} section - Section element
   * @returns {Object} Applied copy snapshot
   */
  getCopiedApplied(section) {
    const applied = {};
    const slots = section.querySelectorAll('[data-slot]');
    
    slots.forEach(slot => {
      const slotName = slot.getAttribute('data-slot');
      applied[slotName] = slot.textContent?.substring(0, 100) || null;
    });
    
    return applied;
  },

  /**
   * Get debug information
   * @returns {Object} Debug info
   */
  getDebugInfo() {
    return {
      pageType: this.pageType,
      slug: this.slug,
      buckets: this.buckets,
      weatherMode: this.weatherData?.derived.mode,
      sheetDataLoaded: !!this.sheetData,
      sectionsRegistered: Tracker.sectionSensors.size
    };
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.Router = Router;
}
