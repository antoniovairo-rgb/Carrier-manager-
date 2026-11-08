#!/usr/bin/env node
/* CPM — GRAFICA PER IL LISTING PLAY STORE (roadmap 1.9), brand granata Korward Elite.
   Produce in `store-assets/`:
     • play-icon-512.png   (512×512)    — icona alta risoluzione del listing
     • feature-graphic.png (1024×500)   — feature graphic obbligatoria del listing
   Gli SCREENSHOT vanno catturati dal gioco reale (≥2) — vedi PACKAGING.md.
   Uso:  CPM_CHROME=<chrome> node tools/gen-store-graphics.mjs */
import { launchBrowser } from '../tests/visual/lib/harness.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'store-assets');
mkdirSync(OUT, { recursive: true });

const grad = (id, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse"><stop stop-color="#a3263a"/><stop offset="1" stop-color="#5e0f1d"/></linearGradient>`;
const LOGO = `<g transform="translate(50 50) scale(0.92) translate(-51.75 -38.5)">/* [7.338.0] marchio più grande: stessa resa dell'icona dell'app (collaudo PO «icona troppo piccola») */
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

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100"><defs>${grad('g', 100, 100)}</defs><rect width="100" height="100" fill="url(#g)"/>${LOGO}</svg>`;

const FEATURE = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500"><defs>${grad('g', 1024, 0)}</defs>
  <rect width="1024" height="500" fill="url(#g)"/>
  <svg x="84" y="118" width="264" height="264" viewBox="0 0 100 100">${LOGO}</svg>
  <text x="392" y="232" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="104" letter-spacing="2" fill="#ffffff">KORWARD</text>
  <text x="398" y="292" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="27" letter-spacing="4.5" fill="#ffd9e0">ELITE · FOOTBALL CAREER</text>
  <text x="398" y="346" font-family="Arial,Helvetica,sans-serif" font-weight="500" font-size="27" letter-spacing="1" fill="#f3cdd4" opacity="0.92">From prospect to legend</text>
</svg>`;


/* PNG -> PNG RGBA (colour type 6): decodifica i filtri di riga, aggiunge alfa=255 se manca, ricodifica con filtro 0. Solo 8 bit, non interlacciato. */
function pngConAlfa(png) {
  const sig = png.subarray(0, 8); let o = 8, ihdr, idat = [];
  while (o < png.length) { const len = png.readUInt32BE(o), t = png.toString('latin1', o + 4, o + 8), d = png.subarray(o + 8, o + 8 + len); if (t === 'IHDR') ihdr = d; if (t === 'IDAT') idat.push(d); o += 12 + len; }
  const w = ihdr.readUInt32BE(0), h = ihdr.readUInt32BE(4), ct = ihdr[9];
  if (ihdr[8] !== 8 || ihdr[12] !== 0 || (ct !== 2 && ct !== 6)) throw new Error('PNG non gestito (bit/colour type/interlace)');
  if (ct === 6) return png;
  const bpp = 3, raw = inflateSync(Buffer.concat(idat)), stride = w * bpp, cur = Buffer.alloc(stride), prev = Buffer.alloc(stride);
  const out = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)]; raw.copy(cur, 0, y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let x = cur[i];
      if (f === 1) x += a; else if (f === 2) x += b; else if (f === 3) x += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); x += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      cur[i] = x & 255;
    }
    out[y * (1 + w * 4)] = 0;
    for (let x = 0; x < w; x++) { const q = y * (1 + w * 4) + 1 + x * 4; out[q] = cur[x * 3]; out[q + 1] = cur[x * 3 + 1]; out[q + 2] = cur[x * 3 + 2]; out[q + 3] = 255; }
    cur.copy(prev);
  }
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = b => { let c = -1; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (t, d) => { const h4 = Buffer.alloc(8); h4.writeUInt32BE(d.length, 0); h4.write(t, 4, 'latin1'); const c4 = Buffer.alloc(4); c4.writeUInt32BE(crc(Buffer.concat([h4.subarray(4), d])), 0); return Buffer.concat([h4, d, c4]); };
  const nh = Buffer.from(ihdr); nh[9] = 6;
  return Buffer.concat([sig, chunk('IHDR', nh), chunk('IDAT', deflateSync(out)), chunk('IEND', Buffer.alloc(0))]);
}

const ASSETS = [['play-icon-512.png', 512, 512, ICON], ['feature-graphic.png', 1024, 500, FEATURE]];

const browser = await launchBrowser();
const page = await browser.newPage();
console.log('=== GRAFICA LISTING PLAY STORE (granata) ===');
for (const [name, w, h, svg] of ASSETS) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><style>*{margin:0;padding:0}</style>${svg}`, { waitUntil: 'load' });
  /* [giro 116 — PO-322] Google chiede per l'icona un PNG a 32 bit CON canale alfa (answer/9866151); per la feature graphic un 24 bit SENZA alfa.
     Chrome salva un PNG RGB quando l'immagine e' tutta opaca: per l'icona si forza il formato RGBA (colour type 6, alfa=255 dove e' piena). */
  let buf = await page.screenshot({ clip: { x: 0, y: 0, width: w, height: h }, omitBackground: name.startsWith('play-icon') });
  if (name.startsWith('play-icon')) buf = pngConAlfa(buf);
  writeFileSync(join(OUT, name), buf);
  console.log(`  ✔ store-assets/${name}  (${w}×${h})`);
}
await browser.close();
console.log('✅ grafica listing pronta in store-assets/ — mancano solo ≥2 screenshot dal gioco');
