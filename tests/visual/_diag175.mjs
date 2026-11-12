#!/usr/bin/env node
/* [giro 175 · sonda di SOLA MISURA] La stessa partita intera giocata GIRI volte: dove si separano i giri?
   Registra, per giro: (1) ogni chiamata al motore del possesso (metodo, argomenti, impronta dello stato dopo) avvolgendo
   creaMotorePossesso; (2) i sorteggi NON seedati (Math.random) e quelli del flusso di prova (_cpmRnd) per minuto|fase|chiamante;
   (3) il libro mastro. Poi confronta il giro 0 con gli altri e stampa la PRIMA differenza di ciascun canale.
   Variabili: NOME · GIRI=3 · PAR=1 (giri in parallelo) · VEL=1 · GLB=0 · STOPMIN=0 (0 = fino al fischio) · SEME=7300 · TICK=300
              FLAGS=a,b (window[a]=true) · OUT=cartella dei dump · PILOTA=orologio|battito */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { save166, apriPrompt166, seq166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const E = process.env, NOME = E.NOME || 'Tobia Ferrante', GIRI = +(E.GIRI || 3), PAR = +(E.PAR || 1), VEL = E.VEL || '1', GLB = E.GLB === '1';
const STOPMIN = +(E.STOPMIN || 0), SEME = +(E.SEME || 7300), TICK = +(E.TICK || 300), FLAGS = (E.FLAGS || '').split(',').filter(Boolean);
const OUT = E.OUT || '/tmp/claude-0/-home-user-Carrier-manager-/37381430-0a16-5958-87d3-ef836c9aa21d/scratchpad/d175'; fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

async function giro(n) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
  /* il flusso di prova _cpmRnd e' una const dentro lo script: lo si avvolge riscrivendo la riga al volo */
  await page.route(/CARRIER-MANAGER-AV\.html/, async route => { let t = fs.readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');
    const a = 'const _cpmRnd=()=>_cpmTestRand?_cpmTestRand():Math.random();'; if (t.split(a).length !== 2) throw new Error('ancora _cpmRnd');
    t = t.replace(a, 'const _cpmRnd=()=>{if(_cpmTestRand){try{window.__D175&&window.__D175.rec("T");}catch(_e){}return _cpmTestRand();}return Math.random();};');
    route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: t }); });
  await page.addInitScript(({ s, vel, glb, flags, reseed }) => {
    window.__CPM_GLB = glb; for (const f of flags) window[f] = true; if (reseed != null) window.__CPM_RESEED_PENDING = reseed;
    if (!sessionStorage.getItem('g175')) { sessionStorage.setItem('g175', '1'); localStorage.setItem('cpm-v3', JSON.stringify(s)); localStorage.setItem('cpm-match-speed', vel); }
    const D = window.__D175 = { on: false, cnt: {}, seqT: [], mot: [], cfg: null, nM: 0, nT: 0 };
    const fase = () => { try { return (window.__CPM_CLOCK ? window.__CPM_CLOCK() : -1) + '|' + (window.__CPM_PHASE ? window.__CPM_PHASE() : '-'); } catch (e) { return '?'; } };
    const chi = () => { const st = String(new Error().stack || '').split('\n').slice(3, 12).filter(x => !/_cpmRnd|Math\.random|at rng |at pick /.test(x)).slice(0, 5).map(x => x.trim().replace(/^at /, '').replace(/https?:\/\/[^)]*\//, '').replace(/\(<anonymous>(:\d+:\d+)\)/, '$1')).join(' < '); return st; };
    D.rec = (k) => { if (!D.on) return; const f = fase(), c = chi(); if (/three\.min\.js/.test(c.split(' < ')[0])) return; const key = k + '|' + c; (D.cnt[key] = D.cnt[key] || {})[f] = ((D.cnt[key] || {})[f] | 0) + 1; if (k === 'T') { D.nT++; D.seqT.push(f + '|' + c.split(' < ')[0]); } else D.nM++; };
    const orig = Math.random; Math.random = function () { D.rec('M'); return orig(); };
    const fnv = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0; return h >>> 0; };
    const js = (x) => { try { return JSON.stringify(x, (k, v) => typeof v === 'function' ? 'ƒ' : v); } catch (e) { return 'err'; } };
    /* avvolge il motore: ogni chiamata lascia [metodo, argomenti, minuto|fase, impronta dello stato dopo] */
    let _crea = null; const avvolgi = (f) => function (cfg) { const M = f.apply(this, arguments);
      try { D.cfg = js(cfg); D.cfgH = fnv(D.cfg); D.mot.push(['crea', String(D.cfgH), fase(), 0]);
        const impr = () => { try { const s = M.stato(); return fnv(js([s.palla, s.poss, s.gioc, s.eroe, s.fermo, s.rete, s.kickoff, s.scena, s.fase, s.tick])); } catch (e) { return -1; } };
        const wrap = (o, pre) => { for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'function' && k !== 'stato' && k !== 'tabellino') { o[k] = function () { const r = v.apply(this, arguments); try { D.mot.push([pre + k, js([].slice.call(arguments)).slice(0, 300), fase(), impr()]); } catch (e) {} return r; }; } else if (v && typeof v === 'object' && !Array.isArray(v) && pre === '' && Object.keys(v).some(z => typeof v[z] === 'function')) wrap(v, k + '.'); } };
        wrap(M, ''); } catch (e) { D.err = String(e); } return M; };
    window.__D175_AVV = () => { if (typeof window.creaMotorePossesso === 'function' && !window.creaMotorePossesso.__a) { const w = avvolgi(window.creaMotorePossesso); w.__a = 1; window.creaMotorePossesso = w; return true; } return false; };
    window.__CPM_PASSI959 = {}; window.__CPM_RNDM959 = {}; window.__CPM_POS959 = {};
  }, { s: save166(NOME), vel: (E.VELS ? E.VELS.split(',')[n % E.VELS.split(',').length] : VEL), glb: GLB, flags: FLAGS, reseed: E.RESEED === '1' ? 1000 + n * 77 : null });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  const avv = await page.evaluate(() => window.__D175_AVV()); if (!avv) console.log('  ⚠ motore non avvolto');
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(600);
  for (let i = 0; i < 12; i++) { const k = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length); if (!k) break; await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300); }
  let W = null;
  for (let w = 2; w <= 20 && !W; w++) { await page.evaluate((w) => window.__CPM_CAREER.patch({ week: w, weekLived: false }), w); await sleep(220); const t = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd()); if (t && !t.type) W = w; }
  await apriPrompt166(page);
  await page.evaluate(() => { window.__D175.on = true; if (window.__CPM_EV_RESET) window.__CPM_EV_RESET(); const B = [...document.querySelectorAll('[data-cpm="partita23"] button')]; const x = B.find(x => /^Gioca la partita/.test((x.textContent || '').trim())); if (x) x.click(); });
  let montata = false;
  for (let i = 0; i < 60 && !montata; i++) {
    montata = await page.evaluate(() => typeof window.__CPM_PHASE === 'function' && !!window.__CPM_PHASE() && typeof window.__CPM_AUTOPLAY === 'function' && /matchday|formations|walkout|playing/.test(String(window.__CPM_PHASE()))).catch(() => false); if (montata) break;
    await page.evaluate(() => { try { const C = window.__CPM_CAREER; if (C && C.dismiss) C.dismiss(); } catch (e) {} const B = [...document.querySelectorAll('button')].filter(x => /^(Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok)/i.test((x.textContent || '').trim())); if (B.length) B[B.length - 1].click(); }).catch(() => {});
    await sleep(500); }
  /* il libro mastro si accumula in pagina (l'anello tiene 400 voci) */
  await page.evaluate(({ s, tick, pil }) => { window.__LM175 = []; setInterval(() => { try { const e = window.__CPM_EV(); if (e.length) { window.__LM175.push(...e); window.__CPM_EV_RESET(); } } catch (_e) {} }, 15);
    window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: tick, pilota: pil }); }, { s: SEME, tick: TICK, pil: E.PILOTA || '' });
  const t0 = Date.now(); let fin = false, c = 0;
  while (Date.now() - t0 < 600000) { const s = await page.evaluate(() => ({ f: window.__CPM_PHASE ? window.__CPM_PHASE() : null, c: window.__CPM_CLOCK ? window.__CPM_CLOCK() : 0 })).catch(() => null);
    if (s) { c = s.c; if (s.f === 'ended' || s.f === 'ceremony') { fin = true; break; } if (STOPMIN && s.c >= STOPMIN) break; } await sleep(250); }
  const r = await page.evaluate(() => { const D = window.__D175; D.on = false; const e = window.__CPM_EV(); window.__LM175.push(...e); const x = window.__CPM_SCORE && window.__CPM_SCORE();
    return { cnt: D.cnt, seqT: D.seqT, mot: D.mot, cfg: D.cfg, cfgH: D.cfgH, nM: D.nM, nT: D.nT, err: D.err || null, ev: window.__LM175, score: x ? x.home + '-' + x.away : null, passi: window.__CPM_PASSI959, rndm: window.__CPM_RNDM959, pos: window.__CPM_POS959 }; });
  r.n = n; r.fin = fin; r.min = c; r.errs = errs; r.ms = Date.now() - t0; r.seq = seq166(r.ev);
  if (n === 0 && E.SALVA_JS) { const js = await page.evaluate(() => [...document.scripts].map(s => s.text || '').sort((a, b) => b.length - a.length)[0]); fs.writeFileSync(OUT + '/transpilato.js', js); }
  await ctx.close(); return r;
}
const R = []; for (let i = 0; i < GIRI; i += PAR) { const lot = await Promise.all(Array.from({ length: Math.min(PAR, GIRI - i) }, (_, k) => giro(i + k))); R.push(...lot); }
await b.close(); srv.close();
const tag = (E.TAG || NOME.replace(/\W+/g, '_')) + '-v' + VEL + (GLB ? '-glb' : '');
fs.writeFileSync(`${OUT}/${tag}.json`, JSON.stringify(R));
const SOLA = new Set((E.SOLA || 'pagelle,tabellino,stato,voti,pagella').split(',')); for (const r of R) { r.motTutte = r.mot.length; r.mot = r.mot.filter(x => !SOLA.has(x[0])); r.mot = r.mot.filter((x, i, A) => x[0] === 'tick' || i === 0 || !(A[i - 1][0] === x[0] && A[i - 1][1] === x[1] && A[i - 1][3] === x[3])); /* ripetizioni identiche senza effetto (scenaMuovi a ogni disegno) */ }
{ const nomi = {}; for (const x of R[0].mot) nomi[x[0]] = (nomi[x[0]] | 0) + 1; console.log('  metodi del motore chiamati (giro 0, senza le letture): ' + JSON.stringify(nomi)); }
const primo = (a, c) => { const n = STOPMIN ? Math.min(a.length, c.length) : Math.max(a.length, c.length); for (let i = 0; i < n; i++) if (JSON.stringify(a[i]) !== JSON.stringify(c[i])) return i; return -1; };
console.log(`«${NOME}» · ${GIRI} giri · velocita' ${VEL} · corpi ${GLB ? 'accesi' : 'spenti'} · pilota ${E.PILOTA || 'orologio'} ${TICK} ms · bandiere ${FLAGS.join(',') || '—'}`);
for (const r of R) console.log(`  giro ${r.n}: ${r.score} · minuto ${r.min}${r.fin ? ' (fischio)' : ''} · ${(r.ms / 1000).toFixed(0)} s · libro mastro ${r.seq.length} voci · chiamate al motore ${r.mot.length} · cfg ${r.cfgH} · Math.random ${r.nM} · flusso di prova ${r.nT}${r.errs.length ? ' · ERRORI ' + JSON.stringify(r.errs.slice(0, 2)) : ''}${r.err ? ' · ' + r.err : ''}`);
const A = R[0];
for (const r of R.slice(1)) {
  const dm = primo(A.mot.map(x => [x[0], x[1], x[3]]), r.mot.map(x => [x[0], x[1], x[3]])), de = primo(A.seq, r.seq), dt = primo(A.seqT, r.seqT);
  console.log(`  0 vs ${r.n}: motore ${dm < 0 ? 'IDENTICO' : 'prima differenza alla chiamata ' + dm} · libro mastro ${de < 0 ? 'IDENTICO' : 'prima differenza alla voce ' + de} · flusso di prova ${dt < 0 ? 'IDENTICO' : 'prima differenza al sorteggio ' + dt}`);
  if (A.cfgH !== r.cfgH) { const a = A.cfg || '', c = r.cfg || ''; let i = 0; while (i < a.length && a[i] === c[i]) i++; console.log(`     cfg del motore diversa dal carattere ${i}: …${a.slice(Math.max(0, i - 120), i + 80)}…  ≠  …${c.slice(Math.max(0, i - 40), i + 80)}…`); }
  if (dm >= 0) for (let i = Math.max(0, dm - 3); i < dm + 3; i++) console.log(`     [${i}] ${JSON.stringify(A.mot[i] || null).slice(0, 230)}\n     ${' '.repeat(String(i).length + 2)} ${JSON.stringify(r.mot[i] || null).slice(0, 230)}`);
  if (de >= 0) for (let i = Math.max(0, de - 2); i < de + 2; i++) console.log(`     ev[${i}] ${JSON.stringify(A.seq[i] || null).slice(0, 200)}\n     ${' '.repeat(String(i).length + 4)} ${JSON.stringify(r.seq[i] || null).slice(0, 200)}`);
  if (dt >= 0) for (let i = Math.max(0, dt - 2); i < dt + 3; i++) console.log(`     T[${i}] ${A.seqT[i]}  ||  ${r.seqT[i]}`);
}
/* chi sorteggia senza seme durante la partita (somma dei giri) */
const tot = {}; for (const r of R) for (const k of Object.keys(r.cnt)) { const s = Object.values(r.cnt[k]).reduce((a, c) => a + c, 0); (tot[k] = tot[k] || []).push(s); }
const righe = Object.keys(tot).map(k => ({ k, v: tot[k], s: tot[k].reduce((a, c) => a + c, 0) })).sort((a, c) => c.s - a.s);
console.log(`  CHIAMANTI dei sorteggi (per giro) — ${righe.length} punti:`); for (const x of righe.slice(0, +(E.TOP || 40))) console.log(`     ${JSON.stringify(x.v)}  ${x.k.slice(0, 260)}`);
