# Giro 321 — PO-349: una giornata contata due volte al caricamento

Ramo `sviluppo/giro321-salvataggio-giornata`, partito da `lavoro/201` (7.999.202). GAME_VERSION non toccata.

## 1. Misura prima

Salvataggio costruito con le funzioni del gioco (`tests/visual/salvataggio-321-test.mjs`): lega da 18 (34 giornate),
stagione 12, settimana della giornata 11, classifica a 10 giocate per tutti (ricostruita da 10 giornate giocate).

| caso | salvataggio | 7.999.202 (rosso `__CPM_NO_G321`) | giro 321 |
|---|---|---|---|
| E1 | calendario **assente** (la migrazione lo rigenera), nessuno storico | **20 giocate** (eroe 20) · giornate 1-10 risimulate dal recupero 103 · giornata 11 ritirata senza giocarla | 10 giocate · giornate 1-10 segnate giocate, nessun recupero · giornata 11 da giocare |
| E2 | calendario assente, storico delle 10 gare dell'eroe presente | 10 giocate (lo storico ferma il recupero) | 10 giocate (invariato) |
| E3 | calendario presente ma le 10 giornate **mai segnate**, nessuno storico | **20 giocate**, giornata 11 ritirata | 10 giocate |

Catena misurata (E1/E3, log del gioco): la regola (H) di `_isStaleMd` (src/18) vede la classifica avanti rispetto al
calendario (10 > 0 giornate segnate) e la bonifica 418 ritira le giornate 1-10 (`healed418`, senza risultato); il recupero
103 (`recuperaGiornateMancate`, src/09) prende proprio le voci `healed418` senza risultato, le simula e le conta di nuovo
(10 → 20); a quel punto (H) ritira anche la giornata 11, che non era mai stata giocata.

⚠️ Lezione di misura: la prima stesura della sonda leggeva il salvataggio dopo 30 fotogrammi di quiete e su E3 diceva «ok»
(il salvataggio iniziale ha gia' un calendario, l'autosalvataggio ha un rinvio di 600 ms). Ora si attende l'evento: almeno
una scrittura dell'autosalvataggio del gioco e poi 2 s di quiete sull'orologio della pagina. Con questa attesa E3 riproduce.

## 2. Un salvataggio vero puo' arrivarci?

Cercato nel codice ogni punto che genera il calendario (`generateSeasonCalendar`): creazione, passaggio pro, fine
stagione, riparazione «Primavera nel club pro» generano **sempre** calendario e classifica insieme (classifica a zero).
L'unico ramo che rigenera il calendario lasciando la classifica piena e' la migrazione con `calendar` assente o vuoto
(src/17, `if(!newP.calendar||newP.calendar.length===0)`); nessun codice del gioco di oggi scrive un calendario vuoto.
Quindi **E1 non e' raggiungibile dal gioco attuale**: servirebbe un salvataggio di una versione senza calendario o
modificato a mano. Non posso confermare se esistano salvataggi del genere.

E3 (classifica avanti rispetto alle giornate segnate, senza storico di quelle gare) e' la classe «giocata ma mai segnata»
che la storia del repo documenta piu' volte (6.91, 7.0.5, 7.5.2, 7.210) insieme a percorsi di simulazione che per un periodo
non scrivevano lo storico (nota 7.8.28 nel codice). Non ho riprodotto quella combinazione da una partita vera: **non posso
confermare** che un salvataggio vero ci arrivi, ma e' la stessa condizione per cui esiste la regola (H), che scatta solo
quando la classifica conta piu' giornate del calendario.

Per questo ho corretto invece di proporre la chiusura: la correzione e' piccola e non cambia nulla quando classifica e
calendario sono d'accordo.

## 3. Correzione

`recuperaGiornateMancate` (src/09): le giornate da recuperare sono al massimo quelle passate (settimana < corrente) che la
classifica dell'eroe non conta ancora (`passate − giocate dell'eroe`). La classifica non si azzera mai. Testimone
`window.__CPM_G321 {cand, passate, contate, max}`, rosso `window.__CPM_NO_G321` (= 7.999.202).
Casi del 103 rimisurati: A (26 contate, 33 passate → 7 recuperate), B (19 contate, 26 passate → 7), C, D: **verdi**.

Guardiano `npm run salvataggio-321` (verde, poi rosso che deve riprodurre), nella riga della MAPPA di `src/05-|src/09-`.

## 4. Controlli

- `node ci-runner.mjs giro salvataggio-321` (CPM_CI_PAR=0): **18/18 verdi** (salvataggio-321 · mappa-unica · test:logic ·
  save-compat · replay · migrazione-194 · design-system · tema-unico · griglia-mobile · career-critical · battito-264 ·
  partita-vera · render-3d-023 · tunnel-285 · gk-dive-sync · home-298 · schermate-97 · web-237).
- `career-invariants`: verde. `recupero-103` (casi A-D del giro 103): verde.
- `node tools/build-src.mjs` + `node tools/check-src.mjs`: IDENTICO byte per byte.
- Foto di altri giri rigenerate dai controlli in `docs/collaudo-grafico/`: rimesse com'erano (`git restore` / file nuovi tolti).

## Dubbi per il PO

1. Nel caso E1/E3 dopo la correzione le giornate 1-10 restano segnate giocate **senza risultato** (la bonifica 418 le
   ritira cosi'): la classifica e' giusta, ma la lista partite non mostra un punteggio per quelle giornate. Ricostruire un
   risultato inventato non mi sembra corretto; lo lascio cosi'.
2. Nel caso E2 (calendario rigenerato, storico presente) le giornate 1-10 restano **non segnate** nel calendario a
   settimana 12, anche se la classifica e lo storico le contano: non e' un doppio conteggio (fuori ambito), ma e' un
   disallineamento che si potrebbe guardare in un giro a parte.
3. La correzione conta le giornate «passate» sul calendario; se un salvataggio avesse giornate di lega con settimana
   sbagliata il tetto sarebbe piu' basso e il recupero meno generoso (mai un doppio conteggio).
