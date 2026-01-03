/**
 * GOOGLE APPS SCRIPT - TELEMETRY RECEIVER
 * 
 * This script receives telemetry payloads from the tracker and appends to Google Sheets
 * 
 * SETUP:
 * 1. Create a new Google Sheet with tab: telemetry
 * 2. Tools > Script editor > paste this code
 * 3. Deploy > New deployment > Web app
 * 4. Execute as: Me
 * 5. Who has access: Anyone
 * 6. Copy the web app URL to tracker.js config.webhookUrl
 */

// Configuration - UPDATE THESE
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const TELEMETRY_SHEET_NAME = 'telemetry';
const MAX_ROWS = 10000; // Auto-archive when exceeded

/**
 * Handle POST requests (telemetry payloads)
 * @param {Object} e - Event object with postData
 * @returns {TextOutput} JSON response
 */
function doPost(e) {
  try {
    // Parse payload
    const payload = JSON.parse(e.postData.contents);
    
    // Append to sheet
    appendTelemetry(payload);
    
    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Append telemetry data to sheet
 * @param {Object} payload - Telemetry payload
 */
function appendTelemetry(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(TELEMETRY_SHEET_NAME);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(TELEMETRY_SHEET_NAME);
    initializeTelemetrySheet(sheet);
  }
  
  // Check if we need to archive
  if (sheet.getLastRow() > MAX_ROWS) {
    archiveOldData(ss, sheet);
  }
  
  // Flatten payload for row insertion
  const row = flattenPayload(payload);
  
  // Append row
  sheet.appendRow(row);
  
  Logger.log('Telemetry appended: ' + payload.sessionId + ' / ' + payload.componentId);
}

/**
 * Initialize telemetry sheet with headers
 * @param {Sheet} sheet - Sheet object
 */
function initializeTelemetrySheet(sheet) {
  const headers = [
    // Meta
    'timestamp',
    'sessionId',
    'pageUrl',
    'pagePath',
    'pageType',
    'componentId',
    'referrer',
    'utmSource',
    'utmMedium',
    'utmCampaign',
    
    // Experiment
    'copyBucket',
    'styleBucket',
    'cell',
    
    // Weather
    'weatherMode',
    'weatherTemp',
    'weatherRain',
    'weatherWind',
    'stormLikely24h',
    
    // Visibility
    'timeOnSectionMs',
    'maxVisibilityRatio',
    'scrolledPastFast',
    
    // Scroll
    'maxScrollVelocity',
    'avgScrollVelocity',
    
    // First action
    'firstActionDelayMs',
    'firstClickDelayMs',
    'firstInputDelayMs',
    
    // Conversion
    'status',
    'capturedEmail',
    
    // Interaction
    'clickCount',
    'rageClickCount',
    'pointerDistance',
    'deviceGuess',
    
    // Read-time
    'enterToScrollDelay',
    'idleWhileVisibleMs',
    
    // Diagnostics
    'weatherFetchStatus',
    'jsErrorCount',
    
    // Raw payload (for full data)
    'payloadJson'
  ];
  
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f3f3f3');
}

/**
 * Flatten payload into array for row insertion
 * @param {Object} payload - Telemetry payload
 * @returns {Array} Flattened row data
 */
function flattenPayload(payload) {
  return [
    // Meta
    new Date(payload.timestamp || Date.now()),
    payload.sessionId || '',
    payload.pageUrl || '',
    payload.pagePath || '',
    payload.pageType || '',
    payload.componentId || '',
    payload.referrer || '',
    payload.utmSource || '',
    payload.utmMedium || '',
    payload.utmCampaign || '',
    
    // Experiment
    payload.exposure?.copyBucket || '',
    payload.exposure?.styleBucket || '',
    payload.exposure?.cell || '',
    
    // Weather
    payload.weather?.derived?.mode || '',
    payload.weather?.current?.temp || '',
    payload.weather?.current?.rain || '',
    payload.weather?.current?.wind || '',
    payload.weather?.derived?.stormLikely24h || false,
    
    // Visibility
    payload.timeOnSectionMs || 0,
    payload.maxVisibilityRatio || 0,
    payload.scrolledPastFast || false,
    
    // Scroll
    payload.maxScrollVelocity || 0,
    payload.avgScrollVelocity || 0,
    
    // First action
    payload.firstActionDelayMs || '',
    payload.firstClickDelayMs || '',
    payload.firstInputDelayMs || '',
    
    // Conversion
    payload.status || '',
    payload.capturedEmail || '',
    
    // Interaction
    payload.clickCount || 0,
    payload.rageClickCount || 0,
    payload.pointerDistance || 0,
    payload.deviceGuess || '',
    
    // Read-time
    payload.enterToScrollDelay || '',
    payload.idleWhileVisibleMs || 0,
    
    // Diagnostics
    payload.weatherFetchStatus || '',
    payload.jsErrors?.length || 0,
    
    // Raw payload
    JSON.stringify(payload)
  ];
}

/**
 * Archive old data when sheet gets too large
 * @param {Spreadsheet} ss - Spreadsheet object
 * @param {Sheet} sheet - Current telemetry sheet
 */
function archiveOldData(ss, sheet) {
  const archiveName = TELEMETRY_SHEET_NAME + '_archive_' + Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd');
  
  // Copy current sheet
  const archive = sheet.copyTo(ss);
  archive.setName(archiveName);
  
  // Clear current sheet (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  Logger.log('Archived ' + lastRow + ' rows to ' + archiveName);
}

/**
 * Get telemetry summary (utility function)
 * @returns {Object} Summary statistics
 */
function getTelemetrySummary() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(TELEMETRY_SHEET_NAME);
  
  if (!sheet) {
    return { error: 'Telemetry sheet not found' };
  }
  
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  // Calculate basic stats
  const sessions = new Set();
  const pages = new Set();
  let conversions = 0;
  
  data.forEach(row => {
    sessions.add(row[1]); // sessionId
    pages.add(row[2]); // pageUrl
    if (row[26] === 'converted') conversions++; // status
  });
  
  return {
    totalEvents: lastRow - 1,
    uniqueSessions: sessions.size,
    uniquePages: pages.size,
    conversions: conversions,
    conversionRate: ((conversions / sessions.size) * 100).toFixed(2) + '%'
  };
}

/**
 * Test function to verify setup
 */
function testTelemetryReceiver() {
  const testPayload = {
    sessionId: 'test-session-123',
    timestamp: Date.now(),
    pageUrl: 'https://example.com/',
    pagePath: '/',
    pageType: 'home',
    componentId: 'hero-001',
    status: 'viewed',
    clickCount: 5,
    timeOnSectionMs: 15000
  };
  
  appendTelemetry(testPayload);
  Logger.log('Test payload appended successfully');
}
