/* ============================================
   INIT - Bootstrap Script
   Single entry point for the entire system
   ============================================ */

import { Router } from './router.js';

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  console.log('[Init] Starting roofing site initialization...');
  
  try {
    // Initialize router (orchestrates everything)
    await Router.init();
    
    // Expose debug helpers to console
    window.RoofingDebug = {
      router: () => Router.getDebugInfo(),
      experiments: () => window.Experiments.getDebugInfo(),
      weather: () => window.Weather.getCache(),
      tracker: () => ({
        sessionId: window.Tracker.sessionId,
        sections: window.Tracker.sectionSensors.size,
        events: window.Tracker.eventQueue.length
      }),
      resetExperiments: () => {
        window.Experiments.resetBuckets();
        window.location.reload();
      },
      clearWeatherCache: () => {
        window.Weather.clearCache();
        window.location.reload();
      }
    };
    
    console.log('[Init] ✓ Initialization complete');
    console.log('[Init] Debug helpers available at window.RoofingDebug');
    
  } catch (error) {
    console.error('[Init] Initialization failed:', error);
    
    // Track initialization error
    if (window.Tracker) {
      window.Tracker.logEvent('init_error', {
        error: error.message,
        stack: error.stack
      });
    }
  }
}
