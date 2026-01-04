# TrueRoof Google Sheets Schema Documentation

**Version:** 1.0  
**Last Updated:** January 4, 2026  
**Purpose:** Complete reference for all Google Sheets headers used in the TrueRoof dynamic content system

---

## Overview

This document defines all valid slot names and their specifications for the TrueRoof "Sheet-as-a-Control-Plane" architecture. The system uses Google Sheets to dynamically control website copy, images, and behavior based on weather conditions, A/B tests, and page context.

---

## Required Headers (All Pages)

These headers must be present in every sheet row:

| Header | Type | Max Length | Required | Example | Description |
|--------|------|------------|----------|---------|-------------|
| `slug` | string | 50 | ✅ | `home`, `leak-repair`, `brunswick` | Unique page identifier |
| `pageType` | string | 20 | ✅ | `home`, `service`, `local` | Page category |

---

## Basic Copy Slots

Standard text content slots for headlines, body copy, and CTAs:

| Header | Type | Max Length | Example | Notes |
|--------|------|------------|---------|-------|
| `headline` | text | 200 | "Expert Roof Repairs in Melbourne" | Primary H1/H2 headlines |
| `subheadline` | text | 150 | "Fast Response, Guaranteed Workmanship" | Supporting headline |
| `body` | text | 1000 | "Professional roof repairs..." | Main body copy |
| `intro_text` | text | 500 | "Welcome to TrueRoof..." | Opening paragraph |
| `closing_text` | text | 500 | "Contact us today for..." | Closing paragraph |
| `microcopy` | text | 200 | "✓ Same-day emergency response" | Small supporting text |
| `cta_primary_text` | text | 50 | "Get Free Quote" | Primary button text |
| `cta_secondary_text` | text | 50 | "Call for Emergency" | Secondary button text |
| `phone_number` | text | 30 | "0482 022 493" | Display phone number |

---

## Rich Text Slots (HTML Support)

These slots support limited HTML tags (`<p>`, `<strong>`, `<em>`, `<ul>`, `<ol>`, `<li>`, `<br>`):

| Header | Type | Max Length | Example | Usage |
|--------|------|------------|---------|-------|
| `long_body_1` | rich HTML | 3000 | `<p>Our <strong>expert team</strong>...</p>` | Long-form content section 1 |
| `long_body_2` | rich HTML | 3000 | `<p>We specialize in...</p>` | Long-form content section 2 |
| `long_body_3` | rich HTML | 3000 | `<p>Contact us for...</p>` | Long-form content section 3 |

---

## JSON Array Slots

These slots accept JSON arrays for structured lists:

| Header | Type | Max Length | Example | Format |
|--------|------|------------|---------|--------|
| `benefit_list` | JSON array | 2000 | `["24hr response", "10-year warranty", "Fully insured"]` | Array of benefit strings |
| `feature_set` | JSON array | 2000 | `["Free inspection", "Same-day service"]` | Array of feature strings |

**Note:** Arrays are automatically rendered as styled lists with checkmark icons.

---

## Media Slots (Images & Video)

URLs for images and video content:

| Header | Type | Max Length | Example | Notes |
|--------|------|------------|---------|-------|
| `hero_bg_image` | URL | 500 | `https://cdn.example.com/hero.jpg` | Hero section background |
| `section_bg_image` | URL | 500 | `https://cdn.example.com/bg.jpg` | Section background image |
| `hero_video_url` | URL | 500 | `https://cdn.example.com/video.mp4` | Hero background video |
| `gallery_image_1` | URL | 500 | `https://cdn.example.com/gallery1.jpg` | Gallery image slot 1 |
| `gallery_image_2` | URL | 500 | `https://cdn.example.com/gallery2.jpg` | Gallery image slot 2 |
| `gallery_image_3` | URL | 500 | `https://cdn.example.com/gallery3.jpg` | Gallery image slot 3 |
| `gallery_image_4` | URL | 500 | `https://cdn.example.com/gallery4.jpg` | Gallery image slot 4 |
| `gallery_image_5` | URL | 500 | `https://cdn.example.com/gallery5.jpg` | Gallery image slot 5 |
| `gallery_image_6` | URL | 500 | `https://cdn.example.com/gallery6.jpg` | Gallery image slot 6 |
| `before_image_1` | URL | 500 | `https://cdn.example.com/before1.jpg` | Before photo 1 |
| `before_image_2` | URL | 500 | `https://cdn.example.com/before2.jpg` | Before photo 2 |
| `before_image_3` | URL | 500 | `https://cdn.example.com/before3.jpg` | Before photo 3 |
| `after_image_1` | URL | 500 | `https://cdn.example.com/after1.jpg` | After photo 1 |
| `after_image_2` | URL | 500 | `https://cdn.example.com/after2.jpg` | After photo 2 |
| `after_image_3` | URL | 500 | `https://cdn.example.com/after3.jpg` | After photo 3 |
| `service_icon_url` | URL | 500 | `https://cdn.example.com/icon.svg` | Service icon/logo |
| `trust_logo_1` | URL | 500 | `https://cdn.example.com/logo1.png` | Trust badge logo 1 |
| `trust_logo_2` | URL | 500 | `https://cdn.example.com/logo2.png` | Trust badge logo 2 |
| `trust_logo_3` | URL | 500 | `https://cdn.example.com/logo3.png` | Trust badge logo 3 |

**Image Requirements:**
- Format: JPG, PNG, WebP
- Recommended: Cloudflare R2 or CDN URLs
- Lazy loading: Automatic
- Aspect ratios: Maintained via CSS

---

## Weather-Aware Background Slots

Conditional backgrounds based on weather mode:

| Header | Type | Max Length | Condition | Example |
|--------|------|------------|-----------|---------|
| `bg_calm` | URL | 500 | `weatherMode === 'calm'` | `https://cdn.example.com/calm-bg.jpg` |
| `bg_storm` | URL | 500 | `weatherMode === 'storm'` | `https://cdn.example.com/storm-bg.jpg` |
| `bg_rain` | URL | 500 | `weatherMode === 'rain'` | `https://cdn.example.com/rain-bg.jpg` |
| `bg_wind` | URL | 500 | `weatherMode === 'wind'` | `https://cdn.example.com/wind-bg.jpg` |

**Weather Modes:**
- `calm`: Clear, sunny conditions
- `storm`: Severe weather, high urgency
- `rain`: Rainy conditions
- `wind`: Windy conditions

---

## Weather Banner Slots

| Header | Type | Max Length | Example | Notes |
|--------|------|------------|---------|-------|
| `wx_banner_text` | text | 150 | "Perfect weather for roof inspections" | Weather-aware banner text |
| `wx_badge` | text | 100 | "☀️ Great conditions today" | Weather badge content |

---

## Social Proof & Stats

| Header | Type | Max Length | Example | Usage |
|--------|------|------------|---------|-------|
| `social_proof_stat` | text | 100 | "500+ Roofs Repaired" | Stat for social proof bar |
| `urgency_text` | text | 200 | "🔥 Limited slots available this week" | Urgency banner text |

---

## Page-Specific Slots

### Service Pages

| Header | Type | Max Length | Example |
|--------|------|------------|---------|
| `service_description` | text | 1000 | "Our leak repair service includes..." |

### Local Area Pages

| Header | Type | Max Length | Example |
|--------|------|------------|---------|
| `area_description` | text | 1000 | "Serving Brunswick for over 20 years..." |

---

## Proof Badges (Trust Strip)

| Header | Type | Max Length | Example |
|--------|------|------------|---------|
| `proof_badge_1` | text | 100 | "20 Years Experience" |
| `proof_badge_2` | text | 100 | "Fully Insured" |
| `proof_badge_3` | text | 100 | "5-Star Rated" |
| `proof_badge_4` | text | 100 | "10-Year Warranty" |

---

## Symptoms/Problems (Grid Cards)

| Header | Type | Max Length | Example |
|--------|------|------------|---------|
| `symptom_1` | text | 500 | "Active Leaks" |
| `symptom_2` | text | 500 | "Broken Tiles" |
| `symptom_3` | text | 500 | "Deteriorated Mortar" |
| `symptom_4` | text | 500 | "Rusted Valleys" |
| `symptom_5` | text | 500 | "Storm Damage" |
| `symptom_6` | text | 500 | "Moss Growth" |

---

## Service Cards

| Header | Type | Max Length | Example |
|--------|------|------------|---------|
| `card_1` | text | 500 | "Leak Repair" |
| `card_2` | text | 500 | "Roof Restoration" |
| `card_3` | text | 500 | "Re-bedding & Pointing" |
| `card_4` | text | 500 | "Valley Repair" |
| `card_5` | text | 500 | "Emergency Service" |
| `card_6` | text | 500 | "Maintenance Plans" |

---

## Process Steps

| Header | Type | Max Length | Example |
|--------|------|------------|---------|
| `step_1` | text | 500 | "Free Inspection" |
| `step_2` | text | 500 | "Clear Quote" |
| `step_3` | text | 500 | "Expert Repairs" |
| `step_4` | text | 500 | "10-Year Warranty" |
| `step_5` | text | 500 | "Follow-up Service" |
| `step_6` | text | 500 | "Satisfaction Guarantee" |

---

## Gallery Items

| Header | Type | Max Length | Example |
|--------|------|------------|---------|
| `gallery_1` | text | 200 | "Recent restoration in Brunswick" |
| `gallery_2` | text | 200 | "Emergency leak repair" |
| `gallery_3` | text | 200 | "Complete re-bedding project" |
| `gallery_4` | text | 200 | "Valley iron replacement" |
| `gallery_5` | text | 200 | "Storm damage repair" |
| `gallery_6` | text | 200 | "Preventative maintenance" |

---

## Testimonials

| Header | Type | Max Length | Example |
|--------|------|------------|---------|
| `testimonial_1` | text | 500 | "Quick response after storm damage..." |
| `testimonial_2` | text | 500 | "Honest assessment and fair pricing..." |
| `testimonial_3` | text | 500 | "The team was punctual and tidy..." |
| `testimonial_4` | text | 500 | "Excellent workmanship..." |
| `testimonial_5` | text | 500 | "Highly recommend..." |
| `testimonial_6` | text | 500 | "Professional service..." |

---

## FAQs

| Header | Type | Max Length | Example |
|--------|------|------------|---------|
| `faq_1` | text | 500 | "How quickly can you respond?" |
| `faq_2` | text | 500 | "Do you provide warranties?" |
| `faq_3` | text | 500 | "How much does this service cost?" |
| `faq_4` | text | 500 | "Are you licensed and insured?" |
| `faq_5` | text | 500 | "What areas do you service?" |
| `faq_6` | text | 500 | "Do you offer emergency services?" |
| `faq_7` | text | 500 | "What payment methods do you accept?" |
| `faq_8` | text | 500 | "How long does a typical repair take?" |

---

## Service Areas

| Header | Type | Max Length | Example |
|--------|------|------------|---------|
| `area_1` through `area_12` | text | 100 | "Brunswick", "Coburg", "Preston", etc. |

---

## Weather Mode Overrides

You can create weather-specific variants of any slot by appending `_storm`, `_rain`, `_wind`, or `_calm`:

### Examples:

| Header | Condition | Example |
|--------|-----------|---------|
| `headline_storm` | `weatherMode === 'storm'` | "Emergency Roof Repairs Available Now" |
| `headline_calm` | `weatherMode === 'calm'` | "Professional Roof Maintenance Services" |
| `cta_primary_text_storm` | `weatherMode === 'storm'` | "Get Emergency Help" |
| `microcopy_rain` | `weatherMode === 'rain'` | "⚠️ Protect your home from water damage" |

**Priority:** Weather-specific slots override default slots when conditions match.

---

## A/B Testing Variants

Create copy variants by appending `_variantA` or `_variantB`:

### Examples:

| Header | Bucket | Example |
|--------|--------|---------|
| `headline_variantA` | `copyBucket === 'A'` | "Expert Roof Repairs" |
| `headline_variantB` | `copyBucket === 'B'` | "Melbourne's Trusted Roofers" |
| `cta_primary_text_variantA` | `copyBucket === 'A'` | "Get Quote" |
| `cta_primary_text_variantB` | `copyBucket === 'B'` | "Request Free Inspection" |

---

## Combined Context Keys

You can combine weather and variant modifiers:

```
headline_storm_variantA
cta_primary_text_rain_variantB
microcopy_wind_variantA
```

**Resolution Order:**
1. `{slot}_{weather}_{variant}` (most specific)
2. `{slot}_{weather}` (weather-specific)
3. `{slot}_{variant}` (variant-specific)
4. `{slot}` (default)

---

## Validation Rules

### String Sanitization
- All HTML tags stripped (except rich slots)
- JavaScript event handlers removed
- `javascript:` protocol blocked
- HTML entities decoded

### URL Validation
- Must use `http://` or `https://` protocol
- Relative URLs allowed (`/path/to/file`)
- `tel:` and `mailto:` allowed for links

### Array Limits
- Maximum 20 items per JSON array
- Maximum 20 sections per page
- Maximum 50 field sequence events
- Maximum 60 event stream items

---

## Example Sheet Structure

```
| slug | pageType | headline | headline_storm | body | cta_primary_text | hero_bg_image | benefit_list |
|------|----------|----------|----------------|------|------------------|---------------|--------------|
| home | home | Expert Roof Repairs | Emergency Repairs Now | Professional service... | Get Free Quote | https://cdn.../hero.jpg | ["24hr response","10yr warranty"] |
| leak-repair | service | Leak Repair Service | Storm Damage Repairs | Fast leak detection... | Request Inspection | https://cdn.../leak.jpg | ["Same-day service","Guaranteed fix"] |
```

---

## Apps Script Integration

### Read Endpoint
```javascript
GET https://script.google.com/.../exec?slug=home&pageType=home
```

**Response:**
```json
{
  "slug": "home",
  "pageType": "home",
  "copy": {
    "headline": "Expert Roof Repairs",
    "body": "Professional service...",
    "benefit_list": "[\"24hr response\",\"10yr warranty\"]"
  }
}
```

### Telemetry Write Endpoint
```javascript
POST https://script.google.com/.../exec
Content-Type: application/json

{
  "batch": [...],
  "batchSize": 5
}
```

---

## Best Practices

1. **Keep it Simple:** Start with default slots, add variants as needed
2. **Test Thoroughly:** Verify all URLs are accessible
3. **Use CDN:** Host images on Cloudflare R2 or similar
4. **Monitor Length:** Stay within max length limits
5. **Weather Logic:** Use storm mode for urgency, calm for trust-building
6. **A/B Testing:** Test one variable at a time
7. **Cache Aware:** Changes may take up to 5 minutes to appear (cache TTL)

---

## Troubleshooting

### Slot Not Updating
- Check slot name spelling (case-sensitive)
- Verify slug and pageType match
- Clear localStorage: `localStorage.removeItem('trueroof_sheet_cache')`
- Check browser console for validation errors

### Image Not Loading
- Verify URL is accessible
- Check CORS headers on CDN
- Ensure HTTPS (not HTTP)
- Check image file size (<2MB recommended)

### JSON Parse Error
- Validate JSON syntax: `["item1", "item2"]`
- Use double quotes, not single quotes
- Escape special characters properly

---

## Support

For questions or issues with the schema:
- Check browser console for validation warnings
- Review `js/schema.js` for slot definitions
- Test with `Router.getDebugInfo()` in console

---

**End of Documentation**
