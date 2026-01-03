/**
 * GOOGLE APPS SCRIPT - SHEETS API ENDPOINT
 * 
 * This script serves page copy and experiment config from Google Sheets
 * 
 * SETUP:
 * 1. Create a new Google Sheet with tabs: pages, sections, experiments
 * 2. Tools > Script editor > paste this code
 * 3. Deploy > New deployment > Web app
 * 4. Execute as: Me
 * 5. Who has access: Anyone
 * 6. Copy the web app URL to router.js config.sheetsEndpoint
 */

// Configuration - UPDATE THESE
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const CACHE_DURATION = 300; // 5 minutes in seconds

/**
 * Handle GET requests
 * @param {Object} e - Event object with parameters
 * @returns {TextOutput} JSON response
 */
function doGet(e) {
  try {
    const slug = e.parameter.slug || 'home';
    const pageType = e.parameter.pageType || 'home';
    
    // Try to get from cache first
    const cache = CacheService.getScriptCache();
    const cacheKey = `page_${slug}_${pageType}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      Logger.log('Serving from cache: ' + cacheKey);
      return ContentService
        .createTextOutput(cached)
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Fetch fresh data
    const data = getPageData(slug, pageType);
    
    // Cache it
    cache.put(cacheKey, JSON.stringify(data), CACHE_DURATION);
    
    // Return JSON
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({
        error: error.toString(),
        slug: e.parameter.slug,
        pageType: e.parameter.pageType
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get page data from sheets
 * @param {string} slug - Page slug
 * @param {string} pageType - Page type
 * @returns {Object} Page data
 */
function getPageData(slug, pageType) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Get page copy
  const copy = getPageCopy(ss, slug, pageType);
  
  // Get sections config
  const sections = getSectionsConfig(ss, slug);
  
  // Get experiment config
  const experiments = getExperimentConfig(ss);
  
  return {
    slug: slug,
    pageType: pageType,
    copy: copy,
    sections: sections,
    experiments: experiments,
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Get page copy from 'pages' tab
 * @param {Spreadsheet} ss - Spreadsheet object
 * @param {string} slug - Page slug
 * @param {string} pageType - Page type
 * @returns {Object} Copy object
 */
function getPageCopy(ss, slug, pageType) {
  const sheet = ss.getSheetByName('pages');
  if (!sheet) {
    Logger.log('Warning: pages sheet not found');
    return {};
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find row matching slug
  const row = data.find(r => r[0] === slug);
  if (!row) {
    Logger.log('Warning: slug not found: ' + slug);
    return {};
  }
  
  // Build copy object from row
  const copy = {};
  headers.forEach((header, index) => {
    if (header && row[index]) {
      copy[header] = row[index];
    }
  });
  
  return copy;
}

/**
 * Get sections configuration from 'sections' tab
 * @param {Spreadsheet} ss - Spreadsheet object
 * @param {string} slug - Page slug
 * @returns {Array} Sections array
 */
function getSectionsConfig(ss, slug) {
  const sheet = ss.getSheetByName('sections');
  if (!sheet) {
    Logger.log('Warning: sections sheet not found');
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Filter rows for this page
  const sections = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === slug) { // Assuming first column is page_slug
      const section = {};
      headers.forEach((header, index) => {
        if (header && row[index] !== '') {
          section[header] = row[index];
        }
      });
      sections.push(section);
    }
  }
  
  return sections;
}

/**
 * Get experiment configuration from 'experiments' tab
 * @param {Spreadsheet} ss - Spreadsheet object
 * @returns {Object} Experiment config
 */
function getExperimentConfig(ss) {
  const sheet = ss.getSheetByName('experiments');
  if (!sheet) {
    Logger.log('Warning: experiments sheet not found');
    return {
      copyWeightA: 50,
      copyWeightB: 50,
      styleWeightA: 50,
      styleWeightB: 50
    };
  }
  
  const data = sheet.getDataRange().getValues();
  
  // Assuming format: key | value
  const config = {};
  for (let i = 1; i < data.length; i++) {
    const [key, value] = data[i];
    if (key && value !== '') {
      config[key] = value;
    }
  }
  
  return config;
}

/**
 * Clear cache (utility function)
 */
function clearCache() {
  const cache = CacheService.getScriptCache();
  cache.removeAll(cache.getKeys());
  Logger.log('Cache cleared');
}

/**
 * Test function to verify setup
 */
function testEndpoint() {
  const result = doGet({ parameter: { slug: 'home', pageType: 'home' } });
  Logger.log(result.getContent());
}
