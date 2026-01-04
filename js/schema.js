/* ============================================
   SCHEMA MODULE
   Validation and XSS prevention for slot data
   ============================================ */

export const Schema = {
  // Allowed slot names (whitelist)
  allowedSlots: [
    // Basic copy slots
    'headline',
    'subheadline',
    'body',
    'intro_text',
    'closing_text',
    'microcopy',
    'cta_primary_text',
    'cta_secondary_text',
    'wx_banner_text',
    'wx_badge',
    'lead_form_mount',
    'phone_number',
    
    // Rich text slots (innerHTML support)
    'long_body_1',
    'long_body_2',
    'long_body_3',
    'benefit_list',
    'feature_set',
    
    // Media slots
    'hero_bg_image',
    'section_bg_image',
    'hero_video_url',
    'gallery_image_1',
    'gallery_image_2',
    'gallery_image_3',
    'gallery_image_4',
    'gallery_image_5',
    'gallery_image_6',
    'before_image_1',
    'before_image_2',
    'before_image_3',
    'after_image_1',
    'after_image_2',
    'after_image_3',
    'service_icon_url',
    'trust_logo_1',
    'trust_logo_2',
    'trust_logo_3',
    
    // Weather-aware background slots
    'bg_calm',
    'bg_storm',
    'bg_rain',
    'bg_wind',
    
    // Social proof & stats
    'social_proof_stat',
    'urgency_text',
    'area_description',
    'service_description',
    
    // Proof badges
    'proof_badge_1',
    'proof_badge_2',
    'proof_badge_3',
    'proof_badge_4',
    
    // Symptoms
    'symptom_1',
    'symptom_2',
    'symptom_3',
    'symptom_4',
    'symptom_5',
    'symptom_6',
    
    // Cards
    'card_1',
    'card_2',
    'card_3',
    'card_4',
    'card_5',
    'card_6',
    
    // Steps
    'step_1',
    'step_2',
    'step_3',
    'step_4',
    'step_5',
    'step_6',
    
    // Gallery
    'gallery_1',
    'gallery_2',
    'gallery_3',
    'gallery_4',
    'gallery_5',
    'gallery_6',
    
    // Testimonials
    'testimonial_1',
    'testimonial_2',
    'testimonial_3',
    'testimonial_4',
    'testimonial_5',
    'testimonial_6',
    
    // FAQs
    'faq_1',
    'faq_2',
    'faq_3',
    'faq_4',
    'faq_5',
    'faq_6',
    'faq_7',
    'faq_8',
    
    // Areas
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
    subheadline: 150,
    body: 1000,
    intro_text: 500,
    closing_text: 500,
    microcopy: 200,
    cta_primary_text: 50,
    cta_secondary_text: 50,
    wx_banner_text: 150,
    phone_number: 30,
    long_body_1: 3000,
    long_body_2: 3000,
    long_body_3: 3000,
    benefit_list: 2000,
    feature_set: 2000,
    social_proof_stat: 100,
    urgency_text: 200,
    area_description: 1000,
    service_description: 1000,
    hero_bg_image: 500,
    section_bg_image: 500,
    hero_video_url: 500,
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
   * Check if slot supports rich HTML (innerHTML)
   * @param {string} slotName - Slot name
   * @returns {boolean} Supports rich HTML
   */
  isRichSlot(slotName) {
    const richSlots = [
      'long_body_1',
      'long_body_2',
      'long_body_3',
      'benefit_list',
      'feature_set'
    ];
    return richSlots.includes(slotName);
  },

  /**
   * Check if slot is a media/image slot
   * @param {string} slotName - Slot name
   * @returns {boolean} Is media slot
   */
  isMediaSlot(slotName) {
    return slotName.includes('_image') || 
           slotName.includes('_video') || 
           slotName.includes('_icon') ||
           slotName.includes('_logo') ||
           slotName.includes('bg_');
  },

  /**
   * Check if slot is a JSON array slot
   * @param {string} slotName - Slot name
   * @returns {boolean} Is JSON slot
   */
  isJsonSlot(slotName) {
    return slotName === 'benefit_list' || slotName === 'feature_set';
  },

  /**
   * Parse and validate JSON slot data
   * @param {string} jsonString - JSON string
   * @returns {Array|null} Parsed array or null
   */
  parseJsonSlot(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        console.warn('[Schema] JSON slot must be an array');
        return null;
      }
      // Limit array size
      return parsed.slice(0, 20);
    } catch (error) {
      console.warn('[Schema] Invalid JSON in slot:', error);
      return null;
    }
  },

  /**
   * Sanitize HTML for rich slots (allow limited tags)
   * @param {string} html - HTML string
   * @returns {string} Sanitized HTML
   */
  sanitizeRichHTML(html) {
    if (typeof html !== 'string') return '';
    
    // Allow only safe tags
    const allowedTags = ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'span'];
    const tagPattern = new RegExp(`<(?!\/?(${allowedTags.join('|')})\\b)[^>]+>`, 'gi');
    
    // Remove disallowed tags
    let sanitized = html.replace(tagPattern, '');
    
    // Remove event handlers and javascript:
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    return sanitized;
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
