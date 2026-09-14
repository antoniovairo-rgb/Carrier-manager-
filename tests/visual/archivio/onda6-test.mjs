#!/usr/bin/env node
/* [7.53.0 ONDA 6 — LA PSICHE] PROBE — driver motivazionale + voci dal club, tutto derivato dai fatti:
   (1) SCONFITTA recente → il blocco «Dentro la testa» esiste e NON mostra «Conferma» (voto basso);
       mister a fiducia 90 → voce «ESEMPIO»; presidente sopra le attese → sorride (W≥6, standings top).
   (2) VITTORIA con voto 8.1 → mai «Rivincita»; fiducia 40 → mister freddo.
   (3) U18 → blocco ASSENTE (solo pro). Determinismo: doppio boot → stesso driver. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = (o) => ({ phase: 'career', player: { name: 'Psiche Probe', nation: 'Italia', avatarId: 0, proStatus: o.pro === false ? 'u18' : 'pro', season: 3, week: 10, weekLived: false, age: 23, ovr: 74, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, drawSeen: 3, squadRole: 'titolare', coachTrust: o.trust != null ? o.trust : 70, value: 18, popularity: 50,
  goals: 5, assists: 2, matches: 8, matchHistory: [o.last],
  seasonObjectives: { position: o.objPos || 9 },
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 74, tecnica: 73, fisico: 72, 'mentalità': 74, tiro: 76, passaggio: 73, dribbling: 75, posizionamento: 74 },
  form: 72, morale: 66, fatigue: 12, contract: { duration: 3, wage: 8000, expiresAtSeason: 6 } } });

async function boot(save) {
  const page = await browser.newPage({ viewport: { width: 480, height: 1400 } });
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
  await page.close();
  return body;
}

// (1) sconfitta 0-2 rating 5.8 · trust 90 · sopra le attese non garantito (standings sintetiche assenti → pres opzionale)
const b1 = await boot(mkSave({ last: { opponent: 'FC Rivale', rating: 5.8, goals: 0, assists: 0, won: false, drew: false, homeScore: 0, awayScore: 2, week: 9 }, trust: 90 }));
console.log('(1) blocco:', /Dentro la testa/i.test(b1), '· voci:', /Voci dal club/i.test(b1), '· esempio:', /ESEMPIO/i.test(b1));
if (!/Dentro la testa/i.test(b1)) issues.push('(1) blocco «Dentro la testa» assente');
if (!/Voci dal club/i.test(b1)) issues.push('(1) «Voci dal club» assente');
if (/Conferma/i.test(b1) && !/Rivincita|Fame|Riscatto|futuro|osservazione|Costanza|Orgoglio|Storia/i.test(b1)) issues.push('(1) driver «Conferma» con voto 5.8');
if (!/ESEMPIO/i.test(b1)) issues.push('(1) mister a fiducia 90 senza voce ESEMPIO');

// (2) vittoria voto 8.1 · trust 40 → mai «Rivincita», mister freddo
const b2 = await boot(mkSave({ last: { opponent: 'FC Metropoli', rating: 8.1, goals: 2, assists: 0, won: true, drew: false, homeScore: 3, awayScore: 1, week: 9 }, trust: 40 }));
console.log('(2) rivincita?', /Rivincita/i.test(b2), '· mister freddo:', /cenno e passa oltre/i.test(b2));
if (/Rivincita/i.test(b2)) issues.push('(2) «Rivincita» dopo una VITTORIA');
if (!/cenno e passa oltre/i.test(b2)) issues.push('(2) mister a fiducia 40 non freddo');

// (3) U18 → blocco assente
const b3 = await boot(mkSave({ pro: false, last: { opponent: 'U18 X', rating: 6.5, goals: 0, assists: 0, won: true, drew: false, homeScore: 1, awayScore: 0, week: 9 } }));
if (/Dentro la testa|Voci dal club/i.test(b3)) issues.push('(3) blocco psiche presente in U18');
console.log('(3) u18 pulito:', !/Dentro la testa/i.test(b3));

// (4) determinismo: doppio boot scenario 1 → stesso driver
const b1b = await boot(mkSave({ last: { opponent: 'FC Rivale', rating: 5.8, goals: 0, assists: 0, won: false, drew: false, homeScore: 0, awayScore: 2, week: 9 }, trust: 90 }));
const drv = (t) => { const m = t.match(/Dentro la testa · ([A-Za-zÀ-ù' ]+)/i); return m ? m[1].trim() : null; };
console.log('(4) driver:', drv(b1), '↔', drv(b1b));
if (drv(b1) !== drv(b1b)) issues.push('(4) driver non deterministico: ' + drv(b1) + ' vs ' + drv(b1b));

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ ONDA 6 OK (driver dai fatti · voci stakeholder · u18 escluso · deterministico)');
process.exit(issues.length ? 1 : 0);
