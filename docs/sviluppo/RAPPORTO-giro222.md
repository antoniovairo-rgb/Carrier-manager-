# Rapporto — giro 222 (versione 7.999.196), PO-481 e PO-479

Ramo `sviluppo/giro222-guardalinee-interviste`, partito da `lavoro/196`. `GAME_VERSION` non toccato. Rosso unico del giro:
`window.__CPM_NO_G222` (spegne entrambe le correzioni). Dopo ogni modifica a `src/`: `node tools/build-src.mjs` e
`node tools/check-src.mjs` → «IDENTICO BYTE PER BYTE».

## A) PO-481 — i guardalinee sulla linea laterale e nella divisa dichiarata

### Lo strumento
- **Testimone `__CPM_G222W`** (`src/12`, `_w222`, acceso solo se la sonda arma l'array): a ogni fotogramma disegnato, per ciascuno dei
  due guardalinee, la z del marker, se è nell'inquadratura (petto proiettato nello schermo), se un **cartellone** sta fra la camera e il
  petto e fra la camera e la testa (raggio contro i soli cartelloni, raccolti in `_cart222` dentro `_mkAdBoard`) e se **copre il gioco**
  (il punto dell'eroe o del pallone cade nel suo rettangolo a schermo e lui è più vicino alla camera).
- **Colore a schermo** (sonda): foto ravvicinata di lato (camera di prova `__CPM_CAM904`), scena 3D **ferma** (`__CPM_FROZEN`), **ora
  congelata** (`__CPM_TOD`, invariante 7.539), le altre mesh nascoste (luci intatte); maschera = pixel che diventano magenta quando il pezzo
  (maglia / pantaloncini / gambe) viene dipinto di magenta **sul suo materiale** (colore nero + emissivo magenta, senza tonemap). Il
  colore è la mediana della prima foto sulla maschera (bordi esclusi); per i calzettoni la fascia fra il 25% e il 65% dell'altezza visibile
  della gamba. Nota di metodo: un primo tentativo con un `MeshBasicMaterial` nuovo dava una maschera sbagliata e una lettura della gamba
  mista a scarpino; corretto prima di misurare.

### Misura prima (braccio rosso = codice di prima)
| | prima (rosso) |
|---|---|
| posizione | \|z\| = **35,50** in ogni fotogramma (linea laterale `_TLZ` 33,2; cartelloni a \|z\| 34,8-35,0, alti 1,7) |
| linea di vista dalla camera della festa | **coperta da un cartellone 120/120** (petto e testa) |
| maglia (notte) | RGB 225,221,173 · saturazione **0,22-0,23** · distanza dal dichiarato #f4d43c ~115 |
| pantaloncini | RGB 95-103,117-126,145-156 · luminanza **108-120** (azzurro-grigio) |
| calzettoni | RGB 18-22,26-31,42-48 · luminanza 25-30 (già scuri) |

Foto: `docs/sviluppo/giro222/rosso-*.jpg`, confronto `confronto-divisa.jpg` (sinistra prima, destra dopo).

### Cause
1. **Posizione**: i marker preesistenti stanno a `z = ±35,5`, 0,5 u oltre il piano dei cartelloni.
2. **Divisa**: il materiale dei pantaloncini aveva **già** `#1b2638` (letto dal materiale). La prova: dipinto di rosso puro, a schermo
   esce rosso. Maglia e pantaloncini dei guardalinee non hanno numero né disegno, quindi `_applyHyperKit` scrive l'esadecimale
   direttamente in `material.color`; il renderer della partita esce in sRGB (7.529) e in r128 il colore del materiale è lineare: la
   tinta (già sRGB) viene convertita due volte e schiarisce — la stessa causa documentata al 7.547 per le maglie. I calzettoni invece
   passano dalla texture delle gambe (`_socksTex061`), che eredita la codifica sRGB del file: per questo erano già scuri.

### Correzione (`src/12`)
- Marker a `|z| = 34,0` (`_z222`): 0,8 u fuori dalla linea laterale, 0,8 u davanti al cartellone. La logica di movimento (x che segue
  l'azione) non cambia.
- Nel costruttore dei guardalinee CGTrader, maglia, pantaloncini e scarpe portati in lineare una volta (`_lin222`); i calzettoni restano
  col colore dichiarato (vanno nella texture sRGB).

### Misura dopo
| | dopo (verde) |
|---|---|
| posizione | \|z\| = **34,00** in ogni fotogramma (festa tel/pc, gioco, highlight, festa vera) |
| linea di vista dalla festa | coperta **0/122** (tel), **0/58** (pc), **0/148** (festa vera) |
| copre il gioco | **0** fotogrammi su 320 di highlight e 10 di gioco (stesso valore col rosso: 0) |
| maglia | RGB ~226,214,115 · saturazione **0,48-0,53** (giorno 0,50 · sera 0,52-0,53 · notte 0,48-0,51) · distanza ~58 |
| pantaloncini | luminanza **26-33** (RGB ~20,30,55) |
| calzettoni | luminanza 26-31 |

### Guardiano nuovo `npm run guardalinee-222` (verde + rosso)
Scenari `festa-tel`, `festa-pc` (festa forzata, divisa), `partita-tel` (provino in autoplay fino al fischio con 2 gol forzati: highlight,
gioco e festa vera). Verde: \|z\| in [33,4 · 34,6]; linea di vista libera dalla festa ≥ 90% (e, fra i fotogrammi in cui un guardalinee
è inquadrato, ≥ 90% senza cartellone davanti); 0 coperture del gioco; maglia gialla (tinta 40°-62°, saturazione ≥ 0,40, valore ≥ 0,55,
distanza RGB dal dichiarato ≤ 75), pantaloncini e calzettoni scuri (luminanza mediana ≤ 70, blu ≥ rosso). «Non giudicato» = rosso.
Rosso: `CPM_PROVA_ROSSO=1` → `__CPM_NO_G222`, almeno un verdetto rosso (misurati: posizione, festa, divisa).
Durata: verde ≈ 7 min, rosso ≈ 2 min. In `completa` e `carriera` una volta sola (`node --check` verde, nessun doppione), e fra i lenti.

**Soglia della maglia — dichiarato apertamente.** La prima stesura diceva saturazione ≥ 0,50, scritta prima di misurare il verde. La
misura a copertura piena (tre ore del giorno, due guardalinee, due formati) ha dato 0,48-0,53: la maglia in divisa vera sta sul bordo.
Seguendo la regola del 7.517 («le soglie si fissano dopo la misura a copertura piena») l'ho fissata a 0,40, a metà fra rosso (0,21-0,23)
e verde (0,48-0,53), e ho **aggiunto** la distanza dal colore dichiarato (≤ 75: rosso ~115, verde ~58). È una soglia mai committata,
ma resta più bassa di quella scritta per prima: lo segnalo nei dubbi.

## B) PO-479 — interviste: l'ultima giornata del girone che elimina, e il rilancio

### Misura prima (braccio rosso `CPM_ROSSO222=1` del guardiano `interviste-211`, sezioni nuove 4-5)
| caso | domanda scelta prima | difetti |
|---|---|---|
| coppa europea, girone 0 pt + sconfitta (4°, fuori) | «Serata europea amara…» con «Il girone è ancora aperto» | non parla dell'eliminazione; girone «aperto» |
| coppa europea, 0 pt + pareggio (4°, fuori) | «Serata europea. Che sensazione dà giocare in questo palcoscenico?» | festa dopo l'eliminazione |
| coppa europea, 1 pt + sconfitta (4°, fuori) | «Serata europea amara…» | come sopra |
| Europeo, 0 pt + sconfitta / 1 pt + pareggio / 0 pt + pareggio (fuori) | «Con la maglia della Nazionale addosso cambia qualcosa…?» | non parla dell'eliminazione |
| rilancio dopo ognuna delle eliminazioni sopra e dopo l'eliminazione europea agli ottavi (PO-473) | possibili «E la classifica? Ci pensi…?» e «sfida ai prossimi avversari» | |

### Cause
1. `esitoTurno211` riconosce solo i turni a eliminazione diretta: l'ultima giornata del girone usciva «nessuno», perché
   l'eliminazione dal girone nasce dalla classifica calcolata dopo l'intervista.
2. `rilancio24` sceglie solo per tono e seme: non sa niente del risultato.

### Correzione (`src/07`, `src/18`)
- `esitoTurno211`: ultima giornata del girone **che elimina** → `turno:"eliminato"` (con `girone:true`, `lega:false`, niente rigori),
  calcolata con la **stessa** regola della risoluzione: coppa europea → `euroGroupKOPatch` sul salvataggio con questa partita aggiunta
  (come `onMatchEnd`); Europeo/Mondiale → ultima partita e meno di 4 punti (come `_emGroupOut`). Chi si qualifica resta «nessuno».
- `coerente211`: in un girone niente domande sui rigori («Fuori ai rigori» dopo un pareggio che chiude il girone fuori sarebbe falso) —
  il controllo sta **prima** di quello su `e211`, perché quella domanda dichiara `e211:["eliminato",…]` (misurato: messo dopo non agiva).
- `poolPost183`: a girone chiuso fuori, prima le domande che parlano dell'esito (come a eliminazione diretta).
- Rilancio: il pannello del dopo-partita porta `esito222` (= `esitoTurno211(player,result)`), e `rilancio24(tono,seme,esito)` scarta le
  domande incoerenti: fuori dal campionato niente punti/classifica (stessa regola `_LEGA211`, su domanda e risposte); dopo
  un'eliminazione o una finale persa niente «sfida ai prossimi avversari» (`fuori222`). Senza esito (intervista della settimana,
  prepartita) il rilancio è quello di prima; se il filtro svuotasse la lista resta la lista intera.

### Misura dopo
Tutti i 7 casi sopra: domanda d'eliminazione («Fuori dall'Europa…», «L'avventura europea finisce qui…», «La Nazionale esce dal
torneo…»), nessuna domanda possibile con girone aperto/festa/rigori, rilanci possibili 13 (erano 15) senza classifica né «prossimi
avversari». Casi che qualificano (6 vittorie; 6 pt + vittoria): invariati, nessuna domanda d'eliminazione. In campionato la classifica
resta possibile nel rilancio (controllo dedicato). Sezione 2 di `interviste-211` (3.600 partite simulate): 0 incoerenze scelte e 0
possibili, come al giro 211.

### Guardiano `npm run interviste-211` (aggiornato)
Sezione 4 (10 casi: 8 di girone + PO-473 + campionato) e sezione 5 statica (il pannello porta `esito222` e il rilancio lo riceve, sul file
di gioco: è il percorso di `CareerApp` che la sonda non attraversa). Lo script npm ora esegue anche il braccio rosso
(`CPM_ROSSO222=1`, deve uscire 1). Nessuna soglia cambiata. Verde 41 ok · 0 ko; rosso 34 ok · 7 ko. ≈ 20 s.

## Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `free -m`/`df -h` prima, `CPM_CHROME=/opt/pw-browsers/chromium`)
| controllo | esito | durata |
|---|---|---|
| `guardalinee-222` (nuovo) verde, 3 scenari | ✅ PASS (posizione, festa, gioco, divisa) | ≈ 7 min |
| `guardalinee-222` rosso (`CPM_PROVA_ROSSO=1 CPM_SCENARI=festa-tel`) | ✅ difetto riprodotto (6 verdetti rossi: posizione, festa, divisa) | ≈ 2 min |
| `gigante-212` verde, per scenario: trasferta-tel · casa-pc · festa-vera-tel · cerimonie-tel | ✅ PASS ×4 (12 scene, statura 1,23-1,89 m, nessun near) | 197 + 298 + 158 + 112 s |
| `gigante-212` rosso (trasferta-tel) | ✅ difetto riprodotto (3 corpi sopra 2,05 m) | 193 s |
| `ingresso-206` (verde + rosso) | ✅ verde e il rosso si vede | 2.548 s |
| `festa-3d` | ✅ PASS | 126 s |
| `interviste-211` (verde + rosso `CPM_ROSSO222`) | ✅ VERDE 41/0; rosso 34/7 (esce 1, come atteso) | 19 s |
| `interviste-183` | ✅ verde e il rosso si vede | 286 s |
| `conferenza-192` | ✅ verde e il rosso si vede | < 1 s |
| `career-critical` | ✅ tutte PASS | 716 s |
| `test:logic` | ✅ 51/51 | 3 s |
| `save-compat` | ✅ 12 pass · 0 fail | 9 s |

Foto di altri giri rigenerate dai controlli (`docs/sviluppo/giro212`, `giro206`): rimesse con `git checkout --`, non committate.

## Dubbi per il PO
1. **La camera della festa non inquadra mai i guardalinee.** In festa forzata (telefono e PC) e nella festa vera i fotogrammi con un
   guardalinee nell'inquadratura sono 0: la camera segue l'eroe verso la bandierina, mentre i guardalinee stanno a metà del pallone
   (x = metà della x della palla). Ora la linea di vista è libera (nessun cartellone davanti), ma «visibili dalla festa» è giudicato sulla
   linea di vista, non sull'inquadratura. Se il PO li vuole **nel quadro** della festa serve una scelta di regia (dove stanno durante la
   festa).
2. **Soglia della maglia**: vedi sopra. La maglia gialla in partita esce satura 0,48-0,53 (il dichiarato #f4d43c ha 0,75): la luce
   della partita con l'ACES schiarisce i gialli forti, come per tutte le divise. Ho fissato 0,40 + distanza dal dichiarato dopo la misura;
   la prima stesura (0,50) era più alta.
3. **Righe bianche sui calzettoni.** I calzettoni sono scuri come dichiarato, ma `_socksTex061` aggiunge una riga di contrasto bianca
   (chiara su calzettone scuro, regola PO-061 valida per tutte le squadre). Non l'ho tolta: il codice non dichiara calzettoni senza riga.
4. **Possibile stessa causa su altri corpi senza numero.** Anche i corpi della panchina e il mister di bordo campo ricevono il kit da
   `_applyHyperKit` senza numero (src/12, ~r. 1969), cioè dallo stesso ramo che scrive l'esadecimale nel materiale: per costruzione
   potrebbero essere schiariti allo stesso modo. Non l'ho misurato né corretto (fuori ambito): non posso confermarlo.
5. **Entrata della sostituzione.** L'eroe che entra aspetta sulla linea a z = -34,4, x = -6; il guardalinee del lato tribuna ora sta a
   z = -34,0 e x = metà della palla: se la palla è vicina a x = -12 i due possono sovrapporsi. Non misurato (il guardiano copre festa,
   gioco e highlight, non l'ingresso dalla panchina).
6. **Qualificazione all'ultima giornata.** Come deciso, cambia solo l'eliminazione: chi si qualifica all'ultima giornata resta
   «nessuno». Una sconfitta che però qualifica riceve ancora «Serata europea amara… il girone è ancora aperto» (girone in realtà chiuso).
7. **`fuori222`.** Oltre alla classifica, dopo un'eliminazione ho escluso dal rilancio «Detto così sembra una sfida ai prossimi
   avversari»: è una mia lettura di «coerente col risultato». Da confermare.
8. **`mirata`.** `guardalinee-222` è nelle catene `completa` e `carriera` come chiesto; non l'ho messo nella `mappa` di `mirata` per
   `src/12` (spetta al PO), e così `interviste-211` per `src/07`/`src/18`.
9. **`ingresso-206` e `gigante-212` superano i 10 minuti di una chiamata.** `gigante-212` l'ho eseguito per scenario (4 corse verdi +
   rosso); `ingresso-206` in sottofondo con attesa in primo piano (42 min). Una prima corsa di `ingresso-206` è stata fermata dal limite
   del sottofondo a 30 min e non conta.
10. Roadmap (`docs/governo/ROADMAP.md`) non aggiornata: giro sul ramo di sviluppo, `GAME_VERSION` invariato, nessun rilascio.
