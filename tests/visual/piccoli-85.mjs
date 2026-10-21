#!/usr/bin/env node
/* [giro 85] GUARDIANO PICCOLE CORREZIONI — non-gate, carriera. Ogni controllo gira sul codice VERO della pagina.
 *   A  PO-289  l'evento «Il tuo agente finalizza un accordo commerciale secondario. Entrate extra.» paga davvero: cifra = 4 settimane degli sponsor
 *              (o dell'offerta del Procuratore), esce solo da pro con agente, il testo mostra la cifra. Rosso __CPM_NO_AGENTE85.
 *   B1 provini     «Manca ancora 2 provini» -> «Mancano ancora 2 provini» / «Manca ancora 1 provino»
 *   B2 fine U18    dopo una sola stagione (u18Seasons=1) la barra dice «1 di 2» e non «2 di 2»; con 2 resta «2 di 2 · Limite raggiunto»
 *   B3 gala        «N sono per te» conta solo i premi in cui l'eroe e' candidato e sparisce se 0
 *   B4 gala        Re dei Bomber / Trofeo d'Oro portano «Europa» (non la lega dell'eroe); il Trofeo d'Oro mostra l'OVR accanto ai gol
 * Rosso B: window.__CPM_NO_PICCOLI85. Uso: node piccoli-85.mjs  |  CPM_PROVA_ROSSO=1 node piccoli-85.mjs (pretende che ogni controllo cada). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const CLUB = { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 80, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Championship' };
const BASE = { name: 'Sim Piccoli', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 24, ovr: 72, tutorialDone: true, club: CLUB,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 50, fatigue: 10, popularity: 60, coachTrust: 60, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 }, bankBalance: 500000,
  hasAgent: true, agent: { name: 'Marco Bellini', rapport: 50 } };
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

async function giro(rosso) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 140)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; window.__CPM_NO_GALA51 = false; if (rosso) { window.__CPM_NO_AGENTE85 = true; window.__CPM_NO_PICCOLI85 = true; }
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: s })); }, { s: BASE, rosso });
  for (let t = 0; t < 3; t++) { try { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); break; } catch (e) { if (t === 2) throw e; } }
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(800);
  const o = {};
  // A
  o.A = await page.evaluate((B) => {
    const ev = WEEKLY_RANDOM_EVENTS.find(e => /accordo commerciale secondario/.test(e.txt));
    const ok = (p) => { try { return !ev.cond || !!ev.cond(p); } catch (e) { return false; } };
    const sp3000 = { ...B, sponsors: [{ tier: 'nazionale', brand: 'X', weekly: 3000, season: 1 }] };
    const sv = sponsorView(B);
    return { trovato: !!ev, pro: ok(B), u18: ok({ ...B, proStatus: 'u18' }), senzaAgente: ok({ ...B, hasAgent: false, agent: null }),
      cashConSponsor: cashAgente85(sp3000), cashSenza: cashAgente85(B), attesoSenza: sv ? Math.round(4 * sv.weekly / 10) * 10 : 1600 };
  }, BASE);
  // B1
  o.B1 = await page.evaluate(() => [provinoMancano85(2), provinoMancano85(1)]);
  // B2: la schermata vera, montata fuori dall'app con il giocatore dopo 1 / 2 stagioni U18
  o.B2 = await page.evaluate(async (B) => {
    const leggi = async (u) => { const d = document.createElement('div'); document.body.appendChild(d); const r = ReactDOM.createRoot(d);
      r.render(React.createElement(ProTransitionScreen, { player: { ...B, proStatus: 'u18', u18Seasons: u, season: u, club: { ...B.club, lg: 'Primavera 1' }, goals: 5, assists: 2, matches: 20 }, onChoose() {} }));
      await new Promise(r2 => setTimeout(r2, 600)); const t = d.innerText; r.unmount(); d.remove(); return t; };
    const a = await leggi(1), b = await leggi(2);
    return { u1: (a.match(/Stagioni Under 18: \d di 2/) || [''])[0], u1Ultima: /ultima stagione/i.test(a) ? (a.match(/[^\n]*ultima stagione[^\n]*/i) || [''])[0] : '', u2: (b.match(/Stagioni Under 18: \d di 2/) || [''])[0], u2Limite: /Limite raggiunto/.test(b) };
  }, BASE);
  // B3 / B4: il gala vero con tre candidati per premio, l'eroe in nessuna terna
  const aw = { leagueYoung: { winner: { name: 'G. Giovane', club: 'FC Alfa', goals: 9, isYoungEligible: true }, isYoungEligible: true },
    leagueTopScorer: { top3: [{ name: 'A. Uno', club: 'FC Alfa', goals: 30 }, { name: 'B. Due', club: 'FC Beta', goals: 28 }, { name: 'C. Tre', club: 'FC Gamma', goals: 27 }] },
    leagueMvp: { top3: [{ name: 'A. Uno', club: 'FC Alfa', goals: 30 }, { name: 'B. Due', club: 'FC Beta', goals: 28 }, { name: 'C. Tre', club: 'FC Gamma', goals: 27 }] },
    scarpaOro: { top3: [{ name: 'N. Mazza', club: 'AT Manzanares', league: 'Liga', goals: 36 }, { name: 'J. Leblanc', club: 'FC Valmora', league: 'Ligue', goals: 33 }, { name: 'G. Howard', club: 'FC Gamma', league: 'Premier', goals: 30 }] },
    palloneOro: { top3: [{ name: 'N. Mazza', club: 'AT Manzanares', league: 'Liga', ovr: 91, goals: 29, assists: 8, trofei: 'campione' }, { name: 'J. Leblanc', club: 'FC Valmora', league: 'Ligue', ovr: 84, goals: 31, assists: 4 }, { name: 'G. Howard', club: 'FC Gamma', league: 'Premier', ovr: 83, goals: 29, assists: 6 }] },
    seasonRecord: { beaten: false }, allTime: { beaten: false } };
  await page.evaluate((aw) => window.__CPM_CAREER.apriGala(aw), aw); await sleep(1500);
  const testo = () => page.evaluate(() => (document.querySelector('[data-cpm="gala51"]') || document.body).innerText);
  const ap = await testo();
  o.B3 = { apertura: (ap.match(/stasera[^\n]*/i) || [''])[0], galaAperto: /Gal[aà]/i.test(ap) };
  // si avanza fino al Trofeo d'Oro (ultimo premio), svelando le buste
  let oro = ''; const passi = [];
  for (let i = 0; i < 40 && !oro; i++) {
    const t = await testo(); passi.push(t.replace(/\n+/g, ' | ').slice(0, 110));
    if (/Premio\s*·\s*Trofeo d'Oro/i.test(t) && /Mazza/.test(t) && /gol/.test(t)) { oro = t; break; }
    const b = page.locator('[data-cpm="gala51"] button').filter({ hasText: /Apri|Svela|vincitore|Prossim|Avanti|Continua|Vai|premio/i }).first();
    try { await b.click({ timeout: 2500 }); } catch (e) { break; }
    await sleep(350);
  }
  o.B4 = { passi: process.env.CPM_DEBUG ? passi : undefined, raggiunto: !!oro, chipOro: (oro.match(/Trofeo d'Oro · [^\n]*/i) || [''])[0], testoOro: oro.slice(0, 400) };
  o.err = err.slice(0, 3);
  await ctx.close();
  return o;
}

const verde = await giro(false);
console.log('VERDE', JSON.stringify(verde));
const V = verde;
const ctrl = {
  A: V.A.trovato && V.A.pro && !V.A.u18 && !V.A.senzaAgente && V.A.cashConSponsor === 12000 && V.A.cashSenza > 0 && V.A.cashSenza === V.A.attesoSenza,
  B1: V.B1[0] === 'Mancano ancora 2 provini' && V.B1[1] === 'Manca ancora 1 provino',
  B2: V.B2.u1 === 'Stagioni Under 18: 1 di 2' && V.B2.u2 === 'Stagioni Under 18: 2 di 2' && V.B2.u2Limite && !/ultima stagione U18 disponibile/.test(V.B2.u1Ultima),
  B3: V.B3.galaAperto && /Stasera 5 premi/i.test(V.B3.apertura) && !/per te/i.test(V.B3.apertura),
  B4: V.B4.raggiunto && /Europa/i.test(V.B4.chipOro) && /OVR 91/.test(V.B4.testoOro),
};
let ok = true;
for (const [k, v] of Object.entries(ctrl)) { console.log((v ? 'OK  ' : 'KO  ') + k); if (!v) ok = false; }
if (V.err.length) console.log('errori pagina', V.err);
if (!ok) { await browser.close(); srv.close(); process.exit(1); }
if (process.env.CPM_PROVA_ROSSO === '1') {
  const R = await giro(true);
  console.log('ROSSO', JSON.stringify(R));
  const rc = {
    A: !(R.A.u18 === false && R.A.cashConSponsor === 12000) && (R.A.cashConSponsor === 0 && R.A.u18 === true),
    B1: R.B1[0] === 'Manca ancora 2 provini',
    B2: R.B2.u1 === 'Stagioni Under 18: 2 di 2',
    B3: /5 sono per te/i.test(R.B3.apertura),
    B4: R.B4.raggiunto && !/Europa/i.test(R.B4.chipOro),
  };
  for (const [k, v] of Object.entries(rc)) { console.log((v ? 'CADE ' : 'NON CADE ') + k); if (!v) ok = false; }
}
await browser.close(); srv.close();
console.log(ok ? 'piccoli-85: VERDE' : 'piccoli-85: ROSSO'); process.exit(ok ? 0 : 1);
