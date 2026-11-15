#!/usr/bin/env node
/* [giro 196 PO-449 «T pose e non CGTrader non deve mai capitare»] SONDA e GUARDIANO sul percorso vero (salvataggio → partita →
   ingresso in campo → partita con highlight) col GLB ACCESO, su TELEFONO EMULATO:
   - schermo 412x915 (o 375x812 con CPM_LARGO=375), tocco, contesto nuovo = cache vuota, service worker bloccato;
   - RETE LENTA: ogni file pesante (assets/*.glb|png|jpg) passa da un TUBO a banda condivisa (CPM_KBS KB/s, default 1000 =
     8 Mbit/s) con latenza CPM_LAT ms: i file in coda si dividono la banda come su una rete vera;
   - CPU RALLENTATA (CDP Emulation.setCPUThrottlingRate, CPM_CPU, default 2) dopo il caricamento della carriera.
   Il testimone __CPM_T196W (src/12) registra a OGNI fotogramma disegnato i corpi visibili e inquadrati: CGTrader, NON CGTrader
   (corpo di riserva), in T-pose (ossa di braccia e cosce ferme sulla rotazione di riposo del file) e figure procedurali.
   Contano i fotogrammi in cui la scena 3D e' davvero a schermo: ingresso (walkout) e highlight (hl_*).
   Scenari (CPM_SCENARI): campionato-notte, coppa-notte, campionato-giorno, coppa-giorno.
   VERDE: 0 fotogrammi con un corpo non CGTrader, in T-pose o procedurale, su ingresso E highlight, con almeno CPM_MINF fotogrammi
   giudicati per scenario — oppure partita passata in 2D dichiarata (attesa oltre il tetto) senza mai mostrare un corpo sbagliato.
   ROSSO (CPM_PROVA_ROSSO=1 → __CPM_NO_G196): i corpi sbagliati si vedono (>= 1 fotogramma). «Non giudicato» = rosso.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node tpose-196.mjs   (CPM_MISURA=1 = solo misura, esce 0) */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO, MISURA = !!process.env.CPM_MISURA;
const KBS = +(process.env.CPM_KBS || 1000), LAT = +(process.env.CPM_LAT || 120), CPU = +(process.env.CPM_CPU || 2);
const LARGO = +(process.env.CPM_LARGO || 412), ALTO = LARGO === 375 ? 812 : 915;
const SCENE = +(process.env.CPM_SCENE || 2), MINF = +(process.env.CPM_MINF || 20), TMAX = +(process.env.CPM_TMAX || 420000);
const SCENARI = (process.env.CPM_SCENARI || 'campionato-notte,coppa-notte,campionato-giorno,coppa-giorno').split(',');
const FOTO = process.env.CPM_FOTO || path.join(ROOT, 'docs', 'sviluppo', 'giro196'); fs.mkdirSync(FOTO, { recursive: true });
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

function salvataggio(coppa) {
  const sv = JSON.parse(JSON.stringify(SAVE)); const pl = sv.player || sv; const w = pl.week | 0;
  if (coppa) { pl.cup = Object.assign({}, pl.cup || {}, { active: true, eliminated: false, champion: false, results: [], round: 0 });
    const opp = (pl.calendar || []).find(m => m.opponentId);
    pl.calendar = [{ matchday: 1300 + w, week: w, opponentName: opp ? opp.opponentName : 'FC Albion', opponentId: opp ? opp.opponentId : undefined, isHome: true, played: false, type: 'cup', cupRound: 0, cupRoundName: 'Ottavi' }].concat(pl.calendar || []); }
  return sv;
}
const VISTA = ph => ph === 'walkout' || /^hl_/.test(ph || '') || ph === 'ceremony' || ph === 'shootout';

async function scenario(nome) {
  const coppa = /coppa/.test(nome), tod = /giorno/.test(nome) ? 'day' : 'night';
  const ctx = await b.newContext({ viewport: { width: LARGO, height: ALTO }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await installCdnRoutes(ctx);
  /* tubo a banda condivisa: ogni file finisce quando il tubo ha smaltito i byte di chi era in coda prima di lui */
  let libero = 0; const file = [];
  await ctx.route(/\/assets\/.*\.(glb|png|jpg|jpeg|webp)(\?|$)/i, async r => {
    const u = new URL(r.request().url()); let byte = 0; try { byte = fs.statSync(path.join(ROOT, decodeURIComponent(u.pathname))).size; } catch (e) {}
    const ora = Date.now(); const fine = Math.max(ora + LAT, libero) + byte / KBS; libero = fine; file.push([u.pathname.split('/').pop(), byte]);
    await sleep(fine - ora); try { await r.fallback(); } catch (e) {} });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_T196ON = 1; window.__CPM_T196W = []; window.__CPM_TOD = o.tod;
    if (o.r) window.__CPM_NO_G196 = 1; if (o.cap) { window.__CPM_CAP196 = o.cap; window.__CPM_RISERVA2D209 = 1; }/* [giro 209] col tetto manuale si prova il ripiego 2D, ora acceso solo dal banco */ localStorage.setItem('cpm-v3', JSON.stringify(o.s)); },
    { s: salvataggio(coppa), r: ROSSO, tod, cap: process.env.CPM_CAP196 ? +process.env.CPM_CAP196 : 0 });
  const out = { nome, frames: { walkout: 0, hl: 0 }, cattivi: { walkout: 0, hl: 0 }, noCg: 0, tpose: 0, proc: 0, maxCg: 0, chi: {}, fasi: {}, partita2D: false, attesa: false, scene: 0 };
  const foto = {};
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    if (CPU > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU }); }
    out.pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const t0 = Date.now(); let ultimaRich = -1;
    while (Date.now() - t0 < TMAX) {
      const s = await page.evaluate(() => { const W = window.__CPM_T196W; const w = Array.isArray(W) ? W.splice(0) : [];
        return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), c: window.__CPM_CLOCK ? window.__CPM_CLOCK() : 0, w,
          att: !!document.querySelector('[data-cpm="attesa196"]'), mot: (() => { try { const r = window.__CPM_PRONTI196 && window.__CPM_PRONTI196(); return r ? (r.pronti ? 'pronti' : r.motivo + (r.chi && r.chi.length ? '[' + r.chi.join(',') + ']' : '')) : null; } catch (e) { return 'err'; } })(), p2d: !!window.__CPM_2D196, bar: (document.querySelector('[data-cpm="attesa196-barra"]') || {}).style ? document.querySelector('[data-cpm="attesa196-barra"]').style.width : null }; }).catch(() => null);
      if (!s) break;
      out.fasi[s.ph] = (out.fasi[s.ph] || 0) + 1; if (s.mot && !(out.motivi = out.motivi || {})[s.mot]) out.motivi[s.mot] = +((Date.now() - t0) / 1000).toFixed(0); if (s.att) out.attesa = true; if (s.p2d) out.partita2D = true;
      if (s.att && !foto.attesa) { foto.attesa = 1; await page.screenshot({ path: path.join(FOTO, `${ROSSO ? 'rosso' : 'dopo'}-${nome}-attesa.png`) }).catch(() => {}); }
      for (const f of s.w) { if (!VISTA(f.ph)) continue; if (f.v) { out.coperti = (out.coperti || 0) + 1; continue; } /* sotto la schermata d'attesa opaca o col campo 2D sopra: il 3D non si vede */ const k = f.ph === 'walkout' ? 'walkout' : 'hl'; out.frames[k]++; out.maxCg = Math.max(out.maxCg, f.cg);
        const bad = f.noCg + f.tpose + f.proc; if (bad) { out.cattivi[k]++; if (f.noCg) out.noCg++; if (f.tpose) out.tpose++; if (f.proc) out.proc++; for (const c of f.chi) out.chi[c] = (out.chi[c] || 0) + 1; } }
      const cattivo = s.w.some(f => VISTA(f.ph) && !f.v && (f.noCg + f.tpose + f.proc));
      const fk = s.ph === 'walkout' ? 'walkout' : (/^hl_/.test(s.ph || '') ? 'hl' : null);
      if (fk && !foto[fk] && (cattivo || out.frames[fk] > 60 || (s.p2d && fk === 'hl'))) { foto[fk] = 1; await page.screenshot({ path: path.join(FOTO, `${ROSSO ? 'rosso' : (process.env.CPM_PRIMA ? 'prima' : 'dopo')}-${nome}-${fk}.png`) }).catch(() => {}); }
      if (s.ph === 'ended' || out.scene >= SCENE) break;
      if (s.ph === 'matchday' || s.ph === 'formations') await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
      if (s.ph === 'playing' && s.c >= 8 && s.c !== ultimaRich) { ultimaRich = s.c; await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); }).catch(() => {}); }
      if (s.ph === 'hl_choose') { await sleep(600); await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {}); out.scene++; }
      if (s.ph === 'hl_move') await page.evaluate(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true })); window.dispatchEvent(new KeyboardEvent('keydown', { key: '0' })); }).catch(() => {});
      await sleep(400);
    }
    out.durS = +((Date.now() - t0) / 1000).toFixed(0);
    out.ev = await page.evaluate(() => ((typeof window.__CPM_EV === 'function' && window.__CPM_EV()) || []).filter(e => e && /196/.test(e.ev || '')).map(e => { const o = { ...e }; delete o.ts; return o; }).slice(0, 6)).catch(() => []);
    out.st = await page.evaluate(() => String(window.__CPM_HYPER_CASUAL_STATUS || '')).catch(() => '?');
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.file = file.length; out.mb = +(file.reduce((a, f) => a + f[1], 0) / 1e6).toFixed(1); out.errori = errs.slice(0, 3);
  await ctx.close(); return out;
}

const R = [];
for (const n of SCENARI) { const r = await scenario(n); R.push(r); console.log(`${ROSSO ? 'ROSSO' : 'VERDE'} ${n}: ` + JSON.stringify(r)); }
await b.close(); srv.close();
if (MISURA) process.exit(0);
const g = [];
for (const r of R) {
  const giud = r.frames.walkout + r.frames.hl, bad = r.cattivi.walkout + r.cattivi.hl;
  if (ROSSO) continue;
  if (r.errore) g.push(`${r.nome}: errore ${r.errore}`);
  if (bad > 0) g.push(`${r.nome}: ${bad} fotogrammi con corpi sbagliati (noCG ${r.noCg}, T-pose ${r.tpose}, procedurali ${r.proc}) ${JSON.stringify(r.chi)}`);
  if (!r.partita2D && (r.frames.walkout < MINF || r.frames.hl < MINF)) g.push(`${r.nome}: non giudicato (fotogrammi ingresso ${r.frames.walkout}, highlight ${r.frames.hl}, minimo ${MINF})`);
  if (!r.partita2D && r.maxCg < 10) g.push(`${r.nome}: non giudicato (al massimo ${r.maxCg} corpi CGTrader inquadrati)`);
}
if (ROSSO) { const visti = R.reduce((a, r) => a + r.cattivi.walkout + r.cattivi.hl, 0); if (visti < 1) g.push('rosso: i corpi sbagliati non si vedono'); }
if (g.length) { console.log('❌ tpose-196' + (ROSSO ? ' (prova del rosso)' : '')); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(ROSSO ? '✅ tpose-196 ROSSO ATTESO: con __CPM_NO_G196 i corpi sbagliati si vedono' : '✅ tpose-196 VERDE: 0 T-pose, 0 corpi non CGTrader, 0 procedurali su ingresso e highlight');
