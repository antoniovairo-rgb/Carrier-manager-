#!/usr/bin/env node
/* [giro 170 · PO-367] FOTO E MISURE DELLE SCENE 3D DI PARTITA (un solo renderer, src/12). GLB acceso, teatro attivo (__CPM_PRESENT).
   Uso: CPM_FMT=tel|pc [CPM_TOD=night|day|dusk] [CPM_SOLO=gioco,azioni,cerimonia,festa,panchina,ingresso] node giro170-partita.mjs
   Una PAGINA NUOVA per gruppo di scene (lezione 7.483: una pagina stanca non e' il gioco). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { CONTA170, FORMATI, foto, misura, salva } from './giro170-lib.mjs';
const FMT = process.env.CPM_FMT || 'tel', TOD = process.env.CPM_TOD || '', SOLO = (process.env.CPM_SOLO || 'gioco,azioni,cerimonia,festa,panchina,ingresso').split(',');
const sfx = TOD ? '-' + TOD : '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
import fs from 'node:fs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const fase = (page) => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
/* percorso VERO: salvataggio (S12, professionista) → partita → ingresso in campo. fino='walkout' si ferma li'; 'playing' salta l'ingresso. */
async function pagina(opts) { opts = opts || {}; const ctx = await b.newContext({ viewport: FORMATI[FMT], deviceScaleFactor: 2, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  page.on('pageerror', e => console.log('  ⚠ pageerror', String(e.message || e).slice(0, 160)));
  await page.addInitScript(CONTA170); await page.addInitScript(o => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (o.t) window.__CPM_TOD = o.t; window.__CPM_WALK245 = []; window.__CPM_WALKTEST74 = 1; try { localStorage.setItem('cpm-intro-seen', '1'); localStorage.setItem('cpm-v3', JSON.stringify(o.s)); } catch (e) {} }, { t: TOD, s: SAVE });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  for (let k = 0; k < 80; k++) { const p = await fase(page); if (p === 'walkout' || p === 'playing') break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {}); await sleep(700); }
  page._ctx = ctx; if (opts.fino === 'walkout') return page;
  for (let k = 0; k < 120 && (await fase(page)) !== 'playing'; k++) { await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => b.offsetParent !== null && /Salta|Calcio d'inizio|Inizia/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {}); await sleep(600); }
  await page.waitForFunction(() => window.__CPM_GLB_READY === true && typeof window.__CPM_FORCE_SIT === 'function', null, { timeout: 90000 }).catch(() => console.log('  ⚠ GLB non pronto'));
  if (!opts.skipLoadAll) { await page.evaluate(() => window.__CPM_LOAD_ALL()); await sleep(500); }
  await sleep(1200); return page; }
const perf = (page) => page.evaluate(() => ({ r: window.__CPM_RINFO769 ? window.__CPM_RINFO769() : null, f: window.__CPM_FPS907 ? window.__CPM_FPS907() : null, fr: window.__CPM_FRAME480 || null })).catch(() => null);
const prova = async (nome, fn) => { if (!SOLO.includes(nome)) return; console.log('\n== ' + nome + ' ' + FMT + sfx); const t = Date.now(); try { await fn(); } catch (e) { console.log('  ❌ ' + nome + ': ' + String(e.message || e).slice(0, 200)); } console.log('  (' + ((Date.now() - t) / 1000 | 0) + ' s)'); salva('misure-partita.json'); };

await prova('gioco', async () => { const page = await pagina({ skipLoadAll: true });
  await sleep(3000); await foto(page, 'gioco' + sfx, FMT, '1-inizio'); await misura(page, 'gioco' + sfx, FMT, 4000); console.log('  perf', JSON.stringify(await perf(page)));
  await sleep(6000); await foto(page, 'gioco' + sfx, FMT, '2-meta'); await sleep(8000); await foto(page, 'gioco' + sfx, FMT, '3-avanti'); await page._ctx.close(); });

await prova('azioni', async () => { const page = await pagina();
  const fam = await page.evaluate(() => { const o = {}; SITUATIONS.forEach((s, i) => { let t = '?'; try { const h = deriveHL(s, (s.acts || s.actions || [])[0]) || {}; t = h.type || h.hlType || '?'; } catch (e) { t = 'err'; } (o[t] = o[t] || []).push(i); }); return o; });
  console.log('  famiglie', JSON.stringify(Object.fromEntries(Object.entries(fam).map(([k, v]) => [k, v.length + ':' + v.slice(0, 6).join('/')]))));
  for (const [t, L] of Object.entries(fam)) { const gi = L[Math.min(1, L.length - 1)]; const esiti = t === 'shot' ? ['success', 'fail'] : ['success'];
    for (const es of esiti) { const sc = `azione-${t}${es === 'fail' ? '-fallita' : ''}${sfx}`;
      await page.evaluate(e => { delete window.__CPM_FORCE_KIND; window.__CPM_FORCE_OUTCOME = e; }, es);
      await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(2200);
      await foto(page, sc, FMT, '1-scelta', { gi, fr: (await perf(page) || {}).fr });
      await page.evaluate(() => window.__CPM_RESOLVE(0)).catch(() => {}); await sleep(1300);
      await foto(page, sc, FMT, '2-gesto', { gi, fr: (await perf(page) || {}).fr }); await sleep(2600);
      await foto(page, sc, FMT, '3-esito', { gi, fase: await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()) });
      if (t === 'shot' && es === 'success') { await sleep(3000); await foto(page, 'esultanza' + sfx, FMT, '1', { gi, cel: await page.evaluate(() => window.__CPM_CELEB || null).catch(() => null) }); await sleep(3000); await foto(page, 'esultanza' + sfx, FMT, '2'); await misura(page, 'esultanza' + sfx, FMT, 2500); await sleep(1500); await foto(page, 'esultanza' + sfx, FMT, '3'); }
      if (t === 'shot' && es === 'success') { /* misura della scena d'azione a regime */ } } }
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_FORCE_SIT(18, true); }); await sleep(1500); await misura(page, 'azione-scelta' + sfx, FMT, 4000); console.log('  perf', JSON.stringify(await perf(page)));
  await page._ctx.close(); });

await prova('cerimonia', async () => { const page = await pagina();
  await page.evaluate(() => { window.__CPM_CER_HOLD = 1; window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI PREMIER DIVISION', kind: 'league' }); });
  await page.waitForFunction(() => !!window.__CPM_CER425, null, { timeout: 60000 }); const info = await page.evaluate(() => window.__CPM_CER425); console.log('  beat', JSON.stringify(info));
  let acc = 0; for (let i = 0; i < info.beats.length; i++) { const d = info.beatsD[i]; await page.evaluate(t => { window.__CPM_CERT_SET = t; }, acc + d * 0.5); await sleep(3500);
    await foto(page, 'premiazione' + sfx, FMT, `${i + 1}-${info.beats[i]}`); if (info.beats[i] === 'lift') await misura(page, 'premiazione' + sfx, FMT, 3000); acc += d; }
  console.log('  perf', JSON.stringify(await perf(page))); await page._ctx.close(); });

await prova('festa', async () => { const page = await pagina();
  await page.evaluate(() => { window.__CPM_CER_HOLD = 1; }); await page.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'VITTORIA', kind: 'bigwin', light: true, festa: { goals: 2, assists: 1, rb: 18 } }));
  await sleep(4000); await foto(page, 'festa' + sfx, FMT, '1-inizio', { cer: await page.evaluate(() => window.__CPM_CER425 || null) }); await sleep(5000); await foto(page, 'festa' + sfx, FMT, '2-meta'); await misura(page, 'festa' + sfx, FMT, 3000); await sleep(4000); await foto(page, 'festa' + sfx, FMT, '3-avanti'); await page._ctx.close(); });

await prova('panchina', async () => { const page = await pagina({ skipLoadAll: true });
  await page.evaluate(() => window.__CPM_FORCE_BENCH(false)); await sleep(4000); await foto(page, 'panchina' + sfx, FMT, '1-attesa', { g: await page.evaluate(() => window.__CPM_G127 ? window.__CPM_G127() : null).catch(() => null) });
  await misura(page, 'panchina' + sfx, FMT, 3000); await page.evaluate(() => window.__CPM_FORCE_BENCH(true)); await sleep(5000); await foto(page, 'panchina' + sfx, FMT, '2-riscaldamento'); await sleep(6000); await foto(page, 'panchina' + sfx, FMT, '3-avanti'); await page._ctx.close(); });

await prova('ingresso', async () => { const page = await pagina({ fino: 'walkout' });
  const ts = () => page.evaluate(() => { const W = window.__CPM_WALK245 || []; const e = W[W.length - 1]; return e ? +(e.s != null ? e.s : e.t).toFixed(1) : null; }).catch(() => null);
  let i = 0, mis = false; const t0 = Date.now();
  while (Date.now() - t0 < 200000 && (await fase(page)) === 'walkout') { i++; await foto(page, 'ingresso' + sfx, FMT, String(i).padStart(2, '0'), { tScena: await ts(), stacchi: await page.evaluate(() => window.__CPM_CUT285 || 0) });
    if (!mis && i === 2) { mis = true; await misura(page, 'ingresso' + sfx, FMT, 3000); console.log('  perf', JSON.stringify(await perf(page))); } await sleep(5500); }
  console.log('  uscita dalla scena dopo', (Date.now() - t0) / 1000 | 0, 's reali, fase', await fase(page)); await page._ctx.close(); });

await b.close(); srv.close(); console.log('\nFINE giro170-partita ' + FMT + sfx);
