#!/usr/bin/env node
/* MISSIONE «IL PALLONE E IL POSSESSO», FASE 1 — BASELINE DELLA CONTINUITA' DEL PADRONE.

   PERCHE' QUESTA GRANDEZZA E NON UN'ALTRA. `ball-attended` misura una FOTOGRAFIA: quanti campioni
   hanno un uomo entro 3 metri dalla palla (62,0% in cronaca col modello 7.526, 32% senza). E' una
   misura giusta ma cieca sul difetto vero: un pallone accudito da un uomo DIVERSO a ogni fotogramma
   e' «accudito» al 100% e non ha nessun padrone. Il possesso e' una grandezza NEL TEMPO — nel calcio
   dura secondi, non fotogrammi — e finche' il portatore e' ricostruito a valle per prossimita'
   geometrica, la sua identita' sfarfalla per costruzione. Qui si misura CHI ce l'ha e PER QUANTO.

   TRE NUMERI, per fase (cronaca `playing` · scena `hl_*`):
     (a) SENZA PADRONE — % di campioni con il piu' vicino oltre 3 m e palla NON in volo.
     (b) DURATA DEL POSSESSO — mediana della corsa di campioni consecutivi con lo STESSO padrone
         (solo campioni non in volo). E' il numero che un modello con proprietario deve alzare.
     (c) SFARFALLIO — cambi di padrone al secondo d'orologio fuori dal volo. Un cambio ogni pochi
         decimi non e' un contrasto: e' l'assenza di un proprietario.

   ⚠️ NON SI PUO' BARARE DICHIARANDO. La sonda non legge nessun campo «proprietario»: legge la
   GEOMETRIA (`__CPM_OWN`, palla e ventidue dalle stesse mesh — la trappola delle due sorgenti del
   7.322 e' gia' stata pagata). Un padrone dichiarato e non tenuto ai piedi non sposta questi numeri.

   ⚠️ SONDA CIECA. Sotto i 400 campioni per fase la sonda si dichiara cieca ed esce 2: «zero difetti»
   di un varco che non ha guardato e' il falso verde che questa casa ha gia' pagato tre volte.

   SOGLIE: nessuna. Questa passata e' di SOLA OSSERVAZIONE — stabilisce il numero da cui il piano di
   migrazione parte. Le soglie si dichiarano nel passo che le deve spostare, mai qui.

     CPM_CHROME=... PLAYWRIGHT_BROWSERS_PATH=... node continuita-padrone.mjs [CPM_MS=180000] [CPM_SEED=424]
   Prova del rosso del modello esistente:  CPM_NO526=1 node continuita-padrone.mjs
   (il portatore 7.526 sparisce dalla cronaca: (a) deve peggiorare e (b) deve accorciarsi.)          */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const MS   = +(process.env.CPM_MS || 180000);
const SEED = +(process.env.CPM_SEED || 424);
const PAS  = +(process.env.CPM_PASSO || 120);   /* ms fra due campioni */
const NO526 = !!process.env.CPM_NO526;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(n => {
  window.__CPM_GLB = false;
  window.__CPM_REC = true;              /* arma __CPM_ARC (il flag «palla in volo») */
  if (n) window.__CPM_NO526 = 1;
}, NO526);
await openMatch(page, port, { skipLoadAll: true, name: 'Padrone' });

await page.evaluate(([seed, passo]) => {
  window.__R = [];
  window.__CPM_AUTOPLAY(true, { seed, policy: 'seeded', tickMs: 350 });
  setInterval(() => {
    try {
      const o = window.__CPM_OWN && window.__CPM_OWN();
      if (!o) return;
      const a = window.__CPM_ARC;
      const volo = !!(a && a.arc) ? 1 : 0;
      window.__R.push({ i: o.i, d: o.d, ph: o.ph || null, v: volo, t: performance.now() });
    } catch (e) {}
  }, passo);
}, [SEED, PAS]);

await sleep(MS);
const R = await page.evaluate(() => window.__R || []);
await b.close(); srv.close();

/* ---- riduzione ---- */
const FASE = r => (r.ph === 'playing' ? 'cronaca'
  : (r.ph === 'hl_intro' || r.ph === 'hl_move' || r.ph === 'hl_choose' || r.ph === 'hl_result') ? 'scena' : null);

const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };

const conti = {};
for (const nome of ['cronaca', 'scena']) {
  const S = R.filter(r => FASE(r) === nome);
  if (!S.length) { conti[nome] = null; continue; }
  const soli = S.filter(r => r.d > 3 && !r.v).length;
  /* corse di padrone: solo campioni fuori dal volo, contigui nel tempo (buchi > 3 passi = taglio) */
  const corse = []; let cur = null, prev = null, cambi = 0, secTot = 0;
  for (const r of S) {
    const rotto = prev && (r.t - prev.t) > PAS * 3.5;
    if (prev && !rotto) secTot += (r.t - prev.t) / 1000;
    if (r.v) { if (cur) { corse.push(cur.n); cur = null; } prev = r; continue; }
    if (!cur || rotto || cur.i !== r.i) {
      if (cur) { corse.push(cur.n); if (!rotto) cambi++; }
      cur = { i: r.i, n: 0 };
    }
    cur.n++; prev = r;
  }
  if (cur) corse.push(cur.n);
  conti[nome] = {
    n: S.length,
    soli: +(100 * soli / S.length).toFixed(1),
    volo: +(100 * S.filter(r => r.v).length / S.length).toFixed(1),
    durata: +(med(corse) * PAS / 1000).toFixed(2),   /* secondi d'orologio */
    p90dur: +((corse.slice().sort((a, c) => a - c)[Math.floor(corse.length * 0.9)] || 0) * PAS / 1000).toFixed(2),
    cambi: +(cambi / Math.max(1, secTot)).toFixed(2), /* cambi di padrone al secondo */
    dmed: +med(S.map(r => r.d)).toFixed(1),
    sec: +secTot.toFixed(0),
  };
}

console.log(`\n=== CONTINUITA' DEL PADRONE · baseline fase 1${NO526 ? ' · ROSSO __CPM_NO526' : ''} ===`);
console.log(`campioni totali ${R.length} · passo ${PAS} ms · seed ${SEED}`);
let cieca = false;
for (const nome of ['cronaca', 'scena']) {
  const c = conti[nome];
  if (!c) { console.log(`${nome}: nessun campione`); cieca = true; continue; }
  if (c.n < 400) cieca = true;
  console.log(`\n[${nome}] campioni ${c.n} (${c.sec}s di orologio)`);
  console.log(`  senza padrone (>3 m, fuori dal volo) ....... ${c.soli}%`);
  console.log(`  in volo ................................... ${c.volo}%`);
  console.log(`  distanza mediana dal piu' vicino .......... ${c.dmed} m`);
  console.log(`  durata mediana di un possesso ............. ${c.durata}s  (p90 ${c.p90dur}s)`);
  console.log(`  sfarfallio (cambi di padrone al secondo) .. ${c.cambi}`);
}
if (cieca) { console.log('\n❌ SONDA CIECA: meno di 400 campioni in almeno una fase — la misura non vale.'); process.exit(2); }
console.log('\n✅ baseline registrata (sola osservazione: nessuna soglia da giudicare qui)');
