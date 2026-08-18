#!/usr/bin/env node
/* GUARDIANO — LA PALLA E' ACCUDITA (7.523.0, IL PORTATORE — direttiva PO priorita' ALTISSIMA).
   Baseline misurata (7.522): in cronaca un giocatore entro 3u dalla palla solo nel 32,0% dei campioni
   (mediana 4,3u dal piu' vicino) — «giocatori che corrono senza palla», INGUARDABILE per il PO.
   Il modello del portatore (selezione con isteresi + preferenza lato possesso entro 12u, corsa _carry526
   de-registrata dal driver di formazione, glue ai piedi con cede dell'inseguitore, passaggi mirati a
   RICEVENTI reali entro 32u con handoff a fine volo, conduzione verso il logico) porta l'accudita al
   62,0% con il 32,6% dei campioni legittimamente IN VOLO (spiegabile: 79,6%).
   SI GIUDICA L'ACCUDITA (>=52%): separa netto dal rosso __CPM_NO526 (misurato 36,7%). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const MS = +(process.env.CPM_MS || 150000);
const ACC_MIN = +(process.env.CPM_ACC_MIN || 52);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window.__CPM_NO526 = 1; }, ROSSO);
await openMatch(page, port);
await page.evaluate(() => { window.__R = []; window.__CPM_AUTOPLAY(true, { seed: 424, policy: 'seeded', tickMs: 350 });
  setInterval(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); const ph = window.__CPM_PHASE && window.__CPM_PHASE();
    const a = window.__CPM_ARC; const volo = !!(a && a.arc);
    if (ph === 'playing' && s && s.ball && s.ball.heldBy) window.__R.push({ d: s.ball.heldBy.dist, v: volo ? 1 : 0 }); } catch (e) {} }, 150); });
await sleep(MS);
const R = await page.evaluate(() => window.__R || []);
await b.close(); srv.close();

const n = R.length, acc = R.filter(x => x.d <= 3).length, ok = R.filter(x => x.d <= 3 || x.v === 1).length;
const pAcc = 100 * acc / Math.max(1, n);
console.log(`campioni ${n} · accudita<=3u ${pAcc.toFixed(1)}% · spiegabile (accudita o in volo) ${(100 * ok / Math.max(1, n)).toFixed(1)}%`);
if (n < 300) { console.log('❌ SONDA CIECA: campioni insufficienti'); process.exit(2); }
if (ROSSO) {
  if (pAcc < ACC_MIN - 8) { console.log(`✅ prova del rosso riuscita: senza portatore la palla resta sola (${pAcc.toFixed(1)}%)`); process.exit(0); }
  console.log(`❌ PROVA DEL ROSSO FALLITA: ${pAcc.toFixed(1)}% anche senza portatore`); process.exit(2);
}
if (pAcc < ACC_MIN) { console.log(`❌ la palla e' tornata sola: ${pAcc.toFixed(1)}% < ${ACC_MIN}%`); process.exit(2); }
console.log("✅ la palla e' accudita: il portatore c'e'");