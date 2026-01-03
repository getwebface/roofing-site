# Roofing Website - Dynamic Copy + Weather Telemetry System

A high-performance roofing website with:
- **SEO-friendly hardcoded HTML** with dynamic copy injection
- **Weather-aware messaging** (Melbourne-specific)
- **Comprehensive telemetry** tracking all user behavior
- **A/B testing** for copy and style variants
- **Google Sheets** as the control plane

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     STATIC HTML PAGES                        │
│  (SEO-friendly, hardcoded defaults, slot attributes)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        ROUTER.JS                             │
│  • Detects page type                                         │
│  • Fetches weather (Open-Meteo API)                         │
│  • Assigns A/B buckets (sticky)                             │
│  • Fetches copy from Google Sheets (optional)               │
│  • Fills slots + applies theme tokens                       │
│  • Registers sections with tracker                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       TRACKER.JS                             │
│  • 11 tracking groups (visibility, scroll, clicks, etc.)    │
│  • Section sensors with IntersectionObserver                │
│  • Ring buffer event queue (last 60 events)                 │
│  • Sends payloads via sendBeacon on exit                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   GOOGLE SHEETS                              │
│  • Pages tab: Copy variants                                 │
│  • Experiments tab: A/B weights                             │
│  • Telemetry tab: All tracking data                         │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
roofing-site/
├── index.html                 # Home page (all 10 sections)
├── services/                  # Service pages (to be created)
├── areas/                     # Local area pages (to be created)
├── css/
│   ├── base.css              # Typography, spacing, colors
│   ├── themes.css            # A/B theme tokens
│   └── sections.css          # Section-specific styles
├── js/
│   ├── init.js               # Bootstrap entry point
│   ├── router.js             # Orchestration layer
│   ├── tracker.js            # Telemetry core (11 groups)
│   ├── weather.js            # Open-Meteo API + caching
│   ├── experiments.js        # A/B bucket assignment
│   └── form-asset.js         # Google Form embed handler
└── apps-script/
    ├── sheets-api.gs         # Serves copy from Sheets
    └── telemetry-receiver.gs # Receives tracking payloads
```

## Setup Instructions

### 1. Local Development

```bash
# Navigate to the project
cd roofing-site

# Serve locally (Python 3)
python3 -m http.server 8000

# Or use any static server
# npx serve .
# php -S localhost:8000
```

Visit: `http://localhost:8000`

### 2. Google Sheets Setup

#### Create Spreadsheet

1. Create a new Google Sheet
2. Create these tabs:
   - `pages` - Page copy variants
   - `sections` - Section configuration (optional)
   - `experiments` - A/B test weights
   - `telemetry` - Tracking data (auto-created)

#### Pages Tab Schema

| slug | pageType | headline_copyA_v1 | headline_copyB_v1 | body_copyA_v1 | body_copyB_v1 | cta_primary_text_copyA_v1 | ... |
|------|----------|-------------------|-------------------|---------------|---------------|---------------------------|-----|
| home | home | Melbourne Roof Repairs... | Fast Roof Repairs... | Expert roof repairs... | Professional roofing... | Get Free Inspection | ... |

#### Experiments Tab Schema

| key | value |
|-----|-------|
| copyWeightA | 50 |
| copyWeightB | 50 |
| styleWeightA | 50 |
| styleWeightB | 50 |

### 3. Apps Script Deployment

#### Sheets API Endpoint

1. Open your Google Sheet
2. **Extensions > Apps Script**
3. Paste contents of `apps-script/sheets-api.gs`
4. Update `SPREADSHEET_ID` constant
5. **Deploy > New deployment**
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
6. Copy the web app URL
7. Update `router.js` line 13:
   ```javascript
   sheetsEndpoint: 'YOUR_WEB_APP_URL_HERE'
   ```
8. Set `enableSheetsFetch: true` when ready

#### Telemetry Receiver

1. Create a **separate** Google Sheet for telemetry (or use same)
2. **Extensions > Apps Script**
3. Paste contents of `apps-script/telemetry-receiver.gs`
4. Update `SPREADSHEET_ID` constant
5. **Deploy > New deployment** (same settings as above)
6. Copy the web app URL
7. Update `tracker.js` line 8:
   ```javascript
   webhookUrl: 'YOUR_TELEMETRY_URL_HERE'
   ```

### 4. Google Form Setup (Lead Capture)

1. Create a Google Form for lead capture
2. Get the embed URL:
   - Click **Send** button
   - Choose **< >** (embed)
   - Copy the `src` URL from the iframe
3. Update `form-asset.js` line 11:
   ```javascript
   embedUrl: 'YOUR_GOOGLE_FORM_EMBED_URL'
   ```

## Features

### 10 Reusable Section Layouts

1. **HeroLeadWeather** - Hero with weather badge + form mount
2. **TrustStrip** - Badges (years, insurance, ratings, warranty)
3. **ProblemSymptoms** - Grid of pain points
4. **GridCards** - Service/area cards (bento layout)
5. **ProcessSteps** - Numbered timeline
6. **ProofTestimonials** - Customer quotes
7. **FAQAccordion** - Expandable Q&A
8. **ServiceAreas** - Melbourne suburbs grid
9. **BeforeAfterGallery** - Project photos
10. **FinalCTA** - Bottom conversion block

### Weather Integration

- **API**: Open-Meteo (free, no key required)
- **Location**: Melbourne (-37.81, 144.96)
- **Cache**: 15 minutes in sessionStorage
- **Modes**: calm | rain | wind | storm
- **Triggers**: Automatic copy adjustments based on conditions

### A/B Testing System

- **Factorial design**: Copy (A/B) × Style (A/B) = 4 cells
- **Sticky bucketing**: localStorage-based
- **Theme tokens**: CSS custom properties
- **Copy variants**: Context-aware (weather + page type)

### Telemetry (11 Tracking Groups)

1. **Meta + Page Context** - URL, UTM params, referrer, device
2. **Experiment Exposure** - Buckets, cell, applied copy snapshot
3. **Weather Suite** - Current + 4-day forecast, mode, triggers
4. **Visibility + Time** - Time on section, max visibility ratio
5. **Scroll Behavior** - Velocity, direction, flyby detection
6. **First Action Timing** - Delay to first click/input
7. **Conversion Journey** - Status (viewed→engaged→converted), email capture
8. **Interaction Mapping** - Clicks, rage clicks, pointer distance
9. **Read-time Proxy** - Idle time, enter-to-scroll delay
10. **Diagnostics** - JS errors, weather fetch status
11. **Event Stream** - Ring buffer of last 60 events

## Slot System

Every section uses `data-slot` attributes for dynamic content:

```html
<h1 data-slot="headline">Default SEO-friendly headline</h1>
<p data-slot="body">Default body copy...</p>
<button data-slot="cta_primary_text">Get Free Inspection</button>
```

Router fills slots from Google Sheets or keeps defaults.

## Copy Key Format

```
{slot}_copy{bucket}[_wx_{mode}][_page_{type}]_v1

Examples:
- headline_copyA_v1
- headline_copyB_wx_storm_v1
- body_copyA_page_service_v1
```

## Debug Helpers

Open browser console and use:

```javascript
// View current state
RoofingDebug.router()
RoofingDebug.experiments()
RoofingDebug.weather()
RoofingDebug.tracker()

// Reset experiments (forces new bucket assignment)
RoofingDebug.resetExperiments()

// Clear weather cache
RoofingDebug.clearWeatherCache()
```

## Deployment

### Static Hosting Options

- **Netlify**: Drag & drop the `roofing-site` folder
- **Vercel**: `vercel deploy`
- **GitHub Pages**: Push to repo, enable Pages
- **Cloudflare Pages**: Connect repo or upload

### Configuration Checklist

- [ ] Update Apps Script `SPREADSHEET_ID` constants
- [ ] Deploy both Apps Script web apps
- [ ] Update `router.js` with Sheets endpoint URL
- [ ] Update `tracker.js` with telemetry webhook URL
- [ ] Update `form-asset.js` with Google Form embed URL
- [ ] Set `enableSheetsFetch: true` in router config
- [ ] Test with `RoofingDebug` helpers

## Performance

- **First Paint**: Instant (hardcoded HTML)
- **Weather Fetch**: Non-blocking, cached 15min
- **Sheets Fetch**: Non-blocking, falls back to defaults
- **Tracking**: sendBeacon on exit (no blocking)
- **No Build Step**: Pure HTML/CSS/JS

## Browser Support

- Modern browsers with ES6 modules
- IntersectionObserver (all modern browsers)
- sendBeacon API (fallback to fetch)

## Design Philosophy

**"Polished trade site, not SaaS"**

- Local, trustworthy, practical, clean
- Solid typography, clear spacing, subtle shadows
- Minimal motion, no glossy gradients or neon glows
- Think: "quality local tradie" not "VC-funded startup"

## Next Steps

1. **Create service pages** using same section layouts
2. **Create local area pages** with suburb-specific copy
3. **Populate Google Sheets** with copy variants
4. **Set up Google Form** for lead capture
5. **Deploy to production** hosting
6. **Monitor telemetry** in Google Sheets
7. **Iterate on copy** based on conversion data

## License

Proprietary - Built for roofing business use

---

**Questions?** Check the inline code comments or console logs for detailed debugging information.
