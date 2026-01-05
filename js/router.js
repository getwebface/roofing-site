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
    webhookUrl: "/t",
    abCookieName: 'ab_variant'
  },

  // State
  pageType: null,
  slug: null,
  weatherData: null,
  buckets: null,
  sheetData: null,
  isHydrated: false,

  /**
   * Initialize router for A/B testing and client-side features
   */
  async init() {
    // 1. Parse initial data embedded by Worker
    this.parseInitialData();
    
    // 2. Initialize tracker
    window.Tracker.init({
      webhookUrl: this.config.webhookUrl
    });
    
    // 3. Fetch weather (async, non-blocking)
    await this.fetchWeather();
    
    // 4. Assign experiment buckets
    this.assignBuckets();
    
    // 5. Apply A/B variant if needed
    this.applyABVariant();
    
    // 6. Mount forms
    this.mountForms();
    
    // 7. Register sections with tracker
    this.registerSections();

    // 8. Initialize Map if on local page
    if (this.pageType === 'local') {
      this.initMap();
    }
    
    console.log('[Router] Initialization complete');
  },

  /**
   * Parse initial data embedded by Worker
   */
  parseInitialData() {
    const initialDataEl = document.getElementById('__INITIAL_DATA__');
    if (initialDataEl) {
      try {
        this.sheetData = JSON.parse(initialDataEl.textContent);
        this.pageType = this.sheetData.actualPageType || this.sheetData.pageType;
        this.slug = this.sheetData.slug;
        this.isHydrated = true;
      } catch (error) {
        console.error('[Router] Failed to parse initial data:', error);
        this.detectPageFallback();
      }
    } else {
      this.detectPageFallback();
    }
  },

  /**
   * Fallback page detection if no initial data
   */
  detectPageFallback() {
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
  },

  /**
   * Fetch weather data
   */
  async fetchWeather() {
    try {
      this.weatherData = await Weather.fetch();
      window.Tracker.setWeatherData(this.weatherData);
      
      // Apply weather mode to body for CSS targeting
      if (this.weatherData?.derived?.mode) {
        document.body.setAttribute('data-weather', this.weatherData.derived.mode);
        
        // Hydrate weather badge with actual content
        this.hydrateWeatherBadge();
        
        // Apply weather-based backgrounds
        this.applyWeatherBackgrounds();
        
        // Apply weather overlay effect on local hero
        this.applyWeatherOverlay();
      }
    } catch (error) {
      console.error('[Router] Weather fetch failed:', error);
    }
  },

  /**
   * Hydrate weather badge with live data
   */
  hydrateWeatherBadge() {
    const badge = Weather.getBadgeContent(this.weatherData);
    const wxBadgeElements = document.querySelectorAll('[data-slot="wx_banner_text"]');
    
    wxBadgeElements.forEach(el => {
      el.innerHTML = `<span class="wx-icon">${badge.icon}</span> ${badge.text}`;
      el.closest('.wx-badge')?.setAttribute('data-mode', this.weatherData.derived.mode);
    });
    
    // Also update microcopy if weather override exists
    const microOverride = Weather.getMicroOverride(this.weatherData);
    if (microOverride) {
      const microElements = document.querySelectorAll('[data-slot="microcopy"]');
      microElements.forEach(el => {
        el.textContent = microOverride;
      });
    }
  },

  /**
   * Apply weather-based background images
   */
  applyWeatherBackgrounds() {
    const mode = this.weatherData?.derived?.mode || 'calm';
    const bgSlot = `bg_${mode}`;
    
    // Find elements with weather background slots
    const weatherBgElements = document.querySelectorAll('[data-bg-set="true"]');
    
    weatherBgElements.forEach(el => {
      // Check if we have sheet data with the weather-specific background
      if (this.sheetData?.copy?.[bgSlot]) {
        el.style.backgroundImage = `url('${this.sheetData.copy[bgSlot]}')`;
      }
    });
  },

  /**
   * Apply weather overlay effect on local hero
   */
  applyWeatherOverlay() {
    const mode = this.weatherData?.derived?.mode || 'none';
    const overlays = document.querySelectorAll('.weather-overlay');
    
    overlays.forEach(overlay => {
      overlay.setAttribute('data-weather-effect', mode);
    });
  },

  /**
   * Initialize Leaflet Map
   */
  initMap() {
    try {
      const mapContainer = document.getElementById('map-container');
      if (!mapContainer || !window.L) return;

      const slug = this.slug;
      if (!slug) return;

      const suburbName = slug.charAt(0).toUpperCase() + slug.slice(1);
      const query = `${suburbName}, Melbourne, Australia`;

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(results => {
          if (results && results.length > 0) {
            const lat = parseFloat(results[0].lat);
            const lon = parseFloat(results[0].lon);

            const map = L.map('map-container').setView([lat, lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            L.marker([lat, lon]).addTo(map)
              .bindPopup(`<b>${suburbName}</b><br>Melbourne Roof Repairs`)
              .openPopup();
          } else {
            // Fallback to Melbourne CBD if no results
            this.fallbackMap();
          }
        })
        .catch(err => {
          console.error('Map geocoding failed:', err);
          this.fallbackMap();
        });
    } catch (error) {
      console.error('Map initialization error:', error);
      this.fallbackMap();
    }
  },

  fallbackMap() {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer && window.L) {
      const map = L.map('map-container').setView([-37.8136, 144.9631], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
  },

  /**
   * Assign experiment buckets
   */
  assignBuckets() {
    // Get experiment config from sheet data (if available)
    const experimentConfig = this.sheetData?.experiments || {};

    this.buckets = Experiments.assignBuckets(experimentConfig);
  },

  /**
   * Apply A/B variant from URL or cookie
   */
  applyABVariant() {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const urlVariant = urlParams.get('v');
    
    // Check cookie
    const cookieVariant = this.getCookie(this.config.abCookieName);
    
    const variant = urlVariant || cookieVariant;
    
    if (variant === 'B') {
      // Set cookie for future visits
      this.setCookie(this.config.abCookieName, 'B', 7); // 7 days

      // Apply variant swaps
      this.swapVariants();
    } else if (variant === 'A') {
      this.setCookie(this.config.abCookieName, 'A', 7);
    } else {
      // No variant specified, use default (A)
    }
  },

  /**
   * Swap A/B variants in the DOM
   */
  swapVariants() {
    if (!this.sheetData || !this.sheetData.copy) return;
    
    const copy = this.sheetData.copy;
    
    // Look for variantB keys and swap them with base keys
    Object.keys(copy).forEach(key => {
      if (key.endsWith('_variantB')) {
        const baseKey = key.replace('_variantB', '');
        const elements = document.querySelectorAll(`[data-slot="${baseKey}"]`);
        
        elements.forEach(el => {
          const tag = el.tagName.toLowerCase();
          if (tag === 'img') {
            el.setAttribute('src', copy[key]);
          } else if (tag === 'a') {
            el.setAttribute('href', copy[key]);
          } else {
            el.textContent = copy[key];
          }
        });
      }
    });
  },

  /**
   * Register sections with tracker
   */
  registerSections() {
    const sections = document.querySelectorAll('[data-section-id]');
    
    sections.forEach(section => {
      const sectionId = section.getAttribute('data-section-id');
      
      // Apply theme token
      this.applyTheme(section);
      
      // Register with tracker
      const exposure = Experiments.createExposurePayload(
        this.buckets,
        this.getCopiedApplied(section)
      );
      window.Tracker.registerSection(section, { exposure });
      window.Tracker.setExposure(sectionId, exposure);
    });
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
  },

  /**
   * Get cookie value
   */
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  },

  /**
   * Set cookie value
   */
  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.Router = Router;
}
