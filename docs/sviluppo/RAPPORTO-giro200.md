# Rapporto giro 200 — PO-385 (rassegna stampa a schede) · PO-448 (rifiniture degli anni lunghi)

Ramo `sviluppo/giro200-rassegna`, partito da `lavoro/195` (contiene il giro 198 «Agente/svincolato» e il giro 199 «Home/figurina»:
entrambi rispettati, i loro guardiani restano verdi). `GAME_VERSION` non toccato (nel codice resta `7.999.193`).
Rosso unico: `window.__CPM_NO_G200` (spegne la rassegna a schede e tutti i testi corretti di PO-448).

## PO-385 — la rassegna di fine partita a quattro schede

**Dov'è.** La «rassegna stampa» che il giocatore vede dopo la partita è la fase `ended` di `LiveMatch` (`src/15-live-match.jsx`):
le schermate `postmatch`/`press` di `CareerApp` non vengono mai aperte (nessun `setScreen("postmatch")` nel codice).

**Misura prima** (sonda `tests/visual/misura-200.mjs`: partita di campionato della carriera da professionista dal prompt vero,
giocata a soli highlight col pilota seedato — stessa schermata finale della partita intera, giro 166 controllo 11):

| Vista | altezza (contenuto + tasto in fondo) | blocchi più alti |
|---|---|---|
| 375×667 | **3,01 schermi** (1931 + 75 px) | tabellino della gara 548 · giornali 480 · pagella+mister+momenti 215 · risultato 170 |
| 390×844 | **2,35 schermi** | idem |

(Il giro 195 aveva misurato 3,21 su un'altra partita: l'altezza dipende da quanti blocchi ci sono.)

**Correzione** (`src/15`, solo presentazione). Quattro schede con **Avanti** e **Salta**, quattro **puntini** (toccabili, portano
alla scheda) e il nome della scheda corrente («1/4 · Risultato»):

1. **Risultato e voto** — festa del trofeo se c'è, risultato, esito ai rigori se c'è, pagella, il mister dopo la partita, momenti chiave;
2. **Le tue giocate** — la tua scelta in partita, il tuo tabellino, le connessioni degli assist, il tuo tabellino in numeri;
3. **I giornali** — testata e titolone, l'analisi, le altre testate, le parole del protagonista, migliore in campo, la curva;
4. **Classifica e prossima partita** — classifica (tre righe intorno a te, «prima dei risultati degli altri campi · questa partita: +N
   punti») e la prossima partita del calendario; sotto, il **tabellino della gara**.

Nessun contenuto tolto: le schede non visibili restano montate e nascoste (`display:none`), quindi ogni blocco e ogni testimone
`data-cpm` dei controlli esistenti c'è ancora. Il piede è una riga sola (Salta · puntini · Avanti); sull'ultima scheda resta il
tasto di sempre («Torna alla Home», `post-continua-v2`). **Salta** fa ciò che fa il tasto di sempre: salva la partita e torna alla
carriera (la regola 6.55.0 «il tasto che salva è sempre a vista» resta vera). Il tasto Invio continua a salvare e chiudere come prima.
Il provino (`trial`) resta com'era. Classifica e prossima partita sono **nuove** nella schermata (le chiedeva la decisione PO):
si leggono dal salvataggio, solo lettura, nessun campo nuovo, nessun bump di salvataggio.

**Misura dopo** (contenuto + piede, in schermi):

| Vista | scheda 1 | scheda 2 | scheda 3 | scheda 4 |
|---|---|---|---|---|
| 375×667 | 0,80 | 0,71 | 1,02 | **1,25** |
| 390×844 | 0,64 | 0,56 | 0,79 | 0,95 |

La prima stesura della scheda 4 misurava 1,51 a 375×667: l'ho stretta (piede su una riga, classifica e prossima partita in una
sezione sola, tre righe di classifica, righe del tabellino della gara più vicine — stessa lista, stesse barre — solo nelle schede).

**Dopo «Simula» e dopo la partita a soli highlight.** Soli highlight: stessa schermata, provata dal guardiano (A). Partita intera:
provata (B). **Simula**: oggi dopo Simula **non c'è nessuna rassegna** — compare solo l'avviso «Vittoria 3–1 in casa vs … · voto 8,0»
(misurato con una sonda dalla Home). Il guardiano (C) verifica che Simula salvi la partita senza errori e senza rassegna. Non ho
aggiunto una rassegna dopo Simula: sarebbe una schermata nuova sul percorso veloce, cioè una decisione (vedi dubbi).

## PO-448 — rifiniture viste negli anni lunghi (G193-18)

Elenco preciso dal documento `docs/collaudo/GIRO193-IDEE.md` (ramo `origin/collaudo/giro193-idee`) più il rilievo del giro 198.
«Riprodotto» = il braccio rosso del guardiano `rifiniture-200`, che rimette il codice di prima, mostra il difetto sul caso indicato.

| # | Voce | Riprodotto (prima) | Causa misurata | Fatto |
|---|---|---|---|---|
| 1 | Coppa delle Nazioni vinta: bilancio «sul tetto del torneo», scheda Nazionale «Eliminati (fase a gironi) · Punti 10/9» | sì: «Eliminati (fase a gironi) · Punti: 10/9» con worldMemory `won:true` | la chiusura della coppa scrive l'esito in `worldMemory` ma non `trophyWon`/`qualified` nella coda, che la scheda legge; `q.pts` comprende la finale | **corretto** (testo): esito da `worldMemory` (e `isFinal` ⇒ fase finale), punti del girone contati sulle sole gare del girone → «🏆 Campioni! · Punti nel girone: 7/9». Se la finale è persa: «🥈 Finale persa» |
| 2 | Bilancio coppa europea: «Eliminato · 12 pt nel girone» sopra «Corsa finita agli ottavi» | sì | l'intestazione stampava la fase `eliminated` senza dire dove | **corretto**: «Eliminato agli ottavi · 12 pt nel girone» (dall'ultimo turno KO giocato) |
| 3 | «Contratto attivo · 3 anni rimanenti» dopo una firma di 2 anni e dopo l'annuncio del ritiro | sì: contratto 3 stagioni con scadenza alla 5ª, a fine 3ª → «3 anni rimanenti» | il bilancio usava la durata, che conta anche la stagione appena finita | **corretto**: anni dalla scadenza vera (`_contratto49`, la stessa dell'Agente) → «2 anni rimanenti»; all'addio annunciato «Ultima stagione: hai annunciato il ritiro»; a scadenza «Contratto in scadenza» |
| 4 | Da svincolato: «Stipendio attuale €33,1 mln» e «Richiedi cessione» | sì | — | **corretto**: «Ultimo stipendio»; la sezione «Richiedi cessione» non si mostra da svincolato |
| 5 | «Gol Azzurro» per un calciatore non italiano | sì (Spagna) | etichetta fissa | **corretto**: «Gol in Nazionale» fuori dall'Italia |
| 6 | «La città ti ricorda»: «Rispettato» nel club di 11 stagioni, «Leggenda» in quello di 4 | sì | il grado si assegna quando lasci il club (Sprint 25B): finché ci giochi la voce resta «regular» = «Rispettato» | **corretto** (solo testo): per il club di oggi «Ci giochi ora». La regola del grado non è toccata |
| 7 | «la maglia numero 9 è tua» e in campo l'8 | sì | frase fissa | **corretto**: «il posto da centravanti è tuo», titolo «Il centravanti — La lista del CT» (id della fisarmonica invariato) |
| 8 | Sfida «Sempreverde» non completata a 34 anni giocati | non riprodotto | letto nel codice (non misurato): la sfida si valuta solo al passaggio di stagione (`src/18` ~5376), dopo il ritiro forzato a 40 anni e mai su `doRetire` | **non corretto**: è una regola (quando si valuta la sfida), fuori dal mandato |
| 9 | «vorra'» con l'apostrofo | sì (2 punti: wizard «addio» e avviso dell'annuncio) | — | **corretto**: «vorrà» (controllo statico: il testo vive nel wizard d'apertura) |
| 10 | Su PC l'intervista tagliata in basso | sì, a 1366×768: la finestra sta nello schermo (262→744 px) ma il contenuto è 503 px in 480 visibili: la terza risposta si raggiunge solo scorrendo dentro la finestra | la scena 3D occupa il 31% alto; sotto lo zoom 1,12 di `.cpm-scroll` le regole del giro 150 per la scena non sono divise per 1,12 (lettura del CSS, non provata) | **non corretto**: è impaginazione, non testo né numero. Foto `intervista-pc-1366-non-corretta.png` |
| 11 | «Giovane dell'Anno» ripetuto sei volte nell'elenco finale | sì (6 righe) | una riga per stagione | **corretto**: una riga «Giovane dell'Anno ×6 · Stagioni 1, 2, 3, 4, 5, 6» |
| 12 | (giro 198) da svincolato la card «Prossima» mostra la partita del club come tua, la fiducia del mister resta a vista | sì | — | **corretto**: testata «Il club gioca senza di te» + riga «Sei svincolato: FC … gioca questa partita senza di te.»; fiducia del mister tolta da Home, Club (anelli) e scheda Allenatore. Regole di Gioca/Simula invariate |

## Guardiani nuovi

- `npm run rassegna-200` — **verde 14/14, rosso bocciato.** A) soli highlight a 375×667: 4 schede, 4 puntini, Avanti e Salta;
  Avanti 1→4 col titolo che segue; ogni scheda entro 1,3 schermi (0,80 · 0,71 · 1,02 · 1,25); sull'ultima il tasto di sempre;
  scheda 4 con la tua riga di classifica e la prossima partita; **contenuto di prima: 96/96 righe** della pagina unica (riletta
  sulla stessa partita accendendo il rosso) presenti nelle 4 schede; zero errori. B) partita intera (velocità 2): 4 schede,
  i puntini riportano alla 2, Salta salva (matchHistory 0→1) e la rassegna sparisce. C) Simula: partita salvata, nessuna rassegna,
  zero errori. R) rosso: nessun puntino né Avanti, 3,01 schermi → bocciato.
- `npm run rifiniture-200` — **verde 10/10, rosso bocciato 10/10** (punti 1, 2, 3, 4, 5, 6, 7, 9, 11, 12).
- Registrati in `package.json` e in `ci-runner.mjs` (catene `completa` e `carriera`, mirata: `rassegna-200` per `src/15-`,
  `rifiniture-200` per `src/18|16|10-`, entrambi fra i passi lenti). `node --check` ok, nessun nome ripetuto in una catena.
- Sonda `misura-200.mjs` (non guardiano): altezze della schermata finale per scheda a 375×667 e 390×844.

## Controlli eseguiti (uno alla volta, CPM_CI_PAR=0, free -m e df -h prima di ognuno)

| Controllo | Esito |
|---|---|
| rassegna-200 | verde 14/14, rosso bocciato |
| rifiniture-200 | verde 10/10, rosso bocciato 10/10 |
| svincolato-198 | verde, rossi bocciati |
| home-199 | verde |
| momento-194 | verde, rossi bocciati |
| gioca-188 | verde (6 ok, 0 ko) |
| solo-highlight-166 | ESITO_166 |
| career-critical | ESITO_CC |
| test:logic | ESITO_TL |
| save-compat | ESITO_SC |

`node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE** dopo ogni modifica a `src/`.
I guardiani dei giri precedenti rigenerano le loro foto: le ho riportate allo stato del repository (`git checkout`).

## Foto (docs/sviluppo/giro200/, dpr 2)

`prima-rassegna-375.png` (pagina unica, braccio rosso) · `dopo-rassegna-375-scheda{1..4}.png` · `dopo-rassegna-390-{1..4}.png` ·
`prima-home-svincolato-375.png` (rosso) · `dopo-home-svincolato-375.png` · `intervista-pc-1366-non-corretta.png` (punto 10).

## Dubbi per il PO (nessuna decisione presa)

1. **Dopo «Simula» non c'è rassegna** (solo l'avviso col risultato). La richiesta dice «funziona anche dopo Simula»: oggi non c'è
   niente da dividere. Aggiungere le quattro schede anche dopo Simula è una schermata nuova sul percorso veloce: da decidere.
2. **Il tabellino della gara sta nella scheda 4**, sotto classifica e prossima partita. Da solo è alto 548 px a 375×667: nella
   scheda 1 (risultato) la porterebbe a ~1,4 schermi anche senza festa. Se il PO lo vuole nella 1, va accorciato (es. due colonne).
3. **Salta = salva e torna alla carriera** (come il tasto di sempre). In alternativa «Salta» potrebbe portare all'ultima scheda.
4. **La classifica della scheda 4 è quella prima degli altri campi** (le altre partite della giornata si simulano al ritorno alla
   carriera): lo dice la riga «Prima dei risultati degli altri campi · questa partita: +3 punti». Fuori dal campionato (Nazionale)
   la classifica del club non si mostra; nelle coppe del club sì.
5. **Il piede delle schede non è fissato al fondo dello schermo**: il contenitore della partita è alto quanto il contenuto (misurato:
   536 px dentro `.cpm-scroll` da 667), quindi su una scheda corta sotto il piede resta spazio vuoto. Anche prima il tasto stava in
   fondo alla pagina lunga, non fissato. Non ho toccato l'impaginazione esterna (`cpm-match-wrap`), che serve anche alle altre fasi.
6. **Invio** chiude la rassegna e salva come prima (non fa «Avanti»): ho lasciato il comportamento che le sonde esistenti usano.
7. **Punto 8 (Sempreverde)** e **punto 10 (intervista su PC)** non corretti perché regola e impaginazione: le cause scritte sopra sono
   lette dal codice, **non posso confermarle** senza una misura dedicata.
8. Punto 1: ho corretto la **lettura**; la coda della Coppa delle Nazioni continua a non salvare `trophyWon`/`qualified` (scrittura
   dello stato: fuori dal mandato «solo testi e numeri»).
9. Roadmap e `GAME_VERSION` non aggiornati (regola del giro); la riga di roadmap va scritta quando il giro viene promosso.
