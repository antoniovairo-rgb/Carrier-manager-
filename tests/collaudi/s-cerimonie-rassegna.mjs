#!/usr/bin/env node
/* Zona S (collaudo 7.999.155) — rassegna visiva delle cerimonie 3D con GLB ACCESO (window.__CPM_GLB=true).
   Scene: premiazione campionato, premiazione europea (pullman), premiazione nazionale, gala.
   Per ogni scena: 6 fotogrammi a tempo di scena (__CPM_CERT_SET), salvati in docs/collaudi/foto/.
   Raggiungibilita': premiazioni via __CPM_FORCE_CEREMONY; gala via __CPM_CAREER.apriGala. Errori di pagina contati.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node s-cerimonie-rassegna.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FOTO = path.join(REPO, 'docs', 'collaudi', 'foto');
fs.mkdirSync(FOTO, { recursive: true });
const TS = [0.5, 3, 7, 11, 15, 19];
const report = [];

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();

async function scena(nome, kind, fn) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(() => { window.__CPM_GLB = true; });
  let ok = false;
  try { ok = await fn(page); } catch (e) { report.push(`${nome}: ERRORE setup ${String(e.message).slice(0, 120)}`); }
  if (!ok) { report.push(`${nome}: NON RAGGIUNTA (${errs.length} errori di pagina)`); await page.close(); return; }
  await sleep(2500);
  let n = 0;
  for (const t of TS) {
    await page.evaluate(v => { window.__CPM_CERT_SET = v; }, t).catch(() => {});
    await sleep(900);
    await page.screenshot({ path: path.join(FOTO, `s-${nome}-${n}.png`) }).catch(() => {});
    n++;
  }
  report.push(`${nome}: ${n} fotogrammi, errori di pagina ${errs.length}${errs.length ? ' → ' + errs[0] : ''}`);
  await page.close();
}

const SOLO = (process.argv.find(a => a.startsWith('--solo=')) || '').split('=')[1];
for (const [nome, kind] of [['premiazione-campionato', 'league'], ['premiazione-europa', 'euro'], ['premiazione-nazionale', 'int']].filter(([n]) => !SOLO || n === SOLO)) {
  await scena(nome, kind, async (page) => {
    await openMatch(page, port);
    await sleep(2500);
    return page.evaluate(k => !!window.__CPM_FORCE_CEREMONY({ name: 'CERIMONIA COLLAUDO', kind: k }), kind);
  });
}

if (!SOLO || SOLO === 'gala') await scena('gala', null, async (page) => {
  const save = { phase: 'career', player: { name: 'Collaudo Zona S', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 11, week: 39, age: 28, ovr: 93,
    club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
    stats: { 'velocità': 92, tecnica: 93, fisico: 88, 'mentalità': 92, tiro: 94, passaggio: 90, dribbling: 92, posizionamento: 93 }, form: 95, morale: 100, fatigue: 37, popularity: 90, value: 120, bankBalance: 2000000,
    contract: { duration: 3, wage: 120000, expiresAtSeason: 14 } } };
  await page.addInitScript(sv => { try { localStorage.setItem('cpm-v3', JSON.stringify(sv)); } catch (_e) {} }, save);
  await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => {});
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriGala), null, { timeout: 25000 }).catch(() => {});
  return page.evaluate(() => { if (!(window.__CPM_CAREER && window.__CPM_CAREER.apriGala)) return false; window.__CPM_CAREER.apriGala(); return true; });
});

await b.close(); srv.close();
console.log(report.join('\n'));
