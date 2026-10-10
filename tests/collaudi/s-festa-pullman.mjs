#!/usr/bin/env node
/* Zona S (collaudo 7.999.155) — FESTA di fine partita e PULLMAN del campionato, GLB ACCESO.
   FESTA: partita forzata (__CPM_FESTA942_FORCE) fino alla fascia data-cpm="festa47", 6 fotogrammi.
   PULLMAN: carriera a settimana 38 con il nostro club primo in classifica; si fa avanzare `__CPM_CAREER.step()`
   fino alla fine stagione (SeasonEndScreen); la parata e' visibile se `window.__CPM_PARATA` esiste. 6 fotogrammi.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node s-festa-pullman.mjs [--solo=festa|pullman] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FOTO = path.join(REPO, 'docs', 'collaudi', 'foto');
fs.mkdirSync(FOTO, { recursive: true });
const SOLO = (process.argv.find(a => a.startsWith('--solo=')) || '').split('=')[1];
const report = [];
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();

async function scatta(page, nome, n) {
  for (let i = 0; i < n; i++) { await sleep(1500); await page.screenshot({ path: path.join(FOTO, `s-${nome}-${i}.png`) }).catch(() => {}); }
}

if (!SOLO || SOLO === 'festa') {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript((glb) => { window.__CPM_GLB = glb; window.__CPM_FESTA942_FORCE = { goals: 2, assists: 1, rb: 18 }; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, process.env.CPM_GLB_OFF !== '1');
  await openMatch(page, port, { skipLoadAll: true, name: 'Festa2' });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
  let trovata = false; const t0 = Date.now();
  let fase = null;
  while (Date.now() - t0 < 600000) {
    const v = await page.evaluate(() => ({ f47: !!document.querySelector('[data-cpm="festa47"]'), f942: !!document.querySelector('[data-cpm="festa942"]') })).catch(() => ({}));
    if (v.f942 && !trovata) { report.push('festa: pannello festa942 visibile (percorso festa pesante)'); await scatta(page, 'festa942', 3); }
    trovata = !!v.f47;
    fase = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null);
    if (trovata) break; await sleep(400);
  }
  if (trovata) { await scatta(page, 'festa', 6); report.push(`festa: 6 fotogrammi, errori di pagina ${errs.length}${errs.length ? ' → ' + errs[0] : ''}`); }
  else report.push(`festa: NON RAGGIUNTA entro 600 s · ultima fase=${fase} · errori di pagina ${errs.length}`);
  await page.close();
}

if (!SOLO || SOLO === 'pullman') {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const me = { id: 'mer', n: 'FC Merseyside' };
  const rivali = ['Rivale A', 'Rivale B', 'Rivale C'].map((n, i) => ({ id: 'r' + i, n, pts: 60 - i * 5, gd: 10 - i, gf: 40, gs: 30, w: 18 - i, d: 6, l: 14, p: 38, played: 38 }));
  const save = { phase: 'career', player: { name: 'Collaudo Pullman', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 11, week: 38, weekLived: true, age: 28, ovr: 93, tutorialDone: true,
    club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
    stats: { 'velocità': 92, tecnica: 93, fisico: 88, 'mentalità': 92, tiro: 94, passaggio: 90, dribbling: 92, posizionamento: 93 }, form: 95, morale: 100, fatigue: 37, popularity: 90, value: 120, bankBalance: 2000000,
    standings: [{ ...me, pts: 95, gd: 40, gf: 80, gs: 40, w: 30, d: 5, l: 3, p: 38, played: 38 }, ...rivali], contract: { duration: 3, wage: 120000, expiresAtSeason: 14 } } };
  await page.addInitScript(sv => { window.__CPM_GLB = true; try { localStorage.setItem('cpm-v3', JSON.stringify(sv)); } catch (e) {} }, save);
  await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => {});
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.step), null, { timeout: 25000 }).catch(() => {});
  let esito = null;
  for (let i = 0; i < 80; i++) {
    esito = await page.evaluate(() => { const c = window.__CPM_CAREER; return c ? { st: c.step(), sc: c.screen() } : null; }).catch(() => null);
    if (esito && esito.sc === 'seasonEnd') break;
    if (esito && esito.sc === 'seasonAwards') { await page.evaluate(() => window.__CPM_CAREER.goScreen('seasonEnd')).catch(() => {}); }
    await sleep(250);
  }
  await sleep(2000);
  const parata = await page.evaluate(() => !!window.__CPM_PARATA).catch(() => false);
  report.push(`pullman: schermata=${esito && esito.sc} · parata=${parata} · ultimo passo=${esito && esito.st}`);
  if (parata) { await scatta(page, 'pullman', 6); report.push(`pullman: 6 fotogrammi, errori di pagina ${errs.length}${errs.length ? ' → ' + errs[0] : ''}`); }
  else report.push(`pullman: NON RAGGIUNTO (errori di pagina ${errs.length}${errs.length ? ' → ' + errs[0] : ''})`);
  await page.close();
}

await b.close(); srv.close();
console.log(report.join('\n'));
