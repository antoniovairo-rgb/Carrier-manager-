#!/usr/bin/env node
/* [7.288.0 collaudo PO «alla vittoria matematica del campionato ci devono essere grandi festeggiamenti!» +
   «i festeggiamenti 3D non li ho mai visti, il festeggiamento deve essere anche in 2D nella dashboard»]
   GUARDIANO DELLA FESTA DEL TITOLO. La cerimonia 3D (7.2.0) vive dentro LiveMatch: parte solo se, dopo che
   il titolo è aritmeticamente certo, giochi ancora una gara DAL VIVO — ed è proprio la gara che nessuno
   gioca, perché a titolo vinto le ultime giornate si simulano (e sul percorso simulato titleStakesRef viene
   azzerato apposta). Qui si verifica la festa 2D, che non dipende da come risolvi la settimana:
     (1) titolo matematico → la card esce sulla dashboard, con margine e giornate d'anticipo VERI;
     (2) «Festeggia» la chiude, lascia una voce di diario e una nelle notizie, e non torna più;
     (3) titolo NON ancora matematico → nessuna card (anti-falso-positivo: è la prova che la card legge
         l'aritmetica e non il primo posto);
     (4) promozione aritmetica in seconda divisione → la card parla di PROMOZIONE.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node title-celebration-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

const A = { id: 'tor', n: 'FC Granata', a: 'GRA', p: 70, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };
const B = { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' };

// classifica a 18 col club dell'eroe in testa: `gap` punti sulla seconda, `giocate` giornate disputate
const mkStandings = (club, giocate, gap) => {
  const ids = club.lg === 'Lega A'
    ? ['tor', 'juve', 'inter', 'milan', 'napoli', 'roma', 'ata', 'lazio', 'fio', 'bol', 'udi', 'sas', 'cag', 'sam', 'gen', 'ver', 'mon2', 'lec']
    : ['sal', 'pal', 'spe', 'cre', 'cit', 'bre', 'pis', 'cos', 'mod', 'reg', 'sud', 'tern', 'per', 'asc', 'ces', 'ven', 'baa', 'cat'];
  return ids.map((id, i) => ({ id, n: id === club.id ? club.n : 'Club ' + id.toUpperCase(),
    pts: i === 0 ? 60 + gap : 60 - (i - 1) * 4, played: giocate, w: 18, d: 4, l: giocate - 22, gf: 55 - i, ga: 25 + i }));
};
const mkCal = (giocate, tot) => Array.from({ length: tot }, (_, i) => ({ week: i + 1, matchday: i + 1, opponentId: 'o' + i, opponentName: 'Club ' + i, isHome: i % 2 === 0, played: i < giocate, result: i < giocate ? { won: true, drew: false, homeScore: 2, awayScore: 0, simulated: true } : null }));

const save = (club, giocate, gap, tot, extra) => ({ phase: 'career', player: {
  name: 'Titolo Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 6, week: giocate + 1, age: 27, ovr: 85,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 6, presidentModalSeason: 6, drawSeen: 6,
  coachPactSeason: 6, presentedClub: club.id, seasonPledge: { season: 6, tone: 'equilibrato' }, squadRole: 'titolare',
  club, stats: { 'velocità': 85, tecnica: 85, fisico: 83, 'mentalità': 85, tiro: 88, passaggio: 83, dribbling: 86, posizionamento: 86 },
  form: 90, morale: 80, fatigue: 35, coachTrust: 85, teamChemistry: 75, popularity: 60, bankBalance: 4e6,
  goals: 24, assists: 9, matches: giocate, totalMatches: 220, totalGoals: 140, matchHistory: [],
  standings: mkStandings(club, giocate, gap), calendar: mkCal(giocate, tot),
  contract: { duration: 3, wage: 1400000, expiresAtSeason: 9 }, ...extra } });

const boot = async (s, tag) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1500 } });
  page.on('pageerror', e => issues.push(`pageerror(${tag}): ` + String(e.message).slice(0, 130)));
  await installCdnRoutes(page);
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, s);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1400);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(1000);
  return page;
};
const testo = (page) => page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '));

// ── (1)(2) titolo matematico: 33/34 giocate, 4 punti di margine → nessuno può più raggiungerti
{
  const page = await boot(save(A, 33, 4, 34), 'campione');
  const t1 = await testo(page);
  const esce = /CAMPIONI DI LEGA A/i.test(t1);
  const anticipo = /1 giornata\b/i.test(t1), margine = /4 punti/i.test(t1);
  console.log(`(1) 33/34 giocate, +4 sulla seconda → card: ${esce ? 'presente' : 'ASSENTE'} · anticipo citato=${anticipo} · margine citato=${margine}`);
  if (!esce) issues.push('(1) titolo matematico e nessuna festa sulla dashboard');
  if (esce && !(anticipo && margine)) issues.push('(1) la card non cita i numeri veri (giornate d\'anticipo / punti di margine)');

  if (esce) {
    try { await page.getByRole('button', { name: /Festeggia con la squadra/i }).first().click({ timeout: 5000 }); }
    catch (e) { issues.push('(2) bottone Festeggia non cliccabile: ' + String(e.message).slice(0, 60)); }
    await sleep(1400);
    const dopo = await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('cpm-v3')).player;
      return { txt: (document.body.innerText || '').replace(/\s+/g, ' '), cs: s.titleCelebSeason,
        diario: (s.diary || []).slice(-1)[0] || null, log: (s.log || [])[0] || '', mor: s.morale, pop: s.popularity };
    });
    const sparita = !/CAMPIONI DI LEGA A/i.test(dopo.txt);
    console.log(`(2) dopo Festeggia — card ${sparita ? 'chiusa' : 'ANCORA LÌ'} · titleCelebSeason=${dopo.cs} · diario «${(dopo.diario || {}).headline || '—'}» · notizia «${String(dopo.log).slice(0, 60)}»`);
    if (!sparita) issues.push('(2) la card resta dopo aver festeggiato');
    if (dopo.cs !== 6) issues.push(`(2) titleCelebSeason non scritto (${dopo.cs})`);
    if (!dopo.diario || !/Campioni di/i.test(dopo.diario.headline || '')) issues.push('(2) nessuna voce di diario del titolo');
    if (!/MATEMATICAMENTE CAMPIONI/i.test(dopo.log)) issues.push('(2) nessuna notizia del titolo');
    if (!(dopo.mor > 80)) issues.push(`(2) festeggiare non ha alzato il morale (${dopo.mor})`);
  }
  await page.close();
  // non deve tornare: si riparte da capo col salvataggio COME L'HA LASCIATO la festa
  // (⚠️ un page.reload non serve allo scopo — il service worker della prima load scavalca le route CDN)
  {
    const p2 = await boot(save(A, 33, 4, 34, { titleCelebSeason: 6, morale: 85 }), 'gia-festeggiato');
    if (/CAMPIONI DI LEGA A/i.test(await testo(p2))) issues.push('(2) la festa del titolo si ripete a ogni caricamento');
    else console.log('(2b) rientrando in partita la festa non si ripete');
    await p2.close();
  }
}

// ── (3) primo posto ma NON ancora aritmetico: 30/34 giocate, +4 → la seconda può ancora arrivare a +12
{
  const page = await boot(save(A, 30, 4, 34), 'in-corsa');
  const t = await testo(page);
  const esce = /CAMPIONI DI LEGA A/i.test(t);
  console.log(`(3) 30/34 giocate, +4 (la seconda può ancora superarti) → card: ${esce ? 'ESCE (falso positivo)' : 'non esce'}`);
  if (esce) issues.push('(3) la festa parte con il campionato ancora apertissimo');
  await page.close();
}

// ── (4) campione di seconda divisione: è titolo E promozione, e la card deve dirlo
{
  const page = await boot(save(B, 33, 10, 34), 'campione-B');
  const t = await testo(page);
  const tit = /CAMPIONI DI LEGA B/i.test(t), promo = /PROMOSSI IN LEGA A/i.test(t);
  console.log(`(4) seconda divisione, 33/34 e +10 → titolo=${tit} · promozione citata=${promo}`);
  if (!tit) issues.push('(4) vincere la seconda divisione non produce festa');
  if (tit && !promo) issues.push('(4) il campione di seconda divisione non viene festeggiato anche come PROMOSSO');
  await page.close();
}

// ── (5) promozione SENZA titolo: secondo posto ormai al sicuro
{
  const s5 = save(B, 33, 0, 34);
  // il leader è irraggiungibile, ma il 2° posto dell'eroe non lo può più perdere
  s5.player.standings = [{ id: 'pal', n: 'Club PAL', pts: 74, played: 33, gf: 60, ga: 20 },
    { id: 'sal', n: 'FC Salernum', pts: 62, played: 33, gf: 55, ga: 25 },
    ...['spe', 'cre', 'cit', 'bre', 'pis', 'cos', 'mod', 'reg', 'sud', 'tern', 'per', 'asc', 'ces', 'ven', 'baa', 'cat']
      .map((id, i) => ({ id, n: 'Club ' + id.toUpperCase(), pts: 58 - i * 3, played: 33, gf: 45 - i, ga: 30 + i }))];
  const page = await boot(s5, 'promo-2');
  const t = await testo(page);
  const promo = /PROMOSSI IN LEGA A/i.test(t), tit = /CAMPIONI DI LEGA B/i.test(t);
  console.log(`(5) 2° in Lega B con la promozione al sicuro → promozione=${promo} · titolo (non deve)=${tit}`);
  if (!promo) issues.push('(5) promozione aritmetica senza festa');
  if (tit) issues.push('(5) festeggiato come CAMPIONE pur non essendo primo');
  await page.close();
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — il titolo matematico si festeggia sulla dashboard, una volta sola e solo quando è davvero matematico');
