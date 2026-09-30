#!/usr/bin/env node
/* [7.999.79 guardiano] Sonda del taccuino PO (build 7.999.73-75, S.12 W.30-32) rigiocata sulla build attuale: ogni caso su PAGINA
   NUOVA, scena forzata, azione scelta per ETICHETTA, esito forzato come nella nota. Legge la chiave d'esito e il
   pallone per tutta la finestra d'esito (__CPM_PA457: x, z, quota, eroe). CPM_CASI=126,64 per restringere. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const CASI = [
  { gi: 126, et: /Stacco e indirizza/i, esito: 'fail', nota: 'intercept ma IN RETE' },
  { gi: 64, et: /Testa potente angolato/i, esito: 'fail', nota: 'miss ma IN RETE' },
  { gi: 5, et: /rasoterra/i, esito: 'success', nota: 'rigore: stile angolato rasoterra' },
  { gi: 5, et: /Centro-alto/i, esito: 'success', nota: 'rigore: stile centro-alto' },
  { gi: 151, et: /sprint sulla ribattuta/i, esito: 'success', nota: 'eroe dentro la porta' },
  { gi: 18, et: /Dribbling netto/i, esito: 'fail', nota: 'pallone e eroe separati (13,9u)' },
  { gi: 140, et: /angolo/i, esito: 'fail', nota: '012 all\'indietro · 006 reparto fermo' },
  { gi: 171, et: /Stacco in corsa/i, esito: 'success', nota: 'testa non sincronizzata' },
].filter(c => !process.env.CPM_CASI || process.env.CPM_CASI.split(',').includes(String(c.gi)));
const LINEA = 48.6, PALI = 3.35;
const RIS = [];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const c of CASI) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; if (r[0]) window.__CPM_NO_AVANTI78 = 1; if (r[1]) window.__CPM_NO_TIRO94 = 1; if (r[2]) window.__CPM_NO_STILE79 = 1; }, [!!process.env.CPM_ROSSO78, !!process.env.CPM_ROSSO94, !!process.env.CPM_ROSSO79]);
  await openMatch(p, port, { skipLoadAll: true, name: 'Taccuino78' }); await sleep(900);
  await p.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  const ok = await p.evaluate(g => window.__CPM_FORCE_SIT(g, true), c.gi).catch(() => false);
  await sleep(1500);
  const acts = await p.evaluate(() => (window.__CPM_ACTS && window.__CPM_ACTS()) || []);
  const lab = a => typeof a === 'string' ? a : (a && a.label) || '';
  const k = acts.findIndex(a => c.et.test(lab(a)));
  if (!ok || k < 0) { console.log(`gi${c.gi}: CIECO (scena ${ok}, azioni ${acts.map(lab).join(' | ')})`); await p.close(); continue; }
  await p.evaluate(e => { window.__CPM_PA457 = []; window.__CPM_FORCE_OUTCOME = e; }, c.esito);
  if (process.env.CPM_STATO) console.log('    stato prima', JSON.stringify(await p.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s ? { htx: s.htx, hty: s.hty, px: s.playerX, phase: s.phase, hero: s.hero } : null; })));
  await p.evaluate(i => window.__CPM_RESOLVE(i), k);
  if (process.env.CPM_STATO) for (const w of [300, 1200]) { await sleep(w); console.log('    stato dopo', w, JSON.stringify(await p.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s ? { htx: s.htx, hty: s.hty, px: s.playerX, phase: s.phase, hero: s.hero } : null; }))); }
  let key = null; for (let i = 0; i < 30 && !key; i++) { key = await p.evaluate(() => { const o = window.__CPM_OUTCOME; return o ? (o.outKey || o.key || null) : null; }); if (!key) await sleep(80); }
  for (let i = 0; i < 60; i++) { const ph = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph !== 'hl_result') break; await sleep(250); }
  const pa = await p.evaluate(() => (window.__CPM_PA457 || []).slice());
  const rete = pa.filter(r => r.bx >= LINEA && Math.abs(r.bz) <= PALI);
  const vivi = pa.filter(r => r.rt >= 0.3 && !(r.pa != null && r.pa >= 0));
  const gap = (vivi.length ? vivi : pa).map(r => Math.hypot(r.bx - r.hx, r.bz - r.hz));
  let st = 0, stMax = 0, prevRt = null; for (const r of vivi) { const g = Math.hypot(r.bx - r.hx, r.bz - r.hz); if (g > 4) { st += prevRt != null ? r.rt - prevRt : 0; stMax = Math.max(stMax, st); } else st = 0; prevRt = r.rt; }
  const eroeInPorta = pa.filter(r => r.hx > LINEA - 0.6 && Math.abs(r.hz) < PALI + 0.6);
  const _i0 = pa.findIndex(r => r.pa != null && r.pa >= 0); const fineArco = _i0 > 0 ? pa[_i0 - 1] : null;
  const alLinea = pa.find(r => r.bx >= LINEA - 0.5);
  /* il tiro torna indietro? massimo arretramento della palla dopo il build-up e prima del post-arco */
  let mx = -99, indietro = 0; for (const r of pa) { if (r.tlOn || (r.pa != null && r.pa >= 0)) { mx = -99; continue; } mx = Math.max(mx, r.bx); indietro = Math.max(indietro, mx - r.bx); }
  const av = await p.evaluate(() => window.__CPM_AVANTI78 || null);
  const st79 = await p.evaluate(() => window.__CPM_STILE79 || null); if (st79) console.log('    stile79', JSON.stringify(st79));
  console.log(`gi${String(c.gi).padEnd(4)} «${lab(acts[k])}» esito ${key} (${c.nota})\n    campioni ${pa.length} · palla x ${Math.min(...pa.map(r => r.bx)).toFixed(1)}→${Math.max(...pa.map(r => r.bx)).toFixed(1)} · IN RETE ${rete.length ? 'SI (' + rete.length + ')' : 'no'} · post ${[...new Set(pa.map(r => r.pt).filter(Boolean))].join('>') || '-'}` +
    `\n    fine arco: ${fineArco ? `x ${fineArco.bx} z ${fineArco.bz} quota ${fineArco.by}` : '—'} · alla linea: ${alLinea ? `z ${alLinea.bz} quota ${alLinea.by}` : '—'} · eroe max x ${Math.max(...pa.map(r => r.hx)).toFixed(1)} (in porta: ${eroeInPorta.length}) · distanza eroe-palla (dopo 0,3s, senza post-arco) max ${Math.max(...gap).toFixed(1)} · oltre 4u per ${stMax.toFixed(2)}s di scena\n    arretramento del pallone nel tiro ${indietro.toFixed(2)} · correzioni avanti78 ${av ? av.n + ' ' + JSON.stringify(av.ultimo) : 0}`);
  if (process.env.CPM_TRACCIA) pa.filter((r, i) => (process.env.CPM_TRACCIA === "eroe" ? r.hx > 46.5 : (r.bx > 40 || i % 10 === 0))).forEach(r => console.log(`      rt ${r.rt} tl ${r.tlOn ? 1 : 0}/${r.tlT} pa ${r.pa} ${r.pt || '-'} · palla ${r.bx},${r.bz} q${r.by} · eroe ${r.hx},${r.hz}`));
  RIS.push({ gi: c.gi, lbl: lab(acts[k]), key, inPorta: eroeInPorta.length, indietro, linea: alLinea ? { z: alLinea.bz, y: alLinea.by } : null, fine: fineArco ? { z: fineArco.bz, y: fineArco.by } : null });
  await p.close();
}
await b.close(); srv.close();
/* GIUDIZIO (solo sui casi con un rimedio in 7.999.79; gli altri sono stampati come misura) */
const g = [];
const r151 = RIS.find(r => r.gi === 151);
if (r151) { if (process.env.CPM_ROSSO94) { if (r151.inPorta === 0) g.push('rosso 94 CIECO: l\'eroe non entra nella porta nemmeno senza il limite'); }
  else { if (r151.inPorta > 0) g.push(`gi151: eroe nello specchio della porta per ${r151.inPorta} fotogrammi`); if (r151.indietro > 0.6) g.push(`gi151: il tiro arretra di ${r151.indietro.toFixed(2)}`); } }
if (!process.env.CPM_ROSSO79 && !process.env.CPM_ROSSO94) for (const r of RIS.filter(r => r.gi === 5)) {
  const z = r.linea ? Math.abs(r.linea.z) : null;
  if (/rasoterra/i.test(r.lbl) && !(z >= 2.0)) g.push(`rigore «${r.lbl}»: in porta a |z| ${z} (atteso l'angolo, ≥ 2)`);
  if (/Centro-alto/i.test(r.lbl) && !(z <= 1.0 && r.fine && r.fine.y >= 1.5)) g.push(`rigore «${r.lbl}»: |z| ${z}, quota a fine arco ${r.fine && r.fine.y} (atteso centrale e alto)`); }
console.log(g.length ? '❌ taccuino-79\n' + g.map(x => '  ✗ ' + x).join('\n') : (process.env.CPM_ROSSO94 ? '✅ il rosso si vede (eroe nella porta senza il limite)' : '✅ taccuino-79 verde'));
process.exit(g.length ? 1 : 0);
