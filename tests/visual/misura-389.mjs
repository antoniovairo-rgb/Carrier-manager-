#!/usr/bin/env node
/* SONDA giro 389 (PO-671) — IL FALLO CERCATO DELL'EROE: DOVE CADE E COSA NE ESCE. Non giudica: stampa.
   Scena 150 «Guadagna una punizione!» forzata con l'eroe in un punto scelto, esito riuscito (fallo subito); poi la forzatura si toglie
   (__CPM_FORCED_MODE=false), si tocca «Continua» e si registra per 14 s cosa fa il motore: fermo (kind, punto), eventi rigore/fallo,
   scene aperte dopo. Uso: CPM_CHROME=… node misura-389.mjs   (CPM_PUNTI=88:50,75:50 · CPM_ROSSO=1 → __CPM_NO_G389) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO;
const PUNTI = (process.env.CPM_PUNTI || '88:50,83:50,85:25,75:50,78:66').split(',').map(s => s.split(':').map(Number));
const AZ = (process.env.CPM_AZ || '0').split(',').map(Number);
export async function provaFallo(b, port, x, y, ai, rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_REC = true; if (r) window.__CPM_NO_G389 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Fallo389' });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing' && window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(), null, { timeout: 60000 }).catch(() => {});
  await sleep(1200);
  await page.evaluate(([x, y]) => { window.__CPM_FORCE_SIT(150, true, { x, y }); }, [x, y]);
  await page.waitForFunction(() => window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(800);
  const prima = await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ(); return { min: M._S.min | 0, ev: (M._S.eventi || []).length }; });
  await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ(); const W = window.__W389 = []; const sem = e => ({ t: e.t, min: e.min, x: e.x, y: e.y, per: e.per, scena: !!e.scena, k: e.kind || (e.origine && e.origine.kind) || e.intent || e.tipo || null, chi: e.chi && (e.chi.eroe ? 'EROE' : e.chi.nome), esito: e.esito });
    const T = M.tick; M.tick = function () { const r = T.apply(this, arguments); try { for (const e of (Array.isArray(r) ? r : (r && r.eventi) || [])) if (e && /^(rigore|fallo|occasione_eroe|battuta|tiro|gol)$/.test(e.t)) W.push(sem(e)); } catch (_e) {} return r; };
    const R = M.risolviEroe.eventi; M.risolviEroe.eventi = function () { const r = R.apply(this, arguments); try { W.push({ t: 'SCENA', key: arguments[0] }); for (const e of r || []) if (e && /^(rigore|fallo|occasione_eroe|battuta|tiro|gol)$/.test(e.t)) W.push(sem(e)); } catch (_e) {} return r; }; });
  await page.evaluate(a => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(a); }, ai);
  await page.waitForFunction(() => window.__CPM_PHASE() === 'hl_result', null, { timeout: 20000 }).catch(() => {});
  await sleep(1500);
  const esito = await page.evaluate(() => ({ dec: window.__CPM_F389 ? window.__CPM_F389.slice(-1)[0] : null, ph: window.__CPM_PHASE() }));
  /* il flusso vero riprende: la forzatura si toglie e si avanza come col tasto */
  await page.evaluate(() => { window.__CPM_FORCED_MODE = false; window.__CPM_FORCE_OUTCOME = null; });
  const L = [];
  await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ(); const S = M._S; window.__M389 = []; const t = setInterval(() => { try { const f = S.fermo; window.__M389.push({ min: S.min | 0, ph: window.__CPM_PHASE(), st: S.poss && S.poss.stato, f: f ? { k: f.kind, x: +(+f.x).toFixed(1), y: +(+f.y).toFixed(1), b: f.batt, o: f._o27 | 0 } : null }); } catch (e) {} }, 120); window.__M389T = t; });
  for (let i = 0; i < 6; i++) { const ok = await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(b => /continua|avanti|prosegui/i.test(b.textContent || '')); if (bt) { bt.click(); return true; } return false; }); if (ok) break; await sleep(500); }
  await sleep(14000);
  const out = await page.evaluate(() => { clearInterval(window.__M389T); const M = window.__CPM_MOTORE_OBJ(); const _E = window.__CPM_EV; const ev = (Array.isArray(_E) ? _E : (typeof _E === 'function' ? (_E() || []) : [])).filter(e => e && (e.t === 'scena' || e.t === 'recita' || e.t === 'rigore249'));
    const mev = (M._S.eventi || []).map(e => e).filter(e => /^(rigore|fallo|occasione_eroe|battuta|tiro)$/.test(e.t)).slice(-12).map(e => ({ t: e.t, min: e.min, x: e.x, y: e.y, scena: !!e.scena, k: e.kind || (e.origine && e.origine.kind) || e.intent || null, chi: e.chi && (e.chi.eroe ? 'EROE' : e.chi.nome) }));
    const _ev = window.__CPM_EV; const sc = (Array.isArray(_ev) ? _ev : []).filter(e => e && /scena|piazz|rigore/.test(String(e.t || e.k || e.tipo || ''))).slice(-6); return { conta: { f389: M._S.conta.f389, piaz94: M._S.conta.piaz94, ponte191: M._S.conta.ponte191, occEroe: M._S.conta.occEroe }, pen94: window.__CPM_PEN94 || null, sc, evTipo: typeof _ev, tr: window.__M389 || [], ev: ev.slice(-8), mev: window.__W389 || [], tab: M.tabellino ? M.tabellino() : null, ph: window.__CPM_PHASE() }; });
  await page.close();
  const fermi = []; let last = null; for (const r of out.tr) { const k = r.f ? r.f.k + '@' + r.f.x + ',' + r.f.y + (r.f.b != null ? ' batt ' + r.f.b : '') + (r.f.o ? ' o27' : '') : null; if (k && k !== last) fermi.push(r.min + "' " + k); last = k; }
  const kinds = [...new Set(out.tr.filter(r => r.f).map(r => r.f.k))];
  const scene = out.tr.filter(r => /^hl_/.test(r.ph || '')).length;
  return { conta: out.conta, pen94: out.pen94, sc: out.sc, evTipo: out.evTipo, x, y, ai, dec: esito.dec, fasi: [...new Set(out.tr.map(r => r.ph))], fermi, kinds, scene, mev: out.mev, ev: out.ev, stati: [...new Set(out.tr.map(r => r.st))] };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  for (const [x, y] of PUNTI) for (const ai of AZ) { const r = await provaFallo(b, port, x, y, ai, ROSSO); console.log(JSON.stringify(r)); }
  await b.close(); srv.close(); process.exit(0);
}
