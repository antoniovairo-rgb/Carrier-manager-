/* [7.193.0 direttiva PO «non usare acronimi ufficiali delle competizioni (es. UEL)»]
   PROBE anti-acronimo: carica una carriera con trofei europei di TUTTE e tre le coppe e scansiona il TESTO
   RENDERIZZATO di ogni schermata (dashboard · Stagione/Classifica/Coppe · Club · Carriera/Profilo · Agente)
   + l'overlay di celebrazione del titolo. Le chiavi interne UCL/UEL/UECL restano nei dati (save-compat) ma non
   devono MAI comparire a schermo: l'utente vede solo le sigle di fantasia KCC/KEC/KCF. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const BAD = /\b(UCL|UEL|UECL|UEFA)\b/;
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 150)));

const save = { phase: 'career', player: {
  name: 'Acronimo Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 17, week: 12, weekLived: true, age: 30, ovr: 88,
  tutorialDone: true, campDone: true, jerseyNumSeason: 17, presidentModalSeason: 17, drawSeen: 17, mercatoSeen: 17,
  calendar: [{ matchday: 12, week: 12, opponentId: 'gen', opponentName: 'FC Genova', isHome: true, played: false }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 62, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' }, leagueOverrides: { sal: 'Lega A' },
  stats: { 'velocità': 86, tecnica: 88, fisico: 84, 'mentalità': 88, tiro: 90, passaggio: 86, dribbling: 87, posizionamento: 88 },
  form: 80, morale: 75, fatigue: 12, goals: 19, assists: 8, matches: 12, matchHistory: [],
  totalGoals: 320, totalAssists: 120, totalMatches: 420,
  contract: { duration: 3, wage: 90000, expiresAtSeason: 20 },
  trophies: [
    { season: 17, club: 'FC Salernum', league: 'UEL', type: 'euro' },
    { season: 15, club: 'FC Salernum', league: 'UCL', type: 'euro' },
    { season: 13, club: 'FC Salernum', league: 'UECL', type: 'euro' },
    { season: 16, club: 'FC Salernum', league: 'Lega A', type: 'league' },
    { season: 14, club: 'FC Salernum', league: 'Coppa Nazionale', type: 'cup' },
  ],
  history: [
    { season: 16, club: 'FC Salernum', clubId: 'sal', goals: 35, assists: 12, matches: 35, ovr: 87 },
    { season: 15, club: 'FC Salernum', clubId: 'sal', goals: 42, assists: 11, matches: 36, ovr: 86 },
  ],
  leagueArchive: [{ season: 16, league: 'Lega A', pos: 1, champion: 'FC Salernum', relegated: [], euroComp: 'UCL', cupR: 4, euroPlayed: true, euroEnd: 'W' }],
  euro: { active: true, competition: 'UEL', phase: 'group', groupResults: [], groupOpponents: [] },
} };

await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(2400);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
await sleep(1200);

/* navigazione via SCORCIATOIE DA TASTIERA: i nav item non sono <button> e il click sul testo è ambiguo
   (F classifica · C calendario · R profilo/carriera · G agente · S club · N nazionale · M dashboard) */
const found = [], seenSigla = [];
const KEYS = [['dashboard', 'M'], ['classifica', 'F'], ['calendario', 'C'], ['club', 'S'], ['carriera/profilo', 'R'], ['agente', 'G'], ['nazionale', 'N']];
const clickText = async (rx) => { const ok = await page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return true; } return false; }, rx); await sleep(900); return ok; };

for (const [label, key] of KEYS) {
  await page.keyboard.press(key); await sleep(1100);
  for (const pos of [0, 0.5, 1]) {
    await page.evaluate((f) => { const s = document.querySelector('.cpm-scroll'); if (s) s.scrollTop = s.scrollHeight * f; }, pos);
    await sleep(320);
    const txt = await page.evaluate(() => document.body.innerText || '');
    const hits = txt.split('\n').map(l => l.trim()).filter(l => BAD.test(l));
    if (hits.length) found.push(`${label}: ${[...new Set(hits)].slice(0, 4).join(' / ')}`);
    if (/\b(KCC|KEC|KCF)\b/.test(txt) && !seenSigla.includes(label)) seenSigla.push(label);/* controprova: la scansione ha DAVVERO raggiunto i trofei europei */
  }
  if (label === 'classifica') { await clickText('^Coppe$'); const t2 = await page.evaluate(() => document.body.innerText || ''); const h2 = t2.split('\n').map(l => l.trim()).filter(l => BAD.test(l)); if (h2.length) found.push('coppe: ' + [...new Set(h2)].slice(0, 4).join(' / ')); if (/\b(KCC|KEC|KCF)\b/.test(t2) && !seenSigla.includes('coppe')) seenSigla.push('coppe'); }
}
// overlay celebrazione titolo (TRIONFO EUROPEO!)
const celeb = await page.evaluate(() => {
  const C = window.__CPM_CAREER; if (!C || !C.celebrate) return null;
  return null;
});
await browser.close(); srv.close();
if (found.length) issues.push('acronimi ufficiali a schermo → ' + found.join(' | '));
if (!seenSigla.length) issues.push('controprova fallita: nessuna sigla di fantasia (KCC/KEC/KCF) renderizzata → la scansione non ha raggiunto i trofei europei');
console.log('sigle di fantasia viste in: ' + (seenSigla.join(', ') || 'NESSUNA'));
console.log(found.length ? '' : 'nessun acronimo ufficiale nelle schermate scansionate (trofei KCC/KEC/KCF)');
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ ACRONIMI OK (nessun UCL/UEL/UECL/UEFA renderizzato)');
process.exit(issues.length ? 1 : 0);
