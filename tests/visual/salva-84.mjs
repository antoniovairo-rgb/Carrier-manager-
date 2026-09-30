/* [7.999.84 PO-151] Guardiano: sulle scene difensive dove l'eroe di movimento salva la porta (outKey "save"),
   sovrimpressione ed esito non parlano da portiere («Il portiere dice no», «Para in tuffo», «tra i pali», 🧤).
   Rosso __CPM_NO_SALVA84 (CPM_ROSSO84=1): i testi di prima devono comparire almeno una volta. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO84;
const SCENE = (process.env.CPM_GI || '33,36,44,45,131,132,133,134,135,136,138,157').split(',').map(Number);
const SEMI = +(process.env.CPM_SEMI || 3);
const PORTIERE = /portiere|parata|tuffo|tra i pali|🧤|Riflesso felino/i;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
const p = await ctx.newPage();
await p.addInitScript((R) => { window.__CPM_GLB = false; if (R) window.__CPM_NO_SALVA84 = 1; }, ROSSO);
await openMatch(p, port, { skipLoadAll: true, name: 'Vairo' }); await sleep(800);
let visti = 0, falsi = 0; const es = [];
for (const gi of SCENE) for (let s = 0; s < SEMI; s++) {
  await p.evaluate(() => { try { window.__CPM_TIMELINE_RESET && window.__CPM_TIMELINE_RESET(); } catch (e) {} });
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => {});
  for (let i = 0; i < 30; i++) { if ((await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE())) === 'hl_choose') break; await sleep(200); }
  await p.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); }).catch(() => {});
  let txt = null;
  for (let i = 0; i < 40 && !txt; i++) { txt = await p.evaluate(() => { const e = document.querySelector('[data-cpm="esito"]'); return e ? e.textContent : null; }); if (!txt) await sleep(250); }
  const key = await p.evaluate(() => { const t = (window.__CPM_TIMELINE && window.__CPM_TIMELINE()) || []; const a = t.filter(x => x.type === 'ActionResolved').pop(); return a ? (a.key || a.outKey || null) : null; });
  if (key !== 'save' || !txt) continue;
  visti++; if (PORTIERE.test(txt)) { falsi++; if (es.length < 4) es.push(`gi${gi}: ${txt.slice(0, 90)}`); }
  await p.keyboard.press('Enter').catch(() => {}); await sleep(300);
}
await b.close(); srv.close();
console.log(`salvataggi dell'eroe visti ${visti} · testi da portiere ${falsi}`); es.forEach(e => console.log('  · ' + e));
if (visti < 6) { console.log('CIECO: troppo pochi esiti «save»'); process.exit(2); }
if (ROSSO) { console.log(falsi > 0 ? 'ROSSO OK: il difetto si vede' : 'ROSSO KO'); process.exit(falsi > 0 ? 0 : 1); }
console.log(falsi === 0 ? 'VERDE' : 'KO'); process.exit(falsi === 0 ? 0 : 1);
