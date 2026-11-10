# Giro 138 — lotto strumenti (decisione PO 10/11: «Lotto strumenti nella 189»)

Ramo `collaudo/giro138-strumenti` da `lavoro/188` (04a62ae, 7.999.188). Solo strumenti in `tests/visual`: `src/` e
`CARRIER-MANAGER-AV.html` NON toccati, `GAME_VERSION` invariata. Un controllo alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`,
`free -m` / `df -h` prima di ogni corsa (memoria libera 14,6-15,5 GB, disco 29 GB liberi in tutte le corse).

## Tabella prima/dopo

| strumento | voce | prima (com'era) | causa | dopo | esito |
|---|---|---|---|---|---|
| `festa-57` | PO-336 | 2 corse, **uscita 1** entrambe: rosso 57 fermo **3** e **1** campioni (serve ≥4); nella 1ª anche rosso 61 «non si distingue» (0 campioni) | **strumento** | 2 corse sulla versione finale, **uscita 0** entrambe: verde fino a 4,39 / 4,43 (clip ripartita), rosso 57 **4 campioni fermi a 2,04**, rosso 61 distinto | chiuso |
| `portiere-252` | PO-316 | 1 corsa, **uscita 1**: verde KO 0/7 · rosso KO **0/7** «rosso NON VISTO» (come 10/11 e verifica 182) | **strumento** (braccio rosso senza la geometria del difetto) | 2 corse **uscita 0**: verde KO 0/10 · rosso KO **3/10** e **2/10**, tutti sui tiri angolati fissati | chiuso |
| `griglia-mobile` | verifica 188 r.28-29 | 2 corse normali uscita **0** (riprodotto **non** il rosso), prepartita **mai misurata** (`playMatch → nomatch`, 13 schermate); con un rifiuto orfano alla chiusura del browser: rapporto completo e poi **uscita 1** = il sintomo della 188 | **strumento** (uscita implicita; prepartita cieca) | 2 corse normali **uscita 0** «misura completa: 14 schermate x 5 larghezze»; col rifiuto iniettato **uscita 0** con l'errore stampato come tardivo; con un rifiuto durante la raccolta **uscita 3** col motivo | chiuso |

## 1 · `festa-57` (PO-336) — strumento, non la festa

**Misura prima** (script com'era, 7.999.188):

| corsa | verde | rosso `__CPM_NO_FESTA57` | rosso `__CPM_NO_FESTA61` | uscita |
|---|---|---|---|---|
| prima 1 | 12 campioni 0,05→1,78, fermo 1 | 0,07→2,04, poi **2,04 ×3** (fine dei 12 campioni) | **0 campioni** (clip `mx-fist-pump`, non contiene «victory») | 1 |
| prima 2 | 12 campioni 0,05→1,88, fermo 1 | 0,07→**2,04 all'ultimo campione**, fermo 1 | `mx-victory-jump` | 1 |

**Causa misurata.** La festa NON è cambiata nel senso del difetto: col rosso la clip `mx-victory` si congela davvero a 2,04 s
(= 45% di una clip da ~4,5 s, il tetto della posa 191 in `src/12` r.~11826). Lo strumento campionava **12 volte ogni 600 ms di
parete** e la clip arrivava al congelamento al 9°-12° campione: restavano 1-3 campioni fermi contro i 4 richiesti. La finestra
era stata tarata quando la clip era il salto (`mx-victory-jump`, giro 57) e il congelamento era al 34%; col giro 61 (clip
`mx-victory`, più lunga) e il giro 118 (congelamento al 45%) la stessa finestra non bastava più. Seconda causa: il rosso 61 cercava
solo clip col nome «victory», ma con `__CPM_NO_FESTA61` il gioco suona `mx-victory-jump` **oppure** `mx-fist-pump` (dipende da
`_PUGNO32`, lasciato dall'ultima esultanza di gol: src/12 r.140 e r.8949) — nella prima corsa la clip c'era ma non veniva vista.

**Correzione (solo `tests/visual/festa-57.mjs`).**
- si campiona fino all'**evento** che decide: clip ferma 4 campioni di fila (rosso) oppure clip **ripartita da capo** (ha superato
  ogni punto di congelamento), tetto 90 campioni; se la festa finisce prima, il braccio è non giudicato;
- la festa leggera si chiude a **9,5 s di parete** (src/15 r.~2243) e a fps headless la clip non arriva in fondo: la sonda la tiene
  aperta con `__CPM_CER_HOLD` (meccanismo già del gioco, attivo solo sotto `?cpmtest=1`) — senza, il verde arrivava a 2,37 contro
  il 2,04 del rosso (corsa intermedia «dopo 1», uscita 0 ma margine stretto);
- la clip campionata è il **gesto `mx-*` di peso massimo** e si giudica la clip dominante (al primo campione può pesare ancora
  `mx-disappunto`); il fermo si conta sulla stessa clip;
- il verde deve **superare il punto in cui il rosso si ferma** (altrimenti passerebbe a vuoto); soglie invariate (verde ≤2 di fila,
  rosso ≥4); braccio e motivo stampati per ultimi; `CPM_BRACCI` per corse parziali, che escono sempre 1.

**Dopo:**

| corsa | verde | rosso 57 | rosso 61 | uscita | durata |
|---|---|---|---|---|---|
| dopo 2 | 0,05→**4,39**, poi 0,24 (ripartita), fermo 1 | 0,07→2,04, **2,04 ×4** (clip ferma) | `mx-fist-pump`, ripartita | 0 | 481 s |
| dopo 3 | 0,05→**4,43**, poi 0,29 (ripartita), fermo 1 | 0,07→2,04, **2,04 ×4** (clip ferma) | `mx-fist-pump`, ripartita | 0 | 482 s |

Nota per il PO (non decisa qui): col rosso 61 il gioco oggi non torna sempre al «salto rannicchiato» che il commento del giro 61
descrive, ma anche al pugno (`mx-fist-pump`), secondo l'ultima esultanza della partita. Il guardiano ora accetta qualunque clip
diversa da `mx-victory` come prova che il rosso si distingue.

## 5 · `griglia-mobile` — da dove veniva l'uscita 1

**Misura prima** (script com'era, 7.999.188): due corse complete, entrambe **uscita 0**, 217 s, stderr vuoto, ultima riga
«NON misurato: prepartita: playMatch → nomatch». Il rosso della verifica 188 non si riproduce da solo, come per la madre.

**Causa.** Lo script non aveva nessuna uscita esplicita nel percorso normale: finiva quando Node finiva. L'unico modo di avere 1
senza un `process.exit(1)` è un **rifiuto di promessa non gestito** (o un'eccezione non catturata). E arriva **dopo** la stampa per
costruzione: dopo `await browser.close()` tutto il resto (rapporto, scrittura dei file, `console.log`) è codice sincrono, e Node
controlla i rifiuti non gestiti solo quando la coda dei microtask si svuota, cioè dopo l'ultima riga. Prova del meccanismo:
- esperimento minimo su Node 22.23.4: un rifiuto orfano nato durante un `await` → tutte le righe stampate, poi uscita 1;
- sullo script com'era, un rifiuto orfano nato **nello stesso giro** in cui `browser.close()` si risolve (`CPM_PROVA_TARDIVO=1`,
  come le operazioni di Playwright rifiutate alla disconnessione) dà **esattamente** il sintomo della 188: rapporto completo, ultima
  riga «NON misurato: prepartita: playMatch → nomatch», poi uscita 1 (stack su stderr, che la tabella della verifica non riporta);
- lo stesso rifiuto in un timer durante la chiusura esce invece **prima** del rapporto: non è il sintomo della 188.

**Non posso confermare** quale operazione abbia generato il rifiuto nella verifica 188 (lo stderr di quella corsa non è conservato);
è confermato che il meccanismo produce quel sintomo e che dipende dai tempi della macchina, il che spiega «una volta sì e una no».

**Seconda causa trovata misurando: la prepartita non è mai stata misurata.** Il salvataggio di prova (`lib/banco-g0.mjs`) non ha
calendario; in quello rigenerato nessuna settimana 1..40 offre una gara di campionato (misurato con `thisWeekMd()` settimana per
settimana): l'unica partita servita è la settimana 9, un'amichevole della Nazionale (schermata «Convocazione nazionale»). Avanzare
con `step()` non basta (4 passi, sempre `nomatch`). La sonda ora inietta con `patch()` (gancio di prova del gioco) **una** giornata di
campionato alla settimana corrente contro un club della classifica affrontato meno di due volte (la guardia `_lgHist98` del gioco
scarta il terzo incontro) e apre la prepartita con la stessa via del giocatore (`playMatch`). Misurata: 0 px di overflow, 0 nodi
sotto 11 px, 0/29 sotto soglia di contrasto a 412 px.

**Correzione (solo `tests/visual/griglia-mobile.mjs`).**
- `unhandledRejection` / `uncaughtException` intercettati e **stampati**: prima della fine della raccolta → uscita 3 col motivo;
  dopo la fine della raccolta → «errore tardivo», stampato, non cambia l'esito;
- chiusura del browser con tetto (10 s) e catch, server chiuso con `closeAllConnections`;
- **uscita esplicita** dopo un giro di eventi: 0 se la misura è completa, 1 se qualcosa non è stato misurato («non giudicato» =
  rosso), con la riga `ESITO griglia-mobile: uscita N · MOTIVO …` per ultima;
- prova del rosso dello strumento: `CPM_PROVA_TARDIVO=1` (rifiuto alla chiusura) e `CPM_PROVA_TARDIVO=presto` (durante la raccolta).

**Dopo:**

| corsa | uscita | ultima riga |
|---|---|---|
| finale 1 | 0 | ESITO griglia-mobile: uscita 0 · MOTIVO misura completa: 14 schermate x 5 larghezze |
| finale 2 | 0 | idem (70 scatti) |
| `CPM_PROVA_TARDIVO=1` | 0 | idem, preceduta da «⚠️ errore tardivo dopo la raccolta … rifiuto orfano alla chiusura del browser» |
| `CPM_PROVA_TARDIVO=presto` (corsa intermedia) | 3 | ESITO griglia-mobile: uscita 3 · MOTIVO errore asincrono durante la raccolta |
| corsa intermedia prima della prepartita iniettata | 1 | ESITO … uscita 1 · MOTIVO non misurato (= rosso): prepartita: playMatch → nomatch |

⚠️ Effetto sulla catena: da ora uno «NON misurato» rende `griglia-mobile` rosso (regola PROCESSO.md «non giudicato = rosso»);
prima usciva 0 lasciando la prepartita fuori dal conto. Il rapporto `docs/collaudo-grafico/g0/` ha ora 14 schermate (era 13): il
confronto dei totali con le corse precedenti va fatto tenendone conto. Le corse di questo giro scrivevano in una cartella di
lavoro (`CPM_OUT`), non in `docs/collaudo-grafico/g0/`, che resta quello di prima.

Osservazione per il PO (non indagata oltre, non decisa): il calendario rigenerato dal salvataggio di prova senza gare di
campionato servibili può essere una proprietà del salvataggio sintetico (nessun `calendar`, 10 gare in `matchHistory`) o un
comportamento della rigenerazione del calendario: **non posso confermare quale** senza una sonda dedicata.

## 2 · `portiere-252` (PO-316) — braccio rosso ridisegnato con tiri angolati fissati

**Misura prima** (script com'era): corsa del giro 138 «verde KO 0/7 · rosso KO 0/7 · ❌ rosso NON VISTO: 0 KO su 7 portieri
giudicati (seme 1, 8 scene)», uscita 1, 648 s — identica alla misura del 10/11 sulla 187 (`RICONCILIAZIONE-136.md` r.59) e alla
verifica 182.

**Causa.** Con `__CPM_NO_GK252` il portiere decide lato e bersaglio sulla z FINALE dell'arco invece che sul punto in cui il pallone
attraversa il suo piano (`src/12` r.~6008). Il difetto si vede solo quando questi due punti cadono da **lati opposti** del portiere,
cioè su un tiro molto angolato; con le posizioni di partenza delle otto scene questo non succede (il seme fisso del giro 111 rende
ripetibile il bersaglio, non lo rende angolato). Misurato (corsa «dopo 1», casi
base): pallone al piano del portiere a 1,5-5,8 u dalla sua posizione e reazione mai dal lato opposto («verso» falso in tutti e
14 i casi base giudicati, nei due bracci).

**Correzione (solo `tests/visual/portiere-252.mjs`).** Tre casi in più, gli stessi nei due bracci: la sonda fissa la posizione di
partenza dell'eroe (`startZone` della scena, nella sua pagina) vicino al fondo, sulla fascia — gi13 fuori e parata da (88,14), gi1
parata da (88,86). Il seme del bersaglio è quello del caso base. Soglie e criteri invariati (verde 0 KO, rosso almeno 1 KO, 0,6/0,3,
0,05 s, 4,5 u). In più: `CPM_SZ252=x,y` per esplorare una posizione, `CPM_SOLO_ANGOLATI=1` per i soli tre casi, registro del portiere
(`__CPM_GKACT`) e posizione dell'eroe nel `--verbose`; braccio e motivo per ultimi.

Esplorazione (solo rosso, 4 scene per posizione): da (88,14) gi13 KO «verso» 2/2 con `lastTz` 1,09 / −1,91 (uguali fra corse:
il seme regge); da (88,86) gi1 KO «tardi». gi67 e gi1 da (88,14) non giudicati (bruciapelo < 0,2 s).

**Dopo:**

| corsa | verde | rosso | uscita | durata |
|---|---|---|---|---|
| dopo 1 | KO 0/10 | **KO 3/10**: gi13@88,14 fuori (verso), gi13@88,14 parata (verso), gi1@88,86 parata (tardi+verso) | 0 | 907 s |
| dopo 2 | KO 0/10 | **KO 2/10**: gi13@88,14 fuori (verso), gi13@88,14 parata (verso); gi1@88,86 questa volta ok | 0 | 873 s |

gi13 da (88,14) è KO in tutte e tre le corse rosse (esplorazione + 2), gi1 da (88,86) in 2 su 3: il rosso non dipende più da un solo caso.
Costo: la corsa passa da ~650 s a ~880-910 s (sopra i 10 minuti: va lanciata in sottofondo).
