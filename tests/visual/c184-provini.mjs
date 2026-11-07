#!/usr/bin/env node
/* [collaudo 184 · PO 07/11 «Sistemiamo la gestione dei provini, il wizard»] PERCORSO COMPLETO dalla home alla carriera:
   home → Nuova carriera (creazione: validazione, nome lungo, tastiera simulata, fisarmoniche) → provino 1..3 (pre · partita · fine
   partita · post) → ripresa dopo chiusura (ricarica a meta') → calcolo offerte → offerte → scelta del club → carriera.
   Per ogni schermata nuova: foto + misura180 (contrasto sui pixel, aree di tocco effettive) + ALTEZZA (c184-lib), e una linea del
   tempo con le fasi e i tempi morti. Nella partita: il primo highlight si gioca davvero (scelta 0), poi il cronometro va all'88'
   (__CPM_SALTA297) per non aspettare 90 minuti — i tempi della partita NON sono quindi quelli reali; quelli delle schermate si'.
   Uso: C180_FORMATI=s360,s412,pc ; dati in C180_DATI, foto in C180_FOTO. Non tocca src/. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './c178-graf-lib.mjs';
import { scelti, misura180, NOME_LUNGO, DATI_DIR } from './c180-lib.mjs';
import { ALTEZZA, classe } from './c184-lib.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const INIT = () => { window.__CPM_GLB = false; try { localStorage.setItem('cpm-intro-seen', '1'); localStorage.setItem('cpm-dark', '0'); } catch (_e) {}
  let s = 4242; Math.random = function () { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const fase = p => p.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null);
const premi = (page, rx) => page.evaluate(s => { const r = new RegExp(s); const x = [...document.querySelectorAll('button')].filter(y => y.getBoundingClientRect().width > 0 && !y.disabled).find(y => r.test((y.textContent || '').trim())); if (x) { x.click(); return (x.textContent || '').trim().slice(0, 40); } return false; }, rx);
const schermo = p => p.evaluate(() => { const t = document.body.innerText || ''; if (/IL PROVINO · PASSO (\d)/.test(t)) return 'provino-pre-' + RegExp.$1; if (/PROVINO (\d) DI 3 · COMPLETATO/.test(t)) return 'provino-post-' + RegExp.$1;
  if (/Offerte ricevute/.test(t)) return 'offerte'; if (/Crea il tuo calciatore/i.test(t)) return 'creazione'; if (window.__CPM_CAREER) return 'carriera'; return null; }).catch(() => null);
const OUT = {};
for (const f of scelti()) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript(INIT);
  const R = {}, A = {}, tl = [], note = []; const T0 = Date.now(); const ev = (k, x) => { tl.push({ t: Math.round((Date.now() - T0) / 100) / 10, k, ...(x || {}) }); };
  const M = async (sch, o) => { const r = await misura180(page, f, sch, 'prov', R, { noFondo: true, vivo: true, fermaMs: 1200, ...(o || {}) }); const a = await page.evaluate(ALTEZZA).catch(() => ({}));
    A[sch] = { ...a, classe: classe(a), foto: r && r.foto, ctr: r ? r.nSottoCtr : null, ctrEs: r ? (r.sottoCtr || []).slice(0, 4).map(c => `«${c.t}» ${c.rap}:1 (${c.testo} su ${c.fondo})`) : [], tocchi: r && r.x108 ? r.x108.tocchi : [], v1: r ? r.v1 : [], hs: r ? r.hs : null, tagliati: r ? r.tagliati : null };
    console.log(`     ↳ ${sch}: ${a.scorre ? 'SCORRE' : 'vuoto ' + a.vuoto + ' px = ' + a.pct + '%'} · ctr ${A[sch].ctr} · tocchi<44 ${A[sch].tocchi.length}`); };
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1500); ev('home');
  /* ── CREAZIONE ── */
  await premi(page, 'Nuova carriera'); await page.waitForFunction(() => /Crea il tuo calciatore/i.test(document.body.innerText || ''), null, { timeout: 15000 }).catch(() => {}); ev('creazione');
  const crea = await page.evaluate(() => { const b = document.querySelector('[data-cpm="crea-avanti-v2"]'); const i = document.querySelector('input[placeholder^="Es."]');
    return { avantiDisattivo: b ? b.disabled : null, avantiTesto: b ? (b.innerText || '').trim() : null, avantiY: b ? Math.round(b.getBoundingClientRect().top + scrollY) : null, inputY: i ? Math.round(i.getBoundingClientRect().top) : null, maxLength: i ? i.maxLength : null,
      suggerimento: [...document.querySelectorAll('div')].some(d => d.children.length === 0 && /Scrivi il nome per iniziare/.test(d.textContent || '')), altezzaPagina: Math.max(document.documentElement.scrollHeight, (document.querySelector('.cpm-scroll') || {}).scrollHeight || 0) }; });
  await M('creazione-vuota');
  /* tastiera del telefono: headless non la apre; si SIMULA togliendo 300 px alla vista con il campo a fuoco (come fa il telefono) */
  const inp = page.locator('input[placeholder^="Es."]').first(); await inp.click().catch(() => {}); await inp.type(NOME_LUNGO, { delay: 15 }).catch(() => {});
  crea.nomeScritto = await inp.inputValue().catch(() => null);
  if (f.touch) { await page.setViewportSize({ width: f.w, height: f.h - 300 }); await sleep(600);
    crea.tastiera = await page.evaluate(() => { const i = document.activeElement; const r = i && i.getBoundingClientRect(); const bt = document.querySelector('[data-cpm="crea-avanti-v2"]'); const rb = bt && bt.getBoundingClientRect();
      return { fuoco: i ? i.tagName + (i.placeholder ? '[' + i.placeholder + ']' : '') : null, campoTop: r ? Math.round(r.top) : null, campoBottom: r ? Math.round(r.bottom) : null, vista: innerHeight, campoVisibile: !!r && r.top >= 0 && r.bottom <= innerHeight, avantiTop: rb ? Math.round(rb.top) : null, avantiVisibile: !!rb && rb.top >= 0 && rb.bottom <= innerHeight }; });
    await M('creazione-tastiera-simulata'); await page.setViewportSize({ width: f.w, height: f.h }); await sleep(500); }
  await page.keyboard.press('Enter'); await sleep(600); crea.enterAvvia = (await schermo(page)) !== 'creazione';
  if (crea.enterAvvia) note.push('Enter nel campo nome avvia i provini');
  if ((await schermo(page)) === 'creazione') {
    await M('creazione-nome');
    /* fisarmoniche */
    await page.evaluate(() => { for (const d of document.querySelectorAll('details')) d.open = true; }); await sleep(500); await M('creazione-fisarmoniche-aperte');
    await page.evaluate(() => { for (const d of document.querySelectorAll('details')) d.open = false; for (const e of document.querySelectorAll('*')) if (e.scrollTop) e.scrollTop = 0; window.scrollTo(0, 0); }); await sleep(300);
    const tc = Date.now(); await page.locator('[data-cpm="crea-avanti-v2"]').click(); crea.clickAvanti = (await page.evaluate(() => (document.querySelector('[data-cpm="crea-avanti-v2"]') || {}).innerText || '')).trim();
    await page.waitForFunction(() => /IL PROVINO · PASSO/.test(document.body.innerText || ''), null, { timeout: 20000 }).catch(() => {}); crea.msAlProvino = Date.now() - tc; }
  R.crea = crea; ev('creazione-fine', { ...crea });
  /* ── PROVINI ── */
  const visti = new Set(); let ricaricato = false, hlGiocati = 0, saltato = false, ultimoFase = null, ultimoSch = null; const t1 = Date.now();
  while (Date.now() - t1 < 420000) {
    const sch = await schermo(page); const ph = await fase(page);
    if (ph !== ultimoFase || sch !== ultimoSch) { ev(ph ? 'fase:' + ph : 'schermo:' + sch, { sch }); ultimoFase = ph; ultimoSch = sch; }
    const chiave = ph ? `partita-${(sch || '').replace(/\D/g, '') || 'x'}-${ph}` : sch;
    if (sch === 'carriera' && !ph) { await sleep(1500); await M('carriera-arrivo'); break; }
    if (chiave && !visti.has(chiave) && !/^(hl_move|hl_result|playing)$/.test(ph || '') ) { visti.add(chiave); if (!ph || /provino-pre-1|matchday|formations|walkout|ended|hl_choose|hl_intro/.test(chiave)) await M(chiave); }
    if (ph === 'playing' && !visti.has('playing-' + hlGiocati + sch)) { visti.add('playing-' + hlGiocati + sch); await sleep(1500); if (hlGiocati === 0 && !visti.has('foto-playing')) { visti.add('foto-playing'); await M('partita-in-gioco'); } }
    if (ph === 'hl_choose') { await sleep(700); await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)); hlGiocati++; await sleep(500); continue; }
    if (ph === 'playing' && hlGiocati >= 1 && !saltato) { await page.evaluate(() => { window.__CPM_SET_NUMHL && window.__CPM_SET_NUMHL(1); window.__CPM_SALTA297 && window.__CPM_SALTA297(88); }); saltato = true; ev('salto-88'); }
    if (ph === 'playing' && hlGiocati === 0) { const tP = tl.filter(x => x.k === 'fase:playing').pop(); if (tP && (Date.now() - T0) / 1000 - tP.t > 40) { await page.evaluate(() => { window.__CPM_SET_NUMHL && window.__CPM_SET_NUMHL(1); window.__CPM_SALTA297 && window.__CPM_SALTA297(88); }); hlGiocati = 1; saltato = true; ev('nessun-highlight-in-40s'); } }
    if (!ph && /provino-post/.test(sch || '')) { saltato = false; hlGiocati = 0;
      if (sch === 'provino-post-1' && !ricaricato) { ricaricato = true; ev('ricarica'); await page.reload({ waitUntil: 'load' }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(2500);
        const dopo = await schermo(page); const testo = await page.evaluate(() => (document.body.innerText || '').slice(0, 300)); R.ripresa = { dopo, testo }; ev('dopo-ricarica', { dopo }); await M('ripresa-dopo-chiusura');
        if (dopo !== 'provino-pre-2' && dopo !== 'provino-post-1') { const k = await premi(page, 'Continua|Riprendi'); ev('ripresa-tasto', { k }); await sleep(2500); R.ripresa.dopoTasto = await schermo(page); }
        continue; }
      if (sch === 'provino-post-3') { const tc = Date.now(); await page.waitForFunction(() => /Offerte ricevute/.test(document.body.innerText || ''), null, { timeout: 30000 }).catch(() => {}); R.msCalcoloOfferte = Date.now() - tc; ev('offerte-pronte', { ms: R.msCalcoloOfferte }); continue; }
      await premi(page, 'Vai al Provino'); await sleep(800); continue; }
    if (!ph && /provino-pre/.test(sch || '')) { await premi(page, 'Inizia il provino'); await sleep(800); continue; }
    if (!ph && sch === 'offerte') { await sleep(800); if (!visti.has('offerte-scelta')) { visti.add('offerte-scelta'); const k = await premi(page, 'Firma|Scegli|Accetta'); ev('offerta-tasto', { k }); await sleep(1500);
        const k2 = await premi(page, 'Conferma|Firma|Sì|Accetta'); if (k2) ev('offerta-conferma', { k: k2 }); await sleep(2000); continue; } }
    if (ph === 'ended') { await sleep(800); const k = await premi(page, 'Continua|Torna|Prosegui|Avanti|Chiudi|Fine'); if (k) ev('fine-partita-tasto', { k }); await sleep(800); continue; }
    if (ph === 'matchday' || ph === 'formations') { await sleep(500); const k = await premi(page, 'Salta e gioca|Entra in campo|Vedi le formazioni|Gioca|Inizia'); if (!k) await page.keyboard.press('Enter'); await sleep(700); continue; }
    if (ph === 'walkout') { await premi(page, 'Salta'); await sleep(700); continue; }
    if (ph === 'hl_result' || ph === 'hl_intro' || ph === 'hl_move') { await sleep(400); continue; }
    if (!ph && !sch) { const k = await premi(page, 'Continua|Avanti|Chiudi|OK|Inizia'); if (k) ev('tasto', { k }); }
    await sleep(500);
  }
  OUT[f.k] = { R: { crea: R.crea, ripresa: R.ripresa, msCalcoloOfferte: R.msCalcoloOfferte }, A, tl, note, errs, ms: Date.now() - T0 };
  fs.writeFileSync(path.join(DATI_DIR, `provini-${f.k}.json`), JSON.stringify(OUT[f.k], null, 1));
  console.log(`${f.nome}: ${Math.round((Date.now() - T0) / 1000)} s · errori ${errs.length} · linea del tempo:\n  ` + tl.map(x => `${x.t}s ${x.k}${x.k2 ? '' : ''}`).join(' | '));
  await ctx.close();
}
await b.close(); srv.close();
