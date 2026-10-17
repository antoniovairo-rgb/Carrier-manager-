#!/usr/bin/env node
/* [PO-270 · giro 51, eccezione zona G concessa dal PO 16/10] GUARDIANO: UN RINNOVO AGGIUNGE DAVVERO GLI ANNI FIRMATI.
   Collaudo carriere L6-bis §3: un rinnovo di 1 anno firmato nell'ultimo anno di contratto lasciava il giocatore svincolato alla
   stagione dopo (29 casi su 29 nelle sintetiche), perche' `_acceptNegoWage` scriveva duration = anni firmati e il cambio stagione
   la scala di uno. Handler VERI (?cpmtest=1), salvataggio sintetico 'cpm-v3' in stagione 2, contratto all'ultimo anno (durata 1).
   Per due durate proposte dal club (1 e 2 anni: la durata e' seedata sul nome, quindi si scelgono due nomi) il guardiano apre
   la scheda Agente, preme «Negozia rinnovo», accetta l'offerta del club, poi avvia la stagione nuova (startNewSeason) e legge il contratto.
   VERDE: dopo la firma durata = 1 + anni firmati; dopo il cambio stagione durata = anni firmati (>=1) e NON svincolato.
   ROSSO: CPM_ROSSO=1 arma window.__CPM_NO_RIN270 → il rinnovo di 1 anno torna a valere zero: il guardiano DEVE uscire 1.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node rinnovo-270.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const save = (name) => ({ phase: 'career', player: { name, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 22, ovr: 72,
  tutorialDone: true, club: CLUB, coachTrust: 85, stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 1, wage: 6000, expiresAtSeason: 3 }, matches: 0, totalMatches: 0, goals: 0, totalGoals: 0,
  matchHistory: [], bankBalance: 0, sessionsThisWeek: 3, yellAccum: 0, seasonCards: { y: 0, r: 0 } } });
const CASI = [['Collaudo Rinnovo A', 1], ['Collaudo Rinnovo C', 2]];// durata proposta = 1+(hashStr(nome|nego|2)%3)
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ko = [];
const contratto = (page) => page.evaluate(() => { const p = (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || {};
  return { season: p.season, duration: p.contract && p.contract.duration, exp: p.contract && p.contract.expiresAtSeason, svincolato: !!p.contractExpired }; });
for (const [nome, anni] of CASI) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, r }) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_RIN270 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: save(nome), r: ROSSO });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(600);
  for (let i = 0; i < 12; i++) { const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length); if (!n) break; await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300); }
  await page.evaluate(() => window.__CPM_CAREER.goTab('agente')); await sleep(600);
  const btn = page.getByText('Negozia rinnovo', { exact: false }).first();
  try { await btn.scrollIntoViewIfNeeded({ timeout: 5000 }); await btn.click({ timeout: 5000 }); } catch (e) { ko.push(`${nome}: pulsante «Negozia rinnovo» non trovato`); if (process.env.CPM_DEBUG) { console.log((await page.evaluate(() => document.body.innerText)).slice(0, 20000)); await page.screenshot({ path: 'out/rin270-debug.png', fullPage: true }); } await ctx.close(); continue; }
  await sleep(500);
  const prop = await page.evaluate(() => { const t = document.body.innerText; const m = t.match(/(\d) ann[oi] · /); return m ? +m[1] : null; });
  try { await page.getByText("Accetta l'offerta del club", { exact: false }).first().click({ timeout: 5000 }); } catch (e) { ko.push(`${nome}: opzione «Accetta l'offerta del club» assente`); await ctx.close(); continue; }
  await sleep(800);
  const firma = await contratto(page);
  const ns = await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await sleep(1500);
  const dopo = await contratto(page);
  console.log(`  ${nome}: proposta ${prop} anni (attesa ${anni}) · dopo la firma ${JSON.stringify(firma)} · stagione nuova (${ns}) ${JSON.stringify(dopo)}`);
  if (prop !== anni) ko.push(`${nome}: la proposta e' di ${prop} anni, il guardiano se ne aspettava ${anni} (seme cambiato: aggiornare CASI)`);
  if (firma.duration !== 1 + anni) ko.push(`${nome}: dopo la firma di ${anni} anni la durata e' ${firma.duration}, attesa ${1 + anni} (stagione in corso + anni firmati)`);
  if (dopo.season !== 3) ko.push(`${nome}: la stagione nuova non e' partita (stagione ${dopo.season})`);
  if (dopo.svincolato || !(dopo.duration >= 1) || dopo.duration !== anni) ko.push(`${nome}: nella stagione dopo il rinnovo di ${anni} anni durata ${dopo.duration}, svincolato ${dopo.svincolato}`);
  if (errs.length) ko.push(`${nome}: pageerror ${errs[0]}`);
  await ctx.close();
}
await b.close(); srv.close();
console.log(`rinnovo-270 · ${ROSSO ? 'ROSSO __CPM_NO_RIN270' : 'verde'}`);
if (ko.length) { ko.forEach(k => console.log('  ✗ ' + k)); console.log('❌ ROSSO'); process.exit(1); }
console.log('✅ VERDE — il rinnovo firmato all\'ultimo anno aggiunge davvero gli anni firmati (1 e 2 anni)'); process.exit(0);
