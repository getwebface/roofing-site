/* ============================================
   TRACKER MODULE
   Comprehensive telemetry with section sensors
   ============================================ */

 const Tracker = {
  config: {
    webhookUrl: "/t",
    eventQueueMaxSize: 60,
    idleThreshold: 1200,
    rageClickThreshold: 3,
    rageClickWindow: 1000,
    flybyVelocityThreshold: 1800,
    visibilityThreshold: 0.5
  },

  // State
  sessionId: null,
  eventQueue: [],
  sectionSensors: new Map(),
  weatherData: null,
  pageContext: null,
  
  // Telemetry buffer (Phase 1: Optimization)
  pendingPayloads: [],
  sendInterval: null,
  
  // Observers
  intersectionObserver: null,
  
  /**
   * Initialize tracker
   * @param {Object} options - Configuration options
   */
  init(options = {}) {
    this.config = { ...this.config, ...options };
    this.sessionId = this.generateSessionId();
    this.pageContext = this.capturePageContext();
    
    // Set up global error handlers
    this.setupErrorHandlers();
    
    // Set up page exit handlers
    this.setupExitHandlers();
    
    // Set up intersection observer
    this.setupIntersectionObserver();
    
    // Start telemetry send interval (30 seconds)
    this.startSendInterval();
    
  },

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  },

  /**
   * Capture page context (Group 1: Meta + Page Context)
   * @returns {Object} Page context
   */
  capturePageContext() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      pageUrl: window.location.href,
      pagePath: window.location.pathname,
      referrer: document.referrer || null,
      utmSource: params.get('utm_source') || null,
      utmMedium: params.get('utm_medium') || null,
      utmCampaign: params.get('utm_campaign') || null,
      utmContent: params.get('utm_content') || null,
      utmTerm: params.get('utm_term') || null,
      pageType: this.detectPageType(),
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };
  },

  /**
   * Detect page type from URL
   * @returns {string} Page type
   */
  detectPageType() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') return 'home';
    if (path.includes('/services/')) return 'service';
    if (path.includes('/areas/')) return 'local';
    return 'other';
  },

  /**
   * Register a section for tracking
   * @param {HTMLElement} sectionEl - Section element
   * @param {Object} config - Section configuration
   */
  registerSection(sectionEl, config = {}) {
    const sectionId = sectionEl.getAttribute('data-section-id');
    
    if (!sectionId) {
      return;
    }

    if (this.sectionSensors.has(sectionId)) {
      return;
    }

    // Create sensor
    const sensor = this.createSensor(sectionEl, config);
    this.sectionSensors.set(sectionId, sensor);
    
    // Start observing
    this.intersectionObserver.observe(sectionEl);
  },

  /**
   * Create sensor for a section
   * @param {HTMLElement} sectionEl - Section element
   * @param {Object} config - Section configuration
   * @returns {Object} Sensor object
   */
  createSensor(sectionEl, config) {
    const sectionId = sectionEl.getAttribute('data-section-id');
    
    const sensor = {
      sectionId,
      element: sectionEl,
      config,
      
      // Visibility tracking (Group 4)
      isVisible: false,
      enterTime: null,
      exitTime: null,
      timeOnSectionMs: 0,
      maxVisibilityRatio: 0,
      scrolledPastFast: false,
      
      // Scroll tracking (Group 5)
      lastScrollY: window.scrollY,
      lastScrollTime: Date.now(),
      scrollVelocities: [],
      maxScrollVelocity: 0,
      
      // First action timing (Group 6)
      firstActionTime: null,
      firstClickTime: null,
      firstInputTime: null,
      
      // Conversion journey (Group 7)
      status: 'viewed',
      capturedEmail: null,
      fieldSequence: [],
      
      // Interaction tracking (Group 8)
      clickCount: 0,
      clickMap: [],
      lastClickTime: 0,
      clicksInWindow: [],
      rageClickCount: 0,
      pointerDistance: 0,
      lastPointerPos: { x: 0, y: 0 },
      
      // Read-time proxy (Group 9)
      enterToScrollDelay: null,
      idleWhileVisibleMs: 0,
      lastPointerMoveTime: Date.now(),
      
      // Experiment exposure (Group 2)
      exposure: null
    };

    // Attach event listeners
    this.attachSensorListeners(sensor);
    
    return sensor;
  },

  /**
   * Attach event listeners to sensor
   * @param {Object} sensor - Sensor object
   */
  attachSensorListeners(sensor) {
    const el = sensor.element;
    
    // Click tracking
    el.addEventListener('click', (e) => this.handleClick(sensor, e));
    
    // Pointer movement
    el.addEventListener('pointermove', (e) => this.handlePointerMove(sensor, e));
    
    // Form interactions (if section has forms)
    const inputs = el.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('focus', (e) => this.handleFieldFocus(sensor, e));
      input.addEventListener('blur', (e) => this.handleFieldBlur(sensor, e));
      input.addEventListener('input', (e) => this.handleFieldInput(sensor, e));
    });
    
    // CTA button tracking
    const buttons = el.querySelectorAll('[data-goal]');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', (e) => this.handleButtonHover(sensor, e));
    });
  },

  /**
   * Setup intersection observer for visibility tracking
   */
  setupIntersectionObserver() {
    const options = {
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    };
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.getAttribute('data-section-id');
        const sensor = this.sectionSensors.get(sectionId);
        
        if (!sensor) return;
        
        // Update visibility
        const wasVisible = sensor.isVisible;
        sensor.isVisible = entry.isIntersecting;
        sensor.maxVisibilityRatio = Math.max(
          sensor.maxVisibilityRatio,
          entry.intersectionRatio
        );
        
        // Enter zone
        if (!wasVisible && sensor.isVisible) {
          sensor.enterTime = Date.now();
          this.logEvent('enter_zone', { sectionId });
          
          // Check for fast scroll past
          const timeSinceLastScroll = Date.now() - sensor.lastScrollTime;
          if (timeSinceLastScroll < 1500) {
            sensor.scrolledPastFast = true;
          }
        }
        
        // Exit zone
        if (wasVisible && !sensor.isVisible) {
          sensor.exitTime = Date.now();
          if (sensor.enterTime) {
            sensor.timeOnSectionMs += sensor.exitTime - sensor.enterTime;
          }
          this.logEvent('exit_zone', { sectionId });
          
          // Buffer payload instead of immediate send
          this.bufferPayload(sensor);
        }
      });
    }, options);
  },

  /**
   * Handle click events
   * @param {Object} sensor - Sensor object
   * @param {Event} e - Click event
   */
  handleClick(sensor, e) {
    const now = Date.now();
    
    // First click timing
    if (!sensor.firstClickTime) {
      sensor.firstClickTime = now;
      if (sensor.enterTime) {
        sensor.firstActionTime = now - sensor.enterTime;
      }
    }
    
    // Click count
    sensor.clickCount++;
    
    // Click map
    const rect = sensor.element.getBoundingClientRect();
    sensor.clickMap.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      target: e.target.tagName,
      goal: e.target.getAttribute('data-goal') || null,
      timestamp: now
    });
    
    // Rage click detection
    sensor.clicksInWindow.push(now);
    sensor.clicksInWindow = sensor.clicksInWindow.filter(
      t => now - t < this.config.rageClickWindow
    );
    
    if (sensor.clicksInWindow.length >= this.config.rageClickThreshold) {
      sensor.rageClickCount++;
      this.logEvent('rage_click', {
        sectionId: sensor.sectionId,
        clickCount: sensor.clicksInWindow.length
      });
    }
    
    sensor.lastClickTime = now;
  },

  /**
   * Handle pointer movement
   * @param {Object} sensor - Sensor object
   * @param {Event} e - Pointer event
   */
  handlePointerMove(sensor, e) {
    const now = Date.now();
    
    // Update idle timer
    sensor.lastPointerMoveTime = now;
    
    // Calculate distance
    const dx = e.clientX - sensor.lastPointerPos.x;
    const dy = e.clientY - sensor.lastPointerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    sensor.pointerDistance += distance;
    sensor.lastPointerPos = { x: e.clientX, y: e.clientY };
  },

  /**
   * Handle field focus
   * @param {Object} sensor - Sensor object
   * @param {Event} e - Focus event
   */
  handleFieldFocus(sensor, e) {
    const now = Date.now();
    
    // First input timing
    if (!sensor.firstInputTime) {
      sensor.firstInputTime = now;
      if (sensor.enterTime) {
        sensor.firstActionTime = sensor.firstActionTime || (now - sensor.enterTime);
      }
    }
    
    // Update status
    if (sensor.status === 'viewed') {
      sensor.status = 'engaged';
    }
    
    // Track field sequence
    sensor.fieldSequence.push({
      field: e.target.name || e.target.id || 'unnamed',
      action: 'focus',
      timestamp: now
    });
  },

  /**
   * Handle field blur
   * @param {Object} sensor - Sensor object
   * @param {Event} e - Blur event
   */
  handleFieldBlur(sensor, e) {
    const now = Date.now();
    const focusEvent = sensor.fieldSequence.findLast(
      item => item.field === (e.target.name || e.target.id || 'unnamed') && item.action === 'focus'
    );
    
    const dwellTime = focusEvent ? now - focusEvent.timestamp : 0;
    
    sensor.fieldSequence.push({
      field: e.target.name || e.target.id || 'unnamed',
      action: 'blur',
      timestamp: now,
      dwellTime,
      valueLength: e.target.value.length
    });
    
    // Cap sequence size
    if (sensor.fieldSequence.length > 50) {
      sensor.fieldSequence = sensor.fieldSequence.slice(-50);
    }
  },

  /**
   * Handle field input
   * @param {Object} sensor - Sensor object
   * @param {Event} e - Input event
   */
  handleFieldInput(sensor, e) {
    // Capture email if it's an email field
    if (e.target.type === 'email' && e.target.value.includes('@')) {
      sensor.capturedEmail = e.target.value;
    }
  },

  /**
   * Handle button hover
   * @param {Object} sensor - Sensor object
   * @param {Event} e - Mouse event
   */
  handleButtonHover(sensor, e) {
    // Track hesitation (hover > 2s without click)
    const button = e.target;
    const hoverStart = Date.now();
    
    const checkHesitation = () => {
      const hoverDuration = Date.now() - hoverStart;
      if (hoverDuration > 2000) {
        this.logEvent('button_hesitation', {
          sectionId: sensor.sectionId,
          goal: button.getAttribute('data-goal'),
          duration: hoverDuration
        });
      }
    };
    
    button.addEventListener('mouseleave', checkHesitation, { once: true });
    button.addEventListener('click', () => {
      button.removeEventListener('mouseleave', checkHesitation);
    }, { once: true });
  },

  /**
   * Log event to queue
   * @param {string} type - Event type
   * @param {Object} payload - Event payload
   */
  logEvent(type, payload = {}) {
    const event = {
      type,
      timestamp: Date.now(),
      ...payload
    };
    
    this.eventQueue.push(event);
    
    // Maintain max size (ring buffer)
    if (this.eventQueue.length > this.config.eventQueueMaxSize) {
      this.eventQueue.shift();
    }
  },

  /**
   * Assemble final payload for a section
   * @param {Object} sensor - Sensor object
   * @returns {Object} Final payload
   */
  assembleFinalPayload(sensor) {
    // Calculate idle time
    const now = Date.now();
    if (sensor.isVisible) {
      const timeSinceLastMove = now - sensor.lastPointerMoveTime;
      if (timeSinceLastMove > this.config.idleThreshold) {
        sensor.idleWhileVisibleMs += timeSinceLastMove;
      }
    }
    
    // Calculate enter to scroll delay
    if (sensor.enterTime && !sensor.enterToScrollDelay) {
      const firstScrollEvent = this.eventQueue.find(
        e => e.type === 'scroll' && e.timestamp > sensor.enterTime
      );
      if (firstScrollEvent) {
        sensor.enterToScrollDelay = firstScrollEvent.timestamp - sensor.enterTime;
      }
    }
    
    return {
      // Group 1: Meta + Page Context
      ...this.pageContext,
      componentId: sensor.sectionId,
      
      // Group 2: Experiment Exposure
      exposure: sensor.exposure,
      
      // Group 3: Weather Suite
      weather: this.weatherData,
      
      // Group 4: Visibility + Time
      timeOnSectionMs: sensor.timeOnSectionMs,
      maxVisibilityRatio: sensor.maxVisibilityRatio,
      scrolledPastFast: sensor.scrolledPastFast,
      
      // Group 5: Scroll Behavior
      maxScrollVelocity: sensor.maxScrollVelocity,
      avgScrollVelocity: sensor.scrollVelocities.length > 0
        ? sensor.scrollVelocities.reduce((a, b) => a + b, 0) / sensor.scrollVelocities.length
        : 0,
      
      // Group 6: First Action Timing
      firstActionDelayMs: sensor.firstActionTime,
      firstClickDelayMs: sensor.firstClickTime ? sensor.firstClickTime - (sensor.enterTime || 0) : null,
      firstInputDelayMs: sensor.firstInputTime ? sensor.firstInputTime - (sensor.enterTime || 0) : null,
      
      // Group 7: Conversion Journey
      status: sensor.status,
      capturedEmail: sensor.capturedEmail,
      fieldSequence: sensor.fieldSequence,
      
      // Group 8: Interaction Mapping
      clickCount: sensor.clickCount,
      rageClickCount: sensor.rageClickCount,
      clickMap: sensor.clickMap.slice(-20), // Last 20 clicks
      pointerDistance: Math.round(sensor.pointerDistance),
      deviceGuess: 'ontouchstart' in window ? 'mobile' : 'desktop',
      
      // Group 9: Read-time Proxy
      enterToScrollDelay: sensor.enterToScrollDelay,
      idleWhileVisibleMs: sensor.idleWhileVisibleMs,
      
      // Group 10: Diagnostics
      jsErrors: this.eventQueue.filter(e => e.type === 'error').slice(-5),
      weatherFetchStatus: this.weatherData ? 'success' : 'failed',
      
      // Group 11: Event Stream
      eventStream: this.eventQueue.slice(-60)
    };
  },

  /**
   * Buffer payload for batch sending
   * @param {Object} sensor - Sensor object
   */
  bufferPayload(sensor) {
    const payload = this.assembleFinalPayload(sensor);
    this.pendingPayloads.push(payload);
    
    // Cap buffer size (prevent memory issues)
    if (this.pendingPayloads.length > 50) {
      this.pendingPayloads.shift();
    }
  },

  /**
   * Start interval for batch sending payloads
   */
  startSendInterval() {
    // Send buffered payloads every 30 seconds
    this.sendInterval = setInterval(() => {
      if (this.pendingPayloads.length > 0) {
        this.sendBatchPayloads();
      }
    }, 30000); // 30 seconds
  },

  /**
   * Send batch of payloads to webhook
   */
  async sendBatchPayloads() {
    if (this.pendingPayloads.length === 0) return;
    
    const batch = [...this.pendingPayloads];
    this.pendingPayloads = []; // Clear buffer
    
    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch, batchSize: batch.length }),
        keepalive: true
      });
    } catch (error) {
      console.error('[Tracker] Batch send failed:', error);
      // Re-buffer failed payloads
      this.pendingPayloads.push(...batch.slice(0, 10)); // Keep last 10
    }
  },

  /**
   * Send single payload immediately (for conversions)
   * @param {Object} sensor - Sensor object
   */
  async sendSectionPayload(sensor) {
    const payload = this.assembleFinalPayload(sensor);
    
    try {
      // Use sendBeacon for reliability on page exit
      const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
      const queued = navigator.sendBeacon(this.config.webhookUrl, blob);

      if (!queued) {
        // Fallback to fetch
        await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload),
          keepalive: true
        });
      }
    } catch (error) {
      console.error('[Tracker] Failed to send payload:', error);
      this.logEvent('send_error', { error: error.message, sectionId: sensor.sectionId });
    }
  },

  /**
   * Set weather data (called by router after fetch)
   * @param {Object} weatherData - Weather data object
   */
  setWeatherData(weatherData) {
    this.weatherData = weatherData;
    this.logEvent('weather_ok', { mode: weatherData.derived.mode });
  },

  /**
   * Set experiment exposure for a section
   * @param {string} sectionId - Section ID
   * @param {Object} exposure - Exposure data
   */
  setExposure(sectionId, exposure) {
    const sensor = this.sectionSensors.get(sectionId);
    if (sensor) {
      sensor.exposure = exposure;
      this.logEvent('copy_exposed', { sectionId, exposure });
    }
  },

  /**
   * Mark section as converted
   * @param {string} sectionId - Section ID
   */
  markConverted(sectionId) {
    const sensor = this.sectionSensors.get(sectionId);
    if (sensor) {
      sensor.status = 'converted';
      this.logEvent('converted', { sectionId });
      this.sendSectionPayload(sensor);
    }
  },

  /**
   * Setup global error handlers (Group 10: Diagnostics)
   */
  setupErrorHandlers() {
    window.addEventListener('error', (e) => {
      this.logEvent('error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      this.logEvent('unhandled_rejection', {
        reason: e.reason?.message || String(e.reason)
      });
    });
  },

  /**
   * Setup page exit handlers
   */
  setupExitHandlers() {
    // Flush all pending payloads on page exit
    const flushAll = () => {
      // Stop interval
      if (this.sendInterval) {
        clearInterval(this.sendInterval);
      }
      
      // Buffer any visible sections
      this.sectionSensors.forEach(sensor => {
        if (sensor.isVisible || sensor.timeOnSectionMs > 0) {
          this.bufferPayload(sensor);
        }
      });
      
      // Send all buffered payloads via sendBeacon
      if (this.pendingPayloads.length > 0) {
        const batch = { batch: this.pendingPayloads, batchSize: this.pendingPayloads.length };
        const blob = new Blob([JSON.stringify(batch)], { type: 'application/json' });
        const queued = navigator.sendBeacon(this.config.webhookUrl, blob);
      }
    };
    
    window.addEventListener('pagehide', flushAll);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushAll();
      }
    });
  },

  /**
   * Track scroll velocity (called by scroll listener)
   */
  trackScrollVelocity() {
    const now = Date.now();
    const currentScrollY = window.scrollY;
    
    this.sectionSensors.forEach(sensor => {
      if (!sensor.isVisible) return;
      
      const deltaY = Math.abs(currentScrollY - sensor.lastScrollY);
      const deltaTime = now - sensor.lastScrollTime;
      
      if (deltaTime > 0) {
        const velocity = (deltaY / deltaTime) * 1000; // px/s
        sensor.scrollVelocities.push(velocity);
        sensor.maxScrollVelocity = Math.max(sensor.maxScrollVelocity, velocity);
        
        // Flyby detection
        if (velocity > this.config.flybyVelocityThreshold) {
          this.logEvent('scroll_flyby', {
            sectionId: sensor.sectionId,
            velocity: Math.round(velocity)
          });
        }
      }
      
      sensor.lastScrollY = currentScrollY;
      sensor.lastScrollTime = now;
    });
  }


};

window.Tracker = Tracker;

// Setup scroll listener
if (typeof window !== 'undefined') {
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (window.Tracker) {
        window.Tracker.trackScrollVelocity();
      }
    }, 100);
  }, { passive: true });
}
