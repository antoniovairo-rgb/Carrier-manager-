#!/usr/bin/env node
/* [collaudo grafico 180 · richiesta PO 06/11] CENSIMENTO della PARTITA di carriera, per formato e per club (la squadra dell'eroe prende il
   colore e la sigla del club di prova, nome del giocatore lungo). Fasi: pre-partita, formazioni, ingresso, gioco 2D (pannello chiuso e aperto),
   pausa, highlight (intro, scelta, esito), rigori, festa, fine partita e cio' che segue. GLB spento (si misura la presentazione).
   Uso: C180_FORMATI=... C180_CLUB=... ; foto in docs/collaudo-grafico/180/. Non tocca src/. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, INIT, SAVE, entraInCarriera } from './c178-graf-lib.mjs';
import { scelti, scelteClub, saveDi, preparaCalendario, misura180, salvaDati, premi, ROSSI, SOLO } from './c180-lib.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const fase = p => p.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null);
const aspettaFase = async (p, rx, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const f = await fase(p); if (f && rx.test(f)) return f; await sleep(250); } return null; };
for (const f of scelti()) for (const club of scelteClub()) {
  const R = {}, errs = [], mancanti = [], t0 = Date.now(); console.log(`\n=== partita ${f.nome} · club ${club}`);
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: ROSSI, save: saveDi(SAVE, club) });
  const M = async (sch, o) => { if (SOLO && !SOLO.test(sch)) return null; return misura180(page, f, sch, club, R, { vivo: true, noFondo: true, fermaMs: 1500, ...(o || {}) }); };
  const passo = async (nome, fn) => { try { await fn(); } catch (e) { mancanti.push(nome + ': ' + String(e.message).slice(0, 80)); } };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    /* carriera vera del club di prova (Premier, calendario generato dal gioco): la squadra in campo e' quella del club */
    if (!(await entraInCarriera(page, errs))) throw new Error('carriera non aperta');
    const cal = await preparaCalendario(page, saveDi(SAVE, club)); if (!cal.md) throw new Error('nessuna gara: ' + JSON.stringify(cal));
    for (let i = 0; i < 4; i++) { await page.evaluate(() => window.__CPM_CAREER.dismiss()); const ov = await page.evaluate(() => { for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (c.position === 'fixed' && (parseInt(c.zIndex) || 0) >= 50 && e.getBoundingClientRect().width * e.getBoundingClientRect().height > 0.5 * innerWidth * innerHeight && e.querySelector('button')) { const b = [...e.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0); if (b[0]) { b[0].click(); return true; } } } return false; }); if (!ov) break; await sleep(700); }
    await passo('conferenza', async () => { const r = await page.evaluate(() => window.__CPM_CAREER.playMatch(true)); await sleep(1500); if (await fase(page)) return; await M('conferenza-prepartita', { noFondo: false }); });
    if (!(await fase(page))) { await page.evaluate(() => window.__CPM_CAREER.dismiss()); await page.evaluate(() => window.__CPM_CAREER.playMatch()); }
    await aspettaFase(page, /./, 30000); await sleep(1200);
    await passo('prepartita', async () => { await M('prepartita'); });
    await premi(page, 'Vedi le formazioni'); await sleep(1500); await passo('formazioni', async () => { if (/formations/.test(await fase(page) || '')) await M('formazioni'); else mancanti.push('formazioni (fase ' + await fase(page) + ')'); });
    await page.keyboard.press('Enter'); await sleep(1200); if (/formations/.test(await fase(page) || '')) { await page.keyboard.press('Enter'); await sleep(1200); }
    await passo('ingresso', async () => { if (/walkout/.test(await fase(page) || '')) await M('ingresso'); else mancanti.push('ingresso (fase ' + await fase(page) + ')'); });
    for (let i = 0; i < 40; i++) { const ok = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Salta ingresso/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; }); if (ok) break; await sleep(500); }
    await aspettaFase(page, /^playing$/, 60000);
    /* gli highlight di calendario cominciano gia' al 4' nella gara professionistica: si spengono per fotografare la 2D (quelli forzati dopo restano) */
    await page.evaluate(() => window.__CPM_SET_NUMHL && window.__CPM_SET_NUMHL(0)); await sleep(800);
    const pann = () => page.evaluate(() => { const li = document.querySelector('[data-cpm="linguette918"]'); return li ? li.children.length > 1 : null; });
    const freccia = () => page.evaluate(() => { const li = document.querySelector('[data-cpm="linguette918"]'); if (li) [...li.querySelectorAll('button')].pop().click(); });
    /* il minuto torna a 1 prima di ogni scatto: l'highlight in calendario (gia' al 4') non cade dentro la foto */
    const uno = () => page.evaluate(() => window.__CPM_SALTA297 && window.__CPM_SALTA297(1));
    await passo('2d', async () => { if (await pann()) { await freccia(); await sleep(400); } await uno(); await M('partita2d-chiuso', { fermaMs: 300 }); await uno(); await freccia(); await sleep(500); await M('partita2d-pagelle', { fermaMs: 300 });
      await uno(); await page.evaluate(() => { const li = document.querySelector('[data-cpm="linguette918"]'); const x = li && [...li.querySelectorAll('button')].find(q => /Statistiche/.test(q.textContent || '')); if (x) x.click(); }); await sleep(400); await M('partita2d-statistiche', { fermaMs: 300 }); await uno(); });
    await passo('pausa', async () => { await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => (q.textContent || '').trim() === '⏸'); if (x) x.click(); }); await sleep(600); await M('pausa');
      await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => (q.textContent || '').trim() === '▶' || /riprend/i.test(q.textContent || '')); if (x) x.click(); else document.body.click(); }); await sleep(500); });
    /* highlight: una scena d'attacco (tiro) forzata, poi la scelta e l'esito (gol) */
    const gi = await page.evaluate(() => { const i = SITUATIONS.findIndex(s => s.type !== 'def' && (s.actions || []).some(a => /tir|calci/i.test(a.label || ''))); return i < 0 ? 0 : i; });
    await passo('hl', async () => { await page.evaluate(g => { window.__CPM_FORCE_INTRO = 1; window.__CPM_FORCE_SIT(g, false); }, gi); await sleep(900); await M('hl-intro');
      await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await aspettaFase(page, /hl_choose/, 9000); await sleep(900); await M('hl-scelta');
      await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_FORCE_KIND = 'goal'; window.__CPM_RESOLVE(0); }); const ff = await aspettaFase(page, /hl_result/, 20000); await sleep(1400); await M('hl-esito-gol');
      if (!ff) mancanti.push('hl-esito (fase ' + await fase(page) + ')'); });
    await passo('hl-fallito', async () => { await page.evaluate(g => { delete window.__CPM_FORCE_KIND; window.__CPM_FORCE_SIT(g, true); }, gi); await aspettaFase(page, /hl_choose/, 9000); await sleep(700);
      await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = 'saved'; window.__CPM_RESOLVE(0); }); await aspettaFase(page, /hl_result/, 20000); await sleep(1400); await M('hl-esito-parata'); });
    await passo('festa', async () => { const ok = await page.evaluate(() => window.__CPM_FORCE_CEREMONY && window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI DI LEGA', kind: 'league' })); await sleep(2500); if (ok) await M('festa-titolo'); else mancanti.push('festa'); });
    /* in una gara di campionato __CPM_SO_FORCE porta 1-1 al 90' e chiude: e' il post-partita, non i rigori (che chiedono una gara a eliminazione) */
    await passo('post', async () => { await page.evaluate(() => window.__CPM_SO_FORCE && window.__CPM_SO_FORCE()); await sleep(4500); await M('post-partita', { noFondo: false }); mancanti.push('rigori: non raggiungibili da una gara di campionato'); });
    await passo('fine', async () => { await page.evaluate(() => { delete window.__CPM_FORCE_OUTCOME; delete window.__CPM_FORCE_KIND; }); await page.reload({ waitUntil: 'load' }).catch(() => {}); });
  } catch (e) { mancanti.push('eccezione: ' + String(e.message).slice(0, 120)); }
  await ctx.close();
  salvaDati(`partita-${f.k}-${club}.json`, { R, mancanti, errs, ms: Date.now() - t0 });
  console.log(`  mancanti: ${JSON.stringify(mancanti)} · errori: ${errs.slice(0, 3).join(' | ')} · ${Math.round((Date.now() - t0) / 1000)} s`);
}
await b.close(); srv.close();
