#!/usr/bin/env node
/* [7.287.0 collaudo PO «quando cambio squadra le coppe, in particolare quelle europee, sono giocabili?
   ho un dubbio, credo di no e sarebbe assolutamente sbagliato!»]
   GUARDIANO DELLE COPPE AL CAMBIO DI MAGLIA. Il 5.93.0 aveva insegnato alla campagna europea a SEGUIRTI,
   ma nessuno verificava che il club NUOVO l'Europa la giocasse. Quattro proprietà:
     (A) senza campagna in corso, passando a un club EUROPEO la campagna nasce (girone se siamo prima della
         prima giornata, ottavi se il girone è già andato) e le gare finiscono nel calendario GIOCABILI;
     (B) passando a un club che in Europa non c'è, la campagna che avevi si CHIUDE onestamente invece di
         portarti in Coppa dei Campioni con una squadra di metà classifica;
     (C) passando a un club europeo di tier DIVERSO, la campagna e le sue gare cambiano targa;
     (D) chi va in SECONDA DIVISIONE non trova nessuna coppa europea.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node euro-transfer-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

// club REALI del database, con prestigio noto (la soglia europea legge il prestigio EFFETTIVO)
const DA = { id: 'udi', n: 'FC Friulano', a: 'FRI', p: 65, c: '#f5f5f5', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Lega A' };      // 65 → fuori dall'Europa
const BIG = { id: 'juve', n: 'Torino Athletic', a: 'TAT', p: 95, c: '#f5f5f5', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Lega A' }; // 95 → Coppa dei Campioni
const MED = { id: 'fio', n: 'FC Viola', a: 'VIO', p: 77, c: '#7c3aed', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };        // 77 → Coppa Europa
const B2 = { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' };      // seconda divisione

const base = (club, week, extra) => ({ phase: 'career', player: {
  name: 'Euro Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 6, week, age: 26, ovr: 84,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 6, presidentModalSeason: 6, drawSeen: 6,
  coachPactSeason: 6, presentedClub: club.id, seasonPledge: { season: 6, tone: 'equilibrato' }, squadRole: 'titolare',
  club, stats: { 'velocità': 84, tecnica: 84, fisico: 82, 'mentalità': 84, tiro: 87, passaggio: 82, dribbling: 85, posizionamento: 85 },
  form: 85, morale: 85, fatigue: 30, coachTrust: 78, teamChemistry: 70, popularity: 60, bankBalance: 4e6,
  goals: 8, assists: 3, matches: 6, totalMatches: 190, totalGoals: 100, matchHistory: [],
  contract: { duration: 3, wage: 1200000, expiresAtSeason: 9 }, ...extra } });

const CAMP_UCL = { active: true, competition: 'UCL', phase: 'group', groupOpponents: [
  { id: 'rma', n: 'CF Madrid', p: 96 }, { id: 'bay', n: 'FC Baviera', p: 93 }, { id: 'psg', n: 'Paris SG', p: 90 }],
  pts: 6, groupResults: [{ opp: 'CF Madrid', hs: 2, as: 1 }, { opp: 'FC Baviera', hs: 1, as: 1 }],
  qualified: false, champion: false, eliminated: false, koResults: [], koRound: 0 };
/* [7.291.0] girone che contiene il club verso cui l'eroe si trasferisce (il caso dello screenshot: Lipsia
   aveva Torino Athletic nel girone, l'eroe passa proprio al Torino Athletic) */
const CAMP_SELF = { ...CAMP_UCL, groupOpponents: [{ id: 'juve', n: 'Torino Athletic', p: 95 },
  { id: 'mar', n: 'FC Marseille', p: 82 }, { id: 'avl', n: 'FC Aston', p: 80 }],
  groupResults: [{ opp: 'Torino Athletic', hs: 1, as: 2 }, { opp: 'FC Marseille', hs: 2, as: 0 }] };
const CAL_SELF = (fromWeek) => [5, 7, 10, 12, 14, 16].map((w, i) => ({ matchday: 900 + i, week: w, opponentId: ['juve', 'mar', 'avl'][i % 3], opponentName: ['Torino Athletic', 'FC Marseille', 'FC Aston'][i % 3], isHome: i % 2 === 0, played: w < fromWeek, result: null, type: 'euro_group', competition: 'UCL', opponentData: { id: ['juve', 'mar', 'avl'][i % 3], n: ['Torino Athletic', 'FC Marseille', 'FC Aston'][i % 3], p: 90 } }));

const CAL_EURO = (fromWeek) => [5, 7, 10, 12, 14, 16].map((w, i) => ({ matchday: 900 + i, week: w, opponentId: ['rma', 'bay', 'psg'][i % 3], opponentName: ['CF Madrid', 'FC Baviera', 'Paris SG'][i % 3], isHome: i % 2 === 0, played: w < fromWeek, result: null, type: 'euro_group', competition: 'UCL', opponentData: { id: ['rma', 'bay', 'psg'][i % 3], n: ['CF Madrid', 'FC Baviera', 'Paris SG'][i % 3], p: 92 } }));

const boot = async (save, tag) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1300 } });
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

// esegue il trasferimento sul VERO acceptTransfer, iniettando l'offerta come farebbe il gioco
const trasferisci = async (page, club) => {
  // si posa l'offerta come farebbe il gioco, si lascia ri-renderizzare, poi si accetta col VERO acceptTransfer
  const a = await page.evaluate((c) => {
    const C = window.__CPM_CAREER; if (!C || !C.setOffer) return 'no-hook';
    return C.setOffer({ club: c, type: 'Trasferimento', wage: 1500000, duration: 3, moralBonus: 8, fee: 25 });
  }, club);
  if (a !== true) return a;
  await sleep(700);
  const ok = await page.evaluate(() => window.__CPM_CAREER.acceptOffer());
  await sleep(2400);
  return ok;
};

const statoEuro = (page) => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('cpm-v3')).player;
  const cal = (s.calendar || []).filter(m => m && (m.type === 'euro_group' || m.type === 'euro'));
  return { club: s.club && s.club.n, lg: s.club && s.club.lg,
    euro: s.euro ? { active: !!s.euro.active, comp: s.euro.competition, phase: s.euro.phase, elim: !!s.euro.eliminated } : null,
    gare: cal.length, daGiocare: cal.filter(m => !m.played).length, comps: [...new Set(cal.map(m => m.competition))],
    log: (s.log || []).filter(l => /🌍/.test(l)).slice(0, 3) };
});

const casi = [
  { tag: 'A-girone',  da: DA,  a: BIG, wk: 3,  camp: null,     attesa: 'campagna creata nel girone' },
  { tag: 'A-ottavi',  da: DA,  a: BIG, wk: 20, camp: null,     attesa: 'campagna creata agli ottavi' },
  /* ⚠️ girone ANCORA IN CORSO (4/6 giocate): col girone completo euroGroupKOPatch chiude la campagna
     gia' al mount e questi tre casi non misurerebbero piu' il trasferimento — probe vacua. */
  { tag: 'B-chiusa',  da: BIG, a: DA,  wk: 13, camp: CAMP_UCL, attesa: 'campagna chiusa' },
  { tag: 'C-retarga', da: BIG, a: MED, wk: 13, camp: CAMP_UCL, attesa: 'campagna ri-targata UEL' },
  { tag: 'D-serieB',  da: BIG, a: B2,  wk: 13, camp: CAMP_UCL, attesa: 'nessuna Europa in seconda divisione' },
  /* eliminato dal girone: cambiare maglia non fa rientrare in Europa */
  { tag: 'E-nonrisorge', da: DA, a: BIG, wk: 20, camp: { ...CAMP_UCL, phase: 'eliminated', eliminated: true }, attesa: 'niente resurrezione' },
  /* [7.291.0] il club NUOVO era gia' un avversario del girone: non si gioca contro se stessi */
  { tag: 'F-sestesso', da: MED, a: BIG, wk: 13, camp: CAMP_SELF, attesa: 'scambio di posto con l\'ex' },
];

for (const c of casi) {
  const extra = c.camp ? { euro: c.camp, calendar: (c.tag === 'F-sestesso' ? CAL_SELF : CAL_EURO)(c.wk) } : {};
  const page = await boot(base(c.da, c.wk, extra), c.tag);
  const ok = await trasferisci(page, c.a);
  if (ok !== true) { issues.push(`(${c.tag}) trasferimento non eseguito: ${ok}`); await page.close(); continue; }
  const st = await statoEuro(page);
  console.log(`(${c.tag}) ${c.da.n}(p${c.da.p}) → ${c.a.n}(p${c.a.p}) alla W.${c.wk}`);
  console.log(`    euro=${st.euro ? `${st.euro.comp} ${st.euro.phase} attiva=${st.euro.active} eliminata=${st.euro.elim}` : 'assente'} · gare a calendario ${st.daGiocare} da giocare (${st.comps.join('/') || '—'})`);
  if (st.log.length) console.log(`    ${st.log[0].slice(0, 110)}`);

  const attiva = !!(st.euro && st.euro.active && !st.euro.elim);
  if (c.tag.startsWith('A')) {
    if (!attiva) issues.push(`(${c.tag}) passando a un club europeo NON nasce nessuna campagna`);
    else if (st.daGiocare < 1) issues.push(`(${c.tag}) campagna attiva ma zero gare europee giocabili a calendario`);
    else if (st.euro.comp !== 'UCL') issues.push(`(${c.tag}) tier sbagliato per un club da 95 di prestigio: ${st.euro.comp}`);
    if (c.tag === 'A-girone' && attiva && st.euro.phase !== 'group') issues.push(`(A-girone) prima della 1ª giornata si dovrebbe entrare nel GIRONE, non in ${st.euro.phase}`);
    if (c.tag === 'A-ottavi' && attiva && st.euro.phase !== 'r16') issues.push(`(A-ottavi) a girone concluso si dovrebbe entrare agli OTTAVI, non in ${st.euro.phase}`);
  }
  if (c.tag === 'B-chiusa') {
    if (attiva) issues.push('(B) la Coppa dei Campioni prosegue con un club che in Europa non c\'è');
    if (st.daGiocare > 0) issues.push(`(B) restano ${st.daGiocare} gare europee a calendario di un club non qualificato`);
  }
  if (c.tag === 'C-retarga') {
    if (!attiva) issues.push('(C) la campagna si chiude anche se il club nuovo gioca le coppe');
    else if (st.euro.phase !== 'group') issues.push(`(C) la campagna doveva restare nel girone, invece è in ${st.euro.phase} (segno che era già chiusa al mount: caso non misurato)`);
    else if (st.euro.comp !== 'UEL') issues.push(`(C) targa non aggiornata: resta ${st.euro.comp} invece di UEL`);
    else if (st.comps.some(x => x && x !== 'UEL')) issues.push(`(C) gare a calendario ancora targate ${st.comps.join('/')}`);
  }
  if (c.tag === 'F-sestesso') {
    const g = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')).player;
      return { club: s.club && s.club.n, opps: ((s.euro || {}).groupOpponents || []).map(o => o && o.n),
        res: ((s.euro || {}).groupResults || []).map(r => r && r.opp),
        cal: (s.calendar || []).filter(m => m && m.type === 'euro_group' && !m.played).map(m => m.opponentName) }; });
    console.log(`    avversari del girone: ${g.opps.join(' · ')}`);
    if (g.opps.includes(g.club)) issues.push(`(F) il girone contiene ancora il TUO club (${g.club}): si gioca contro se stessi`);
    if (!g.opps.includes('FC Viola')) issues.push('(F) la squadra che hai lasciato non prende il posto nel girone');
    if (g.res.includes(g.club)) issues.push('(F) fra i risultati archiviati resta una gara contro te stesso');
    if (g.cal.includes(g.club)) issues.push('(F) a calendario resta una gara contro te stesso');
  }
  if (c.tag === 'E-nonrisorge') {
    if (attiva) issues.push('(E) la campagna europea RISORGE cambiando maglia dopo l\'eliminazione');
    if (st.daGiocare > 0) issues.push(`(E) ${st.daGiocare} gare europee create per un eliminato`);
  }
  if (c.tag === 'D-serieB') {
    if (attiva) issues.push('(D) coppe europee in seconda divisione');
    if (st.daGiocare > 0) issues.push(`(D) ${st.daGiocare} gare europee a calendario in seconda divisione`);
  }
  await page.close();
}

// ── (H) la Coppa Nazionale non e' quella della squadra che hai lasciato
{
  const CUP_OUT = { active: false, round: 1, eliminated: true, champion: false,
    results: [{ round: 1, opponent: 'FC Goldwald', hs: 2, as: 4, won: false }], bracket: ['fio', 'x1'], cupSurvivors: ['x1'] };
  // (H1) c'è ancora spazio a calendario → la Coppa riparte col club nuovo
  const p1 = await boot(base(MED, 13, { cup: CUP_OUT }), 'coppa-riparte');
  if (await trasferisci(p1, BIG) === true) {
    const c = await p1.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')).player;
      return { club: s.club && s.club.id, cup: s.cup ? { att: !!s.cup.active, rd: s.cup.round, elim: !!s.cup.eliminated, club: s.cup.club, res: (s.cup.results || []).length } : null,
        cal: (s.calendar || []).filter(m => m && m.type === 'cup' && !m.played).length }; });
    console.log(`\n(H1) Coppa già chiusa con l'ex, trasferimento alla W.13 → ${c.cup ? `attiva=${c.cup.att} turno=${c.cup.rd} club=${c.cup.club} · ${c.cal} gara/e a calendario` : 'assente'}`);
    if (!c.cup || !c.cup.att) issues.push('(H1) la Coppa resta chiusa: col nuovo club non si rientra in corsa');
    else {
      if (c.cup.club !== c.club) issues.push(`(H1) la Coppa non è timbrata sul club nuovo (${c.cup.club})`);
      if (c.cup.res !== 0) issues.push('(H1) il nuovo cammino eredita i risultati dell\'ex squadra');
      if (c.cal < 1) issues.push('(H1) Coppa attiva ma nessuna gara a calendario');
    }
  } else issues.push('(H1) trasferimento non eseguito');
  await p1.close();

  // (H2) niente più spazio (W.36) → il cammino resta agli atti, ma attribuito all'ex
  const p2 = await boot(base(MED, 36, { cup: CUP_OUT }), 'coppa-attribuita');
  if (await trasferisci(p2, BIG) === true) {
    const c = await p2.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')).player;
      return { club: s.club && s.club.id, cupClub: s.cup && s.cup.club, att: !!(s.cup && s.cup.active),
        txt: (document.body.innerText || '').replace(/\s+/g, ' ') }; });
    console.log(`(H2) trasferimento alla W.36 → cammino attribuito a «${c.cupClub}» (club attuale «${c.club}»), attiva=${c.att}`);
    if (c.att) issues.push('(H2) la Coppa riparte anche senza spazio a calendario');
    if (c.cupClub !== 'fio') issues.push(`(H2) il cammino non resta attribuito alla squadra che l'ha disputato (${c.cupClub})`);
  } else issues.push('(H2) trasferimento non eseguito');
  await p2.close();
}

// ── (G) BONIFICA dei salvataggi GIÀ rotti: il girone contiene il club attuale, senza nessun trasferimento
{
  const rotto = base(BIG, 13, { euro: CAMP_SELF, calendar: CAL_SELF(13),
    history: [{ season: 5, club: 'FC Viola', clubId: 'fio', matches: 30, goals: 12 }] });
  const page = await boot(rotto, 'heal');
  const g = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')).player;
    return { club: s.club && s.club.n, opps: ((s.euro || {}).groupOpponents || []).map(o => o && o.n),
      res: ((s.euro || {}).groupResults || []).map(r => r && r.opp),
      cal: (s.calendar || []).filter(m => m && m.type === 'euro_group' && !m.played).map(m => m.opponentName),
      log: (s.log || []).filter(l => /Girone corretto/.test(l))[0] || null }; });
  console.log(`\n(G) salvataggio già rotto (${g.club} fra i propri avversari) → girone dopo la bonifica: ${g.opps.join(' · ')}`);
  if (g.log) console.log(`    ${g.log.slice(0, 100)}`);
  if (g.opps.includes(g.club)) issues.push(`(G) la bonifica non rimuove il club dell'eroe dal proprio girone (${g.club})`);
  if (!g.opps.includes('FC Viola')) issues.push('(G) la bonifica non mette al suo posto la squadra lasciata (dalla cronologia)');
  if (g.res.includes(g.club)) issues.push('(G) restano risultati archiviati contro se stessi');
  if (g.cal.includes(g.club)) issues.push('(G) restano gare a calendario contro se stessi');
  if (new Set(g.opps).size !== g.opps.length) issues.push(`(G) avversari duplicati dopo la bonifica: ${g.opps.join('/')}`);
  await page.close();
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — le coppe seguono il club, non il giocatore: nascono, cambiano targa o si chiudono di conseguenza');
