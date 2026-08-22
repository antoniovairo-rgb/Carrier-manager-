#!/usr/bin/env node
/* 7.547 — LA TINTA DEL ROSSO. Collaudo PO, quarta segnalazione sui colori: «il rosso del Liverpool
   sembra quasi arancione. Sistema definitivamente saturazione, luminosita', ecc».

   ⚠️ PERCHE' LE MISURE PRECEDENTI NON POTEVANO VEDERLO. Dal 7.539 i colori si misurano con TRE numeri:
   saturazione, luminosita', contrasto. «Il rosso sembra arancione» e' uno SPOSTAMENTO DI TINTA, e nessuno
   dei tre lo cattura: un rosso puo' avere saturazione, luminosita' e contrasto perfetti ed essere
   diventato arancione. Le misure dicevano «a posto» perche' guardavano le grandezze sbagliate.

   IL SOSPETTO, con un precedente scritto. ACES ha un comportamento documentato: i rossi molto saturi
   vengono spinti verso l'arancione salendo di luminosita'. Nel 7.539 avevo gia' dichiarato «contrasto
   piatto -5%/-10%: e' ACES che comprime verso il bianco» e l'avevo lasciato aperto. Stesso colpevole,
   altra faccia.

   COSA MISURA. Il kit di FC Merseyside e' `#dc2626`: tinta NOMINALE 0 gradi, rosso puro. La sonda isola i
   pixel della maglia sul campo e ne misura la tinta MEDIANA, poi la confronta col nominale. Ripete su
   tutti e quattro i tone mapping disponibili (`__CPM_TM552`) a ora congelata (`__CPM_TOD`), riportando
   anche saturazione e luminosita' perche' un tone mapping che raddrizza la tinta ma slava tutto non
   serve a niente. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, freeze } from './lib/harness.mjs';
import { PNG } from 'pngjs'; import fs from 'node:fs';
const SCENE = [0, 30, 120];
const DIR = '/tmp/claude-0/-home-user/6dd74479-f58d-5f3f-a846-19342f6001fd/scratchpad';
const NOMINALE = 0;            /* #dc2626 -> tinta 0 gradi */
const TOD = process.env.CPM_TOD || 'day';

function hsv(R, G, B) {
  const mx = Math.max(R, G, B), mn = Math.min(R, G, B), d = mx - mn;
  let h = 0;
  if (d > 1e-6) {
    if (mx === R) h = 60 * (((G - B) / d) % 6);
    else if (mx === G) h = 60 * ((B - R) / d + 2);
    else h = 60 * ((R - G) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: mx === 0 ? 0 : d / mx, v: mx };
}
const med = a => a.length ? a.slice().sort((x, y) => x - y)[a.length >> 1] : null;
/* differenza angolare con segno: positiva = la tinta e' scivolata verso l'ARANCIONE */
const dHue = (h, rif) => { let d = h - rif; while (d > 180) d -= 360; while (d < -180) d += 360; return d; };

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();

async function braccio(tm, expo, no570, k570) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(a => {
    window.__CPM_GLB = false; window.__CPM_TOD = a.tod;
    if (a.tm) window.__CPM_TM552 = a.tm;
    if (a.expo) window.__CPM_EXPO552 = a.expo;
    if (a.no570) window.__CPM_NO570 = 1;
    if (a.k570 != null) window.__CPM_K570 = a.k570;
  }, { tod: TOD, tm, expo, no570: arguments[2], k570: arguments[3] });
  await openMatch(page, port, { name: 'SatFix' });   /* stesso nome delle sonde colore: il seed nasce anche dal nome */
  const hues = []; let sSum = 0, vSum = 0, n = 0;
  for (const gi of SCENE) {
    await forceSituation(page, gi, { settle: 900, choose: true });
    await freeze(page);
    const f = `${DIR}/tinta-${tm || 'aces'}-${expo || 'def'}-${gi}.png`;
    await page.screenshot({ path: f });
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    const png = PNG.sync.read(fs.readFileSync(f));
    const W = png.width;
    for (let i = 0; i < png.data.length; i += 4) {
      const y = Math.floor((i / 4) / W);
      if (y < png.height * 0.48) continue;              /* solo il CAMPO: sopra ci sono tribune e HUD */
      const R = png.data[i] / 255, G = png.data[i + 1] / 255, B = png.data[i + 2] / 255;
      const { h, s, v } = hsv(R, G, B);
      if (v < 0.10) continue;
      sSum += s; vSum += v; n++;
      /* la maglia: pixel rossastri e vivi, esclusi erba, linee bianche e ombre */
      if (s > 0.35 && v > 0.18 && (h <= 60 || h >= 330)) hues.push(h);
    }
  }
  await page.close();
  /* ISTOGRAMMA invece della sola mediana: se le popolazioni sono DUE — l'incarnato dei ventidue
     (banda 20-35, saturo) e il kit — la mediana le mescola e non misura ne' l'una ne' l'altra. */
  const bande = new Array(24).fill(0);
  for (const h of hues) { const k = Math.floor(((h + 360) % 360) / 15); bande[k]++; }
  return { tm: (no570 ? 'ROSSO-verde pieno' : (k570 != null ? 'k=' + k570 : 'rimedio k=0.30')), expo: expo || 0.52, h: med(hues), n: hues.length, S: sSum / n, V: vSum / n, bande };
}

const bracci = [];
for (const a of [[null, null, 1, null], [null, null, 0, null], [null, null, 0, 0.15], [null, null, 0, 0.0]]) {
  bracci.push(await braccio(a[0], a[1], a[2], a[3]));
}
srv.close(); await b.close();

console.log(`\n=== LA TINTA DEL ROSSO · ora congelata: ${TOD} · nominale #dc2626 = ${NOMINALE} gradi ===\n`);
console.log('  tonemap    espo   tinta   scarto dal nominale        sat     lum    pixel');
for (const r of bracci) {
  if (r.h == null) { console.log(`  ${r.tm.padEnd(20)} ${String(r.expo).padEnd(6)} nessun pixel di maglia isolato`); continue; }
  const d = dHue(r.h, NOMINALE);
  const verso = d > 3 ? 'verso ARANCIONE' : d < -3 ? 'verso magenta' : 'in tinta';
  console.log(`  ${r.tm.padEnd(20)} ${String(r.expo).padEnd(6)} ${r.h.toFixed(1).padStart(5)}   ${(d >= 0 ? '+' : '') + d.toFixed(1)}  ${verso.padEnd(16)} ${r.S.toFixed(3)}  ${r.V.toFixed(3)}  ${r.n}`);
}
for (const r of bracci) {
  if (!r.bande) continue;
  console.log(`\n  istogramma delle tinte · ${r.tm} (bande da 15 gradi, solo le non vuote):`);
  r.bande.forEach((c, k) => { if (c > r.n * 0.02) console.log(`    ${String(k * 15).padStart(3)}-${String(k * 15 + 15).padStart(3)}  ${'#'.repeat(Math.round(c / r.n * 60))} ${(c / r.n * 100).toFixed(0)}%`); });
}
console.log('\n  Se ci sono DUE picchi, uno e\' l\'incarnato dei ventidue e l\'altro il kit: la mediana');
console.log('  li mescolava e non misurava ne\' l\'uno ne\' l\'altro.');
