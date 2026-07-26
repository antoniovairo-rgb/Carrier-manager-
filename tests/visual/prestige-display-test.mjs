#!/usr/bin/env node
/* [7.207.0 collaudo PO «perché la Salernitana vale solo 2 pallini? ora ha un prestigio più alto»] PROBE sulla
   COERENZA DEL PRESTIGIO MOSTRATO. È la terza volta che affiora la stessa classe di bug: una schermata legge
   `club.p` (il prestigio BASE del database, congelato) invece del prestigio EFFETTIVO (base + clubPrestigeShifts),
   che è quello che governa classifica, simulazione e scheda Club. Qui si verifica il pre-partita: a parità di
   club, alzando lo shift i pallini di prestigio DEVONO aumentare.
   Metodo: stesso save due volte, una con shift 0 e una con shift +24, si contano i pallini pieni della squadra
   dell'eroe nella schermata FORMAZIONI. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

async function pipsWithShift(shift) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript((sh) => {
    window.__CPM_GLB = false;
    const save = { phase: 'career', player: {
      name: 'Pip Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 9, week: 8, age: 26, ovr: 84,
      tutorialDone: true, campDone: true,
      club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
      leagueOverrides: { sal: 'Lega A' }, clubPrestigeShifts: { sal: sh },
      calendar: [{ matchday: 8, week: 8, opponentId: 'mon', opponentName: 'FC Brianzolo', isHome: false, played: false }],
      stats: { 'velocità': 84, tecnica: 85, fisico: 82, 'mentalità': 85, tiro: 86, passaggio: 83, dribbling: 84, posizionamento: 85 },
      form: 76, morale: 74, fatigue: 10, contract: { duration: 3, wage: 60000, expiresAtSeason: 12 } } };
    localStorage.setItem('cpm-v3', JSON.stringify(save));
  }, shift);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
  await sleep(2000);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  await sleep(600);
  const started = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await sleep(1800);
  for (const rx of [/Formazioni/i, /Vai alle formazioni/i, /Continua/i]) {
    try { await page.getByText(rx).first().click({ timeout: 2500 }); await sleep(1200); break; } catch (e) {}
  }
  await sleep(1000);
  /* i pallini sono span tondi di ~6px: i primi 5 sono della squadra di CASA, gli ultimi 5 dell'ospite.
     L'eroe gioca in TRASFERTA in questo save → la sua squadra è la seconda cinquina. */
  const dots = await page.evaluate(() => [...document.querySelectorAll('span')]
    .filter(s => { const st = getComputedStyle(s); return st.borderRadius === '50%' && parseFloat(st.width) > 3 && parseFloat(st.width) < 9; })
    .map(s => getComputedStyle(s).backgroundColor));
  await page.close();
  if (started !== true) issues.push(`shift ${shift}: impossibile entrare in partita (${started})`);
  if (errs.length) issues.push(`shift ${shift}: pageerror ${errs[0]}`);
  const isFilled = c => !/0\.[12]\d?\)/.test(c);
  const hero = dots.slice(5, 10);
  return { total: dots.length, heroFilled: hero.filter(isFilled).length };
}

const a = await pipsWithShift(0);
const b = await pipsWithShift(24);
console.log(`prestigio base 45 (nessuna evoluzione): ${a.heroFilled}/5 pallini · pallini totali trovati ${a.total}`);
console.log(`prestigio effettivo 69 (shift +24):     ${b.heroFilled}/5 pallini · pallini totali trovati ${b.total}`);
if (a.total !== 10 || b.total !== 10) issues.push(`attesi 10 pallini (5 per squadra), trovati ${a.total}/${b.total} — il selettore non ha agganciato la schermata Formazioni`);
if (!(b.heroFilled > a.heroFilled)) issues.push(`il pre-partita IGNORA l'evoluzione del club: ${a.heroFilled} pallini con prestigio 45 e ${b.heroFilled} con prestigio effettivo 69`);

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ PRESTIGIO COERENTE (il pre-partita mostra il prestigio effettivo, non quello congelato del database)');
process.exit(issues.length ? 1 : 0);
