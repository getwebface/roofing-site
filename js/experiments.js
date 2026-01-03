/* ============================================
   EXPERIMENTS MODULE
   Handles A/B test bucket assignment
   ============================================ */

export const Experiments = {
  // LocalStorage keys for sticky bucketing
  storageKeys: {
    copyBucket: 'roofing_copy_bucket',
    styleBucket: 'roofing_style_bucket',
    sessionId: 'roofing_session_id'
  },

  /**
   * Get or create session ID
   * @returns {string} Session ID
   */
  getSessionId() {
    let sessionId = localStorage.getItem(this.storageKeys.sessionId);
    
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem(this.storageKeys.sessionId, sessionId);
    }
    
    return sessionId;
  },

  /**
   * Generate a unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomPart}`;
  },

  /**
   * Assign user to experiment buckets (sticky)
   * @param {Object} config - Experiment configuration from sheets
   * @returns {Object} Bucket assignments
   */
  assignBuckets(config = {}) {
    const {
      copyWeightA = 50,
      copyWeightB = 50,
      styleWeightA = 50,
      styleWeightB = 50,
      forceReset = false
    } = config;

    // Check for existing assignments (sticky)
    let copyBucket = localStorage.getItem(this.storageKeys.copyBucket);
    let styleBucket = localStorage.getItem(this.storageKeys.styleBucket);

    // Force reset if requested (useful for testing)
    if (forceReset) {
      copyBucket = null;
      styleBucket = null;
    }

    // Assign copy bucket if not set
    if (!copyBucket) {
      copyBucket = this.weightedRandom(copyWeightA, copyWeightB);
      localStorage.setItem(this.storageKeys.copyBucket, copyBucket);
    }

    // Assign style bucket if not set
    if (!styleBucket) {
      styleBucket = this.weightedRandom(styleWeightA, styleWeightB);
      localStorage.setItem(this.storageKeys.styleBucket, styleBucket);
    }

    // Calculate cell (factorial combination)
    const cell = `${copyBucket}_${styleBucket}`;

    return {
      copyBucket,
      styleBucket,
      cell,
      sessionId: this.getSessionId()
    };
  },

  /**
   * Weighted random selection between A and B
   * @param {number} weightA - Weight for bucket A (0-100)
   * @param {number} weightB - Weight for bucket B (0-100)
   * @returns {string} 'A' or 'B'
   */
  weightedRandom(weightA, weightB) {
    const total = weightA + weightB;
    const normalized = (weightA / total) * 100;
    const random = Math.random() * 100;
    
    return random < normalized ? 'A' : 'B';
  },

  /**
   * Get copy variant key based on bucket and context
   * @param {string} bucket - Copy bucket ('A' or 'B')
   * @param {string} slotName - Slot name (e.g., 'headline')
   * @param {Object} context - Additional context (weather, page type, etc.)
   * @returns {string} Copy key for lookup
   */
  getCopyKey(bucket, slotName, context = {}) {
    const { weatherMode, pageType } = context;
    
    // Build copy key with context
    // Format: {slot}_copy{bucket}[_wx_{mode}][_page_{type}]_v1
    let key = `${slotName}_copy${bucket}`;
    
    if (weatherMode && weatherMode !== 'calm') {
      key += `_wx_${weatherMode}`;
    }
    
    if (pageType && pageType !== 'home') {
      key += `_page_${pageType}`;
    }
    
    key += '_v1';
    
    return key;
  },

  /**
   * Get theme token based on style bucket
   * @param {string} bucket - Style bucket ('A' or 'B')
   * @returns {string} Theme token ('themeA' or 'themeB')
   */
  getThemeToken(bucket) {
    return bucket === 'A' ? 'themeA' : 'themeB';
  },

  /**
   * Create exposure event payload
   * @param {Object} buckets - Bucket assignments
   * @param {Object} appliedCopy - Copy that was actually applied
   * @returns {Object} Exposure event payload
   */
  createExposurePayload(buckets, appliedCopy = {}) {
    return {
      sessionId: buckets.sessionId,
      copyBucket: buckets.copyBucket,
      styleBucket: buckets.styleBucket,
      cell: buckets.cell,
      appliedCopy: appliedCopy,
      timestamp: Date.now()
    };
  },

  /**
   * Reset bucket assignments (for testing)
   */
  resetBuckets() {
    localStorage.removeItem(this.storageKeys.copyBucket);
    localStorage.removeItem(this.storageKeys.styleBucket);
    console.log('[Experiments] Buckets reset');
  },

  /**
   * Get current bucket assignments without reassigning
   * @returns {Object|null} Current buckets or null
   */
  getCurrentBuckets() {
    const copyBucket = localStorage.getItem(this.storageKeys.copyBucket);
    const styleBucket = localStorage.getItem(this.storageKeys.styleBucket);
    
    if (!copyBucket || !styleBucket) {
      return null;
    }
    
    return {
      copyBucket,
      styleBucket,
      cell: `${copyBucket}_${styleBucket}`,
      sessionId: this.getSessionId()
    };
  },

  /**
   * Check if user is in a specific cell
   * @param {string} targetCell - Cell to check (e.g., 'A_B')
   * @returns {boolean} True if user is in target cell
   */
  isInCell(targetCell) {
    const current = this.getCurrentBuckets();
    return current ? current.cell === targetCell : false;
  },

  /**
   * Get debug info for current experiment state
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    const buckets = this.getCurrentBuckets();
    
    return {
      buckets,
      storageKeys: this.storageKeys,
      localStorage: {
        copyBucket: localStorage.getItem(this.storageKeys.copyBucket),
        styleBucket: localStorage.getItem(this.storageKeys.styleBucket),
        sessionId: localStorage.getItem(this.storageKeys.sessionId)
      }
    };
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.Experiments = Experiments;
}
