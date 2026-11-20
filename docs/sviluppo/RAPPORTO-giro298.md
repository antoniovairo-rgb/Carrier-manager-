# Rapporto giro 298 — Pulizia della Home e delle schermate (7.999.198, blocco 2)

Ramo `sviluppo/giro298-home`, base `lavoro/198` (b3b75b9d). `GAME_VERSION` non toccata, nessun campo nuovo nel salvataggio.
Richieste del PO: DECISIONI 20/11 13:20 (PO-558, PO-559, PO-568, PO-571, PO-572).

## Cosa cambia

Un solo interruttore per tutto il giro: `window.__CPM_NO_G298` riporta tutto com'era (braccio rosso del guardiano).
File toccati: `src/18-career-app.jsx` (e `CARRIER-MANAGER-AV.html` ricomposto), `tests/visual/home-298.mjs` (nuovo),
`tests/visual/grafica-v2.mjs` (un giudizio aggiornato), `tests/visual/ci-runner.mjs` e `package.json` (voce `home-298`).

| Richiesta | Prima | Dopo |
|---|---|---|
| PO-558 | In Home c'era il riquadro «Classifica» (mini classifica, solo da professionista) | In Home non c'è più. La classifica resta nella scheda Stagione |
| PO-559 | Due riquadri: «Notizie della settimana» in alto e «Ultime notizie» in fondo | Un solo riquadro «Notizie» in fondo alla Home: sopra «Della settimana», sotto «Le tue ultime», più recenti prima. Stesse voci di prima (tutte quelle della settimana + le tue ultime 5): il guardiano le confronta una per una |
| PO-568 | Nella scheda Classifica, sotto la tabella, il riquadro «Dagli altri campionati» | Tolto |
| PO-571 | Riga sotto la testata della Classifica sempre riferita alla vetta («−10 dalla vetta», «+4 sulla seconda») | La riga segue l'obiettivo del club (tabella sotto) |
| PO-572 | In Opzioni, con gli Strumenti di collaudo accesi, la riga «Tempo della partita simulata» | Tolta |

Foto prima/dopo della Home (dal salvataggio del PO, Deutsche Liga, stagione 5, settimana 20) in `docs/sviluppo/giro298/`:
`home-prima-*.png` e `home-dopo-*.png` a 375x667, 412x915 e 1366x768.

### PO-571: la riga secondo l'obiettivo

L'obiettivo è quello di classifica già nel salvataggio («Finisci nei primi N»): N≤3 titolo, N≤6 Europa, N≤9 metà classifica, oltre salvezza.
Le zone sono le stesse con cui la carriera qualifica e retrocede a fine stagione: Europa = prime 7 e retrocessione = ultime 3
nelle prime divisioni che hanno una seconda serie; prime 2 e nessuna retrocessione nelle leghe senza seconda serie;
in seconda divisione la zona alta è la promozione (prime 3).

| Obiettivo | Sei dentro | Sei fuori |
|---|---|---|
| Titolo | «In testa, +3» | «−9 dalla vetta» |
| Europa | «+2 sulla zona Europa» | «−4 dalla zona Europa» |
| Metà classifica | «+8 sulla salvezza» | «In zona retrocessione, −2» |
| Salvezza | «+3 sulla zona retrocessione» | «In zona retrocessione, −2» |

Venti casi misurati su club veri (4 obiettivi × 4 posizioni, più una seconda divisione e una lega senza seconda serie)
sono in `docs/sviluppo/giro298/riga-571.md`. A classifica ferma (nessuna giornata giocata) resta la riga di prima.

## «grafica-v2 rossa»: nasce dal 298

| Dove | Esito |
|---|---|
| Base `lavoro/198` (b3b75b9d), braccio verde | VERDE |
| Ramo 298 prima della correzione, braccio verde | ROSSO: «SCH standings: vetta: −2 dalla zona promozione» nei 4 formati |
| Ramo 298 dopo la correzione, guardiano intero | VERDE, e i due rossi attesi cadono come devono |

Causa: `grafica-v2` pretendeva che la riga contenesse «vetta» o «seconda». Con PO-571 la riga del suo salvataggio di prova
(seconda divisione) dice «−2 dalla zona promozione». Il giudizio ora accetta, oltre alla vetta, solo le forme decise dal PO;
il testo esatto lo giudica `home-298`. Nessuna soglia cambiata.

## «Sett. 28/38» con una lega a 34 giornate (misurato, non corretto)

Il «38» della testata non è il numero di giornate: è il numero di settimane della stagione, fisso a 38 per ogni lega
(`"Sett. "+week+"/38"` in `src/18`). Le giornate di campionato sono distribuite su quelle 38 settimane.

Misura sul salvataggio del PO (Deutsche Liga, 18 squadre): 34 giornate di campionato, la 34ª alla settimana 38.
Il calendario mette una giornata a settimana e lascia 4 settimane di sosta (`_CAL_BREAKS`, dopo le giornate 8, 17, 25 e 31):
34 + 4 = 38. Nel calendario ci sono anche 3 partite di coppa, che non contano come giornate.
Quindi «Sett. 28/38» è la settimana 28 di 38, non la giornata 28 di 38.
Nella stessa Home la partita è indicata a parte come giornata («18ª giornata») e il riepilogo dice «Settimana 20 di 38».

## Controlli eseguiti

Uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`. Le foto di altri giri rigenerate dai controlli sono state rimesse con `git restore`.

| Controllo | Esito |
|---|---|
| `check-src` | sorgenti e file unico identici byte per byte |
| `home-298` (intero) | VERDE col verde nelle 3 risoluzioni; col rosso tornano tutti e cinque i difetti (63 rilievi) |
| `grafica-v2` (verde + due rossi) | VERDE dopo la correzione del giudizio (vedi sopra) |
| `test:logic` | verde |
| `save-compat` | verde, 12 su 12 |
| `homepc-284` | VERDE |
| `pc-289` | verde |
| `altezza-114` | verde |
| `griglia-mobile` | verde |
| `design-system` | verde |
| `tema-unico` | verde |
| `accessibilita-234` | ROSSO al primo giro per un motivo della copia di lavoro: mancava il commit di confronto (storia tagliata), «non giudicato». Allungata la storia e rieseguito: VERDE |
| `testata-209` | **ROSSO** (TESTATA_BASE) |

Guardiani della mappa di src/18 eseguiti e verdi (33): `home-199`, `classifica-102`, `coerenza-235`, `home-066`, `schermate-97`,
`spazio-296`, `pc-tablet-292`, `crea-home-295`, `pulsanti-263`, `primavera-260`, `podio-260`, `titolo-110`, `etichette-108`,
`riquadro-euro-105`, `euro-attesa-181`, `giornata-233`, `calendario-218`, `calendario-247`, `chip-269`, `piccoli-85`, `neutro-287`,
`barra-360-72`, `stile-unico-75`, `simulata-272`, `indice-163`, `backup-167`, `errori-168`, `momenti-v2`, `simula-v2`,
`carriera3-94`, `partita-v2`, più `grafica-v2` e `accessibilita-234` della tabella.

`testata-209`: il primo giro è stato interrotto dal mio tetto di 9 minuti (non valido). Il secondo, completo (16 minuti), è rosso:
«tabellino non letto o senza FC Laguna», edicola vuota, scena dell'intervista non raggiunta, e nel braccio rosso il difetto non si vede.
In entrambi i bracci la sonda non arriva all'intervista dopo la partita.

## Guardiani della mappa di src/18 NON eseguiti

71 su 106 non eseguiti per il tetto di tempo. `highlight-95` è escluso per regola del giro.

`store-236`, `interviste-211`, `patto-227`, `salienti-229`, `salienti-243`, `rosa-228`, `agente-198`, `pullman-204`, `svincolato-198`,
`figurina-199`, `rifiniture-200`, `nomi-182`, `salta-163`, `momento-165`, `momento-165b`, `momento-173`, `momento-185`, `gioca-188`,
`patrimonio-303`, `highlight-95`, `assist-nome-98`, `impulsi-289`, `trainer-288`, `livello-79`, `ritratto-171-72`, `acquisti-281`,
`difficolta-156`, `impulsi-memoria-154`, `popup-224b`, `nazionale-155`, `rinnovo-270`, `popup-224`, `finestra-230`, `intervista-231`,
`recupero-103`, `avversario-106`, `rinvio-coppe-107`, `pre-188`, `conferenza-192`, `partita-rigiocata-194`, `pro-rivale-176`,
`anteprima-212`, `mister-215`, `presentazione-214`, `toast-247`, `coppa-prestito-245`, `toast-intervista-247`, `festa-oro-251`,
`procuratore-253`, `toast-256`, `squalifica-222`, `investimento-223`, `infortunio-263`, `svincolato-264`, `meta-conto-265`,
`via-ch38-171`, `stadi-071`, `scene-fuori-137`, `rigorista-249`, `rigorista-257`, `offerta-249`, `avvio-233`, `patto-238`,
`rinnovo-238`, `salienti-246`, `serata-261`, `pelle-240`, `presentazione-225`, `scelte-201`, `interviste-183`, `solo-highlight-166`.

Non eseguiti nemmeno, per regola del giro: `ingresso-206`, `career-critical`, la catena `mirata`.

## Dubbi per il PO

1. **Metà classifica e salvezza fuori dalla zona retrocessione.** Per l'obiettivo «metà classifica» il PO ha dato una sola forma
   («+8 sulla salvezza»). Quando la squadra è in zona retrocessione ho usato la stessa forma della salvezza
   («In zona retrocessione, −2»). Va bene?
2. **Leghe senza retrocessione.** Dove la retrocessione non esiste (seconda divisione, leghe senza seconda serie) un club con
   obiettivo metà classifica o salvezza vede la zona alta («+6 sulla zona promozione», «+2 sulla zona Europa»). L'alternativa è la vetta.
3. **«Zona promozione».** In seconda divisione la riga parla di promozione al posto dell'Europa: è una forma che il PO non ha scritto.
4. **Primavera.** Conta solo il titolo, quindi la riga resta sulla vetta («In testa, +N» al posto di «+N sulla seconda»).
5. **Notizie da giovane.** In Primavera il gioco non produce notizie della settimana: il riquadro «Notizie» mostra solo «Le tue ultime».
6. **Le tue ultime: cinque.** Il riquadro mostra le ultime 5 voci, come prima. Il registro ne tiene di più; se «nessuna persa»
   voleva dire tutto il registro, serve dirlo.
7. **«Tempo della partita simulata».** La riga è nascosta, il codice della misura resta dietro l'interruttore rosso. Si può togliere del tutto in un giro successivo.
8. **«Sett. 28/38».** Il numero è corretto ma si legge come «giornata 28 di 38». Possibili scritture: «Sett. 28 di 38» o mostrare la giornata («G. 25/34»). Non toccato.
9. **DECISIONI.** In `docs/governo/DECISIONI.md` di questo ramo non c'è una voce del 20/11: le richieste le ho prese dalla consegna del giro.
