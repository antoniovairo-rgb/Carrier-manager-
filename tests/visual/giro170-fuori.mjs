#!/usr/bin/env node
/* [giro 170 · PO-367] FOTO E MISURE DELLE SCENE 3D FUORI PARTITA (renderer propri: src/16 e src/19) + subentro dalla panchina.
   Uso: CPM_FMT=tel|pc [CPM_SOLO=intro,presentazione,gala,parata,subentro] node giro170-fuori.mjs — una pagina nuova per scena. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { CONTA170, FORMATI, foto, misura, salva } from './giro170-lib.mjs';
const FMT = process.env.CPM_FMT || 'tel', SOLO = (process.env.CPM_SOLO || 'intro,presentazione,gala,parata,subentro').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const URL0 = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const PRO = { id: 'parm', n: 'FC Parmense', a: 'PAR', p: 62, c: '#facc15', c2: '#2563eb', nat: '🇮🇹', lg: 'Lega A' };
const SAVE_U18 = { phase: 'career', player: { name: 'Giro Centosettanta', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 1, age: 16, ovr: 60, tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 1, presidentModalSeason: 1,
  drawSeen: 1, mercatoSeen: 1, coachPactSeason: 1, presentedClub: PRO.id, presentSeason: 1, seasonPledge: { season: 1, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
  stats: { 'velocità': 60, tecnica: 60, fisico: 60, 'mentalità': 60, tiro: 60, passaggio: 60, dribbling: 60, posizionamento: 60 }, form: 70, morale: 70, fatigue: 20, coachTrust: 60, teamChemistry: 60, popularity: 10, bankBalance: 1000,
  goals: 0, assists: 0, matches: 0, totalMatches: 0, totalGoals: 0, matchHistory: [], contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
const SAVE_PRO = { phase: 'career', player: { name: 'Marco Carrasco', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 11, week: 39, age: 28, ovr: 93, club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
  stats: { 'velocità': 92, tecnica: 93, fisico: 88, 'mentalità': 92, tiro: 94, passaggio: 90, dribbling: 92, posizionamento: 93 }, form: 95, morale: 100, fatigue: 37, popularity: 90, value: 120, bankBalance: 2000000, contract: { duration: 3, wage: 120000, expiresAtSeason: 14 } } };
const SAVE_190 = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
async function pagina(save) { const ctx = await b.newContext({ viewport: FORMATI[FMT], deviceScaleFactor: 2, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  page.on('pageerror', e => console.log('  ⚠ pageerror', String(e.message || e).slice(0, 160)));
  await page.addInitScript(CONTA170); await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; try { localStorage.setItem('cpm-intro-seen', '1'); if (s) localStorage.setItem('cpm-v3', JSON.stringify(s)); } catch (e) {} }, save || null);
  await page.goto(URL0, { waitUntil: 'load', timeout: 120000 }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1500); page._ctx = ctx; return page; }
async function carriera(save) { const page = await pagina(save); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1200); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} return page; }
const clic = async (page, t) => { try { await page.getByText(t, { exact: false }).first().click({ timeout: 4000 }); return true; } catch (e) { return false; } };
const prova = async (nome, fn) => { if (!SOLO.includes(nome)) return; console.log('\n== ' + nome + ' ' + FMT); const t = Date.now(); try { await fn(); } catch (e) { console.log('  ❌ ' + nome + ': ' + String(e.message || e).slice(0, 200)); } console.log('  (' + ((Date.now() - t) / 1000 | 0) + ' s)'); salva('misure-fuori.json'); };

await prova('intro', async () => { const page = await pagina(null);
  await page.evaluate(() => { window.__CPM_INTRO115 = {}; window.__CPM_INTRO118 = {}; window.dispatchEvent(new CustomEvent('cpm-replay-intro')); });
  await page.waitForFunction(() => window.__CPM_INTRO118 && window.__CPM_INTRO118.av && window.__CPM_INTRO118.av.hero, null, { timeout: 90000 }).catch(() => console.log('  ⚠ corpi intro non pronti'));
  const el = () => page.evaluate(() => (window.__CPM_INTRO115 || {}).el).catch(() => null); let mis = false;
  for (const [t, n] of [[0, '1-apertura'], [4.5, '2-corsa'], [7, '3-ralenti'], [9.0, '4-tiro'], [10.2, '5-gol'], [13.5, '6-esulta'], [17, '7-chiusura']]) { const t0 = Date.now(); while (Date.now() - t0 < 60000) { const e = await el(); if (e == null || e >= t) break; await sleep(120); }
    await foto(page, 'intro', FMT, n, { el: await el(), chiusa: await page.evaluate(() => (window.__CPM_INTRO115 || {}).chiusa || null) }); if (!mis) { mis = true; await misura(page, 'intro', FMT, 2500); } }
  await page._ctx.close(); });

await prova('presentazione', async () => { const page = await carriera(SAVE_U18);
  for (const bt of [0, 1, 2, 4, 6, 7]) { await page.evaluate(x => window.__CPM_CAREER.apriPresentazione(x), bt); await sleep(bt === 0 ? 5000 : 1600);
    await foto(page, 'presentazione', FMT, `b${bt}-a`, { n: await page.evaluate(() => (window.__CPM_PRES142 && window.__CPM_PRES142.men || []).length).catch(() => null) }); if (bt === 2) await misura(page, 'presentazione', FMT, 2500);
    if (bt >= 2) { await sleep(2200); await foto(page, 'presentazione', FMT, `b${bt}-b`); } }
  await page._ctx.close(); });

await prova('gala', async () => { const page = await carriera(SAVE_PRO);
  await page.evaluate(() => window.__CPM_CAREER.apriGala()); await sleep(3500); await foto(page, 'gala', FMT, '1-apertura'); await misura(page, 'gala', FMT, 2500);
  await clic(page, 'Apri la busta'); await sleep(3500); await foto(page, 'gala', FMT, '2-busta'); let k = 3;
  for (let i = 0; i < 4; i++) { if (!(await clic(page, 'Svela il 3° posto') || await clic(page, 'Svela il 2° posto') || await clic(page, 'E il vincitore è'))) break; await sleep(2600); await foto(page, 'gala', FMT, `${k++}-svela`); }
  await sleep(3000); await foto(page, 'gala', FMT, `${k}-premio`, { tes: await page.evaluate(() => window.__CPM_GALA52 || null) }); await page._ctx.close(); });

await prova('parata', async () => { const page = await pagina(null); await page.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function' || typeof window.__CPM_PARATA_C === 'function', null, { timeout: 60000 });
  await page.evaluate(() => { document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>'; const club = { id: 'sal', n: 'FC Salento', a: 'SAL', p: 72, c: '#f4c20d', c2: '#c0392b', nat: '🇮🇹', lg: 'Lega B' };
    ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C || window.__CPM_PARATA_C, { club, euroWin: false, avatarId: 0, heroNum: 9 })); });
  let prev = 0; for (const [t, n] of [[4, '1-frontale'], [11, '2-laterale'], [18.5, '3-alta'], [26, '4-secondo-giro']]) { await sleep((t - prev) * 1000); prev = t; await foto(page, 'parata', FMT, n, { p: await page.evaluate(() => ({ ...(window.__CPM_PARATA || {}), folla: window.__CPM_FOLLA23 || null })) }); if (n[0] === '1') { await misura(page, 'parata', FMT, 2500); prev += 2.5; } }
  await page._ctx.close(); });

await prova('subentro', async () => { const page = await carriera(SAVE_190); await page.evaluate(() => { try { window.__CPM_CAREER.playMatch(); } catch (e) {} });
  for (let k = 0; k < 120; k++) { if (await page.evaluate(() => typeof window.__CPM_FORCE_BENCH === 'function' && typeof window.__CPM_CLOCK === 'function' && window.__CPM_CLOCK() > 0).catch(() => false)) break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Salta/i.test(b.textContent || '')) || bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua|Calcio d'inizio|Inizia/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {}); await sleep(700); }
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
  const m0 = await page.evaluate(() => (window.__CPM_CLOCK() | 0)); await page.evaluate(m => { window.__CPM_BENCH_MIN = m; window.__CPM_FORCE_BENCH(false); }, m0 + 3); await sleep(1500); await foto(page, 'subentro', FMT, '0-panchina-attesa', { fase: await page.evaluate(() => window.__CPM_PHASE()) });
  await page.waitForFunction(() => { const g = window.__CPM_G127 ? window.__CPM_G127() : null; return g && g.se >= 0; }, null, { timeout: 150000, polling: 100 });
  let i = 0, mis = false; const t0 = Date.now(); while (Date.now() - t0 < 90000 && i < 7) { const g = await page.evaluate(() => { const g = window.__CPM_G127(); return g ? g.se : -1; }); if (!(g >= 0)) break; i++; await foto(page, 'subentro', FMT, `${i}`, { se: +(+g).toFixed(2) }); if (!mis) { mis = true; await misura(page, 'subentro', FMT, 2000); } else await sleep(FMT === 'pc' ? 600 : 1500); }
  await page._ctx.close(); });

await b.close(); srv.close(); console.log('\nFINE giro170-fuori ' + FMT);
