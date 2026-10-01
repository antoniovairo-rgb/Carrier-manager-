/* [7.999.94 PO-175 — collaudo Codex «classifica gol», semi 17 e 35] Guardiano della lega del club dopo promozione/retrocessione.
   Fine stagione vera (startNewSeason) con il club dell'eroe ultimo in Lega A, quindi retrocesso:
   (a) prestito con obbligo che scatta (l'eroe resta nel club retrocesso), (b) prestito che finisce con rientro al club madre
   retrocesso, (c) nessun prestito (controllo). Atteso in tutti: club in «Lega B» e il club presente nella nuova classifica.
   Prima: in (a) e (b) il club teneva la lega vecchia → assente dalla classifica, gol fatti ≠ gol subiti.
   Rosso __CPM_NO_CLASSIFICA94 (CPM_ROSSO94=1). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO94;
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const IDS = [['juve','Torino Athletic'],['inter','FC Nerazzurri'],['milan','AC Rossoneri'],['napoli','FC Partenope'],['roma','FC Capitale'],['lazio','FC Biancoceleste'],['ata','FC Bergamo'],['fio','FC Viola'],['tor','FC Granata'],['bol','FC Felsineo'],['udi','FC Friulano'],['sas','FC Neroverde'],['cag','FC Sardo'],['sam','FC Blucerchiati'],['gen','FC Genova'],['ver','FC Scaligero'],['mon2','FC Brianzolo'],['lec','FC Salento']];
const lec = { id: 'lec', n: 'FC Salento', a: 'SAL', p: 66, c: '#facc15', c2: '#dc2626', nat: '🇮🇹', lg: 'Lega A' };
const ver = { id: 'ver', n: 'FC Scaligero', a: 'SCA', p: 70, c: '#1d4ed8', c2: '#facc15', nat: '🇮🇹', lg: 'Lega A' };
const CASI = [
  ['obbligo', { club: lec, matches: 14, loan: { type: 'prestito con obbligo', parentClubId: 'juve', parentClub: { id: 'juve', n: 'Torino Athletic', lg: 'Lega A', p: 95, nat: '🇮🇹' }, untilSeason: 4, minMatches: 10, parentContract: { duration: 2, wage: 20000, expiresAtSeason: 6 } } }],
  ['rientro', { club: ver, matches: 4, loan: { type: 'prestito', parentClubId: 'lec', parentClub: lec, untilSeason: 4, parentContract: { duration: 2, wage: 20000, expiresAtSeason: 6 } } }],
  ['controllo', { club: lec, matches: 20, loan: null }],
];
let ko = 0, casi = 0;
for (const [nome, extra] of CASI) {
  const page = await browser.newPage({ viewport: { width: 414, height: 896 } });
  await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.addInitScript(([rosso, extra, IDS]) => {
    window.__CPM_GLB = false; if (rosso) window.__CPM_NO_CLASSIFICA94 = 1;
    const standings = IDS.map(([id, n], i) => ({ id, n, p: 38, w: 20 - i, d: 6, l: 12 + i - 6, gf: 60 - i * 2, ga: 30 + i * 2, gd: 30 - i * 4, pts: 80 - i * 3 }));
    const save = { phase: 'career', player: { name: 'Test Classifica', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 38, age: 24, ovr: 74, tutorialDone: true, hasAgent: true, bankBalance: 50000, popularity: 30, coachTrust: 70,
      stats: { 'velocità': 74, tecnica: 74, fisico: 74, 'mentalità': 74, tiro: 74, passaggio: 74, dribbling: 74, posizionamento: 74 },
      calendar: [], standings, matchHistory: [], worldMemory: [], contract: { duration: 3, wage: 15000, expiresAtSeason: 6 }, log: [], ...extra } };
    if (!sessionStorage.getItem('seed94')) { localStorage.setItem('cpm-v3', JSON.stringify(save)); sessionStorage.setItem('seed94', '1'); }/* solo al primo caricamento: la ricarica deve trovare il salvataggio del gioco */
  }, [ROSSO, extra, IDS]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER && typeof window.__CPM_CAREER.startNewSeason === 'function', { timeout: 15000 }).catch(() => {});
  await sleep(600);
  const r = await page.evaluate(async () => { const C = window.__CPM_CAREER; const e0 = C.startNewSeason(); window.__E94 = e0; for (let i = 0; i < 40 && window.__CPM_CAREER.get().season === 3; i++) await new Promise(r => setTimeout(r, 250)); await new Promise(r => setTimeout(r, 500));
    const P = window.__CPM_CAREER.get(); return { e0: window.__E94, scr: C.screen && C.screen(), season: P.season, club: P.club, lg: P.clubLg, inStand: (P.standings || []).some(s => s.id === P.club), n: (P.standings || []).length }; });
  /* La ricarica della pagina non si prova qui: nell'ambiente senza rete le librerie dal CDN non si ricaricano (net::ERR_FAILED), sia con sia senza la correzione. */
  const ok = r.season === 4 && r.lg === 'Lega B' && r.inStand;
  casi++; if (!ok) ko++;
  if (errs.length) console.log('   errori: ' + errs.slice(0, 3).map(e => e.slice(0, 200)).join(' | '));
  console.log(`${nome}: [${r.e0} / ${r.scr}] stagione ${r.season} · club ${r.club} in «${r.lg}» · presente nella classifica (${r.n} squadre): ${r.inStand ? 'sì' : 'NO'} · ${ok ? 'ok' : 'DIFETTO'}${errs.length ? ' · errori ' + errs.length : ''}`);
  await page.close();
}
await browser.close(); srv.close();
console.log(`casi ${casi} · difetti ${ko}`);
if (ROSSO) { const v = ko >= 2; console.log(v ? 'ROSSO OK: il difetto si vede' : 'ROSSO KO'); process.exit(v ? 0 : 1); }
console.log(ko === 0 ? 'VERDE' : 'KO'); process.exit(ko === 0 ? 0 : 1);
