# Rapporto giro 232 — PO-503: la scheda 4 della rassegna parla della competizione giocata

Ramo `sviluppo/giro232-rassegna-competizione`, partito da `lavoro/196` (commit 00b8fb8, contiene i giri 224 e 230). `GAME_VERSION` non
toccata (resta 7.999.195 nel codice). Roadmap non aggiornata (regola del giro).

## Il difetto (foto del PO, 7.999.195)

`docs/collaudo-po/195-rassegna-classifica-competizione.jpg` (ramo `poc/marioprada-character-system`): dopo una partita di coppa la
scheda 4/4 mostrava la classifica del campionato e «In trasferta contro FC Goodison · Campionato · settimana 11».

**Misura prima della correzione** (braccio rosso `__CPM_NO_G232` = scheda del giro 224, partita di coppa vera, ottavi provocati in
calendario, 375×667): finita 1-1 ed eliminati ai rigori, la scheda 4 mostrava **10 righe della classifica di campionato** e come
prossima partita «In trasferta contro FC Friburgo · **Campionato** · settimana 3». Stesso difetto della foto. Causa nel codice
(`src/15-live-match.jsx`, scheda 4 del giro 224): la classifica era quella del campionato per tutto tranne `euro_group` e Nazionale, e la
prossima partita era la prima voce non giocata del calendario **di qualunque tipo**.

## Cosa cambia (solo `src/15-live-match.jsx`, solo lettura dei dati, nessun campo nuovo nel salvataggio)

Nuova funzione pura `rassegnaComp232(player, context, esito)` accanto a `_g230x()`, e il blocco della scheda 4 del giro 224 la usa.
L'esito di oggi viene da ciò che la rassegna già mostra: gol (`score.home/away`, squadra dell'eroe = `home`), vittoria anche ai rigori
(`_drawShootout`/`_shootoutWon`, stesso seme di `onMatchEnd`), fase KO europea (`mdEuroPhase`).

| Competizione (contesto) | Classifica / tabellone | Prossima partita |
|---|---|---|
| Campionato (`career`) | come il giro 224 | solo giornate di **campionato**; se non ce ne sono: «Campionato finito…» |
| Coppa europea, girone (`euro_group`) | girone (`euroGroupTable`) **con il risultato di oggi** | prossima giornata del girone dal calendario con settimana; dopo l'ultima: «Ottavi di Finale · sorteggio in attesa · settimana N» se 1°-2°, altrimenti «Eliminati alla fase a gironi (N° posto)» |
| Coppa nazionale (`cup`) | **Tabellone del turno**: turni giocati (`cup.results`) + oggi, risultato, V/N/P, «(rig.)» | se già in calendario l'avversario vero; altrimenti «Quarti di Finale · sorteggio in attesa · settimana N»; persa: «Eliminati agli …»; finale vinta: «Coppa vinta…» |
| Coppa europea KO (`euro_ko`) | Tabellone: fase a gironi (posto e punti) + turni KO (`koResults`) + oggi | come sopra («Semifinale · sorteggio in attesa · settimana N», «Eliminati ai quarti», «… vinta») |
| Coppa delle Nazioni, girone (`nationsCup`) | girone (`natGroupTable`, la stessa del pannello Nazione) con oggi | «Contro Germania · gara 3 di 3 del girone»; dopo la 3ª: «Finale · avversario annunciato al ritorno in carriera» (≥ 4 pt) o «Eliminati…» |
| Coppa delle Nazioni, finale | Tabellone: girone (punti) + finale | «… vinta» / «Sconfitti in finale» |
| Europeo/Mondiale qualificazioni | percorso (qualificazioni della stagione da `natHistory`) + oggi | prossima qualificazione, poi «Fase a gironi · contro X» o «Non qualificati» |
| Europeo/Mondiale girone | girone (`natGroupTable`) con oggi | prossima del girone, poi «Ottavi · avversario annunciato…» o «Eliminati…» |
| Europeo/Mondiale KO | Tabellone: girone (punti) + turni KO + oggi | turno successivo «avversario annunciato…», «Eliminati ai …», «… vinto» |
| Nazionale amichevole (`national`) | nessuna classifica | prossima amichevole in calendario (settimana); altrimenti la prossima gara di un torneo della Nazionale in corso; altrimenti il perché |

Titoli delle sezioni: «Classifica del girone · <competizione>», «Tabellone del turno · <competizione>», «Prossima partita ·
<competizione>» (per il campionato «Prossima partita · Campionato»). «I tuoi numeri di stagione» e il resto della scheda 4 del giro 224
restano; l'anteprima dell'avversario (bilancio V/N/P del giro 230, «Da tenere d'occhio») resta solo per il campionato. Nessuna forma
inventata (regola del giro 230). Una riga senza dato non compare (es. la settimana dei tornei della Nazionale, che non sono a
calendario).

Da dove vengono le settimane (stesse formule della carriera, `src/18`/`src/17`): coppa `max(CRW[turno], settimana+1)` con CRW
9/19/28/35; KO europei `min(37, max(24|28|34, settimana+3))`; ottavi europei dopo il girone `max(23, settimana+2)`.

`node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE** (7.627.346 byte, 21 frammenti).

## Guardiano nuovo `rassegna-232`

`tests/visual/rassegna-232.mjs`, script npm `rassegna-232`; in `ci-runner.mjs` una sola volta in `completa` e `carriera`, nelle due
mappe di `src/15-` e in `LENTI` (`node --check` verde, contato riga per riga).

- **L — logica** (17 casi, pagina viva, `window.rassegnaComp232` esposta solo sotto `?cpmtest=1`): campionato; coppa ottavi vinti /
  quarti persi / finale vinta ai rigori / turno già in calendario; Europa girone a metà e all'ultima giornata; Europa quarti vinti e
  persi; Coppa delle Nazioni gara 2, gara 3 a 6 pt, gara 3 persa, finale persa; Europeo qualificazioni, girone, quarti persi;
  amichevole. Per ognuno tipo, competizione, girone o percorso, prossima/perché.
- **P — partite vere** (soli highlight, pilota seedato 7304, 375×667, scheda 4 letta dal DOM): campionato · coppa nazionale ottavi
  (provocati in calendario) · girone europeo 3ª giornata (provocato) · Coppa delle Nazioni gara 2 (dal pannello, `apriNC243`) ·
  Europeo quarti (dal pannello, `apriNaz55`). Verifica: tipo, competizione nel titolo, nessuna riga del campionato su una coppa, girone
  con tutte le squadre / tabellone con avversario e risultato di oggi, prossima partita coerente con l'esito (vinta → turno successivo,
  persa → eliminati, pari → «(rig.)» ed esito della serie coerente), zero errori di pagina.
- **R — rosso** `__CPM_NO_G232`: stessa partita di coppa → deve essere bocciato. «Non giudicato» = rosso.

Foto: `docs/sviluppo/giro232/scheda4-{career,cup,cup-rosso,euro_group,nationsCup,euroMondiale_ko}-375x667.png`.

## Controlli (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, `free -m`/`df -h` prima)

| Controllo | Esito |
|---|---|
| rassegna-232 | **verde 27/27 · rosso bocciato**, tre passate (l'ultima sul build finale). Partite vere: campionato 2-0 → «In trasferta contro FC Friburgo · Campionato · settimana 3»; coppa 1-1, rigori persi → «Eliminati agli Ottavi di Finale.»; girone KCC 2-1 → «In trasferta contro FC Valmora · settimana 5»; Coppa delle Nazioni 1-2 → «Contro Germania · gara 3 di 3 del girone»; Europeo quarti 1-2 → «Eliminati ai quarti.». Rosso: 10 righe di campionato e «… Campionato · settimana 3» dopo la coppa |
| rassegna-224 | **verde 10/10 · rosso bocciato** (due passate, l'ultima sul build finale) |
| anteprima-230 | **verde 3/3 · rosso bocciato** (sul commit 2ab4c0c) |
| rassegna-202 | **verde 9/9 · rosso bocciato** (sul commit 2ab4c0c) |
| rassegna-200 | **verde 14/14 · rosso bocciato** (sul commit 2ab4c0c) |
| test:logic | **51/51** (due passate, l'ultima sul build finale) |
| save-compat | **12 pass · 0 fail** (due passate, l'ultima sul build finale) |

Dopo il commit 2ab4c0c ho cambiato una cosa sola: nella riga del tabellone, se la gara è finita ai rigori la casella dice V/P secondo
la serie invece di «N» (la foto della coppa mostrava «1-1 (rig.) N» accanto a «Eliminati»). Tocca solo le righe del tabellone, non la
scheda di campionato: sul build finale ho rifatto rassegna-232, rassegna-224, test:logic e save-compat; anteprima-230, rassegna-202 e
rassegna-200 non le ho rifatte. Le foto rigenerate da rassegna-200/202/224 in `docs/sviluppo/giro200|202|224/` sono state rimesse con
`git checkout --` e non committate.

## Dubbi per il PO (nessuna decisione presa)

1. **Turno successivo «sorteggio in attesa»**: nella coppa nazionale e nei KO europei/della Nazionale il gioco sorteggia l'avversario
   solo quando si torna alla carriera (`pick` non seedato in `onMatchEnd`), quindi nella rassegna il nome non esiste ancora. Per i
   tornei della Nazionale ho scritto «avversario annunciato al ritorno in carriera» (finale della Coppa delle Nazioni e turni KO
   dell'Europeo) perché lì non c'è un sorteggio. Se preferisci la stessa parola ovunque, è un ritocco di testo.
2. **Il girone si mostra «Con il risultato di oggi»**, non «prima»: le classifiche dei gironi sono costruite dai tuoi risultati
   (`euroGroupTable`, `natGroupTable`), quindi aggiungendo quello di oggi si vede esattamente la classifica che troverai tornando alla
   carriera. Per il campionato resta «Prima dei risultati degli altri campi» (gli altri campi si giocano dopo). Due regole diverse sulla
   stessa scheda: da confermare.
3. **Tornei della Nazionale senza settimana**: Coppa delle Nazioni ed Europeo/Mondiale si giocano dal pannello Nazione e non hanno una
   voce di calendario: la riga della settimana non compare.
4. **Ultima giornata del girone europeo**: il passaggio agli ottavi lo calcolo con la stessa regola del gioco (primi 2 della tabella
   con il risultato di oggi); la settimana degli ottavi è quella della carriera, `max(23, settimana+2)`.
5. **«I tuoi numeri di stagione»** su una gara di coppa mostra anche gli obiettivi del club, compreso «Finisci nei primi 6 · 7° ora»,
   che è di campionato. Li ho lasciati perché la decisione dice che il resto della scheda 4 resta.
6. **Etichetta in basso «4/4 · Classifica»**: dopo una gara a eliminazione diretta la scheda mostra il tabellone, non una classifica.
   Non l'ho cambiata (fuori dalla decisione); potrebbe dire «Tabellone» in quel caso.
7. **Amichevole della Nazionale senza altra amichevole in calendario**: mostro la prossima gara di un torneo della Nazionale in corso
   (Coppa delle Nazioni), se c'è. È la «prossima gara della Nazionale» del punto 4, ma è un'altra competizione: da confermare.
8. **Qualificazioni Europeo/Mondiale**: il percorso prende le qualificazioni della stagione dallo storico della Nazionale
   (`natHistory`, «Qualif. …»), perché lo stato del torneo salva solo i punti, non i risultati delle singole gare.
9. Partite provocate: coppa, girone europeo, Coppa delle Nazioni ed Europeo sono state **provocate** sul salvataggio sintetico
   (calendario e stato del torneo scritti dal banco), poi giocate davvero; i KO europei di club, l'amichevole e le qualificazioni sono
   verificati solo nella parte L (logica), non con una partita giocata.
