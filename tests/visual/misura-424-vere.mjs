#!/usr/bin/env node
/* [giro 424, PO-653] SONDA sulle PARTITE VERE (non guardiano), derivata da misura-364-vere: GLB acceso, salvataggi veri x semi,
   scene del motore col loro cast. A ogni scelta aperta con un'azione di passaggio/assist (RE_PASS di misura-424) la sonda lascia
   leggere 1,5 s, sceglie quell'azione e, quando la scena si chiude da sola, calcola metriche424 sui fotogrammi del testimone
   __CPM_F364 (ricevente: dove stava a fine lettura, se era nel quadro, quanto corre dopo la scelta). CPM_TIPO = __CPM_TIPO_OCC.
   CPM_FLAGS (bracci), CPM_SALVA, CPM_SEMI, CPM_PAR, CPM_OUT, CPM_RADICE (cartella servita: una copia congelata del gioco). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { metriche424, RE_PASS } from './misura-424.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const FLAGS = (process.env.CPM_FLAGS || '').split(',').filter(Boolean);
const SEMI = (process.env.CPM_SEMI || '1,2').split(',').map(Number), SAVES = (process.env.CPM_SALVA || 's1,s5,s12').split(',');
const PAR = +(process.env.CPM_PAR || 3), OUT = process.env.CPM_OUT || 'out/misura-424-vere.json';
const TMAX = +(process.env.CPM_TMAX || 1500000), STALLO = +(process.env.CPM_STALLO || 300000);
const srv = process.env.CPM_RADICE ? await startServer(process.env.CPM_RADICE) : await startServer(); const b = await launchBrowser();
async function gioca(sk, sd) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const raw = FX(SALVA[sk]); let ls; const ritocca = (sv) => { const p = sv.player || sv; p.name += ' ' + sd; return sv; };
  if (raw['cpm-v3']) { ls = { ...raw }; ls['cpm-v3'] = JSON.stringify(ritocca(JSON.parse(ls['cpm-v3']))); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
  else ls = { 'cpm-v3': JSON.stringify(ritocca(JSON.parse(JSON.stringify(raw)))) };
  ls['cpm-match-speed'] = '2';
  await page.addInitScript(([s, arm, tipo]) => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1;/* costruzione dell'azione e teatro accesi, come nel gioco: sul banco sono spenti */ window.__CPM_REC364 = 1; if (tipo) window.__CPM_TIPO_OCC = tipo; window.__CPM_F364 = []; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000; window.__CPM_TIPO_OCC = 'fascia';
    for (const f of arm) window[f] = 1; for (const k in s) { try { localStorage.setItem(k, s[k]); } catch (e) {} } }, [ls, FLAGS, process.env.CPM_TIPO || null]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 90000 });
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 120000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'mano', tickMs: 150 }), sd);
  const t0 = Date.now(), fatte = {}, righe = []; let prog = '', tProg = t0, chiusa = 'tetto', mMax = 0, aperta = null;
  while (Date.now() - t0 < TMAX) {
    const st = await page.evaluate(() => ({ ph: window.__CPM_PHASE(), c: window.__CPM_CURSIT(), a: window.__CPM_ACTS ? window.__CPM_ACTS() : [], m: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null,
      pp: window.__CPM_PPOS ? window.__CPM_PPOS() : null, p6: (window.__CPM_P6 || []).slice(-3), nF: (window.__CPM_F364 || []).length })).catch(() => null);
    if (!st) { chiusa = 'pagina'; break; } if (st.m > mMax) mMax = st.m;
    const inHL = /^hl_/.test(st.ph || '');
    if (aperta && !inHL) {/* la scena si e' chiusa da sola: si prendono i suoi fotogrammi */
      const F = await page.evaluate((k) => (window.__CPM_F364 || []).filter(f => f.sk === k), aperta.sk);
      const n0 = F.findIndex(f => f.t >= aperta.tScelta); const run = { F, nScelta: n0 < 0 ? F.length : n0, st: { y0: aperta.pp ? +aperta.pp.y : 50, text: aperta.t } };
      righe.push({ nome: `${sk}/${sd} ${aperta.min}'`, k: aperta.k, az: aperta.scelta, esito: 'vero', testo: aperta.t, fascia: aperta.fascia, pp: aperta.pp, m: metriche424(run), r424: await page.evaluate((k) => [(window.__CPM_R424 || {})[k]].filter(Boolean), aperta.sk), ...(process.env.CPM_GREZZO ? { F, nScelta: run.nScelta } : {}) });
      aperta = null; await page.evaluate(() => { window.__CPM_F364.length = 0; });
    }
    if (st.ph === 'ended' || st.ph === 'ceremony') { chiusa = 'fine'; break; }
    const k = st.ph + '|' + st.m + '|' + (st.c ? st.c.i : ''); if (k !== prog) { prog = k; tProg = Date.now(); } else if (Date.now() - tProg > STALLO) { chiusa = 'stallo'; break; }
    if (st.ph === 'hl_choose' && st.c && !fatte[st.c.i] && st.a.length) {
      const pa = st.a.map((l, i) => RE_PASS.test(l) && !/cross|tiro|tira|conclu/i.test(l) ? i : -1).filter(i => i >= 0);
      const fascia = pa.length > 0;
      let k2 = (sd + st.c.i) % st.a.length; if (fascia) k2 = pa[(sd + st.c.i) % pa.length];
      await sleep(fascia ? 1500 : 0);/* nella scena di fascia si lascia leggere, come fa chi gioca */
      const r = await page.evaluate((k) => { const R = window.__CPM_RESEED; window.__CPM_RESEED = undefined; const t = Math.round(performance.now()); try { return { ok: window.__CPM_RESOLVE(k), t, sk: String(window.__CPM_F364.length ? window.__CPM_F364[window.__CPM_F364.length - 1].sk : '') }; } finally { window.__CPM_RESEED = R; } }, k2);
      fatte[st.c.i] = 1;
      if (fascia) aperta = { sk: r.sk, tScelta: r.t, t: st.c.t, k: k2, scelta: st.a[k2], min: st.m, pp: st.pp, fascia };
      else await page.evaluate(() => { window.__CPM_F364.length = 0; });
    }
    await sleep(100);
  }
  await ctx.close();
  return { sk, sd, chiusa, mMax, s: Math.round((Date.now() - t0) / 1000), righe };
}
const lavori = []; for (const sk of SAVES) for (const sd of SEMI) lavori.push({ sk, sd });
const fatti = []; let p = 0;
await Promise.all(Array.from({ length: Math.min(PAR, lavori.length) }, async () => { while (p < lavori.length) { const i = p++;
  try { fatti[i] = await gioca(lavori[i].sk, lavori[i].sd); } catch (e) { fatti[i] = { ...lavori[i], err: String(e).slice(0, 160), righe: [] }; }
  const f = fatti[i]; console.log(`${f.sk} seme ${f.sd} (${f.chiusa || 'err'}, ${f.s || '-'} s, ${f.mMax || '-'}') scene di fascia ${f.righe.length}${f.err ? ' ERR ' + f.err : ''}`);
  for (const r of f.righe) { const m = r.m, q = m.ric; console.log(`  ${r.nome} «${(r.testo || '').slice(0, 30)}» → «${(r.az || '').slice(0, 26)}» ${m.cieco ? 'CIECO ' + m.cieco : m.senzaRicevente ? 'senza ricevente' : m.ricEroe ? 'ricevente=eroe' : `ric#${m.id} lettura (${q.xA},${q.zA}) quadro ${q.qA} quota ${m.quotaQuadro} corsa ${m.corsa} dEroe ${m.dEroe}`} R424 ${JSON.stringify((r.r424 || []).slice(-1)[0] || null)}`); } } }));
await b.close(); srv.close();
fs.mkdirSync('out', { recursive: true }); fs.writeFileSync(OUT, JSON.stringify({ flags: FLAGS, fatti }));
console.log(`\nmisura-424-vere ${FLAGS.join(',') || 'verde'}: partite ${fatti.length}, finite ${fatti.filter(f => f && f.chiusa === 'fine').length}`);
{ const R = fatti.flatMap(f => (f && f.righe) || []), V = R.filter(r => r.m.ric), q = (a, f) => a.filter(f).length + '/' + a.length;
  console.log(`SINTESI vere: scene ${R.length} · con ricevente ${V.length} · senza ricevente ${R.filter(r => r.m.senzaRicevente).length} · ciechi ${R.filter(r => r.m.cieco).length}`);
  console.log(`  fuori dal quadro a fine lettura ${q(V, r => !r.m.ric.qA)} · nel quadro per meno di meta' della lettura ${q(V, r => r.m.quotaQuadro < 0.5)} · corsa >6 u dopo la scelta ${q(V, r => r.m.corsa > 6)}`); }
