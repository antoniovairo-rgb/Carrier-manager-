#!/usr/bin/env node
/* [7.55.0 ONDA 7 — LA RISONANZA] PROBE — tre sistemi derivati dai fatti, display + micro-effetto bounded:
   (1) mateEcho — «Nello spogliatoio»: un compagno REALE reagisce all'ultima gara; la battuta cambia con l'esito.
   (2) DRIVER_MORALE — valenza del driver: dopo una SCONFITTA (rivincita, -1) «ti pesa»; dopo una gara da 8.1
       (conferma, +2) «ti carica». Mappa NET-NEUTRA e bounded (verificata via hook).
   (3) deriveStances/stanceShift — «Cambio di clima»: una transizione verso stato FORTE fira; baseline uguale no.
   + U18 escluso · determinismo su doppio boot. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mk = (o) => ({ phase: 'career', player: {
  name: 'Risonanza Probe', nation: 'Italia', avatarId: 0, proStatus: o.pro === false ? 'u18' : 'pro',
  season: 3, week: 10, weekLived: false, age: 24, ovr: 76, tutorialDone: true, campDone: true,
  jerseyNumSeason: 3, presidentModalSeason: 3, drawSeen: 3, squadRole: 'titolare',
  coachTrust: o.trust != null ? o.trust : 70, value: 20, popularity: 50, goals: 6, assists: 3, matches: 9,
  matchHistory: [o.last],
  teammates: o.teammates || [{ name: 'Marco Bruno', archetype: 'capitano', icon: '🤝', bond: 45 }],
  standings: o.standings || [],
  seasonObjectives: { position: 9 },
  stanceSeen: o.stanceSeen,
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
  form: 72, morale: 66, fatigue: 12, contract: { duration: 3, wage: 9000, expiresAtSeason: 6 } } });

async function boot(save) {
  const page = await browser.newPage({ viewport: { width: 480, height: 1500 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1400);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  await sleep(500);
  const body = await page.evaluate(() => document.body.innerText);
  const o7 = await page.evaluate(() => !!window.__CPM_ONDA7);
  return { page, body, o7 };
}

const LOSS = { opponent: 'FC Metropoli', rating: 6.0, goals: 0, assists: 0, won: false, drew: false, homeScore: 0, awayScore: 2, week: 9 };
const WIN81 = { opponent: 'FC Aquila', rating: 8.1, goals: 2, assists: 0, won: true, drew: false, homeScore: 3, awayScore: 1, week: 9 };

// (1) SCONFITTA → spogliatoio (capitano, riga di sconfitta) + driver rivincita «ti pesa»
{
  const { page, body, o7 } = await boot(mk({ last: LOSS }));
  if (!o7) issues.push('(1) hook __CPM_ONDA7 assente');
  const spog = /Nello spogliatoio/i.test(body);
  /* [7.178.0] il nome del compagno NON è più asseribile come literal: dal 7.106.3 si mostra il COGNOME e
     syncTeammateNames (migration) riallinea i nomi alla ROSA vera del club → si asserisce che la riga dello
     spogliatoio abbia un nome in grassetto NON vuoto (il compagno reale c'è, qualunque sia). */
  const mateName = await page.evaluate(() => { const h = [...document.querySelectorAll('div')].find(d => /^Nello spogliatoio$/i.test((d.textContent || '').trim())); const row = h && h.nextElementSibling; const b = row && row.querySelector('b'); return !!(b && (b.textContent || '').trim().length >= 2); });
  const capLoss = /Testa alta/i.test(body);
  const pesa = /ti pesa/i.test(body);
  console.log('(1) sconfitta → spogliatoio:', spog, '· compagno:', mateName, '· riga-sconfitta:', capLoss, '· driver "ti pesa":', pesa);
  if (!spog) issues.push('(1) «Nello spogliatoio» assente dopo una gara');
  if (!mateName) issues.push('(1) nome del compagno reale assente');
  if (!capLoss) issues.push('(1) reazione capitano non coerente con la sconfitta');
  if (!pesa) issues.push('(1) valenza driver «ti pesa» assente dopo la sconfitta (rivincita, -1)');
  await page.close();
}

// (2) VITTORIA 8.1 → driver conferma «ti carica» + spogliatoio con riga di vittoria
{
  const { page, body } = await boot(mk({ last: WIN81 }));
  const carica = /ti carica/i.test(body);
  const spog = /Nello spogliatoio/i.test(body);
  console.log('(2) vittoria 8.1 → driver "ti carica":', carica, '· spogliatoio:', spog);
  if (!carica) issues.push('(2) valenza driver «ti carica» assente con voto 8.1 (conferma, +2)');
  if (!spog) issues.push('(2) «Nello spogliatoio» assente');
  await page.close();
}

// (3) CAMBIO DI CLIMA — transizione mister neutro→esempio (coachTrust 90, standings vuote → pres/curva null)
{
  const { page, body } = await boot(mk({ last: WIN81, trust: 90, stanceSeen: { cid: 'sal', pres: null, mister: 'neutro', curva: null } }));
  const clima = /Cambio di clima/i.test(body) && /mister/i.test(body);
  console.log('(3) transizione mister → «Cambio di clima»:', clima);
  if (!clima) issues.push('(3) evento «Cambio di clima» (mister neutro→esempio) non mostrato');
  // logica pura via hook: baseline uguale → nessuna transizione
  const noFire = await page.evaluate(() => {
    const O = window.__CPM_ONDA7; if (!O) return null;
    const p = { proStatus: 'pro', club: { id: 'x' }, coachTrust: 90, standings: [], week: 10 };
    const cur = O.deriveStances(p);
    return O.stanceShift({ ...p, stanceSeen: cur }); // baseline == current → deve essere null
  });
  console.log('(3b) baseline uguale → nessun fire:', noFire === null);
  if (noFire !== null) issues.push('(3b) stanceShift fira anche con baseline uguale (falso positivo)');
  await page.close();
}

// (4) mappa DRIVER_MORALE net-neutra e bounded
{
  const { page } = await boot(mk({ last: WIN81 }));
  const dm = await page.evaluate(() => window.__CPM_ONDA7 && window.__CPM_ONDA7.DRIVER_MORALE);
  const vals = dm ? Object.values(dm) : [];
  const net = vals.reduce((s, v) => s + v, 0);
  const bounded = vals.every(v => v >= -2 && v <= 2);
  console.log('(4) DRIVER_MORALE:', JSON.stringify(dm), '· net:', net, '· bounded ±2:', bounded);
  if (!dm) issues.push('(4) DRIVER_MORALE non esposta');
  if (!bounded) issues.push('(4) DRIVER_MORALE fuori da ±2');
  if (Math.abs(net) > 1) issues.push('(4) DRIVER_MORALE non net-neutra (|net|>1): ' + net);
  await page.close();
}

// (5) U18 → nessun blocco Onda 7
{
  const { page, body } = await boot(mk({ pro: false, last: { opponent: 'U18 X', rating: 7.0, goals: 1, assists: 0, won: true, drew: false, homeScore: 2, awayScore: 0, week: 9 } }));
  const clean = !/Nello spogliatoio/i.test(body) && !/ti carica|ti pesa/i.test(body) && !/Cambio di clima/i.test(body);
  console.log('(5) u18 pulito:', clean);
  if (!clean) issues.push('(5) blocco Onda 7 presente in U18');
  await page.close();
}

// (6) determinismo: doppio boot scenario 1 → stessa battuta compagno
{
  const a = await boot(mk({ last: LOSS })); const la = (a.body.match(/Nello spogliatoio\s*\n([^\n]+)/i) || [])[1] || '';
  await a.page.close();
  const b = await boot(mk({ last: LOSS })); const lb = (b.body.match(/Nello spogliatoio\s*\n([^\n]+)/i) || [])[1] || '';
  await b.page.close();
  console.log('(6) determinismo battuta:', la === lb && !!la);
  if (la !== lb || !la) issues.push('(6) battuta compagno non deterministica o assente');
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ ONDA 7 OK (spogliatoio dai fatti · valenza driver · cambio di clima · net-neutra · u18 escluso · deterministico)');
process.exit(issues.length ? 1 : 0);
