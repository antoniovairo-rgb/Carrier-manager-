#!/usr/bin/env node
/* ============================================================================
   CPM — BUILD DI PACKAGING (roadmap Play Store 1.1 + 1.2)
   ----------------------------------------------------------------------------
   Produce dist/index.html SELF-CONTAINED e OFFLINE per il packaging (Capacitor/AAB):
     • 1.1 PRECOMPILA il JSX offline (@babel/standalone, preset react) → niente Babel-in-browser
     • 1.2 INLINE React/ReactDOM/Three/GLTFLoader/SkeletonUtils dai node_modules locali → niente CDN
   Il SORGENTE (CARRIER-MANAGER-AV.html) resta INVARIATO: questa è una build separata.
   Le librerie locali sono le devDependencies del gate (tests/visual/node_modules), versioni esatte
   che il sorgente fissa (react/react-dom 18.2.0, three 0.128.0, @babel/standalone 7.23.6).
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NM = path.join(ROOT, 'tests', 'visual', 'node_modules');
const require = createRequire(import.meta.url);
const Babel = require(path.join(NM, '@babel', 'standalone'));
const SRC = path.join(ROOT, 'CARRIER-MANAGER-AV.html');
const DIST = path.join(ROOT, 'dist');
const lib = p => fs.readFileSync(path.join(NM, p), 'utf8');

const t0 = Date.now();
let html = fs.readFileSync(SRC, 'utf8');
const srcKB = (Buffer.byteLength(html) / 1024) | 0;

// ---- 1.1 — estrai e PRECOMPILA il blocco JSX (<script type="text/babel">) ----
const BABEL_TAG = '<script type="text/babel" data-presets="react">';
const bStart = html.indexOf(BABEL_TAG);
if (bStart < 0) { console.error('FATAL: blocco <script type="text/babel"> non trovato'); process.exit(1); }
const contentStart = bStart + BABEL_TAG.length;
const bClose = html.lastIndexOf('</script>'); // il blocco babel è l'ultimo script (subito prima di </body>)
if (bClose <= contentStart) { console.error('FATAL: chiusura </script> del blocco babel non trovata'); process.exit(1); }
const jsx = html.slice(contentStart, bClose);
console.log(`JSX estratto: ${(Buffer.byteLength(jsx) / 1024) | 0} KB → transpilazione...`);
let compiled;
try { compiled = Babel.transform(jsx, { presets: ['react'], compact: false, comments: false, sourceMaps: false }).code; }
catch (e) { console.error('FATAL: transpilazione Babel fallita:', e.message); process.exit(1); }
console.log(`JSX transpilato: ${(Buffer.byteLength(compiled) / 1024) | 0} KB`);

// ---- 1.2 — inline delle librerie locali al posto delle CDN ----
// blocco CDN: dal commento BL-01 (riga ~60) fino al fallback babel (riga ~70). Lo sostituiamo con i bundle locali inline.
const cdnStart = html.indexOf('<!-- 5.39.1 (BL-01)');
const cdnEndAnchor = "document.write('<script src=\"https://cdn.jsdelivr.net/npm/@babel/standalone";
const cdnEndLine = html.indexOf(cdnEndAnchor);
if (cdnStart < 0 || cdnEndLine < 0) { console.error('FATAL: blocco CDN non individuato (ancore cambiate?)'); process.exit(1); }
const cdnEnd = html.indexOf('</script>', cdnEndLine) + '</script>'.length;
const inlined = [
  '<!-- BUILD PACKAGING: librerie inline dai node_modules locali (offline, niente CDN). Babel-standalone RIMOSSO: JSX precompilato. -->',
  `<script>${lib('react/umd/react.production.min.js')}</script>`,
  `<script>${lib('react-dom/umd/react-dom.production.min.js')}</script>`,
  `<script>${lib('three/build/three.min.js')}</script>`,
  `<script>${lib('three/examples/js/loaders/GLTFLoader.js')}</script>`,
  `<script>${lib('three/examples/js/utils/SkeletonUtils.js')}</script>`,
].join('\n');

// ---- assembla la dist (sostituzioni dalla FINE verso l'INIZIO per non invalidare gli indici) ----
html = html.slice(0, bStart) + '<script>\n' + compiled + '\n</script>' + html.slice(bClose + '</script>'.length);
html = html.slice(0, cdnStart) + inlined + html.slice(cdnEnd);
// 1.6 — flag BUILD STORE: disattiva la feature AI (zero chiamate esterne, Data Safety "nessun dato").
html = html.replace('<head>', '<head>\n<script>window.__CPM_STORE_BUILD=true;/* build store offline: feature AI disattivata (roadmap 1.6) */</script>');

// ---- scrivi dist + copia assets/ e sw.js ----
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), html);
const assetsSrc = path.join(ROOT, 'assets');
if (fs.existsSync(assetsSrc)) fs.cpSync(assetsSrc, path.join(DIST, 'assets'), { recursive: true });
for (const f of ['sw.js']) { const s = path.join(ROOT, f); if (fs.existsSync(s)) fs.copyFileSync(s, path.join(DIST, f)); }

const outKB = (Buffer.byteLength(html) / 1024) | 0;
const hasCDN = /https?:\/\/(cdnjs|cdn\.jsdelivr)/.test(html);
const hasBabelTag = html.includes('type="text/babel"');
console.log(`\n=== BUILD DIST ===`);
console.log(`sorgente ${srcKB}KB → dist/index.html ${outKB}KB · assets copiati: ${fs.existsSync(path.join(DIST, 'assets'))}`);
console.log(`CDN residue: ${hasCDN ? '❌ ANCORA PRESENTI' : '✅ nessuna'} · Babel-in-browser: ${hasBabelTag ? '❌ ancora presente' : '✅ rimosso (JSX precompilato)'}`);
console.log(`tempo ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (hasCDN || hasBabelTag) process.exit(2);
console.log('✅ dist offline pronta per il packaging (1.3 Capacitor)');
