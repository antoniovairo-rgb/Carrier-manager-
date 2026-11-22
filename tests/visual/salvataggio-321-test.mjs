#!/usr/bin/env node
/* [giro 321 GUARDIANO — PO-349, trovato dal giro 145] «una giornata non si conta mai due volte».
   Salvataggio costruito con le funzioni del gioco (lega da 18, 34 giornate), stagione 12, settimana della giornata 11:
   la classifica conta 10 giornate per tutti, ma il calendario NON c'e' (assente/vuoto: la migrazione lo rigenera).
   E1) senza storico partite  E2) con lo storico delle 10 gare dell'eroe  E3) calendario presente ma le 10 giornate non segnate
   (classifica avanti rispetto al calendario, senza storico).
   Verde: in ogni caso le giocate di ogni squadra restano <= giornate giocate del calendario (e la classifica non si azzera).
   CPM_RED=1 → window.__CPM_NO_G321 (= 7.999.202): la regola (H) ritira le giornate «gia' contate», il recupero 103 le risimula
   e le conta di nuovo → il guardiano deve FALLIRE (esce 0 solo se il rosso riproduce). */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const URL = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
async function apri(ctx, init) { const page = await ctx.newPage({ viewport: { width: 414, height: 896 } }); await installCdnRoutes(page);
  if (init) await page.addInitScript(init.fn, init.arg);
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }); return page; }
const ctx0 = await browser.newContext(); const p0 = await apri(ctx0, { fn: () => { window.__CPM_GLB = false; }, arg: null });
await p0.waitForFunction(() => typeof generateSeasonCalendar === 'function' && typeof rebuildStandingsFromCalendar === 'function', { timeout: 30000 });
const S = await p0.evaluate(() => {
  const lg = CLUBS.filter(c => c.lg === 'Premier Division' && !c.isU18).slice(0, 18); const me = lg[0];
  const res = m => { const h = 1 + (m.matchday % 3), a = m.matchday % 2; return { homeScore: h, awayScore: a, won: h > a, drew: h === a }; };
  const seed = 12 * 777 + hashStr(me.id); const cal0 = generateSeasonCalendar(me, lg, seed);
  const wk = md => (cal0.find(m => m.matchday === md) || {}).week;
  const calP = cal0.map(m => m.matchday <= 10 ? { ...m, played: true, result: res(m) } : m);
  const base = { name: 'Test Giornata', nation: 'Spagna', avatarId: 0, proStatus: 'pro', season: 12, age: 27, ovr: 80, tutorialDone: true, hasAgent: false, bankBalance: 50000, popularity: 50, coachTrust: 70, position: 'Attaccante',
    stats: { 'velocità': 80, tecnica: 80, fisico: 80, 'mentalità': 80, tiro: 80, passaggio: 80, dribbling: 80, posizionamento: 80 }, club: me, worldMemory: [], contract: { duration: 3, wage: 50000, expiresAtSeason: 14 }, log: [], leagueOverrides: {}, week: wk(11) };
  const st = rebuildStandingsFromCalendar({ ...base, calendar: calP });
  const hist = calP.filter(m => m.played).map(m => ({ season: 12, week: m.week, opponent: m.opponentName, isHome: m.isHome, homeScore: res(m).homeScore, awayScore: res(m).awayScore }));
  const E1 = { ...base, standings: st, calendar: [], matchHistory: [] };
  const E2 = { ...base, standings: st, calendar: [], matchHistory: hist };
  const E3 = { ...base, standings: st, calendar: cal0.map(m => ({ ...m })), matchHistory: [] };
  return { me: me.id, w: base.week, gioc: [...new Set(st.map(r => r.played))], saves: { E1, E2, E3 } };
});
await ctx0.close();
async function carica(pl) { const ctx = await browser.newContext(); const page = await apri(ctx, { fn: ([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G321 = 1; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: s }));
    window.__W321 = { n: 0, t: 0 }; const _si = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'cpm-v3') { window.__W321.n++; window.__W321.t = performance.now(); } return _si.call(this, k, v); }; }, arg: [pl, RED] });
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 30000 }).catch(() => {});
  /* si attende l'evento: almeno un autosalvataggio del gioco col calendario, poi nessuna scrittura per 2 s dell'orologio della pagina
     (l'autosalvataggio ha un rinvio di 600 ms: quiete = la migrazione, la bonifica e il recupero hanno finito) */
  await page.waitForFunction(() => { const w = window.__W321; if (!w || !w.n) return false; let c = 0; try { c = (JSON.parse(localStorage.getItem('cpm-v3')).player.calendar || []).length; } catch (e) {}
    return c > 0 && performance.now() - w.t > 2000; }, { timeout: 60000, polling: 'raf' });
  const r = await page.evaluate(me => { const p = JSON.parse(localStorage.getItem('cpm-v3')).player; const st = p.standings || [];
    const cal = (p.calendar || []).filter(m => !m.type); const mio = (st.find(t => t.id === me) || {}).played;
    return { gioc: [...new Set(st.map(t => t.played))].sort((a, b) => a - b), mio, giocCal: cal.filter(m => m.played).length, conRis: cal.filter(m => m.played && m.result).length,
      ritirate: cal.filter(m => m.healed418).map(m => m.matchday), recuperate: cal.filter(m => m.recupero103).map(m => m.matchday), w103: window.__CPM_RECUPERO103 || null, w321: window.__CPM_G321 || null, n: st.length, log: (p.log || []).slice(0, 6).map(l => l.slice(0, 140)) }; }, S.me);
  await ctx.close(); return r; }
const R = {}; for (const k of Object.keys(S.saves)) R[k] = await carica(S.saves[k]);
await browser.close(); srv.close();
console.log(`salvataggio: settimana ${S.w} · classifica a ${S.gioc.join('/')} giocate · calendario assente (E1/E2) o senza giornate segnate (E3) · braccio ${RED ? 'ROSSO __CPM_NO_G321' : 'VERDE'}`);
const ok = {};
for (const [k, r] of Object.entries(R)) {
  const max = Math.max(...r.gioc);
  ok[k] = max <= Math.max(r.giocCal, 10) && max <= S.w - 1 && r.mio >= 10 && Math.min(...r.gioc) >= 10;
  if (process.env.CPM_DBG) console.log(k, JSON.stringify({ n: r.n, w103: r.w103, log: r.log }));
  console.log(`${k} → giocate in classifica ${r.gioc.join('/')} (eroe ${r.mio}) · giornate giocate nel calendario ${r.giocCal} (con risultato ${r.conRis}) · ritirate [${r.ritirate}] · recuperate [${r.recuperate}] · ${ok[k] ? 'ok' : 'DOPPIO CONTEGGIO / AZZERATA'}`);
}
const tutti = Object.values(ok).every(Boolean), nessuno = Object.values(ok).some(v => !v);
if (RED) { console.log(nessuno ? '✅ ROSSO come atteso: una giornata contata due volte' : '❌ il rosso non riproduce'); process.exit(nessuno ? 0 : 1); }
console.log(tutti ? '✅ PASS salvataggio-321' : '❌ FAIL salvataggio-321'); process.exit(tutti ? 0 : 1);
