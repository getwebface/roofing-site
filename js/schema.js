/* ============================================
   SCHEMA MODULE
   Validation and XSS prevention for slot data
   ============================================ */

export const Schema = {
  // Allowed slot names (whitelist)
  allowedSlots: [
    'headline',
    'body',
    'microcopy',
    'cta_primary_text',
    'cta_secondary_text',
    'wx_banner_text',
    'wx_badge',
    'lead_form_mount',
    'phone_number',
    'proof_badge_1',
    'proof_badge_2',
    'proof_badge_3',
    'proof_badge_4',
    'symptom_1',
    'symptom_2',
    'symptom_3',
    'symptom_4',
    'symptom_5',
    'symptom_6',
    'card_1',
    'card_2',
    'card_3',
    'card_4',
    'step_1',
    'step_2',
    'step_3',
    'step_4',
    'gallery_1',
    'gallery_2',
    'gallery_3',
    'testimonial_1',
    'testimonial_2',
    'testimonial_3',
    'faq_1',
    'faq_2',
    'faq_3',
    'faq_4',
    'faq_5',
    'faq_6',
    'area_1',
    'area_2',
    'area_3',
    'area_4',
    'area_5',
    'area_6',
    'area_7',
    'area_8',
    'area_9',
    'area_10',
    'area_11',
    'area_12'
  ],

  // Maximum string lengths per slot type
  maxLengths: {
    headline: 200,
    body: 1000,
    microcopy: 200,
    cta_primary_text: 50,
    cta_secondary_text: 50,
    wx_banner_text: 150,
    phone_number: 30,
    default: 500
  },

  // Maximum array sizes
  maxArraySizes: {
    sections: 20,
    fieldSequence: 50,
    clickMap: 20,
    eventStream: 60
  },

  /**
   * Validate slot name against whitelist
   * @param {string} slotName - Slot name to validate
   * @returns {boolean} Valid or not
   */
  isValidSlot(slotName) {
    return this.allowedSlots.includes(slotName);
  },

  /**
   * Sanitize string (strip HTML, limit length)
   * @param {string} value - String to sanitize
   * @param {string} slotName - Slot name for length limit
   * @returns {string} Sanitized string
   */
  sanitizeString(value, slotName = 'default') {
    if (typeof value !== 'string') {
      return '';
    }

    // Strip HTML tags
    let sanitized = value.replace(/<[^>]*>/g, '');
    
    // Strip script tags and event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Decode HTML entities to prevent double-encoding attacks
    const textarea = document.createElement('textarea');
    textarea.innerHTML = sanitized;
    sanitized = textarea.value;
    
    // Apply length limit
    const maxLength = this.maxLengths[slotName] || this.maxLengths.default;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength) + '...';
    }
    
    return sanitized.trim();
  },

  /**
   * Validate and sanitize copy object from sheets
   * @param {Object} copy - Copy object from sheets
   * @returns {Object} Validated copy object
   */
  validateCopy(copy) {
    if (!copy || typeof copy !== 'object') {
      console.warn('[Schema] Invalid copy object');
      return {};
    }

    const validated = {};
    
    for (const [key, value] of Object.entries(copy)) {
      // Skip if not a valid slot
      if (!this.isValidSlot(key)) {
        console.warn(`[Schema] Invalid slot name: ${key}`);
        continue;
      }
      
      // Sanitize string values
      if (typeof value === 'string') {
        validated[key] = this.sanitizeString(value, key);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        // Allow numbers and booleans as-is
        validated[key] = value;
      } else {
        console.warn(`[Schema] Invalid value type for ${key}:`, typeof value);
      }
    }
    
    return validated;
  },

  /**
   * Validate sections array
   * @param {Array} sections - Sections array
   * @returns {Array} Validated sections array
   */
  validateSections(sections) {
    if (!Array.isArray(sections)) {
      console.warn('[Schema] Sections must be an array');
      return [];
    }
    
    // Cap array size
    if (sections.length > this.maxArraySizes.sections) {
      console.warn(`[Schema] Too many sections (max ${this.maxArraySizes.sections})`);
      sections = sections.slice(0, this.maxArraySizes.sections);
    }
    
    return sections.map(section => {
      if (typeof section !== 'object') {
        return null;
      }
      
      return {
        sectionId: this.sanitizeString(section.sectionId || '', 'default'),
        sectionType: this.sanitizeString(section.sectionType || '', 'default'),
        order: typeof section.order === 'number' ? section.order : 0
      };
    }).filter(Boolean);
  },

  /**
   * Validate telemetry payload before sending
   * @param {Object} payload - Telemetry payload
   * @returns {Object} Validated payload
   */
  validateTelemetryPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      console.warn('[Schema] Invalid telemetry payload');
      return null;
    }

    // Validate required fields
    if (!payload.sessionId || !payload.componentId) {
      console.warn('[Schema] Missing required telemetry fields');
      return null;
    }

    // Cap array sizes
    if (payload.fieldSequence && Array.isArray(payload.fieldSequence)) {
      payload.fieldSequence = payload.fieldSequence.slice(0, this.maxArraySizes.fieldSequence);
    }
    
    if (payload.clickMap && Array.isArray(payload.clickMap)) {
      payload.clickMap = payload.clickMap.slice(0, this.maxArraySizes.clickMap);
    }
    
    if (payload.eventStream && Array.isArray(payload.eventStream)) {
      payload.eventStream = payload.eventStream.slice(0, this.maxArraySizes.eventStream);
    }

    // Sanitize string fields
    const stringFields = ['pageUrl', 'pagePath', 'pageType', 'componentId', 'referrer'];
    stringFields.forEach(field => {
      if (payload[field] && typeof payload[field] === 'string') {
        payload[field] = this.sanitizeString(payload[field], 'default');
      }
    });

    return payload;
  },

  /**
   * Validate URL (for links, redirects, etc.)
   * @param {string} url - URL to validate
   * @returns {boolean} Valid or not
   */
  isValidUrl(url) {
    if (typeof url !== 'string') {
      return false;
    }

    // Allow relative URLs
    if (url.startsWith('/') || url.startsWith('#')) {
      return true;
    }

    // Allow tel: and mailto:
    if (url.startsWith('tel:') || url.startsWith('mailto:')) {
      return true;
    }

    // Validate absolute URLs
    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
      return false;
    }
  },

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} Valid or not
   */
  isValidEmail(email) {
    if (typeof email !== 'string') {
      return false;
    }
    
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number (Australian format)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Valid or not
   */
  isValidPhone(phone) {
    if (typeof phone !== 'string') {
      return false;
    }
    
    // Remove spaces, dashes, parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Australian phone formats:
    // - Mobile: 04XX XXX XXX (10 digits starting with 04)
    // - Landline: 0X XXXX XXXX (10 digits starting with 0)
    // - 1300/1800: 1300 XXX XXX or 1800 XXX XXX
    const phoneRegex = /^(04\d{8}|0[2-9]\d{8}|1[38]00\d{6})$/;
    
    return phoneRegex.test(cleaned);
  },

  /**
   * Get validation error message
   * @param {string} field - Field name
   * @param {string} reason - Reason for failure
   * @returns {string} Error message
   */
  getErrorMessage(field, reason) {
    return `[Schema] Validation failed for "${field}": ${reason}`;
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.Schema = Schema;
}
