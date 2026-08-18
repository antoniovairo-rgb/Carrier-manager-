#!/usr/bin/env node
/* GUARDIANO — NESSUN COMPAGNO CONGELATO (7.516.0, restyling R3/1).
   Audit critica: il decadimento del peso del gesto viveva DENTRO il ramo a cui il compagno accedeva solo
   con `_mateWant` attivo — scaduto il timer, l'avatar restava con la posa del calcio impressa su tutte le
   ossa (clampWhenFinished) per il resto della partita. Il rimedio 7.516 estende l'ingresso al rilascio
   (`_gName` o peso residuo). Testimone alla sorgente: __CPM_ORF516 conta, per fotogramma, gli avatar FUORI
   dal ramo con _gAct.weight>0,5 — l'orfano e' esattamente lo stato del bug.
   ⚠️ GLB-ON (niente __CPM_GLB=false): il difetto vive nel percorso CH38. La via che arma i gesti dei
   compagni in headless e' l'ATTORE DELLA CRONACA (7.511): autoplay in playing, gesti frequenti.
   PROVA DEL ROSSO: CPM_ROSSO=1 → __CPM_NO516 (ingresso solo con _mateWant): orfani attesi >0 (misurato 24
   in 2 minuti al primo giro). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const MS = +(process.env.CPM_MS || 120000);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_ORF516 = []; if (r) window.__CPM_NO516 = 1; }, ROSSO);
await openMatch(page, port);
await sleep(9000); /* caricamento GLB */
const glb = await page.evaluate(() => { const g = window.__CPM_GESTURE && window.__CPM_GESTURE(); return !!(g && g.glb); });
if (!glb) { console.log('❌ SONDA CIECA: avatar GLB non montati — il difetto vive nel percorso CH38'); process.exit(2); }
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 424, policy: 'seeded', tickMs: 350 }));
await sleep(MS);
const d = await page.evaluate(() => ({ orf: (window.__CPM_ORF516 || []).length, chi: [...new Set(window.__CPM_ORF516 || [])].slice(0, 10) }));
await b.close(); srv.close();

console.log(`fotogrammi-orfano: ${d.orf} · avatar coinvolti: ${JSON.stringify(d.chi)}`);
if (ROSSO) {
  if (d.orf > 0) { console.log('✅ prova del rosso riuscita: senza il rilascio esteso i compagni si congelano'); process.exit(0); }
  console.log('❌ PROVA DEL ROSSO FALLITA: zero orfani anche col rilascio vecchio — la sonda non discrimina'); process.exit(2);
}
if (d.orf > 0) { console.log('❌ COMPAGNI CONGELATI: il rilascio si è perso'); process.exit(2); }
console.log('✅ nessun compagno congelato: il gesto si rilascia sempre');
