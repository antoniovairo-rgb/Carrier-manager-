#!/usr/bin/env node
/* [7.384.0] GUARDIANO — L'ESULTANZA SI DEVE VEDERE (collaudo PO «le esultanze non funzionano»)

   PERCHE' NE SERVIVA UN SECONDO. `celebration-test.mjs` e' verde, e il gioco no. Quel guardiano
   dimostra che un gol PRODUCE UN PIANO: e' vero, ed e' il pezzo che condivide col gioco reale. Tutto
   il resto lo misura in una modalita' che il giocatore non vede mai — `__CPM_GLB=false`, cioe' i
   modelli procedurali invece del CH38 che e' il renderer di DEFAULT. Ed e' esattamente li' che la
   premessa si rovescia: GLB-ON `animOne` ritorna subito sui mesh guidati dal modello, quindi le
   rotazioni procedurali di braccia e gambe — su cui il guardiano vecchio si appoggia implicitamente —
   NON arrivano mai allo schermo. Restano tre canali: la CLIP, il MOVIMENTO del corpo e la QUOTA.
   E' il terzo caso della stessa famiglia del 7.370 e del 7.381: lo strumento sbaglia prima del codice.

   COSA MISURA, e tutto DENTRO il loop di render (headless GLB-ON gira a frazioni di fotogramma al
   secondo: qualunque campionamento da node misurerebbe il caso, non il gioco):
     · quanti fotogrammi d'esultanza hanno davvero il gesto montato;
     · a che VELOCITA' viene suonata la clip — una clip di gioia da 2,75s dentro la finestra dei gesti
       tecnici da 0,55s viene accelerata 5x e diventa un tremolio;
     · quante volte la clip viene RI-ARMATA durante una sola esultanza (il loop);
     · quanto si sposta il corpo e quanta quota prende.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node celebration-visible-test.mjs [--verbose]           */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const TS_MAX = 1.6;    /* oltre, la clip non e' un gesto: e' un tremolio */
const ARM_MAX = 1;     /* una clip di gioia si suona UNA volta e si tiene, non va in loop */

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
/* viewport piccola: GLB-ON headless e' limitato dal rasterizzatore software, e a schermo intero
   nove secondi di orologio comprano meno di mezzo secondo di tempo-scena. */
const page = await browser.newPage({ viewport: { width: 380, height: 300 } });
await installCdnRoutes(page);
/* ⚠️ NIENTE __CPM_GLB=false: si misura il renderer che il giocatore ha davvero (CH38, GLB di default).
   __CPM_PRESENT riaccende snap e freeze della presentazione, spenti sotto cpmtest. */
await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_REC = true; });
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 140)));
await openMatch(page, port); await sleep(1400);

const GOAL_GIS = await page.evaluate(() => {
  const out = []; const S = window.__CPM_SITS || [];
  for (let i = 0; i < S.length && out.length < 4; i++) {
    const s = S[i]; if (!s || !s.actions || !s.actions[0]) continue;
    if (s.actions[0].rew === 'goal' && !s.def) out.push(i);
  }
  return out;
});

const righe = [], guasti = [];
for (const gi of GOAL_GIS) {
  await page.evaluate(g => {
    window.__CPM_CELEB = null;
    window.__CPM_CELGST = 0; window.__CPM_CELFR = 0; window.__CPM_CELTS = 0;
    window.__CPM_CELARM = 0; window.__CPM_CELPREV = null;
    window.__CPM_CELDX = 0; window.__CPM_CELY = 0; window.__CPM_CELN = 0; window.__CPM_CELPOS = null; window.__CPM_CELSTEP = 0; window.__CPM_CELDONE84 = 0;
    window.__CPM_FORCE_SIT(g, true);
  }, gi);
  await sleep(700);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (e) {} });
  /* ⚠️ SI ASPETTA IN TEMPO-SCENA, NON IN TEMPO REALE. Il loop avanza a passi limitati e col
     rasterizzatore software un secondo d'orologio vale una frazione di secondo di gioco: con 9 s
     l'esultanza (2,2-4,2 s di scena) non arrivava nemmeno al suo ritardo d'avvio di 0,38 s, e la sonda
     leggeva «zero clip» su un'esultanza che semplicemente non era ancora cominciata. Qui si aspetta
     finche' il gioco DICE di aver finito, con un tetto d'orologio. */
  await page.waitForFunction(() => {
    try { const c = window.__CPM_CELEB; if (!c) return false; return (window.__CPM_CELDONE84 === 1) || (window.__CPM_CELN || 0) > 260; } catch (e) { return false; }
  }, { timeout: 150000 }).catch(() => {});
  await sleep(400);
  const m = await page.evaluate(() => ({
    c: window.__CPM_CELEB || null, fr: window.__CPM_CELFR || 0, gst: window.__CPM_CELGST || 0,
    ts: window.__CPM_CELTS || 0, arm: window.__CPM_CELARM || 0,
    dx: window.__CPM_CELDX || 0, y: window.__CPM_CELY || 0, n: window.__CPM_CELN || 0, step: window.__CPM_CELSTEP || 0, run: window.__CPM_CELEB ? null : null,
  }));
  if (!m.c) { guasti.push(`gi${gi}: nessun piano d'esultanza prodotto`); continue; }

  const quota = +m.y.toFixed(2), spost = +m.dx.toFixed(2), clipFr = m.fr ? m.gst / m.fr : 0;
  /* almeno UNO dei tre canali che il CH38 rende davvero deve aver prodotto qualcosa */
  const canali = [];
  if (m.fr > 0 && clipFr >= 0.5) canali.push('clip');
  if (spost >= 1.5) canali.push('corsa');
  if (quota >= 0.25) canali.push('quota');

  const problemi = [];
  if (!canali.length) problemi.push(`nessun canale visibile GLB-ON (clip ${(clipFr * 100) | 0}% dei fotogrammi · spostamento ${spost}u · quota ${quota}u)`);
  if (m.ts > TS_MAX) problemi.push(`la clip e' suonata a ${m.ts.toFixed(1)}x: non e' un gesto, e' un tremolio`);
  if (m.arm > ARM_MAX) problemi.push(`la clip e' stata montata ${m.arm} volte in una sola esultanza (loop)`);
  /* un'esultanza SUL POSTO non deve portare l'eroe da un'altra parte: e' il sintomo di un secondo
     driver sullo stesso corpo, o di una scena tagliata che lo richiama in posizione mentre festeggia */
  const sulPosto = /^(arms_up|jump_arms_up|contained)$/.test(m.c.pick || '');
  if (sulPosto && spost > 3) problemi.push(`esultanza SUL POSTO ma l'eroe percorre ${spost}u (passo massimo ${(+m.step).toFixed(2)}u): qualcun altro lo sta muovendo`);
  if (problemi.length) guasti.push(`gi${gi} [${m.c.pick}/${m.c.ctx.tier}]: ` + problemi.join(' · '));

  righe.push({ gi, pick: m.c.pick, tier: m.c.ctx.tier, dur: m.c.dur, fr: m.fr, clipFr, ts: m.ts, arm: m.arm, spost, quota, canali });
  console.log(`${problemi.length ? '❌' : '✅'} gi${String(gi).padStart(3)} ${String(m.c.pick).padEnd(13)} ${String(m.c.ctx.tier).padEnd(12)} · fotogrammi ${String(m.n).padStart(3)} · clip ${String(((clipFr * 100) | 0) + '%').padStart(4)} · scala ${m.ts.toFixed(1)}x · ri-armi ${m.arm} · spostamento ${spost}u · quota ${quota}u · canali [${canali.join(',') || 'NESSUNO'}]`);
}

await browser.close(); srv.close();
if (errors.length) guasti.push(`${errors.length} pageerror: ${errors[0]}`);
if (righe.length < 3) guasti.push(`solo ${righe.length} esultanze osservate: la misura non e' stata fatta`);

if (righe.length) {
  const ts = righe.map(r => r.ts).sort((a, b) => a - b), ar = righe.map(r => r.arm).sort((a, b) => a - b);
  const muti = righe.filter(r => !r.canali.length).length;
  console.log(`\nesultanze osservate ${righe.length} · senza NESSUN canale visibile ${muti} · scala della clip mediana ${ts[ts.length >> 1].toFixed(1)}x (max ${Math.max(...ts).toFixed(1)}x) · ri-armi mediani ${ar[ar.length >> 1]} (max ${Math.max(...ar)})`);
}
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log(`\n✅ VISIBILE — con i modelli veri l'esultanza ha un canale che si vede, la clip suona alla sua velocita' e non va in loop`);
