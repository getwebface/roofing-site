/* ============================================
   ROUTER MODULE
   Orchestrates page initialization, data fetching, and slot filling
   ============================================ */

import { Weather } from './weather.js';
import { Experiments } from './experiments.js';
import { FormAsset } from './form-asset.js';
import { Schema } from './schema.js';

export const Router = {
  // Configuration
  config: {
    sheetsEndpoint: 'https://script.google.com/macros/s/AKfycbwADS3bPMhTMpCn9irmp5ajAqk6EPVfEDpIiH_5FnaX14ttuOf-hysKi4FXK0F_qFWrSg/exec',
    enableSheetsFetch: false, // Set to true when sheets are ready
    fallbackToDefaults: true,
    cacheKey: 'trueroof_sheet_cache',
    cacheTTL: 300000 // 5 minutes
  },

  // State
  pageType: null,
  slug: null,
  weatherData: null,
  buckets: null,
  sheetData: null,
  isHydrated: false,

  /**
   * Initialize router and orchestrate page setup
   */
  async init() {
    console.log('[Router] Initializing...');
    
    // 1. Detect page type and slug
    this.detectPage();
    
    // 2. Initialize tracker
    window.Tracker.init({
      webhookUrl: "/t"
    });
    
    // 3. Fetch weather (async, non-blocking)
    this.fetchWeather();
    
    // 4. Assign experiment buckets
    this.assignBuckets();
    
    // 5. OPTIMISTIC HYDRATION: Load from cache immediately
    this.hydrateFromCache();
    
    // 6. Process all sections with cached/default data
    this.processSections();
    
    // 7. Mount forms
    this.mountForms();
    
    // 8. Fetch fresh sheet data in background (async)
    if (this.config.enableSheetsFetch) {
      this.fetchSheetData().then(() => {
        if (this.sheetData) {
          this.patchWithFreshData();
        }
      });
    }
    
    console.log('[Router] Initialization complete (optimistic)');
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
      window.Tracker.setWeatherData(this.weatherData);
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
   * Hydrate from localStorage cache (instant)
   */
  hydrateFromCache() {
    try {
      const cached = localStorage.getItem(this.config.cacheKey);
      if (!cached) {
        console.log('[Router] No cache found, using defaults');
        return;
      }
      
      const { data, timestamp, slug } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      
      // Check if cache is valid and matches current page
      if (age < this.config.cacheTTL && slug === this.slug) {
        this.sheetData = data;
        this.isHydrated = true;
        console.log('[Router] Hydrated from cache', { age: Math.round(age / 1000) + 's' });
      } else {
        console.log('[Router] Cache expired or slug mismatch');
        localStorage.removeItem(this.config.cacheKey);
      }
    } catch (error) {
      console.error('[Router] Cache hydration failed:', error);
      localStorage.removeItem(this.config.cacheKey);
    }
  },

  /**
   * Fetch sheet data (background)
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
        
        // Cache the fresh data
        this.cacheSheetData(data);
        
        console.log('[Router] Sheet data fetched and validated');
      } else {
        throw new Error('Sheet data validation failed');
      }
      
    } catch (error) {
      console.error('[Router] Sheet fetch failed:', error);
      window.Tracker.logEvent('sheet_fetch_error', { error: error.message });
      
      if (this.config.fallbackToDefaults) {
        console.log('[Router] Falling back to hardcoded defaults');
      }
    }
  },

  /**
   * Cache sheet data to localStorage
   * @param {Object} data - Sheet data to cache
   */
  cacheSheetData(data) {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        slug: this.slug,
        version: '1.0'
      };
      
      localStorage.setItem(this.config.cacheKey, JSON.stringify(cacheEntry));
      console.log('[Router] Sheet data cached');
    } catch (error) {
      console.error('[Router] Failed to cache data:', error);
      // Quota exceeded - clear old cache
      localStorage.removeItem(this.config.cacheKey);
    }
  },

  /**
   * Patch slots with fresh data (silent update)
   */
  patchWithFreshData() {
    console.log('[Router] Patching with fresh data...');
    
    const sections = document.querySelectorAll('[data-section-id]');
    
    sections.forEach(section => {
      // Re-fill slots with fresh data
      this.fillSlots(section);
      
      // Re-apply weather adjustments
      this.applyWeatherAdjustments(section);
    });
    
    console.log('[Router] Patch complete');
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
      window.Tracker.registerSection(section, { exposure });
      window.Tracker.setExposure(sectionId, exposure);
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
      const slotType = slot.getAttribute('data-slot-type');
      
      // Get copy from sheet data or keep default
      const copy = this.getCopyForSlot(slotName, sectionId);
      
      if (copy !== null) {
        // Handle different slot types
        if (slotType === 'rich' || Schema.isRichSlot(slotName)) {
          this.fillRichSlot(slot, copy);
        } else if (slotType === 'image' || Schema.isMediaSlot(slotName)) {
          this.fillMediaSlot(slot, copy);
        } else if (slotType === 'json-list' || Schema.isJsonSlot(slotName)) {
          this.fillJsonSlot(slot, copy);
        } else if (slotType === 'background') {
          this.fillBackgroundSlot(slot, copy);
        } else {
          // Standard text slot
          this.fillTextSlot(slot, copy);
        }
      }
    });
  },

  /**
   * Fill standard text slot
   * @param {HTMLElement} slot - Slot element
   * @param {string} copy - Copy text
   */
  fillTextSlot(slot, copy) {
    if (slot.tagName === 'INPUT' || slot.tagName === 'TEXTAREA') {
      slot.placeholder = copy;
    } else if (slot.tagName === 'IMG') {
      slot.alt = copy;
    } else {
      slot.textContent = copy;
    }
  },

  /**
   * Fill rich HTML slot (innerHTML with sanitization)
   * @param {HTMLElement} slot - Slot element
   * @param {string} html - HTML content
   */
  fillRichSlot(slot, html) {
    const sanitized = Schema.sanitizeRichHTML(html);
    slot.innerHTML = sanitized;
  },

  /**
   * Fill media slot (images/videos)
   * @param {HTMLElement} slot - Slot element
   * @param {string} url - Media URL
   */
  fillMediaSlot(slot, url) {
    if (!Schema.isValidUrl(url)) {
      console.warn('[Router] Invalid media URL:', url);
      return;
    }

    if (slot.tagName === 'IMG') {
      slot.src = url;
      slot.loading = 'lazy';
    } else if (slot.tagName === 'VIDEO') {
      slot.src = url;
    } else if (slot.tagName === 'SOURCE') {
      slot.src = url;
    } else {
      // For div backgrounds
      slot.style.backgroundImage = `url('${url}')`;
    }
  },

  /**
   * Fill JSON list slot (render array as HTML)
   * @param {HTMLElement} slot - Slot element
   * @param {string} jsonString - JSON array string
   */
  fillJsonSlot(slot, jsonString) {
    const items = Schema.parseJsonSlot(jsonString);
    if (!items) return;

    // Render as list
    const ul = document.createElement('ul');
    ul.className = 'benefit-list';
    
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = Schema.sanitizeString(item, 'default');
      ul.appendChild(li);
    });
    
    slot.innerHTML = '';
    slot.appendChild(ul);
  },

  /**
   * Fill background slot (weather-aware)
   * @param {HTMLElement} slot - Slot element
   * @param {string} url - Background URL
   */
  fillBackgroundSlot(slot, url) {
    if (!Schema.isValidUrl(url)) {
      console.warn('[Router] Invalid background URL:', url);
      return;
    }

    const weatherMode = this.weatherData?.derived.mode || 'calm';
    const bgSlotName = `bg_${weatherMode}`;
    
    // Only apply if matches current weather
    if (slot.getAttribute('data-slot') === bgSlotName) {
      slot.style.backgroundImage = `url('${url}')`;
      slot.style.backgroundSize = 'cover';
      slot.style.backgroundPosition = 'center';
    }
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
      sectionsRegistered: window.Tracker.sectionSensors.size
    };
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.Router = Router;
}
