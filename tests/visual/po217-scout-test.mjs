/* [PO-217] Guardiano analisi pre-partita (schermata «Analisi» dello scout).
 * Misura: il pulsante «Entra in campo» deve stare in fondo alla schermata, non a meta'.
 * Metrica: spazio libero sotto il pulsante = innerHeight - bottom(pulsante).
 * Rosso: window.__CPM_NO_PO217 (il pulsante torna a seguire il contenuto).
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium CPM_ROSSO=1 node po217-scout-test.mjs  (rosso)
 *      CPM_CHROME=/opt/pw-browsers/chromium node po217-scout-test.mjs               (verde)
 * Larghezze: 360 / 375 / 412 px. Foto in docs/sviluppo/foto/po217/. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(ROOT, 'docs', 'sviluppo', 'foto', 'po217'); fs.mkdirSync(out, { recursive: true });
const ROSSO = !!process.env.CPM_ROSSO, TAG = ROSSO ? '-rosso' : '-verde';
const LARGHEZZE = [360, 375, 412];
const SOGLIA_VUOTO = Number(process.env.CPM_VUOTO_MAX || 160); // px liberi sotto il pulsante ammessi
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const R = { rosso: ROSSO, misure: [], errori: [] };
for (const w of LARGHEZZE) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); page.on('pageerror', e => R.errori.push(String(e).slice(0, 160)));
  await page.addInitScript((rosso) => { window.__CPM_CAMT767ON = true; if (rosso) window.__CPM_NO_PO217 = true;
    const save = { phase: 'career', player: { name: 'Samuel Francisco', nation: 'Spagna', avatarId: 3, proStatus: 'u18', season: 1, week: 1, age: 17, ovr: 66, jerseyNum: 77,
      club: { id: 'cio', n: 'FC Ciociaro Primavera', a: 'CIO', p: 60, c: '#f59e0b', c2: '#1d4ed8', nat: '🇮🇹', lg: 'Primavera 2' },
      teammates: [{ name: 'Rocco Landi', archetype: 'mentor', icon: '🧠' }],
      stats: { 'velocità': 66, tecnica: 66, fisico: 66, 'mentalità': 66, tiro: 66, passaggio: 66, dribbling: 66, posizionamento: 66 },
      form: 70, morale: 73, fatigue: 0, popularity: 20, value: 1, bankBalance: 1000, contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
    try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} }, ROSSO);
  await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriSettimana), { timeout: 25000 }).catch(() => {});
  try { await page.getByText('Salta', { exact: true }).first().click({ timeout: 4000 }); await sleep(500); } catch (_e) {}
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(500);
  for (let k = 0; k < 6; k++) { const ok = await page.evaluate(() => window.__CPM_CAREER.playMatch()); if (ok === true) break; try { await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); } catch (_e) {} await sleep(400); }
  await page.waitForFunction(() => !!document.querySelector('[data-cpm=prepartita23]'), null, { timeout: 40000 }).catch(() => {});
  await sleep(800);
  try { await page.getByText(/Analisi completa|Analisi dell'avversario/).first().click({ timeout: 6000 }); await sleep(1000); } catch (_e) { R.errori.push(`apertura analisi ${w}px non riuscita`); }
  const m = await page.evaluate(() => {
    const c = document.querySelector('[data-cpm=scout23]'); if (!c) return null;
    const btn = [...c.querySelectorAll('button')].find(b => /Entra in campo/.test(b.innerText || '')) || c.lastElementChild;
    const cr = c.getBoundingClientRect(), br = btn.getBoundingClientRect();
    return { altezzaContenitore: Math.round(cr.height), topContenitore: Math.round(cr.top), scrollY: Math.round(window.scrollY), inizioPulsante: Math.round(br.top), finePulsante: Math.round(br.bottom), vh: window.innerHeight, scroll: document.documentElement.scrollWidth, larg: window.innerWidth };
  });
  if (!m) R.errori.push(`schermata scout non aperta a ${w}px`);
  else { m.vuotoSottoPulsante = Math.round(m.vh - m.finePulsante); R.misure.push({ w, ...m }); }
  await page.screenshot({ path: path.join(out, `scout-${w}${TAG}.png`), fullPage: false });
  await ctx.close();
}
await browser.close(); await new Promise(r => server.close(r));
const pess = R.misure.filter(m => m.vuotoSottoPulsante > SOGLIA_VUOTO || m.scroll > m.larg);
R.esito = (R.misure.length === LARGHEZZE.length && !R.errori.length && pess.length === 0) ? 'VERDE' : 'ROSSO';
console.log(JSON.stringify(R, null, 1));
process.exit(R.esito === 'VERDE' ? 0 : 1);
