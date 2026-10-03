#!/usr/bin/env node
/* [7.999.124 PO-199 collaudo PO 03/10 «Nel galà si deve vedere apertura della busta progressivamente dal terzo al primo, non deve
   comparire subito il vincitore del premio»] GUARDIANO: dopo «Apri la busta» la scheda passa per i tempi 0 (busta) → 1 (3° posto)
   → 2 (2° posto) → 3 (vincitore, «Il premio è tuo»), e per almeno 3 s il vincitore non compare. Rosso __CPM_NO_BUSTA199: il
   vincitore compare subito. Salvataggio e percorso di gala-3d.mjs.
   [7.999.125 scelte PO] la busta si svela UN TOCCO per posizione: senza tocchi resta chiusa (data-rev 0 dopo 3 s). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
const page = await ctx.newPage();
await page.addInitScript((r) => { if (r) window.__CPM_NO_BUSTA199 = true;
  const save = { phase: 'career', player: { name: 'Marco Carrasco', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 11, week: 39, age: 28, ovr: 93,
    club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
    stats: { 'velocità': 92, tecnica: 93, fisico: 88, 'mentalità': 92, tiro: 94, passaggio: 90, dribbling: 92, posizionamento: 93 }, form: 95, morale: 100, fatigue: 37, popularity: 90, value: 120, bankBalance: 2000000,
    contract: { duration: 3, wage: 120000, expiresAtSeason: 14 } } }; try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} }, rosso);
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => {});
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriGala), null, { timeout: 25000 }).catch(() => {});
await page.evaluate(() => window.__CPM_CAREER.apriGala()); await sleep(2500);
try { await page.getByText('Apri la busta', { exact: false }).first().waitFor({ timeout: 30000 }); await page.getByText('Apri la busta', { exact: false }).first().click({ timeout: 5000 }); } catch (_e) {}
await page.waitForFunction(() => !!document.querySelector('[data-cpm="busta199"]') || /Il premio è tuo/.test(document.body.innerText || ''), null, { timeout: 15000 }).catch(() => {});
const t0 = Date.now(), seq = []; let premioA = null;
/* [7.999.125 scelta PO «un tocco per posizione»] 3 s senza toccare: la busta deve restare chiusa; poi un tocco per posto */
await sleep(3000); const ferma = await page.evaluate(() => { const b = document.querySelector('[data-cpm="busta199"]'); return b ? +b.getAttribute('data-rev') : null; });
const tocca = async () => { try { await page.getByRole('button', { name: /Svela il|E il vincitore/i }).first().click({ timeout: 1500 }); } catch (_e) {} };
for (let i = 0; i < 40; i++) { if (i > 0 && i % 4 === 0) await tocca(); const s = await page.evaluate(() => { const b = document.querySelector('[data-cpm="busta199"]'); return { rev: b ? +b.getAttribute('data-rev') : null, premio: /Il premio è tuo/.test(document.body.innerText || '') }; });
  const r = s.premio ? 3 : s.rev; if (seq[seq.length - 1] !== r) seq.push(r); if (s.premio && premioA == null) premioA = Date.now() - t0; if (s.premio) break; await sleep(250); }
const altri = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).map(x => (x.innerText || '').trim()).filter(t => /premio|bilancio/i.test(t)); return b.join(' | '); });
esito[rosso ? 'rosso' : 'verde'] = { seq, premioDopoMs: premioA, fermaDopo3s: ferma, prossimo: altri };
await ctx.close();
}
/* [7.999.125 scelta PO «Busta per tutti i premi»] due premi: il Re dei Bomber lo vince un altro (tu 2°), il Trofeo d'Oro tu.
   Verde: anche il premio perso ha la sua busta (scheda busta199-altro con «Tu sei 2°»), poi «Prossimo premio». Rosso
   __CPM_NO_TUTTI201: il premio perso non ha la busta (finisce nell'elenco finale). */
const AW = { palloneOro: { playerWins: true, top3: [{ name: 'TU', isPlayer: true, club: 'FC Merseyside', goals: 34 }, { name: 'L. Moreno', club: 'CF Madrid', goals: 31 }, { name: 'K. Adeyemi', club: 'Deutsche Elf', goals: 29 }] },
  scarpaOro: { playerWins: false, top3: [{ name: 'L. Moreno', club: 'CF Madrid', goals: 36 }, { name: 'TU', isPlayer: true, club: 'FC Merseyside', goals: 34 }, { name: 'K. Adeyemi', club: 'Deutsche Elf', goals: 29 }] },
  seasonRecord: { beaten: false }, allTime: { beaten: false } };
for (const rossoT of [false, true]) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  await page.addInitScript((r) => { if (r) window.__CPM_NO_TUTTI201 = true;
  const save = { phase: 'career', player: { name: 'Marco Carrasco', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 11, week: 39, age: 28, ovr: 93,
    club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
    stats: { 'velocità': 92, tecnica: 93, fisico: 88, 'mentalità': 92, tiro: 94, passaggio: 90, dribbling: 92, posizionamento: 93 }, form: 95, morale: 100, fatigue: 37, popularity: 90, value: 120, bankBalance: 2000000,
    contract: { duration: 3, wage: 120000, expiresAtSeason: 14 } } }; try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} }, rossoT);
  await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => {});
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriGala), null, { timeout: 25000 }).catch(() => {});
  await page.evaluate(aw => window.__CPM_CAREER.apriGala(aw), AW); await sleep(2500);
  try { await page.getByText('Apri la busta', { exact: false }).first().waitFor({ timeout: 30000 }); await page.getByText('Apri la busta', { exact: false }).first().click({ timeout: 5000 }); } catch (_e) {}
await page.waitForFunction(() => !!document.querySelector('[data-cpm="busta199"]') || /Il premio è tuo/.test(document.body.innerText || ''), null, { timeout: 15000 }).catch(() => {});
  await sleep(1500);
  for (let k = 0; k < 3; k++) { try { await page.getByRole('button', { name: /Svela il|E il vincitore/i }).first().click({ timeout: 2000 }); } catch (_e) {} await sleep(700); }
  esito[rossoT ? 'tuttiRosso' : 'tutti'] = await page.evaluate(() => ({ altro: !!document.querySelector('[data-cpm="busta199-altro"]'), sei2: /Tu sei 2°/.test(document.body.innerText || ''),
    prossimo: /Prossimo premio/.test(document.body.innerText || ''), premioTuo: /Il premio è tuo/.test(document.body.innerText || '') }));
  await ctx.close();
}
await browser.close(); server.close();
console.log(JSON.stringify(esito));
const V = esito.verde, R = esito.rosso, g = [];
if (JSON.stringify(V.seq) !== JSON.stringify([0, 1, 2, 3])) g.push('verde: sequenza ' + JSON.stringify(V.seq) + ' (attesa 0,1,2,3)');
if (!(V.premioDopoMs >= 3000)) g.push('verde: il vincitore compare dopo ' + V.premioDopoMs + ' ms (almeno 3000)');
if (V.fermaDopo3s !== 0) g.push('verde: senza tocchi la busta deve restare chiusa, data-rev ' + V.fermaDopo3s);
if (!(R.seq[0] === 3 && R.fermaDopo3s == null && !R.seq.includes(1))) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
const T = esito.tutti, TR = esito.tuttiRosso;
if (!(T.altro && T.sei2 && T.prossimo)) g.push('verde (tutti i premi): il premio perso non ha la sua busta ' + JSON.stringify(T));
if (TR.altro || !TR.premioTuo) g.push('rosso (tutti i premi): il difetto non si vede ' + JSON.stringify(TR));
if (g.length) { console.log('❌ busta-199'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ busta-199 verde (e il rosso si vede)');
