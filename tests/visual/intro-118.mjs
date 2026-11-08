#!/usr/bin/env node
/* [giro 118 · PO-325 «il portiere sembra che voli» + PO-322 link privacy dentro l'app] guardiano NON-gate, tre formati (360x800 · 412x915 tocco · 1440x900 mouse).
   A) INTRO, GLB ACCESO (testimone __CPM_INTRO118, solo ?cpmtest=1, scritto dal render-loop dell'intro):
      CAUSA MISURATA (intro-118-misura.mjs): la clip gk-ready teneva i piedi del portiere a +0,086..0,096 dal prato (osso ball_l/ball_r piu' basso)
      per tutta l'attesa — l'attaccante in appoggio sta a -0,047..+0,047 — e dopo il tuffo y restava all'ultimo valore dell'arco (0,22 a 8 fps).
      SOGLIA (fissata DOPO la misura): |quota dell'osso ball piu' basso del portiere| <= 0,05 nell'attesa (el<8,7): sta a meta' fra il contatto
      sano (±0,047 dell'attaccante, 0,000 del portiere corretto) e il difetto (0,086+). Dopo il tuffo (el>=9,6) y = 0. Sulla linea di porta per
      tutta l'intro: z fra -12,1 e -11,2 (palo a -12) e |x| < 3,66.
   B) PRIVACY: in Opzioni la voce «Informativa sulla privacy», <a> con href esatto, target _blank, rel noopener, tocco >= 44 px, e il clic apre
      l'URL con window.open (stesso meccanismo della donazione). Non giudicato = rosso.
   ROSSO (CPM_PROVA_ROSSO=1 → __CPM_NO_G118 + __CPM_NO_G118P): deve fallire sia A sia B. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './c178-graf-lib.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const URL_ATTESA = 'https://antoniovairo-rgb.github.io/Carrier-manager-/privacy.html';
const F = [{ n: 's360', w: 360, h: 800, t: 1 }, { n: 's412', w: 412, h: 915, t: 1 }, { n: 'pc', w: 1440, h: 900, t: 0 }];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ko = []; const riga = [];
for (const f of F) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.t) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript(r => { try { localStorage.setItem('cpm-intro-seen', '1'); localStorage.setItem('cpm-dark', '0'); } catch (e) {} window.__CPM_GLB = true; if (r) { window.__CPM_NO_G118 = true; window.__CPM_NO_G118P = true; } }, ROSSO);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(2500);
  /* B) privacy */
  await page.evaluate(() => { window.__APERTE118 = []; window.open = (...a) => { window.__APERTE118.push(a); return null; }; });
  const bt = await page.$('button[title="Impostazioni"]');
  if (!bt) ko.push(`${f.n}: tasto Opzioni non trovato (non giudicato)`); else {
    await bt.click(); await sleep(600);
    const v = await page.evaluate(() => { const a = document.querySelector('a[data-cpm="privacy118"]'); if (!a) return null; const r = a.getBoundingClientRect(); return { href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel') || '', w: Math.round(r.width), h: Math.round(r.height), testo: a.innerText }; });
    if (!v) ko.push(`${f.n}: voce «Informativa sulla privacy» assente in Opzioni`); else {
      if (v.href !== URL_ATTESA) ko.push(`${f.n}: href ${v.href}`); if (v.target !== '_blank' || !/noopener/.test(v.rel)) ko.push(`${f.n}: target/rel ${v.target}/${v.rel}`);
      if (v.h < 44 || v.w < 44) ko.push(`${f.n}: tocco ${v.w}x${v.h} < 44`);
      await page.click('a[data-cpm="privacy118"]'); await sleep(300);
      const ap = await page.evaluate(() => window.__APERTE118);
      if (!ap.length || ap[0][0] !== URL_ATTESA) ko.push(`${f.n}: il clic non apre l'URL fuori dall'app (${JSON.stringify(ap)})`);
      riga.push(`${f.n} privacy ${v.w}x${v.h}`);
    }
    await page.evaluate(() => { const x = document.querySelector('button[aria-label="Chiudi"]'); if (x) x.click(); }); await sleep(300);
  }
  /* A) intro */
  await page.evaluate(() => { window.__CPM_GLB = true; window.__CPM_INTRO115 = {}; window.__CPM_INTRO118 = {}; window.dispatchEvent(new CustomEvent('cpm-replay-intro')); });
  const t0 = Date.now(); let ch = false; while (Date.now() - t0 < 100000 && !ch) { await sleep(500); ch = await page.evaluate(() => !!(window.__CPM_INTRO115 && window.__CPM_INTRO115.chiusa)); }
  const s = await page.evaluate(() => (window.__CPM_INTRO118 || {}).s || []);
  const pre = s.filter(x => x.el < 8.7), post = s.filter(x => x.el >= 9.6);
  if (pre.length < 20 || post.length < 10) ko.push(`${f.n}: campioni insufficienti (${pre.length}/${post.length}) — non giudicato`); else {
    const pm = Math.max(...pre.map(x => Math.abs(x.gk.ft))), hp = Math.max(...pre.map(x => Math.abs(x.hero.ft)));
    const py = Math.max(...post.map(x => x.gk.y)), zs = s.map(x => x.gk.z), xs = s.map(x => Math.abs(x.gk.x));
    if (pm > 0.05) ko.push(`${f.n}: piedi del portiere a ${pm.toFixed(3)} dal prato nell'attesa (soglia 0,05; attaccante ${hp.toFixed(3)})`);
    if (py > 0.001) ko.push(`${f.n}: dopo il tuffo il portiere resta sollevato di ${py.toFixed(3)}`);
    if (Math.min(...zs) < -12.1 || Math.max(...zs) > -11.2 || Math.max(...xs) >= 3.66) ko.push(`${f.n}: fuori dalla linea di porta (z ${Math.min(...zs)}..${Math.max(...zs)}, |x| max ${Math.max(...xs)})`);
    riga.push(`${f.n} portiere: osso piu' basso max ${pm.toFixed(3)} (attaccante ${hp.toFixed(3)}) · dopo tuffo y ${py.toFixed(3)} · ${s.length} campioni`);
  }
  if (errs.length) ko.push(`${f.n}: errori di pagina ${errs[0]}`);
  await ctx.close();
}
await b.close(); srv.close();
riga.forEach(r => console.log('  ' + r));
const ok = ko.length === 0;
if (ROSSO) { console.log(ko.length ? 'ROSSO ATTESO OK' : 'ROSSO NON RIUSCITO'); console.log('BRACCIO: rosso (__CPM_NO_G118 + __CPM_NO_G118P)'); ko.forEach(k => console.log('MOTIVO: ' + k)); process.exit(ko.length ? 0 : 1); }
console.log(ok ? 'intro-118 VERDE' : 'intro-118 ROSSO'); console.log('BRACCIO: verde'); ko.forEach(k => console.log('MOTIVO: ' + k)); process.exit(ok ? 0 : 1);
