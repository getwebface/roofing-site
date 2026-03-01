const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

const CONTENT_DIR = path.join(__dirname, 'content');
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATE_PATH = path.join(__dirname, 'index.html');

async function build() {
  await fs.emptyDir(DIST_DIR);

  const templateHtml = await fs.readFile(TEMPLATE_PATH, 'utf-8');

  // Copy static assets
  await fs.copy(path.join(__dirname, 'css'), path.join(DIST_DIR, 'css'));
  await fs.copy(path.join(__dirname, 'js'), path.join(DIST_DIR, 'js'));

  const jsonFiles = [];

  async function findJsonFiles(dir) {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await findJsonFiles(fullPath);
      } else if (item.endsWith('.json')) {
        jsonFiles.push(fullPath);
      }
    }
  }

  await findJsonFiles(CONTENT_DIR);

  for (const filePath of jsonFiles) {
    const relativePath = path.relative(CONTENT_DIR, filePath);
    const slug = path.basename(filePath, '.json');
    let outputDir = DIST_DIR;

    if (relativePath.includes('services')) {
      outputDir = path.join(DIST_DIR, 'services');
    } else if (relativePath.includes('areas')) {
      outputDir = path.join(DIST_DIR, 'areas');
    }

    await fs.ensureDir(outputDir);
    const outputPath = path.join(outputDir, slug === 'home' ? 'index.html' : `${slug}.html`);

    const data = await fs.readJson(filePath);

    // Default values
    data.actualPageType = data.pageType;
    data.exists = true;

    const $ = cheerio.load(templateHtml);

    // 1. METADATA INJECTION
    const title = data.copy?.headline || "Melbourne Roof Repairs";
    $('title[data-slot="meta_title"]').text(title);

    const desc = (data.copy?.service_description || data.copy?.area_description || data.copy?.body || "").substring(0, 160);
    $('meta[name="description"]').attr("content", desc);
    $('meta[property="og:title"]').attr("content", title);
    $('meta[property="og:description"]').attr("content", desc);

    const image = data.copy?.og_image || "https://placehold.co/1200x630/0a1628/ffffff?text=Melbourne+Roof+Repairs";
    $('meta[property="og:image"]').attr("content", image);

    // 2. SCHEMA GENERATION
    const schema = generateSchema(data);
    $('script[data-slot="schema_json"]').html(JSON.stringify(schema, null, 2));

    // 3. BREADCRUMBS
    const breadcrumbs = generateBreadcrumbs(data);
    $('[data-slot="breadcrumbs"]').html(`<div class="container">${breadcrumbs}</div>`);

    // 4. SECTION VISIBILITY MATRIX
    if (data.pageType === 'service') {
      $('[data-section="hero-service"]').attr("style", "display: block;");
      $('#service-wrapper').attr("style", "display: block;");
    } else if (data.pageType === 'local') {
      $('[data-section="hero-local"]').attr("style", "display: block;");
      $('#local-wrapper').attr("style", "display: block;");
    } else {
      $('[data-section="hero-home"]').attr("style", "display: block;");
      $('#home-wrapper').attr("style", "display: block;");
    }

    // 5. STANDARD COPY SLOTS
    if (data.copy && typeof data.copy === "object") {
      for (const [key, value] of Object.entries(data.copy)) {
        const val = value == null ? "" : String(value);
        const elements = $(`[data-slot="${cssEscape(key)}"]`);

        elements.each((_, el) => {
          const tag = el.tagName.toLowerCase();
          const slotType = $(el).attr("data-slot-type");

          if (tag === "img") {
            if (val) {
              $(el).attr("src", val);
              $(el).attr("style", "display: block;");
            }
          } else if (tag === "video") {
            if (val) {
              $(el).attr("src", val);
              $(el).attr("style", "display: block;");
            }
          } else if (tag === "source") {
            if (val) $(el).attr("src", val);
          } else if (tag === "a") {
            if (val) $(el).attr("href", val);
          } else if ($(el).attr("data-bg-set") === "true") {
            if (val) $(el).attr("style", `background-image: url('${val}');`);
          } else if (slotType === "rich") {
            $(el).html(val);
          } else if (slotType === "image") {
              // Handled by nested selector below
          } else if (slotType === "json-list") {
             try {
                const list = JSON.parse(val);
                let html = '<ul class="benefit-list">';
                list.forEach(item => {
                   html += `<li>${item}</li>`;
                });
                html += '</ul>';
                $(el).html(html);
             } catch(e) {
                console.error("Failed to parse json-list", val);
             }
          } else {
            $(el).text(val);
          }
        });

        // Handle image containers (divs with data-slot-type="image")
        if (key.includes('image') || key.includes('logo') || key.includes('icon')) {
          $(`[data-slot="${cssEscape(key)}"] img`).each((_, el) => {
            if (val) $(el).attr("src", val);
          });
        }
      }
    }

    // 6. EMBED INITIAL DATA
    const safeJson = safeJsonForHtml(data);
    $('#__INITIAL_DATA__').html(safeJson);

    // Save
    await fs.writeFile(outputPath, $.html());
    console.log(`Built ${outputPath}`);
  }
}

// Helpers
function generateSchema(sheetData) {
  const pageType = sheetData?.actualPageType || sheetData?.pageType || "home";
  const copy = sheetData?.copy || {};
  const slug = sheetData?.slug || "";

  if (pageType === 'service') {
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": copy.headline || "Roofing Service",
      "description": copy.service_description || copy.body || "",
      "provider": {
        "@type": "Organization",
        "name": "Melbourne Roof Repairs",
        "telephone": copy.phone_number || "0482022493"
      },
      "areaServed": {
        "@type": "City",
        "name": "Melbourne"
      }
    };
  } else if (pageType === 'local') {
    const areaServed = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Melbourne";

    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": copy.headline || "Local Roofing Service",
      "description": copy.area_description || copy.body || "",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": areaServed,
        "addressRegion": "VIC",
        "addressCountry": "AU"
      },
      "telephone": copy.phone_number || "0482022493",
      "priceRange": "$$",
      "areaServed": {
        "@type": "City",
        "name": areaServed
      }
    };
  } else if (pageType === 'home') {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Melbourne Roof Repairs",
      "description": copy.body || "",
      "url": "https://melbourneroofrepairs.com.au",
      "telephone": copy.phone_number || "0482022493",
      "priceRange": "$$"
    };
  } else {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": copy.headline || "Melbourne Roof Repairs",
      "description": copy.body || ""
    };
  }
}

function generateBreadcrumbs(sheetData) {
  const pageType = sheetData?.actualPageType || sheetData?.pageType || "home";
  const slug = sheetData?.slug;

  if (pageType === 'service') {
    const serviceName = slug ? slug.replace(/-/g, ' ') : 'Service';
    return `<a href="/">Home</a> &gt; <a href="/#services">Services</a> &gt; <span data-slot="breadcrumb_current">${serviceName}</span>`;
  } else if (pageType === 'local') {
    const areaName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Area';
    return `<a href="/">Home</a> &gt; <a href="/#areas">Service Areas</a> &gt; <span data-slot="breadcrumb_current">${areaName}</span>`;
  } else {
    return `<a href="/">Home</a> &gt; <span data-slot="breadcrumb_current">Melbourne Roof Repairs</span>`;
  }
}

function cssEscape(str) {
  return String(str).replace(/["\\]/g, "\\$&");
}

function safeJsonForHtml(obj) {
  return JSON.stringify(obj ?? {})
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
