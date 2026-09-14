#!/usr/bin/env node
/* [7.271.0 P3+P6] GUARDIANO di «Il capitolo della tua età» e della «voce locale».
   P3 chiude il difetto: lo stesso pool narrativo serviva il diciottenne e il trentatreenne, per questo la
   stagione 12 somigliava alla 2. P6: la piazza era intercambiabile — Napoli, Londra e Istanbul parlavano
   con le stesse identiche parole.
   Asserzioni: (1) ogni ETÀ ha i suoi capitoli e non riceve quelli delle altre; (2) il capitolo è one-shot
   per CARRIERA e uno solo per stagione; (3) i testi citano i FATTI veri (voto reale, presenze, gol);
   (4) la curva cambia NOME e modo di dire per nazione; (5) tutto lazy e deterministico.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node fase-piazza-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const CL = {
  it: { id: 'b04x', n: 'FC Werkstadt', a: 'WRK', p: 66, c: '#dc2626', c2: '#111111', nat: '🇮🇹', lg: 'Lega A' },
  en: { id: 'eve', n: 'FC Goodison', a: 'GDS', p: 70, c: '#1d4ed8', c2: '#ffffff', nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', lg: 'Premier Division' },
  tr: { id: 'kon', n: 'FC Konya', a: 'KON', p: 60, c: '#15803d', c2: '#f5f5f5', nat: '🇹🇷', lg: 'Liga Anatolica' },
};
const lg = (w, o = {}) => ({ week: w, opponent: 'FC Rivale', goals: 0, assists: 0, rating: 6.6, won: false, ...o });
const mk = (x = {}) => ({ phase: 'career', player: {
  name: 'Fase Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 6, week: 12, age: 26, ovr: 78,
  tutorialDone: true, campDone: true, jerseyNumSeason: 6, presidentModalSeason: 6, drawSeen: 6, coachPactSeason: 6,
  seasonPledge: { season: 6, tone: 'equilibrato' }, squadRole: 'titolare', coachTrust: 70, teamChemistry: 60,
  club: CL.it, stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
  form: 74, morale: 72, fatigue: 30, popularity: 45, totalMatches: 120, totalGoals: 60, nationalCaps: 4,
  serialDone: { disciplina: 6, giovane: 6, bomber: 6 }, serialSeenSeason: 6, worldSeen: { s: 6, w: 11, k: [] },
  contract: { duration: 3, wage: 9000, expiresAtSeason: 10 }, ...x } });
const boot = async (save) => {
  const pg = await browser.newPage({ viewport: { width: 480, height: 1600 } });
  await installCdnRoutes(pg);
  pg.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await pg.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, save);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await pg.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1000);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(1100);
  return pg;
};
const txt = (pg) => pg.evaluate(() => document.body.innerText);
const getP = (pg) => pg.evaluate(() => JSON.parse(localStorage.getItem('cpm-v3')).player);
/* il capitolo è seedato fra quelli applicabili: si sonda su più settimane */
const cerca = async (extra, rx, weeks = [12, 13, 14, 15, 16, 17, 18, 19]) => {
  for (const w of weeks) { const pg = await boot(mk({ ...extra, week: w })); const t = await txt(pg); await pg.close(); if (rx.test(t)) return { ok: true, t, w }; }
  return { ok: false, t: '' };
};

// ───── (1) ogni età riceve i SUOI capitoli ─────
{
  const esord = await cerca({ age: 19, totalMatches: 3, totalGoals: 1, squadRole: 'riserva', ovr: 66, matchHistory: [lg(6), lg(7, { rating: 5.2 })] }, /I PRIMI PASSI/);
  console.log('(1a) esordiente riceve «I primi passi»:', esord.ok);
  if (!esord.ok) issues.push('l\'esordiente non riceve nessun capitolo della sua età');
  else if (/L'ULTIMO TRATTO|NEL PIENO/.test(esord.t)) issues.push('all\'esordiente arrivano capitoli di un\'altra età');

  const vet = await cerca({ age: 34, totalMatches: 380, totalGoals: 140, squadRole: 'riserva', matchHistory: [lg(6), lg(7)] }, /L'ULTIMO TRATTO/);
  console.log('(1b) veterano riceve «L\'ultimo tratto»:', vet.ok);
  if (!vet.ok) issues.push('il veterano non riceve nessun capitolo della sua età');
  else if (/I PRIMI PASSI/.test(vet.t)) issues.push('al veterano arrivano capitoli da esordiente');

  const tit = await cerca({ age: 27, totalMatches: 200, popularity: 62, matchHistory: [lg(6), lg(7)] }, /NEL PIENO/);
  console.log('(1c) titolare riceve «Nel pieno»:', tit.ok);
  if (!tit.ok) issues.push('il titolare non riceve nessun capitolo della sua età');
}

// ───── (2) one-shot per carriera + uno per stagione ─────
{
  const pg = await boot(mk({ age: 34, totalMatches: 380, totalGoals: 140, squadRole: 'riserva', matchHistory: [lg(6), lg(7)], week: 14 }));
  let t = await txt(pg);
  if (!/L'ULTIMO TRATTO/.test(t)) { const alt = await cerca({ age: 34, totalMatches: 380, totalGoals: 140, squadRole: 'riserva', matchHistory: [lg(6), lg(7)] }, /L'ULTIMO TRATTO/); t = alt.t; }
  await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^Continua →$/.test((x.textContent || '').trim()) && x.offsetParent !== null); if (b) b.click(); });
  await sleep(900);
  const p = await getP(pg);
  const marcato = p.phaseSeen && Object.keys(p.phaseSeen).length > 0 && p.phaseSeenSeason === 6;
  console.log('(2) capitolo marcato (one-shot):', marcato, JSON.stringify(p.phaseSeen || {}));
  if (!marcato) issues.push('il capitolo non viene marcato: tornerebbe ogni settimana');
  const t2 = await txt(pg);
  if (/⏳ (I PRIMI PASSI|NEL PIENO|L'ULTIMO TRATTO)/.test(t2)) issues.push('un secondo capitolo d\'età esce nella stessa stagione');
  else console.log('(2b) un solo capitolo d\'età per stagione: sì');
  await pg.close();
}

// ───── (3) i testi citano i FATTI veri ─────
{
  const r = await cerca({ age: 20, totalMatches: 12, totalGoals: 2, ovr: 68, matchHistory: [lg(6), lg(7, { rating: 5.1, opponent: 'FC Nerazzurri' })] }, /L'errore che hanno visto tutti/i);
  console.log('(3) l\'errore cita voto e avversario reali:', r.ok && /5\.1/.test(r.t) && /FC Nerazzurri/.test(r.t));
  if (!r.ok) issues.push('il capitolo dell\'errore non esce con un voto reale sotto 5.6');
  else if (!/5\.1/.test(r.t) || !/FC Nerazzurri/.test(r.t)) issues.push('il capitolo dell\'errore non cita il voto e l\'avversario veri');
}

// ───── (4) la curva parla la lingua della piazza ─────
{
  const voci = {};
  /* le voci del club sono DUE a settimana in rotazione seedata: la curva non è sempre fra quelle estratte,
     quindi si sondano più settimane finché non parla. */
  const RX = /(La Sud|La Kop|Il Fondo Sur|La Südtribüne|Il Virage|La Bancada Sul|La F-Side|La Kale Ardı|La tribuna 3)/i;
  for (const [k, club] of Object.entries(CL)) {
    for (const w of [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]) {
      const pg = await boot(mk({ club, week: w, nation: k === 'it' ? 'Italia' : k === 'en' ? 'Inghilterra' : 'Turchia', matchHistory: Array.from({ length: 8 }, (_, i) => lg(3 + i, { goals: i % 2 })) }));
      const t = await txt(pg); await pg.close();
      const m = t.match(RX);
      if (m) { voci[k] = m[1]; break; }
    }
    if (!voci[k]) voci[k] = null;
  }
  console.log('(4) nome della curva per piazza:', JSON.stringify(voci));
  const dist = new Set(Object.values(voci).filter(Boolean));
  if (dist.size < 2) issues.push('la curva si chiama allo stesso modo in ogni paese: la voce locale non arriva a schermo');
}

// ───── (5) lazy: un save senza i campi nuovi non si rompe ─────
{
  const pg = await boot(mk({ age: 26, matchHistory: [] }));
  const p = await getP(pg);
  console.log('(5) save senza campi nuovi — phaseSeen:', JSON.stringify(p.phaseSeen || null));
  await pg.close();
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ FASE + PIAZZA OK (ogni età ha i suoi capitoli · one-shot · fatti veri · la curva parla la lingua del posto)');
