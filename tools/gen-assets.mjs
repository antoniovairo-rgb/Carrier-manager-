#!/usr/bin/env node
/* CPM — GENERA le immagini sorgente icona/splash di Korward Elite (GRANATA) per il packaging Android.
   Rasterizza il MARCHIO reale del gioco (barre + pallone, gradiente granata #a3263a→#5e0f1d) via Chromium
   in `assets/`, che `@capacitor/assets` espande poi in tutte le densità Android (mipmap + drawable).
   Produce: icon-only.png · icon-foreground.png · icon-background.png · splash.png · splash-dark.png
   Uso:  CPM_CHROME=<chrome> node tools/gen-assets.mjs   (riusa il Chromium del gate) */
import { launchBrowser } from '../tests/visual/lib/harness.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// NB: cartella dedicata `resources/` — NON `assets/` (che è la cartella dei GLB del gioco)
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'resources');
mkdirSync(OUT, { recursive: true });

const GRAD = `<linearGradient id="g" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stop-color="#a3263a"/><stop offset="1" stop-color="#5e0f1d"/></linearGradient>`;
// MARCHIO Korward Elite (3 barre bianche che salgono + pallone — il badge LogoMark del gioco), nel viewBox 0..100 — identico al logo del gioco
const LOGO = `<g transform="translate(50 52) scale(0.8) translate(-51.75 -38.5)">
  <rect x="24" y="46" width="15" height="26" rx="7" fill="#fff"/>
  <rect x="43" y="36" width="15" height="36" rx="7" fill="#fff"/>
  <rect x="62" y="24" width="15" height="48" rx="7" fill="#fff"/>
  <circle cx="69.5" cy="15" r="10" fill="#fff" stroke="#1e293b" stroke-width="1.3"/>
  <clipPath id="ballclip"><circle cx="69.5" cy="15" r="10"/></clipPath>
  <g fill="#1e293b" clip-path="url(#ballclip)">
    <polygon points="69.5,11.6 72.73,13.95 71.5,17.75 67.5,17.75 66.27,13.95"/>
    <polygon points="73.44,9.58 72.24,5.89 75.38,3.61 78.52,5.89 77.32,9.58"/>
    <polygon points="75.87,17.07 79.01,14.79 82.15,17.07 80.95,20.76 77.07,20.76"/>
    <polygon points="69.5,21.7 72.64,23.98 71.44,27.67 67.56,27.67 66.36,23.98"/>
    <polygon points="63.13,17.07 61.93,20.76 58.05,20.76 56.85,17.07 59.99,14.79"/>
    <polygon points="65.56,9.58 61.68,9.58 60.48,5.89 63.62,3.61 66.76,5.89"/>
  </g>
</g>`;

const svg = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100"><defs>${GRAD}</defs>${inner}</svg>`;

// badge granata (rect arrotondato + marchio) usato negli splash, centrato in (cx,cy) con lato `s`
const badge = (cx, cy, s) =>
  `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="${s * 0.26}" fill="url(#g)"/>` +
  `<svg x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" viewBox="0 0 100 100">${LOGO}</svg>`;

const wordmark = (col) =>
  `<text x="50" y="69" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="8.5" letter-spacing="1.5" fill="${col}">KORWARD</text>` +
  `<text x="50" y="75" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="2.3" letter-spacing="1.0" fill="${col}" opacity="0.85">ELITE · FOOTBALL CAREER</text>`;

// definizione degli asset: [file, larghezza, altezza, contenuto SVG, sfondo trasparente?]
const ASSETS = [
  ['icon-only.png',       1024, 1024, `<rect width="100" height="100" fill="url(#g)"/>${LOGO}`,          false],
  ['icon-background.png', 1024, 1024, `<rect width="100" height="100" fill="url(#g)"/>`,                 false],
  // foreground: marchio bianco ridotto al 64% (safe-zone adaptive icon), sfondo trasparente
  ['icon-foreground.png', 1024, 1024, `<g transform="translate(50 50) scale(0.64) translate(-50 -50)">${LOGO}</g>`, true],
  ['splash.png',          2732, 2732, `<rect width="100" height="100" fill="#f0f7ff"/>${badge(50, 42, 30)}${wordmark('#8e1f33')}`, false],
  ['splash-dark.png',     2732, 2732, `<rect width="100" height="100" fill="#0f172a"/>${badge(50, 42, 30)}${wordmark('#ffffff')}`, false],
];

const browser = await launchBrowser();
const page = await browser.newPage();
console.log('=== GENERAZIONE ASSET ICONA/SPLASH (granata) ===');
for (const [name, w, h, inner, transparent] of ASSETS) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><style>*{margin:0;padding:0}</style>${svg(w, h, inner)}`, { waitUntil: 'load' });
  const buf = await page.screenshot({ omitBackground: !!transparent, clip: { x: 0, y: 0, width: w, height: h } });
  writeFileSync(join(OUT, name), buf);
  console.log(`  ✔ resources/${name}  (${w}×${h}${transparent ? ', trasparente' : ''})`);
}
await browser.close();
console.log('✅ asset sorgente pronti in resources/ — genera le risorse Android con:  npx capacitor-assets generate --assetPath resources --android');
