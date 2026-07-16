import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const mkSave = () => ({ phase: 'career', player: { name: 'Scout Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 12, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, seasonPledge: { season: 3, tone: 'equilibrato' }, drawSeen: 3, matches: 8, goals: 5,
  calendar: [{ matchday: 8, week: 12, opponentId: 'inter', opponentName: 'FC Nerazzurri', isHome: true, played: false, result: null, type: 'league' }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 84, tecnica: 83, fisico: 82, 'mentalità': 84, tiro: 86, passaggio: 83, dribbling: 85, posizionamento: 84 },
  form: 76, fatigue: 10, morale: 74, popularity: 55, contract: { duration: 3, wage: 15000, expiresAtSeason: 7 } } });
const page = await browser.newPage({ viewport: { width: 480, height: 1100 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 150)));
await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, mkSave());
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200);

// (1) profilo DETERMINISTICO per club+stagione, diverso tra club
const det = await page.evaluate(() => {
  const sig = p => (p && p.defWeak && p.gkWeak && p.solid) ? (p.defWeak.key + '|' + p.gkWeak.key + '|' + p.solid.key) : 'BAD:' + JSON.stringify(p);
  const c1 = { id: 'inter', n: 'FC Nerazzurri', p: 92 };
  const a = sig(oppMatchProfile(c1, 3)), b = sig(oppMatchProfile(c1, 3));
  const c = sig(oppMatchProfile({ id: 'juve', n: 'Torino Athletic', p: 95 }, 3));
  const d = sig(oppMatchProfile(c1, 4));
  // scan tutti i club per verificare che nessun profilo esca malformato (mai clash testa/aerea)
  let clash = 0, bad = 0;
  for (const cl of (typeof CLUBS !== 'undefined' ? CLUBS : [])) for (const s of [1, 2, 3, 4, 5]) { const pr = oppMatchProfile(cl, s); if (!pr || !pr.defWeak || !pr.gkWeak || !pr.solid) { bad++; continue; } if (pr.defWeak.key === 'header' && pr.solid.key === 'aerial') clash++; }
  return { same: a === b, diffClub: a !== c, seasonVaries: a !== d, clash, bad, a };
});
console.log('(1) determinism:', JSON.stringify(det));
if (!det.same) issues.push('profilo NON deterministico su stesso club+stagione');
if (!det.diffClub) issues.push('profilo identico tra club diversi');
if (det.clash > 0) issues.push('clash testa/aerea in ' + det.clash + ' profili');
if (det.bad > 0) issues.push(det.bad + ' profili malformati');

// (2) scoutActionMod: +0.09 su azione che colpisce il debole, -0.05 sul reparto forte, 0 altrimenti
const mod = await page.evaluate(() => {
  const prof = { defWeak: { key: 'cross', rx: /cross|traversone|fondo|secondo palo|pennell|in mezzo|crossa/i }, gkWeak: { key: 'power', rx: /potent|bordata|sassata|cannonata|di potenza|forte|di prima|secco/i }, solid: { key: 'aerial', rx: /testa|incornata|stacco|cross alto/i } };
  return {
    crossHit: scoutActionMod({ label: 'Cross teso in mezzo', rew: 'assist' }, prof).mod,
    powerHit: scoutActionMod({ label: 'Tiro potente', rew: 'goal' }, prof).mod,
    headerSolid: scoutActionMod({ label: 'Colpo di testa', rew: 'goal' }, prof).mod,
    neutral: scoutActionMod({ label: 'Passaggio semplice', rew: 'keep' }, prof).mod,
  };
});
console.log('(2) mod:', JSON.stringify(mod));
if (mod.crossHit !== 0.09) issues.push('cross non premiato (' + mod.crossHit + ')');
if (mod.powerHit !== 0.09) issues.push('tiro potente non premiato (' + mod.powerHit + ')');
if (mod.headerSolid !== -0.05) issues.push('testa vs reparto forte non penalizzata (' + mod.headerSolid + ')');
if (mod.neutral !== 0) issues.push('azione neutra non a 0 (' + mod.neutral + ')');

// (3) pannello ANALISI DEL MISTER — COME VINCERLA visibile inline nel prematch
const click = (rx) => page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return true; } return false; }, rx);
await click('^CONTINUA'); await sleep(1100);
await click('Vivi la Settimana|Gioca partita|Gioca'); await sleep(1200);
await click('Gioca la partita'); await sleep(1500);
const md = await page.evaluate(() => ({
  panel: /ANALISI DEL MISTER — COME VINCERLA/i.test(document.body.innerText),
  hasTip: /(cross tesi|palle filtranti|dribbling|gioco aereo|tiri potenti|scavetto)/i.test(document.body.innerText),
  formazioni: /Formazioni/i.test(document.body.innerText),
}));
console.log('(3) prematch:', JSON.stringify(md));
if (!md.panel) issues.push('pannello «ANALISI DEL MISTER — COME VINCERLA» assente nel prematch');
if (!md.hasTip) issues.push('nessun consiglio-azione reale mostrato nel prematch');
await page.screenshot({ path: 'out/scout-prematch.png', fullPage: true });

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ SCOUT OK (profilo deterministico · bonus azione · pannello inline)');
process.exit(issues.length ? 1 : 0);
