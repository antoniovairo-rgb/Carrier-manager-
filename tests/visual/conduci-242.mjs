#!/usr/bin/env node
/* [giro 19 PO-242 «Conduci palla al piede e tira» fallito] GUARDIANO, verde col gioco e rosso con __CPM_NO_COND242.
   Collaudi 164 N1 / 165 K1: sul tiro fallito della conduzione il riquadro diceva «Grande parata del portiere» (o «Non trova lo
   specchio») e la riga sotto «Il difensore lo chiude: palla persa»; nella parata il portiere non faceva il gesto (3 parate su 3).
   Scena «fra le linee» costruita dal motore come la costruisce il gioco (scenaDalMotoreLinee), azione «Conduci palla al piede e tira»,
   esito forzato fail con tipo d'errore saved / wide / blocked, una pagina nuova per esito. Per ciascuno misura:
     · RIGA: la frase d'esito (outcome.text) non deve parlare di conduzione persa quando il riquadro parla di tiro;
     · PORTIERE (solo saved): il testimone __CPM_GK229 deve vedere un gesto del portiere avversario (gk_dive / gk_block).
   VERDE: 0 righe contraddittorie e gesto del portiere sulla parata. ROSSO: almeno una riga contraddittoria o parata senza gesto.
   Uso: node conduci-242.mjs   (CPM_GLB=1 per i corpi GLB) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const KINDS = (process.env.CPM_KINDS || 'saved,wide,blocked').split(',');
const reCond = /difensore lo chiude|conduzione ma viene fermato|dribbling non riesce/i;
async function giro(rosso, kind) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(([r, glb]) => { window.__CPM_GLB = !!glb; window.__CPM_REC = true; window.__CPM_CINE = 1; if (r) window.__CPM_NO_COND242 = 1; }, [rosso, process.env.CPM_GLB ? 1 : 0]);
  try {
    await openMatch(page, port); await sleep(800);
    const r = await page.evaluate(() => { try {
      for (let seed = 1; seed < 600; seed++) {
        const s = scenaDalMotoreLinee({ tipo: 'fra-le-linee', zona: 'trequarti', x: 72, y: 50, press: 0.5, liberi: 1, cast: {} }, { stats: {} }, seed);
        if (!s) continue; const i = s.actions.findIndex(a => /conduci palla al piede e tira/i.test(a.label)); if (i < 0) continue;
        SITUATIONS.push(s); const c = deriveHL(s, s.actions[i]) || {}; return { gi: SITUATIONS.length - 1, ai: i, tipo: c.type, vr: c.variant };
      } return null; } catch (e) { return { err: String(e.message || e) }; } });
    if (!r || r.err) return { kind, skip: 'scena non costruibile ' + (r && r.err) };
    const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(+g, true), r.gi).catch(() => false);
    if (!ok) return { kind, skip: 'force fallito' };
    await sleep(400);
    await page.evaluate(k => { window.__CPM_FROZEN = false; window.__CPM_GK229 = []; window.__CPM_REC229 = 1; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = k; }, kind);
    await page.evaluate(a => window.__CPM_RESOLVE(a), r.ai);
    const t0 = Date.now(); let st = null;
    while (Date.now() - t0 < 45000) { await sleep(500);
      st = await page.evaluate(() => { const R = window.__CPM_GK229 || []; const g = R.filter(f => f.op).map(f => f.op); const S = (typeof window.__CPM_STATE === 'function' && window.__CPM_STATE()) || {};
        const o = document.querySelector('[data-cpm="hl-outcome"]'); return { k: [...new Set(R.map(f => f.ok + '/' + f.ph + '/' + f.at))].slice(0, 12), arm: window.__CPM_GKACT || null, gate: (window.__CPM_GKGATE || []).slice(-3), arc: window.__CPM_ARC || null, n: R.length, g: [...new Set(g)], ck: R.length ? R[R.length - 1].ck : 0, res: (window.__CPM_RES218 || []).slice(-1)[0] || null }; });
      if (st.ck > 5) break; }
        const dom = await page.evaluate(() => document.body.innerText.split('\n').map(l => l.trim()).filter(l => l.length > 3 && l.length < 90).slice(0, 40));
    return { kind, tipo: r.tipo, vr: r.vr, gesti: st && st.g, k: st && st.k, arm: st && st.arm, gate: st && st.gate, arc: st && st.arc, n: st && st.n, res: st && st.res, dom, errs };
  } catch (e) { return { kind, skip: 'errore ' + String(e.message || e).slice(0, 120) }; } finally { try { await page.close(); } catch (_e) {} }
}
const E = {};
for (const rosso of [false, true]) { const L = E[rosso ? 'rosso' : 'verde'] = [];
  for (const k of KINDS) { const o = await giro(rosso, k); L.push(o);
    o.contraddice = !o.skip && (o.dom || []).some(l => reCond.test(l));
    o.gesto = (o.gesti || []).some(g => /^gk_(dive|block|catch)$/.test(g));
    console.log((rosso ? 'ROSSO ' : 'VERDE ') + k + (o.skip ? ' NON GIUDICATO ' + o.skip : ' · riga «palla persa» ' + (o.contraddice ? 'SI' : 'no') + ' · gesto portiere ' + ((o.gesti || []).join('+') || 'nessuno') + ' · riquadro ' + JSON.stringify((o.dom || []).filter(l => /·|😬|😔|❌|🧱|🧤|😤|😖|🚩/.test(l)).slice(0, 3)) + (o.errs && o.errs.length ? ' · errori ' + o.errs.length : ''))); } }
await b.close(); srv.close();
const V = E.verde, R = E.rosso, g = [];
if (V.some(o => o.skip)) g.push('verde: scene non giudicate ' + V.filter(o => o.skip).length);
if (V.some(o => o.contraddice)) g.push('verde: riga «palla persa» sotto un tiro');
const vs = V.find(o => o.kind === 'saved'); if (vs && !vs.gesto) g.push('verde: parata senza gesto del portiere');
if (V.some(o => o.errs && o.errs.length)) g.push('verde: errori di pagina');
if (!R.some(o => o.contraddice)) g.push('rosso: la riga contraddittoria non si vede');
const rs = R.find(o => o.kind === 'saved'); if (rs && rs.gesto) g.push('rosso: il portiere para anche col difetto');
if (g.length) { console.log('❌ conduci-242'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ conduci-242 verde (riga, riquadro e portiere dicono il tiro) e il rosso si vede');
