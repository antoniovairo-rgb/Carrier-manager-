#!/usr/bin/env node
/* [PO-167 · giro 29, decisione PO 15/10 «Anticipa solo il backup»] GUARDIANO DELLA COPIA DI RISERVA DEGLI SLOT.
 *
 * Tre prove, sul ramo browser (localStorage) che e' quello del gioco web:
 *   1) RIPRISTINO — un salvataggio riuscito lascia in `cpm-v3-riserva` la versione precedente; corrompendo
 *      `cpm-v3` e ricaricando, la Home propone il ripristino nella finestra standard (data-cpm="riserva-167")
 *      e «Ripristina» rimette nello slot una carriera leggibile.
 *   2) AVVISO — con la quota del localStorage simulata piena, il salvataggio fallisce e il giocatore legge
 *      «Salvataggio non riuscito: la tua carriera è al sicuro nella copia di riserva».
 *   3) NESSUN DATO PERSO — durante il guasto slot e riserva restano quelli dell'ultimo salvataggio riuscito;
 *      tolto il guasto, il salvataggio successivo riparte e porta sul disco lo stato in memoria.
 * Prova del rosso: CPM_ROSSO=1 arma __CPM_NO_BACKUP167 → nessuna riserva, nessuna finestra, vecchio avviso:
 * il guardiano DEVE uscire 1.
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO === '1';
const FRASE = 'Salvataggio non riuscito: la tua carriera è al sicuro nella copia di riserva';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const guasti = []; const esiti = [];
const ok = (cond, msg) => { esiti.push((cond ? '✓ ' : '✗ ') + msg); if (!cond) guasti.push(msg); };

const SAVE = { phase: 'career', player: {
  campDone: true, presidentModalSeason: 4, jerseyNumSeason: 4, drawSeen: 4, mercatoSeen: 4, presentSeason: 4,
  tutorialDone: true, weekLived: true, seasonPledge: { season: 4, tone: 'equilibrato' },
  name: 'Riserva Test', nation: 'Italia', avatarId: 0, age: 22, position: 'ATT', foot: 'R', season: 4, week: 6,
  proStatus: 'pro', ovr: 78,
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 88, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 80, tecnica: 80, fisico: 80, 'mentalità': 80, tiro: 80, passaggio: 80, dribbling: 80, posizionamento: 80 },
  form: 70, morale: 70, fatigue: 10, popularity: 50, value: 20, bankBalance: 1000, goals: 5, assists: 2, matches: 10,
  contract: { duration: 3, wage: 30000, expiresAtSeason: 8 } } };

async function apri() {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  page.on('pageerror', e => guasti.push('pageerror: ' + String(e.message).slice(0, 120)));
  await page.addInitScript(cfg => {
    window.__CPM_GLB = false;
    if (cfg.rosso) window.__CPM_NO_BACKUP167 = 1;
    /* il salvataggio di partenza si semina UNA volta sola: i reload della prova devono trovare il disco com'e' */
    if (!sessionStorage.getItem('seme167')) { sessionStorage.setItem('seme167', '1'); localStorage.setItem('cpm-v3', JSON.stringify(cfg.sv)); }
    /* quota simulata: armabile dalla prova, colpisce ogni chiave degli slot (principale e riserva) */
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (window.__QUOTA167 && /^cpm-v3/.test(k)) { window.__QUOTA167_N = (window.__QUOTA167_N || 0) + 1; throw new DOMException('quota simulata', 'QuotaExceededError'); }
      return orig.call(this, k, v);
    };
  }, { sv: SAVE, rosso: ROSSO });
  await vai(page);
  return { ctx, page };
}
async function vai(page) {
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
}
async function inCarriera(page) {
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  await sleep(2000);
}
const leggi = (page, k) => page.evaluate(k => { try { return JSON.parse(localStorage.getItem(k)).player.bankBalance; } catch (e) { return localStorage.getItem(k) == null ? null : 'illeggibile'; } }, k);
const patch = async (page, v) => { await page.evaluate(v => window.__CPM_CAREER.patch({ bankBalance: v }), v); await sleep(1600); };

/* ── 1) RIPRISTINO DI UNO SLOT CORROTTO ── */
{
  const { ctx, page } = await apri();
  await inCarriera(page);
  await patch(page, 2222);
  const main = await leggi(page, 'cpm-v3'), ris = await leggi(page, 'cpm-v3-riserva');
  ok(main === 2222, `salvataggio normale: slot = ${main} (atteso 2222)`);
  ok(ris === 1000, `prima di sovrascrivere la versione buona va in riserva: riserva = ${ris} (atteso 1000)`);
  /* si esce PRIMA dalla carriera: uscendo, il flush di pagehide (5.75 F0-6) risalva lo stato in memoria e
     cancellerebbe la corruzione. Dalla Home (nessuna carriera montata) la corruzione resta sul disco. */
  await vai(page);
  await page.evaluate(() => localStorage.setItem('cpm-v3', '{"phase":"career","player":{"name":"Ris'));/* scrittura troncata = slot corrotto */
  await vai(page);
  let finestra = false;
  try { await page.waitForSelector('[data-cpm="riserva-167"]', { timeout: 8000 }); finestra = true; } catch (e) {}
  ok(finestra, 'slot corrotto: la Home propone il ripristino nella finestra standard');
  if (finestra) {
    const inRiserva = await leggi(page, 'cpm-v3-riserva');/* uscendo dalla carriera il flush ha risalvato: la riserva e' l'ultima versione buona prima di quel salvataggio */
    ok(typeof inRiserva === 'number', `con lo slot corrotto la riserva e' integra: ${inRiserva}`);
    const testo = await page.locator('[data-cpm="riserva-167-pannello"]').innerText();
    ok(/Riserva Test/.test(testo) && /Stagione 4/.test(testo), 'la finestra dice quale carriera si ripristina');
    await page.locator('[data-cpm="riserva-167-pannello"]').getByText('Ripristina', { exact: true }).click();
    await sleep(1500);
    const dopo = await leggi(page, 'cpm-v3');
    ok(typeof dopo === 'number' && dopo === inRiserva, `dopo «Ripristina» lo slot e' leggibile e uguale alla riserva: ${dopo} (atteso ${inRiserva})`);
    ok(!(await page.locator('[data-cpm="riserva-167"]').count()), 'la finestra si chiude dopo il ripristino');
    try { await inCarriera(page); ok(true, 'la carriera ripristinata si apre'); }
    catch (e) { ok(false, 'la carriera ripristinata si apre: ' + String(e.message).slice(0, 80)); }
  }
  await ctx.close();
}

/* ── 2) + 3) SALVATAGGIO CHE FALLISCE: AVVISO E NESSUN DATO PERSO ── */
{
  const { ctx, page } = await apri();
  await inCarriera(page);
  await patch(page, 2222);
  await page.evaluate(() => { window.__QUOTA167 = true; });
  await page.evaluate(() => window.__CPM_CAREER.patch({ bankBalance: 3333 }));
  let avviso = false;
  try { await page.waitForFunction(f => document.body.innerText.includes(f), FRASE, { timeout: 6000 }); avviso = true; } catch (e) {}
  const nTent = await page.evaluate(() => window.__QUOTA167_N || 0);
  ok(nTent > 0, `la quota simulata ha davvero rifiutato scritture (${nTent})`);
  ok(avviso, `quota piena: il giocatore legge «${FRASE}»`);
  const tecnico = await page.evaluate(() => /QuotaExceeded|DOMException|localStorage/i.test(document.body.innerText));
  ok(!tecnico, 'l\'avviso non contiene testo tecnico');
  const m1 = await leggi(page, 'cpm-v3'), r1 = await leggi(page, 'cpm-v3-riserva');
  ok(m1 === 2222 && r1 === 1000, `durante il guasto nulla si perde: slot ${m1} · riserva ${r1} (attesi 2222 · 1000)`);
  await page.evaluate(() => { window.__QUOTA167 = false; });
  await patch(page, 4444);
  const m2 = await leggi(page, 'cpm-v3'), r2 = await leggi(page, 'cpm-v3-riserva');
  ok(m2 === 4444 && r2 === 2222, `tolto il guasto il salvataggio riparte: slot ${m2} · riserva ${r2} (attesi 4444 · 2222)`);
  await ctx.close();
}

await b.close(); srv.close();
console.log(`\nbackup-167 ${ROSSO ? '(ROSSO: __CPM_NO_BACKUP167)' : '(verde)'}`);
for (const e of esiti) console.log('  ' + e);
const pe = guasti.filter(g => g.startsWith('pageerror'));
for (const g of pe) console.log('  ✗ ' + g);
console.log(guasti.length ? `\n✗ backup-167: ${guasti.length} controlli rossi` : '\n✓ backup-167: VERDE');
process.exit(guasti.length ? 1 : 0);
