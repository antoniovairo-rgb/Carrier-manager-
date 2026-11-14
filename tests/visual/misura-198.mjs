#!/usr/bin/env node
/* [giro 198] SONDA DI MISURA (non guardiano): posizioni nella scheda Agente (375x667 e 390x844), fermata del tasto momento sul
   rinnovo, e lo svincolato a fine contratto. Stampa numeri, non giudica. CPM_FLAG=__CPM_NO_G198 misura il gioco di prima.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node misura-198.mjs [agente|momento|svincolo] */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const QUALE = process.argv[2] || 'agente';
const FLAG = process.env.CPM_FLAG || null;
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro198'); fs.mkdirSync(FOTO, { recursive: true });
const TAG = FLAG ? 'prima' : 'dopo';
const CLUB = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 90, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
export function salva198(over = {}) {
  const s = 80;
  return { name: 'Sonda Agente', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 20, weekLived: false, age: 25, ovr: s, tutorialDone: true, position: 'ATT',
    club: CLUB, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 1, wage: 9000, expiresAtSeason: 3 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1,
    hasAgent: true, agent: { id: 'ag1', name: 'Marco Gestini', style: 'boutique', rapport: 60 }, agentTask: null, richiamo198: { s: 3, n: 2 },
    history: [], worldMemory: [], rival: null, totalMatches: 61, totalGoals: 31, log: [], ...AP, ...over };
}
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apri(player, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, f]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (f) window[f] = 1; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, [player, FLAG]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(900);
  await page.evaluate(() => { window.__CPM_CAREER.resolveOpening(); window.__CPM_SALTA153 = []; });
  await sleep(700);
  await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); } catch (e) {} });
  await sleep(400);
  return { page, errors };
}
/* posizione (in schermi dall'alto del documento) del primo elemento visibile col testo */
const posizioni = (page, testi) => page.evaluate((T) => {
  const H = window.innerHeight, out = {};
  for (const t of T) {
    const el = [...document.querySelectorAll('button,div,span,b')].filter(e => e.offsetParent && (e.innerText || '').trim().toLowerCase().startsWith(t.toLowerCase())).sort((a, b) => a.innerText.length - b.innerText.length)[0];
    out[t] = el ? +((el.getBoundingClientRect().top + window.scrollY) / H).toFixed(2) : null;
  }
  return out;
}, testi);

try {
  if (QUALE === 'agente') {
    for (const [w, h] of [[375, 667], [390, 844]]) {
      const { page, errors } = await apri(salva198(), w, h);
      await page.evaluate(() => window.__CPM_CAREER.goTab('agente')); await sleep(900);
      await page.evaluate(() => window.scrollTo(0, 0)); await sleep(200);
      const p = await posizioni(page, ['Da fare ora', '⚠️ Contratto in scadenza', 'Prepara rinnovo', '📋 Negozia rinnovo', '🤵 Compito della settimana', 'Compito della settimana', '🔍 Fai girare il nome']);
      console.log(`${TAG} ${w}x${h}: ${JSON.stringify(p)} errori ${errors.length}`);
      await page.screenshot({ path: path.join(FOTO, `${TAG}-agente-${w}x${h}.png`) });
      await page.close();
    }
  }
  if (QUALE === 'momento') {
    const { page, errors } = await apri(salva198({ week: 27, weekLived: true }), 375, 667);
    await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); window.__CPM_CAREER.patch({ calendar: (p.calendar || []).filter(m => !(m && !m.played && m.week >= 26 && m.week < 29)) }); }); await sleep(500);
    const t = await page.$('[data-cpm="salta163-tasto"]'); await t.click(); await sleep(400);
    await page.click('[data-cpm="salta163-vai"]');
    const t0 = Date.now(); await sleep(500);
    while (Date.now() - t0 < 90000) { const st = await page.evaluate(() => { const e = document.querySelector('[data-cpm="salta163"]'); return e && e.getAttribute('data-salta163'); }); if (st !== 'corsa') break; await sleep(300); }
    await sleep(600);
    const r = await page.evaluate(() => { const rp = document.querySelector('[data-cpm="salta163-riepilogo"]'); const L = window.__CPM_SALTA153 || [];
      return { fine: L[L.length - 1], riep: rp ? rp.innerText : null, bottoni: rp ? [...rp.querySelectorAll('button')].map(b => b.innerText.trim()) : [],
        motivo: (document.querySelector('[data-cpm="salta163-motivo"]') || {}).innerText || null }; });
    console.log(`${TAG} fermata: ${JSON.stringify(r)} errori ${errors.length}`);
    const card = await page.$('[data-cpm="corsa163"]'); if (card) { await card.scrollIntoViewIfNeeded(); await card.screenshot({ path: path.join(FOTO, `${TAG}-fermata-rinnovo-375.png`) }); }
    await page.close();
  }
  if (QUALE === 'svincolo') {
    /* una stagione intera con contratto all'ultimo anno, senza rinnovare: richiami del club, poi la stagione nuova */
    const { page, errors } = await apri(salva198({ week: 1, richiamo198: null, contract: { duration: 1, wage: 9000, expiresAtSeason: 3 } }), 375, 667);
    const visti = [];
    for (let i = 0; i < 90; i++) {
      const s = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { s: p.season, w: p.week, exp: !!p.contractExpired }; });
      if (s.s > 3) break; if (process.env.CPM_DBG) console.log('  sett', s.w, JSON.stringify(await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { ct: p.coachTrust, ro: p.squadRole, r: p.richiamo198, d: p.contract && p.contract.duration, rs: p.renewalSeason }; })));
      const fin = await page.evaluate(() => { const t = document.body.innerText; return { r198: !!document.querySelector('[data-cpm="richiamo198"]'), fine: /Fine stagione|Inizia la nuova stagione|Nuova stagione/i.test(t) }; });
      if (fin.r198) { visti.push(s.w); await page.screenshot({ path: path.join(FOTO, `${TAG}-richiamo-sett${s.w}-375.png`) }); await page.evaluate(() => { const b = document.querySelector('[data-cpm="richiamo198-dopo"]'); if (b) b.click(); }); await sleep(400); }
      await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); } catch (e) {} });
      const passo = await page.evaluate(() => window.__CPM_CAREER.step()); await sleep(450);
      if (s.w >= 38 && /fine|season|stagione/i.test(String(passo))) { await sleep(800); }
    }
    const log = await page.evaluate(() => (window.__CPM_CAREER.snapshot().log || []).filter(l => /contratt|rinnov|svincol|presidente/i.test(l)).slice(0, 8));
    console.log(`${TAG} richiami a schermo nelle settimane: ${JSON.stringify(visti)}`);
    console.log(`${TAG} registro: ${JSON.stringify(log)}`);
    await page.evaluate(() => { try { window.__CPM_CAREER.startNewSeason(); } catch (e) {} }); await sleep(1800);
    const dopo = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { s: p.season, w: p.week, exp: !!p.contractExpired, sch: !!document.querySelector('[data-cpm="svincolato198"]') }; });
    console.log(`${TAG} stagione nuova: ${JSON.stringify(dopo)} errori ${errors.length} ${errors[0] || ''}`);
    await page.screenshot({ path: path.join(FOTO, `${TAG}-stagione-nuova-375.png`) });
    await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); const b = document.querySelector('[data-cpm="svincolato198-casa"]'); if (b) b.click(); window.__CPM_CAREER.goTab('dashboard'); } catch (e) {} }); await sleep(900);
    const home = await page.evaluate(() => { const t = document.body.innerText; const club = window.__CPM_CAREER.snapshot().club; return { nomiClub: (t.match(new RegExp((club && club.n) || 'zzz', 'g')) || []).length,
      righe: t.split('\n').filter(l => /fiducia|mister|spogliatoio|cessione|compagni|tifosi|prossima|Gioca/i.test(l)).slice(0, 14) }; });
    console.log(`${TAG} home da svincolato: ${JSON.stringify(home)}`);
    await page.screenshot({ path: path.join(FOTO, `${TAG}-home-svincolato-375.png`), fullPage: true });
    await page.close();
  }
} finally { await browser.close(); srv.close(); }
