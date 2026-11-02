#!/usr/bin/env node
/* [collaudo grafico 178 · PO-299] CENSIMENTO delle schermate e dei pannelli raggiungibili, nei formati C178_FORMATI (default tel,tabv,tabo,pc).
   Per ogni schermata: foto + misure D() (hscroll, fuori schermo, tasti <40, testi tagliati/sovrapposti, figurine, spazio fra i riquadri). Non tocca src/. */
import { startServer, launchBrowser, apriPagina, entraInCarriera, premi, FORMATI, scelti, sleep, SAVE, TRIALPROG, ferma, misura, congela, salva, SCRATCH } from './c178-graf-lib.mjs';
import fs from 'node:fs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = []; const mancanti = []; const R = {};
const SAVE_PARTITA = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const modalInfo = (page) => page.evaluate(() => {
  const W = innerWidth, H = innerHeight; let best = null;
  for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none' || +c.opacity < 0.1) continue; const r = e.getBoundingClientRect(); if (r.width * r.height < 0.5 * W * H) continue; const z = parseInt(c.zIndex) || 0; if (!best || z >= best.z) best = { e, z, r }; }
  if (!best) return null; const e = best.e; const cut = []; for (const k of e.querySelectorAll('button,[role=button]')) { const r = k.getBoundingClientRect(); if (r.width > 0 && (r.bottom > H + 1 || r.top < -1)) cut.push((k.textContent || '').trim().slice(0, 20)); }
  const inner = e.firstElementChild ? e.firstElementChild.getBoundingClientRect() : null;
  return { z: best.z, rect: [Math.round(best.r.left), Math.round(best.r.top), Math.round(best.r.width), Math.round(best.r.height)], scrolla: e.scrollHeight > e.clientHeight + 3, tagliati: cut.slice(0, 4), dentro: inner ? [Math.round(inner.left), Math.round(inner.top), Math.round(inner.width), Math.round(inner.height)] : null };
}).catch(() => null);
async function foto(page, f, id, o) { const m = await misura(page, f, id, R, o); m.modal = await modalInfo(page); return m; }

for (const f of scelti()) {
  console.log(`\n=== ${f.nome}`);
  const tab_full = f.k === 'tel';
  /* 1) fuori carriera */
  { const { ctx, page } = await apriPagina(b, port, f, {}, '?cpmtest=1', errs);
    await foto(page, f, 'menu-home', { full: tab_full });
    if (await premi(page, 'Crediti')) { await sleep(600); await foto(page, f, 'menu-crediti', { full: tab_full }); await page.keyboard.press('Escape'); if (!(await premi(page, '^✕$|Chiudi'))) {} await sleep(500); } else mancanti.push(f.k + ' crediti');
    if (await premi(page, 'Opzioni')) { await sleep(600); await foto(page, f, 'menu-opzioni', { full: tab_full }); await premi(page, '^✕$'); await sleep(500); } else mancanti.push(f.k + ' opzioni');
    if (await premi(page, 'Nuova carriera')) { await sleep(600); await foto(page, f, 'creazione', { full: tab_full }); } else mancanti.push(f.k + ' creazione');
    await ctx.close(); }
  /* 2) offerte (fine provini) */
  { const { ctx, page } = await apriPagina(b, port, f, { trial: TRIALPROG }, '', errs);
    const ok = await page.waitForFunction(() => /Offerte ricevute/.test(document.body.innerText || ''), null, { timeout: 30000 }).then(() => true).catch(() => false);
    if (ok) await foto(page, f, 'offerte', { full: tab_full }); else mancanti.push(f.k + ' offerte');
    await ctx.close(); }
  /* 3) carriera: schede chiuse e con le fisarmoniche aperte; poi le finestre */
  for (const ap of [false, true]) {
    const { ctx, page } = await apriPagina(b, port, f, { save: SAVE, fisAperte: ap }, '?cpmtest=1', errs);
    const vivo = await entraInCarriera(page, errs); if (!vivo) { mancanti.push(f.k + ' carriera ' + (ap ? 'aperte' : '')); await ctx.close(); continue; }
    const sfx = ap ? '-ap' : '';
    for (const [id, tab] of [['home', 'dashboard'], ['stagione-classifica', 'standings'], ['stagione-calendario', 'calendar'], ['stagione-coppe', 'coppe'], ['club', 'club'], ['carriera-profilo', 'profile'], ['carriera-nazionale', 'nazionale'], ['agente', 'agente'], ['ufficio', 'ufficio']]) {
      const r = await page.evaluate(x => window.__CPM_CAREER.goTab(x), tab); if (r !== true) { mancanti.push(f.k + ' ' + id); continue; } await sleep(300); await foto(page, f, id + sfx, { full: tab_full }); }
    if (!ap) {
      await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(300);
      /* opzioni di carriera (footer) e figurina grande */
      if (await premi(page, '^Opzioni$|Opzioni$')) { await sleep(600); await foto(page, f, 'carriera-opzioni', { full: tab_full }); await page.keyboard.press('Escape'); await premi(page, '^✕$'); await sleep(400); } else mancanti.push(f.k + ' carriera-opzioni');
      await page.evaluate(() => window.__CPM_CAREER.dismiss()); await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(300);
      try { await page.locator('[aria-label="Apri la figurina"]').first().click({ timeout: 4000 }); await sleep(500); await foto(page, f, 'figurina-completa'); await page.mouse.click(5, 5); await sleep(300); } catch (e) { mancanti.push(f.k + ' figurina-completa'); }
      const finestre = [
        ['fin-impulso', () => window.__CPM_CAREER.apriSettimana('impulso')], ['fin-spogliatoio', () => window.__CPM_CAREER.apriSettimana('spogliatoio')], ['fin-settimana-vissuta', () => window.__CPM_CAREER.apriSettimana('vissuta')],
        ['fin-partita-titolare', () => window.__CPM_CAREER.apriPartita('starter')], ['fin-partita-panchina', () => window.__CPM_CAREER.apriPartita('bench')],
        ['fin-offerta', () => window.__CPM_CAREER.forceOffer()], ['fin-intervista-vittoria', () => window.__CPM_CAREER.forceInterview('win')], ['fin-intervista-sconfitta', () => window.__CPM_CAREER.forceInterview('loss')],
        ['fin-procuratore-intro', () => window.__CPM_CAREER.apriIntro253()], ['fin-momento-carriera', () => window.__CPM_CAREER.forceMoment('debut')], ['fin-festa-nazione', () => window.__CPM_CAREER.festa251('nation')],
        ['fin-presentazione-0', () => window.__CPM_CAREER.apriPresentazione(0)], ['fin-presentazione-2', () => window.__CPM_CAREER.apriPresentazione(2)], ['fin-gala', () => window.__CPM_CAREER.apriGala()],
        ['fin-saga', () => window.__CPM_CAREER.forceSaga('capitano')], ['fin-notifica', () => window.__CPM_CAREER.notify247()],
      ];
      for (const [id, fn] of finestre) {
        await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(300);
        const r = await page.evaluate(fn); if (r !== true && r !== 'ok' && !(r && typeof r === 'object')) { mancanti.push(`${f.k} ${id} → ${r}`); continue; } await sleep(700); await foto(page, f, id);
        await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(300); await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(200); }
      /* schermate intere del flusso di carriera */
      for (const sc of ['press', 'postmatch', 'seasonEnd', 'careerEnd', 'nationalCallup', 'proTransition', 'clubPresentation', 'seasonAwards']) {
        const r = await page.evaluate(x => window.__CPM_CAREER.goScreen(x), sc); await sleep(900);
        const t = await page.evaluate(() => (document.body.innerText || '').length); await foto(page, f, 'sch-' + sc);
        await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(400); }
    }
    await ctx.close();
  }
  /* 4) pre-partita */
  { const { ctx, page } = await apriPagina(b, port, f, { save: SAVE_PARTITA }, '?cpmtest=1', errs);
    const vivo = await entraInCarriera(page, errs);
    if (vivo) { await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(400);
      const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
      if (pm === true) { const ok = await page.waitForFunction(() => /VS|OSPITE|CASA/.test(document.body.innerText || ''), null, { timeout: 40000 }).then(() => true).catch(() => false);
        if (ok) await foto(page, f, 'prepartita'); else mancanti.push(f.k + ' prepartita'); } else mancanti.push(f.k + ' prepartita ' + pm);
    } else mancanti.push(f.k + ' prepartita (carriera)');
    await ctx.close(); }
  salva(`schermate-${f.k}.json`, { R: R[f.k], mancanti: mancanti.filter(x => x.startsWith(f.k)), errs: errs.filter(x => x.startsWith(f.k)) });
}
console.log('\nmancanti:', mancanti); console.log('errori:', errs.slice(0, 8));
await b.close(); srv.close();
