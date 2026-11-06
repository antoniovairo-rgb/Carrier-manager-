#!/usr/bin/env node
/* [collaudo grafico 180 · richiesta PO 06/11] CENSIMENTO della PARTITA di carriera, per formato e per club (la squadra dell'eroe prende il
   colore e la sigla del club di prova, nome del giocatore lungo). Fasi: pre-partita, formazioni, ingresso, gioco 2D (pannello chiuso e aperto),
   pausa, highlight (intro, scelta, esito), rigori, festa, fine partita e cio' che segue. GLB spento (si misura la presentazione).
   Uso: C180_FORMATI=... C180_CLUB=... ; foto in docs/collaudo-grafico/180/. Non tocca src/. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, INIT } from './c178-graf-lib.mjs';
import { scelti, scelteClub, savePartitaDi, misura180, salvaDati, premi } from './c180-lib.mjs';
const SAVEP = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const fase = p => p.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null);
const aspettaFase = async (p, rx, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const f = await fase(p); if (f && rx.test(f)) return f; await sleep(250); } return null; };
for (const f of scelti()) for (const club of scelteClub()) {
  const R = {}, errs = [], mancanti = [], t0 = Date.now(); console.log(`\n=== partita ${f.nome} · club ${club}`);
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: [], save: savePartitaDi(SAVEP, club, null) });
  const M = (sch, o) => misura180(page, f, sch, club, R, { vivo: true, noFondo: true, fermaMs: 1500, ...(o || {}) });
  const passo = async (nome, fn) => { try { await fn(); } catch (e) { mancanti.push(nome + ': ' + String(e.message).slice(0, 80)); } };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(800);
    await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /Continua/.test(x.textContent || '')).click());
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(2000);
    await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500);
    await passo('conferenza', async () => { const r = await page.evaluate(() => window.__CPM_CAREER.playMatch(true)); await sleep(1500); if (await fase(page)) return; await M('conferenza-prepartita', { noFondo: false }); });
    if (!(await fase(page))) { await page.evaluate(() => window.__CPM_CAREER.dismiss()); await page.evaluate(() => window.__CPM_CAREER.playMatch()); }
    await aspettaFase(page, /./, 30000); await sleep(1200);
    await passo('prepartita', async () => { await M('prepartita'); });
    await page.keyboard.press('Enter'); await sleep(1500); await passo('formazioni', async () => { if (/formations/.test(await fase(page) || '')) await M('formazioni'); else mancanti.push('formazioni (fase ' + await fase(page) + ')'); });
    await page.keyboard.press('Enter'); await sleep(1200);
    await passo('ingresso', async () => { if (/walkout/.test(await fase(page) || '')) await M('ingresso'); else mancanti.push('ingresso (fase ' + await fase(page) + ')'); });
    for (let i = 0; i < 40; i++) { const ok = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Salta ingresso/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; }); if (ok) break; await sleep(500); }
    await aspettaFase(page, /^playing$/, 60000); await sleep(800);
    const pann = () => page.evaluate(() => { const li = document.querySelector('[data-cpm="linguette918"]'); return li ? li.children.length > 1 : null; });
    const freccia = () => page.evaluate(() => { const li = document.querySelector('[data-cpm="linguette918"]'); if (li) [...li.querySelectorAll('button')].pop().click(); });
    await passo('2d', async () => { if (await pann()) { await freccia(); await sleep(400); } await M('partita2d-chiuso'); await freccia(); await sleep(500); await M('partita2d-pagelle');
      await page.evaluate(() => { const li = document.querySelector('[data-cpm="linguette918"]'); const x = li && [...li.querySelectorAll('button')].find(q => /Statistiche/.test(q.textContent || '')); if (x) x.click(); }); await sleep(400); await M('partita2d-statistiche'); });
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
    await passo('rigori', async () => { const ok = await page.evaluate(() => window.__CPM_SO_FORCE && window.__CPM_SO_FORCE()); await sleep(4000); if (ok !== false) await M('rigori'); });
    await passo('fine', async () => { await page.evaluate(() => { delete window.__CPM_FORCE_OUTCOME; delete window.__CPM_FORCE_KIND; }); await page.reload({ waitUntil: 'load' }).catch(() => {}); });
  } catch (e) { mancanti.push('eccezione: ' + String(e.message).slice(0, 120)); }
  await ctx.close();
  salvaDati(`partita-${f.k}-${club}.json`, { R, mancanti, errs, ms: Date.now() - t0 });
  console.log(`  mancanti: ${JSON.stringify(mancanti)} · errori: ${errs.slice(0, 3).join(' | ')} · ${Math.round((Date.now() - t0) / 1000)} s`);
}
await b.close(); srv.close();
