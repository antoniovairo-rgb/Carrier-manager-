#!/usr/bin/env node
/* [7.16.0] TEST — SETTIMANA 1 VINCOLANTE + WIZARD D'APERTURA (direttiva PO «la prima settimana va guidata,
   sfruttando il tasto Avanza, di volta in volta compare il box di interazione — un wizard fatto bene»):
   (A) a W1 con interazioni pendenti il CTA apre il WIZARD (settimana NON vissuta);
   (B) il wizard serve i passi in ordine (ritiro→presidente→stampa→maglia) e ognuno si risolve nel box;
   (C) schermata finale «Si parte!» → chiusa, il CTA torna a funzionare (nessun wizard);
   (D) W2+ mai gated; (E) harness step() auto-risolve; (F) col girone europeo il wizard include i SORTEGGI. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const groupOpps = [{ id: 'x1', n: 'FC Lusitano', a: 'LUS', p: 78, nat: '🇵🇹' }, { id: 'x2', n: 'SC Flandria', a: 'FLA', p: 71, nat: '🇧🇪' }, { id: 'x3', n: 'FC Anatolia', a: 'ANA', p: 74, nat: '🇹🇷' }];
const egCalW1 = Array.from({ length: 6 }, (_, i) => ({ matchday: 950 + i, week: 21 + i * 2, opponentId: groupOpps[i % 3].id, opponentName: groupOpps[i % 3].n, isHome: i % 2 === 0, played: false, result: null, type: 'euro_group', competition: 'UEL', opponentData: groupOpps[i % 3] }));
const mkSave = (patch) => ({ phase: 'career', player: { name: 'Wiz Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, weekLived: false, age: 22, ovr: 78, tutorialDone: true,
  campDone: false, jerseyNum: 10, jerseyNumSeason: 0, presidentModalSeason: 0, drawSeen: 0,
  seasonObjectives: [{ id: 'goals', label: 'Segna 12 gol in campionato', target: 12, type: 'goals' }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
  form: 70, fatigue: 10, morale: 70, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 }, ...patch } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1100 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  await sleep(1000);
  return page;
};
const clickBtn = (page, rx) => page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return (el.textContent || '').slice(0, 30); } return null; }, rx);
const wizStep = (page) => page.evaluate(() => { const el = [...document.querySelectorAll('div')].find(e => /^Passo \d+ di \d+/.test((e.textContent || '').trim()) && (e.textContent || '').length < 80 && e.offsetParent !== null); return el ? el.textContent.trim() : null; });

// ───── (A)+(B)+(C) wizard completo (senza euro → 4 passi)
{
  const pg = await boot(mkSave({}));
  const pend0 = await pg.evaluate(() => window.__CPM_CAREER.openingPending());
  console.log('(A) pendenti:', JSON.stringify(pend0));
  if (JSON.stringify(pend0) !== JSON.stringify(['ritiro', 'presidente', 'stampa', 'maglia'])) issues.push('ordine/insieme passi inatteso: ' + JSON.stringify(pend0));
  await clickBtn(pg, 'Vivi la Settimana|Vivi la settimana'); await sleep(900);
  let st = await wizStep(pg);
  console.log('(A) wizard:', st);
  if (!st || !/Passo 1 di 4/.test(st) || !/Ritiro/i.test(st)) issues.push('wizard non aperto sul passo 1 (ritiro): ' + st);
  if (await pg.evaluate(() => window.__CPM_CAREER.get().lived)) issues.push('settimana vissuta NONOSTANTE il wizard');
  // passo 1: ritiro (sessione Amichevole)
  await clickBtn(pg, 'Amichevole'); await sleep(900);
  st = await wizStep(pg); console.log('(B) dopo ritiro:', st);
  if (!st || !/Passo 2 di 4/.test(st) || !/Presidente/i.test(st)) issues.push('passo 2 (presidente) non mostrato: ' + st);
  await clickBtn(pg, 'Capito, Presidente'); await sleep(900);
  st = await wizStep(pg); console.log('(B) dopo presidente:', st);
  if (!st || !/Passo 3 di 4/.test(st) || !/stampa/i.test(st)) issues.push('passo 3 (stampa) non mostrato: ' + st);
  await clickBtn(pg, 'Obiettivi chiari, un passo alla volta'); await sleep(900);
  st = await wizStep(pg); console.log('(B) dopo stampa:', st);
  if (!st || !/Passo 4 di 4/.test(st) || !/maglia/i.test(st)) issues.push('passo 4 (maglia) non mostrato: ' + st);
  await clickBtn(pg, 'Tieni #'); await sleep(900);
  const fine = await pg.evaluate(() => /La squadra è al completo/i.test(document.body.innerText));
  console.log('(C) schermata finale:', fine);
  if (!fine) issues.push('schermata finale «squadra al completo» assente');
  await clickBtn(pg, 'Si parte'); await sleep(800);
  const pend1 = await pg.evaluate(() => window.__CPM_CAREER.openingPending());
  if (pend1.length) issues.push('pendenti dopo il wizard: ' + JSON.stringify(pend1));
  await clickBtn(pg, 'Vivi la Settimana|Vivi la settimana'); await sleep(1000);
  const wizAgain = await wizStep(pg);
  if (wizAgain) issues.push('wizard riapparso dopo il completamento: ' + wizAgain);
  await pg.close();
}
// ───── (D) W2 mai gated
{
  const pg = await boot(mkSave({ week: 2 }));
  const pend = await pg.evaluate(() => window.__CPM_CAREER.openingPending());
  console.log('(D) W2 pendenti:', JSON.stringify(pend));
  if (pend.length) issues.push('W2 gated per errore: ' + JSON.stringify(pend));
  await pg.close();
}
// ───── (E) harness: step() auto-risolve poi avanza
{
  const pg = await boot(mkSave({}));
  const s1 = await pg.evaluate(() => window.__CPM_CAREER.step()); await sleep(900);
  const s2 = await pg.evaluate(() => window.__CPM_CAREER.step()); await sleep(900);
  console.log('(E) step:', s1, '→', s2);
  if (s1 !== 'opening-resolved') issues.push('step() non ha auto-risolto: ' + s1);
  if (s2 === 'opening-resolved') issues.push('step() in loop su opening-resolved');
  await pg.close();
}
// ───── (F) con girone europeo → 5 passi, sorteggi inclusi e risolvibili nel wizard
{
  const pg = await boot(mkSave({ euro: { active: true, competition: 'UEL', phase: 'group', pts: 0, groupResults: [], qualified: false, champion: false, eliminated: false, koResults: [], koRound: 0, groupOpponents: groupOpps }, calendar: egCalW1 }));
  const pend = await pg.evaluate(() => window.__CPM_CAREER.openingPending());
  console.log('(F) pendenti con euro:', JSON.stringify(pend));
  if (pend[pend.length - 1] !== 'sorteggi' || pend.length !== 5) issues.push('sorteggi non in coda al wizard: ' + JSON.stringify(pend));
  // risolvi i primi 4 via hook parziale (click-through già coperto in A/B) e i sorteggi NEL wizard
  await pg.evaluate(() => new Promise(res => { window.__CPM_CAREER.dismiss(); setTimeout(res, 300); }));
  await pg.evaluate(() => { const f = window.__CPM_CAREER; f && f.resolveOpening && f.resolveOpening(); });
  await sleep(800);
  const pendAfter = await pg.evaluate(() => window.__CPM_CAREER.openingPending());
  if (pendAfter.length) issues.push('(F) resolveOpening non copre i sorteggi: ' + JSON.stringify(pendAfter));
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ WIZARD SETTIMANA 1 OK (blocco+wizard 4 passi · finale · sblocco · W2 libera · harness · sorteggi)');
process.exit(issues.length ? 1 : 0);
