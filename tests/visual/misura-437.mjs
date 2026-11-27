#!/usr/bin/env node
/* SONDA giro 437 (PO-628) — i gol dell'eroe in scena: riga «X segna su assist di Y», momenti chiave, eventi e pagelle del motore.
   Solo misura. CPM_PARTITE=4 · CPM_GLB=0 per spegnere i corpi (di default accesi) · CPM_ROSSO=1 arma __CPM_NO_G437. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
const PARTITE = +(process.env.CPM_PARTITE || 4), TETTO = +(process.env.CPM_TETTO || 300000), GLB = process.env.CPM_GLB !== '0';
const ROSSO = !!process.env.CPM_ROSSO, BASE = +(process.env.CPM_BASE || 0);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (let i = BASE; i < BASE + PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript(([g, r]) => { window.__CPM_GLB = g; window.__CPM_REC = 1; window.__CPM_SOLO166 = 1; if (r) window.__CPM_NO_G437 = 1; }, [GLB, ROSSO]);
  const t0 = Date.now(); let fine = false;
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Eroe' + (i * 17 + 3) });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 4370 + i * 37);
    await page.waitForFunction(() => { const p = window.__CPM_PHASE && window.__CPM_PHASE(); return p === 'ended' || p === 'ceremony'; }, null, { timeout: TETTO, polling: 400 });
    fine = true; await page.waitForTimeout(1500);
  } catch (e) { errs.push('attesa ' + String(e.message).slice(0, 80)); }
  const d = await page.evaluate(() => {
    const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ();
    const evm = M && M._S && M._S.eventi ? M._S.eventi.filter(e => e.t === 'gol').map(e => ({ min: e.min, scena: !!e.scena, chi: e.chi && e.chi.nome, eroe: !!(e.chi && e.chi.eroe), assist: e.assist && e.assist.nome, aEroe: !!(e.assist && e.assist.eroe) })) : null;
    const pag = M ? M.pagelle().filter(p => (p.gol | 0) || (p.assist | 0)).map(p => ({ n: p.nome || p.n || p.chi, gol: p.gol, assist: p.assist, eroe: !!p.eroe, team: p.team })) : null;
    const cro = (window.__CPM_CRO802 || []).filter(r => /segna|assist|^▶ scelta/i.test(r.txt)).map(r => r.t + "' " + r.txt);
    const mom = [...document.querySelectorAll('[data-cpm="momenti202"] > div')].map(x => x.textContent.trim());
    const ev = (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal').map(e => (e.min | 0) + "'" + e.src + '/' + e.side);
    return { evm, pag, cro, mom, ev, sc: window.__CPM_SCORE && window.__CPM_SCORE() };
  }).catch(e => ({ err: String(e) }));
  console.log(`\n### partita ${i} ${fine ? 'al fischio' : 'NON FINITA'} ${Math.round((Date.now() - t0) / 1000)}s ${JSON.stringify(d.sc)} err=${errs.slice(0, 2).join('|')}`);
  console.log(JSON.stringify(d, null, 1));
  await page.close();
}
await b.close(); srv.close();
