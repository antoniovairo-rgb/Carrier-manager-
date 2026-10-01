/* [23/09 POC] PRESENTAZIONE: in primo piano c'e' CHI VIENE CHIAMATO (non sempre l'eroe), il prato ha strisce e
   linee, lo sponsor sta sui cartelloni e non nella striscia. Un battito alla volta: nome annunciato contro la
   figurina grande (`data-cpm-pres23`). CPM_ROSSO=__CPM_NO_PRES23 (o __CPM_NO_PRATO23, __CPM_NO_SPONSOR23). */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const out = path.join(here, '..', 'character-lab', 'presentazione'); fs.mkdirSync(out, { recursive: true });
const ROSSO = process.env.CPM_ROSSO || '', TAG = ROSSO ? '-rosso' : '';
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const err = []; page.on('pageerror', e => err.push(String(e).slice(0, 160)));
await page.addInitScript((r) => { if (r) window[r] = true;
  const save = { phase: 'career', player: { name: 'Samuel Francisco', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 70, jerseyNum: 77,
    club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 80, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
    teammates: [{ name: 'Rocco Landi', archetype: 'mentor' }, { name: 'Dario Porcu', archetype: 'rival' }],
    stats: { 'velocità': 70, tecnica: 70, fisico: 70, 'mentalità': 70, tiro: 70, passaggio: 70, dribbling: 70, posizionamento: 70 },
    form: 70, morale: 70, fatigue: 10, popularity: 40, value: 10, bankBalance: 50000, contract: { duration: 3, wage: 15000, expiresAtSeason: 5 } } };
  try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} }, ROSSO);
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriPresentazione), { timeout: 25000 }).catch(() => {});
await page.evaluate(() => window.__CPM_CAREER.apriPresentazione(0)); await sleep(2500);
const battiti = []; let giusti = 0, sbagliati = 0;
for (let i = 0; i < 12; i++) {
  const b = await page.evaluate(() => { const g = document.querySelector('[data-cpm-pres23]'); const t = [...document.querySelectorAll('div')].find(d => d.children.length === 3 && /logoIn/.test(d.getAttribute('style') || '') && /SERATA DI PRESENTAZIONE/.test(d.children[2].textContent || ''));
    const nome = t ? t.children[1].textContent : null; const striscia = [...document.querySelectorAll('span')].some(s => /Banca|Assicurazioni|Energia|Pontebianco/i.test(s.textContent || '') && s.children.length === 0);
    return { annuncio: nome, primoPiano: g ? g.getAttribute('data-cpm-pres23') : (document.querySelector('[style*="scale(1.2)"]') ? 'eroe?' : null), sponsorInStriscia: striscia }; });
  battiti.push(b);
  if (b.primoPiano) { const eroeAnn = /SAMUEL FRANCISCO/i.test(b.annuncio || ''); const ok = eroeAnn ? b.primoPiano === 'eroe' : (b.primoPiano === b.annuncio); ok ? giusti++ : sbagliati++; }
  if (i === 0 || i === 3) await page.screenshot({ path: path.join(out, `battito-${i}${TAG}.png`) });
  const fine = await page.getByText(/Che la stagione cominci/).count(); if (fine) { await page.screenshot({ path: path.join(out, `battito-eroe${TAG}.png`) }); break; }
  try { await page.getByText(/Avanti/).first().click({ timeout: 5000 }); } catch (_e) { break; } await sleep(700);
}
await browser.close(); await new Promise(r => server.close(r));
const R = { rosso: ROSSO || null, battiti, giusti, sbagliati, errori: err };
fs.writeFileSync(path.join(out, `annunci${TAG}.json`), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1));
