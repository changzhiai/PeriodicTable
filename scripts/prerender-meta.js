/**
 * Post-build script: generates static HTML shells for element and category pages.
 * These contain proper meta tags, JSON-LD, and noscript content so crawlers
 * that don't execute JavaScript still get full SEO metadata.
 *
 * Run after `vite build`: node scripts/prerender-meta.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const BASE_URL = 'https://periodictable.travel-tracker.org';

// Read the built index.html as template
const template = readFileSync(join(DIST, 'index.html'), 'utf-8');

// Import elements data
const dataPath = join(__dirname, '..', 'src', 'elementsData.js');
let dataContent = readFileSync(dataPath, 'utf-8');
// Strip the export to make it evaluable
dataContent = dataContent.replace('export const elements =', 'const elements =');
// Extract the array via a hacky but effective approach - read the JSON array
const match = readFileSync(dataPath, 'utf-8').match(/export const elements = (\[[\s\S]*\]);?\s*$/);

// Parse elements by splitting on object boundaries
const rawData = readFileSync(dataPath, 'utf-8');
const arrayStart = rawData.indexOf('[');
const arrayContent = rawData.slice(arrayStart);
const elements = [];
let depth = 0;
let start = -1;
for (let i = 0; i < arrayContent.length; i++) {
  if (arrayContent[i] === '{') {
    if (depth === 0) start = i;
    depth++;
  } else if (arrayContent[i] === '}') {
    depth--;
    if (depth === 0 && start !== -1) {
      const objStr = arrayContent.slice(start, i + 1);
      const sMatch = objStr.match(/"s":\s*"([^"]+)"/);
      const nameMatch = objStr.match(/"name":\s*"([^"]+)"/);
      const nMatch = objStr.match(/"n":\s*(\d+)/);
      const mMatch = objStr.match(/"m":\s*([\d.]+)/);
      const catMatch = objStr.match(/"cat":\s*"([^"]+)"/);
      if (sMatch && nameMatch && nMatch && mMatch && catMatch) {
        elements.push({
          s: sMatch[1],
          name: nameMatch[1],
          n: parseInt(nMatch[1]),
          m: parseFloat(mMatch[1]),
          cat: catMatch[1]
        });
      }
      start = -1;
    }
  }
}

console.log(`Found ${elements.length} elements`);

const categoryLabels = {
  'diatomic nonmetal': 'Nonmetals',
  'noble gas': 'Noble Gases',
  'alkali metal': 'Alkali Metals',
  'alkaline earth metal': 'Alkaline Earth Metals',
  'metalloid': 'Metalloids',
  'polyatomic nonmetal': 'Nonmetals',
  'nonmetal': 'Nonmetals',
  'post-transition metal': 'Post-Transition Metals',
  'transition metal': 'Transition Metals',
  'lanthanide': 'Lanthanides',
  'actinide': 'Actinides',
  'unknown': 'Unknown Elements',
};

function generatePage(path, title, description, jsonLd) {
  const fullUrl = `${BASE_URL}${path}`;
  let html = template;

  // Replace title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  );

  // Replace meta title
  html = html.replace(
    /<meta name="title" content="[^"]*"/,
    `<meta name="title" content="${title}"`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description"[^>]*\/>/,
    `<meta name="description" content="${description}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${fullUrl}"`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${fullUrl}"`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${title}"`
  );
  html = html.replace(
    /<meta property="og:description"[^>]*\/>/,
    `<meta property="og:description" content="${description}" />`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta property="twitter:url" content="[^"]*"/,
    `<meta property="twitter:url" content="${fullUrl}"`
  );
  html = html.replace(
    /<meta property="twitter:title" content="[^"]*"/,
    `<meta property="twitter:title" content="${title}"`
  );
  html = html.replace(
    /<meta property="twitter:description"[^>]*\/>/,
    `<meta property="twitter:description" content="${description}" />`
  );

  // Inject additional JSON-LD before </head>
  if (jsonLd) {
    const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`;
    html = html.replace('</head>', jsonLdScript);
  }

  // Write to dist
  const outputDir = join(DIST, ...path.split('/').filter(Boolean).slice(0, -1), path.split('/').filter(Boolean).pop());
  // For paths like /element/H, create dist/element/H/index.html
  const dir = join(DIST, ...path.split('/').filter(Boolean));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(join(dir, 'index.html'), html);
}

// Generate element pages
for (const el of elements) {
  const title = `${el.name} (${el.s}) - Atomic Number ${el.n}, Properties & Electron Configuration`;
  const description = `${el.name} (${el.s}): atomic number ${el.n}, atomic mass ${el.m} u. Electron configuration, electronegativity, melting point, boiling point, density, 3D Bohr model, and crystal structure. Free interactive reference for students and researchers.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": el.name,
    "alternateName": el.s,
    "description": description,
    "url": `${BASE_URL}/element/${el.s}`,
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Periodic Table of Elements",
      "url": BASE_URL
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Atomic Number", "value": el.n },
      { "@type": "PropertyValue", "name": "Symbol", "value": el.s },
      { "@type": "PropertyValue", "name": "Atomic Mass", "value": el.m },
      { "@type": "PropertyValue", "name": "Category", "value": el.cat }
    ]
  };
  generatePage(`/element/${el.s}`, title, description, jsonLd);
}

// Generate category pages
const categories = [
  'alkali-metal', 'alkaline-earth-metal', 'transition-metal',
  'post-transition-metal', 'metalloid', 'nonmetal', 'noble-gas',
  'lanthanide', 'actinide', 'unknown'
];

for (const cat of categories) {
  const internalCat = cat.replace(/-/g, ' ');
  const label = categoryLabels[internalCat] || cat;
  const catElements = elements.filter(el => el.cat === internalCat);
  const title = `${label} - Complete List, Properties & Electron Configurations`;
  const description = `All ${catElements.length} ${label} in the periodic table: ${catElements.slice(0, 5).map(e => e.name).join(', ')}${catElements.length > 5 ? ', and more' : ''}. Properties, electron configurations, 3D models. Free reference for chemistry students and teachers.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${label} - Periodic Table`,
    "description": description,
    "url": `${BASE_URL}/category/${cat}`,
    "numberOfItems": catElements.length,
    "itemListElement": catElements.map((el, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": `${el.name} (${el.s})`,
      "url": `${BASE_URL}/element/${el.s}`
    }))
  };
  generatePage(`/category/${cat}`, title, description, jsonLd);
}

// Generate series pages
for (const series of ['lanthanides', 'actinides']) {
  const label = series.charAt(0).toUpperCase() + series.slice(1);
  const seriesCat = series === 'lanthanides' ? 'lanthanide' : 'actinide';
  const seriesElements = elements.filter(el => el.cat === seriesCat);
  const title = `${label} Series - Periodic Table`;
  const description = `Explore the ${label} series: ${seriesElements.length} elements with detailed properties, 3D Bohr models, and crystal structures.`;
  generatePage(`/series/${series}`, title, description, null);
}

console.log(`Generated ${elements.length} element pages, ${categories.length} category pages, 2 series pages`);
console.log('Pre-rendering complete.');
