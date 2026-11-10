#!/usr/bin/env node
/* [giro 127 PO-329] GUARDIANO DELL'INGRESSO DALLA PANCHINA — collaudo PO 08/11: «Quando l'eroe entra dalla panchina si vedono erroneamente
   le tribune da dietro (se piu' semplice, cambiare inquadratura di fronte e non di spalle)».
   Flusso vero: carriera da salvataggio (fixtures/save-190-s12-ovr93.json), partita giocata con GLB ACCESO, panchina d'attesa forzata
   (__CPM_FORCE_BENCH) e minuto d'ingresso di collaudo (__CPM_BENCH_MIN): l'eroe subentra col percorso del gioco (benchPhase «entering» →
   subEntry → regia d'ingresso di src/12). Ogni fotogramma della scena legge il testimone di sola prova __CPM_G127 (src/12).
   Misure (soglie fisse, mai abbassate):
     T1  nessun fotogramma con la telecamera DENTRO o DIETRO il volume di una tribuna (coordinate locali del gruppo: entro la larghezza,
         oltre il fronte verso il retro, sotto la cima)
     T2  nessun fotogramma con gradoni visti dalla faccia POSTERIORE (camera dal lato opposto alla normale verso campo e cielo, gradone
         nel tronco di vista)
     T3  eroe inquadrato (piedi e testa dentro il quadro, davanti alla camera) in almeno il 90% dei fotogrammi della scena
   Casi: stadio dell'avversario (trasferta) e stadio di casa, a 360x800 · 412x915 · 1440x900 (CPM_P127_FORMATI per restringere).
   Rosso: __CPM_NO_G127 (regia vecchia, camera alle spalle dell'eroe verso la tribuna): T1 o T2 devono cadere, altrimenti il guardiano
   e' cieco. Braccio e motivo stampati per ultimi. CPM_P127_FOTO=1 salva i fotogrammi chiave in docs/sviluppo/foto-giro127/.
   Uso: node panchina-127.mjs  ·  CPM_P127_SOLO=verde|rosso */
import fs from 'node:fs';
import path from 'node:path';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync('/opt/pw-browsers')) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } = await import('./lib/harness.mjs');

const FORMATI = { m360: { k: '360x800', w: 360, h: 800, touch: true }, tel: { k: '412x915', w: 412, h: 915, touch: true }, pc: { k: '1440x900', w: 1440, h: 900, touch: false } };
const formati = (process.env.CPM_P127_FORMATI || 'm360,tel,pc').split(',').filter(k => FORMATI[k]).map(k => FORMATI[k]);
const CASI = [{ k: 'trasferta', home: false }, { k: 'casa', home: true }].filter(c => !process.env.CPM_P127_CASI || process.env.CPM_P127_CASI.split(',').includes(c.k));
const FOTO = !!process.env.CPM_P127_FOTO;
const FOTODIR = path.join(ROOT, 'docs', 'sviluppo', 'foto-giro127'); if (FOTO) fs.mkdirSync(FOTODIR, { recursive: true });
const SAVE0 = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();

async function caso(f, c, rosso) {
  const save = JSON.parse(JSON.stringify(SAVE0)); const nx = (save.player.calendar || []).find(m => !m.played && m.week === save.player.week);
  /* casa: la gara di lega della settimana e' in trasferta e quella di ritorno in casa e' gia' giocata (il gioco non la riserve); si usa la
     gara di coppa europea in casa ancora da giocare, spostata sulla settimana corrente (solo nel salvataggio di prova) */
  if (c.home && nx) { const eu = save.player.calendar.find(m => !m.played && m.isHome && m.type === 'euro'); if (eu) { save.player.calendar = save.player.calendar.filter(m => m !== nx); eu.week = save.player.week; } }
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await browser.newContext(opt); await installCdnRoutes(ctx); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(o => { window.__CPM_PRESENT = 1; window.__CPM_GLB = true; if (o.r) window.__CPM_NO_G127 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {}
    window.__P127 = []; const g = () => { try { if (window.__CPM_G127) { const o2 = window.__CPM_G127(); if (o2 && o2.se >= 0 && window.__P127.length < 3000) { o2.ck = typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null; window.__P127.push(o2); } } } catch (e) {} requestAnimationFrame(g); }; requestAnimationFrame(g); }, { s: save, r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const pm = await page.evaluate(() => { try { return String(window.__CPM_CAREER.playMatch()); } catch (e) { return 'err ' + e.message; } });
  if (process.env.CPM_P127_DBG) console.log('playMatch', pm);
  const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  for (let k = 0; k < 120; k++) { const p = await ph(); if (p === 'playing' || await page.evaluate(() => typeof window.__CPM_FORCE_BENCH === 'function' && typeof window.__CPM_CLOCK === 'function' && window.__CPM_CLOCK() > 0).catch(() => false)) break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Salta/i.test(b.textContent || '')) || bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua|Calcio d'inizio|Inizia/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
    if (process.env.CPM_P127_DBG && k % 5 === 0) console.log('fase', k, p, await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => (b.textContent || '').trim().slice(0, 30)).join(' | ')).catch(() => '?'));
    await sleep(700); }
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
  const min0 = await page.evaluate(() => (window.__CPM_CLOCK ? window.__CPM_CLOCK() : 0) | 0);
  await page.evaluate(m => { window.__CPM_BENCH_MIN = m; window.__CPM_FORCE_BENCH(false); }, min0 + 3);
  /* la scena dura SUB_DUR (4,2 s di scena): si aspetta che il testimone la veda cominciare e finire, tetto di parete come rete */
  const fotoK = [0.3, 1.2, 2.4, 3.6]; let fi = 0; const t0 = Date.now(); let visto = false;
  while (Date.now() - t0 < 180000) {
    const st = await page.evaluate(() => { const a = window.__P127 || []; const g = window.__CPM_G127 ? window.__CPM_G127() : null; return { n: a.length, se: g ? g.se : -1 }; });
    if (st.se >= 0) visto = true;
    if (FOTO && st.se >= 0 && fi < fotoK.length && st.se >= fotoK[fi]) { await page.screenshot({ path: path.join(FOTODIR, `${rosso ? 'prima' : 'dopo'}-${c.k}-${f.k}-${fi + 1}.png`) }); fi++; }
    if (visto && st.se < 0 && st.n > 0) break;
    await sleep(visto ? 60 : 400);
  }
  const fr = await page.evaluate(() => window.__P127 || []);
  if (process.env.CPM_P127_DUMP) fs.writeFileSync(process.env.CPM_P127_DUMP + `-${rosso ? 'r' : 'v'}-${c.k}-${f.k}.json`, JSON.stringify(fr));
  await ctx.close();
  const n = fr.length, dentro = fr.filter(o => o.dentro && o.dentro.length).length, retro = fr.filter(o => o.retro > 0).length;
  const inq = fr.filter(o => o.hf && o.hh && [o.hf, o.hh].every(v => Math.abs(v[0]) <= 1 && Math.abs(v[1]) <= 1 && v[2] < 1)).length;
  const c0 = fr[0] ? fr[0].c : null, cM = fr[Math.floor(n / 2)] ? fr[Math.floor(n / 2)].c : null, d0 = fr[Math.floor(n / 2)] ? fr[Math.floor(n / 2)].d : null;
  const peggio = fr.find(o => o.dentro && o.dentro.length); 
  return { f: f.k, c: c.k, n, dentro, retro, inq: n ? +(inq / n).toFixed(3) : 0, c0, cM, d0, trib: peggio ? peggio.trib[peggio.dentro[0]] : null, errs: errs.length, min0 };
}

const bracci = process.env.CPM_P127_SOLO === 'rosso' ? [true] : process.env.CPM_P127_SOLO === 'verde' ? [false] : [false, true];
const ris = { verde: [], rosso: [] };
for (const rosso of bracci) for (const f of formati) for (const c of CASI) {
  const r = await caso(f, c, rosso); (rosso ? ris.rosso : ris.verde).push(r);
  console.log(`${rosso ? 'ROSSO' : 'VERDE'} ${r.f} ${r.c}: ${r.n} fotogrammi · camera dentro/dietro tribuna ${r.dentro} · gradoni dal retro ${r.retro} · eroe inquadrato ${r.inq} · camera inizio ${JSON.stringify(r.c0)} meta' ${JSON.stringify(r.cM)} dir ${JSON.stringify(r.d0)}${r.trib ? ' · locale tribuna ' + JSON.stringify(r.trib) : ''} · errori ${r.errs}`);
}
fs.mkdirSync(path.join(ROOT, 'tests', 'visual', 'out'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'tests', 'visual', 'out', 'panchina-127.json'), JSON.stringify(ris, null, 1));
await browser.close(); srv.close();
let ok = true; const motivi = [];
for (const r of ris.verde) {
  if (r.n < 20) { ok = false; motivi.push(`verde ${r.f} ${r.c}: scena non giudicata (${r.n} fotogrammi)`); continue; }
  if (r.dentro > 0) { ok = false; motivi.push(`verde ${r.f} ${r.c}: T1 camera dentro/dietro tribuna in ${r.dentro} fotogrammi`); }
  if (r.retro > 0) { ok = false; motivi.push(`verde ${r.f} ${r.c}: T2 gradoni visti dal retro in ${r.retro} fotogrammi`); }
  if (r.inq < 0.9) { ok = false; motivi.push(`verde ${r.f} ${r.c}: T3 eroe inquadrato ${r.inq} < 0,90`); }
}
if (ris.rosso.length) {
  const giud = ris.rosso.filter(r => r.n >= 20);
  if (!giud.length) { ok = false; motivi.push('rosso: nessuna scena giudicata'); }
  else if (!giud.some(r => r.dentro > 0 || r.retro > 0)) { ok = false; motivi.push('rosso: il difetto non si vede — guardiano cieco'); }
}
console.log(`braccio: ${bracci.map(b => b ? 'rosso' : 'verde').join('+')} · formati ${formati.map(f => f.k).join(',')}`);
console.log(ok ? '✅ panchina-127 verde (e il rosso si vede)' : '❌ panchina-127 ROSSO — ' + motivi.join(' | '));
process.exit(ok ? 0 : 1);
