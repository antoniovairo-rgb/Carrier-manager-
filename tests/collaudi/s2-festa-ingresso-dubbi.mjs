#!/usr/bin/env node
/* Zona S, giro 2 (build 7.999.155 = 729fc8e103a4) — GLB ACCESO (window.__CPM_GLB=true) in tutte le scene.
   FESTA: partita forzata con __CPM_FESTA942_FORCE (stesso aggancio di tests/visual/festa-3d.mjs), fino alla fascia data-cpm="festa47"; 6 fotogrammi.
   INGRESSO: carriera da fixture save-194 (come tests/visual/walkout-fermi-197.mjs), playMatch, __CPM_FORCE_WALKOUT; 6 fotogrammi.
   DUBBI (primo giro): premiazione europa fotogramma 3 (t=11 s) e gala fotogramma 5 (t=19 s), a deviceScaleFactor 2, 3 esecuzioni ciascuno.
   Uso: CPM_FOTO=<cartella foto> CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node s2-festa-ingresso-dubbi.mjs [--solo=festa|ingresso|dubbi] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FOTO = process.env.CPM_FOTO || path.join(REPO, 'docs', 'collaudi', 'foto');
fs.mkdirSync(FOTO, { recursive: true });
const SOLO = (process.argv.find(a => a.startsWith('--solo=')) || '').split('=')[1];
const SAVE = JSON.parse(fs.readFileSync(path.join(REPO, 'tests', 'visual', 'fixtures', 'save-194-primavera-w38.json'), 'utf8'));
const report = [];
const INIZIO = Date.now();
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const sc = { viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 };

async function nuovaPagina(dsf = 1) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: dsf });
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(() => { window.__CPM_GLB = true; });
  return { page, errs };
}

// FESTA — la festa 3D compare solo con VITTORIA (CARRIER-MANAGER-AV.html, _vinta&&(_imp23||_super23)).
// Il nome della partita entra nel seme: si cambia nome finche' una partita finisce con vittoria in casa o fuori.
if (!SOLO || SOLO === 'festa') {
  const tentativi = []; let trovata = false; let errTot = 0;
  for (const nome of ['Festa2', 'Festa3', 'Festa4', 'Festa5', 'Festa6']) {
    if (trovata || Date.now() - INIZIO > 470000) break;
    const { page, errs } = await nuovaPagina();
    await page.addInitScript(() => { window.__CPM_FESTA942_FORCE = { goals: 2, assists: 1, rb: 18 }; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} });
    await openMatch(page, port, { skipLoadAll: true, name: nome });
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
    let fase = null, f47 = false; const t0 = Date.now();
    while (Date.now() - t0 < 200000 && Date.now() - INIZIO < 520000) {
      const v = await page.evaluate(() => ({ f47: !!document.querySelector('[data-cpm="festa47"]'), fase: window.__CPM_PHASE ? window.__CPM_PHASE() : null })).catch(() => ({}));
      fase = v.fase; f47 = !!v.f47;
      if (f47 || fase === 'ended') break;
      await sleep(400);
    }
    const sc = await page.evaluate(() => window.__CPM_SCORE ? window.__CPM_SCORE() : null).catch(() => null);
    tentativi.push(`${nome}: ${sc ? sc.home + '–' + sc.away : '?'} fase=${fase}`);
    errTot += errs.length;
    if (f47) {
      trovata = true;
      for (let i = 0; i < 6; i++) { await sleep(1500); await page.screenshot({ path: path.join(FOTO, `s2-festa-${i}.png`) }).catch(() => {}); }
    }
    await page.close();
  }
  report.push(`festa: ${trovata ? 'RAGGIUNTA (fascia festa47), 6 fotogrammi GLB-ON' : 'NON RAGGIUNTA'} · tentativi ${tentativi.join(' | ')} · errori di pagina ${errTot}`);
}

// INGRESSO IN CAMPO (walkout)
if (!SOLO || SOLO === 'ingresso') {
  const { page, errs } = await nuovaPagina();
  await page.addInitScript(s => { window.__CPM_WALKTEST74 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, SAVE);
  await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => {});
  await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (_e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch()).catch(() => {});
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT());
  let fase = null, n = 0;
  for (let k = 0; k < 40 && n < 6; k++) {
    await sleep(900);
    fase = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null);
    if (fase === 'walkout') { await sleep(1200); await page.screenshot({ path: path.join(FOTO, `s2-ingresso-${n}.png`) }).catch(() => {}); n++; }
  }
  report.push(`ingresso: ${n} fotogrammi in fase walkout (ultima fase=${fase}), errori di pagina ${errs.length}${errs.length ? ' → ' + errs[0] : ''}`);
  await page.close();
}

// DUBBI: premiazione europa f.3 e gala f.5, DSF 2, 3 esecuzioni
if (!SOLO || SOLO === 'dubbi') {
  for (let run = 1; run <= 3; run++) {
    {
      const { page, errs } = await nuovaPagina(2);
      await openMatch(page, port); await sleep(2500);
      const ok = await page.evaluate(() => !!window.__CPM_FORCE_CEREMONY({ name: 'CERIMONIA COLLAUDO', kind: 'euro' })).catch(() => false);
      if (ok) { await sleep(2500); await page.evaluate(() => { window.__CPM_CERT_SET = 11; }); await sleep(900);
        await page.screenshot({ path: path.join(FOTO, `s2-dubbio-europa-f3-run${run}.png`) }).catch(() => {}); }
      report.push(`dubbio europa f.3 esecuzione ${run}: ${ok ? 'fotogramma salvato' : 'NON RAGGIUNTA'}, errori di pagina ${errs.length}`);
      await page.close();
    }
    {
      const { page, errs } = await nuovaPagina(2);
      const save = { phase: 'career', player: { name: 'Collaudo Zona S', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 11, week: 39, age: 28, ovr: 93,
        club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
        stats: { 'velocità': 92, tecnica: 93, fisico: 88, 'mentalità': 92, tiro: 94, passaggio: 90, dribbling: 92, posizionamento: 93 }, form: 95, morale: 100, fatigue: 37, popularity: 90, value: 120, bankBalance: 2000000,
        contract: { duration: 3, wage: 120000, expiresAtSeason: 14 } } };
      await page.addInitScript(sv => { try { localStorage.setItem('cpm-v3', JSON.stringify(sv)); } catch (_e) {} }, save);
      await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => {});
      await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
      await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriGala), null, { timeout: 25000 }).catch(() => {});
      const ok = await page.evaluate(() => { if (!(window.__CPM_CAREER && window.__CPM_CAREER.apriGala)) return false; window.__CPM_CAREER.apriGala(); return true; }).catch(() => false);
      if (ok) { await sleep(2500); await page.evaluate(() => { window.__CPM_CERT_SET = 19; }); await sleep(900);
        await page.screenshot({ path: path.join(FOTO, `s2-dubbio-gala-f5-run${run}.png`) }).catch(() => {}); }
      report.push(`dubbio gala f.5 esecuzione ${run}: ${ok ? 'fotogramma salvato' : 'NON RAGGIUNTA'}, errori di pagina ${errs.length}`);
      await page.close();
    }
  }
}

await b.close(); srv.close();
console.log(report.join('\n'));
