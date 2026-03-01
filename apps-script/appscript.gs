/**
 * ROOF API - MASTER Apps Script (Conduit)
 *
 * FULL VERSION (Schema-aware + Weather + Variant resolution)
 *
 * Goals:
 *  - GET content from `pages` by (slug + pageType)
 *  - Return canonical `copy` keys that match templates' data-slot attributes
 *    (schema-driven: returns many slots, not just 6)
 *  - Resolve modifiers using schema order:
 *      1) {slot}_{weather}_{variant}
 *      2) {slot}_{weather}
 *      3) {slot}_{variant}
 *      4) {slot}
 *    + supports legacy *_copyA_v1 columns as a fallback
 *  - Preserve full sheet row in `raw` for debugging
 *  - POST telemetry into `telemetry` sheet safely (header-driven, order-safe)
 *  - Strong error visibility via debug=1
 *  - Optional shared secret key (Worker holds the key, browsers do not)
 */

// ============================
// CONFIG
// ============================

const SPREADSHEET_ID = "14PFOJfOLpO4Mg1uZEFzoxW6Z8v4A1iHpLRyg9P19duM";

const REQUIRE_KEY = false;                 // set true when you want to lock down GET/POST
const API_KEY = "roof-2026-prod-9f3kLm8x"; // must match Worker API_KEY when REQUIRE_KEY=true

const SHEET_TELEMETRY = "telemetry";
const TELEMETRY_MAX_ROWS = 10000;

// ============================
// POST: Telemetry intake
// ============================
function doPost(e) {
  try {
    if (REQUIRE_KEY) requireKey_(e);

    const body = (e && e.postData && e.postData.contents) ? e.postData.contents : "";
    const parsed = body ? JSON.parse(body) : null;

    const events = normalizeTelemetryBatch_(parsed);

    // Guardrails (tune as you like)
    const MAX_EVENTS_PER_REQUEST = 50;
    if (events.length > MAX_EVENTS_PER_REQUEST) {
      return jsonOut_(JSON.stringify({
        success: false,
        error: `Too many events: ${events.length} (max ${MAX_EVENTS_PER_REQUEST})`
      }));
    }

    const result = appendTelemetryBatch_(events);

    return jsonOut_(JSON.stringify({
      success: true,
      received: events.length,
      written: result.written,
      skipped: result.skipped,
      errors: result.errors
    }));
  } catch (err) {
    return jsonOut_(JSON.stringify({ success: false, error: String(err) }));
  }
}

function normalizeTelemetryBatch_(payload) {
  if (!payload) return [];

  // Wrapper: { batch: [...] }
  if (typeof payload === "object" && !Array.isArray(payload) && Array.isArray(payload.batch)) {
    return payload.batch.filter(Boolean);
  }

  // Direct array: [ {...}, {...} ]
  if (Array.isArray(payload)) {
    return payload.filter(Boolean);
  }

  // Single event object: { ... }
  if (typeof payload === "object") {
    return [payload];
  }

  return [];
}

function appendTelemetryBatch_(events) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  let written = 0;
  let skipped = 0;
  const errors = [];

  try {
    // Open sheet ONCE for the batch (faster + consistent)
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_TELEMETRY);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_TELEMETRY);
      sheet.appendRow(getTelemetryHeaderDefault_());
    }

    // Archive rollover (keep header row)
    if (sheet.getLastRow() > TELEMETRY_MAX_ROWS) {
      const archiveName = `${SHEET_TELEMETRY}_${Utilities.formatDate(new Date(), "GMT", "yyyyMMdd")}`;
      sheet.copyTo(ss).setName(archiveName);
      const last = sheet.getLastRow();
      if (last > 1) sheet.deleteRows(2, last - 1);
    }

    // Read headers ONCE
    const headerRow = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(h => String(h ?? "").trim());

    const headerIndex = {};
    for (let i = 0; i < headerRow.length; i++) {
      const k = String(headerRow[i] || "").trim();
      if (k && headerIndex[k] === undefined) headerIndex[k] = i;
    }

    const rowsToAppend = [];

    for (let i = 0; i < events.length; i++) {
      const p = events[i];

      if (!p || typeof p !== "object" || Array.isArray(p)) {
        skipped++;
        continue;
      }

      try {
        const row = buildTelemetryRow_(p, headerRow, headerIndex);

        // If it's literally all blanks, skip (prevents empty rows from bad payloads)
        if (row.every(v => v === "" || v === null || typeof v === "undefined")) {
          skipped++;
          continue;
        }

        rowsToAppend.push(row);
        written++;
      } catch (err) {
        errors.push({ index: i, error: String(err) });
      }
    }

    // Append in one go (much faster than appendRow in a loop)
    if (rowsToAppend.length) {
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rowsToAppend.length, headerRow.length).setValues(rowsToAppend);
    }

  } finally {
    lock.releaseLock();
  }

  return { written, skipped, errors };
}

function buildTelemetryRow_(p, headerRow, headerIndex) {
  const row = new Array(headerRow.length).fill("");

  const set = (name, value) => {
    const idx = headerIndex[name];
    if (idx === undefined) return;
    row[idx] = value;
  };

  // Matches your telemetry schema (header-driven, order-safe)
  set("timestamp", new Date(p.timestamp || Date.now()));
  set("sessionId", s_(p.sessionId));
  set("pageUrl", s_(p.pageUrl));
  set("pagePath", s_(p.pagePath));
  set("pageType", s_(p.pageType));
  set("componentId", s_(p.componentId));
  set("referrer", s_(p.referrer));
  set("utmSource", s_(p.utmSource));
  set("utmMedium", s_(p.utmMedium));
  set("utmCampaign", s_(p.utmCampaign));

  set("copyBucket", s_(p.copyBucket ?? p.exposure?.copyBucket));
  set("styleBucket", s_(p.styleBucket ?? p.exposure?.styleBucket));
  set("cell", s_(p.cell ?? p.exposure?.cell));

  set("weatherMode", s_(p.weatherMode ?? p.weather?.derived?.mode));
  set("weatherTemp", s_(p.weatherTemp ?? p.weather?.current?.temp));
  set("weatherRain", s_(p.weatherRain ?? p.weather?.current?.rain));
  set("weatherWind", s_(p.weatherWind ?? p.weather?.current?.wind));
  set("stormLikely24h", !!(p.stormLikely24h ?? p.weather?.derived?.stormLikely24h));

  set("timeOnSectionMs", n_(p.timeOnSectionMs));
  set("maxVisibilityRatio", n_(p.maxVisibilityRatio));
  set("scrolledPastFast", !!p.scrolledPastFast);
  set("maxScrollVelocity", n_(p.maxScrollVelocity));
  set("avgScrollVelocity", n_(p.avgScrollVelocity));

  set("firstActionDelayMs", s_(p.firstActionDelayMs));
  set("firstClickDelayMs", s_(p.firstClickDelayMs));
  set("firstInputDelayMs", s_(p.firstInputDelayMs));

  set("status", s_(p.status));
  set("capturedEmail", s_(p.capturedEmail));

  set("clickCount", n_(p.clickCount));
  set("rageClickCount", n_(p.rageClickCount));
  set("pointerDistance", n_(p.pointerDistance));
  set("deviceGuess", s_(p.deviceGuess));
  set("enterToScrollDelay", s_(p.enterToScrollDelay));
  set("idleWhileVisibleMs", n_(p.idleWhileVisibleMs));
  set("weatherFetchStatus", s_(p.weatherFetchStatus));
  set("jsErrorCount", n_(p.jsErrorCount ?? (p.jsErrors ? p.jsErrors.length : 0)));

  set("payloadJson", JSON.stringify(p || {}));

  return row;
}


function getTelemetryHeaderDefault_() {
  return [
    "timestamp","sessionId","pageUrl","pagePath","pageType","componentId","referrer",
    "utmSource","utmMedium","utmCampaign","copyBucket","styleBucket","cell",
    "weatherMode","weatherTemp","weatherRain","weatherWind","stormLikely24h",
    "timeOnSectionMs","maxVisibilityRatio","scrolledPastFast","maxScrollVelocity","avgScrollVelocity",
    "firstActionDelayMs","firstClickDelayMs","firstInputDelayMs",
    "status","capturedEmail","clickCount","rageClickCount","pointerDistance","deviceGuess",
    "enterToScrollDelay","idleWhileVisibleMs","weatherFetchStatus","jsErrorCount","payloadJson"
  ];
}

// ============================
// Helpers
// ============================

function jsonOut_(jsonString) {
  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}

function requireKey_(e) {
  const key = e && e.parameter ? e.parameter.key : "";
  if (!key || key !== API_KEY) throw new Error("Forbidden");
}

function s_(v) { return (v === null || typeof v === "undefined") ? "" : String(v); }
function n_(v) { const n = Number(v); return isFinite(n) ? n : 0; }
