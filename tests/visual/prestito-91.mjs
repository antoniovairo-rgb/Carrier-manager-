/* [7.999.91 bloccante] Guardiano della fine prestito (collaudo Codex carriere 01/10: 10 errori JS
   «Cannot read properties of null (reading 'parentClub')»). Una fine stagione vera con prestito in scadenza:
   nessun errore di pagina e la notifica «Fine prestito — rientri al …» compare. Rosso __CPM_NO_PRESTITO91 (CPM_ROSSO91=1). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO91;
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const TIPI = [['prestito', 0], ['prestito con opzione', 0], ['prestito con obbligo', 0]];
let errori = 0, notifiche = 0, casi = 0;
for (const [tipo, partite] of TIPI) {
  const page = await browser.newPage({ viewport: { width: 414, height: 896 } });
  await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.addInitScript(([rosso, tipo, partite]) => {
    window.__CPM_GLB = false; if (rosso) window.__CPM_NO_PRESTITO91 = 1;
    const madre = { id: 'juve', n: 'Torino Athletic', a: 'TAT', p: 88, c: '#111', c2: '#fff', nat: '🇮🇹', lg: 'Lega A' };
    const save = { phase: 'career', player: { name: 'Test Prestito', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 38, age: 21, ovr: 70, tutorialDone: true, hasAgent: true, bankBalance: 50000, popularity: 30, matches: partite, coachTrust: 40,
      club: { id: 'emp', n: 'Empoli Azzurri', a: 'EMP', p: 70, c: '#06c', c2: '#fff', nat: '🇮🇹', lg: 'Lega A' },
      loan: { type: tipo, parentClubId: 'juve', parentClub: madre, untilSeason: 4, minMatches: 10, parentContract: { duration: 2, wage: 20000, expiresAtSeason: 6 } },
      stats: { 'velocità': 70, tecnica: 70, fisico: 70, 'mentalità': 70, tiro: 70, passaggio: 70, dribbling: 70, posizionamento: 70 },
      calendar: [], standings: [], matchHistory: [], worldMemory: [], contract: { duration: 1, wage: 15000, expiresAtSeason: 4 }, log: [] } };
    localStorage.setItem('cpm-v3', JSON.stringify(save));
  }, [ROSSO, tipo, partite]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER && typeof window.__CPM_CAREER.startNewSeason === 'function', { timeout: 15000 }).catch(() => {});
  await sleep(600);
  const visto = await page.evaluate(async () => { const C = window.__CPM_CAREER; C.startNewSeason(); let v = false;
    for (let i = 0; i < 150; i++) { await new Promise(r => setTimeout(r, 200)); if (/rientri al Torino Athletic/.test(document.body.innerText)) { v = true; break; } } return v; });
  await sleep(500);
  const e = errs.filter(m => /parentClub/.test(m)).length;
  casi++; errori += e; if (visto) notifiche++;
  console.log(`${tipo}: errori parentClub ${e} · notifica «rientri al Torino Athletic» ${visto ? 'sì' : 'no'}`);
  await page.close();
}
await browser.close(); srv.close();
console.log(`casi ${casi} · errori ${errori} · notifiche ${notifiche}`);
if (ROSSO) { const v = errori >= 2; console.log(v ? 'ROSSO OK: il difetto si vede' : 'ROSSO KO'); process.exit(v ? 0 : 1); }
const ok = errori === 0 && notifiche === casi; console.log(ok ? 'VERDE' : 'KO'); process.exit(ok ? 0 : 1);
