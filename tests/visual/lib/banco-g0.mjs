/* [G17 · 22/09] IL BANCO DELLA GRIGLIA, IN UN POSTO SOLO.
   Il salvataggio di prova (stagione 12) e lo script d'avvio (seme fisso, tema, rossi) stavano dentro
   `griglia-mobile.mjs`, che pero' e' un modulo che ESEGUE l'intera corsa appena lo importi: una sonda
   nuova non poteva riusarli e avrebbe dovuto copiarli — cioe' misurare una carriera diversa da quella
   del rapporto, che e' esattamente l'errore che il G16 aveva appena finito di pagare. Qui stanno una
   volta sola, e sia la griglia sia le sonde partono dalla stessa carriera. */

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
  age: 28, ovr: 82, tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 12,
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
  goals: 14, assists: 6, matches: 12, totalGoals: 80, totalAssists: 31, totalMatches: 150,
  matchHistory: Array.from({ length: 12 }, (_, i) => ({ week: i + 1, opponent: 'FC Rivale ' + i, goals: i % 3 === 0 ? 1 : 0, assists: i % 4 === 0 ? 1 : 0, rating: 7.2, won: i % 2 === 0, drew: false, homeScore: 2, awayScore: 1 })),
  seasonObjectives: { position: 5 }, records: { topSeasonGoals: 22, topSeasonAssists: 9, topOvr: 82 },
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 52, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 82, tecnica: 81, fisico: 80, 'mentalità': 82, tiro: 84, passaggio: 81, dribbling: 83, posizionamento: 82 },
  form: 78, morale: 70, fatigue: 18, contract: { duration: 2, wage: 220000, expiresAtSeason: 6 }, bankBalance: 4560000,
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
    club: { id: 'cre', n: 'FC Cremona', a: 'CRE', p: 55, c: '#8b1a1a', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
    history: [{ season: 1, goals: 8 }, { season: 2, goals: 13 }, { season: 3, goals: 17 }, { season: 4, goals: 9 }],
    awards: { palloneOros: [], scarpaOros: [] } },
  dreamClub: { id: 'cat', n: 'FC Catalunya', a: 'CAT', p: 88, c: '#1f4ea8', c2: '#8e1f33', nat: '🇪🇸', lg: 'Liga Ibérica' },
  journalists: [
    { name: 'Elena Greco', outlet: 'Sport in Rete', mood: 'neutro', rel: 52 },
    { name: 'Davide Ricci', outlet: 'Cifre del Calcio', mood: 'freddo', rel: 38 },
    { name: 'Marco Tosi', outlet: 'Zona Mista', mood: 'caldo', rel: 71 },
  ] } };

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
