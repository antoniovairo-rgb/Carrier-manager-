#!/usr/bin/env node
/* [7.999.104 PO-185 — rilievo Codex sul ricollaudo difesa 3D (7.999.91): 001 apertura senza contesto, 002 eroe/pallone fuori quadro]
   Misura, su pagina NUOVA per caso e con i corpi 3D accesi (come Codex), la quota di fotogrammi dell'highlight con l'EROE e con il
   PALLONE fuori dal quadro, sull'intera conclusione e sulle prime 12 letture (l'apertura). Testimone __CPM_FRAME480 (bn/bfuori/a12).
   CPM_GLB=0 per la variante procedurale; CPM_RIP ripetizioni; CPM_SCENE="32:success,36:fail" per restringere; CPM_RED=1 arma __CPM_NO_PALLA185 (rimedio 7.999.104 ritirato: oggi nessun effetto, resta per il prossimo tentativo). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const GLB = process.env.CPM_GLB !== '0', RIP = +(process.env.CPM_RIP || 1), RED = process.env.CPM_RED === '1';
const CASI = (process.env.CPM_SCENE || '133:fail,138:success,138:fail,168:fail,31:fail,32:success,32:fail,36:success,36:fail,45:success,45:fail,33:success,44:success,128:success,137:success')
  .split(',').map(s => { const [g, o] = s.split(':'); return { gi: +g, o }; });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function misura({ gi, o }) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(([g, r]) => { if (r) window.__CPM_NO_PALLA185 = 1; window.__CPM_GLB = g; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true; }, [GLB, RED]);
  try {
    await openMatch(page, port); await sleep(700);
    await forceSituation(page, gi, { settle: 400, choose: true });
    await page.evaluate(o => { window.__CPM_FRAME480 = null; window.__CPM_TGT185 = null; window.__CPM_FORCE_OUTCOME = o; }, o);
    await page.evaluate(() => { try { window.__CPM_RESOLVE(0); } catch (e) {} });
    await sleep(GLB ? 4000 : 2400);
    return await page.evaluate(() => window.__CPM_FRAME480 ? { ...window.__CPM_FRAME480, tn: (window.__CPM_TGT185 || {}).n || 0, tf: (window.__CPM_TGT185 || {}).fuori || 0 } : null);
  } catch (e) { return null; } finally { await page.close().catch(() => {}); }
}
const pc = (a, n) => n ? Math.round(100 * (a || 0) / n) : null;
const TOT = [];
console.log(`=== PO-185 · inquadratura eroe/pallone · ${GLB ? 'GLB acceso' : 'procedurale'} · ${RIP} ripetizioni ===`);
for (const c of CASI) {
  const r = [];
  for (let i = 0; i < RIP; i++) { const f = await misura(c); if (f && f.n >= 5) r.push(f); }
  if (!r.length) { console.log(`gi${c.gi} ${c.o}: nessuna misura`); continue; }
  const S = k => r.reduce((a, f) => a + (f[k] || 0), 0);
  const tot = { n: S('n'), f: S('fuori'), bn: S('bn'), bf: S('bfuori'), tn: S('tn'), tf: S('tf'), a: S('a12'), af: S('afuori'), abf: S('abfuori') };
  TOT.push(tot);
  console.log(`gi${String(c.gi).padStart(3)} ${c.o.padEnd(7)} [${r.length} giri] eroe fuori ${pc(tot.f, tot.n)}% · pallone fuori ${pc(tot.bf, tot.bn)}% (bersaglio ${pc(tot.tf, tot.tn)}%) · apertura: eroe ${pc(tot.af, tot.a)}% pallone ${pc(tot.abf, tot.a)}%`);
}
const G = k => TOT.reduce((a, t) => a + t[k], 0);
console.log(`TOTALE${RED ? ' (ROSSO __CPM_NO_PALLA185)' : ''}: eroe fuori ${pc(G('f'), G('n'))}% · pallone fuori ${pc(G('bf'), G('bn'))}% · bersaglio con pallone fuori ${pc(G('tf'), G('tn'))}% · fotogrammi ${G('n')}`);
await b.close(); srv.close();
