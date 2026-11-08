#!/usr/bin/env node
/* [giro 117 PO-324 «[PO-216 nota automatica] tabellone 1-2, motore 0-0. Gol del motore: —. Gol del tabellone: —. Scene: 56'»] GUARDIANO
   sul PERCORSO VERO della ripresa dopo un riavvio in campo (app uccisa dal sistema, o chiusa e riaperta a meta' partita): salvataggio S12
   (fixtures/save-190-s12-ovr93.json), partita giocata in autoplay seedato fino al primo gol del tabellone, istantanea periodica
   (`cpm-match-resume`, ogni 4 s), pagina chiusa SENZA pagehide e riaperta nello stesso profilo, rientro in campo, autoplay fino al fischio.
   Percorsi: «ripresa» (verde e rosso) e «normale» (stessa partita senza riavvio, solo verde: il controllo che il rimedio non tocchi il
   percorso di sempre).
   VERDE: a fine partita tabellone (__CPM_SCORE) = motore (tabellino del motore) = elenco dei gol MATCH_EV, e nessuna nota automatica 216.
   ROSSO (__CPM_NO_G117B): sulla ripresa lo scarto ricompare (motore < tabellone, elenchi vuoti dei gol di prima) e la nota 216 si scrive.
   Misura giro 117 (seme 4): gol del tabellone all'11', riavvio, fine 4-0. Verde 4-0 / motore 4-0 / 4 gol in elenco; rosso 4-0 / motore
   3-0 / 3 in elenco, e la nota 216 dice «Ripresa dopo riavvio: sì, al 11'» — la stessa forma della nota del PO (elenchi senza i gol di prima).
   Uso: node tabellone-117.mjs · K=<seme> (default 4) · PERCORSI=ripresa,normale · PAR=3 (browser in parallelo: in serie sfora i 10 min) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const K = +(process.env.K || 4); const PERCORSI = (process.env.PERCORSI || 'ripresa,normale').split(',');
const srv = await startServer(); const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const b = await launchBrowser();
async function apri(ctx) { const page = await ctx.newPage(); await installCdnRoutes(page); page.on('pageerror', e => console.log('  pageerror', String(e.message).slice(0, 160)));
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); return page; }
const fase = p => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
async function fino(page, t) { const t0 = Date.now(); let ph = ''; while (Date.now() - t0 < t) { ph = await fase(page); if (ph === 'ended' || ph === 'ceremony' || ph === 'shootout') break; await sleep(500); } return ph; }
async function leggi(page) { return page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const T = M && M.tabellino ? M.tabellino() : null;
  return { score: window.__CPM_SCORE && window.__CPM_SCORE(), motore: T && T.home ? { home: T.home.gol | 0, away: T.away.gol | 0 } : null,
    log: ((M && M._S && M._S._golLog) || []).length, ev: ((window.__CPM_EV && window.__CPM_EV()) || []).filter(e => e.ev === 'goal').map(e => e.side),
    t216: window.__CPM_T216 ? window.__CPM_T216.txt : null, r117: window.__CPM_G117R || null, min: (window.__CPM_CLOCK && window.__CPM_CLOCK()) | 0 }; }); }
async function braccio(percorso, rosso, b) {
  const rec = { percorso, rosso, err: null }; const t0 = Date.now();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' });
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' T117-' + K;
    await ctx.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_NO_STILI = 1; window.__CPM_PRESENT = 1; window.__CPM_RESUME_TEST = 1; if (r) window.__CPM_NO_G117B = 1;
      if (!localStorage.getItem('t117')) { localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); localStorage.setItem('cpm-intro-seen', '1'); localStorage.setItem('t117', '1'); } }, [sv, rosso]);
    let page = await apri(ctx); await sleep(1500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate(k => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: k, policy: 'seeded', tickMs: 150 }), K);
    if (percorso === 'ripresa') {
      let st = null; const tp = Date.now();
      while (Date.now() - tp < 300000) { await sleep(600); st = await page.evaluate(() => ({ s: window.__CPM_SCORE && window.__CPM_SCORE(), min: (window.__CPM_CLOCK && window.__CPM_CLOCK()) | 0, ph: window.__CPM_PHASE && window.__CPM_PHASE() }));
        if (st.s && (st.s.home + st.s.away) >= 1 && st.min >= 10 && st.ph === 'playing') break; if (st.min >= 80) break; }
      await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false)); await sleep(5000);
      rec.prima = await leggi(page); const sn = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cpm-match-resume') || 'null'); } catch (e) { return null; } });
      rec.snap = sn ? { clock: sn.clock, score: sn.score, g117: !!sn.g117 } : null;
      await page.close({ runBeforeUnload: false });
      page = await apri(ctx);
      for (let i = 0; i < 40; i++) { await sleep(700); const ph = await fase(page); if (ph && /^(playing|hl_)/.test(ph)) break; }
      rec.rientro = await leggi(page);
      await page.evaluate(k => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: k + 1, policy: 'seeded', tickMs: 150 }), K);
    }
    rec.fine = await fino(page, 420000); await sleep(2500);
    rec.dopo = await leggi(page);
    const d = rec.dopo, s = d.score, m = d.motore; const evH = d.ev.filter(x => x === 'home').length, evA = d.ev.filter(x => x === 'away').length;
    rec.coincide = !!(s && m) && s.home === m.home && s.away === m.away && evH === s.home && evA === s.away && !d.t216;
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000); await ctx.close(); return rec;
}
const lavori = []; for (const p of PERCORSI) for (const r of (p === 'ripresa' ? [false, true] : [false])) lavori.push([p, r]);
const out = []; const PAR = Math.max(1, Math.min(3, +(process.env.PAR || 3))); const extra = [];
for (let i = 1; i < Math.min(PAR, lavori.length); i++) extra.push(await launchBrowser());
let next = 0; const tutti = [b, ...extra];
await Promise.all(tutti.slice(0, Math.min(PAR, lavori.length)).map(async (bb) => { while (next < lavori.length) { const [p, r] = lavori[next++]; const x = await braccio(p, r, bb); out.push(x); console.log(JSON.stringify(x)); } }));
for (const bb of tutti) await bb.close(); srv.close();
const g = [];
for (const x of out) {
  if (x.err) { g.push(`${x.percorso}/${x.rosso ? 'rosso' : 'verde'}: errore ${x.err}`); continue; }
  if (x.percorso === 'ripresa') {
    if (!x.snap) { g.push(`ripresa/${x.rosso ? 'rosso' : 'verde'}: nessuna istantanea, non giudicato`); continue; }
    if (!x.prima || !x.prima.score || (x.prima.score.home + x.prima.score.away) < 1) { g.push(`ripresa/${x.rosso ? 'rosso' : 'verde'}: nessun gol prima del riavvio, non giudicato`); continue; }
    if (!x.rientro || !(x.rientro.min >= x.snap.clock)) { g.push(`ripresa/${x.rosso ? 'rosso' : 'verde'}: nessun rientro in campo dopo il riavvio, non giudicato`); continue; }
    if (!x.rosso && !x.rientro.r117) g.push('ripresa/verde: la ripresa non ha ripristinato i gol del motore (__CPM_G117R assente)');
  }
  if (!x.rosso && !x.coincide) g.push(`${x.percorso}/verde: tabellone ${JSON.stringify(x.dopo && x.dopo.score)} motore ${JSON.stringify(x.dopo && x.dopo.motore)} elenco ${JSON.stringify(x.dopo && x.dopo.ev)} nota216 ${!!(x.dopo && x.dopo.t216)}`);
  if (x.rosso && (x.coincide || !(x.dopo && x.dopo.t216))) g.push(`${x.percorso}/rosso: lo scarto non ricompare ${JSON.stringify(x.dopo)}`);
}
if (g.length) { console.log('❌ tabellone-117'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ tabellone-117 verde (ripresa e percorso normale: tabellone = motore = elenco) e il rosso si vede');
