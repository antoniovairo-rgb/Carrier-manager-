#!/usr/bin/env node
/* [7.31.1] PROBE — collaudo PO «le notizie sono inventate!»: (1) le NOTIZIE citano la classifica REALE
   (capolista/gap/attacco/difesa dai numeri veri delle standings, mai club a caso); (2) VOCI DI MERCATO:
   la voce personale esce SOLO con transferSaga/listed veri (col club REALE della saga); (3) l'impulso
   «prestito in categoria inferiore» ha una cond: MAI per un titolare affermato; (4) ordine dashboard:
   LA TUA STORIA/saga stanno SOPRA il widget statistiche (subito sotto La tua settimana). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = (patch) => ({ phase: 'career', player: { name: 'News Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: false, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, coachPactSeason: 4, bondEv: { s: 4, w: 11 }, sponsorDecl: { tier: 'tecnico', season: 4 }, matches: 10, goals: 6, assists: 2,
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 68, coachTrust: 66, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 }, ...patch } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1400 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1400);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(1300);
  return page;
};

// (1)+(2) — standings vere costruite in 2 FASI (pattern onda4): pool reale → notizie coerenti coi numeri
{
  const pg0 = await boot(mkSave({}));
  const pool = await pg0.evaluate(() => (JSON.parse(localStorage.getItem('cpm-v3')).player.standings || []).map(s => ({ id: s.id, n: s.n || s.name })));
  await pg0.close();
  if (pool.length < 6) { issues.push('setup: pool standings insufficiente'); }
  else {
    let ps = pool.slice(); if (!ps.some(c => c.id === 'sal')) ps[1] = { id: 'sal', n: 'FC Salernum' };
    const st = ps.map((c, i) => ({ id: c.id, n: c.n, played: 11, pts: 30 - i * 2, gf: 25 - i, ga: 8 + i, gd: 17 - 2 * i, wins: 9 - Math.min(9, i), draws: 2, losses: Math.min(11, i) }));
    st[1].pts = 29; /* lotta al titolo: 2ª a UN punto dalla capolista */
    const leadN = st[0].n, secN = st[1].n;
    const pg = await boot(mkSave({ standings: st, transferSaga: { offer: { wage: 1 }, week: 11, season: 4, club: 'FC Bavaria', tone: 'blinda' } }));
    const body = await pg.evaluate(() => document.body.innerText);
    const newsBlock = (body.match(/NOTIZIE DELLA SETTIMANA[\s\S]{0,600}/i) || [''])[0];
    const hasReal = newsBlock.includes(leadN) || newsBlock.includes(secN) || /miglior attacco|difesa più solida|classifica marcatori|° posto/i.test(newsBlock);
    console.log('(1) notizie derivate (nomi/numeri veri):', hasReal);
    if (!newsBlock) issues.push('card Notizie della Settimana assente');
    if (!hasReal) issues.push('notizie senza riferimenti REALI a classifica/marcatori: ' + newsBlock.slice(0, 180).replace(/\n/g, ' | '));
    const inv = /avrebbe messo gli occhi su di te/i.test(body);
    const sagaLine = /FC Bavaria ha chiesto informazioni su di te/i.test(body);
    console.log('(2) voce personale dalla SAGA vera:', sagaLine, '· template inventato assente:', !inv);
    if (!sagaLine) issues.push('voce personale non citata dal club REALE della saga');
    if (inv) issues.push('voce personale INVENTATA ancora presente');
    await pg.close();
    // senza saga/listed → nessuna voce personale
    const pg2 = await boot(mkSave({ standings: st, popularity: 80, form: 90 }));
    const noPers = await pg2.evaluate(() => !/ha chiesto informazioni su di te|sulla lista di mercato/i.test(document.body.innerText));
    console.log('(2b) senza segnale vero → nessuna voce personale:', noPers);
    if (!noPers) issues.push('voce personale mostrata SENZA segnale di mercato vero');
    await pg2.close();
  }
}
// (3) cond del prestito: titolare affermato → false · giovane riserva → true
{
  const pg = await boot(mkSave({}));
  const r = await pg.evaluate(() => {
    const imp = (typeof WEEKLY_IMPULSES !== 'undefined') && WEEKLY_IMPULSES.find(i => i.id === 'wi_prestito_inverno');
    if (!imp || !imp.cond) return null;
    const starter = { proStatus: 'pro', age: 27, ovr: 77, coachTrust: 85, matches: 15, week: 18, matchHistory: Array.from({ length: 5 }, () => ({ rating: 7 })), squadRole: 'titolare' };
    const youngRes = { proStatus: 'pro', age: 20, ovr: 62, coachTrust: 45, matches: 1, week: 18, matchHistory: [], squadRole: 'riserva' };
    return { starter: imp.cond(starter), young: imp.cond(youngRes) };
  });
  console.log('(3) cond prestito — titolare:', r && r.starter, '· giovane riserva:', r && r.young);
  if (!r) issues.push('impulso wi_prestito_inverno senza cond');
  else { if (r.starter) issues.push('prestito proposto a un TITOLARE affermato'); if (!r.young) issues.push('prestito NEGATO al giovane riserva (cond troppo stretta)'); }
  await pg.close();
}
// (4) ordine dashboard: LA TUA STORIA sopra il widget statistiche (dopo La tua settimana)
{
  const pg = await boot(mkSave({ totalMatches: 80, totalGoals: 40, transferSaga: { offer: { wage: 1 }, week: 12, season: 4 } }));
  const ord = await pg.evaluate(() => {
    const b = document.body.innerText;
    return { iSett: b.search(/LA TUA SETTIMANA/i), iSaga: b.search(/Saga di mercato/i), iStats: b.search(/Presenze/) };
  });
  const ok = ord.iSett >= 0 && ord.iSaga > ord.iSett && ord.iStats > ord.iSaga;
  console.log('(4) ordine (settimana → saga → stats):', ok, JSON.stringify(ord));
  if (!ok) issues.push('la saga di mercato non è tra La tua settimana e il widget statistiche');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ NOTIZIE REALI OK (classifica vera · voce personale solo da saga/lista · cond prestito · storia in alto)');
process.exit(issues.length ? 1 : 0);
