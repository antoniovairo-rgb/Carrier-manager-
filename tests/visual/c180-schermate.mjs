#!/usr/bin/env node
/* [collaudo grafico 180 · richiesta PO 06/11] CENSIMENTO delle schermate e finestre di CARRIERA (e fuori carriera), per formato e per club.
   Uso: C180_FORMATI=s360,s412,pc  C180_CLUB=rosso,giallo,scuro  C180_PARTE=fuori,carriera,finestre,flusso (default tutte)
   Foto in docs/collaudo-grafico/180/<schermata>-<formato>-<club>.png, dati in DATI_DIR/schermate-<formato>-<club>.json. Non tocca src/. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, SAVE, TRIALPROG, INIT, entraInCarriera } from './c178-graf-lib.mjs';
import { FORMATI, scelti, scelteClub, saveDi, misura180, salvaDati, premi, NOME_LUNGO } from './c180-lib.mjs';
const PARTI = (process.env.C180_PARTE || 'fuori,carriera,finestre,flusso').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function apri(f, init, query, errs) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`${f.k} · ${String(e.message).slice(0, 140)}`));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: [], ...(init || {}) });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query || ''}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  return { ctx, page };
}
for (const f of scelti()) for (const club of scelteClub()) {
  const R = {}, errs = [], mancanti = []; const t0 = Date.now();
  console.log(`\n=== ${f.nome} · club ${club}`);
  const M = (page, sch, o) => misura180(page, f, sch, club, R, o);
  if (PARTI.includes('fuori') && club === 'rosso') { /* fuori carriera: il club non c'entra, si misura una volta */
    const { ctx, page } = await apri(f, {}, '?cpmtest=1', errs); await sleep(1500);
    await M(page, 'menu');
    if (await premi(page, 'Crediti')) { await sleep(600); await M(page, 'menu-crediti', { noFondo: false }); await page.keyboard.press('Escape'); await premi(page, '^✕$|Chiudi'); await sleep(500); } else mancanti.push('menu-crediti');
    if (await premi(page, 'Opzioni')) { await sleep(600); await M(page, 'menu-opzioni'); await premi(page, '^✕$|Chiudi'); await sleep(500); } else mancanti.push('menu-opzioni');
    if (await premi(page, 'Nuova carriera')) { await sleep(700);
      await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, NOME_LUNGO); await sleep(400);
      await M(page, 'creazione');
      if (await premi(page, 'INIZIA I PROVINI')) { await sleep(900); await M(page, 'provini-intro'); } else mancanti.push('provini-intro');
    } else mancanti.push('creazione');
    await ctx.close();
    { const { ctx, page } = await apri(f, { trial: { ...TRIALPROG, p: { ...TRIALPROG.p, name: NOME_LUNGO } } }, '', errs);
      const ok = await page.waitForFunction(() => /Offerte ricevute/.test(document.body.innerText || ''), null, { timeout: 30000 }).then(() => true).catch(() => false);
      if (ok) await M(page, 'offerte'); else mancanti.push('offerte'); await ctx.close(); }
  }
  const S = saveDi(SAVE, club);
  if (PARTI.includes('carriera') || PARTI.includes('finestre') || PARTI.includes('flusso')) {
    const { ctx, page } = await apri(f, { save: S }, '?cpmtest=1', errs);
    const vivo = await entraInCarriera(page, errs);
    if (!vivo) mancanti.push('carriera'); else {
      if (PARTI.includes('carriera')) for (const [id, tab] of [['home', 'dashboard'], ['classifica', 'standings'], ['calendario', 'calendar'], ['coppe', 'coppe'], ['club', 'club'], ['carriera', 'profile'], ['nazionale', 'nazionale'], ['agente', 'agente'], ['ufficio', 'ufficio']]) {
        const r = await page.evaluate(x => window.__CPM_CAREER.goTab(x), tab); if (r !== true) { mancanti.push(id); continue; } await sleep(350); await M(page, id); }
      if (PARTI.includes('finestre')) {
        await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(300);
        if (await premi(page, '^Opzioni$|Opzioni$')) { await sleep(600); await M(page, 'carriera-opzioni'); await page.keyboard.press('Escape'); await premi(page, '^✕$'); await sleep(400); } else mancanti.push('carriera-opzioni');
        await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(300);
        try { await page.locator('[aria-label="Apri la figurina"]').first().click({ timeout: 4000 }); await sleep(500); await M(page, 'figurina', { noFondo: true }); await page.mouse.click(5, 5); await sleep(300); } catch (e) { mancanti.push('figurina'); }
        const fin = [
          ['settimana-impulso', () => window.__CPM_CAREER.apriSettimana('impulso')], ['settimana-spogliatoio', () => window.__CPM_CAREER.apriSettimana('spogliatoio')], ['settimana-vissuta', () => window.__CPM_CAREER.apriSettimana('vissuta')],
          ['partita-titolare', () => window.__CPM_CAREER.apriPartita('starter')], ['partita-panchina', () => window.__CPM_CAREER.apriPartita('bench')],
          ['offerta-mercato', () => window.__CPM_CAREER.forceOffer()], ['intervista-vittoria', () => window.__CPM_CAREER.forceInterview('win')], ['intervista-sconfitta', () => window.__CPM_CAREER.forceInterview('loss')],
          ['procuratore-intro', () => window.__CPM_CAREER.apriIntro253()], ['momento-esordio', () => window.__CPM_CAREER.forceMoment('debut')], ['festa-nazionale', () => window.__CPM_CAREER.festa251('nation')],
          ['presentazione-0', () => window.__CPM_CAREER.apriPresentazione(0)], ['presentazione-2', () => window.__CPM_CAREER.apriPresentazione(2)], ['gala', () => window.__CPM_CAREER.apriGala()],
          ['saga-capitano', () => window.__CPM_CAREER.forceSaga('capitano')], ['notifica', () => window.__CPM_CAREER.notify247()], ['coppa-nazioni', () => window.__CPM_CAREER.apriNC243()],
        ];
        for (const [id, fn] of fin) {
          await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(300);
          const r = await page.evaluate(fn).catch(e => 'err ' + e.message); if (r !== true && r !== 'ok' && !(r && typeof r === 'object')) { mancanti.push(`${id} → ${String(r).slice(0, 40)}`); continue; }
          await sleep(800); await M(page, id, { noFondo: false });
          await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(300); }
      }
      if (PARTI.includes('flusso')) for (const sc of ['press', 'postmatch', 'seasonEnd', 'seasonAwards', 'careerEnd', 'nationalCallup', 'proTransition', 'clubPresentation']) {
        await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(300);
        const r = await page.evaluate(x => window.__CPM_CAREER.goScreen(x), sc); if (r !== true) { mancanti.push('sch-' + sc); continue; } await sleep(1000);
        const len = await page.evaluate(() => (document.body.innerText || '').trim().length); if (len < 20) { mancanti.push('sch-' + sc + ' (vuota)'); }
        await M(page, 'sch-' + sc); await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(400); }
    }
    await ctx.close();
  }
  salvaDati(`schermate-${f.k}-${club}.json`, { R, mancanti, errs, ms: Date.now() - t0 });
  console.log(`  mancanti: ${JSON.stringify(mancanti)} · errori: ${errs.length} · ${Math.round((Date.now() - t0) / 1000)} s`);
}
await b.close(); srv.close();
