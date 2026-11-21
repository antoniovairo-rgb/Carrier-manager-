# Verifica FINALE della 7.999.198 — parte F2

**Verdetto: F2 pronto NO** — 11 controlli su 12 verdi; `nomi-219` non è stato giudicato (tagliato dal tetto di 60 minuti) e per regola «non giudicato» vale rosso. Il rosso non nasce dall'unione: sulla base si ripete identico. Dettaglio in fondo.

- Build verificato: `prova/198-finale`, commit `6b79812c` (giri 293–296, 298–302 + correzioni 304 tunnel, 305 scatto del pallone, 306 sonda testi-190).
- Ramo di lavoro: `sviluppo/verifica198-f2`. Il ramo esisteva già sul remoto (rapporto del 19/11 su highlight-95, build `086cdba9`): niente force push, il build di partenza è stato portato dentro con un'unione (commit `1ced46d`). L'albero dei file è identico a `6b79812c` salvo questo rapporto (`git diff --stat 6b79812c HEAD` = solo `docs/sviluppo/VERIFICA198-F2.md`). Il rapporto del 19/11 resta nella storia del ramo (commit `d665d1e`).
- Base per i confronti dei rossi: `lavoro/198`, commit `b3b75b9d`.
- Banco: sessione cloud, 16 GB di memoria, 59 GB liberi su disco; controlli uno alla volta (`CPM_CI_PAR=0`), `CPM_CHROME=/opt/pw-browsers/chromium`, da `tests/visual`. Orari in UTC, notte fra 20 e 21/11/2026.

## Tabella

| controllo | esito | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|
| test:logic | VERDE | — | — | 51 prove su 51, 0 fallite, 3 s |
| save-compat | VERDE | — | — | 12 passati, 0 falliti, 9 s; nota informativa dello strumento sulla seconda migrazione (dichiarata benigna dallo strumento stesso) |
| testi-190 (2 corse) | VERDE · VERDE | — | — | entrambe 15 ok · 0 ko, 132 s e 133 s; sottotitoli letti 39 su 45 (soglia dello strumento: al più 7 mancanti), consigli tagliati 0 |
| rosa-angoli-299 | VERDE | — | — | braccio verde: 0 controlli falliti su 24; braccio rosso: cade su A, B e C; non giudicati 0; 632 s |
| ritocchi-302 | VERDE | — | — | verde: A, B (contrasto 14,79), C 756/756; rosso: cade su A (1), B (31), C (7); 62 s. Ha rigenerato foto in `docs/sviluppo/giro302/`: rimesse con `git restore` |
| home-298 | VERDE | — | — | verde sulle 3 risoluzioni; rosso con `__CPM_NO_G298`: tornano tutti e cinque i difetti (63 rilievi); 121 s |
| prepartita-pc-300 | VERDE | — | — | braccio verde verde; braccio rosso: cade su Apc, Atel, Bpc, Cpc, Dpc, Dtel (15 rilievi); 130 s |
| rigori-296 | VERDE | — | — | parti A + B + C verdi, i rossi si vedono; cerimonie chiuse dal timer a 18,5–20,2 s (previsto 17,5 s), «salta» 3,8 s; 1014 s. Nella parte C il braccio rosso «compagno» ha avuto bisogno di più tentativi interni allo strumento (dichiarati nel registro) |
| portatore-293 | VERDE | — | — | braccio verde: 0 difetti su 14 scene; braccio rosso: casi «foto» col difetto 5 su 5 (attesi almeno 4), scene difensive col pallone che cambia padrone 2 su 2; 530 s |
| audio-172 | VERDE | — | — | braccio verde: passa, nessun rilievo fallito; braccio rosso (`__CPM_NO_G172`): cade come deve su 3, 4, 6, 7, 8, 9, 10, 11; 670 s. Ha rigenerato 10 foto in `docs/sviluppo/giro172/foto/`: rimesse con `git restore` |
| coreografie-244 | VERDE | — | — | braccio verde: 30 partite, 12 coreografie distinte per nome (14 firme distinte nella riga MISURA; soglia almeno 8), mai la stessa due di fila, 4 si muovono (soglia almeno 3), partita riaperta uguale, fps 2,31 contro 2,36 del rosso (97,9%, soglia 85%); braccio rosso: 8 partite, una sola firma, ferma; 2309 s (38 min 29 s, sotto il tetto dei 40) |
| nomi-219 | ROSSO (non giudicato: tagliato dal tetto di 60 minuti) | ROSSO allo stesso modo (non giudicato: tagliato a 60 minuti nello stesso punto) | non nasce dall'unione: nessun giro fra 293 e 306 | 3600 s, uscita 124. Braccio verde completo (18 semi, finito dopo ~49 min): nominati 96, entro 25 u 93 (96,9%), lontani 0, difensore nominato usato 90 e scartato 17 (84,1%), scambi 89. Braccio rosso fermo a 6 semi su 9 (101–106: nominati 34, vicini 21, lontani 9): lo strumento non ha stampato il verdetto. Nessun difetto misurato: il rosso è di tempo |

## Il rosso di nomi-219: confronto con la base

Stesso comando, stesso tetto (60 minuti), stesso banco, una corsa per parte. Lo script `nomi-219.mjs`, `lib/harness.mjs` e il salvataggio di prova sono identici nei due commit (`git diff --stat b3b75b9d 6b79812c` su quei file: vuoto).

| | build nuovo `6b79812c` | base `lavoro/198` `b3b75b9d` |
|---|---|---|
| orario | 04:08:09 → 05:08:09 | 05:08:53 → 06:08:53 |
| uscita | 124 (taglio a 3600 s) | 124 (taglio a 3600 s) |
| braccio verde (18 semi) finito dopo | circa 49 minuti | circa 49 minuti |
| braccio verde: nominati · entro 25 u · lontani | 96 · 93 (96,9%) · 0 | 97 · 94 (96,9%) · 0 |
| braccio verde: difensore nominato usato · scartato | 90 · 17 (84,1%) | 87 · 16 (84,5%) |
| braccio rosso al momento del taglio | 6 semi su 9 (nominati 34, vicini 21, lontani 9) | 6 semi su 9 (nominati 35, vicini 17, lontani 13) |
| verdetto stampato dallo strumento | nessuno | nessuno |

Cosa dicono i numeri:
- Il taglio è di **tempo**, non di un difetto misurato: lo strumento dichiara «~50 minuti» nell'intestazione, su questo banco (4 processori, 3 partite alla volta) il solo braccio verde ne prende circa 49 e i 9 semi rossi non ci stanno nei 60.
- Il comportamento è lo stesso su build nuovo e base, quindi **non nasce dall'unione** e non è attribuibile a nessun interruttore `__CPM_NO_G293…G306`. Per questo non è stata fatta la ricerca del giro.
- Il braccio verde, nei due casi, sta sopra le due soglie dichiarate nell'intestazione dello strumento (almeno 85% dei nominati entro 25 u; difensore nominato usato almeno nell'80% dei casi). **Non posso confermare** che lo strumento avrebbe dato verde: il suo verdetto dipende anche dal braccio rosso, che non è finito, e le soglie effettive del giudizio finale non le ho rilette nel codice.
- Non è stata fatta una seconda corsa sul build nuovo: il risultato coincide con la base e il tetto di tempo della verifica (circa 2 ore) era già superato.

## Note sull'esecuzione

- Durata complessiva: dalle 02:30 alle 06:09 UTC (circa 3 h 40 min contro le circa 2 ore previste). Di queste, 2 ore sono le due corse di `nomi-219`.
- Nessuna soglia toccata, nessuna correzione al gioco o ai controlli, `GAME_VERSION` non toccata.
- `ci-runner.mjs mirata` non usato: ogni controllo lanciato col suo script npm, uno alla volta.
- Foto rigenerate dai controlli e rimesse con `git restore`: 12 file in `docs/sviluppo/giro302/` (ritocchi-302), 10 file in `docs/sviluppo/giro172/foto/` (audio-172). Nessun altro file tracciato modificato.
- Controlli con bracci che hanno ripetuto da soli al loro interno: `rigori-296`, parte C, braccio rosso «compagno» (tentativi 2 e 3 dichiarati nel registro). Nessun controllo è stato ripetuto da me per instabilità, salvo le due corse chieste di `testi-190`.
- `coreografie-244` è finito a 38 min 29 s: un minuto e mezzo sotto il tetto dei 40. Su un banco più lento rischia il taglio.
- La corsa sulla base è stata fatta in una copia di lavoro temporanea (`git worktree`, poi rimossa), fuori dal repository.
