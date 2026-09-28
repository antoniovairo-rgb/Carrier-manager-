/* [G17 · 22/09] IL BANCO DELLA GRIGLIA, IN UN POSTO SOLO.
   Il salvataggio di prova (stagione 12) e lo script d'avvio (seme fisso, tema, rossi) stavano dentro
   `griglia-mobile.mjs`, che pero' e' un modulo che ESEGUE l'intera corsa appena lo importi: una sonda
   nuova non poteva riusarli e avrebbe dovuto copiarli — cioe' misurare una carriera diversa da quella
   del rapporto, che e' esattamente l'errore che il G16 aveva appena finito di pagare. Qui stanno una
   volta sola, e sia la griglia sia le sonde partono dalla stessa carriera. */

/* [7.999.49 parte A] CLASSIFICA COERENTE: le 18 squadre vere della Lega B, 10 giornate. Le gare del Salernum sono quelle
   del matchHistory; le altre coppie ruotano e i punteggi vengono da un generatore a seme fisso. Prima la classifica
   mancava e il gioco la ricreava tutta a zero alla settimana 11 (con 10 partite giocate in Home). */
const LEGA_B = [['par','FC Parmense','PAR',52],['cre','FC Cremona','CRE',48],['mod','FC Modenese','MOD',47],['pal','FC Sicania','SIC',50],['cat','FC Calabro','CLB',44],
  ['spe','FC Spezzino','SPE',49],['bar2','FC Pugliese','PUG',49],['ven','FC Laguna','LAG',51],['pis','FC Pisano','PIS',45],['fro','FC Ciociaro','CIO',47],['ces','FC Cesenate','CES',43],
  ['samp','FC Empolese','EMP',53],['sal','FC Salernum','SAL',45],['cit','FC Cittadino','CIT',42],['sdt','FC Altoadige','ALT',40],['cos','FC Bruzio','BRU',38],['bres','FC Leonessa','LNS',50],['lec2','FC Lariano','LAR',38]];
function classificaB(mh) {
  const T = Object.fromEntries(LEGA_B.map(([id, n, a, p]) => [id, { id, n, a, p, lg: 'Lega B', played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, pts: 0 }]));
  const byN = Object.fromEntries(LEGA_B.map(x => [x[1], x[0]]));
  const esito = (h, a, gh, ga) => { for (const [x, f, c] of [[T[h], gh, ga], [T[a], ga, gh]]) { x.played++; x.gf += f; x.ga += c; x.gd = x.gf - x.ga; if (f > c) { x.wins++; x.pts += 3; } else if (f === c) { x.draws++; x.pts++; } else x.losses++; } };
  let seme = 20260928; const rnd = () => { seme = (seme * 1103515245 + 12345) >>> 0; return seme / 4294967296; };
  const gol = (p) => Math.floor(rnd() * 2.2 + p / 60);
  mh.forEach((m, k) => { const o = byN[m.opponent]; if (m.isHome) esito('sal', o, m.homeScore, m.awayScore); else esito(o, 'sal', m.homeScore, m.awayScore);
    const resto = LEGA_B.map(x => x[0]).filter(id => id !== 'sal' && id !== o); const rot = resto.slice(k % resto.length).concat(resto.slice(0, k % resto.length));
    for (let i = 0; i < rot.length; i += 2) esito(rot[i], rot[i + 1], gol(T[rot[i]].p), gol(T[rot[i + 1]].p)); });
  return Object.values(T).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

export const SAVE = { phase: 'career', player: {
  /* [G16 · 22/09 — IL SALVATAGGIO DI PROVA ERA UNA CARRIERA CORTA, E MISURAVA UN GIOCO CHE IL PO NON VEDE.]
     Rilievo del PO con quattro screenshot dal suo Android: «la home e' ancora incasinata». Il metro pero'
     diceva Dashboard 2,06 schermate e nessun difetto. Le due cose non si contraddicono: il suo salvataggio
     e' una STAGIONE 12 e il banco stava alla 4, quindi notizie della settimana, voci di mercato, duello
     capocannoniere e ultime notizie non venivano proprio RESI — le fisarmoniche che ho appena messo li'
     non avevano niente da chiudere. Stessa cecita' dei trofei del 21/09 (G8.3), su altri quattro blocchi.
     Qui la carriera di prova va alla stagione 12 con un archivio vero: registro delle ultime notizie,
     diario, e i contatori di una carriera lunga.
     ⚠️ TUTTI I NUMERI DI ALTEZZA E DI NODI CITATI PRIMA DEL 22/09 SONO STATI MISURATI SU UNA CARRIERA
     CORTA: non si confrontano con quelli di dopo. La riga di partenza si sposta, e si dichiara. */
  name: 'Grafica Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 12, week: 11, weekLived: false,
  age: 28, ovr: 86, /* [7.999.49] 86 = quello che il gioco calcola da queste stats (la linguetta Allenamento mostrava 86, le altre l'82 scritto a mano) */ tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 12,
  presidentModalSeason: 12, drawSeen: 12, mercatoSeen: 12, coachPactSeason: 12,
  seasonPledge: { season: 12, tone: 'equilibrato' }, squadRole: 'titolare',
  log: [
    'Le parole hanno retto',
    'Rinnovo: 2 stag. a 33.3M/anno',
    "C'era il CT, in tribuna",
    '[diplomatico] «Ogni partita ha la sua storia. Ma quelle con...»',
    'vs FC Goodison (3-2) | 2 gol 1 assist | 7.8',
    'Il mister ti usa come esempio in sala video',
    'La curva canta il tuo coro',
    'Scontro al vertice in arrivo',
  ],
  coachTrust: 78, teamChemistry: 72, value: 45, popularity: 64, hasAgent: true,
  goals: 14, assists: 6, matches: 10, nationalCaps: 14, nationalGoals: 5, /* [7.999.49] 10 = partite di campionato giocate prima della W.11; presenze in Nazionale coerenti con la Coppa delle Nazioni vinta */ totalGoals: 80, totalAssists: 31, totalMatches: 150,
  /* [7.999.49 parte A] prima: 12 partite tutte 2–1 con esiti alterni, W.12 giocata alla W.11, 4 gol contro i 14 dichiarati.
     Ora 10 partite, esito coerente col punteggio e col lato (casa/trasferta), gol e assist che sommano a 14 e 6. */
  matchHistory: [[1,'FC Leonessa',1,2,0,1,0,7.6],[2,'FC Calabro',0,1,1,0,1,6.8],[3,'FC Cesenate',1,3,1,2,1,8.1],[4,'FC Empolese',0,1,1,1,0,6.9],[5,'FC Modenese',1,2,2,1,1,7.4],
    [6,'FC Altoadige',0,0,2,2,1,7.5],[7,'FC Cremona',1,2,2,2,0,7.3],[8,'FC Sicania',0,2,0,0,0,5.8],[9,'FC Pisano',1,4,1,3,1,8.6],[10,'FC Lariano',0,1,1,2,1,7.9]]
    .map(([week, opponent, casa, gf, gs, goals, assists, rating]) => ({ week, opponent, isHome: !!casa, goals, assists, rating, won: gf > gs, drew: gf === gs,
      homeScore: casa ? gf : gs, awayScore: casa ? gs : gf })),
  /* [7.999.49] il gioco salva gli obiettivi come ELENCO (generateSeasonObjectives): l'oggetto {position:5} faceva crollare «Continua alla Fine Stagione» */
  seasonObjectives: [{ type: 'goals', target: 16, label: 'Segna 16 gol', bonus: { morale: 15, coachTrust: 10, value: 0.2 } }, { type: 'standing', target: 12, label: 'Finisci nei primi 12', bonus: { popularity: 15, value: 0.25 } }],
  records: { topSeasonGoals: 19, topSeasonAssists: 7, topOvr: 86 }, /* [7.999.49] allineati allo storico allenatori (S.3: 19 gol, 7 assist) */
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' }, /* [7.999.49] com'e' nel database (era Lega A: club fuori dalla sua classifica) */
  stats: { 'velocità': 82, tecnica: 81, fisico: 80, 'mentalità': 82, tiro: 84, passaggio: 81, dribbling: 83, posizionamento: 82 },
  form: 78, morale: 70, fatigue: 18, contract: { duration: 2, wage: 220000, expiresAtSeason: 13 }, /* [7.999.49] scadeva alla S.6 con la carriera alla S.12 */ bankBalance: 4560000,
  /* [G8.3 · 21/09] TROFEI e STORICO ALLENATORI, che prima NON C'ERANO.
     Il salvataggio di prova e' fermo alla S.4 e non aveva ne' trofei ne' allenatori passati:
     due delle sezioni piu' lunghe del Profilo NON venivano proprio rese, e il metro non poteva
     vedere ne' il loro costo ne' il beneficio di richiuderle. Con una carriera vuota di archivio
     una fisarmonica sembra non servire a niente — e non e' vero, e' il banco che e' cieco.
     Tutti i numeri di altezza e di nodi di testo citati PRIMA del 21/09 sono stati misurati
     senza queste due voci: non si confrontano con quelli di dopo. */
  trophies: [
    { season: 2, club: 'FC Lipsia', league: 'Deutsche Liga' },
    { season: 3, club: 'FC Lipsia', league: 'Coppa di Germania', type: 'cup' },
    { season: 3, club: 'Italia', league: 'Coppa delle Nazioni', type: 'int', isNational: true },
  ],
  coachHistory: [
    { name: 'Rocco Marani', style: 'Catenaccio moderno', season: 2, goals: 11, assists: 4, coachTrust: 54 },
    { name: 'Uwe Brandt', style: 'Gegenpressing', season: 3, goals: 19, assists: 7, coachTrust: 81, coachChanged: true },
    { name: 'Nino Falcone', style: 'Possesso corto', season: 4, goals: 14, assists: 6, coachTrust: 78 },
  ],
  history: [{ clubId: 'rbl', club: 'FC Lipsia', season: 3 }],
  /* [22/09 · dopo tredici rilievi del PO in pochi minuti] IL BANCO NON VEDEVA CIO' CHE IL PO FOTOGRAFA.
     Il PO ha segnalato «il tuo rivale» enorme, «il club dei sogni» e «il mondo fuori» fuori standard:
     tre card che su questo salvataggio NON VENIVANO RESE, perche' i campi che le accendono non c'erano.
     E' la stessa cecita' dei trofei (G8.3): con una carriera vuota il metro giura che va tutto bene
     proprio dove il giocatore vede il difetto. Qui si accendono — rivale con la sua storia di gol,
     club dei sogni mai raggiunto, giornalisti per La Stampa.
     ⚠️ I numeri di ALTEZZA e di NODI delle schermate che ora rendono di piu' (Profilo, Dashboard)
     non si confrontano con quelli misurati prima del 22/09: c'e' dentro contenuto nuovo. */
  rival: { name: 'Bruno Salvatori', age: 27, ovr: 80, totalGoals: 62, trophies: 2, seasons: 3,
    relationship: 'compagno di viaggio',
    club: { id: 'cre', n: 'FC Cremona', a: 'CRE', p: 48, c: '#dc2626', c2: '#9ca3af', nat: '🇮🇹', lg: 'Lega B' },
    history: [{ season: 1, goals: 8 }, { season: 2, goals: 13 }, { season: 3, goals: 17 }, { season: 4, goals: 9 }],
    awards: { palloneOros: [], scarpaOros: [] } },
  dreamClub: { id: 'cat', n: 'FC Catalunya', a: 'CAT', p: 88, c: '#1f4ea8', c2: '#8e1f33', nat: '🇪🇸', lg: 'Liga Ibérica' },
  journalists: [
    { name: 'Elena Greco', outlet: 'Sport in Rete', mood: 'neutro', rel: 52 },
    { name: 'Davide Ricci', outlet: 'Cifre del Calcio', mood: 'freddo', rel: 38 },
    { name: 'Marco Tosi', outlet: 'Zona Mista', mood: 'caldo', rel: 71 },
  ] } };

SAVE.player.standings = classificaB(SAVE.player.matchHistory); /* [7.999.49] classifica coerente col matchHistory */

export const INIT = (o) => {
  if (o.fisAperte) { try { window.__CPM_FIS_APERTE = true; } catch (_e) {} }
  /* seme fisso: senza, Offerte e i pannelli che pescano a caso cambiano a ogni corsa */
  let s = o.seme >>> 0;
  Math.random = function () { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  window.__CPM_GLB = false;                       /* niente modelli 3D: qui si misura la presentazione 2D */
  /* [7.944] i rossi arrivano dalla sonda: CPM_ROSSO=__CPM_NO944 riporta i colori dei club a com'erano,
     cosi' il guardiano puo' dimostrare che il rimedio serve e non solo che il numero e' basso. */
  for (const k of (o.rossi || [])) { try { window[k] = true; } catch (_e) {} }
  try { localStorage.setItem('cpm-intro-seen', '1'); } catch (_e) {}
  try { localStorage.setItem('cpm-dark', o.tema === 'scuro' ? '1' : '0'); } catch (_e) {}   /* tema: chiaro di default, scuro con CPM_TEMA=scuro */
  if (o.save) { try { localStorage.setItem('cpm-v3', JSON.stringify(o.save)); } catch (_e) {} }
  if (o.trial) { try { localStorage.setItem('cpm-trial-prog', JSON.stringify(o.trial)); } catch (_e) {} }
};
