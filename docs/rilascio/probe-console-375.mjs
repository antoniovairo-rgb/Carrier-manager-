/* PROBE RILASCIO (punto 4): errori/avvisi di console e pageerror a 375x812 per schermata,
   più scroll orizzontale. Schermate raggiunte con hook (goTab/goScreen/forceInterview) sono
   marcate «via hook» (non sono un percorso utente). La partita usa il flusso reale openMatch. */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
const clickByText = (page, t) => page.getByText(t, { exact: false }).first().click({ timeout: 8000 }).then(() => true).catch(() => false);
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
await installCdnRoutes(page);
const msgs = []; let cur = 'avvio';
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') msgs.push({ s: cur, t: m.type(), x: m.text().slice(0, 180) }); });
page.on('pageerror', e => msgs.push({ s: cur, t: 'pageerror', x: String(e.message).slice(0, 180) }));
const rep = [];
const DIST = /dist/.test(process.env.PROBE_URL || '');
async function shot(label, via) {
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth).catch(() => -1);
  const txt = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240)).catch(() => '');
  rep.push({ label, via, overflowX: ov, n: msgs.filter(m => m.s === label).length, txt });
}
const save = { phase: 'career', player: { name: 'Console Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 70, tutorialDone: true,
  club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } };
// 1) HOME (nessun salvataggio)
cur = 'home';
await page.goto(`http://localhost:${port}/${process.env.PROBE_URL || 'CARRIER-MANAGER-AV.html'}?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500); await shot('home', 'percorso');
// 2) CARRIERA con salvataggio seme (come le altre sonde)
await page.evaluate(s => localStorage.setItem('cpm-v3', JSON.stringify(s)), save);
await page.reload({ waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200);
cur = 'carriera-dashboard';
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
if (!DIST) await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
await sleep(1500); await shot('carriera-dashboard', 'percorso');
const hook = async (label, fn) => { cur = label; await page.evaluate(fn).catch(() => {}); await sleep(1200); await shot(label, 'via hook'); };
const tab = async (label, text) => { cur = label; const ok = await clickByText(page, text); await sleep(1200); await shot(label, ok ? 'percorso (tap «' + text + '»)' : 'NON TROVATA «' + text + '»'); };
if (DIST) {
  await tab('calendario', 'Calendario'); await tab('classifica', 'Classifica'); await tab('carriera-profilo', 'Profilo');
  await tab('agente', 'Agente'); await tab('ufficio', 'Ufficio');
  cur = 'opzioni'; const o2 = await clickByText(page, 'Opzioni'); await sleep(1200); await shot('opzioni', o2 ? 'percorso (voce Opzioni)' : 'NON TROVATA voce Opzioni');
  await page.getByText('✕', { exact: true }).first().click({ timeout: 4000 }).catch(() => {}); await sleep(900);
  for (const l of ['intervista', 'post-partita', 'partita-3d']) { cur = l; rep.push({ label: l, via: 'NON ESEGUITO su dist (nessun hook; partita/intervista richiedono gli hook)', overflowX: '-', n: 0, txt: '' }); }
  console.log('══ CONSOLE 375x812 · DIST · schermate: ' + rep.length + ' ══');
  for (const r of rep) console.log(`  ${r.label.padEnd(18)} [${r.via}] overflowX=${r.overflowX}px · messaggi=${r.n} · testo: «${r.txt}»`);
  console.log('── messaggi ──'); for (const m of msgs) console.log(`  [${m.s}] ${m.t}: ${m.x}`);
  console.log('TOTALE messaggi: ' + msgs.length); await browser.close(); srv.close(); process.exit(0);
}
await hook('calendario', () => window.__CPM_CAREER.goTab('calendar'));
await hook('classifica', () => window.__CPM_CAREER.goTab('standings'));
await hook('carriera-profilo', () => window.__CPM_CAREER.goTab('profile'));
await hook('agente', () => window.__CPM_CAREER.goTab('agente'));
await hook('ufficio', () => window.__CPM_CAREER.goTab('ufficio'));
cur = 'opzioni';
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(800);
const opz = await clickByText(page, 'Opzioni').catch(() => false);
await sleep(1200); await shot('opzioni', opz ? 'percorso (voce Opzioni)' : 'NON TROVATA voce Opzioni');
await page.getByText('✕', { exact: true }).first().click({ timeout: 4000 }).catch(() => {}); await sleep(900);
cur = 'intervista';
await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(400);
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(900);
const rIv = await page.evaluate(() => String(window.__CPM_CAREER.forceInterview('win', false))).catch(e => 'THREW ' + e.message); console.log('  ritorno forceInterview: ' + rIv);
await sleep(2600); const hasBusta = await page.evaluate(() => /Apri la busta/.test(document.body.innerText)); await shot('intervista', hasBusta ? 'via hook (forceInterview): busta VISTA' : 'via hook (forceInterview): busta NON vista');
await page.evaluate(() => window.__CPM_CAREER.dismiss()).catch(() => {}); await sleep(400);
cur = 'post-partita';
const rPm = await page.evaluate(() => String(window.__CPM_CAREER.goScreen('postmatch'))).catch(e => 'THREW ' + e.message); console.log('  ritorno goScreen(postmatch): ' + rPm); await sleep(1500); await shot('post-partita', 'via hook (goScreen)');
// 3) PARTITA reale (flusso utente di openMatch: provino → partita)
cur = 'partita-3d';
await openMatch(page, port, { name: 'ConsoleProbe' }).catch(e => msgs.push({ s: cur, t: 'flusso', x: String(e.message).slice(0, 160) }));
await sleep(4000); await shot('partita-3d', 'percorso (openMatch)');
console.log('══ CONSOLE 375x812 · schermate: ' + rep.length + ' ══');
for (const r of rep) console.log(`  ${r.label.padEnd(18)} [${r.via}] overflowX=${r.overflowX}px · messaggi=${r.n} · testo: «${r.txt}»`);
console.log('── messaggi ──');
for (const m of msgs) console.log(`  [${m.s}] ${m.t}: ${m.x}`);
console.log('TOTALE messaggi error/warning/pageerror: ' + msgs.length);
await browser.close(); srv.close(); process.exit(0);
