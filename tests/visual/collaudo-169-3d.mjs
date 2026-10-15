#!/usr/bin/env node
/* COLLAUDO 3D 7.999.169 — SOLO MISURA (non modifica il gioco). Partite vere complete dal salvataggio S12, GLB acceso, nome diverso
   per ogni partita (il seed nasce da avversario+stagione+settimana+NOME). Raccoglie per partita: fasi, punteggio, minuto, pallone
   (__CPM_OWN), salti del pallone (__CPM_BJ478), tuffi del portiere (__CPM_DIVE465), ripartenze (__CPM_KO207), scritte tecniche nel
   DOM, foto negli highlight dell'eroe e dopo ogni gol. Uscita: JSON per partita in out/collaudo-169/.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers CPM_IDX=0 node collaudo-169-3d.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const IDX = +(process.env.CPM_IDX || 0);
const TETTO = +(process.env.CPM_TETTO || 780000);
const FOTO = path.join(ROOT, 'docs', 'collaudi', 'foto-169-3d'); fs.mkdirSync(FOTO, { recursive: true });
const OUT = path.join(ROOT, 'tests', 'visual', 'out', 'collaudo-169'); fs.mkdirSync(OUT, { recursive: true });
const NOMI = ['Aldo Brenta', 'Cesare Dolfi', 'Ettore Fanti', 'Gino Lardi', 'Ivo Mansi', 'Nando Orsi', 'Piero Quaglia', 'Rocco Sala', 'Tullio Vanni', 'Ugo Zanetti', 'Dario Bellini', 'Elio Costa'];
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = NOMI[IDX];
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.addInitScript(s => { window.__NZ_ON = true; window.__CPM_GLB = true; window.__CPM_WALKTEST74 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {}
  /* trappola «palla di nessuno»: appena, in un'apertura di scena, il pallone sta a >15u da ogni calciatore, congela la scena (dt=0) e annota */
  if (window.__NZ_ON) setInterval(() => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); if ((ph === 'hl_intro' || ph === 'hl_choose') && !window.__CPM_FROZEN && !window.__nzHit && (window.__nzN || 0) < 3) { const o = window.__CPM_OWN && window.__CPM_OWN(); if (o && o.d > 15) { window.__CPM_FROZEN = true; window.__nzHit = { ck: window.__CPM_CLOCK && window.__CPM_CLOCK(), d: o.d, x: o.x, y: o.y, i: o.i, ph }; window.__nzN = (window.__nzN || 0) + 1; } } } catch (e) {} }, 30); }, sv);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(2000);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
console.log('p'+IDX+' partita avviata');
const clk = (t) => page.evaluate((t) => { const e = [...document.querySelectorAll('button')].find(x => x.innerText.trim() === t); if (e) { e.click(); return true; } return false; }, t);
await clk('Vedi le formazioni'); await sleep(2500); await clk('Ingresso in campo');
const R = { idx: IDX, nome: NOMI[IDX], fasi: [], foto: [], tech: [], palla: [], gol: [], hl: [], walk: [], sc: [] };
const t0 = Date.now(); let ph = null, ult = '', autoOn = false, sc0 = { home: 0, away: 0 }, nShot = 0, ultFoto = 0, wShots = 0;
const shot = async (tag) => { const f = `p${IDX}-${tag}.png`; try { await page.screenshot({ path: path.join(FOTO, f) }); R.foto.push(f); } catch (e) {} return f; };
while (Date.now() - t0 < TETTO) {
  const d = await page.evaluate(() => {
    const g = (fn) => { try { return window[fn] ? window[fn]() : null; } catch (e) { return null; } };
    const txt = document.body.innerText || '';
    const tech = (txt.match(/\b\d{1,3}\s*fps\b|__CPM\w*|\bundefined\b|\bNaN\b|\[object [A-Za-z]+\]|\bdebug\b/gi) || []).slice(0, 5);
    const chip = !!document.querySelector('[data-cpm="fps907"]'); const mister = /IL MISTER/.test(txt);
    const own = g('__CPM_OWN'); let st = null; try { const s = window.__CPM_STATE && window.__CPM_STATE(); st = s ? { ball: s.ball, clock: s.clock } : null; } catch (e) {}
    return { mister, ph: g('__CPM_PHASE'), ck: g('__CPM_CLOCK'), sc: g('__CPM_SCORE'), own, tech, chip, glb: window.__CPM_GLB_READY, num: g('__CPM_NUMHL'),
             sit: (function () { try { const s = window.__CPM_SITCTX && window.__CPM_SITCTX(); return s ? JSON.stringify(s).slice(0, 160) : null; } catch (e) { return null; } })() };
  }).catch(() => null);
  if (!d) { await sleep(500); continue; }
  const t = Date.now() - t0;
  if (d.ph !== ph) { R.fasi.push({ t, ph: d.ph, ck: d.ck }); console.log(`p${IDX} t=${(t/1000)|0}s fase ${d.ph} min ${d.ck} glb ${d.glb}`); ph = d.ph;
    if (ph === 'playing' && !autoOn) { autoOn = true; await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), 4100 + IDX * 37); }
    if (ph === 'walkout') { wShots = 0; }
    if (ph === 'hl_intro') await page.evaluate(() => { window.__CPM_FRAME480 = null; window.__CPM_BJ_N0 = (window.__CPM_BJ478 || []).length; });
    if (ph === 'hl_result' || ph === 'hl_choose') { const fr = await page.evaluate(() => { const f = window.__CPM_FRAME480; return f ? JSON.parse(JSON.stringify(f)) : null; }); R.hl.push({ t, ph, ck: d.ck, sc: d.sc, fr, sit: d.sit }); if (ph === 'hl_result' && /Tiro|Test|Vol|Rigore|Punizione|Rovescia|Chiusura|Cross/i.test(d.sit || '') && (R.raff = R.raff || 0) < 8) { R.raff++; for (let q = 0; q < 4; q++) { await shot(`raff${R.raff}-m${d.ck}-${q}`); } }
    if (ph === 'hl_result' && nShot < 14) { nShot++; await sleep(500); await shot(`hl${nShot}-m${d.ck}-a`); await sleep(700); await shot(`hl${nShot}-m${d.ck}-b`); } }
  }
  if (ph === 'walkout' && wShots < 9 && t - ultFoto > 4000) { wShots++; ultFoto = t; await shot(`ingresso${wShots}`); }
  if (d.sc && (d.sc.home !== sc0.home || d.sc.away !== sc0.away)) {
    const g = { t, ck: d.ck, da: sc0, a: d.sc, ph: d.ph }; R.gol.push(g); sc0 = d.sc;
    await sleep(900); g.fotoA = await shot(`gol${R.gol.length}-a`); await sleep(5000); g.fotoB = await shot(`gol${R.gol.length}-ripartenza`);
    g.palla5s = await page.evaluate(() => { try { return window.__CPM_OWN(); } catch (e) { return null; } }); g.ph5s = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
  }
  if (d.sc) { const l = R.sc[R.sc.length - 1]; if (!l || l.h !== d.sc.home || l.a !== d.sc.away || (d.ck | 0) !== l.ck) R.sc.push({ t, ck: d.ck, h: d.sc.home, a: d.sc.away, ph: d.ph }); }
  if (d.own && d.own.d > 12 && (d.ph === 'hl_intro' || d.ph === 'hl_choose') && (R.nessuno = R.nessuno || []).length < 6 && t - (R._tn || 0) > 2500) { R._tn = t; R.nessuno.push({ t, ck: d.ck, d: d.own.d, x: d.own.x, y: d.own.y, ph: d.ph }); await shot(`nessuno${R.nessuno.length}-m${d.ck}-d${Math.round(d.own.d)}`); }
  { const nb = await page.evaluate(() => (window.__CPM_BJ478 || []).length); if (nb > (R._nb || 0)) { const nuovi = await page.evaluate((a) => (window.__CPM_BJ478 || []).slice(a), R._nb || 0); R._nb = nb; const sc = nuovi.find(b => !b.mask && b.src !== 'arco' && b.d >= 8); if (sc && (R.salti = R.salti || []).length < 5) { R.salti.push({ t, ck: d.ck, ...sc }); await shot(`salto${R.salti.length}-${sc.src}-d${Math.round(sc.d)}`); } } }
  if (d.mister) (R.mister = R.mister || []).push({ t, ph: d.ph, ck: d.ck });
  { const nz = await page.evaluate(() => window.__nzHit || null); if (nz) { (R.congelati = R.congelati || []).push({ t, ...nz }); await sleep(400); await shot(`nessuno-congelato${R.congelati.length}-m${nz.ck}-d${Math.round(nz.d)}`); await page.evaluate(() => { window.__nzHit = null; window.__CPM_FROZEN = false; }); } }
  if (d.own) R.palla.push({ t, x: d.own.x, y: d.own.y, i: d.own.i, d: d.own.d, ph: d.ph });
  if (d.tech.length || d.chip) R.tech.push({ t, ph: d.ph, tech: d.tech, chip: d.chip });
  if (d.ph === 'ended' || d.ph === 'ceremony') { await sleep(1200); await shot('fine'); break; }
  await sleep(350);
}
R.durataMs = Date.now() - t0; R.finita = ph === 'ended' || ph === 'ceremony';
R.fine = await page.evaluate(() => { const g = (f) => { try { return window[f] ? window[f]() : null; } catch (e) { return null; } };
  return { score: g('__CPM_SCORE'), clock: g('__CPM_CLOCK'), bj: (window.__CPM_BJ478 || []).slice(0, 60), dive: (window.__CPM_DIVE465 || []).slice(0, 40), ko: (window.__CPM_KO207 || []).slice(),
    ev: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal' || e.ev === 'fine' || e.ev === 'scena' || e.ev === 'esito').slice(0, 200), glbFail: window.__CPM_GLB_FAIL || null, glbReady: window.__CPM_GLB_READY }; });
R.errori = errs.slice(0, 6);
fs.writeFileSync(path.join(OUT, `p${IDX}.json`), JSON.stringify(R));
console.log(`p${IDX} ${R.nome}: finita=${R.finita} durata=${(R.durataMs / 1000).toFixed(0)}s gol=${R.gol.length} hl=${R.hl.length} foto=${R.foto.length} tech=${R.tech.length} errori=${R.errori.length} palla=${R.palla.length}`);
await b.close(); srv.close(); process.exit(0);
