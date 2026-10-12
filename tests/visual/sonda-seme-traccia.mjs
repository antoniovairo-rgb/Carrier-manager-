#!/usr/bin/env node
/* [SEME-a diagnosi, sonda di sola misura] Due giri «identici» (stesso salvataggio save-190-s12-ovr93, stesso seme
   di autoplay) e una TRACCIA per minuto: fase, minuto, scena (hlIdx + testo), punteggio, esito della scena
   (timeline), righe di cronaca alla sorgente (__CPM_TXT487), registro eventi (__CPM_EV), e il numero di
   Math.random chiamati per minuto di gioco.
   Variabili:  SEME=2311 (seme autoplay) · GIRI=2 · RANDSEED=1 sostituisce Math.random con un generatore
   seedato (stesso seme in ogni giro) · OUT=/tmp/claude-0/seme/<nome>.json · TAG=etichetta.
   Uso: node sonda-seme-traccia.mjs  */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SEME = +(process.env.SEME || 2311), GIRI = +(process.env.GIRI || 2), RANDSEED = process.env.RANDSEED === '1', FREEZEDATE = process.env.FREEZEDATE === '1';
const TAG = process.env.TAG || ('s' + SEME + (RANDSEED ? '-rs' : ''));
const OUTD = '/tmp/claude-0/seme'; fs.mkdirSync(OUTD, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(n) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e && e.message).slice(0, 160)));
  await page.addInitScript(([s, rs]) => {
    window.__CPM_GLB = false; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s));
    window.__CPM_TXT487 = [];
    /* Math.random: conteggio per minuto di gioco; con rs=1 sostituito da un mulberry32 a seme fisso */
    const orig = Math.random; let a = 0x9E3779B9 >>> 0;
    const mb = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    window.__SR = { n: 0, perMin: {} };
    Math.random = function () { window.__SR.n++; try { const c = window.__CPM_CLOCK ? window.__CPM_CLOCK() : -1; const ph = window.__CPM_PHASE ? window.__CPM_PHASE() : '-'; const k = c + '|' + ph; window.__SR.perMin[k] = (window.__SR.perMin[k] | 0) + 1; } catch (e) {} return rs ? mb() : orig(); };
    /* traccia: ogni cambio di (fase, minuto, scena, punteggio) */
    window.__TR = []; let last = '';
    const t0 = performance.now();
    setInterval(() => { try {
      if (!window.__CPM_PHASE) return;
      const ph = window.__CPM_PHASE(), c = window.__CPM_CLOCK ? window.__CPM_CLOCK() : null, sc = window.__CPM_SCORE ? window.__CPM_SCORE() : null;
      const cs = window.__CPM_CURSIT ? window.__CPM_CURSIT() : null; const nh = window.__CPM_NUMHL ? window.__CPM_NUMHL() : null;
      const k = [ph, c, cs ? cs.i : '-', sc ? sc.home + '-' + sc.away : '-', nh].join('|');
      if (k !== last) { last = k; window.__TR.push({ t: Math.round(performance.now() - t0), ph, c, hl: cs ? cs.i : null, gi: cs ? cs.gi : null, sit: cs ? cs.t.slice(0, 30) : null, sc: sc ? sc.home + '-' + sc.away : null, nh }); }
    } catch (e) {} }, 20);
  }, [save, RANDSEED]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const pm = await page.evaluate(() => { try { return window.__CPM_CAREER.playMatch(); } catch (e) { return 'err ' + e.message; } });
  for (let k = 0; k < 14; k++) { const ph0 = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph0 === 'playing') break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null);
      const x = bs.find(b => /Diplomatico|Siamo pronti|Continua|Chiudi|Prosegui|Avanti|Salta e gioca/i.test(b.textContent || '') && !/Chiudi la stagione|Vivi la Settimana/i.test(b.textContent || '')); if (x) x.click(); });
    await sleep(900); }
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  const srAvvio = await page.evaluate(() => window.__SR.n);
  const hlTimes0 = await page.evaluate(() => window.__CPM_HLTIMES ? window.__CPM_HLTIMES() : null);
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), SEME);
  const tA = Date.now(); let ph; while (Date.now() - tA < 480000) { ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph === 'ended' || ph === 'ceremony') break; await sleep(700); }
  const durata = Date.now() - tA;
  const r = await page.evaluate(() => ({
    tr: window.__TR, sc: window.__CPM_SCORE && window.__CPM_SCORE(), clock: window.__CPM_CLOCK && window.__CPM_CLOCK(),
    hlTimes: window.__CPM_HLTIMES ? window.__CPM_HLTIMES() : null, numhl: window.__CPM_NUMHL ? window.__CPM_NUMHL() : null,
    tl: (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).map(e => ({ ty: e.type || e.ev, ...(e.payload || e) })),
    ev: (window.__CPM_EV ? window.__CPM_EV() : []).map(e => { const o = { ...e }; delete o.ts; return o; }),
    txt: window.__TXT_COPY || window.__CPM_TXT487, sr: window.__SR,
  }));
  await ctx.close();
  return { giro: n, pm, fine: ph, durataMs: durata, srAvvio, hlTimes0, errs, ...r };
}
const out = [];
for (let i = 0; i < GIRI; i++) { const g = await giro(i); out.push(g);
  console.log(`giro ${i}: fine=${g.fine} min=${g.clock} score=${JSON.stringify(g.sc)} numHL=${g.numhl} hlTimes=${JSON.stringify(g.hlTimes)} hlTimes0=${JSON.stringify(g.hlTimes0)} durata=${g.durataMs}ms rnd=${g.sr && g.sr.n} righe=${(g.txt || []).length} ev=${g.ev.length} errs=${g.errs.length}`); }
fs.writeFileSync(`${OUTD}/${TAG}.json`, JSON.stringify(out));
await b.close(); srv.close();
console.log('FINE ' + TAG);
