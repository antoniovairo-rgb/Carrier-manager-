#!/usr/bin/env node
/* [giro 199 · PO-408/409] SONDA (non guardiano) misura-199: dove stanno, nella Home, i riquadri con una scelta da fare e quanto e'
   alta la figurina di Carriera › Profilo. Gioco vero (?cpmtest=1), salvataggio sintetico + __CPM_CAREER.patch per accendere 0..3
   riquadri di scelta (saga di mercato all'episodio 3, shooting nella settimana europea, fisioterapista a fatica 80).
   Viewport 375x667, 390x844, 1366x768. Stampa JSON su stdout. CPM_FLAG199=<nome> accende un interruttore (es. __CPM_NO_G199). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
export const CLUB = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 90, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
export function salva(over = {}) {
  const s = 80;
  return { name: 'Guardiano Home', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 30, weekLived: false, age: 25, ovr: s, tutorialDone: true, position: 'ATT',
    club: CLUB, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 3, wage: 9000, expiresAtSeason: 5 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1,
    hasAgent: true, agent: { id: 'ag1', name: 'Marco Gestini', style: 'boutique', rapport: 60 }, agentTask: 'immagine', agentStyleSeen: 3,
    history: [], worldMemory: [], rival: null, totalMatches: 61, totalGoals: 31, log: [], ...AP, ...over };
}
/* le tre scelte, in ordine: 1 saga · 2 shooting · 3 fisioterapista */
export function scelte(n, wk) {
  const o = {};
  if (n >= 1) o.transferSaga = { season: 3, week: wk - 2, club: 'FC Stamford', offer: null, delivered: false };
  if (n >= 2) { o.sponsors = [{ brand: 'Nexon Worldwide', weekly: 7600, tier: 2 }]; o.__euro = true; }
  if (n >= 3) o.fatigue = 80;
  return o;
}
export async function apri(browser, port, player, flags = [], w = 375, h = 667) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, fl]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; for (const f of fl) window[f] = 1; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, [player, flags]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(900);
  await page.evaluate(() => { try { window.__CPM_CAREER.resolveOpening(); } catch (e) {} try { window.__CPM_CAREER.dismiss(); } catch (e) {} });
  await sleep(500);
  return { page, errors };
}
/* accende le scelte richieste via patch (la settimana europea si aggiunge al calendario vero) */
export async function accendi(page, n) {
  const wk = await page.evaluate(() => window.__CPM_CAREER.snapshot().week);
  const o = scelte(n, wk); const euro = !!o.__euro; delete o.__euro;
  await page.evaluate(([o, euro, wk]) => { const p = window.__CPM_CAREER.snapshot(); if (euro) o.calendar = [...(p.calendar || []).filter(m => m.week !== wk), { matchday: 99, week: wk, type: 'euro', opponentId: 'x', opponentName: 'Real Castilla', isHome: true, played: false }];
    window.__CPM_CAREER.patch(o); window.__CPM_CAREER.goTab('dashboard'); }, [o, euro, wk]);
  await sleep(900);
  await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} });
  await sleep(400);
}
/* posizioni a scroll 0 (ogni contenitore scorrevole riportato in cima) */
export async function misuraHome(page) {
  return page.evaluate(() => {
    for (const el of document.querySelectorAll('*')) if (el.scrollTop) el.scrollTop = 0; window.scrollTo(0, 0);
    const H = window.innerHeight;
    const pos = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bot: Math.round(r.bottom), h: Math.round(r.height), schermi: +(r.top / H).toFixed(2) }; };
    const cards = [...document.querySelectorAll('[data-cpm="dashboard-root"] *, #root *')];
    const byText = (re) => { const c = [...document.querySelectorAll('div')].filter(d => re.test(d.innerText || '') && d.getBoundingClientRect().height > 40 && d.getBoundingClientRect().height < 700); c.sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height); return c[0] || null; };
    const scelte = {
      saga: pos(document.querySelector('[data-cpm="scelta199-saga"]') || byText(/SAGA DI MERCATO|Saga di mercato/)),
      shooting: pos(document.querySelector('[data-cpm="scelta199-shooting"]') || byText(/shooting nella settimana sbagliata/i)),
      fisio: pos(document.querySelector('[data-cpm="scelta199-allenamento"]') || byText(/Dal campo d.allenamento/i)),
    };
    return { H, W: window.innerWidth, svincolato: pos(document.querySelector('[data-cpm="svincolato198-home"]')), blocco: pos(document.querySelector('[data-cpm="scelte199"]')),
      avanza: pos(document.querySelector('[data-cpm="avanza23"]')), momento: pos(document.querySelector('[data-cpm="corsa163"]')), scelte,
      segni: document.querySelectorAll('[data-cpm="scelta199-segno"]').length, finestre: document.querySelectorAll('[data-cpm="pop224"],[role="dialog"]').length };
  });
}
if (import.meta.url === `file://${process.argv[1]}` && !process.env.CPM_FIG199) {
  const flags = (process.env.CPM_FLAG199 || '').split(',').filter(Boolean);
  const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  const out = [];
  try {
    for (const [w, h] of [[375, 667], [390, 844], [1366, 768]]) for (const n of [0, 1, 2, 3]) {
      const { page, errors } = await apri(browser, port, salva(), flags, w, h);
      await accendi(page, n); const m = await misuraHome(page);
      const s = Object.entries(m.scelte).filter(([, v]) => v).map(([k, v]) => `${k}@${v.top}px/${v.schermi}sch`).join(' ');
      console.log(`${w}x${h} n=${n}: momento ${m.momento ? m.momento.top + 'px/' + m.momento.schermi : '-'} · avanza ${m.avanza ? m.avanza.top : '-'} · ${s || 'nessuna scelta'} · finestre ${m.finestre} · errori ${errors.length}`);
      out.push({ w, h, n, ...m, errors }); await page.close();
    }
  } finally { await browser.close(); srv.close(); }
  if (process.env.CPM_OUT199) (await import('node:fs')).writeFileSync(process.env.CPM_OUT199, JSON.stringify(out, null, 1));
}
/* figurina di Carriera › Profilo: altezza, quota di schermo, spazio vuoto fra la riga alta (OVR + volto) e la fascia del nome */
export async function misuraFigurina(page) {
  await page.evaluate(() => { window.__CPM_CAREER.goTab('profile'); }); await sleep(900);
  return page.evaluate(() => {
    for (const el of document.querySelectorAll('*')) if (el.scrollTop) el.scrollTop = 0; window.scrollTo(0, 0);
    const H = window.innerHeight, f = document.querySelector('[data-cpm="figurina-v2-grande"]'); if (!f) return null;
    const r = f.getBoundingClientRect(), inner = f.firstElementChild, alta = inner.children[0], fascia = inner.children[inner.children.length - 1];
    const ra = alta.getBoundingClientRect(), rf = fascia.getBoundingClientRect();
    const fondoAlta = Math.max(...[...alta.querySelectorAll('*')].map(e => e.getBoundingClientRect().bottom), ra.bottom);
    const nome = [...document.querySelectorAll('[data-cpm="carriera-v2"] span')].find(s => /anni/.test(s.innerText || ''));
    return { H, W: window.innerWidth, top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), quota: +(r.height / H).toFixed(3), vuoto: Math.round(rf.top - fondoAlta),
      rigaAnni: nome ? Math.round(nome.getBoundingClientRect().bottom) : null };
  });
}
if (import.meta.url === `file://${process.argv[1]}` && process.env.CPM_FIG199) {
  const flags = (process.env.CPM_FLAG199 || '').split(',').filter(Boolean);
  const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  for (const [w, h] of [[375, 667], [390, 844], [1366, 768]]) { const { page } = await apri(browser, port, salva(), flags, w, h); console.log(`FIG ${w}x${h}`, JSON.stringify(await misuraFigurina(page))); await page.close(); }
  await browser.close(); srv.close();
}
