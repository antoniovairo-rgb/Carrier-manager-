/* [STRUMENTO] IL REPARTO REAGISCE ALL'AZIONE? — codice 006 del taccuino PO.
   «i compagni/avversari non reagiscono all'azione»: finora era un giudizio a occhio, senza numero.
   METRO: durante la scena, quanto si sposta ciascun giocatore (esclusi eroe e portieri) dal proprio
   punto di partenza. Un reparto vivo si muove; un reparto fermo resta dov'e'.
   Si misura in due finestre: la LETTURA (prima della scelta, dove un po' di immobilita' e' voluta —
   il freeze 7.194 tiene gli uomini in posizione) e l'ESITO (dove tutti devono reagire al pallone).
   Il difetto vero e' il reparto fermo NELL'ESITO. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
/* ⚠️ [7.685.0] PROVA DEL ROSSO PARAMETRICA, e l'ho dimenticata anche qui. Un'ora prima avevo scoperto
   che il guardiano IGNORAVA `CPM_ROSSO` e avevo creduto di scagionare un imputato mai interrogato; poi
   ho scritto questa sonda senza il flag e la prova del rosso e' uscita identica al verde (0,38 contro
   0,39), cioe' non provava niente. Un interruttore che nessuna sonda sa premere non esiste. */
await page.addInitScript(([g, rosso]) => { window.__CPM_GLB = !!g; window.__CPM_PRESENT = 1; if (rosso) String(rosso).split(',').forEach(r => { window[r.trim()] = 1; }); }, [!!process.env.CPM_GLBON, process.env.CPM_ROSSO || null]);
await openMatch(page, port, { skipLoadAll: true, name: 'Rep' });
const tot = await page.evaluate(() => (window.__CPM_SITS || []).length);
const PASSO = Number(process.env.CPM_PASSO || 12);
const GIs = process.env.CPM_GI ? [Number(process.env.CPM_GI)] : Array.from({ length: tot }, (_, i) => i).filter(i => i % PASSO === 0);
/* warm-up dichiarato: senza, le prime scene forzate danno le pose di default (lezione 7.660/7.684) */
await page.evaluate(() => window.__CPM_FORCE_SIT(81, true)); await sleep(1800);
const righe = [];
for (const gi of GIs) {
  try { await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]); } catch (_e) { continue; }
  await sleep(900);
  const pos0 = await page.evaluate(() => (window.__CPM_STATE().players || []).map(p => (p && !p.gk) ? { x: p.x, y: p.y, t: p.team } : null));
  await sleep(1200);
  const posL = await page.evaluate(() => (window.__CPM_STATE().players || []).map(p => (p && !p.gk) ? { x: p.x, y: p.y } : null));
  const ai = await page.evaluate(g => { const s = (window.__CPM_SITS || [])[g] || {}; return (s.actions || []).length ? 0 : -1; }, gi);
  if (ai >= 0) await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, ai);
  await sleep(2200);
  const posE = await page.evaluate(() => (window.__CPM_STATE().players || []).map(p => (p && !p.gk) ? { x: p.x, y: p.y } : null));
  const d = (a, c) => (a && c) ? Math.hypot(a.x - c.x, a.y - c.y) : null;
  const lett = [], esito = [];
  for (let i = 0; i < pos0.length; i++) { const a = d(pos0[i], posL[i]), e = d(posL[i], posE[i]); if (a != null) lett.push(a); if (e != null) esito.push(e); }
  const fermiL = lett.filter(v => v < 0.5).length, fermiE = esito.filter(v => v < 0.5).length;
  righe.push({ gi, n: lett.length, fermiL, fermiE, medL: lett.length ? lett.reduce((a, c) => a + c, 0) / lett.length : 0, medE: esito.length ? esito.reduce((a, c) => a + c, 0) / esito.length : 0 });
}
await b.close(); srv.close();
console.log('\n=== IL REPARTO REAGISCE ALL\'AZIONE? (codice 006) ===\n');
console.log(`  scene misurate: ${righe.length}`);
const q = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
console.log(`  spostamento medio per giocatore · in LETTURA ${q(righe.map(r => r.medL)).toFixed(2)} u · nell'ESITO ${q(righe.map(r => r.medE)).toFixed(2)} u`);
console.log(`  giocatori FERMI (meno di 0,5 u) · in lettura ${q(righe.map(r => r.fermiL))}/${righe[0] ? righe[0].n : '?'} · nell'esito ${q(righe.map(r => r.fermiE))}/${righe[0] ? righe[0].n : '?'}`);
const morte = righe.filter(r => r.fermiE >= r.n - 2).sort((a, c) => c.fermiE - a.fermiE);
console.log(`\n  scene con il REPARTO FERMO nell'esito (quasi tutti immobili): ${morte.length}/${righe.length}`);
for (const r of morte.slice(0, 8)) console.log(`    gi${String(r.gi).padStart(3)} · fermi ${r.fermiE}/${r.n} · spostamento medio ${r.medE.toFixed(2)} u`);
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: misura.\n');
