#!/usr/bin/env node
/* [7.999.124 PO-199 collaudo PO 03/10 «Nel galà si deve vedere apertura della busta progressivamente dal terzo al primo, non deve
   comparire subito il vincitore del premio»] GUARDIANO: dopo «Apri la busta» la scheda passa per i tempi 0 (busta) → 1 (3° posto)
   → 2 (2° posto) → 3 (vincitore, «Il premio è tuo»), e per almeno 3 s il vincitore non compare. Rosso __CPM_NO_BUSTA199: il
   vincitore compare subito. Salvataggio e percorso di gala-3d.mjs. */
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
try { await page.getByText('Apri la busta', { exact: false }).first().click({ timeout: 5000 }); } catch (_e) {}
const t0 = Date.now(), seq = []; let premioA = null;
for (let i = 0; i < 40; i++) { const s = await page.evaluate(() => { const b = document.querySelector('[data-cpm="busta199"]'); return { rev: b ? +b.getAttribute('data-rev') : null, premio: /Il premio è tuo/.test(document.body.innerText || '') }; });
  const r = s.premio ? 3 : s.rev; if (seq[seq.length - 1] !== r) seq.push(r); if (s.premio && premioA == null) premioA = Date.now() - t0; if (s.premio) break; await sleep(250); }
esito[rosso ? 'rosso' : 'verde'] = { seq, premioDopoMs: premioA };
await ctx.close();
}
await browser.close(); server.close();
console.log(JSON.stringify(esito));
const V = esito.verde, R = esito.rosso, g = [];
if (JSON.stringify(V.seq) !== JSON.stringify([0, 1, 2, 3])) g.push('verde: sequenza ' + JSON.stringify(V.seq) + ' (attesa 0,1,2,3)');
if (!(V.premioDopoMs >= 3000)) g.push('verde: il vincitore compare dopo ' + V.premioDopoMs + ' ms (almeno 3000)');
if (!(R.premioDopoMs != null && R.premioDopoMs < 1500 && !R.seq.includes(1))) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ busta-199'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ busta-199 verde (e il rosso si vede)');
