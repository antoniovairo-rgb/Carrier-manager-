#!/usr/bin/env node
/* SONDA — QUANDO IL PALLONE ENTRA IN RETE, LA CAMERA STA GUARDANDO LI'?
   COLLAUDO PO (appunti 7.584, due volte): «altro gol che non si vede» · «il gol non si vede».
   LA DIAGNOSI CHE QUESTA SONDA SEPARA. Le misure fatte finora dicono che il PALLONE arriva in porta
   (`gol-573`: 8 gol su 8, ritardo mediano 1 tick). Se il PO non lo vede, il difetto non e' dove va il
   pallone: e' dove guarda la CAMERA quando ci arriva. Sono due cose diverse e finora nessuno le
   distingueva — per questo stavo cercando dalla parte sbagliata.
   COSA MISURA: nell'istante in cui il pallone e' dentro la porta, la distanza fra il punto guardato dalla
   camera (`camLook`, gia' nello stato) e il pallone. Guardare a trenta metri dal pallone significa che il
   gol succede fuori inquadratura, per quanto il pallone ci arrivi. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => {
  window.__CPM_GLB = false; window.__CPM_GOLV = [];
  setInterval(() => { try {
    const s = window.__CPM_STATE && window.__CPM_STATE();
    if (!s || !s.ball || !s.camLook) return;
    /* game-x 1,4 e 98,6 sono le linee di porta: «dentro la porta» e' oltre di esse */
    const gx = s.ball.x, gy = (s.ball.y != null ? s.ball.y : 50);
    /* [7.587.0] LA SCIA: ogni campione del pallone, sempre. Serve a misurare la RETTILINEITA' del percorso
       con cui il pallone raggiunge la rete — il PO scrive «tiro ad L nel finale, la traiettoria del gol non
       e' lineare», e un pallone che entra a gomito non si legge come un tiro, quindi il gol «non si vede»
       anche se il pallone arriva e la camera lo guarda (misurato: 8 gol su 8 arrivano, scarto camera 1,8u). */
    const S = window.__CPM_SCIA || (window.__CPM_SCIA = []);
    if (S.length < 4000) S.push({ x: +gx.toFixed(1), y: +gy.toFixed(1), ph: window.__CPM_PHASE && window.__CPM_PHASE() });
    if (gx == null || (gx < 95 && gx > 5)) return;
    const G = window.__CPM_GOLV; if (G.length > 400) return;
    G.push({ bx: +gx.toFixed(1), by: +gy.toFixed(1), i: S.length - 1,
             lx: +s.camLook.x.toFixed(1), lz: +s.camLook.z.toFixed(1), ph: window.__CPM_PHASE && window.__CPM_PHASE() });
  } catch (_e) {} }, 120);
});
await openMatch(page, port, { skipLoadAll: true, name: 'Gv' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const t0 = Date.now();
while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
const G = await page.evaluate(() => window.__CPM_GOLV || []);
const SCIA = await page.evaluate(() => window.__CPM_SCIA || []);
await b.close(); srv.close();

/* il pallone sta in coordinate di gioco (0-100), la camera in coordinate mondo: 1 unita' di gioco lungo x
   vale circa 0,986 metri, e la conversione la fa il gioco — qui basta il game-x del punto guardato. */
const X2G = wx => 50 + wx / 0.986;
console.log('\n=== QUANDO IL PALLONE E\' IN PORTA, LA CAMERA GUARDA LI\'? ===\n');
if (!G.length) { console.log('  ⚠ nessun campione col pallone dentro la porta: la sonda non misura niente.\n'); process.exit(1); }
const d = G.map(o => Math.abs(X2G(o.lx) - o.bx)).sort((a, c) => a - c);
const q = p => d[Math.min(d.length - 1, Math.floor(p * d.length))];
console.log('  campioni col pallone dentro la porta: ' + G.length);
console.log('  scarto fra il punto GUARDATO e il pallone, lungo il campo (unita\' di gioco, 1 ≈ 1 m):');
console.log('    minimo ' + d[0].toFixed(1) + '  ·  primo quarto ' + q(0.25).toFixed(1) + '  ·  MEDIANA ' + q(0.5).toFixed(1) + '  ·  terzo quarto ' + q(0.75).toFixed(1) + '  ·  massimo ' + d[d.length - 1].toFixed(1));
for (const s of [12, 25, 40]) {
  const n = d.filter(v => v > s).length;
  console.log('    campioni in cui la camera guarda oltre ' + String(s).padStart(2) + ' unita\' dal pallone: ' + String(n).padStart(3) + '/' + d.length + ' = ' + (100 * n / d.length).toFixed(0) + '%');
}
const fasi = {}; for (const o of G) fasi[o.ph || '?'] = (fasi[o.ph || '?'] || 0) + 1;
console.log('  fasi in cui succede: ' + Object.entries(fasi).sort((a, c) => c[1] - a[1]).map(([k, v]) => k + ' ' + v).join(' · '));
/* [7.587.0] RETTILINEITA' DELL'INGRESSO IN RETE. Per ogni primo campione «in porta», si guardano i venti
   campioni precedenti (≈2,4 s) e si confronta la distanza in linea d'aria col percorso davvero fatto:
   1,00 = il pallone e' andato dritto (un tiro); 0,50 = ha percorso il doppio della strada, cioe' una L. */
{
  const ingressi = [];
  let prev = -99;
  for (const o of G) { if (o.i - prev > 8) ingressi.push(o.i); prev = o.i; }
  const rette = [];
  for (const i of ingressi) {
    const a = Math.max(0, i - 20), seg = SCIA.slice(a, i + 1);
    if (seg.length < 6) continue;
    let perc = 0;
    for (let k = 1; k < seg.length; k++) perc += Math.hypot(seg[k].x - seg[k - 1].x, seg[k].y - seg[k - 1].y);
    const aria = Math.hypot(seg[seg.length - 1].x - seg[0].x, seg[seg.length - 1].y - seg[0].y);
    if (perc > 2) rette.push({ r: aria / perc, aria: +aria.toFixed(1), perc: +perc.toFixed(1), da: seg[0], a: seg[seg.length - 1] });
  }
  console.log('\n  --- COME ARRIVA IN RETE: dritto come un tiro, o a gomito? ---');
  console.log('  (1,00 = linea retta · 0,50 = ha percorso il doppio della distanza in linea d\'aria)');
  if (!rette.length) console.log('    nessun ingresso con scia sufficiente');
  else {
    for (const r of rette) console.log('    rettilineita\' ' + r.r.toFixed(2) + '  ·  in linea d\'aria ' + r.aria + 'u, percorso ' + r.perc + 'u  ·  da (' + r.da.x + ',' + r.da.y + ') a (' + r.a.x + ',' + r.a.y + ')');
    const v = rette.map(r => r.r).sort((a, c) => a - c);
    console.log('    mediana ' + v[v.length >> 1].toFixed(2) + '  ·  peggiore ' + v[0].toFixed(2) + '  su ' + v.length + ' ingressi');
  }
}
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
