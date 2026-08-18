#!/usr/bin/env node
/* GUARDIANO — LA FINESTRA DEL GESTO VIENE DALLA TABELLA UNICA (7.512.0, restyling R2).
   Dall'audit: tre tabelle divergenti (_T vita · _T2 approccio · _wT56 clip); actType moriva a u>=1 su
   `_T` rimasta a 0,75 per la testa mentre le altre erano a 1,15 — colpo di testa TRONCATO al 65%
   («chiuso in 7.467», non lo era). E la normalizzazione 7.196 delle durate d'arco copriva solo 5
   famiglie su 9: un passaggio corto e uno lungo volavano nello stesso tempo fisso.

   DUE MISURE, ENTRAMBE ALLA SORGENTE (lezione di questa release: le sonde dagli EFFETTI — salto, arti —
   non discriminavano il rosso dal verde; la vita del gesto si legge dove il numero muore, testimone
   __CPM_VITA512):
     (A) vita del gesto header ~1,15s (rosso __CPM_NO467: ~0,75);
     (B) passaggio CORTO con durata dalla distanza, dur < 0,40s (rosso __CPM_NO512: costante ~0,58).
   Il ramo clip-portiere su _diveDur (stesso 7.512) non e' giudicabile headless (gli attori CH38 non
   producono tuffi in headless, nota 7.465): regressione coperta da `npm run gk-dive-sync`, verdetto
   finale al taccuino PO (codici 111/112). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_VITA512 = []; if (r) { window.__CPM_NO467 = 1; window.__CPM_NO512 = 1; } }, ROSSO);/* niente __CPM_REC: accende lo scrittore per-frame che sovrascrive __CPM_ARC */
await openMatch(page, port);
await sleep(600);

async function scena(gi) {
  await forceSituation(page, gi, { settle: 400, choose: true });
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  await sleep(2600);
  return await page.evaluate(() => {
    const v = window.__CPM_VITA512 || []; window.__CPM_VITA512 = [];
    return { vite: v, arc: window.__CPM_ARC || null };
  });
}

const vite = [];
for (const gi of [44, 6, 86]) { const r = await scena(gi); for (const v of r.vite) if (v.g === 'header') vite.push(v.v); }
const passDur = [];
for (const gi of [111, 174]) { const r = await scena(gi); if (r.arc && (r.arc.t === 'pass' || r.arc.t === 'build')) passDur.push(r.arc.dur); }
await b.close(); srv.close();

const minPass = passDur.length ? Math.min(...passDur) : null;
console.log(`vite header: ${vite.map(v => v.toFixed(2)).join(' · ') || '—'}`);
console.log(`durate pass: ${passDur.map(v => v.toFixed(2)).join(' · ') || '—'} (min ${minPass})`);
if (vite.length < 2 || passDur.length < 1) { console.log('❌ SONDA CIECA: misure insufficienti'); process.exit(2); }

if (ROSSO) {
  const okA = vite.every(v => v <= 0.85), okB = minPass >= 0.5;
  if (okA && okB) { console.log('✅ prova del rosso riuscita: testa troncata e passaggi a durata fissa col codice vecchio'); process.exit(0); }
  console.log(`❌ PROVA DEL ROSSO FALLITA: vita ${vite.map(v => v.toFixed(2))} / minPass ${minPass}`); process.exit(2);
}
let ko = false;
if (!vite.every(v => v >= 1.05 && v <= 1.35)) { console.log('❌ la vita del gesto header non e\' ~1,15s'); ko = true; }
if (minPass >= 0.40) { console.log(`❌ il passaggio corto non scala con la distanza (min ${minPass})`); ko = true; }
console.log(ko ? '' : '✅ finestra unica viva: testa intera, passaggi a velocita' + String.fromCharCode(39) + ' di famiglia');
process.exit(ko ? 2 : 0);
