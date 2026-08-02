#!/usr/bin/env node
/* [7.293.0] GUARDIANO DEL TRASFERIMENTO A STAGIONE IN CORSO + esiti KO + compagni veri.
   Quattro collaudi PO nella stessa finestra, tre dei quali hanno la stessa radice: cambiando maglia a gennaio
   il gioco buttava via la prima parte dell'anno.
     (A) #118 «non vengono calcolati/sommati i gol assist ecc della prima parte di campionato con la squadra
         precedente»: gol/assist/presenze venivano AZZERATI → il cruscotto ripartiva da zero e gli obiettivi di
         stagione diventavano irraggiungibili. Ora la stagione e' una sola: i totali proseguono, lo storico
         partite (registro del club corrente, letto dalle guardie anti-doppione) resta azzerato e la produzione
         gia' maturata si travasa in `seasonCarry`. E, per la direttiva «anche obiettivo seconda squadra»
         (7.294.0), l'OBIETTIVO del club nuovo riparte da zero su un bersaglio riscalato sulle giornate rimaste:
         i due requisiti convivono e vanno misurati nello stesso caso.
     (B) #117 «continuo a vedere il cammino della coppa nazionale sbagliato!»: un salvataggio trasferito prima
         del 7.292.0 mostrava la Coppa dell'ex club, tabellone compreso. Ora la bonifica FA RIPARTIRE la Coppa
         col club attuale se a calendario c'e' spazio; se non ce n'e', il cammino resta attribuito ma il
         tabellone di quell'altra coppa sparisce dal pannello.
     (C) #120 «l'articolo non deve essere pareggio combattuto ma eliminazione dalla coppa!»: il flag di display
         dei rigori chiedeva `clock>=90` mentre la serie parte SENZA condizione sul cronometro (dal 7.38.0 il
         fischio arriva all'ultimo highlight) → la serie si giocava e la schermata la negava.
     (D) #119 «deve esserci il cognome e deve essere effettivamente della squadra»: il compagno dello
         spogliatoio dev'essere un giocatore REALE della rosa, mostrato col cognome.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node stagione-trasferimento-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

const OLD = { id: 'juve', n: 'Torino Athletic', a: 'TAT', p: 95, c: '#f5f5f5', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Lega A' };
const NEW = { id: 'fio', n: 'FC Viola', a: 'VIO', p: 77, c: '#7c3aed', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };
// bracket di una coppa che NON contiene il club attuale = cammino di una squadra lasciata
const BR_EX = ['rbl', 'bay', 'dor', 'lev', 'fra', 'stu', 'wob', 'glad', 'kol', 'wer', 'hof', 'mai', 'aug', 'boc', 'her', 'uni'];

const save = (o) => ({ phase: 'career', player: {
  name: 'Stagione Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 8, week: o.week || 20, age: 24, ovr: 84,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 8, presidentModalSeason: 8, drawSeen: 8,
  mercatoSeen: 8, coachPactSeason: 8, presentedClub: (o.club || OLD).id, presentSeason: 8,
  seasonPledge: { season: 8, tone: 'equilibrato' }, squadRole: 'titolare', club: o.club || OLD,
  stats: { 'velocità': 84, tecnica: 84, fisico: 82, 'mentalità': 84, tiro: 87, passaggio: 82, dribbling: 85, posizionamento: 85 },
  form: 85, morale: 80, fatigue: 30, coachTrust: 78, teamChemistry: 70, popularity: 60, bankBalance: 4e6,
  goals: o.goals != null ? o.goals : 43, assists: o.assists != null ? o.assists : 12, matches: o.matches != null ? o.matches : 22,
  totalMatches: 200, totalGoals: 150, totalAssists: 50,
  matchHistory: o.mh !== undefined ? o.mh : Array.from({ length: 20 }, (_, i) => ({ week: i + 1, opponent: 'Club ' + i, goals: i < 40 ? 2 : 0, assists: i < 12 ? 1 : 0, rating: 7.3, won: true })),
  contract: { duration: 3, wage: 1500000, expiresAtSeason: 11 },
  history: [{ clubId: 'rbl', club: 'FC Lipsia', season: 7 }], ...(o.extra || {}) } });

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
const player = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('cpm-v3')).player);
const testo = (p) => p.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '));

// ── (A) #118 · la stagione non si azzera cambiando maglia
{
  const page = await boot(save({}), 'A');
  const pre = await player(page);
  console.log(`(A) prima del trasferimento: ${pre.goals} gol · ${pre.assists} assist · ${pre.matches} partite`);
  const ok = await page.evaluate((c) => window.__CPM_CAREER.setOffer({ club: c, type: 'Trasferimento', wage: 2000000, duration: 4, moralBonus: 8, fee: 40 }), NEW);
  if (ok !== true) issues.push('(A) impossibile posare l\'offerta: ' + ok);
  await sleep(700);
  await page.evaluate(() => window.__CPM_CAREER.acceptOffer());
  await sleep(2600);
  // ⚠️ dopo l'accettazione si atterra sulla PRESENTAZIONE del nuovo club: il cruscotto va riaperto,
  //    altrimenti si misura una schermata che non contiene ne' obiettivi ne' riepilogo di stagione.
  try { await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); } catch (e) {}
  await sleep(1200);
  const post = await player(page);
  const sc = post.seasonCarry || {};
  console.log(`    dopo:  ${post.goals} gol · ${post.assists} assist · ${post.matches} partite · club ${post.club.n}`);
  console.log(`    travaso: stagione ${sc.season} · ${sc.lg} gol di lega · ${sc.la} assist di lega · spell ${JSON.stringify(sc.spells)}`);
  if (post.club.id !== NEW.id) issues.push('(A) il trasferimento non è avvenuto');
  if ((post.goals || 0) !== pre.goals) issues.push(`(A) i gol di stagione sono stati azzerati (${post.goals} invece di ${pre.goals})`);
  if ((post.assists || 0) !== pre.assists) issues.push(`(A) gli assist di stagione sono stati azzerati (${post.assists})`);
  if ((post.matches || 0) !== pre.matches) issues.push(`(A) le presenze di stagione sono state azzerate (${post.matches})`);
  if ((post.matchHistory || []).length) issues.push('(A) lo storico partite del vecchio club è rimasto (le guardie anti-doppione ci inciampano)');
  if (sc.season !== 8) issues.push('(A) seasonCarry non è stato scritto');
  if ((sc.lg || 0) !== 40) issues.push(`(A) gol di lega travasati errati: ${sc.lg} invece di 40`);
  if (!(sc.spells || []).length || (sc.spells[0].n || '') !== OLD.n) issues.push('(A) lo spell non nomina il club lasciato');
  // gli obiettivi di stagione devono vedere la stagione INTERA
  const t = await testo(page);
  /* [7.294.0 direttiva PO «anche obiettivo seconda squadra»] I due requisiti convivono e vanno misurati insieme:
     il TOTALE di stagione somma le due maglie (sopra), mentre l'OBIETTIVO del club nuovo riparte da zero su un
     bersaglio riscalato sulle giornate rimaste — altrimenti arrivare a gennaio con 43 gol lo pagherebbe gia'
     centrato. ⚠️ La prima stesura cercava «Segna N gol X / Y»: a obiettivo raggiunto il progresso e' l'etichetta
     FATTO, quindi non agganciava nulla e non misurava niente. */
  const mo = t.match(/Segna (\d+) gol[^\n]{0,24}?(FATTO|\d+\s*\/\s*\d+)/);
  console.log(`    obiettivo gol a schermo: ${mo ? mo[0].replace(/\s+/g, ' ') : '(non trovato)'}`);
  if (!mo) issues.push('(A) obiettivo gol non renderizzato: impossibile misurare il progresso');
  else {
    if (mo[2] === 'FATTO') issues.push('(A) l\'obiettivo del club nuovo risulta già centrato dai gol fatti con la maglia precedente');
    else {
      const [cur, tgt] = String(mo[2]).split('/').map(x => Number(x.trim()));
      if (cur !== 0) issues.push(`(A) il conto dell'obiettivo non riparte dal club nuovo (${cur} invece di 0)`);
      if (!(tgt >= 2 && tgt < 19)) issues.push(`(A) il bersaglio non è riscalato sulle giornate rimaste (${tgt}, pieno = 19)`);
    }
    if (!/col nuovo club/i.test(t)) issues.push('(A) l\'obiettivo non dichiara di riferirsi al nuovo club');
  }
  if (!/Prima parte con il/i.test(t)) issues.push('(A) il cruscotto non dichiara la prima parte con la maglia precedente');
  await page.close();
}

// ── (B) #117 · la Coppa dell'ex club: riparte se c'è spazio, altrimenti niente tabellone
{
  const CUP_EX = { active: false, round: 1, eliminated: true, champion: false, bracket: BR_EX,
    results: [{ name: 'Ottavi di Finale', opponent: 'FC Goldwald', homeScore: 2, awayScore: 4, won: false }],
    cupBracketMatches: { r16: [{ home: 'rbl', away: 'bay', homeScore: 2, awayScore: 4, winner: 'bay', isPlayer: true }] } };
  // spazio a calendario (W20): il prossimo turno utile è la Semifinale (W35)
  const page = await boot(save({ week: 20, club: NEW, extra: { cup: CUP_EX, calendar: [] } }), 'B1');
  const p1 = await player(page);
  const cupMd = (p1.calendar || []).filter(m => m.type === 'cup' && !m.played);
  console.log(`\n(B1) coppa dell'ex club, W20 → club ${p1.cup.club} · attiva ${p1.cup.active} · turno ${p1.cup.round} · gare a calendario ${cupMd.length}`);
  if (p1.cup.club !== NEW.id) issues.push(`(B1) la Coppa non è ripartita col club attuale (club=${p1.cup.club})`);
  if (!p1.cup.active || p1.cup.eliminated) issues.push('(B1) la Coppa resta chiusa: il nuovo club non ha un cammino');
  if ((p1.cup.results || []).length) issues.push('(B1) il nuovo cammino eredita i risultati dell\'ex club');
  if (!cupMd.length) issues.push('(B1) nessuna gara di Coppa giocabile a calendario');
  await page.close();

  // nessuno spazio (W36): resta attribuito, ma il tabellone dell'altra coppa non si mostra
  const page2 = await boot(save({ week: 36, club: NEW, extra: { cup: CUP_EX, calendar: [] } }), 'B2');
  const p2 = await player(page2);
  console.log(`(B2) senza spazio, W36 → cup.club ${p2.cup.club} (ex ${p2.cup.club !== NEW.id})`);
  if (p2.cup.club === NEW.id) issues.push('(B2) senza spazio la Coppa è stata comunque riscritta');
  const nav = await page2.evaluate(() => window.__CPM_CAREER.goTab('coppe'));
  if (nav !== true) issues.push('(B2) impossibile aprire il sotto-tab Coppe: ' + nav);
  await sleep(1100);
  const t2 = await testo(page2);
  const attrib = /Cammino disputato con il/i.test(t2), tab = /TABELLONE COMPLETO/i.test(t2), cann = /Capocannonieri Coppa/i.test(t2);
  console.log(`     attribuzione: ${attrib} · tabellone dell'altra coppa: ${tab} · capocannonieri: ${cann}`);
  if (!attrib) issues.push('(B2) il cammino dell\'ex club non viene dichiarato');
  if (tab) issues.push('(B2) il pannello mostra ancora il TABELLONE della coppa di un\'altra squadra');
  if (cann) issues.push('(B2) i capocannonieri di una coppa non tua restano a schermo');
  await page2.close();
}

// ── (C) #120 · un turno KO ai rigori non è un pareggio
{
  const src = await (await import('node:fs/promises')).readFile(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');
  const gate = /const _drawShootout=!!_koSeed&&score\.home===score\.away&&\(clock>=90\|\|\(soDoneRef\.current===true\)\);/.test(src);
  const head = /FUORI AI RIGORI: \$\{_hn\} E COMPAGNI ELIMINATI/.test(src);
  console.log(`\n(C) il display segue la serie giocata: ${gate} · titolo d'eliminazione: ${head}`);
  if (!gate) issues.push('(C) il flag dei rigori dipende ancora dal solo cronometro (clock>=90)');
  if (!head) issues.push('(C) il titolone non distingue l\'eliminazione ai rigori dal pareggio');
}

// ── (D) #119 · il compagno dello spogliatoio è un giocatore vero, col cognome
{
  const page = await boot(save({ week: 12, club: OLD, extra: { teammates: [
    { name: 'Luca', archetype: 'conflittuale', icon: '😤', bond: 40 },
    { name: 'Nino', archetype: 'capitano', icon: '🎖️', bond: 50 },
    { name: 'Gigi', archetype: 'amico', icon: '😀', bond: 60 }] } }), 'D');
  const d = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')).player;
    const ros = (window.generateTeamRoster ? window.generateTeamRoster(s.club, s.season) : []).map(r => r.name);
    return { tms: (s.teammates || []).map(t => t.name), ros }; });
  console.log(`\n(D) compagni dopo il caricamento di un salvataggio coi nomi nudi: ${d.tms.join(' · ')}`);
  d.tms.forEach(n => {
    if (!/\s/.test(String(n || ''))) issues.push(`(D) «${n}» non ha cognome`);
    if (d.ros.indexOf(n) < 0) issues.push(`(D) «${n}» non è in rosa`);
  });
  /* ⚠️ Il difetto vero era nel COGNOME MOSTRATO, non nel nome memorizzato: «Diego De Luca» veniva troncato in
     «Luca» (ultimo token) e sembrava un nome di battesimo — è esattamente lo screenshot del PO. Qui si verifica
     che il nome a schermo non sia l'orfano di una particella. */
  const td = await testo(page);
  const mm = td.match(/NELLO SPOGLIATOIO\s+\S+\s+(.+?)\s*\(/);
  const shown = mm ? mm[1].trim() : null;
  const orphans = d.ros.filter(n => /\s(De|De'|Di|Del|Della|Dello|Da|Dal|Dalla|Lo|La|Van|Von|Mac|Mc)\s/i.test(' ' + n)).map(n => n.split(' ').pop());
  console.log(`    a schermo: «${shown}» · cognomi con particella in rosa: ${[...new Set(d.ros.filter(n=>/\s(De|Di|Del|Della|Da|Dal|Lo|La|Van|Von)\s/i.test(' '+n)))].join(', ') || '(nessuno)'}`);
  if (!shown) issues.push('(D) la riga dello spogliatoio non è stata renderizzata: nulla da misurare');
  else if (orphans.includes(shown)) issues.push(`(D) a schermo «${shown}»: è la coda di un cognome con particella, troncato`);
  await page.close();
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — la stagione sopravvive al trasferimento, le coppe sono del club giusto, i rigori si dichiarano');
