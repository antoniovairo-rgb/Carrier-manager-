#!/usr/bin/env node
/* [giro 162 PO-362] STRUMENTO, non guardiano. Da dove nasce la distanza dei tiri della scena «spalle alla porta»?
   Flusso vero (salvataggi s1/s5/s12 x semi, come distanze-126), autoplay 'mano': sulla scena «spalle alla porta» sceglie a
   rotazione (per seme) girata / tiro di potenza / protezione e scarico; sulle altre la prima opzione. Per ogni scena spalle annota:
     - l'occasione del motore (__CPM_P6: x, y, zona implicita, press) — l'ANCORA della scena;
     - la posizione LOGICA dell'eroe in hl_choose (__CPM_PPOS) — l'AVVIO;
     - il contatto __CPM_CONT121 (posizione 3D dell'eroe, gx, z, bersaglio dell'arco tx/tz) — l'ARCO.
   Metri come distanze-126: hypot(gx, z) x 1,05. CPM_SPALLE=<regex> fissa la scelta sulla scena spalle; CPM_FLAGS per i bracci, CPM_SALVA, CPM_SEMI, CPM_PAR, CPM_OUT. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const FLAGS = (process.env.CPM_FLAGS || '').split(',').filter(Boolean);
const SEMI = (process.env.CPM_SEMI || '1,2,3,4,5,6,7,8').split(',').map(Number);
const SAVES = (process.env.CPM_SALVA || 's1,s5,s12').split(',');
const PAR = +(process.env.CPM_PAR || 3), OUT = process.env.CPM_OUT || 'out/sonda-spalle-162.json';
const TMAX = +(process.env.CPM_TMAX || 1500000), STALLO = +(process.env.CPM_STALLO || 240000);
const SCELTA = [/Girata secca/, /Tiro di potenza/, /Proteggi palla/];
const srv = await startServer(); const b = await launchBrowser();
async function gioca(sk, sd) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const raw = FX(SALVA[sk]); let ls;
  if (raw['cpm-v3']) { ls = { ...raw }; const sv = JSON.parse(ls['cpm-v3']); (sv.player || sv).name += ' ' + sd; ls['cpm-v3'] = JSON.stringify(sv); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
  else { const sv = JSON.parse(JSON.stringify(raw)); (sv.player || sv).name += ' ' + sd; ls = { 'cpm-v3': JSON.stringify(sv) }; }
  ls['cpm-match-speed'] = '2';
  await page.addInitScript(([s, arm]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000;
    for (const f of arm) window[f] = 1; for (const k in s) { try { localStorage.setItem(k, s[k]); } catch (e) {} } }, [ls, FLAGS]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'mano', tickMs: 150 }), sd);
  const t0 = Date.now(), fatte = {}, cont = [], log = []; let prog = '', tProg = t0, ph = '', chiusa = 'tetto';
  while (Date.now() - t0 < TMAX) {
    const st = await page.evaluate(() => ({ ph: window.__CPM_PHASE(), c: window.__CPM_CURSIT(), a: window.__CPM_ACTS ? window.__CPM_ACTS() : [], m: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null,
      pp: window.__CPM_PPOS ? window.__CPM_PPOS() : null, p6: (window.__CPM_P6 || []).slice(-1)[0] || null, L: (window.__CPM_CONT121 || []).splice(0) })).catch(() => null);
    if (!st) { chiusa = 'pagina'; break; } ph = st.ph; for (const x of st.L) cont.push(x); if (ph === 'ended' || ph === 'ceremony') { chiusa = 'fine'; break; }
    const k = ph + '|' + st.m + '|' + (st.c ? st.c.i : ''); if (k !== prog) { prog = k; tProg = Date.now(); } else if (Date.now() - tProg > STALLO) { chiusa = 'stallo'; break; }
    if (st.ph === 'hl_choose' && st.c && !fatte[st.c.i] && st.a.length) {
      const spalle = /spalle alla porta/i.test(st.c.t);
      const re = spalle ? (process.env.CPM_SPALLE ? new RegExp(process.env.CPM_SPALLE) : SCELTA[sd % SCELTA.length]) : /^$/;
      let k2 = st.a.findIndex(l => re.test(l)); if (k2 < 0 && spalle) k2 = st.a.findIndex(l => /Girata secca|Tiro di potenza/.test(l)); if (k2 < 0) k2 = 0;
      const ok = await page.evaluate((k) => { const R = window.__CPM_RESEED; window.__CPM_RESEED = undefined; try { return window.__CPM_RESOLVE(k); } finally { window.__CPM_RESEED = R; } }, k2);
      fatte[st.c.i] = 1; if (spalle) log.push({ i: st.c.i, t: st.c.t, scelta: st.a[k2], az: st.a, ok, pp: st.pp, p6: st.p6, min: st.m });
    }
    await sleep(100);
  }
  await ctx.close();
  return { sk, sd, chiusa, s: Math.round((Date.now() - t0) / 1000), righe: log.map(l => { const c = cont.find(x => x.sk % 10000 === l.i && !x.bg && x.act) || cont.find(x => x.sk % 10000 === l.i) || null;
    return { ...l, c, m: c ? +(Math.hypot(c.gx, c.z) * 1.05).toFixed(1) : null }; }) };
}
const lavori = []; for (const sk of SAVES) for (const sd of SEMI) lavori.push({ sk, sd });
const fatti = []; let p = 0;
await Promise.all(Array.from({ length: Math.min(PAR, lavori.length) }, async () => { while (p < lavori.length) { const i = p++;
  try { fatti[i] = await gioca(lavori[i].sk, lavori[i].sd); } catch (e) { fatti[i] = { ...lavori[i], err: String(e).slice(0, 100), righe: [] }; }
  const f = fatti[i]; console.log(`${f.sk} seme ${f.sd} (${f.chiusa || 'err'}, ${f.s || '-'} s) scene spalle ${f.righe.length}${f.err ? ' ERR ' + f.err : ''}`);
  for (const r of f.righe) { const c = r.c || {}; const ancM = r.p6 ? +(Math.hypot(100 - r.p6.x, (r.p6.y - 50) * 0.6) * 1.05).toFixed(1) : null;
    console.log(`  hl ${r.i} ${r.min}' | ${r.scelta} | anc x ${r.p6 && r.p6.x} y ${r.p6 && r.p6.y} (${ancM} m) | avvio x ${r.pp && (+r.pp.x).toFixed(1)} y ${r.pp && (+r.pp.y).toFixed(1)} | contatto act ${c.act || '-'} eroe3d x ${c.x} z ${c.z} → ${r.m} m | arco tx ${c.tx} tz ${c.tz}`); } } }));
await b.close(); srv.close();
fs.mkdirSync('out', { recursive: true }); fs.writeFileSync(OUT, JSON.stringify({ flags: FLAGS, fatti }, null, 1));
const R = fatti.flatMap(f => f.righe.map(r => ({ ...r, sk: f.sk, sd: f.sd })));
const tiri = R.filter(r => r.c && r.c.act === 'shot');
console.log(`\nsonda-spalle-162 ${FLAGS.join(',') || 'verde'} · scene spalle ${R.length} · con contatto tiro ${tiri.length} · oltre 30 m ${tiri.filter(r => r.m > 30).length} · max ${tiri.length ? Math.max(...tiri.map(r => r.m)) : '-'} m`);
