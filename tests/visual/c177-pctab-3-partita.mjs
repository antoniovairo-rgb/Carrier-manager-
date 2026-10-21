#!/usr/bin/env node
/* [collaudo PO-292 · 7.999.177] PARTITA DI CARRIERA INTERA: Home → partita → pre-partita → formazioni → ingresso in campo → 2D + highlight 3D dell'eroe
   (scelte, esito: input reali, tastiera/mouse su PC, tocco su tablet) → fischio finale → festa → post-partita → ritorno alla Home → salvataggio e ricarica.
   Salvataggio di prova: fixtures/save-194-primavera-w38.json (17 anni, Primavera, settimana 38). NON modifica il gioco. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, formatiScelti, nuovoContesto, premiTesto, scatta, salvaLog, log, pilota, fotoFerma, bottoniVisibili, testoPagina, fase, tocca } from './c177-pctab-lib.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/' + (process.env.C177_SAVE || 'save-194-primavera-w38.json'), import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const [sigla, f] of formatiScelti()) {
  console.log('=== ' + f.nome);
  const { ctx, page, errs } = await nuovoContesto(b, f, { fn: s => { try { if (!localStorage.getItem('cpm-v3')) localStorage.setItem('cpm-v3', JSON.stringify(s)); } catch (e) {} }, arg: SAVE });
  await installCdnRoutes(page);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 });
  await sleep(1000);
  await premiTesto(page, f, 'Continua');
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await sleep(600);
  await scatta(page, f, sigla, 'partita-home');
  const bt0 = await bottoniVisibili(page);
  console.log('  bottoni home:', bt0.map(b => `${b.t.slice(0, 24)}@${Math.round(b.w)}x${Math.round(b.h)}`).join(' | ').slice(0, 700));
  /* l'ingresso in partita come lo farebbe il giocatore: pulsante della prossima partita; ripiego sull'hook solo se non c'e' */
  let via = null; let rispFoto = 0;
  for (const rx of ['Gioca vs', 'Gioca la partita', 'Scendi in campo']) { if (await premiTesto(page, f, rx, 2500)) { via = 'pulsante «' + rx + '»'; break; } }
  if (via) { await sleep(1200); await scatta(page, f, sigla, 'partita-prompt'); console.log('  prompt:', (await bottoniVisibili(page)).map(b => `${b.t.slice(0, 24)}@${Math.round(b.w)}x${Math.round(b.h)}`).slice(0, 4).join(' | ')); if (!f.touch) { await page.keyboard.press('Escape'); await sleep(600); const ancora = await page.evaluate(() => /Gioca la partita/.test(document.body.innerText)); log.push({ fmt: sigla, nome: 'prompt-esc', ancoraAperto: ancora }); console.log('  prompt: dopo Esc ancora aperto =', ancora); if (!ancora) { await premiTesto(page, f, 'Gioca vs', 3000); await sleep(1200); } } await premiTesto(page, f, '^\\s*Gioca la partita', 4000); via += ' + «Gioca la partita»'; }
  /* dopo il pulsante possono comparire la conferenza pre-partita o altri dialoghi: si avanza come farebbe il giocatore finche' non c'e' una fase di partita */
  for (let k = 0; k < 24 && !(await fase(page)); k++) {
    await sleep(900); if (await fase(page)) break;
    const ris = page.locator('[data-cpm="risposta24"]');
    if (await ris.count()) { if (!rispFoto) { rispFoto = 1; await scatta(page, f, sigla, 'partita-conferenza'); const bx = await ris.first().boundingBox(); log.push({ fmt: sigla, nome: 'conferenza-risposta', w: Math.round(bx.width), h: Math.round(bx.height) }); } try { if (f.touch) await ris.first().tap({ timeout: 3000 }); else await ris.first().click({ timeout: 3000 }); } catch (e) {} await sleep(1200); continue; }
    const bt = await bottoniVisibili(page); const tx = await testoPagina(page, 140);
    if (k === 0 || k % 3 === 0) { await scatta(page, f, sigla, `partita-pre-dialogo${k}`); console.log('  pre-partita dialogo', k, tx.slice(0, 100), '|', bt.map(b => `${b.t.slice(0, 18)}@${Math.round(b.w)}x${Math.round(b.h)}`).slice(0, 5).join(' / ')); }
    const NAV = /Gioca vs|La tua settimana|Obiettivi|Ultime notizie|Calendario|Sostieni|Idee e|Salva|^\\W*(Home|Stagione|Club|Carriera|Agente|Ufficio|Opzioni)\\W*$/; const c = bt.filter(b => b.w > 140 && b.h >= 36 && b.y > 120 && !NAV.test(b.t)).sort((a, z) => z.y - a.y)[0];
    if (c) await tocca(page, f, c.x + c.w / 2, c.y + c.h / 2); else if (!f.touch) await page.keyboard.press('Enter');
  }
  if (!(await fase(page))) { const r = await page.evaluate(() => window.__CPM_CAREER.playMatch()); via = 'hook playMatch (il pulsante non e\' bastato) → ' + r; await sleep(2500); }
  console.log('  ingresso partita:', via, 'fase:', await fase(page));
  const cont = {};
  const onTick = async (ph, az) => {
    cont[ph] = (cont[ph] || 0) + 1;
    if ((ph === 'walkout' || ph === 'ceremony') && cont[ph] <= 6) { if ([2, 4, 6].includes(cont[ph])) await fotoFerma(page, f, sigla, `partita-${ph}-${cont[ph]}`); await sleep(1500); return 'fatto'; }
    if (ph === 'matchday' && cont[ph] === 1) { /* pre-partita: misure e foto, poi si prosegue */ }
    if (ph === 'formations' && cont[ph] === 1) { /* idem */ }
    return null;
  };
  const r = await pilota(page, f, sigla, 'partita', { maxMs: 1500000, hlFoto: 4, onTick, until: async ph => ph === 'ended' });
  console.log('  partita:', JSON.stringify({ d: Math.round(r.durataMs / 1000), hl: r.hl.length, fine: r.fineFase, blocchi: (r.blocchi || []).length, tastoInutile: (r.tastoInutile || []).length, vel: r.velocita, fasi: r.fasi.map(x => x.ph).join('>').slice(0, 400) }));
  log.push({ fmt: sigla, nome: 'pilota-partita', info: r });
  await sleep(1500);
  /* dopo il fischio: ended → post-partita → ritorno alla Home */
  for (let k = 0; k < 16; k++) {
    const tx = await testoPagina(page, 200); const bt = await bottoniVisibili(page);
    console.log('  post', k, tx.slice(0, 100), '|', bt.map(b => `${b.t.slice(0, 16)}@${Math.round(b.w)}x${Math.round(b.h)}`).slice(0, 6).join(' / '));
    await scatta(page, f, sigla, `partita-post${k}`);
    { const ris2 = page.locator('[data-cpm="risposta24"]'); if (await ris2.count()) { try { if (f.touch) await ris2.first().tap({ timeout: 3000 }); else await ris2.first().click({ timeout: 3000 }); } catch (e) {} await sleep(1500); continue; } }
    if (/Impulso della settimana|Il mister ti cerca|Conferenza|Intervista/i.test(tx)) { const o = bt.filter(b => b.w > 300 && b.h > 40 && b.y > 150 && b.y < 700 && !/Chiudi la stagione|Home|Stagione|Club|Carriera|Agente|Ufficio|Opzioni/.test(b.t))[0]; if (o) { await tocca(page, f, o.x + o.w / 2, o.y + o.h / 2); await sleep(1500); continue; } }
    if (/La tua settimana|Vivi la Settimana|Gioca vs|Chiudi la stagione/.test(bt.map(b => b.t).join('|')) && !/Impulso della settimana|Il mister ti cerca|FISCHIO FINALE/.test(tx)) { console.log('  tornati alla Home della carriera'); break; }
    if (k === 1 || k === 3) { await page.evaluate(() => { for (const e of document.querySelectorAll('*')) { if (e.scrollHeight > e.clientHeight + 40 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)) e.scrollTop = e.scrollHeight; } window.scrollTo(0, document.body.scrollHeight); }); await sleep(600); await scatta(page, f, sigla, `partita-post${k}-fondo`); const b2 = await bottoniVisibili(page); console.log('  post fondo bottoni:', b2.map(b => `${b.t.slice(0, 22)}@${Math.round(b.w)}x${Math.round(b.h)}`).join(' | ').slice(0, 600)); bt.length = 0; b2.forEach(x => bt.push(x)); }
    const c = bt.filter(b => /^\W*(risultati|continua|avanti|prosegui|chiudi|torna|home|conferma|ok\b|vai al|salta|conferenza|intervista|spogliatoio|fine)/i.test(b.t)).sort((a, z) => z.y - a.y)[0] || (k >= 2 ? [...bt].filter(b => b.w > 150 && b.h > 30 && !/›/.test(b.t)).sort((a, z) => z.y - a.y)[0] : null);
    if (c) await tocca(page, f, c.x + c.w / 2, c.y + c.h / 2); else if (f.touch) await tocca(page, f, f.viewport.width / 2, f.viewport.height * 0.8); else await page.keyboard.press('Enter');
    await sleep(1800);
  }
  console.log('errori:', errs.length, errs.slice(0, 3));
  log.push({ fmt: sigla, nome: 'errori-partita', errs });
  salvaLog('partita-' + sigla);
  await ctx.close();
}
await b.close(); srv.close();
