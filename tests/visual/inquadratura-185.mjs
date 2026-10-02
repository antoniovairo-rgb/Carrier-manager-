#!/usr/bin/env node
/* [7.999.104 PO-185 — rilievo Codex sul ricollaudo difesa 3D (7.999.91): 001 apertura senza contesto, 002 eroe/pallone fuori quadro]
   Misura, su pagina NUOVA per caso e con i corpi 3D accesi (come Codex), la quota di fotogrammi dell'highlight con l'EROE e con il
   PALLONE fuori dal quadro, sull'intera conclusione e sulle prime 12 letture (l'apertura). Testimone __CPM_FRAME480 (bn/bfuori/a12).
   CPM_GLB=0 per la variante procedurale; CPM_RIP ripetizioni; CPM_SCENE="32:success,36:fail" per restringere. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const GLB = process.env.CPM_GLB !== '0', RIP = +(process.env.CPM_RIP || 1);
const CASI = (process.env.CPM_SCENE || '133:fail,138:success,138:fail,168:fail,31:fail,32:success,32:fail,36:success,36:fail,45:success,45:fail,33:success,44:success,128:success,137:success')
  .split(',').map(s => { const [g, o] = s.split(':'); return { gi: +g, o }; });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function misura({ gi, o }) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(g => { window.__CPM_GLB = g; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true; }, GLB);
  try {
    await openMatch(page, port); await sleep(700);
    await forceSituation(page, gi, { settle: 400, choose: true });
    await page.evaluate(o => { window.__CPM_FRAME480 = null; window.__CPM_FORCE_OUTCOME = o; }, o);
    await page.evaluate(() => { try { window.__CPM_RESOLVE(0); } catch (e) {} });
    await sleep(GLB ? 4000 : 2400);
    return await page.evaluate(() => window.__CPM_FRAME480 || null);
  } catch (e) { return null; } finally { await page.close().catch(() => {}); }
}
const pc = (a, n) => n ? Math.round(100 * (a || 0) / n) : null;
console.log(`=== PO-185 · inquadratura eroe/pallone · ${GLB ? 'GLB acceso' : 'procedurale'} · ${RIP} ripetizioni ===`);
for (const c of CASI) {
  const r = [];
  for (let i = 0; i < RIP; i++) { const f = await misura(c); if (f && f.n) r.push(f); }
  if (!r.length) { console.log(`gi${c.gi} ${c.o}: nessuna misura`); continue; }
  const row = r.map(f => `eroe ${pc(f.fuori, f.n)}% · palla ${pc(f.bfuori, f.bn)}% · apertura eroe ${pc(f.afuori, f.a12)}% palla ${pc(f.abfuori, f.a12)}% (n=${f.n})`).join(' | ');
  console.log(`gi${String(c.gi).padStart(3)} ${c.o.padEnd(7)} ${row}`);
}
await b.close(); srv.close();
