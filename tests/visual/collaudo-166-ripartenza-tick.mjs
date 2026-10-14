#!/usr/bin/env node
/* [collaudo release 7.999.165 · sospetto PO-207 «dopo il gol la ripartenza non porta il pallone al centro»]
   Partita vera dal salvataggio S12 (autoplay seedato del gioco), velocita' CPM_SPEED (1 o 2). Dentro la pagina, a OGNI
   fotogramma (requestAnimationFrame) si registra lo stato del motore che il campo 2D disegna (__CPM_MOTORE_OBJ().stato():
   poss.stato, palla, ventidue) e la fase. A ogni aumento del punteggio (__CPM_SCORE) si fotografa il campo a +0, +150, +300,
   +600, +1000, +2000 ms. Per ogni gol la sonda calcola:
     · se il motore passa da «kickoff» e per quanti ms REALI il pallone resta a (50,50);
     · quanti dei venti di movimento stanno nella propria meta' durante il kickoff (5% di tolleranza);
     · dove sta il pallone 1 s e 2 s dopo il gol.
   GLB spento: in `playing` il 3D e' fermo (7.917) e si vede il campo 2D. Uscita: docs/collaudi/release-166/dati/ripartenza-<speed>.json + foto rip-*.jpg
   Uso: CPM_SPEED=1 CPM_PARTITE=2 node collaudo-166-ripartenza.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT = path.resolve('../../docs/collaudi/release-166'); fs.mkdirSync(path.join(OUT, 'dati'), { recursive: true });
const SPEED = process.env.CPM_SPEED || '1', NP = +(process.env.CPM_PARTITE || 2), MAXS = +(process.env.CPM_MAXS || 420);
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const out = [];
for (let k = 0; k < NP; k++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + String.fromCharCode(75 + k);/* partita diversa: il seme nasce anche dal nome */
  await page.addInitScript(([s, sp]) => { window.__CPM_GLB = false; window.__CPM_REC = true; localStorage.setItem('cpm-match-speed', sp); localStorage.setItem('cpm-v3', JSON.stringify(s));
    window.__R165 = { gol: [] }; let sc0 = null, cur = null;
    const f = () => { try { const sc = window.__CPM_SCORE && window.__CPM_SCORE(); const ph = window.__CPM_PHASE && window.__CPM_PHASE();
      if (sc) { const tot = (sc.home | 0) + (sc.away | 0); if (sc0 != null && tot > sc0) { cur = { t0: performance.now(), ph0: ph, score: [sc.home | 0, sc.away | 0], min: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null, s: [] }; window.__R165.gol.push(cur); window.__R165.nuovo = (window.__R165.nuovo | 0) + 1; } sc0 = tot; }
      if (cur && performance.now() - cur.t0 < 12000) { let st = null; try { st = window.__CPM_MOTORE_OBJ().stato(); } catch (e) {}
        if (st) { const G = st.gioc || []; let propria = 0, n = 0; for (const p of G) { if (!p || p.gk) continue; n++; const casa = p.t === 0; if (casa ? p.x <= 52.5 : p.x >= 47.5) propria++; }
          cur.s.push([Math.round(performance.now() - cur.t0), ph, st.poss && st.poss.stato, st.palla ? [Math.round(st.palla.x), Math.round(st.palla.y)] : null, propria, n, st.eroe ? Math.round(st.eroe.x) : null]); } } else cur = null; } catch (e) {}
      requestAnimationFrame(f); }; requestAnimationFrame(f); }, [sv, SPEED]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(sd => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: sd, policy: 'seeded', tickMs: 300 }), 1650 + k);
  const t0 = Date.now(); let visti = 0;
  while (Date.now() - t0 < MAXS * 1000) {
    const s = await page.evaluate(() => ({ f: window.__CPM_PHASE && window.__CPM_PHASE(), n: window.__R165.nuovo | 0 })).catch(() => ({}));
    if (s.f === 'ended' || s.f === 'ceremony') break;
    if (process.env.CPM_SCHEDE === '1') { const sc = await page.evaluate(() => { const el = document.querySelector('[data-cpm="pop919"]'); if (!el) return null; const t = el.innerText || ''; return { min: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null, testo: t.split('\n').slice(0, 6).join(' | ').slice(0, 160), sost: ((document.body.innerText || '').match(/SOSTITUITO AL \d+'/) || [null])[0] }; }).catch(() => null); if (sc) { (globalThis.__SCH = globalThis.__SCH || []).push(sc); } }
    await page.evaluate(() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (!M || M.__w165) return; const T = M.tick; window.__TK165 = window.__TK165 || [];
      M.tick = function (...a) { const r = T.apply(this, a); try { const S = M._S, P = S.poss; const g = M._g || []; let pr = 0, n = 0; for (const q of g) { if (!q || q.gk) continue; n++; if (q.team === S.kickoff?.lato ? true : true) { const casa = String(q.team) === String(g[0] && g[0].team); if (casa ? q.x <= 52.5 : q.x >= 47.5) pr++; } }
        if (window.__TK165.length < 30000) window.__TK165.push([Math.round(performance.now()), a[0] && a[0].min, P.stato, Math.round(S.palla.x), Math.round(S.palla.y), pr, n, (S.conta.gol.home | 0) + (S.conta.gol.away | 0), window.__CPM_PHASE && window.__CPM_PHASE(), (() => { try { const q = window.__CPM_SCORE(); return (q.home | 0) + (q.away | 0); } catch (e) { return null; } })()]); } catch (e) {} return r; }; M.__w165 = 1; } catch (e) {} }).catch(() => {});
    if (process.env.CPM_CHIUDI === '1') await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.getBoundingClientRect().width > 0 && /^\s*1/.test(x.textContent || '') && x.closest('[data-cpm="pop919"]')); if (b) b.click(); }).catch(() => {});
    if (s.n > visti) { visti = s.n; for (const dt of [0, 150, 300, 600, 1000, 2000]) { await page.screenshot({ path: path.join(OUT, `ripT${process.env.CPM_TABELLONE === "1" ? "b" : ""}-x${SPEED}-p${k + 1}-gol${visti}-${dt}ms.jpg`), type: 'jpeg', quality: 70 }).catch(() => {}); if (dt < 2000) await sleep(dt === 0 ? 150 : dt === 150 ? 150 : dt === 300 ? 300 : dt === 600 ? 400 : 1000); } }
    await sleep(120);
  }
  const R = await page.evaluate(() => window.__R165.gol);
  const TK = await page.evaluate(() => window.__TK165 || []);
  const golTk = []; const KEY = process.env.CPM_TABELLONE === '1' ? 9 : 7; for (let i = 1; i < TK.length; i++) if (TK[i][KEY] > TK[i - 1][KEY]) golTk.push(i);
  const perGol = golTk.map(i => { const seq = TK.slice(i, i + 40); const ko = seq.filter(x => x[2] === 'kickoff'); const reteI = seq.findIndex(x => x[2] !== 'rete');
    const ko0 = seq.findIndex(x => x[2] === 'kickoff'); const koFine = ko0 >= 0 ? seq.findIndex((x, j) => j > ko0 && x[2] !== 'kickoff') : -1;
    const dopo = koFine >= 0 ? seq.slice(koFine, koFine + 25) : []; const secondo = dopo.findIndex(x => x[2] === 'kickoff');
    const prevFase = TK[Math.max(0, i - 1)][8]; const sceneGol = TK.slice(Math.max(0, i - 3), i + 1).some(x => /^hl_/.test(x[8] || '')); const jP = TK.findIndex((x, j) => j > i && x[8] === 'playing'); const dopoScena = sceneGol && jP > 0 ? TK.slice(jP, jP + 14).map(x => [x[0] - TK[jP][0], x[2], x[3], x[4], x[5]]) : null; const msAllaRipresa = jP > 0 ? TK[jP][0] - TK[i][0] : null; return { dopoScena, msAllaRipresa, scena: sceneGol, prevFase, min: TK[i][1], fase: TK[i][8], decisioniRete: reteI, decisioniKickoff: ko.length, kickoffMsReali: ko0 >= 0 && koFine >= 0 ? seq[koFine][0] - seq[ko0][0] : null, propriaMeta: ko.map(x => x[5] + '/' + x[6]).slice(0, 3),
      secondoKickoffDopoDecisioni: secondo >= 0 ? secondo : null, secondoKickoffDopoMs: secondo >= 0 ? dopo[secondo][0] - seq[koFine][0] : null, pallaDopo5: dopo[5] ? [dopo[5][3], dopo[5][4]] : null, seq: seq.slice(0, 18).map(x => [x[0] - seq[0][0], x[2], x[3], x[4]]) }; });
  perGol.forEach(g => console.log('TICK', 'x' + SPEED, 'p' + (k + 1), JSON.stringify({ ...g, seq: undefined }), JSON.stringify(g.seq.slice(0, 10))));
  const int226 = await page.evaluate(() => { try { return { int: window.__CPM_INT226 || null, testo: (document.body.innerText || '').match(/SOSTITUITO AL \d+'|ENTRA AL \d+'/g) }; } catch (e) { return null; } });/* schede del mister lasciate senza risposta (la sonda non clicca) */
  for (const g of R) {
    const ko = g.s.filter(x => x[2] === 'kickoff'); const centro = g.s.filter(x => x[3] && Math.abs(x[3][0] - 50) <= 3 && Math.abs(x[3][1] - 50) <= 3);
    const at = ms => { const x = g.s.find(q => q[0] >= ms); return x ? { ph: x[1], st: x[2], palla: x[3] } : null; };
    g.sintesi = { fase: g.ph0, min: g.min, campioni: g.s.length, kickoffMs: ko.length ? ko[ko.length - 1][0] - ko[0][0] : 0, kickoffDa: ko.length ? ko[0][0] : null, centroMs: centro.length ? centro[centro.length - 1][0] - centro[0][0] : 0,
      propriaMetaInKickoff: ko.length ? ko.map(x => x[4] + '/' + x[5]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4) : null, a1s: at(1000), a2s: at(2000), a3s: at(3000), stati: [...new Set(g.s.map(x => x[1] + ':' + x[2]))].slice(0, 12) };
    /* ritorni al centro: il pallone lascia il centro (>8u) e poi ci torna in «kickoff» */
    let lasciato = false, ritorni = []; for (const x of g.s) { if (!x[3]) continue; const d = Math.hypot(x[3][0] - 50, x[3][1] - 50); if (d > 8) lasciato = true; else if (lasciato && x[2] === 'kickoff') { ritorni.push(x[0]); lasciato = false; } }
    g.sintesi.kickoffEpisodi = (() => { let n = 0, prev = null; for (const x of g.s) { if (x[2] === 'kickoff' && prev !== 'kickoff') n++; prev = x[2]; } return n; })(); g.sintesi.ritorniAlCentroMs = ritorni;
    g.raw = g.s.filter((x, i) => i % 3 === 0 || x[2] === 'kickoff' || x[2] === 'rete').map(x => [x[0], x[1], x[2], x[3], x[4]]); delete g.s; console.log('x' + SPEED, 'p' + (k + 1), JSON.stringify(g));
  }
  out.push({ schede: (globalThis.__SCH || []).filter((x, i, a) => i === 0 || x.min !== a[i - 1].min || x.testo !== a[i - 1].testo), partita: k + 1, speed: SPEED, perGol, decisioni: TK.length, int226, gol: R, durS: Math.round((Date.now() - t0) / 1000) });
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, 'dati', `ripartenza-tick-x${SPEED}${process.env.CPM_TABELLONE === "1" ? "-tabellone" : ""}.json`), JSON.stringify(out, null, 1));
await b.close(); srv.close();
