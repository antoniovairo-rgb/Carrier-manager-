#!/usr/bin/env node
/* CENSIMENTO DEL PASSO DELLA CAMERA — quanto vale il movimento NORMALE, e quindi dove va la soglia.

   PERCHE'. Il taccuino automatico del PO etichetta «codice 007 — la CAMERA salta» ogni volta che il passo
   fra due fotogrammi supera 1,2 unita' (r.~8599). Quella soglia non e' stata misurata: il 7.408 l'ha
   abbassata da 2,5 a 1,2 su un'ipotesi («o il tremolio sta sotto le soglie vecchie»). Da allora quasi ogni
   nota del PO nasce con una riga-camera attaccata — 1,4 · 2,0 · 2,0 · 2,2 unita' nell'ultimo lotto — mentre
   il difetto che lui descrive a parole e' un altro (il portiere, la rincorsa, il pallone che viaggia da
   solo). Una riga che scatta quasi sempre non informa: nasconde.

   COSA FA. Gioca partite VERE (provino → `playing` col clock reale → highlight reattivi), lascia
   accumulare le scene nel testimone di bordo (`__CPM_WATCH_SNAP`) e poi fa girare IL DETECTOR VERO
   (`draftBugNote`, esposto come `__CPM_DRAFTNOTE`) su OGNI scena, una per una. Non riscrive la matematica
   del detector: la esegue. Poi stampa la distribuzione dei passi e quante scene sane verrebbero
   etichettate a ciascuna soglia candidata.

   NON E' UN GUARDIANO e non giudica: e' il censimento su cui si sceglie un numero.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node camera-step-census-test.mjs                       */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const SCENE_TARGET = +(process.env.CPM_SCENES || 40);
const BUDGET_MS = +(process.env.CPM_BUDGET_MS || 900000);/* il budget e' il TEMPO, non il numero di giri */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message));
/* il testimone di bordo (`__CPM_WATCH_SNAP`) esiste solo con i DEVTOOLS accesi (`_DEVT344`): senza
   questa riga la sonda gira e non guarda niente — la stessa forma di trappola gia' pagata col cine. */
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {} });
await openMatch(page, port, { skipLoadAll: true });
await sleep(700);

/* si gioca: ogni giro arma un highlight reattivo e lo risolve, cosi' le scene entrano nel testimone */
let secchi = 0, partite = 1, scene = 0;
const righe = [];
/* ⚠️ [7.495.0 F1] LA FASE SI LEGGE DA `__CPM_PHASE`, NON DA `__CPM_STATE`. Quest'ultima la espone dalle
   props del 3D e `show3D` non include `ended`: a partita finita il componente si smonta e la funzione
   resta congelata sull'ultimo valore. Il ciclo aspettava che tornasse `playing` — cosa che non poteva
   accadere — e la passata chiudeva con «nessuna scena utilizzabile nel testimone». Su `ended` si riapre
   subito. E il budget diventa TEMPO: con partite che finiscono dopo 2-3 highlight, il conto dei giri lo
   consumavano le attese a vuoto, non le scene. */
const t0run = Date.now();
while (scene < SCENE_TARGET && Date.now() - t0run < BUDGET_MS) {
  const ph = await matchPhase(page);
  if (ph === 'ended' || ph === 'ceremony' || ph === 'shootout') { secchi = 0; partite++; try { await openMatch(page, port, { skipLoadAll: true }); await sleep(700); } catch (e) { break; } continue; }
  if (ph == null) {
    if (++secchi >= 12) { secchi = 0; partite++; try { await openMatch(page, port, { skipLoadAll: true }); await sleep(700); } catch (e) { break; } }
    else await sleep(700);
    continue;
  }
  secchi = 0;
  /* ⚠️ il cancello su `playing` affamava anche questo censimento: armata la coda, fra un highlight e il
     successivo passa meno di 1,5 s di gioco fluido. Si arma quando capita, si procede da qualunque fase. */
  if (ph === 'playing') await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const ok = await page.waitForFunction(() => {
    try { return window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose'; } catch (e) { return false; }
  }, { timeout: 30000 }).then(() => true).catch(() => false);
  if (!ok) { await sleep(600); continue; }
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
  await page.waitForFunction(() => { try { return !window.__CPM_PHASE || window.__CPM_PHASE() !== 'hl_result'; } catch (e) { return true; } }, { timeout: 25000 }).catch(() => {});
  scene++;
  await sleep(200);
  /* ⚠️ IL CAMPIONE SI PRENDE QUI, non alla fine: `openMatch` ricarica la pagina per aprire la partita
     successiva e l'anello del testimone riparte da zero — fotografando dopo il ciclo si trovava il
     testimone VUOTO (due passate buttate cosi'). Ogni scena si porta via il suo dato appena chiusa. */
  const r = await page.evaluate(() => {
    const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP();
    if (!snap || !snap.samples || !snap.samples.length) return null;
    const S = snap.samples;
    const ks = S.map(s => s.sk).filter(k => k != null && k >= 0);
    if (!ks.length) return null;
    const k = Math.max(...ks);                       /* la scena appena giocata */
    const W = S.filter(s => s.sk === k);
    if (W.length < 8) return null;
    let txt = '';
    try { txt = window.__CPM_DRAFTNOTE(snap, { sceneKey: k }) || ''; } catch (e) { txt = 'ERR ' + e.message; }
    /* stessa matematica del detector (r.~8595) ma tenendo ANCHE il dt: il passo grezzo per fotogramma
       dipende dal frame-rate, la velocita' no. Si saltano i primi 750ms, la finestra in cui `nearSnap`
       esclude gli stacchi voluti. */
    const t0 = W[0].t; let pMax = 0, vMax = 0, dtSum = 0, nn = 0;
    /* [7.475.0] stessa matematica del detector anche per l'ASSE DI SGUARDO (yaw), che e' la sotto-riga
       del codice 007 rimasta aperta dal 7.471: inversioni al secondo e ampiezza massima per fotogramma.
       Il contatore di inversioni dipende dal FRAME-RATE per costruzione — piu' fotogrammi, piu' cambi di
       segno possibili — ed e' la stessa forma di errore che il censimento 7.463 ha trovato sul passo. */
    let yRev = 0, yMax = 0, yPrev = 0, dur = 0;
    for (let i = 1; i < W.length; i++) {
      const a = W[i - 1], b = W[i], dt = (b.t - a.t) / 1000;
      if (dt <= 0 || dt > 0.5 || b.cx == null || a.cx == null) continue;
      if (b.t - t0 < 750) continue;
      const d = Math.hypot(b.cx - a.cx, (b.cy - a.cy) || 0, (b.cz - a.cz) || 0);
      if (d > pMax) pMax = d;
      if (d / dt > vMax) vMax = d / dt;
      dtSum += dt; nn++; dur += dt;
      if (b.lx != null && a.lx != null) {
        const y1 = Math.atan2(a.lz - a.cz, a.lx - a.cx), y2 = Math.atan2(b.lz - b.cz, b.lx - b.cx);
        let dy = y2 - y1; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI;
        if (Math.abs(dy) > 0.006) { if (yPrev && Math.sign(dy) !== Math.sign(yPrev)) yRev++; yPrev = dy; }
        if (Math.abs(dy) > yMax) yMax = Math.abs(dy);
      }
    }
    return { k, n: W.length, cam: txt.split('\n').filter(l => /CAMERA|camera|SGUARDO/.test(l)), pMax, vMax, dtMed: nn ? dtSum / nn : null,
      yRevS: dur > 0.5 ? yRev / dur : 0, yMaxDeg: yMax * 57.3 };
  });
  if (r) righe.push(r);
}

const out = { righe, tot: righe.reduce((a, r) => a + r.n, 0) };

await b.close(); srv.close();
const R = out.righe.filter(r => r.pMax > 0);
/* [7.495.0 F1] E un PAVIMENTO di copertura, non solo «zero scene». Una banda normale calcolata su due
   scene non e' una banda normale: le percentuali che questo censimento stampa (2/2 = 100%) sono
   indistinguibili dal caso. Meta' del bersaglio, mai sotto tre. */
const MIN_SCENE = Math.max(3, Math.floor(SCENE_TARGET / 2));
if (!R.length) { console.log('❌ nessuna scena utilizzabile nel testimone'); process.exit(2); }
if (R.length < MIN_SCENE) { console.log(`\n❌ COPERTURA INSUFFICIENTE: ${R.length} scene su un minimo di ${MIN_SCENE} — una banda normale su cosi' poche scene non e' una banda`); process.exit(2); }
const conRiga = out.righe.filter(r => r.cam.length).length;
const q = (arr, p) => { const a = arr.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(a.length * p))]; };
const passi = R.map(r => r.pMax), vel = R.map(r => r.vMax), dts = R.map(r => r.dtMed).filter(Boolean);
console.log(`\n=== CENSIMENTO CAMERA — ${R.length} scene su ${partite} partita/e (${out.tot} campioni) ===`);
console.log(`scene che la bozza etichetta con una riga-camera: ${conRiga}/${out.righe.length}  (${(100 * conRiga / out.righe.length).toFixed(0)}%)`);
console.log(`intervallo fra campioni: mediana ${(q(dts, 0.5) * 1000).toFixed(0)}ms  ⇒  ~${(1 / q(dts, 0.5)).toFixed(0)} campioni/s`);
console.log(`\nPASSO per fotogramma (cio' che il detector giudica oggi) — mediana ${q(passi, .5).toFixed(2)} · p90 ${q(passi, .9).toFixed(2)} · max ${Math.max(...passi).toFixed(2)}u`);
console.log(`VELOCITA' della camera (indipendente dal frame-rate)      — mediana ${q(vel, .5).toFixed(1)} · p90 ${q(vel, .9).toFixed(1)} · max ${Math.max(...vel).toFixed(1)} u/s`);
console.log('\nquante scene SANE verrebbero etichettate, per soglia di PASSO:');
for (const s of [1.2, 1.5, 2.0, 2.5, 3.0, 4.0, 6.0]) {
  const n = passi.filter(v => v >= s).length;
  console.log(`  ${s.toFixed(1)}u → ${n}/${R.length} (${(100 * n / R.length).toFixed(0)}%)${s === 1.2 ? '   ← in vigore dal 7.408' : ''}`);
}
console.log('\nquante scene SANE verrebbero etichettate, per soglia di VELOCITA\':');
for (const s of [20, 30, 40, 60, 80, 120]) {
  const n = vel.filter(v => v >= s).length;
  console.log(`  ${s} u/s → ${n}/${R.length} (${(100 * n / R.length).toFixed(0)}%)`);
}
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
const yr = R.map(r => r.yRevS), ym = R.map(r => r.yMaxDeg);
console.log(`\nSGUARDO (asse ottico) — inversioni/s: mediana ${q(yr, .5).toFixed(1)} · p90 ${q(yr, .9).toFixed(1)} · max ${Math.max(...yr).toFixed(1)}   (soglia in vigore: 2,0)`);
console.log(`                        ampiezza max per fotogramma: mediana ${q(ym, .5).toFixed(1)}° · p90 ${q(ym, .9).toFixed(1)}° · max ${Math.max(...ym).toFixed(1)}°`);
console.log('quante scene SANE verrebbero etichettate, per soglia di INVERSIONI/s dello sguardo:');
for (const sgl of [2, 4, 6, 8, 10, 15, 20]) { const n = yr.filter(v => v >= sgl).length; console.log(`  ${sgl} /s → ${n}/${R.length} (${(100 * n / R.length).toFixed(0)}%)${sgl === 2 ? '   ← in vigore' : ''}`); }
console.log('\n→ le note del PO riportano 1,4 · 2,0 · 2,0 · 2,2 e un 14,3: se la banda normale arriva fin li\',');
console.log('  le prime quattro sono la camera che fa il suo mestiere e solo il 14,3 e\' un difetto.');
