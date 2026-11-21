# Rapporto giro 300 — pre-partita e PC (PO-565 · PO-551 · PO-552 · PO-553)

Base `lavoro/198` (7.999.198, `GAME_VERSION` non toccata) · ramo `sviluppo/giro300-prepartita-pc` · interruttore rosso unico
`window.__CPM_NO_G300` (tutto torna com'era nella 198) · guardiano nuovo `npm run prepartita-pc-300`.

File di `src/` toccati: `01` (interruttore `_g300`), `13` (tasto dei salienti), `15` (scritte dell'highlight e della pausa),
`17` (provino, Home, offerte), `19` (due regole CSS). **`src/11` e `src/18` non toccati** (nessun RAD di `src/11` modificato;
la Home del giro 298 in `src/18` non è stata toccata: i tasti degli slot stanno in `src/17`, `HomeScreen`).
`CARRIER-MANAGER-AV.html` ricomposto con `node tools/build-src.mjs`; `node tools/check-src.mjs` → IDENTICO BYTE PER BYTE.

## Prima / dopo (misure del guardiano, «prima» = braccio rosso `__CPM_NO_G300`)

| Punto | Schermo | Prima | Dopo |
|---|---|---|---|
| PO-565 tasto «Gioca solo i momenti salienti» | 1366×768 | bordo 1 px dello stesso colore del fondo (`rgb(38,43,55)`), titolo crema, nessuna icona, alto 57 px | bordo 2 px `rgb(187,141,146)` (colore del club reso leggibile sul fondo), titolo nello stesso colore (4,95:1 sul fondo), icona ⚡, fondo invariato `rgb(38,43,55)`, nota dentro il tasto, alto 66 px |
| | 375×667 · 412×915 | come sopra, alto 73 px | come sopra, alto 82 px |
| PO-551 «Inizia il provino» | 1366×768 | 61 px di vuoto fra l'ultimo riquadro e il tasto; tasto in fondo allo schermo | 8 px (il margine fra due riquadri è 9): tasto attaccato al contenuto |
| | 412×915 | tasto in fondo (2 px dal fondo utile), 99 px sopra | identico (la regola vale da 900 px in su) |
| | 375×667 | la pagina scorre, tasto dopo il contenuto (8 px) | identico |
| PO-552 tasti «1 2 3» della Home | 1366×768 | tre `<span>` 49×49: il clic non fa nulla | tre `<button>` 49×49: clic su «1» apre la carriera salvata, clic su «2» (slot libero) apre la creazione — come i tasti 1 e 2 della tastiera, che continuano a funzionare |
| | telefono | i tasti non compaiono (sotto 640 px) | identico |
| PO-553 suggerimenti di tasti | 1366×768 | «📍 zona · WASD», «Diagonali: due frecce insieme», «💡 Muoviti (WASD) per cambiare le opzioni d'azione.», numeri «1 2 3» davanti alle giocate e agli stili dei piazzati, «Premi P o tocca per riprendere» | nessuna di queste scritte; il consiglio diventa «💡 Muoviti col pad per cambiare le opzioni d'azione.» e la pausa «Clicca per riprendere» |
| | telefoni (banco con tastiera) | «Premi P o tocca per riprendere» | «Clicca per riprendere» |

Scorciatoie misurate ancora attive nei due bracci, a tutte e tre le misure: W/A/S/D spostano l'eroe, `1` fa partire la giocata e
sceglie lo stile del piazzato, `P` mette e toglie la pausa, `1`/`2` nella Home aprono lo slot.

Nota sul «~250 px» della segnalazione PO-551: a 1366×768 il vuoto misurato è 61 px; cresce con l'altezza della finestra (la
schermata era «piena», il blocco del contenuto era centrato e il tasto in fondo). Non ho misurato la finestra esatta del PO:
non posso confermare il valore 250, solo il meccanismo e la sua correzione.

## Cosa è cambiato nel codice

1. **PO-565** (`src/13`, `MatchdayCard`): con `_g300()` il tasto prende `border: 2px solid <colore del club>` e il titolo lo stesso
   colore. Il colore è quello della squadra del giocatore (`mySide`), passato da `legCol944(colore, TINTE.tasto)` che lo schiarisce
   finché si legge sul fondo del tasto. L'icona ⚡ è disegnata con `::before` (`[data-icona300]`, `src/19`): il nome del tasto resta
   «Gioca solo i momenti salienti» per i lettori di schermo e per i guardiani che lo cercano per nome. Nota del giro 287 invariata.
2. **PO-551** (`src/17` + `src/19`): la schermata porta la classe `cpm-provino300`; da 900 px in su non è più a tutta altezza e il
   blocco del contenuto non cresce. Sotto 900 px nessuna regola: resta la «schermata piena» G184-02.
3. **PO-552** (`src/17`, `HomeScreen`): i tre `span.kbd` diventano `button.kbd` con lo stesso ramo del gestore `keydown`
   (`slots[i] ? onLoad(i) : onNew(i)`), `aria-label`, 44×44 minimi.
4. **PO-553** (`src/15`, `src/17`): tolti «· WASD», le due righe «Diagonali: due frecce insieme», «(WASD)» nel consiglio, i numeri
   1-3 davanti alle giocate (due impaginazioni) e agli stili dei piazzati, «Premi P o» nella pausa, il numero accanto a «Scegli →»
   nella schermata delle offerte. Nessun gestore di tastiera toccato.

## Guardiano `npm run prepartita-pc-300`

Quattro parti (A tasto dei salienti · B provino · C Home · D suggerimenti di tasti, statico + a schermo in tre scene vere e in
pausa), a 375×667, 412×915 e 1366×768, verde e rosso. «Non giudicato» = rosso. Esito sull'ultimo build:
**VERDE ✓ · ROSSO ✓ (cade su A pc+telefono, B pc, C pc, D pc+telefono; 17 rilievi; scorciatoie funzionanti nei due bracci)**.
Uscita intera in `docs/sviluppo/giro300/prepartita-pc-300.txt`; foto `prima-*` (rosso) e `dopo-*` (verde) nella stessa cartella.

Limiti dichiarati del guardiano:
- al telefono il braccio rosso di D cade solo sulla scritta della pausa: il banco ha una tastiera, quindi mostra «Premi P…» anche a
  375 e 412 px; su un telefono vero quella scritta era già «Tocca per riprendere». I numeri 1-3 e «WASD» al telefono non
  c'erano già prima (misurato: 0 nel rosso);
- la schermata delle offerte (numero accanto a «Scegli →») è giudicata solo in statico: la sonda non gioca i tre provini;
- C apre uno slot occupato (salvataggio di prova `fixtures/save-c177-s1w15.json`) e uno libero; lo slot corrotto non è provato.

## Guardiano adeguato

`diagonali-210`: il punto K pretendeva la PRESENZA della riga «Diagonali: due frecce insieme» (PO-401 E, giro 210). PO-553 la
toglie: ora pretende la sua ASSENZA. È un requisito cambiato dal PO, nessuna soglia abbassata; l'accordo da tastiera continua a
essere misurato.

## Controlli eseguiti

Uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), sul build finale.

| Controllo | Esito | Durata | Ultima riga / nota |
|---|---|---|---|
| `prepartita-pc-300` (nuovo) | verde col verde, rosso col rosso | ~4 min | VERDE ✓ · ROSSO cade su Apc Atel Bpc Cpc Dpc Dtel (17 rilievi) |
| `test:logic` | verde (uscita 0) | 3 s | # duration_ms 3097.372817 |
| `save-compat` | verde (uscita 0) | 2 s | ✅ PASS |
| `prepartita-287` | verde (uscita 0) | 43 s | ROSSO (__CPM_NO_G287, la schermata di prima): ✅ cade su N, S e V come deve |
| `avviso-290` | verde (uscita 0) | 106 s | ROSSO: CADE (come deve) su ogni percorso |
| `zero-288` | verde (uscita 0) | 17 s | zero-288: ✓ (VERDE+ROSSO) |
| `homepc-284` | verde (uscita 0) | 23 s | ✅ homepc-284 VERDE |
| `pc-289` | verde (uscita 0) | 188 s | pc-289: VERDE |
| `provini-201` | verde (uscita 0) | 18 s | ✅ provini-201 verde |
| `altezza-114` | verde (uscita 0) | 205 s | PASS altezza-114 (vuoto <= 12% o pagina che scorre, tocco >= 44) — bracci verde+rosso |
| `griglia-mobile` | verde (uscita 0) | 215 s | ESITO griglia-mobile: uscita 0 · MOTIVO misura completa: 14 schermate x 5 larghezze |
| `solo-highlight-166` | verde (uscita 0) | 950 s | ROSSO: CADE (come deve) su 3, 7 e 8 |
| `battito-264` | verde (uscita 0) | 406 s | ROSSO: CADE (come deve): la partita intera diverge dai soli highlight |
| `diagonali-210` | ROSSO (uscita 1) | 158 s | **ROSSO**: 12 difetti, tutti sul punto K «accordo di due frecce» (i due tasti arrivano alla pagina a ~200 ms l'uno dall'altro: 2 passi invece di 1). **Misurato identico sulla base `lavoro/198`** in questa stessa sessione (12 difetti K, stesso testo): non nasce dal giro 300. Il punto adeguato (riga d'aiuto assente) non è fra i difetti. |
| `pc-tablet-292` | verde (uscita 0) | 696 s | PC-TABLET-292: ✅ VERDE |
| `typing-shortcuts` | verde (uscita 0) | 15 s | ✅ PASS — chi scrive tiene la tastiera: nessuna scorciatoia gli ruba i tasti |
| `accessibilita-234` | ROSSO (uscita 1) | 100 s | primo giro rosso per «M manifest… non giudicato (git)»: nella copia del repo mancava il commit `ea02adf0^` (clone corto). Scaricata la storia (`git fetch --deepen`) e rifatto: vedi riga sotto. |
| `salienti-243` | verde (uscita 0) | 215 s | ROSSO: CADE (come deve): nessun tasto nella schermata pre-partita, Mondiale e amichevole non apribili a soli salienti |
| `accessibilita-234` (rifatto) | verde (uscita 0) | — | ✓ accessibilita-234 VERDE |
| `diagonali-210` sulla base `lavoro/198` (confronto) | ROSSO (uscita 1) | — | stessi 12 difetti K: rosso preesistente in questo ambiente |
| `salienti-246` | **non concluso** | — | fermato dopo ~10 minuti per il tetto di tempo: non vale |
| `node tools/build-src.mjs` + `node tools/check-src.mjs` | IDENTICO BYTE PER BYTE | — | dopo ogni modifica a `src/` |

## Controlli della MAPPA NON eseguiti

La MAPPA di `tests/visual/ci-runner.mjs`, unione delle righe per i cinque file toccati, dà **255 controlli** (`src/19` porta con sé
l'intera catena «completa»). Nel tempo del giro ne sono stati eseguiti quelli della tabella qui sopra. **Non eseguiti:**

240 controlli della MAPPA non eseguiti (compreso `salienti-246`, non concluso):

`nomi-248`, `nomi-251`, `interviste-211`, `spogliatoio-182`, `indice-163`, `salta-163`, `momento-165`, `momento-165b`, `momento-173`, `momento-185`, `tema-unico`, `grafica-v2`, `momenti-v2`, `carriera3-94`, `spazio-296`, `crea-home-295`, `impulsi-289`, `piccoli-85`, `trainer-288`, `acquisti-281`, `difficolta-156`, `stili-098`, `stili-098-migrazione`, `stile-unico-75`, `neutro-287`, `classifica-102`, `partita-rigiocata-194`, `backup-167`, `errori-168`, `via-ch38-171`, `coerenza-235`, `interviste-183`, `intervista-231`, `portiere-265`, `rigorista-257`, `tunnel-285`, `formazioni-262`, `tunnel-245`, `coreografie-244`, `guardalinee-222`, `dribbling-226`, `tocco3d-219`, `lotteria-191`, `piazzato-204`, `pullman-204`, `nomi-182`, `chiusura-99`, `parata-100`, `consegna-103`, `colla-103`, `contatto-103`, `assist-298`, `scena3d-96`, `panchina-293`, `ingresso-285`, `corpi-073`, `ingresso-276`, `stadi-064`, `render-3d-023`, `avvicinamento-61`, `linee-61`, `pallone-278`, `ingresso-277`, `inquadra-273`, `salti-274`, `memoria-275`, `buildup-sync`, `po229-gi38`, `gk-dive-sync`, `gk-miss-229`, `portiere-223`, `goal-postarc`, `esiti-218`, `cross-218`, `scene-221`, `fila-227`, `bambini-294`, `validate-situations`, `partita-vera`, `bambini-236`, `pressing-143`, `conduci-242`, `ingresso-245`, `giornale-244`, `difesa-220-scena`, `ingresso-camminata-245`, `analisi-217`, `piedi-252`, `rete-252`, `difesa-252`, `rinvio-252`, `portiere-252`, `aereo-252`, `difesa-220-giro31`, `apertura-261`, `parata-258`, `esiti-241`, `camera-252`, `reazione-252`, `spot-266`, `testa-143`, `stadi-071`, `cerimonie`, `passaggio-coppa-137`, `kit-061`, `strisce-corpo`, `portatore-286`, `intercetto-291`, `coreografie-252`, `avvio-233`, `camera-241`, `salienti-246`, `pelle-240`, `notte-206`, `tpose-196`, `esito-282`, `rassegna-232`, `salienti-229`, `barra-221`, `tabellone-214`, `rassegna-200`, `rigore-191`, `partita-v2`, `intro-292`, `riserva-103`, `riserva-104`, `assist-nome-98`, `esiti-96`, `partita2d-297`, `colori-286`, `cori-291`, `rigore-79`, `voto-79`, `pagella-75`, `ripartenza-235`, `pallino-278`, `pillola-58`, `esito-280`, `tabellino-lati`, `stat-279`, `fps-249`, `lessico-218`, `tabellino-228`, `minuti-202`, `ripresa-202`, `recupero-202`, `finale-202`, `tetto-202`, `tempo-138`, `interazioni-226`, `schede-234`, `catalogo-022`, `ripartenza-207`, `schede-246`, `attesa-241`, `schede-259`, `schede-260`, `tecnica-045`, `esiti-60`, `spazio-270`, `forma-239`, `rigorista-249`, `patto-238`, `salienti-253`, `scelte-197`, `rassegna-202`, `rassegna-224`, `anteprima-230`, `riserva2d-205`, `avviso3d-209`, `simula-215`, `riproduci-175`, `riproduci-187`, `calendario-218`, `figurina-199`, `patrimonio-303`, `schermate-97`, `ritratto-171-72`, `popup-224b`, `chip-269`, `badge-255`, `finestra-230`, `popup-224`, `migrazione-194`, `convocazione-235`, `toast-247`, `brusio-238`, `toast-intervista-247`, `festa-oro-251`, `crediti-254`, `toast-256`, `pulsanti-263`, `classifica-259`, `primavera-260`, `podio-260`, `web-237`, `serata-261`, `store-236`, `rinnovo-238`, `offerta-249`, `moves-budget`, `patto-227`, `presentazione-225`, `rosa-228`, `tocco-213`, `gigante-212`, `nomi-211`, `sigle-203`, `scelte-201`, `agente-198`, `svincolato-198`, `home-199`, `rifiniture-200`, `cerimonie-192`, `momento-194`, `nomi-190`, `nomi-salvati-190`, `convocazione-190`, `testi-190`, `cronaca-nomi-190`, `box-fischio-169`, `gol-eroe-154`, `grafica-168`, `simula-v2`, `livello-79`, `passaggi-228`, `test:vision`, `replay`, `scena-motore-147`, `manovre-150`, `testata-209`, `nomi-219`, `difesa-220`, `procuratore-253`, `design-system`, `giornata-233`, `prima-partita-237`, `statistiche-228`, `clip-180`, `licenze-184`

Fuori MAPPA ma richiesti dalla consegna ed eseguiti: `zero-288`, `homepc-284`, `pc-289`, `avviso-290`, `altezza-114` (se non compaiono nella MAPPA dei file toccati sono comunque nella tabella sopra).

(`highlight-95`, `ingresso-206` e `career-critical` non eseguiti per consegna.)

## Note per chi rilascia

- `prepartita-pc-300` **non è stato aggiunto** a `CATENE`/`MAPPA` di `tests/visual/ci-runner.mjs`: il file è toccato dai giri paralleli; va aggiunto alla riunione dei rami (righe di `src/13`, `src/15`, `src/17`, `src/19`).
- `diagonali-210` è rosso anche sulla base in questo ambiente (punto K): da rimisurare su una macchina meno lenta prima di contarlo.
- Le foto di altri giri rigenerate dai controlli (`docs/sviluppo/giro284/…`, `docs/collaudo-grafico/…`) sono state rimesse con `git restore`.

## Dubbi per il PO

1. **Voce PO-553 nel backlog.** In `docs/governo/BACKLOG.md` di `lavoro/198` non c'è una voce PO-553 (né PO-551, PO-552, PO-565):
   l'elenco usato è quello dei «Dubbi per il PO» del rapporto del giro 288 (punti 1-5) più ciò che ho trovato cercando nel
   sorgente. Se l'elenco del PO contiene altro, non l'ho visto.
2. **Foto `docs/collaudo-po/198-pulsante-salienti.png`.** Non è nel ramo `lavoro/198`: il tasto è stato rifatto sulla descrizione
   («Bordo d'accento»), non sul confronto con la foto.
3. **Colore del bordo.** Il colore del club viene schiarito finché si legge sul fondo scuro del tasto (nel provino il granata
   `#7a1f2b` diventa un rosa-granata `rgb(187,141,146)`, 4,95:1). Con club scuri (nero, blu notte) il bordo sarà quindi più chiaro del
   colore di maglia. Alternativa: bordo nel colore pieno del club e solo il titolo schiarito — è una scelta del PO.
4. **«Inizia il provino» da PC.** Il contenuto ora parte dall'alto e il tasto lo segue (come la pre-partita del giro 287); sotto
   resta vuoto. Alternativa: blocco intero centrato in verticale. Scelta del PO.
5. **Scritte rimaste, da confermare:**
   - «Sposta l'eroe con le frecce, poi scegli la giocata.» (`src/15`, riga d'aiuto dell'highlight): le «frecce» sono anche quelle
     del pad a schermo, non l'ho toccata;
   - `title` (suggerimento al passaggio del mouse) delle voci della barra di navigazione, es. «Calendario [C]» (`src/18`): non è
     una scritta del pulsante e `src/18` è del giro 298, non toccato;
   - i tasti «1 2 3 salvataggi» della Home restano visibili perché PO-552 li vuole cliccabili: sono ora pulsanti, non più
     suggerimenti.
6. **Pausa da PC:** «Clicca per riprendere» al posto di «Premi P o tocca per riprendere». Il testo è una mia proposta minima.
7. **Numeri delle giocate al telefono.** Sul banco a 375/412 px i cerchietti numerati non comparivano già prima; se il PO li vede
   su un telefono vero, serve la foto.
8. **Consiglio «Muoviti col pad…» da PC:** ora è lo stesso testo del telefono; il pad a schermo c'è anche da PC.
