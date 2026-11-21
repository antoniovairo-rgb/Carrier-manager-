# Verifica della 7.999.198 — parte R2 (residui)

- Ramo verificato: `prova/198-finale` (`0f0b13d8`) · base di confronto per i rossi: `lavoro/198` (`b3b75b9d`)
- Ramo di lavoro: `sviluppo/verifica198-r2` · data: 20/11/2026
- Modo: un controllo alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), tetto 30 minuti a controllo, nessuna correzione.
- Macchina a inizio giro: 15,4 GB di memoria libera, 59 GB di disco liberi.

| controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|
| momento-194 | VERDE (uscita 0, 104 s) | — | — | bracci A/B/C verdi, tutti i rossi bocciati |
| nomi-190 | VERDE (uscita 0, 22 s) | — | — | 23 ok · 0 ko |
| nomi-211 | VERDE (uscita 0, 190 s) | — | — | 22 ok · 0 ko · viste giudicate 4 su 4 |
| nomi-219 | **NON GIUDICATO = ROSSO** (fermato al tetto dei 30 minuti, uscita 124) | non rieseguito (vedi nota) | non attribuibile | Il controllo dichiara da sé «~50 minuti» (27 partite, 3 alla volta): non sta nel tetto. Al momento dello stop: braccio verde 12 semi su 18 chiusi (101-112), 65 nominati, 64 vicini (98%), 0 oltre 35 u; semi 113-115 in corsa, 116-118 mai partiti; **braccio rosso mai giocato** (0 semi su 9). Nessun difetto misurato nella parte giocata. ⚠️ Difetto dello STRUMENTO da segnalare: dopo lo stop il processo ha stampato «✅ nomi-219 verde (… rosso 0% su 0 …)» — con il braccio rosso a zero campioni la regola «distacco ≥ 20 punti» passa da sola (98% − 0%). È un falso verde: non va contato. Non rieseguito sulla base perché finirebbe allo stesso tetto senza dire nulla sull’unione. |
| nomi-salvati-190 | VERDE (uscita 0, 36 s) | — | — | 19 ok · 0 ko · salvataggi giudicati 4 |
| passaggi-228 | VERDE (uscita 0, 71 s) | — | — | banco Node; tiri +1,0 % · xG +2,0 % · gol +3,5 % · simulazione rapida identica al bit. Il braccio rosso (`CPM_ROSSO=1`) non fa parte dello script npm: non eseguito |
| prima-partita-237 | **ROSSO** due corse su due (uscita 3, 502 s e 499 s): «❌ seconda partita non raggiunta» = non giudicato | **ROSSO** identico (uscita 3, 509 s, stesso messaggio) | **non nasce dall’unione** (già rosso su `lavoro/198`; lo script `prima-partita-237.mjs` è identico nei due rami) | La sonda non arriva mai a misurare: nella seconda corsa (diario `CPM_DBG=1`) la prima partita entra in `playing` a ~80 s e la fase letta resta `playing` fino a 497 s, quando scade l’attesa della sonda; nessun fischio finale, nessun clic. Non posso confermare da qui se la partita avanzi lentamente (GLB acceso su scheda grafica software) o sia ferma: il diario riporta solo la fase, non il minuto. Nessuna soglia del guardiano è stata valutata. Interruttori G293…G302 non provati perché il rosso c’è già sulla base. |
| replay | VERDE (uscita 0, 55 s) | — | — | «PASS — replay completi e coerenti», 8 highlight |
| scena-motore-147 | **ROSSO** (uscita 1, 1.571 s): 6 voci «zona di partenza senza il punto del motore» | **ROSSO** identico (uscita 1, 1.530 s, le stesse 6 voci) | **non nasce dall’unione** (già rosso su `lavoro/198`, stesso script e stesso salvataggio di prova) | Il resto del controllo è a posto in entrambi i rami: conclusioni generate verde 10 · rosso 0 (seme 7: 7 su 7, seme 99: 3 su 3), scene con la manovra vera 6 su 10. Le voci bocciate: minuto 7 «fra le linee» (punto x 64,3 · zona x 73,5–77,5), minuto 48 «angolo» (x 56,8 · zona 85–89), minuto 68 «spalle» (x 71,9 · zona 79,8–83,8), minuto 76 «cross» (x 71,8 · zona 85–89), più minuto 7 e minuto 48 del seme 99. Una sola corsa per ramo (26 minuti l’una): esito ripetuto voce per voce sui due rami, quindi non lo tratto come instabile. Interruttori G293…G302 non provati perché il rosso c’è già sulla base. |
| statistiche-228 | VERDE (uscita 0, 128 s) | — | — | 4.000 partite per braccio; tutte le differenze dentro la tolleranza (tiri +2,5 % · gol +5,1 % · xG +2,2 % · possesso −3,7 % · gol dell’eroe +16,7 % su ±28,9 %) |
| testi-190 | **ROSSO** due corse su due (uscita 1, 139 s e 137 s): 10 ok · 4 ko, le stesse quattro voci | VERDE (uscita 0, 134 s, 14 ok · 0 ko) | **nasce dall’unione: giro 299** | Voci bocciate: «scheda del contratto vista: «»» · «il contratto non dice “trascorso”» · «impulso `wi_dieta_ferrea` aperto (true) e scelta “🥗 La seguo alla lettera” (morale −3) cliccata (false)» · «accanto al morale negativo: nessuna faccina vista (non giudicato)». Attribuzione con gli interruttori (vedi sotto): con il solo `__CPM_NO_G299` torna verde 14 su 14. |

## Attribuzione di `testi-190` (interruttori dei giri, sul ramo finale)

Gli interruttori sono stati accesi su una copia temporanea e non tracciata del controllo (stessa logica, una riga in più che scrive `window.__CPM_NO_Gxxx = 1` prima del caricamento); la copia è stata cancellata a fine prova. Nel sorgente non esiste un interruttore `__CPM_NO_G297`: quel giro non è stato provato.

| interruttori accesi | esito |
|---|---|
| nessuno (corsa normale, due volte) | ROSSO 10 ok · 4 ko |
| tutti (293 294 295 296 298 299 300 301 302) | VERDE 14 ok · 0 ko |
| 293 294 295 296 | ROSSO 10 ok · 4 ko |
| 298 299 300 301 302 | VERDE 14 ok · 0 ko |
| 298 299 | VERDE 14 ok · 0 ko |
| 300 | ROSSO 10 ok · 4 ko |
| 301 | ROSSO 10 ok · 4 ko |
| 298 | ROSSO 10 ok · 4 ko |
| **299** | **VERDE 14 ok · 0 ko** |

Lettura: spegnere il solo giro 299 basta a togliere tutte e quattro le voci. Non ho cercato la riga di codice (mandato: riportare, non correggere), quindi non posso dire se il giro 299 abbia rotto il gioco oppure spostato qualcosa che il controllo cerca nel posto di prima.

## Riepilogo

- Controlli chiesti: 11 · tutti presenti in `tests/visual/package.json`.
- **Verdi 7**: momento-194 · nomi-190 · nomi-211 · nomi-salvati-190 · passaggi-228 · replay · statistiche-228.
- **Rossi 3**:
  - `testi-190` — **nasce dall’unione, giro 299** (verde sulla base, rosso stabile sul finale).
  - `prima-partita-237` — rosso anche sulla base: non nasce dall’unione. La sonda non arriva a misurare («seconda partita non raggiunta»).
  - `scena-motore-147` — rosso anche sulla base, con le stesse 6 voci: non nasce dall’unione.
- **Non giudicato 1 (= rosso per regola)**: `nomi-219`, fermato al tetto dei 30 minuti (dichiara da sé ~50 minuti). Nella parte giocata nessun difetto (98 % vicini su 65 nominati, 0 oltre 35 u); braccio rosso mai giocato.

Da segnalare a parte, senza correzione:
1. `nomi-219`, se interrotto, stampa «✅ verde» con il braccio rosso a zero campioni («rosso 0 % su 0»): la prova del rosso passa a vuoto.
2. `momento-194` riscrive otto foto in `docs/sviluppo/giro194/`: rimesse con `git restore` dopo ogni giro.
3. Tempo: il giro è durato circa 2 ore e 20 minuti contro le 2 previste (due corse da 26 minuti di `scena-motore-147`, 30 di `nomi-219`, tre da 8 di `prima-partita-237`).

## Verdetto

**R2 pronto: NO.**

Motivo che dipende dall’unione: `testi-190` è rosso sul finale e verde sulla base, e il rosso sparisce spegnendo il giro 299. Restano inoltre due rossi già presenti sulla base (`prima-partita-237`, `scena-motore-147`) e un controllo non giudicato (`nomi-219`), che per regola non si possono contare come verdi.
