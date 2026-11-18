# Giro 268 — controlli rossi della base 197: Rosa, Agente, Profilo, allenatori, testata (versione 7.999.197)

Ramo `sviluppo/giro268-rosa-agente-profilo`, partito da `origin/lavoro/197` a `9ad0bd6`. `GAME_VERSION` non toccata.
Decisione PO 18/11 08:20: «Riparali tutti, in parallelo». Lotto 197 chiuso: solo i cinque controlli della consegna.
Rosso del giro: **`window.__CPM_NO_G268`** (due correzioni del gioco in `src/18`, vedi sotto).
La 7.999.196 pubblicata e' `origin/main` (`3076a1b7`, «Rilascio 7.999.196»), misurata in una copia di lavoro a parte.

## Tabella

| Controllo | prima su 196 (main) | prima su 197 (`9ad0bd6`) | nato in | causa | dopo (build finale) |
|---|---|---|---|---|---|
| rosa-228 | verde (24 club, ruoli non in sigla 0) | rosso: ruoli non in sigla 24, «ruolo R» | giro 257 (`1a9b5146`, «R» del rigorista nella Rosa) | **controllo**: la sonda prendeva come ruolo lo span dopo il nome, che ora e' la «R» | verde 2/2 di fila sul build finale, rossi `__CPM_NO_G228` e `__CPM_NO_G239` bocciati |
| agente-198 | verde | rosso: B1/B2 «il tasto non porta all'Agente» (1 corsa su 2 anche TimeoutError del clic) | giro 260 (`17898063`; verde su `1a9b5146`, rosso su `17898063^2`) | **controllo** (riconosceva la scheda da `agente-v2`, tolto dal 260; eventi a caso sopra il tasto) **+ gioco** (riquadro a −0,11 px dal bordo) | verde 2/2 di fila sull'ultimo build (fin3, fin4), rossi `__CPM_NO_G198` e `__CPM_NO_G268` bocciati |
| neutro-287 | verde | rosso: Carriera › Profilo cita «stile di gioco» | giro 235 (`5fe24f5e`, nota del gruppo «Contratto e attributi») | **gioco**: la nota prometteva una scheda che l'eroe neutro non ha | verde 2/2 di fila sul build finale, rossi `__CPM_NO_NEUTRO287` (68 violazioni) e `__CPM_NO_G268` bocciati |
| mister-215 | verde (5 righe, 5 figurine) | rosso: 0 righe lette in entrambi i bracci | giro 235 (gruppo «Persone» chiuso, sezione rinominata «I tuoi allenatori») | **controllo** | verde 2/2 di fila sul build finale (5 figurine su 5 righe), rosso `__CPM_NO_MISTER215` bocciato (5 icone, 75 omonimi) |
| testata-209 | **rosso** (il braccio verde muore: «Torna alla dashboard» non c'e') | rosso: scena dell'intervista n.d. | **prima della 196**: giri 183, 190, 200 | **controllo** (tre decisioni PO gia' prese) | verde 2/2 di fila (edicola «LAG …», scena FC Laguna), rosso `__CPM_NO_TESTA209` bocciato (edicola «MRA …», scena FC Moreira) |

## Che cosa ho cambiato

### rosa-228 — solo il controllo
`tests/visual/misura-228.mjs` (`misuraRosa`, condivisa con il guardiano): il ruolo e' il primo fratello dopo il nome che **non** e'
`[data-cpm="rigorista257"]`. La «R» del giro 257 e' la decisione PO-496 («Sì, segnato nella Rosa»). Soglie, numero di club (24) e rossi
invariati; il rosso `__CPM_NO_G228` resta bocciato con 527 ruoli non in sigla su 576 righe.

### neutro-287 — il gioco
`src/18` gruppo «Contratto e attributi»: con l'eroe neutro la nota e' «Attributi, contratto e futuro» (era «Attributi, stile di
gioco, contratto e futuro», scritta al giro 235 quando la scheda «Stile di gioco» non si disegna piu' dal giro 82 / PO-287
«Tutto: eroe neutro»). Rosso `__CPM_NO_G268` = la nota di prima. Braccio nuovo nel guardiano: con `__CPM_NO_G268` Carriera › Profilo
deve citare «stile di gioco» → bocciato in ogni corsa.

### mister-215 — solo il controllo
Dal giro 235 (PO-457, «Profilo in 4-5 gruppi con nomi chiari») lo storico vive nel gruppo «Persone», chiuso di partenza, e la
fisarmonica si chiama «I tuoi allenatori» (`NOMI235`). La sonda apre il gruppo con un tocco, poi la fisarmonica (accetta i due nomi:
«Storico allenatori» resta sul rosso `__CPM_NO_G235`). Misure e soglie invariate.

### agente-198 — controllo e gioco
- Controllo: nella parte B la scheda Agente si riconosce anche dal titolo della testata (`data-cpm=titolo235` = «Agente»), come la
  parte A faceva gia' dal giro 260 (decisione PO 17/11 C «titolo solo nella testata»).
- Controllo: entrando nella settimana puo' uscire **a caso** un foglio (`cpm-foglio114`: evento della settimana o momento di
  carriera — visti «L'Offerta della Notte» e «Nello spogliatoio qualcosa è cambiato») che copre il tasto: misurato, una corsa
  su due finiva in TimeoutError del clic («non giudicato»). La sonda lo chiude con gli agganci dei modali
  (`__CPM_CAREER.dismiss` + `chiudi163`) e **lo dichiara** nella riga del braccio («evento chiuso dalla sonda «…»»).
- Gioco: tolto il titolo (giro 260), «Vai al rinnovo →» scorreva il riquadro «Da fare ora» esattamente al bordo e il suo lato alto
  finiva a **−0,109 px** (misurato: `[-0.109, 349.3]` su 667), quindi «non in vista» per la regola `top >= 0`. Non ho toccato la soglia:
  il riquadro ha `scrollMarginTop: SP.sm` (8 px di respiro sopra). Rosso `__CPM_NO_G268` = senza margine; terzo braccio nella parte B
  che DEVE essere bocciato (e lo e': `arrivo {"tab":true,"vista":false}`).

### testata-209 — solo il controllo (rosso gia' sulla 196)
Tre decisioni prese dopo il guardiano (giro 11) lo avevano lasciato indietro:
1. giro 190 (PO-380a, testi che rompono l'incanto): «Torna alla dashboard» → «Torna alla Home»;
2. giro 200 (PO-385, rassegna a schede): quel tasto sta all'ultima delle 4 schede — la sonda ci arriva con «Avanti»;
3. giro 183 (PO-375 «Meno e più varie»): l'intervista esce solo dopo una partita con posta, una tripletta o a sorpresa (1 su 8);
   il pareggio 0-0 della sonda non la produce (misurato: `INTERVISTA[0] null`). Regola dei controlli instabili (PROCESSO.md:
   «ciò che il gioco non produce si provoca dalla sonda»): la sonda accende `__CPM_NO_G183` in **entrambi** i bracci (intervista
   dopo ogni partita, come prima del 183) e stampa `__CPM_IV183`.
Rosso `__CPM_NO_TESTA209` invariato: edicola «MRA 0-0 FC SICANIA», scena FC Moreira.

## Controlli eseguiti

Tutti uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, `CPM_CI_PAR=0`, con `free -m` e `df -h` prima di ciascuno.
Le foto rigenerate in `docs/sviluppo/giro198/` (agente-198) sono state rimesse con `git checkout --` e non committate.

**I cinque della consegna, sul build finale** (dopo l'ultima modifica a `src/` e alle sonde):

| Controllo | corse verdi di fila | rossi bocciati |
|---|---|---|
| rosa-228 | 2 (fin1, fin2; la prima verde, 197b, era su un build precedente) | `__CPM_NO_G228`, `__CPM_NO_G239` |
| neutro-287 | 2 (fin1, fin2; 268a su un build precedente) | `__CPM_NO_NEUTRO287` (68 violazioni), `__CPM_NO_G268` |
| mister-215 | 2 (fin1, fin2; 268b su un build precedente) | `__CPM_NO_MISTER215` |
| agente-198 | 2 (fin3, fin4: in fin4 un foglio chiuso e dichiarato) — fin2 era rosso per un momento di carriera che `dismiss` non chiudeva, da cui l'ultima modifica della sonda | `__CPM_NO_G198`, `__CPM_NO_G268` |
| testata-209 | 2 (corse complete 1 e 2) | `__CPM_NO_TESTA209` |

`node tools/build-src.mjs` + `node tools/check-src.mjs` dopo ogni modifica a `src/`: **IDENTICO BYTE PER BYTE**.

**Mappa mirata di `src/18`** (unico file `src` toccato) + nucleo, esclusi highlight-95, ingresso-206 e career-critical come da
consegna e i cinque qui sopra: **92 passi**, in serie, un rosso riprovato una volta. Registro: `docs/sviluppo/giro268/mappa-mirata.txt`.
- **80 verdi**, fra cui `test:logic` e `save-compat`.
- **stadi-071 instabile** (rosso alla prima — «borgo/arena tipo null» —, verde alla seconda; nel giro 263 era verde).
- **11 rossi, tutti gia' rossi sulla base 197** nel registro del giro 263 (`docs/sviluppo/giro263/mappa-mirata.txt`) e fuori dal lotto:
  partita-v2 (manca il tasto finale nel post), grafica-v2 (anelli del Club), spazio-296, ritratto-171-72, difficolta-156,
  coppa-prestito-245, infortunio-263, partita-rigiocata-194 (2ª prova fermata dal tetto di 2 ore), assist-nome-98 e intervista-231
  (oltre 25 minuti, come gli «OLTRE20» del 263; la 2ª prova di intervista-231 l'ho fermata io per PID dopo 7 minuti, quella di
  assist-nome-98 il tetto di 2 ore), **squalifica-222** (2 su 2 rosso qui; nel 263 rosso poi verde; rimisurato sulla base esatta
  `9ad0bd6`: rosso poi verde, stessi due controlli «non-convocato» → instabile gia' sulla base, non nato da questo giro).
- La corsa in sottofondo e' stata fermata due volte al tetto di 2 ore: ripresa dal passo interrotto (righe «--- ripresa»).

## Dubbi per il PO

1. **agente-198, eventi a caso sopra il tasto.** Fermandosi sul rinnovo, la corsa «Vai al prossimo momento» puo' far uscire nello
   stesso momento un evento della settimana o un momento di carriera, che copre il riquadro con «Vai al rinnovo →». Il giocatore lo
   chiude e poi tocca; la sonda fa lo stesso e lo dichiara. Non ho cambiato l'ordine (evento prima, fermata dopo): se il PO vuole che
   la fermata sul rinnovo non sia mai coperta, e' una decisione sua.
2. **testata-209 provoca l'intervista** con il rosso del giro 183. Alternativa: cercare in calendario una partita «con posta»
   (posta165) e giocare quella; costa una ricerca nella sonda e lega il guardiano alla regola della posta. Ho scelto la via piu'
   corta e dichiarata; se il PO preferisce l'altra, si cambia.
3. **testata-209 era rosso gia' sulla 7.999.196 pubblicata** (dal giro 183/190/200, cioe' dalla 7.999.194 in poi): la verifica di
   rilascio della 196 non lo eseguiva o non lo ha visto. Lo segnalo perche' contraddice «rosso nato nella 197» della consegna.
4. Il margine di 8 px del riquadro «Da fare ora» e' una scelta tecnica minima (il token piu' piccolo dopo `xs`); a occhio il riquadro
   non cambia. Foto non rifatte.
5. **squalifica-222 e' instabile gia' sulla base 197** (i due controlli «non-convocato»), **stadi-071** una volta rosso e una verde:
   non li ho toccati (lotto chiuso). Per la regola «un guardiano instabile due volte si ripara» andrebbero dati a un giro.
6. Gli undici rossi della mappa di `src/18` elencati sopra restano: sono rossi anche senza questo giro e la verifica di rilascio li
   trovera'. Con questo giro i rossi della lista del 263 (dubbio 6) scendono di cinque.
7. Non ho scritto la riga di ROADMAP: e' un giro dentro il lotto 197 (nessuna versione nuova); la scrive chi rilascia.
