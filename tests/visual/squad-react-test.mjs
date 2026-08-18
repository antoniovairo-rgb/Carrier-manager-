#!/usr/bin/env node
/* GUARDIANO — LE REAZIONI DI REPARTO (7.519.0, restyling R3/4).
   Audit: «nelle scene di tiro/testa/cross gli avversari sono comparse». Ora: tiro → il difensore piu'
   vicino si allunga (tackle) · testa → il marcatore salta con l'eroe (header) · cross → il difensore
   attacca il punto d'atterraggio (header). Canale _mateFx (uso sequenziale), tetto 9u.
   MISURA: testimone __CPM_REA519 alla concessione. Scene con marcatura reale: gi22 tiro-fail, gi6+gi86
   testa, gi42 cross (misure prime: 6,7u · 0,4/7,9u · 8,9u). gi44 e' SMARCATO: giusto che non reagisca.
   Verde: >=3 reazioni e >=2 famiglie. Rosso __CPM_NO519: zero. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REA519 = []; if (r) window.__CPM_NO519 = 1; }, ROSSO);
await openMatch(page, port);
await sleep(600);
for (const [gi, out] of [[22, 'fail'], [6, 'success'], [86, 'success'], [42, 'success']]) {
  await forceSituation(page, gi, { settle: 400, choose: true });
  await page.evaluate(o => { window.__CPM_FORCE_OUTCOME = o; window.__CPM_RESOLVE(0); }, out);
  await sleep(2400);
}
const d = await page.evaluate(() => window.__CPM_REA519 || []);
await b.close(); srv.close();

const fam = [...new Set(d.map(x => x.f))];
console.log(`reazioni: ${JSON.stringify(d)} · famiglie: ${fam.join('/') || '—'}`);
if (ROSSO) {
  if (d.length === 0) { console.log('✅ prova del rosso riuscita: reparto di nuovo comparse'); process.exit(0); }
  console.log('❌ PROVA DEL ROSSO FALLITA: reazioni anche col canale spento'); process.exit(2);
}
if (d.length < 3 || fam.length < 2) { console.log(`❌ reparto assente: ${d.length} reazioni / ${fam.length} famiglie`); process.exit(2); }
console.log('✅ il reparto reagisce: chi chiude, chi salta, chi attacca il cross');
