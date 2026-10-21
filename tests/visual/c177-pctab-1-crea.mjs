#!/usr/bin/env node
/* [collaudo PO-292 · 7.999.177] FLUSSO CREAZIONE: home → crea il calciatore → 3 provini giocati (input reali) → offerte → inizio carriera.
   Un formato per volta (C177_FMT=pc1366|pc1920|tabV|tabO). NON modifica il gioco: registra misure e foto. */
import { startServer, launchBrowser, installCdnRoutes, sleep, FORMATI, formatiScelti, nuovoContesto, premiTesto, scatta, salvaLog, log, pilota, bottoniVisibili, testoPagina, fase, tocca } from './c177-pctab-lib.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const [sigla, f] of formatiScelti()) {
  console.log('=== ' + f.nome);
  const { ctx, page, errs } = await nuovoContesto(b, f); await installCdnRoutes(page);
  const nome = 'crea-' + sigla; const T0 = Date.now();
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Nuova carriera/.test(x.textContent || '')), null, { timeout: 90000 });
  await sleep(1000);
  await scatta(page, f, sigla, 'home');
  /* Crediti dalla home */
  if (await premiTesto(page, f, 'Crediti')) { await sleep(900); await scatta(page, f, sigla, 'crediti'); if (!f.touch) await page.keyboard.press('Escape'); await sleep(500); const ancora = await page.evaluate(() => /Crediti/.test(document.body.innerText) && !!document.querySelector('[role=dialog],.modal')); }
  await scatta(page, f, sigla, 'home-dopo-crediti');
  await premiTesto(page, f, '^\\s*Nuova carriera\\s*$'); await sleep(1000);
  await scatta(page, f, sigla, 'crea-1');
  /* apri le due fisarmoniche facoltative */
  await premiTesto(page, f, 'Club dei sogni'); await sleep(500); await premiTesto(page, f, 'Modalità Sfida'); await sleep(500);
  await scatta(page, f, sigla, 'crea-fisarmoniche');
  await page.locator('input[placeholder^="Es."]').scrollIntoViewIfNeeded().catch(() => {});
  const inp = page.locator('input[placeholder^="Es."]'); if (f.touch) await inp.tap(); else await inp.click(); await sleep(300);
  await page.keyboard.type('Mario Prova', { delay: 20 }); await sleep(300);
  await scatta(page, f, sigla, 'crea-nome');
  const ini = await premiTesto(page, f, 'Inizia i provini'); await sleep(1500);
  await scatta(page, f, sigla, 'provino-pre');
  for (let n = 1; n <= 3; n++) {
    await premiTesto(page, f, 'Inizia il provino'); await sleep(1200);
    const r = await pilota(page, f, sigla, `p${n}`, { maxMs: 600000, hlFoto: n === 1 ? 4 : 0, until: async ph => ph === 'ended' });
    console.log(`provino ${n}:`, JSON.stringify({ d: Math.round(r.durataMs / 1000), hl: r.hl.length, fasi: r.fasi.map(x => x.ph).join('>').slice(0, 200) }));
    log.push({ fmt: sigla, nome: `pilota-p${n}`, info: r });
    await sleep(1500);
    /* dopo il fischio: avanti finche' non compare «Inizia il provino» (prossimo) o le offerte */
    for (let k = 0; k < 14; k++) {
      const tx = await testoPagina(page, 160); const bt = await bottoniVisibili(page);
      console.log('  post', k, tx.slice(0, 110), '|', bt.map(b => b.t.slice(0, 16)).slice(0, 6).join(' / '));
      if (k < 6) await scatta(page, f, sigla, `p${n}-post${k}`);
      if (/Inizia il provino/.test(bt.map(b => b.t).join('|')) || /OFFERTE|offert/i.test(tx)) break;
      const c = bt.find(b => /risultati|continua|avanti|prosegui|prossimo|chiudi|vedi risultati|scegli|conferma|vai al/i.test(b.t)) || [...bt].filter(b => b.w > 150 && b.h > 30).sort((a, z) => z.y - a.y)[0]; 
      if (c) await tocca(page, f, c.x + c.w / 2, c.y + c.h / 2); else if (f.touch) await tocca(page, f, f.viewport.width / 2, f.viewport.height * 0.7); else await page.keyboard.press('Enter');
      await sleep(1500);
    }
  }
  /* offerte → scelta del club → inizio carriera */
  await sleep(800); await scatta(page, f, sigla, 'offerte');
  console.log('  offerte bottoni:', (await bottoniVisibili(page)).map(b => `${b.t.slice(0, 20)}@${Math.round(b.w)}x${Math.round(b.h)}`).join(' | ').slice(0, 500));
  if (!f.touch) { await page.keyboard.press('ArrowDown'); await sleep(300); await scatta(page, f, sigla, 'offerte-freccia'); await page.keyboard.press('ArrowUp'); }
  await premiTesto(page, f, 'Scegli'); await sleep(1500);
  for (let k = 0; k < 12; k++) {
    const aCarriera = await page.evaluate(() => !!window.__CPM_CAREER);
    const tx = await testoPagina(page, 200); const bt = await bottoniVisibili(page);
    console.log('  dopo-offerta', k, 'carriera=' + aCarriera, tx.slice(0, 120), '|', bt.map(b => `${b.t.slice(0, 16)}@${Math.round(b.w)}x${Math.round(b.h)}`).slice(0, 7).join(' / '));
    await scatta(page, f, sigla, `inizio-carriera-${k}`);
    if (aCarriera && /Home|Stagione/.test(bt.map(b => b.t).join('|'))) break;
    const c = bt.find(b => /continua|avanti|prosegui|inizia|conferma|firma|accetta|entra|ok|vai|chiudi/i.test(b.t));
    if (c) await tocca(page, f, c.x + c.w / 2, c.y + c.h / 2); else if (f.touch) await tocca(page, f, f.viewport.width / 2, f.viewport.height * 0.7); else await page.keyboard.press('Enter');
    await sleep(1800);
  }
  /* benvenuto: si attraversano le schede con «Avanti →» (tocco/clic) fino alla Home */
  for (let k = 0; k < 8; k++) {
    if (!(await page.evaluate(() => /Benvenuto in Korward Elite|Avanti/.test(document.body.innerText)))) break;
    await scatta(page, f, sigla, `benvenuto-${k}`);
    if (!await premiTesto(page, f, '^\\s*Avanti|Inizia|Comincia|Vai')) break; await sleep(900);
  }
  await sleep(800); await scatta(page, f, sigla, 'home-carriera-nuova');
  console.log('fine provini', (Date.now() - T0) / 1000 | 0, 's; errori:', errs.length, errs.slice(0, 3));
  salvaLog('crea-' + sigla);
  await ctx.close();
}
await b.close(); srv.close();
