#!/usr/bin/env node
/* [7.285.0 collaudo PO ×2] GUARDIANO DEI VERDETTI DI FINE STAGIONE — due bugie della stessa famiglia:
   un giudizio pronunciato su numeri che non appartengono alla finestra di cui si sta parlando.

   (A) «18 a 1 in che senso? dopo la prima giornata ha già fatto 18 gol??»
       `rival.goals` veniva scritto UNA volta sola, al rollover: durante la stagione restava il totale
       dell'anno PRECEDENTE, ma tre punti del gioco lo confrontavano coi gol di QUELLA in corso.
       Qui si verifica che il conto del rivale MATURI con le giornate, che parta da zero, che non torni
       mai indietro, che premi il rivale più forte e che il valore archiviato al rollover sia
       ESATTAMENTE quello letto a stagione completa (altrimenti l'albo smentirebbe la cronaca).

   (B) «presidente troppo severo o mi sbaglio?» — 2° su 18 e qualificato in Coppa dei Campioni,
       e il presidente rispondeva «Stagione sufficiente — ma sufficiente non è quello per cui questo
       club paga». Qui si gioca fino al fischio finale della stagione su una classifica VERA e si
       legge quello che il presidente dice davvero a schermo.

   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node verdetti-stagione-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

// club REALMENTE di prima divisione nel database: con un club di Lega B il 2° posto sarebbe una PROMOZIONE
// e il verdetto del presidente cambierebbe legittimamente (la prima stesura usava FC Salernum, che sta in Lega B).
const CLUB = { id: 'tor', n: 'FC Granata', a: 'GRA', p: 70, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };

const boot = async (save, tag) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1500 } });
  page.on('pageerror', e => issues.push(`pageerror(${tag}): ` + String(e.message).slice(0, 130)));
  await installCdnRoutes(page);
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1400);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(900);
  return page;
};

const base = (extra) => ({ phase: 'career', player: {
  name: 'Verdetto Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 6, week: 7, age: 27, ovr: 84,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 6, presidentModalSeason: 6, drawSeen: 6,
  coachPactSeason: 6, presentedClub: 'tor', seasonPledge: { season: 6, tone: 'equilibrato' }, squadRole: 'titolare',
  club: CLUB, stats: { 'velocità': 84, tecnica: 84, fisico: 82, 'mentalità': 84, tiro: 87, passaggio: 82, dribbling: 85, posizionamento: 85 },
  form: 82, morale: 80, fatigue: 30, coachTrust: 75, teamChemistry: 65, popularity: 60, bankBalance: 3e6,
  goals: 0, assists: 0, matches: 0, totalMatches: 210, totalGoals: 118, totalAssists: 55, matchHistory: [],
  contract: { duration: 3, wage: 1200000, expiresAtSeason: 9 }, ...extra } });

// ══════════ (A) IL CONTO DEL RIVALE MATURA CON LE GIORNATE ══════════
{
  const page = await boot(base({ rival: { name: 'Marco Rivale', ovr: 84, age: 27, club: { n: 'FC Rivale', id: 'x1', p: 80, lg: 'Lega A' }, goals: 18, totalGoals: 96, seasons: 5, relationship: 'rivale' } }), 'rivale');
  const esposta = await page.evaluate(() => typeof window.rivalSeasonGoals === 'function');
  if (!esposta) { issues.push('(A) rivalSeasonGoals non raggiungibile dalla pagina — impossibile misurare'); }
  else {
    const r = await page.evaluate(() => {
      const f = window.rivalSeasonGoals;
      const cal = (n, played) => Array.from({ length: n }, (_, i) => ({ week: i + 1, matchday: i + 1, opponentId: 'o' + i, isHome: i % 2 === 0, played: i < played }));
      const mk = (played, ovr) => ({ season: 6, week: played + 1, calendar: cal(34, played), rival: { name: 'Marco Rivale', ovr, goals: 18, totalGoals: 96 } });
      const serie = [0, 3, 8, 17, 26, 34].map(k => f(mk(k, 84)));
      const pieno = f(mk(0, 84), { full: true });
      const scarso = f(mk(34, 62)), forte = f(mk(34, 90));
      const bis = f(mk(17, 84));
      return { serie, pieno, ultimo: serie[serie.length - 1], scarso, forte, det: bis === f(mk(17, 84)) };
    });
    const monot = r.serie.every((v, i) => i === 0 || v >= r.serie[i - 1]);
    console.log(`(A) conto del rivale per giornata [0,3,8,17,26,34] → ${r.serie.join(', ')} · pieno=${r.pieno}`);
    console.log(`    OVR 62 → ${r.scarso} gol · OVR 90 → ${r.forte} gol · deterministico=${r.det}`);
    if (r.serie[0] !== 0) issues.push(`(A) a giornata 0 il rivale ha già ${r.serie[0]} gol`);
    if (!monot) issues.push('(A) il conto del rivale NON è monotono (torna indietro nel corso della stagione)');
    if (r.pieno !== r.ultimo) issues.push(`(A) il totale archiviato (${r.pieno}) non coincide col conto letto a stagione completa (${r.ultimo})`);
    if (!(r.forte > r.scarso)) issues.push(`(A) il rivale forte non segna più dello scarso (${r.forte} vs ${r.scarso})`);
    if (!r.det) issues.push('(A) il conto non è deterministico');
    if (!(r.ultimo >= 5 && r.ultimo <= 24)) issues.push(`(A) totale di stagione fuori scala calcistica: ${r.ultimo}`);
  }
  await page.close();
}

// ══════════ (B) IL PRESIDENTE GUARDA IL PIAZZAMENTO ══════════
// classifica vera a 18: il club dell'eroe SECONDO con margine ampio (nessuna simulazione può ribaltarla)
const mkStandings = (pos) => {
  const ids = ['juve', 'tor', 'inter', 'milan', 'napoli', 'roma', 'ata', 'lazio', 'fio', 'bol', 'udi', 'sas', 'cag', 'sam', 'gen', 'ver', 'mon2', 'lec'];
  return ids.map((id, i) => {
    let rank = i; // ordine base
    if (id === 'tor') rank = pos;
    else if (i < pos) rank = i;
    const pts = 92 - rank * 5;
    return { id, n: id === 'tor' ? 'FC Granata' : 'Club ' + id.toUpperCase(), pts, played: 34, w: Math.round(pts / 3), d: 0, l: 34 - Math.round(pts / 3), gf: 60 - rank, ga: 25 + rank };
  }).sort((a, b) => b.pts - a.pts);
};
const mkCal = () => Array.from({ length: 34 }, (_, i) => ({ week: i + 1, matchday: i + 1, opponentId: 'o' + i, opponentName: 'Club ' + i, isHome: i % 2 === 0, played: true, result: 'W' }));

const finePartita = async (page) => {
  for (let i = 0; i < 12; i++) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; if (!C) return 'no-harness'; const res = C.step(); C.dismiss(); return res; });
    if (r === 'seasonEnd') { await sleep(1200); return true; }
    if (typeof r === 'string' && r.startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); }
    await sleep(350);
  }
  return false;
};

const leggiPresidente = async (page) => {
  // la premiazione precede la schermata di fine stagione: si attraversa fino a trovare il presidente
  for (let i = 0; i < 4; i++) {
    const q = await page.evaluate(() => {
      const t = document.body.innerText || '';
      const m = t.match(/IL PRESIDENTE[\s\S]{0,60}?«([^»]{15,400})»/i);
      return { quote: m ? m[1] : null, full: t.slice(0, 5000) };
    });
    if (q.quote) return q;
    // il gala a buste copre la schermata premi: prima si chiude quello, poi si passa a fine stagione
    let avanzato = false;
    for (const lbl of [/Salta il gala/i, /Continua alla Fine Stagione/i, /^Continua$/i]) {
      try { await page.getByRole('button', { name: lbl }).first().click({ timeout: 1800 }); avanzato = true; break; } catch (e) {}
    }
    if (!avanzato) break;
    await sleep(1000);
  }
  return await page.evaluate(() => {
    const t = document.body.innerText || '';
    const m = t.match(/IL PRESIDENTE[\s\S]{0,60}?«([^»]{15,400})»/i);
    return { quote: m ? m[1] : null, full: t.slice(0, 5000) };
  });
};

const HARSH = /sufficiente non è quello per cui questo club paga/;

// (B1) il caso segnalato: 2° su 18 + Europa, obiettivi personali NON centrati
{
  const page = await boot(base({ week: 37, standings: mkStandings(1), calendar: mkCal(),
    seasonObjectives: [{ type: 'goals', target: 40, label: '40 gol' }, { type: 'standing', target: 1, label: '1° posto' }],
    goals: 26, assists: 9, matches: 34 }), 'secondo');
  const ok = await finePartita(page);
  if (!ok) issues.push('(B1) la stagione non è arrivata al verdetto');
  else {
    const { quote, full } = await leggiPresidente(page);
    const pos = (full.match(/(\d+)°\s*posto/) || [])[1] || '?';
    console.log(`(B1) 2° su 18 + Europa, obiettivi mancati → presidente: ${quote ? '«' + quote.slice(0, 120) + '…»' : 'NESSUNA CITAZIONE TROVATA'}`);
    if (!quote) issues.push('(B1) il presidente non parla affatto nella schermata di fine stagione');
    else {
      if (HARSH.test(quote)) issues.push('(B1) al secondo posto con l\'Europa in tasca il presidente dice ancora «sufficiente non basta»');
      if (!/Europa/i.test(quote)) issues.push(`(B1) il presidente non nomina l'Europa appena conquistata: «${quote.slice(0, 90)}»`);
    }
  }
  await page.close();
}

// (B2) controprova: metà bassa della classifica, obiettivi mancati → il tono severo resta LEGITTIMO
{
  const page = await boot(base({ week: 37, standings: mkStandings(13), calendar: mkCal(),
    seasonObjectives: [{ type: 'goals', target: 20, label: '20 gol' }], goals: 6, assists: 2, matches: 34 }), 'basso');
  const ok = await finePartita(page);
  if (!ok) issues.push('(B2) la stagione non è arrivata al verdetto');
  else {
    const { quote } = await leggiPresidente(page);
    console.log(`(B2) 14° su 18, obiettivi mancati → presidente: ${quote ? '«' + quote.slice(0, 120) + '…»' : 'NESSUNA CITAZIONE'}`);
    if (!quote) issues.push('(B2) il presidente non parla');
    else if (/Europa|cosa grande|Ha fatto una cosa grande/i.test(quote)) issues.push(`(B2) il presidente si complimenta per una stagione da metà bassa: «${quote.slice(0, 90)}»`);
  }
  await page.close();
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — il rivale segna quando gioca, e il presidente guarda la classifica prima di parlare');
