#!/usr/bin/env node
/* [collaudo PO-292 · 7.999.177] SCHEDE DELLA CARRIERA: home con salvataggio → Continua → 7 schede (Home, Stagione, Club, Carriera, Agente, Ufficio, Opzioni)
   con TUTTE le fisarmoniche aperte (tocco/clic sul titolo), pop-up (impulso della settimana, Crediti, conferma elimina), scorciatoie da tastiera su PC,
   salvataggio e ricarica. Salvataggio di prova: fixtures/save-190-s12-ovr93.json. NON modifica il gioco. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, FORMATI, formatiScelti, nuovoContesto, premiTesto, scatta, salvaLog, log, bottoniVisibili, testoPagina, tocca, SHOTS } from './c177-pctab-lib.mjs';
import path from 'node:path';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const URL_ = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
async function apriTutteFisarmoniche(page, f) {
  let n = 0;
  for (let giro = 0; giro < 40; giro++) {
    const h = await page.evaluateHandle(() => [...document.querySelectorAll('button[aria-expanded="false"],summary')].find(e => { if (e.tagName === 'SUMMARY' && e.parentElement.open) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }) || null);
    const el = h.asElement(); if (!el) break;
    await el.scrollIntoViewIfNeeded({ timeout: 1500 }).catch(() => {});
    try { if (f.touch) await el.tap({ timeout: 2500 }); else await el.click({ timeout: 2500 }); } catch (_e) { await el.evaluate(x => x.click()).catch(() => {}); }
    n++; await sleep(150);
  }
  return n;
}
async function pagina(page, f, sigla, nome) {
  /* misura in alto, poi scorre fino in fondo cercando scroll orizzontale */
  const m = await scatta(page, f, sigla, nome);
  const alt = await page.evaluate(() => { const s = document.scrollingElement; return { sh: s.scrollHeight, ch: s.clientHeight, sw: s.scrollWidth, cw: s.clientWidth }; });
  return { m, alt };
}
for (const [sigla, f] of formatiScelti()) {
  console.log('=== ' + f.nome);
  const { ctx, page, errs } = await nuovoContesto(b, f, { fn: s => { try { if (!localStorage.getItem('cpm-v3')) localStorage.setItem('cpm-v3', JSON.stringify(s)); } catch (e) {} }, arg: SAVE });
  await installCdnRoutes(page);
  await page.goto(URL_, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Nuova carriera|Continua/.test(x.textContent || '')), null, { timeout: 90000 });
  await sleep(1200);
  await scatta(page, f, sigla, 'home-salvataggio');
  console.log('  bottoni home:', (await bottoniVisibili(page)).map(b => `${b.t.slice(0, 22)}@${Math.round(b.w)}x${Math.round(b.h)}`).join(' | '));
  /* conferma «Eliminare il salvataggio?» — aprirla e annullare */
  const del = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find(b => /🗑|Elimina/.test((b.textContent || '') + (b.title || '') + (b.getAttribute('aria-label') || '')) && b.getBoundingClientRect().width > 0) || null);
  if (del.asElement()) { const r = await del.asElement().boundingBox(); console.log('  tasto elimina', Math.round(r.width) + 'x' + Math.round(r.height)); log.push({ fmt: sigla, nome: 'elimina-btn', w: r.width, h: r.height });
    await tocca(page, f, r.x + r.width / 2, r.y + r.height / 2); await sleep(700); await scatta(page, f, sigla, 'conferma-elimina');
    if (!f.touch) { await page.keyboard.press('Escape'); await sleep(300); } if (await page.evaluate(() => /Eliminare il salvataggio/.test(document.body.innerText))) await premiTesto(page, f, '^\\s*Annulla\\s*$'); await sleep(500); }
  else console.log('  nessun tasto elimina trovato');
  /* entra in carriera */
  if (!await premiTesto(page, f, 'Continua')) console.log('  !! Continua non trovato');
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).catch(() => {}); await sleep(2500);
  await scatta(page, f, sigla, 'carriera-ingresso');
  console.log('  testo ingresso:', (await testoPagina(page, 260)));
  console.log('  bottoni ingresso:', (await bottoniVisibili(page)).map(b => `${b.t.slice(0, 22)}@${Math.round(b.w)}x${Math.round(b.h)}`).join(' | ').slice(0, 900));
  /* ---- scorciatoie da tastiera (solo PC): M C S R G U e frecce, con verifica della scheda attiva ---- */
  const attiva = () => page.evaluate(() => { const b = [...document.querySelectorAll('button.cpm-tab-act,button[class*="cpm-tab-act"]')].filter(x => x.getBoundingClientRect().width > 0); return b.map(x => (x.textContent || '').trim().replace(/^\W+/, '')).join('|'); });
  const SCHEDE = [['Home', 'M'], ['Stagione', 'C'], ['Club', 'S'], ['Carriera', 'R'], ['Agente', 'G'], ['Ufficio', 'U']];
  const tastiera = [];
  if (!f.touch) {
    for (const [nome, k] of SCHEDE) { await page.keyboard.press(k.toLowerCase()); await sleep(700); tastiera.push({ tasto: k, atteso: nome, attiva: await attiva() }); }
    await page.keyboard.press('m'); await sleep(500);
    const fr = []; for (let i = 0; i < 5; i++) { await page.keyboard.press('ArrowRight'); await sleep(500); fr.push(await attiva()); }
    for (let i = 0; i < 5; i++) { await page.keyboard.press('ArrowLeft'); await sleep(400); fr.push(await attiva()); }
    tastiera.push({ frecce: fr });
    console.log('  tastiera:', JSON.stringify(tastiera));
    log.push({ fmt: sigla, nome: 'tastiera-schede', tastiera });
  }
  /* ---- giro delle schede con le fisarmoniche aperte ---- */
  const scroller = () => page.evaluate(() => { let best = document.scrollingElement, bs = best.scrollHeight - best.clientHeight; for (const e of document.querySelectorAll('div,main,section')) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight - e.clientHeight > bs && e.clientHeight > 200) { best = e; bs = e.scrollHeight - e.clientHeight; } } window.__SCR = best; return { alt: best.scrollHeight, vis: best.clientHeight, doc: best === document.scrollingElement }; });
  const scorri = (y) => page.evaluate(y => { const s = window.__SCR || document.scrollingElement; s.scrollTop = y === 'fine' ? s.scrollHeight : y; return s.scrollTop; }, y);
  const schedaInfo = {};
  for (const [nome] of SCHEDE) {
    const ok = await premiTesto(page, f, '^\\W*' + nome + '\\s*$', 4000); await sleep(1200);
    const nApr = await apriTutteFisarmoniche(page, f); await sleep(500);
    await scorri(0); const sc = await scroller(); await sleep(300);
    await scatta(page, f, sigla, `scheda-${nome}-alto`, `fisarmoniche aperte: ${nApr}`);
    let giri = 0; const tag = [];
    if (sc.alt > sc.vis + 40) { const mid = Math.round((sc.alt - sc.vis) / 2); await scorri(mid); await sleep(400); await scatta(page, f, sigla, `scheda-${nome}-meta`); await scorri('fine'); await sleep(500); await scatta(page, f, sigla, `scheda-${nome}-fondo`); }
    /* l'ultima riga di contenuto deve essere raggiungibile: non coperta dalla barra di navigazione fissa */
    const cop = await page.evaluate(() => { const nav = document.querySelector('.cpm-nav-tabs'); const s = window.__SCR || document.scrollingElement; if (!nav) return null; const nr = nav.getBoundingClientRect(); const els = [...s.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 5 && r.bottom > 0 && e.children.length === 0 && (e.textContent || '').trim(); }); const last = els.sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0]; if (!last) return null; const lr = last.getBoundingClientRect(); return { navTop: Math.round(nr.top), navH: Math.round(nr.height), ultimoBottom: Math.round(lr.bottom), coperto: lr.bottom > nr.top + 2 && nr.height > 0 && nr.width > 0 && nr.top > 100, testo: (last.textContent || '').trim().slice(0, 30) }; });
    schedaInfo[nome] = { navOk: ok, fisarmoniche: nApr, scroll: sc, nav: cop };
    console.log(`  scheda ${nome}: nav=${ok} fisarmoniche=${nApr} alt=${sc.alt}/${sc.vis} fondo=${JSON.stringify(cop)}`);
    await scorri(0);
  }
  log.push({ fmt: sigla, nome: 'schede-info', schedaInfo });
  /* ---- Opzioni ---- */
  await premiTesto(page, f, '^\\W*Opzioni\\s*$', 4000); await sleep(1200);
  const nOp = await apriTutteFisarmoniche(page, f); await scorri(0); await scatta(page, f, sigla, 'opzioni', 'fisarmoniche aperte: ' + nOp);
  { const sc = await scroller(); if (sc.alt > sc.vis + 40) { await scorri('fine'); await sleep(400); await scatta(page, f, sigla, 'opzioni-fondo'); } console.log('  opzioni: fisarmoniche', nOp, 'scroll', JSON.stringify(sc)); }
  console.log('  opzioni bottoni:', (await bottoniVisibili(page)).map(b => `${b.t.slice(0, 18)}@${Math.round(b.w)}x${Math.round(b.h)}`).join(' | ').slice(0, 800));
  if (!f.touch) { await page.keyboard.press('Escape'); await sleep(700); } else { await premiTesto(page, f, '^\\W*(Chiudi|×|✕|Indietro)', 1500); await sleep(600); }
  const impAperto = await page.evaluate(() => /Opzioni/.test(document.body.innerText) && /Silenzia tutto/.test(document.body.innerText));
  console.log('  dopo Esc/chiudi, Opzioni ancora aperte:', impAperto, 'attiva:', await attiva());
  log.push({ fmt: sigla, nome: 'opzioni-chiusura', ancoraAperte: impAperto, viaEsc: !f.touch });
  if (impAperto) { await premiTesto(page, f, '^\\W*(✕|×)\\W*$', 2500); await sleep(700); if (await page.evaluate(() => /Silenzia tutto/.test(document.body.innerText))) { const x = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find(b => /^\s*[✕×]\s*$/.test(b.textContent || '') && b.getBoundingClientRect().width > 0)); if (x.asElement()) { const r = await x.asElement().boundingBox(); await tocca(page, f, r.x + r.width / 2, r.y + r.height / 2); await sleep(600); } } }
  await premiTesto(page, f, '^\\W*Home\\s*$', 3000); await sleep(1000);
  /* ---- pop-up: impulso della settimana (hook solo per aprirlo) ---- */
  const r = await page.evaluate(() => window.__CPM_CAREER.apriImpulso('wi_docufilm')); await sleep(1200);
  console.log('  impulso:', r);
  await scatta(page, f, sigla, 'popup-impulso');
  const bI = await bottoniVisibili(page); console.log('  impulso bottoni:', bI.map(b => `${b.t.slice(0, 24)}@${Math.round(b.w)}x${Math.round(b.h)}`).slice(0, 8).join(' | '));
  const sc1 = bI.filter(b => b.w > 150 && b.h > 28 && !/Home|Stagione|Club|Carriera|Agente|Ufficio|Opzioni|Sostieni|Idee/.test(b.t));
  log.push({ fmt: sigla, nome: 'impulso-bottoni', b: sc1.map(b => ({ t: b.t.slice(0, 30), w: Math.round(b.w), h: Math.round(b.h) })) });
  if (!f.touch) { await page.keyboard.press('Escape'); await sleep(700); const ancora = await page.evaluate(() => /Impulso settimana/i.test(document.body.innerText)); console.log('  impulso: dopo Esc ancora aperto =', ancora); log.push({ fmt: sigla, nome: 'impulso-esc', ancora }); if (ancora && sc1[0]) await tocca(page, f, sc1[0].x + sc1[0].w / 2, sc1[0].y + sc1[0].h / 2); }
  else if (sc1[0]) { await tocca(page, f, sc1[0].x + sc1[0].w / 2, sc1[0].y + sc1[0].h / 2); }
  await sleep(1200); await scatta(page, f, sigla, 'popup-impulso-dopo');
  if (await page.evaluate(() => /Impulso settimana/i.test(document.body.innerText))) { const c = (await bottoniVisibili(page)).find(b => /continua|avanti|ok|chiudi|capito/i.test(b.t)); if (c) { await tocca(page, f, c.x + c.w / 2, c.y + c.h / 2); await sleep(800); } }
  /* ---- conferma «avanzare la settimana» ---- */
  if (!f.touch) { await page.keyboard.press('0'); await sleep(900); } else { await premiTesto(page, f, 'Avanza|Passa alla settimana|Vivi la Settimana', 2500); await sleep(900); }
  await scatta(page, f, sigla, 'popup-settimana');
  console.log('  settimana testo:', (await testoPagina(page, 300)));
  console.log('  settimana bottoni:', (await bottoniVisibili(page)).map(b => `${b.t.slice(0, 24)}@${Math.round(b.w)}x${Math.round(b.h)}`).slice(0, 10).join(' | '));
  for (let k = 0; k < 8; k++) {
    const bt = await bottoniVisibili(page); const tx = await testoPagina(page, 120);
    const c = bt.find(b => /^(continua|avanti|conferma|ok|vai|prosegui|chiudi)|avanza|festeggia/i.test(b.t.replace(/^\W+/, ''))) ;
    if (!c) break; await tocca(page, f, c.x + c.w / 2, c.y + c.h / 2); await sleep(1500); await scatta(page, f, sigla, `popup-settimana-${k + 1}`);
  }
  /* ---- salvataggio e ricarica ---- */
  const pre = await page.evaluate(() => (document.body.innerText.match(/FC [A-Za-zàèéìòù ]+ · [^\n]*St\. \d+ · Sett\. \d+\/38/) || [''])[0]);
  const oPre = await page.evaluate(() => { const m = document.body.innerText.match(/(\d+)\s*\n?\s*OVR/); return m ? m[1] : null; });
  /* si chiudono gli eventuali dialoghi della settimana (il mister, ecc.) come farebbe il giocatore: Esc su PC, «Annulla»/prima risposta su tablet */
  for (let k = 0; k < 6; k++) { const aperto = await page.evaluate(() => /Il mister ti cerca|Annulla|Conferma|Continua/.test(document.body.innerText) && !!document.querySelector('[role=dialog],.cpm-modal,[class*=modal]') ); if (!aperto) break; if (!f.touch) await page.keyboard.press('Escape'); else await premiTesto(page, f, '^\\s*Annulla', 1500); await sleep(600); }
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(500);
  const sv = await premiTesto(page, f, '^\\s*Salva', 3000); await sleep(1000); await scatta(page, f, sigla, 'salvataggio');
  console.log('  salva:', sv, '| pre:', pre, 'OVR', oPre);
  const kv = await page.evaluate(() => { try { return (JSON.parse(localStorage.getItem('cpm-v3')) || {}).player; } catch (e) { return null; } });
  const preS = kv ? { name: kv.name, week: kv.week, season: kv.season, ovr: kv.ovr } : null;
  await page.reload({ waitUntil: 'load', timeout: 120000 });
  try { await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua|Nuova carriera/.test(x.textContent || '')), null, { timeout: 120000 }); } catch (e) { console.log('  !! dopo la ricarica non compare la home:', (await testoPagina(page, 200))); await scatta(page, f, sigla, 'ricarica-KO'); log.push({ fmt: sigla, nome: 'ricarica-KO', testo: await testoPagina(page, 300) }); }
  await sleep(1200);
  await scatta(page, f, sigla, 'ricarica-home');
  await premiTesto(page, f, 'Continua'); await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).catch(() => {}); await sleep(2500);
  await scatta(page, f, sigla, 'ricarica-carriera');
  const kv2 = await page.evaluate(() => { try { return (JSON.parse(localStorage.getItem('cpm-v3')) || {}).player; } catch (e) { return null; } });
  const postS = kv2 ? { name: kv2.name, week: kv2.week, season: kv2.season, ovr: kv2.ovr } : null;
  console.log('  ricarica: prima', JSON.stringify(preS), 'dopo', JSON.stringify(postS), 'testo:', (await testoPagina(page, 160)));
  log.push({ fmt: sigla, nome: 'salva-ricarica', preS, postS, uguali: JSON.stringify(preS) === JSON.stringify(postS) });
  log.push({ fmt: sigla, nome: 'errori', errs });
  console.log('  errori:', errs.length, errs.slice(0, 3));
  salvaLog('carriera-' + sigla);
  await ctx.close();
}
await b.close(); srv.close();
