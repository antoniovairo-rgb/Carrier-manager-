#!/usr/bin/env node
/* [giro 26 PO-255, collaudo 169 D1 — decisione PO 15/10 «Solo versione, senza PROD»] GUARDIANO: il badge in basso a destra mostra
   solo «v <GAME_VERSION>», discreto, e svanisce come prima. Niente PROD/TEST, niente «KE».
   412x915 e 360x800, pagina della home: legge il testo del contenitore del badge (animazione cpmBadgeFade) a ~1 s e dopo ~10 s.
   VERDE: testo = «v <versione>», nessuna parola PROD/TEST/KE, e dopo 10 s invisibile. ROSSO (__CPM_NO_BADGE255): torna «PROD|TEST · KE».
   Foto prima (rosso) e dopo (verde) in docs/sviluppo/foto-giro26/. Uso: node badge-255.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const HTML = fs.readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');
const VER = (HTML.match(/const GAME_VERSION="([0-9.]+)"/) || [])[1];
const FOTO = new URL('../../docs/sviluppo/foto-giro26/', import.meta.url).pathname; fs.mkdirSync(FOTO, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(rosso, w, h) {
  const page = await b.newPage({ viewport: { width: w, height: h } }); await installCdnRoutes(page);
  await page.addInitScript(o => { window.__CPM_GLB = false; if (o.r) window.__CPM_NO_BADGE255 = 1; }, { r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(800);
  const leggi = () => page.evaluate(() => { const el = [...document.querySelectorAll('div')].find(d => (d.style.animation || '').includes('cpmBadgeFade'));
    if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    return { testo: el.innerText.replace(/\s+/g, ' ').trim(), opacita: +cs.opacity, visibilita: cs.visibility, w: Math.round(r.width), h: Math.round(r.height) }; });
  const a = await leggi();
  await page.screenshot({ path: `${FOTO}badge-${w}-${rosso ? 'prima' : 'dopo'}.png` }).catch(() => {});
  await sleep(10000); const z = await leggi(); await page.close(); return { a, z };
}
const esiti = []; const g = [];
for (const [w, h] of [[412, 915], [360, 800]]) {
  const V = await giro(false, w, h), R = await giro(true, w, h); esiti.push({ w, V, R });
  console.log(`${w}px VERDE ${JSON.stringify(V)}`); console.log(`${w}px ROSSO ${JSON.stringify(R)}`);
  if (!V.a) g.push(`${w} verde: badge non trovato`);
  else { if (V.a.testo !== `v ${VER}`) g.push(`${w} verde: testo «${V.a.testo}» invece di «v ${VER}»`);
    if (/\b(PROD|TEST|KE)\b/.test(V.a.testo)) g.push(`${w} verde: parola tecnica nel badge «${V.a.testo}»`);
    if (!(V.a.opacita > 0.5)) g.push(`${w} verde: badge non visibile all'avvio (opacità ${V.a.opacita})`);
    if (!V.z || !(V.z.opacita < 0.05 || V.z.visibilita === 'hidden')) g.push(`${w} verde: il badge non svanisce dopo 10 s ${JSON.stringify(V.z)}`); }
  if (!R.a || !/\b(PROD|TEST)\b/.test(R.a.testo) || !/KE/.test(R.a.testo)) g.push(`${w} rosso: il difetto non si vede ${JSON.stringify(R.a)}`);
}
await b.close(); srv.close();
if (g.length) { console.log('❌ badge-255'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(`✅ badge-255 verde (solo «v ${VER}», svanisce) e il rosso si vede (PROD/TEST · KE)`);
