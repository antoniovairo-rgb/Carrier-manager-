#!/usr/bin/env node
/* [giro 427 · PO-690] GUARDIANO audio-avvio-427 — «all'avvio la prima volta del gioco l'audio nella schermata iniziale non e' gestibile».
   Percorso del giocatore vero (SENZA ?cpmtest=1: sotto il banco l'AudioMgr e' muto per costruzione), corpi 3D accesi, telefono 390×844
   (tocco) e PC 1920×1080. L'AudioContext della pagina e' strumentato: ogni sorgente che parte (start) viene annotata con la schermata
   e il guadagno del bus generale in quel momento (0 = muto).
   Tre avvii:
     A primo   — localStorage vuoto: Home → Creazione → video iniziale → Provino → Offerte. Nel video si apre l'altoparlante, il video si
                 ferma, si mette il muto (preferenza salvata in 'cpm-audio') e dopo nessun suono esce col bus generale aperto.
     B muto    — primo avvio con «muto» gia' salvato: TUTTE le sorgenti partono col bus generale a 0 (la preferenza vale dal primo suono),
                 e il tasto mostra 🔇.
     C dopo    — avvio successivo (video gia' visto): Home → Creazione → Provino.
   Su ogni schermata (Home, Creazione, video, Provino, Offerte) il tasto [data-cpm="audio-avvio427"] deve esserci: visibile, >= 44×44,
   dentro lo schermo, non coperto, senza sovrapporsi ad altri comandi. Prima del primo tocco nessuna sorgente parte (autoplay).
   VERDE = tutto passa. ROSSO window.__CPM_NO_G427 (= nessun tasto, com'era) DEVE essere bocciato. Uscita 0 solo se verde passa E rosso
   bocciato. «Non giudicato» (nessun suono da giudicare, video che non parte) = rosso.
   CPM_FOTO=1 salva docs/collaudo-po/427-<prima|dopo>-<schermata>-<larghezza>.png (prima = col rosso).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node audio-avvio-427.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const FOTO = !!process.env.CPM_FOTO;
const DIR = path.join(ROOT, 'docs', 'collaudo-po'); if (FOTO) fs.mkdirSync(DIR, { recursive: true });
const RES = [{ goals: 1, assists: 1, rating: 7.2 }, { goals: 2, assists: 0, rating: 7.6 }, { goals: 1, assists: 1, rating: 7.4 }];
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const SEL = '[data-cpm="audio-avvio427"]';

/* strumento: AudioContext che ricorda il primo guadagno creato (il bus generale di AudioMgr.ensureCtx) e ogni sorgente che parte */
function strumenta() {
  const A = window.__A427 = { src: [], ctx: 0 };
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
    class X extends AC { constructor(...a) { super(...a); A.ctx++; A.ctxScr = window.__SCR427 || '?'; A.c = this; }
      createGain() { const g = super.createGain(); if (!this._m427) this._m427 = g; return g; } }
    window.AudioContext = X; window.webkitAudioContext = X;
  }
  /* AudioBufferSourceNode ha un suo start (offset, durata): si strumentano entrambi i prototipi che lo definiscono */
  for (const C of [typeof AudioScheduledSourceNode !== 'undefined' && AudioScheduledSourceNode, typeof AudioBufferSourceNode !== 'undefined' && AudioBufferSourceNode]) {
    try { if (!C || !Object.prototype.hasOwnProperty.call(C.prototype, 'start')) continue; const P = C.prototype, S = P.start;
      P.start = function (...a) { const m = this.context && this.context._m427; A.src.push({ scr: window.__SCR427 || '?', tipo: this.constructor.name, m: m ? +m.gain.value.toFixed(3) : null }); return S.apply(this, a); };
    } catch (_e) {} }
}
async function esameTasto(page) {
  return page.evaluate((SEL) => {
    const vw = innerWidth, vh = innerHeight;
    const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
    const b = [...document.querySelectorAll(SEL)].filter(vis)[0]; if (!b) return null;
    const r = b.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const sopra = [];
    for (const e of document.querySelectorAll('button,a[href],input,select,[role="button"]')) {
      if (e === b || b.contains(e) || e.contains(b) || !vis(e)) continue; const q = e.getBoundingClientRect();
      const ix = Math.min(r.right, q.right) - Math.max(r.left, q.left), iy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
      if (ix > 1 && iy > 1) sopra.push(((e.innerText || e.getAttribute('aria-label') || e.tagName) + '').trim().slice(0, 24));
    }
    /* e nessun testo sotto il tasto (il numero di versione della Home, un titolo) */
    for (const e of document.querySelectorAll('body *')) {
      if (e === b || b.contains(e) || e.contains(b) || !vis(e) || e.closest('canvas,svg,[data-cpm="audio-pannello"]')) continue;
      if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0)) continue;
      const rg = document.createRange(); rg.selectNodeContents(e); for (const q of rg.getClientRects()) {
        const ix = Math.min(r.right, q.right) - Math.max(r.left, q.left), iy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
        if (ix > 1 && iy > 1) { sopra.push('testo «' + (e.textContent || '').trim().slice(0, 20) + '»'); break; } }
    }
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top), dentro: r.left >= 0 && r.top >= 0 && r.right <= vw + 0.5 && r.bottom <= vh + 0.5,
      coperto: !(top && (top === b || b.contains(top))), sopra, icona: (b.textContent || '').trim() };
  }, SEL);
}
const scr = (page, n) => page.evaluate(n => { window.__SCR427 = n; }, n);
const stato = page => page.evaluate(() => { let c = null; try { c = AudioMgr.getCfg(); } catch (_e) {} const A = window.__A427; const m = A && A.c && A.c._m427;
  return { mute: c ? !!c.mute : null, ls: localStorage.getItem('cpm-audio'), master: m ? +m.gain.value.toFixed(3) : null, nSrc: A ? A.src.length : 0, ctx: A ? A.ctx : 0, ctxState: A && A.c ? A.c.state : 'nessuno' }; });

async function percorso(w, h, rosso, avvio) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 600, isMobile: false });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(strumenta);
  await page.addInitScript(([r, avvio]) => { if (r) window.__CPM_NO_G427 = 1; window.__CPM_GLB = true;
    if (!sessionStorage.getItem('p427')) { localStorage.clear(); sessionStorage.setItem('p427', '1');
      if (avvio === 'muto') localStorage.setItem('cpm-audio', JSON.stringify({ mute: true }));
      if (avvio === 'dopo') localStorage.setItem('cpm-intro-seen', '1'); } }, [rosso, avvio]);
  const ko = [], righe = []; const tag = `${avvio} ${w}px`;
  const foto = async n => { if (FOTO && avvio === 'primo') await page.screenshot({ path: path.join(DIR, `427-${rosso ? 'prima' : 'dopo'}-${n}-${w}.png`) }); };
  const giudicaTasto = async (n, { muto = null } = {}) => {
    const e = await esameTasto(page); const s = await stato(page);
    righe.push(`${n}: tasto ${e ? `${e.w}×${e.h} @${e.x},${e.y} «${e.icona}»${e.dentro ? '' : ' FUORI'}${e.coperto ? ' COPERTO' : ''}${e.sopra.length ? ' sopra ' + e.sopra.join('|') : ''}` : 'ASSENTE'} · sorgenti ${s.nSrc} · contesto ${s.ctxState} · muto ${s.mute}`);
    if (!e) { ko.push(`${tag} ${n}: nessun comando audio`); return; }
    if (e.w < 44 || e.h < 44) ko.push(`${tag} ${n}: tasto ${e.w}×${e.h} (< 44)`);
    if (!e.dentro || e.coperto) ko.push(`${tag} ${n}: tasto fuori schermo o coperto`);
    if (e.sopra.length) ko.push(`${tag} ${n}: tasto sopra altri comandi (${e.sopra.join(', ')})`);
    if (muto !== null && (e.icona === '🔇') !== muto) ko.push(`${tag} ${n}: icona «${e.icona}» non dice il muto (${muto})`);
  };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 90000 });
    await scr(page, 'home');
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /^\s*Nuova carriera\s*$/.test(x.textContent || '')), null, { timeout: 90000 });
    await sleep(1500); await foto('1-home');
    const s0 = await stato(page);
    righe.push(`prima del primo tocco: contesti ${s0.ctx} · sorgenti ${s0.nSrc}`);
    if (s0.nSrc > 0) ko.push(`${tag}: ${s0.nSrc} suoni partiti prima del primo tocco`);
    await giudicaTasto('home', { muto: avvio === 'muto' });
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^\s*Nuova carriera\s*$/.test(x.textContent || '')); b.setAttribute('data-p427', 'home'); });
    await page.click('[data-p427="home"]');
    await scr(page, 'crea');
    await page.waitForSelector('[data-cpm="crea-avanti-v2"]', { timeout: 30000 }); await sleep(2500); await foto('2-crea');
    await giudicaTasto('creazione', { muto: avvio === 'muto' });
    await page.fill('input[name="cpm-hero-name"]', 'Luca Sereni'); await sleep(300);
    await page.click('[data-cpm="crea-avanti-v2"]');
    if (avvio !== 'dopo') {
      await scr(page, 'intro');
      await page.waitForSelector('[data-cpm="intro-salta"]', { timeout: 30000 });
      const partito = await page.waitForFunction(() => !!(window.__CPM_G233 && window.__CPM_G233.introPartita), null, { timeout: 120000 }).then(() => true).catch(() => false);
      righe.push(`video: ${partito ? 'partito (corpo arrivato)' : 'NON partito entro 120 s'}`);
      if (!partito) ko.push(`${tag} video: non partito, non giudicato`);
      await sleep(2500); await foto('3-intro');
      await giudicaTasto('video', { muto: avvio === 'muto' });
      if (avvio === 'primo' && !rosso && partito && await page.$(SEL)) {
        await page.click(SEL); await sleep(400);
        const pan = await page.evaluate(() => { const p = document.querySelector('[data-cpm="audio-pannello"] > div'); if (!p) return null; const r = p.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { sopra: !!(t && p.contains(t)) }; });
        if (!pan || !pan.sopra) ko.push(`${tag} video: il pannello audio non si apre sopra il video (${JSON.stringify(pan)})`);
        await foto('3b-pannello');
        const c1 = await page.evaluate(() => (document.querySelector('[data-cpm="intro-sub"]') || {}).textContent || '');
        await sleep(6000);
        const c2 = await page.evaluate(() => (document.querySelector('[data-cpm="intro-sub"]') || {}).textContent || '');
        const vivo = !!(await page.$('[data-cpm="intro-salta"]'));
        righe.push(`video col pannello aperto 6 s: didascalia «${c1.slice(0, 30)}» → «${c2.slice(0, 30)}» · video ${vivo ? 'aperto' : 'CHIUSO'}`);
        if (!vivo || c1 !== c2) ko.push(`${tag} video: col pannello aperto il video non si ferma`);
        await page.click('[data-cpm="audio-muto"]'); await sleep(900);
        const sm = await stato(page);
        righe.push(`dopo il muto: cfg ${sm.mute} · salvato ${sm.ls} · bus generale ${sm.master}`);
        if (sm.mute !== true || !/"mute":true/.test(sm.ls || '')) ko.push(`${tag} video: il muto non e' salvato`);
        if (sm.master === null || sm.master > 0.02) ko.push(`${tag} video: col muto il bus generale resta a ${sm.master}`);
        await page.click('[data-cpm="audio-chiudi"]'); await sleep(2500);
        const c3 = await page.evaluate(() => (document.querySelector('[data-cpm="intro-sub"]') || {}).textContent || '');
        righe.push(`video dopo la chiusura: «${c3.slice(0, 30)}»`);
        await giudicaTasto('video dopo il muto', { muto: true });
        const nMuto = (await page.evaluate(() => window.__A427.src.length));
        await sleep(4000);
        const dopo = await page.evaluate(n => window.__A427.src.slice(n), nMuto);
        const forti = dopo.filter(x => x.m > 0.02);
        righe.push(`suoni dopo il muto: ${dopo.length} · col bus aperto ${forti.length}`);
        if (forti.length) ko.push(`${tag} video: ${forti.length} suoni col bus aperto dopo il muto`);
      }
      await page.click('[data-cpm="intro-salta"]').catch(() => {});
    }
    await scr(page, 'provino');
    await page.waitForSelector('[data-cpm="provino-pre"]', { timeout: 60000 }); await sleep(1500); await foto('4-provino');
    await giudicaTasto('provino', { muto: avvio === 'muto' || (avvio === 'primo' && !rosso) });
    if (avvio !== 'dopo') {
      await page.evaluate(res => { const env = JSON.parse(localStorage.getItem('cpm-trial-prog') || 'null'); localStorage.setItem('cpm-trial-prog', JSON.stringify({ ph: 'offers', p: env.p, res, slot: env.slot || 0 })); }, RES);
      await page.reload({ waitUntil: 'load', timeout: 90000 }); await scr(page, 'offerte');
      await page.waitForFunction(() => !!document.querySelector('.cpm-offers'), null, { timeout: 90000 }); await sleep(1500); await foto('5-offerte');
      await giudicaTasto('offerte', { muto: avvio === 'muto' || (avvio === 'primo' && !rosso) });
    }
    /* suoni partiti per schermata (prima del reload) */
    const A = await page.evaluate(() => window.__A427);
    const per = {}; for (const x of A.src) { const k = x.scr + '/' + (x.tipo || '?').replace(/Node$/, ''); per[k] = per[k] || { n: 0, aperti: 0 }; per[k].n++; if (x.m > 0.02) per[k].aperti++; }
    righe.push('suoni per schermata (dall\'ultimo caricamento): ' + (Object.keys(per).map(k => `${k} ${per[k].n} (bus aperto ${per[k].aperti})`).join(' · ') || 'nessuno'));
  } catch (e) { ko.push(`${tag}: percorso interrotto (${String(e.message).split('\n')[0].slice(0, 160)})`); }
  if (errs.length) ko.push(`${tag}: errori di pagina: ${errs.slice(0, 2).join(' | ')}`);
  await ctx.close();
  return { tag, ko, righe };
}

/* B: la preferenza «muto» vale dal primo suono — si giudica PRIMA del reload delle offerte, sul percorso Home → Creazione → video */
async function muto(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 600, isMobile: false });
  const page = await ctx.newPage(); await installCdnRoutes(page); await page.addInitScript(strumenta);
  await page.addInitScript(() => { window.__CPM_GLB = true; if (!sessionStorage.getItem('p427m')) { localStorage.clear(); sessionStorage.setItem('p427m', '1'); localStorage.setItem('cpm-audio', JSON.stringify({ mute: true })); } });
  const ko = [], righe = [], tag = `muto-dal-primo-suono ${w}px`;
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 90000 }); await scr(page, 'home');
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /^\s*Nuova carriera\s*$/.test(x.textContent || '')), null, { timeout: 90000 });
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^\s*Nuova carriera\s*$/.test(x.textContent || '')); b.setAttribute('data-p427', 'home'); });
    await page.click('[data-p427="home"]'); await scr(page, 'crea');
    await page.waitForSelector('[data-cpm="crea-avanti-v2"]', { timeout: 30000 }); await sleep(2000);
    await page.fill('input[name="cpm-hero-name"]', 'Luca Sereni'); await page.click('[data-cpm="crea-avanti-v2"]'); await scr(page, 'intro');
    await page.waitForFunction(() => !!(window.__CPM_G233 && window.__CPM_G233.introPartita), null, { timeout: 120000 }).catch(() => {});
    await sleep(12000);
    const A = await page.evaluate(() => window.__A427);
    const aperti = A.src.filter(x => x.m === null || x.m > 0.001);
    righe.push(`sorgenti partite ${A.src.length} (home ${A.src.filter(x => x.scr === 'home').length} · creazione ${A.src.filter(x => x.scr === 'crea').length} · video ${A.src.filter(x => x.scr === 'intro').length}) · col bus generale aperto ${aperti.length}`);
    if (!A.src.length) ko.push(`${tag}: nessun suono partito, non giudicato`);
    if (aperti.length) ko.push(`${tag}: ${aperti.length} suoni col bus aperto nonostante il muto salvato`);
  } catch (e) { ko.push(`${tag}: interrotto (${String(e.message).split('\n')[0].slice(0, 160)})`); }
  await ctx.close(); return { tag, ko, righe };
}

const fails = []; const esiti = { verde: [], rosso: [] };
try {
  for (const [w, h] of [[390, 844], [1920, 1080]]) {
    for (const av of ['primo', 'dopo']) esiti.verde.push(await percorso(w, h, false, av));
    esiti.verde.push(await muto(w, h));
  }
  esiti.rosso.push(await percorso(390, 844, true, 'primo'));
  esiti.rosso.push(await percorso(1920, 1080, true, 'dopo'));
} finally { await browser.close(); srv.close(); }
for (const b of ['verde', 'rosso']) for (const r of esiti[b]) { console.log(`  ${b} ${r.tag}`); r.righe.forEach(x => console.log('     ' + x)); r.ko.forEach(k => console.log('     ✗ ' + k)); }
const kv = esiti.verde.flatMap(r => r.ko), kr = esiti.rosso.flatMap(r => r.ko);
if (kv.length) fails.push(`verde: ${kv.length} controlli falliti`); else console.log('  ✓ verde: altoparlante in Home, Creazione, video, Provino e Offerte a 390 e 1920; muto rispettato dal primo suono; nel video il pannello ferma la scena e il muto si salva');
if (!kr.length) fails.push('il rosso __CPM_NO_G427 non si distingue'); else console.log(`  ✓ rosso bocciato (${kr.length} controlli: ${kr[0]})`);
if (esiti.verde.length !== 6 || esiti.rosso.length !== 2) fails.push('braccio mancante: non giudicato');
if (fails.length) { console.log('\n❌ audio-avvio-427: ' + fails.join(' · ')); process.exit(1); }
console.log('\n✅ audio-avvio-427 verde'); process.exit(0);
