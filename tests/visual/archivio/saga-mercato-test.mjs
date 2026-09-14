#!/usr/bin/env node
/* [7.17.0] TEST — SAGA DEL MERCATO (favola): la trattativa a puntate sul dashboard.
   (1) d0 → episodio «L'indiscrezione» col nome del club; (2) d1 → «Il pressing dei media» + scelta di tono
   (blinda ⇒ tone persistito + fiducia +2); (3) d≥2 → «L'offerta ufficiale» + «Ascolta l'offerta» apre il
   modal VERO (offerta conservata) e azzera la saga; (4) saga di una stagione precedente → nessuna card. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const OFFER = { club: { id: 'volt', n: 'FC Voltara', a: 'VOL', p: 74, c: '#123f8c', c2: '#ffffff', nat: '🇮🇹', lg: 'Lega A' }, type: 'Trasferimento', wage: 9500, duration: 3, minutaggio: 72, moralBonus: 8, growthBonus: 3 };
const mkSave = (week, saga) => ({ phase: 'career', player: { name: 'Saga Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week, weekLived: false, age: 23, ovr: 79, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, seasonPledge: { season: 3, tone: 'equilibrato' }, drawSeen: 3,
  transferSaga: saga,
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 79, tecnica: 78, fisico: 77, 'mentalità': 79, tiro: 81, passaggio: 78, dribbling: 80, posizionamento: 79 },
  form: 72, fatigue: 10, morale: 70, coachTrust: 60, popularity: 30, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 } } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1100 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(1300);
  return page;
};
const hasTxt = (page, rx) => page.evaluate((x) => new RegExp(x, 'i').test(document.body.innerText), rx);
const clickBtn = (page, rx) => page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return true; } return false; }, rx);

// ───── (1) d0: indiscrezione
{
  const pg = await boot(mkSave(2, { offer: OFFER, week: 2, season: 3, club: OFFER.club.n, tone: null }));
  const ep1 = await hasTxt(pg, "L'indiscrezione") && await hasTxt(pg, 'FC Voltara') && await hasTxt(pg, 'episodio 1 di 3');
  console.log('(1) indiscrezione d0:', ep1);
  if (!ep1) issues.push('episodio 1 (indiscrezione) assente a d0');
  await pg.close();
}
// ───── (2) d1: pressing + scelta «blinda»
{
  const pg = await boot(mkSave(3, { offer: OFFER, week: 2, season: 3, club: OFFER.club.n, tone: null }));
  const ep2 = await hasTxt(pg, 'pressing dei media') && await hasTxt(pg, 'episodio 2 di 3');
  if (!ep2) issues.push('episodio 2 (pressing) assente a d1');
  const ck = await clickBtn(pg, 'Sono concentrato solo sul mio club');
  await sleep(1000);
  const st = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player; return { tone: p.transferSaga && p.transferSaga.tone, trust: p.coachTrust }; });
  console.log('(2) pressing d1: card', ep2, '· click', ck, '·', JSON.stringify(st));
  if (st.tone !== 'blinda') issues.push('tone non persistito dopo la scelta: ' + st.tone);
  if (st.trust !== 62) issues.push(`coachTrust atteso 62 (60+2), trovato ${st.trust}`);
  const conf = await hasTxt(pg, 'Hai blindato la tua posizione');
  if (!conf) issues.push('conferma post-scelta assente');
  await pg.close();
}
// ───── (3) d2: offerta ufficiale → modal vero + saga azzerata
{
  const pg = await boot(mkSave(4, { offer: OFFER, week: 2, season: 3, club: OFFER.club.n, tone: 'blinda' }));
  const ep3 = await hasTxt(pg, "L'offerta ufficiale") && await hasTxt(pg, 'episodio 3 di 3');
  if (!ep3) issues.push('episodio 3 (offerta) assente a d2');
  const ck = await clickBtn(pg, 'Ascolta l');
  await sleep(1200);
  const modal = await hasTxt(pg, 'Offerta: Trasferimento') && await hasTxt(pg, 'Minutaggio stimato');
  const cleared = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); return !s.player.transferSaga; });
  console.log('(3) offerta d2: card', ep3, '· click', ck, '· modal', modal, '· saga azzerata', cleared);
  if (!modal) issues.push('modal offerta VERO non aperto da «Ascolta l\'offerta»');
  if (!cleared) issues.push('transferSaga non azzerata alla consegna');
  await pg.close();
}
// ───── (4) saga stantia (stagione precedente) → nessuna card
{
  const pg = await boot(mkSave(2, { offer: OFFER, week: 20, season: 2, club: OFFER.club.n, tone: null }));
  const anyEp = await hasTxt(pg, 'Saga di mercato');
  console.log('(4) saga stantia:', anyEp);
  if (anyEp) issues.push('card saga mostrata per una saga di stagione precedente');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ SAGA MERCATO OK (indiscrezione · pressing+tono · offerta ufficiale→modal · saga stantia ignorata)');
process.exit(issues.length ? 1 : 0);
