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
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const SCENE_TARGET = +(process.env.CPM_SCENES || 40);

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
for (let round = 0; round < SCENE_TARGET * 4 && scene < SCENE_TARGET; round++) {
  const inPlay = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; });
  if (!inPlay) {
    if (++secchi >= 12) { secchi = 0; partite++; try { await openMatch(page, port, { skipLoadAll: true }); await sleep(700); } catch (e) { break; } }
    else await sleep(700);
    continue;
  }
  secchi = 0;
  await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const ok = await page.waitForFunction(() => {
    try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'hl_choose'; } catch (e) { return false; }
  }, { timeout: 30000 }).then(() => true).catch(() => false);
  if (!ok) { await sleep(600); continue; }
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
  await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase !== 'hl_result'; } catch (e) { return true; } }, { timeout: 25000 }).catch(() => {});
  scene++;
  await sleep(200);
  /* lo snapshot si prende PRIMA di un eventuale riavvio partita: `openMatch` ricarica la pagina e
     azzera l'anello — la prima stesura fotografava dopo e trovava il testimone vuoto. */
  if (scene >= SCENE_TARGET) break;
}

/* IL DETECTOR VERO + la statistica indipendente dal frame-rate */
const out = await page.evaluate(() => {
  const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP();
  if (!snap || !snap.samples || !snap.samples.length) return { err: 'nessun campione nel testimone di bordo' };
  const S = snap.samples;
  const keys = [...new Set(S.map(s => s.sk).filter(k => k != null && k >= 0))];
  const righe = [];
  for (const k of keys) {
    const W = S.filter(s => s.sk === k);
    if (W.length < 8) continue;
    let txt = '';
    try { txt = window.__CPM_DRAFTNOTE(snap, { sceneKey: k }) || ''; } catch (e) { txt = 'ERR ' + e.message; }
    /* stessa matematica del detector (r.~8595) ma tenendo ANCHE il dt: il passo grezzo per fotogramma
       dipende dal frame-rate, la velocita' no. Si saltano i primi 750ms della scena, che e' la finestra
       in cui `nearSnap` esclude gli stacchi voluti. */
    const t0 = W[0].t; let pMax = 0, vMax = 0, dtSum = 0, nn = 0;
    for (let i = 1; i < W.length; i++) {
      const a = W[i - 1], b = W[i], dt = (b.t - a.t) / 1000;
      if (dt <= 0 || dt > 0.5 || b.cx == null || a.cx == null) continue;
      if (b.t - t0 < 750) continue;
      const d = Math.hypot(b.cx - a.cx, (b.cy - a.cy) || 0, (b.cz - a.cz) || 0);
      if (d > pMax) pMax = d;
      if (d / dt > vMax) vMax = d / dt;
      dtSum += dt; nn++;
    }
    righe.push({ k, n: W.length, cam: txt.split('\n').filter(l => /CAMERA|camera/.test(l)), pMax, vMax, dtMed: nn ? dtSum / nn : null });
  }
  return { righe, tot: S.length, span: snap.span, res: snap.res };
});
