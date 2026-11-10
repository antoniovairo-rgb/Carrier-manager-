/* [giro 146 PO-348] LE SCENE DI spalle-146: apre ogni scena col GLB ACCESO e misura i corpi 3D vivi con __misura146 (spalle-146-misura.mjs).
   Scene: highlight dell'eroe (scelta + conclusione) · premiazione (alzata) · intro · presentazione della squadra. Ogni funzione restituisce
   { eroe: [campioni], altri: [campioni], note } — un campione e' l'uscita di __misura146 piu' { fase, chi }. Foto in out/g146/. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { INIETTA146 } from './spalle-146-misura.mjs';
export { startServer, launchBrowser };
fs.mkdirSync('out/g146', { recursive: true });
const PRO = { id: 'parm', n: 'FC Parmense', a: 'PAR', p: 62, c: '#facc15', c2: '#2563eb', nat: '🇮🇹', lg: 'Lega A' };
const SAVE = { phase: 'career', player: {
  name: 'Spalle Probe', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 1, age: 16, ovr: 60,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 1, presidentModalSeason: 1,
  drawSeen: 1, mercatoSeen: 1, coachPactSeason: 1, presentedClub: PRO.id, presentSeason: 1,
  seasonPledge: { season: 1, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
  stats: { 'velocità': 60, tecnica: 60, fisico: 60, 'mentalità': 60, tiro: 60, passaggio: 60, dribbling: 60, posizionamento: 60 },
  form: 70, morale: 70, fatigue: 20, coachTrust: 60, teamChemistry: 60, popularity: 10, bankBalance: 1000,
  goals: 0, assists: 0, matches: 0, totalMatches: 0, totalGoals: 0, matchHistory: [],
  contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
const init = (page, rosso, extra) => page.addInitScript(([r, x]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_G146 = 1;
  try { localStorage.setItem('cpm-intro-seen', '1'); if (x) localStorage.setItem('cpm-v3', JSON.stringify(x)); } catch (e) {} }, [rosso, extra || null]);
async function pagina(browser, vp, rosso, extra) { const ctx = await browser.newContext({ viewport: vp }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  await page.addInitScript(INIETTA146); await init(page, rosso, extra); page._ctx = ctx; return page; }
const foto = (page, nome) => page.screenshot({ path: `out/g146/${nome}.png` }).catch(() => {});
/* primo piano del corpo indicato da un'espressione della pagina (eroe), fronte + tre quarti affiancati in due file */
export const provino = async (page, expr, nome) => { try { const u = await page.evaluate(e => { const r = (0, eval)(e); return r ? window.__provino146(r) : null; }, expr);
  if (u) u.forEach((d, i) => fs.writeFileSync(`out/g146/${nome}-provino${i}.png`, Buffer.from(d.split(',')[1], 'base64'))); } catch (e) {} };
const EROE_P = "(window.__CPM_CORPI146().find(a=>a.eroe)||{}).v";
/* corpi della partita: eroe + i primi compagni di movimento + un portiere */
const campPartita = (page, fase) => page.evaluate(f => { const L = (window.__CPM_CORPI146 && window.__CPM_CORPI146()) || []; const out = [];
  const e = L.find(a => a.eroe); if (e) out.push({ chi: 'eroe', fase: f, cg: e.cg, ...window.__misura146(e.v) });
  L.filter(a => !a.eroe && !a.arb && !a.panca).slice(0, 5).forEach((a, i) => out.push({ chi: (a.gk ? 'gk' : 'm') + i, fase: f, cg: a.cg, ...window.__misura146(a.v) }));
  L.filter(a => a.panca).slice(0, 3).forEach((a, i) => out.push({ chi: 'panca' + i, fase: f, cg: a.cg, ...window.__misura146(a.v) }));
  return out; }, fase);
export async function scenaPartita(browser, port, vp, rosso, tag) {
  const page = await pagina(browser, vp, rosso); const S = [];
  try {
    await openMatch(page, port, { name: 'Spalle Probe' });
    await page.waitForFunction(() => window.__CPM_GLB_READY === true && typeof window.__CPM_CORPI146 === 'function', null, { timeout: 90000 });
    await page.waitForFunction(() => { const L = window.__CPM_CORPI146(); return L.some(a => a.eroe && a.cg); }, null, { timeout: 60000 }).catch(() => {});
    await sleep(800);
    for (const gi of [18, 3]) {
      await page.evaluate(() => { delete window.__CPM_FORCE_KIND; window.__CPM_FORCE_OUTCOME = 'success'; });
      await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(1600);
      S.push(...await campPartita(page, 'scelta-gi' + gi)); if (gi === 18) { await foto(page, `${tag}-highlight-scelta`); await provino(page, EROE_P, `${tag}-highlight-scelta`); }
      await page.evaluate(() => window.__CPM_RESOLVE(0)).catch(() => {});
      for (let k = 0; k < 6; k++) { await sleep(450); S.push(...(await campPartita(page, 'gesto-gi' + gi)).filter(x => x.chi === 'eroe')); if (gi === 18 && k === 2) { await foto(page, `${tag}-highlight-gesto`); await provino(page, EROE_P, `${tag}-highlight-gesto`); } }
    }
    /* premiazione: alzata del trofeo (stesso corpo di partita) */
    await page.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI PREMIER DIVISION', kind: 'league' }));
    await page.waitForFunction(() => !!window.__CPM_CER425, null, { timeout: 60000 });
    const info = await page.evaluate(() => window.__CPM_CER425); const i = info.beats.indexOf('lift'); const t0 = info.beatsD.slice(0, i).reduce((a, x) => a + x, 0);
    await page.evaluate(t => { window.__CPM_CERT_SET = t; }, t0 + info.beatsD[i] * 0.4); await sleep(4000);
    if (process.env.DBG146) console.log('DBG', JSON.stringify(await page.evaluate(() => { window.__CPM_N146 = [0, 0]; let raf = 0; const f = () => { raf++; if (raf < 400) requestAnimationFrame(f); }; requestAnimationFrame(f); const st0 = window.__CPM_ANIM_LOD_STATS ? JSON.stringify(window.__CPM_ANIM_LOD_STATS) : null; return new Promise(r => setTimeout(() => r({ n: window.__CPM_N146, e: window.__CPM_E146 || null, raf, ph: window.__CPM_PHASE && window.__CPM_PHASE(), corpi: (window.__CPM_CORPI146() || []).length }), 1500)); })));
    S.push(...(await campPartita(page, 'premiazione')).map(x => ({ ...x, scena: 'premiazione' }))); await foto(page, `${tag}-premiazione`); await provino(page, EROE_P, `${tag}-premiazione`);
  } catch (e) { S.push({ errore: 'partita: ' + String(e.message || e).slice(0, 140) }); }
  await page._ctx.close(); return S.map(x => ({ scena: x.scena || 'highlight', ...x }));
}
export async function scenaIntro(browser, port, vp, rosso, tag) {
  const page = await pagina(browser, vp, rosso); const S = [];
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
    await page.evaluate(() => { window.__CPM_INTRO115 = {}; window.__CPM_INTRO118 = {}; window.dispatchEvent(new CustomEvent('cpm-replay-intro')); });
    await page.waitForFunction(() => window.__CPM_INTRO118 && window.__CPM_INTRO118.av && window.__CPM_INTRO118.av.hero, null, { timeout: 90000 });
    for (let k = 0; k < 8; k++) { await sleep(900);
      const r = await page.evaluate(() => { const A = window.__CPM_INTRO118.av; return [{ chi: 'eroe', ...window.__misura146(A.hero) }, { chi: 'gk', ...window.__misura146(A.gk) }]; });
      S.push(...r.map(x => ({ ...x, fase: 'intro' + k }))); if (k === 3) { await foto(page, `${tag}-intro`); await provino(page, 'window.__CPM_INTRO118.av.hero', `${tag}-intro`); } }
  } catch (e) { S.push({ errore: 'intro: ' + String(e.message || e).slice(0, 140) }); }
  await page._ctx.close(); return S.map(x => ({ scena: 'intro', ...x }));
}
export async function scenaPresentazione(browser, port, vp, rosso, tag) {
  const page = await pagina(browser, vp, rosso, SAVE); const S = [];
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
    await sleep(1500); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.apriPresentazione(1));
    await page.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 60000 }); await sleep(2500);
    for (let k = 0; k < 3; k++) { const r = await page.evaluate(() => { const P = window.__CPM_PRES142; return P.men.map((m, i) => ({ chi: i === P.HERO ? 'eroe' : 'm' + i, ...window.__misura146(m) })); });
      S.push(...r.map(x => ({ ...x, fase: 'pres' + k }))); if (k === 0) { await foto(page, `${tag}-presentazione`); await provino(page, 'window.__CPM_PRES142.men[window.__CPM_PRES142.HERO]', `${tag}-presentazione`); } await sleep(1200); }
  } catch (e) { S.push({ errore: 'presentazione: ' + String(e.message || e).slice(0, 140) }); }
  await page._ctx.close(); return S.map(x => ({ scena: 'presentazione', ...x }));
}
