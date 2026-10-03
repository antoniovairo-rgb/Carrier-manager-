# MAPPA DEL GIOCO — build 7.999.126 — 03/10/2026

Consolidamento complessivo: **62% (Team 62%)** (affidabilità: 24 nodi alta · 38 media · 15 bassa su 77 nodi nel conto; nessun valore PO ancora)

> **Limiti di questa stesura (PO-205, prima versione).** Albero generato **dal codice** (`grep` su `src/*.jsx`: stati `screen`/`setScreen`, fasi `phase` di `App`, `LiveMatch` e `TrialFlow`, linguette `tab`, finestre `…Modal` e overlay di `CareerApp`, componenti di scena 3D) e dai documenti di governo (`BACKLOG.md`, `ROADMAP.md`, `DECISIONI.md`, `RISCHI.md`, `ARCHITETTURA.md`, `STABILITA.json`). **La verifica navigando il gioco NON è stata fatta** (macchina occupata dai collaudi, nessun browser): per questo il criterio **Resa** ha un punteggio solo dove esiste una misura o una segnalazione del PO, altrove è «Non posso confermarlo». La versione 7.999.126 è la release in corso (guanti dei portieri, formazioni). I numeri di riga valgono per questa build.

## Legenda e griglia

**Sei criteri, punteggio 0-100 ciascuno, ognuno con una riga di prova.**

| Criterio | Peso | Come si dà il punteggio |
|---|---:|---|
| Funzione | 25% | 90+ completa e raggiungibile, tutto ciò che il PO ha chiesto c'è · 70-89 completa con lacune note · 50-69 parziale · <50 incompleta o non raggiungibile (letto nel codice) |
| Stabilità | 20% | parte da 100: −15 per ogni difetto aperto/parziale/da collaudare sul nodo, −25 per un bloccante aperto, −10 per ogni correzione ripetuta (stesso difetto riaperto o corretto in più release) nel registro recente (7.999.98 → 7.999.126) o per un rosso sull'ultimo giro di `STABILITA.json`. Le voci chiuse da tempo pesano meno (giudizio dichiarato) |
| Test | 15% | 0 nessuno · 20-30 solo sonde o censimenti senza soglia (`griglia-mobile`) o test fuori catena senza rosso · 40-50 guardiani con interruttore rosso `__CPM_NO_*` ma **fuori** dalle catene · 55-75 guardiano con rosso **dentro** una catena di `tests/visual/ci-runner.mjs` (completa, carriera, grafica, guardiani) · 80-90 più guardiani in catena che coprono il flusso principale, ultimo giro verde · −10 se l'ultimo giro è rosso |
| Coerenza | 15% | rispetto delle decisioni PO (`DECISIONI.md`), stesso kit delle altre schermate, niente codice morto o guardiani che verificano un comportamento superato |
| Resa | 15% | solo da misure o segnalazioni del PO (foto, collaudi). Senza prove: «Non posso confermarlo», criterio **senza punteggio** |
| Solidità tecnica | 10% | dimensione e intreccio del codice, `Math.random()` non seedati, gestione degli errori, strumentazione di test in produzione (`ARCHITETTURA.md`, DT-01…09) |

**Calcolo.** Schermata (nodo) = media pesata dei criteri **che hanno un punteggio** (i pesi dei criteri senza punteggio non entrano: la colonna «prova» dice quanta parte del peso è coperta). Poi si applicano i **tetti**: difetto bloccante aperto → massimo 50% · nessun guardiano in una catena di `ci-runner.mjs` → massimo 70% · segnalazione di collaudo PO aperta sul nodo → massimo 80%. Ramo = media dei nodi pesata per **importanza** (3 = cuore del ciclo di gioco, 2 = frequente, 1 = raro o accessorio, 0 = solo sviluppo, fuori dal conto). Gioco = **media semplice** dei 13 rami.

**Affidabilità** — alta: il nodo è coperto da un guardiano in catena o da una misura registrata · media: punteggi letti nel codice e nei documenti · bassa: prevale il giudizio (nessun guardiano, nessuna segnalazione, criteri senza punteggio).

**Valori.** `Team` = la nostra stima. `PO: __%` = spazio per il valore del PO (con nota). **Valore valido = PO se presente, altrimenti Team.** Rami e gioco si scrivono `NN% (Team MM%)`: oggi nessun valore PO esiste, quindi NN = MM.

**Interpretazione dichiarata dei tetti.** «Nessun guardiano» = nessun guardiano che giri in una catena di `ci-runner.mjs`: un guardiano col rosso che nessuno lancia non protegge (PO-178: 8 su 19 erano rossi senza che nessuno se ne accorgesse). «Segnalazione PO aperta» = voce aperta o parziale in `BACKLOG.md` nata da una richiesta o una foto del PO che riguarda il nodo.

**Correzioni proposte alla griglia (in attesa del PO, non applicate):**
1. *Resa senza prova.* Escludere il criterio (come oggi) gonfia i nodi mai guardati: proposta di contarla 50 oppure di porre un tetto 75% ai nodi con Resa non verificata. Oggi 62 nodi su 78 hanno la Resa senza punteggio.
2. *Peso dei rami nel valore del gioco.* La media semplice dà a «Club» (3 nodi) lo stesso peso di «Partita» (12 nodi, dove il giocatore passa la maggior parte del tempo). Proposta: pesare i rami per tempo di gioco (Partita ×3, Home e ciclo ×2, Stagione ×2, Sistemi ×2, gli altri ×1). Con quei pesi il gioco varrebbe 62%.
3. *Stabilità.* Oggi è una formula applicata a mano sulle voci del backlog: andrebbe calcolata da uno script su `BACKLOG.md` + `STABILITA.json` per nodo (serve una colonna «nodo» nel backlog).

**Regole di aggiornamento.**
- La mappa si aggiorna **a ogni fine lotto** (e a ogni release che chiude una voce collegata, se il PO lo chiede).
- Il team cambia **solo i valori Team**; i valori **PO non si toccano mai** (li scrive solo il PO).
- Ogni variazione si mostra come `NN% → MM%` accanto al nodo, al ramo e al gioco, per una sola stesura (poi resta il valore nuovo).
- Se il valore PO è **più basso di Team di 15 punti o più**, il team scrive un'analisi dello scarto nella scheda del nodo e apre una voce in `BACKLOG.md`.
- I numeri di riga si rigenerano con `grep` a ogni aggiornamento; un nodo nuovo nel codice (nuovo `setScreen`, nuova finestra) entra nell'albero alla stesura successiva.

## Albero

```
Korward Elite 7.999.126 — 62% (Team 62%)
├── 1 Avvio e accesso — 67% (Team 67%) [media]
│   ├── 1.1 Caricamento e ripresa automatica — Team 66% [media] · PO: __%
│   ├── 1.2 Menu principale e slot di salvataggio — Team 70% [media] · PO: __%
│   ├── 1.3 Impostazioni — Team 67% [media] · PO: __%
│   ├── 1.4 Importa ed esporta salvataggio — Team 59% [media] · PO: __%
│   └── 1.5 Revisione azioni e prova situazioni (solo sviluppo) — Team 57% [bassa] · PO: __% (peso 0, fuori dal conto)
├── 2 Percorso iniziale (creazione, provini, Primavera, passaggio pro) — 69% (Team 69%) [media]
│   ├── 2.1 Creazione del giocatore — Team 69% [media] · PO: __%
│   ├── 2.2 Filmato introduttivo — Team 65% [bassa] · PO: __%
│   ├── 2.3 Provini (tre partite) — Team 65% [media] · PO: __%
│   ├── 2.4 Offerte di fine provini — Team 81% [alta] · PO: __%
│   ├── 2.5 Stagioni Primavera (Under 18) — Team 64% [media] · PO: __%
│   └── 2.6 Passaggio a professionista — Team 71% [alta] · PO: __%
├── 3 Home e ciclo settimanale — 59% (Team 59%) [media]
│   ├── 3.1 Home (cruscotto) — Team 64% [media] · PO: __%
│   ├── 3.2 Pulsante principale e avanzamento della settimana — Team 50% [alta] · PO: __%
│   ├── 3.3 Vivi la settimana ed eventi settimanali — Team 64% [media] · PO: __%
│   ├── 3.4 Momenti di carriera — Team 61% [bassa] · PO: __%
│   ├── 3.5 Il mister: verifica mensile e dialoghi — Team 64% [media] · PO: __%
│   ├── 3.6 Interazioni d'apertura stagione — Team 69% [media] · PO: __%
│   ├── 3.7 Tutorial — Team 54% [bassa] · PO: __%
│   └── 3.8 Allenamento (vista orfana) — Team 26% [media] · PO: __%
├── 4 Stagione — 71% (Team 71%) [alta]
│   ├── 4.1 Classifica — Team 75% [alta] · PO: __%
│   ├── 4.2 Calendario — Team 74% [alta] · PO: __%
│   ├── 4.3 Coppe (nazionale, europee, tornei) — Team 66% [alta] · PO: __%
│   ├── 4.4 Sorteggi dei gironi europei — Team 69% [media] · PO: __%
│   └── 4.5 Ritiro pre-campionato — Team 66% [media] · PO: __%
├── 5 Partita — 61% (Team 61%) [alta]
│   ├── 5.1 Scelta Gioca / Simula — Team 50% [alta] · PO: __%
│   ├── 5.2 Conferenza pre-partita e discorso del mister — Team 67% [alta] · PO: __%
│   ├── 5.3 Giorno partita e rapporto dell'osservatore — Team 70% [media] · PO: __%
│   ├── 5.4 Formazioni — Team 70% [alta] · PO: __%
│   ├── 5.5 Ingresso in campo (3D) — Team 58% [alta] · PO: __%
│   ├── 5.6 Partita 2D — Team 60% [alta] · PO: __%
│   ├── 5.7 Highlight 3D dell'eroe — Team 50% [alta] · PO: __%
│   ├── 5.8 Rigori di fine gara — Team 64% [media] · PO: __%
│   ├── 5.9 Fine gara: riepilogo, pagelle e tabellino — Team 65% [media] · PO: __%
│   ├── 5.10 Festa di fine partita — Team 52% [media] · PO: __%
│   ├── 5.11 Rassegna stampa post-partita — Team 68% [media] · PO: __%
│   └── 5.12 Simula: la partita dell'eroe senza giocarla — Team 65% [alta] · PO: __%
├── 6 Club — 63% (Team 63%) [media]
│   ├── 6.1 Scheda Club — Team 65% [media] · PO: __%
│   ├── 6.2 Presentazione al nuovo club — Team 59% [bassa] · PO: __%
│   └── 6.3 Numero di maglia — Team 61% [media] · PO: __%
├── 7 Carriera — 57% (Team 57%) [media]
│   ├── 7.1 Profilo — Team 59% [media] · PO: __%
│   ├── 7.2 Diario sfogliabile — Team 62% [bassa] · PO: __%
│   ├── 7.3 Traguardi (milestone e achievement) — Team 64% [bassa] · PO: __%
│   └── 7.4 Stile di gioco (archetipi) — Team 49% [media] · PO: __%
├── 8 Agente e Ufficio — 63% (Team 63%) [media]
│   ├── 8.1 Agente (procuratore, mercato, contratto, cessione, prestito) — Team 63% [media] · PO: __%
│   ├── 8.2 Primo incontro col procuratore — Team 70% [media] · PO: __%
│   ├── 8.3 Offerta di trasferimento e rifiuto — Team 67% [media] · PO: __%
│   ├── 8.4 Trattativa del contratto — Team 60% [bassa] · PO: __%
│   └── 8.5 Ufficio (patrimonio, staff privato, investimenti) — Team 58% [media] · PO: __%
├── 9 Nazionale — 56% (Team 56%) [media]
│   ├── 9.1 Scheda Nazionale — Team 57% [media] · PO: __%
│   ├── 9.2 Convocazione e partita in Nazionale — Team 62% [media] · PO: __%
│   └── 9.3 Tornei per nazionali (Coppa delle Nazioni, Europeo, Mondiale) — Team 50% [alta] · PO: __%
├── 10 Media e relazioni — 62% (Team 62%) [bassa]
│   ├── 10.1 Intervista post-partita (3D) — Team 64% [media] · PO: __%
│   ├── 10.2 Esito dell'intervista — Team 60% [bassa] · PO: __%
│   └── 10.3 Relazioni: spogliatoio, rivale, stampa — Team 61% [bassa] · PO: __%
├── 11 Cerimonie e scene 3D — 59% (Team 59%) [alta]
│   ├── 11.1 Serata di presentazione della squadra — Team 68% [alta] · PO: __%
│   ├── 11.2 Premiazione di squadra in campo — Team 46% [alta] · PO: __%
│   ├── 11.3 Festa del titolo (finestra) — Team 57% [bassa] · PO: __%
│   ├── 11.4 Galà dei premi — Team 61% [alta] · PO: __%
│   ├── 11.5 Podio della stagione — Team 59% [bassa] · PO: __%
│   ├── 11.6 Parata del pullman — Team 64% [alta] · PO: __%
│   └── 11.7 Stadi 3D — Team 61% [media] · PO: __%
├── 12 Fine stagione e fine carriera — 64% (Team 64%) [media]
│   ├── 12.1 Fine stagione — Team 65% [media] · PO: __%
│   ├── 12.2 Annuncio del ritiro e stagione d'addio — Team 68% [media] · PO: __%
│   ├── 12.3 Fine carriera — Team 64% [bassa] · PO: __%
│   └── 12.4 Nuova partita+ (eredità) — Team 55% [bassa] · PO: __%
└── 13 Sistemi trasversali — 59% (Team 59%) [alta]
    ├── 13.1 Motore della partita (brain) — Team 58% [alta] · PO: __%
    ├── 13.2 Simulazione delle altre partite e classifiche — Team 71% [alta] · PO: __%
    ├── 13.3 Salvataggi e migrazioni — Team 50% [alta] · PO: __%
    ├── 13.4 Calendario e competizioni (generazione) — Team 66% [alta] · PO: __%
    ├── 13.5 Mercato e contratti — Team 63% [media] · PO: __%
    ├── 13.6 Crescita del giocatore e difficoltà — Team 56% [media] · PO: __%
    ├── 13.7 Generazione club, rose e nomi — Team 73% [media] · PO: __%
    ├── 13.8 Audio — Team 56% [bassa] · PO: __%
    ├── 13.9 Prestazioni — Team 42% [bassa] · PO: __%
    ├── 13.10 Gestione degli errori — Team 35% [media] · PO: __%
    ├── 13.11 Build web e store — Team 62% [media] · PO: __%
    ├── 13.12 Corpi, clip e gesti 3D — Team 54% [alta] · PO: __%
    └── 13.13 Kit grafico e tema — Team 72% [alta] · PO: __%
```

| Ramo | Valore | Nodi | Pesi dei nodi (importanza) | Affidabilità (quota del peso) |
|---|---:|---:|---|---|
| 1 Avvio e accesso | 67% (Team 67%) | 5 | 1.1×3, 1.2×3, 1.3×2, 1.4×1, 1.5×0 | alta 0% · media 100% · bassa 0% |
| 2 Percorso iniziale (creazione, provini, Primavera, passaggio pro) | 69% (Team 69%) | 6 | 2.1×3, 2.2×1, 2.3×2, 2.4×2, 2.5×3, 2.6×2 | alta 31% · media 62% · bassa 8% |
| 3 Home e ciclo settimanale | 59% (Team 59%) | 8 | 3.1×3, 3.2×3, 3.3×3, 3.4×2, 3.5×2, 3.6×2, 3.7×1, 3.8×1 | alta 18% · media 65% · bassa 18% |
| 4 Stagione | 71% (Team 71%) | 5 | 4.1×3, 4.2×3, 4.3×2, 4.4×1, 4.5×1 | alta 80% · media 20% · bassa 0% |
| 5 Partita | 61% (Team 61%) | 12 | 5.1×3, 5.2×2, 5.3×2, 5.4×2, 5.5×2, 5.6×3, 5.7×3, 5.8×1, 5.9×3, 5.10×2, 5.11×2, 5.12×2 | alta 63% · media 37% · bassa 0% |
| 6 Club | 63% (Team 63%) | 3 | 6.1×3, 6.2×1, 6.3×1 | alta 0% · media 80% · bassa 20% |
| 7 Carriera | 57% (Team 57%) | 4 | 7.1×3, 7.2×1, 7.3×1, 7.4×2 | alta 0% · media 71% · bassa 29% |
| 8 Agente e Ufficio | 63% (Team 63%) | 5 | 8.1×3, 8.2×1, 8.3×2, 8.4×2, 8.5×2 | alta 0% · media 80% · bassa 20% |
| 9 Nazionale | 56% (Team 56%) | 3 | 9.1×2, 9.2×2, 9.3×2 | alta 33% · media 67% · bassa 0% |
| 10 Media e relazioni | 62% (Team 62%) | 3 | 10.1×2, 10.2×1, 10.3×2 | alta 0% · media 40% · bassa 60% |
| 11 Cerimonie e scene 3D | 59% (Team 59%) | 7 | 11.1×2, 11.2×2, 11.3×1, 11.4×2, 11.5×1, 11.6×1, 11.7×2 | alta 64% · media 18% · bassa 18% |
| 12 Fine stagione e fine carriera | 64% (Team 64%) | 4 | 12.1×3, 12.2×1, 12.3×2, 12.4×1 | alta 0% · media 57% · bassa 43% |
| 13 Sistemi trasversali | 59% (Team 59%) | 13 | 13.1×3, 13.2×3, 13.3×3, 13.4×2, 13.5×2, 13.6×2, 13.7×2, 13.8×1, 13.9×2, 13.10×2, 13.11×2, 13.12×2, 13.13×2 | alta 54% · media 36% · bassa 11% |

## Schede dei nodi

### Ramo 1 — Avvio e accesso — 67% (Team 67%)

#### 1.1 Caricamento e ripresa automatica — Team 66% [media] · PO: __%

- **Nel codice:** `App` fase `loading` + auto-ripresa (`src/19-app-root.jsx:760-806`)
- **Come ci si arriva:** apertura dell'app; con carriera attiva (`cpm-active`) si rientra dritti in carriera
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | riprende carriera (19:776-779), provini (19:781-803) e link `?review=` (19:771); fallback «Stato non riconosciuto» (19:956) |
| Stabilità (20%) | 75 | nessuna voce aperta; ricorrenze chiuse: PO-037 «si riavvia in background» (7.999.11 e 7.999.12), PO-115 avanzamento perso (7.999.55) |
| Test (15%) | 20 | auto-ripresa DISATTIVATA sotto `?cpmtest=1` (19:766): nessun guardiano la esercita; `dist-web-partita-test.mjs` fuori dalle catene |
| Coerenza (15%) | 80 | ripresa sullo stesso tab (`cpm-active-tab`, 18:122) coerente con la direttiva 7.149 |
| Resa (15%) | — | Non posso confermarlo (nessuna navigazione eseguita) |
| Solidità tecnica (10%) | 60 | ogni lettura in try/catch; rischio R-04 «partita in corso persa» (RISCHI.md) |
| **Media pesata** | 66 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **66** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** un guardiano che ricarichi la pagina SENZA `cpmtest` (carriera, provini, partita in corso) e lo metta in una catena.

**Voci del backlog collegate:** PO-167, PO-176. Voce da aprire: Guardiano dell'auto-ripresa reale (oggi spenta sotto `cpmtest=1`).

#### 1.2 Menu principale e slot di salvataggio — Team 70% [media] · PO: __%

- **Nel codice:** `HomeScreen` (`src/17-menu-creazione-pannelli.jsx:116`), `HomeNavBar` (19:712), `PwaInstallBanner` (17:27)
- **Come ci si arriva:** fase `home` (19:947), quando non c'è una carriera da riprendere
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 85 | tre slot, nuova/carica/elimina/importa (19:947); barra in basso (19:938) |
| Stabilità (20%) | 85 | nessuna voce aperta in BACKLOG.md; rilievo chiuso «il testo è sovrapposto!» (`slot-card-layout-test.mjs`) |
| Test (15%) | 30 | `griglia-mobile` (catena grafica) misura la schermata `home` ma è un censimento senza soglia (griglia-mobile.mjs:164); `slot-card-layout-test.mjs` fuori catena |
| Coerenza (15%) | 75 | commento G9 in griglia-mobile.mjs: «la schermata iniziale e' rimasta completamente fuori standard» (22/09), poi uniformata; esito attuale Non posso confermarlo |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 70 | componente di 140 righe, nessuna logica di gioco |
| **Media pesata** | 72 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **70** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano del menu (slot pieni/vuoti, nessun testo sovrapposto) in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Guardiano del menu principale con slot pieni e vuoti.

#### 1.3 Impostazioni — Team 67% [media] · PO: __%

- **Nel codice:** `SettingsScreen` (`src/19-app-root.jsx:601`), `AudioSettings` (19:633)
- **Come ci si arriva:** rotella dal menu (19:877) o «Opzioni» in carriera (18:6033)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | grafica, audio, esporta, rivedi intro, uscita al menu (18:6033-6105) |
| Stabilità (20%) | 85 | PO-044 «Rivedi l'intro non funziona» chiusa in 7.999.12; nessuna voce aperta |
| Test (15%) | 30 | solo il censimento `griglia-mobile` (schermata `impostazioni`) |
| Coerenza (15%) | 60 | nel menu del giocatore stanno «Strumenti di collaudo», appunti e misura del motore (18:6041-6100): strumentazione di test in produzione (DT-08) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 65 | strumenti di collaudo condizionati da `devToolsOn()`, ma il codice è nella build |
| **Media pesata** | 67 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **67** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** togliere o nascondere dalla build store gli strumenti di collaudo; guardiano dei due ingressi.

**Voci del backlog collegate:** PO-072. Voce da aprire: Strumenti di collaudo visibili nelle Impostazioni del giocatore (DT-08).

#### 1.4 Importa ed esporta salvataggio — Team 59% [media] · PO: __%

- **Nel codice:** `importSave` (`src/19-app-root.jsx:820`), `exportSave` (`src/18-career-app.jsx:621`)
- **Come ci si arriva:** menu: «Importa»; carriera: Impostazioni → «Esporta salvataggio»
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | export su file e import con avviso se il salvataggio è di una versione più nuova (19:809) |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 0 | ARCHITETTURA.md «Scoperti oggi: … import di un salvataggio da file»; RISCHI R-05 |
| Coerenza (15%) | 70 | export in fondo alle impostazioni come chiesto dal PO (commento 6.84.0, 18:6100) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | un salvataggio più nuovo viene comunque caricato con un avviso (19:809) |
| **Media pesata** | 59 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **59** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano import→export→import con confronto byte per byte.

**Voci del backlog collegate:** PO-167. Voce da aprire: Guardiano di import/export del salvataggio.

#### 1.5 Revisione azioni e prova situazioni (solo sviluppo) — Team 57% [bassa] · PO: __%

- **Nel codice:** `ReviewWizard` (`src/19-app-root.jsx:50`), `SitTest` (19:181)
- **Come ci si arriva:** `?dev=1` → «Revisione azioni» nel menu (19:948); `?sit=N`
- **Importanza nel ramo:** 0

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | wizard muto (19:944), escluso dalla build store (`__CPM_STORE_BUILD`, 19:947) |
| Stabilità (20%) | — | Non posso confermarlo |
| Test (15%) | 30 | usato dal collaudo, nessun guardiano proprio |
| Coerenza (15%) | 60 | strumento di sviluppo dentro il file di gioco (DT-08) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | dipende dagli hook `window.__CPM_*` |
| **Media pesata** | 57 | peso coperto da prove: 65% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **57** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fuori dal conto (peso 0): resta nella mappa per completezza.

**Voci del backlog collegate:** nessuna.

### Ramo 2 — Percorso iniziale (creazione, provini, Primavera, passaggio pro) — 69% (Team 69%)

#### 2.1 Creazione del giocatore — Team 69% [media] · PO: __%

- **Nel codice:** `CreateScreen` (`src/17-menu-creazione-pannelli.jsx:272`)
- **Come ci si arriva:** menu → slot vuoto → «Nuova carriera» (`startNew`, 19:817)
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | nome, nazione, ruolo, volto; bonus eredità della Nuova partita+ (19:951) |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 30 | solo il censimento `griglia-mobile` (schermata `creazione`); `grep CreateScreen tests/visual` = 0 file |
| Coerenza (15%) | 75 | nella griglia mobile come le altre schermate del menu |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 70 | componente compatto |
| **Media pesata** | 69 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **69** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano «nuova carriera dall'inizio alla prima partita» (lacuna dichiarata in ARCHITETTURA.md).

**Voci del backlog collegate:** nessuna. Voce da aprire: Guardiano nuova carriera: creazione → provini → offerte → prima partita.

#### 2.2 Filmato introduttivo — Team 65% [bassa] · PO: __%

- **Nel codice:** `IntroCinematic` (`src/19-app-root.jsx:221`)
- **Come ci si arriva:** dopo la creazione, la prima volta (`setPhase("cinematic")`, 19:856); «Rivedi l'intro» (19:719)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | una volta per dispositivo (`cpm-intro-seen`, 19:952) e ripetibile |
| Stabilità (20%) | 85 | PO-044 chiusa in 7.999.12 |
| Test (15%) | 0 | nessun test lo cita |
| Coerenza (15%) | 75 | evento unico `cpm-replay-intro` da menu e profilo (19:730-732) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 70 | isolato |
| **Media pesata** | 65 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **65** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** uno scatto di controllo in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Filmato introduttivo»: uno scatto di controllo in catena grafica.

#### 2.3 Provini (tre partite) — Team 65% [media] · PO: __%

- **Nel codice:** `TrialFlow` (`src/17-menu-creazione-pannelli.jsx:469`), fasi `pre`/`match`/`post`
- **Come ci si arriva:** dopo il filmato (19:952) o in ripresa (19:799-803)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | tre provini con la «Selezione Granata» (17:471), ripresa da `cpm-trial-prog` (7.330) |
| Stabilità (20%) | 70 | bug grave chiuso 7.332 «mi ha sovrascritto una carriera» (19:793); mai un quarto risultato (7.331, 17:498) |
| Test (15%) | 30 | `tripath-chokepoint-test.mjs` (fuori catena); la ripresa è spenta sotto `cpmtest` (19:780) |
| Coerenza (15%) | 70 | stessa `LiveMatch` della carriera con `context="trial"` |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 65 | persistenza su chiave separata dallo slot |
| **Media pesata** | 65 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **65** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano dei tre provini con ripresa a metà.

**Voci del backlog collegate:** nessuna. Voce da aprire: Guardiano dei provini con ripresa a metà.

#### 2.4 Offerte di fine provini — Team 81% [alta] · PO: __%

- **Nel codice:** `OffersScreen` (`src/17-menu-creazione-pannelli.jsx:405`)
- **Come ci si arriva:** fine del terzo provino (`onTrials`, 19:857)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 85 | lega e bandiera su ogni offerta (7.999.114, PO-196) |
| Stabilità (20%) | 85 | PO-196 chiusa nello storico |
| Test (15%) | 75 | `calendario-offerte-195` in catena grafica, rosso `__CPM_NO_LEGA196`, verde su 7.999.126 (STABILITA.json) |
| Coerenza (15%) | 80 | etichette di lega coerenti con la Stagione |
| Resa (15%) | — | Non posso confermarlo (correzione 7.999.114 non ricollaudata dal PO) |
| Solidità tecnica (10%) | 70 | logica breve |
| **Media pesata** | 81 | peso coperto da prove: 85% |
| **Tetto** | — | nessuno |
| **Team** | **81** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO della 7.999.114 sul telefono.

**Voci del backlog collegate:** PO-196 (chiusa).

#### 2.5 Stagioni Primavera (Under 18) — Team 64% [media] · PO: __%

- **Nel codice:** `CareerApp` con `proStatus:"u18"` (`src/18-career-app.jsx:10119` riquadro di stato)
- **Come ci si arriva:** firma con un club giovanile dalle offerte (`onChoose`, 19:858)
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | stessa carriera dei pro con regole proprie (gol Primavera fuori dalle classifiche pro, `primavera-awards-test.mjs`) |
| Stabilità (20%) | 55 | PO-194 GRAVE «partita già giocata» in Primavera 2, S.1 (chiusa 7.999.113); PO-192 conferenza «quasi un derby» in Primavera; impulsi «troppo presto» (`impulsi-contesto-test.mjs`) |
| Test (15%) | 60 | `conferenza-192` (rosso `__CPM_NO_DERBY192`) e `partita-rigiocata-194` in catena carriera, verdi su 7.999.122; `primavera-awards-test`, `impulsi-contesto-test` fuori catena |
| Coerenza (15%) | 70 | PO-192: domande da professionisti finite in Primavera |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | molte regole `proStatus==="u18"` sparse in 18 |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | — | nessuno |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo Codex di una stagione Primavera intera con scheda (eventi, conferenze, classifica).

**Voci del backlog collegate:** PO-192 (chiusa), PO-194 (chiusa), PO-153.

#### 2.6 Passaggio a professionista — Team 71% [alta] · PO: __%

- **Nel codice:** schermata `proTransition` → `ProTransitionScreen` (`src/16-scene-3d-cerimonie.jsx:26`); `onProChoose` (`src/18-career-app.jsx:5294`)
- **Come ci si arriva:** fine stagione Under 18 (`setScreen("proTransition")`)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | rivale e sponsor nascono all'accettazione dell'offerta (7.999.120) |
| Stabilità (20%) | 65 | PO-176 PARZIALE: «differenze playedMd e cup.club da ricollaudare con Codex» |
| Test (15%) | 70 | `pro-rivale-176` in catena carriera, rosso `__CPM_NO_PRO176`, verde su 7.999.122 |
| Coerenza (15%) | 75 | stesso flusso offerta/firma della carriera |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | migrazione al caricamento che crea campi (prima della 7.999.120) |
| **Media pesata** | 71 | peso coperto da prove: 85% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-176) |
| **Team** | **71** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** ricollaudo Codex di PO-176 sulla build corrente.

**Voci del backlog collegate:** PO-176.

### Ramo 3 — Home e ciclo settimanale — 59% (Team 59%)

#### 3.1 Home (cruscotto) — Team 64% [media] · PO: __%

- **Nel codice:** linguetta `dashboard` (`src/18-career-app.jsx:7167-8575`)
- **Come ci si arriva:** barra in basso «Home» (18:6025), tasto M
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | circa 45 riquadri condizionati (`tab==="dashboard"` ripetuto 54 volte in 18) |
| Stabilità (20%) | 55 | PO-066 PARZIALE «riquadri fuori standard»; correzioni recenti 7.999.105 (riquadro Europeo «vs ?») e 7.999.110 (titolo in fondo, contrasto 1,11) |
| Test (15%) | 70 | `titolo-110`, `riquadro-euro-105` in catena carriera; `home-riquadri`, `numeri-home` nella catena guardiani (ultimo giro 7.999.98, 01/10) |
| Coerenza (15%) | 60 | PO-066: «Profilo e Nazionale da portare alla card neutra» |
| Resa (15%) | 60 | PO-066 «da completare»; 7.999.110 contrasto 1,11 → 5,93 |
| Solidità tecnica (10%) | 50 | riquadri scritti come blocchi inline nel file da 11.587 righe (DT-06) |
| **Media pesata** | 64 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-066) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-066 e rieseguire la catena guardiani sulla build corrente.

**Voci del backlog collegate:** PO-066.

#### 3.2 Pulsante principale e avanzamento della settimana — Team 50% [alta] · PO: __%

- **Nel codice:** `handleContinua` (18:1253), `doAdvanceWeek` (18:4195), conferma `showAdvanceConfirm` (18:6655)
- **Come ci si arriva:** pulsante fisso in cima alla Home (18:7165), tasto A
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | vivi / gioca / avanza in un solo pulsante; conferma prima di saltare |
| Stabilità (20%) | 20 | PO-183 BLOCCANTE IN CORSO; nota 7.445 «9ª RICORRENZA … partita già giocata» (`src/07-versione-save-interviste.jsx:114`); PO-194 GRAVE (7.999.113); PO-181 settimana ferma (7.999.104); 7.999.103 e 7.999.107 correttive |
| Test (15%) | 85 | `career-critical` (11 guardiani, rossi `__CPM_NO_P0_1…6`) e `partita-rigiocata-194`, `recupero-103`, `euro-attesa-181`, `rinvio-coppe-107` in catena carriera, verdi su 7.999.122 |
| Coerenza (15%) | 65 | tre strade che avanzano la settimana (doAdvanceWeek / onMatchEnd / simulateAndAdvance: `tripath-chokepoint-test.mjs`) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 40 | 65 occorrenze di `Math.random` in `src/18` (grep), DT-07 |
| **Media pesata** | 58 | peso coperto da prove: 85% |
| **Tetto** | 50 | max 50% (difetto bloccante aperto: PO-183) |
| **Team** | **50** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-183 con collaudo; una sola funzione di avanzamento.

**Voci del backlog collegate:** PO-183, PO-176, PO-153.

#### 3.3 Vivi la settimana ed eventi settimanali — Team 64% [media] · PO: __%

- **Nel codice:** `liveCurrentWeek` (18:3911), finestra `weekLiveModal` (18:6165), avviso `weekEvent` (18:6121), `WEEKLY_EVENTS` (`src/03-eventi-narrativi.jsx:26`)
- **Come ci si arriva:** pulsante principale nelle settimane senza partita
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | evento, riabilitazione, spogliatoio, impulso, rivale (18:3929-4565) |
| Stabilità (20%) | 70 | lamentele ripetute chiuse: «in una stagione mai capitato un evento» (`vita-flow-test`), «ripetitivo» (`vita-variety-test`) |
| Test (15%) | 40 | `vita-flow-test`, `vita-variety-test`, `impulsi-contesto-test` fuori catena |
| Coerenza (15%) | 65 | PO-154: «46 impulsi su 112 non hanno condizioni… Nessun impulso ha memoria» |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | testi e pesi in tabelle da 1.459 righe |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-154) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 1 Codex (PO-153) e proposta PO-154; guardiano in catena.

**Voci del backlog collegate:** PO-154, PO-153.

#### 3.4 Momenti di carriera — Team 61% [bassa] · PO: __%

- **Nel codice:** `careerMomentModal` (18:6285), `CAREER_MOMENTS` (`src/03-eventi-narrativi.jsx:972`)
- **Come ci si arriva:** dopo partite o settimane speciali (18:1244)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | finestra in coda alle altre (precedenza unica, rosso `__CPM_NO_CODA23`, 18:6028) |
| Stabilità (20%) | 75 | nessuna voce aperta sul nodo; coda delle finestre corretta il 24/09 |
| Test (15%) | 30 | hook `forceMoment` (18:1369), nessun guardiano in catena |
| Coerenza (15%) | 65 | PO-154: niente memoria né catene |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | trigger probabilistici non seedati |
| **Media pesata** | 61 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **61** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano della coda delle finestre in catena; misura Codex delle frequenze.

**Voci del backlog collegate:** PO-154.

#### 3.5 Il mister: verifica mensile e dialoghi — Team 64% [media] · PO: __%

- **Nel codice:** `monthlyReviewModal` (18:6504), `coachModal` (18:6462)
- **Come ci si arriva:** ogni mese (18:3945); dialogo proattivo (18:4755)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | scelte di risposta con effetti |
| Stabilità (20%) | 75 | chiusa la lamentela «conversazioni molto ripetitive» (`coach-review-variety-test`) |
| Test (15%) | 40 | `coach-review-variety-test`, `coach-face-test` fuori catena |
| Coerenza (15%) | 70 | Modal standard dal 7.993 |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | logica inline nel componente |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano in catena e collaudo dei testi.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Il mister: verifica mensile e dialoghi»: guardiano in catena e collaudo dei testi.

#### 3.6 Interazioni d'apertura stagione — Team 69% [media] · PO: __%

- **Nel codice:** `openingWiz` (18:6890), `openingPending` (18:883: ritiro, presidente, mercato, stampa, maglia, presentazione, addio, sorteggi)
- **Come ci si arriva:** settimana 1 di ogni stagione (`openingGate`, 18:901)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | otto passi in fila in un solo assistente |
| Stabilità (20%) | 75 | nessuna voce aperta |
| Test (15%) | 40 | `home-opening-test` (fuori catena): «le interazioni d'apertura vivono solo nel wizard» |
| Coerenza (15%) | 75 | direttiva PO: niente riquadri pre-stagionali in Home |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | gestori condivisi card⟷wizard (18:904) |
| **Media pesata** | 69 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **69** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** rimettere `home-opening-test` in una catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Interazioni d'apertura stagione»: rimettere `home-opening-test` in una catena.

#### 3.7 Tutorial — Team 54% [bassa] · PO: __%

- **Nel codice:** `TutorialOverlay` (`src/17-menu-creazione-pannelli.jsx:1733`), `TUTORIAL_STEPS` (17:1725)
- **Come ci si arriva:** primo ingresso in Home (`!player.tutorialDone`, 18:6109)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 60 | quattro passi (`tutStep` 0-3, 18:129), salta/avanti |
| Stabilità (20%) | 80 | nessuna voce in BACKLOG.md |
| Test (15%) | 0 | i guardiani impostano `tutorialDone:true` per saltarlo |
| Coerenza (15%) | — | Non posso confermarlo |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 70 | componente piccolo |
| **Media pesata** | 54 | peso coperto da prove: 70% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **54** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo Codex con scheda del primo avvio; uno scatto in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Tutorial: nessuna verifica (né guardiano né collaudo).

#### 3.8 Allenamento (vista orfana) — Team 26% [media] · PO: __%

- **Nel codice:** linguetta `training` (18:9508) con `TrainPanel` (`src/17-menu-creazione-pannelli.jsx:1779`)
- **Come ci si arriva:** NON raggiungibile: nessun `setTab("training")`, assente dalla barra (18:6025) e da `_initTab` (18:122)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 30 | allenamento automatico «by-design» (18:3060); la vista esiste ma non si apre |
| Stabilità (20%) | — | Non posso confermarlo |
| Test (15%) | 0 | nessuno |
| Coerenza (15%) | 30 | vista orfana; PO-125 «poco da allenarsi» corretta solo nei testi (7.999.64) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | codice morto di ~25 righe |
| **Media pesata** | 26 | peso coperto da prove: 65% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **26** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** decisione PO: ripristinare o togliere.

**Voci del backlog collegate:** PO-125 (chiusa). Voce da aprire: Vista Allenamento orfana: ripristinare o eliminare.

### Ramo 4 — Stagione — 71% (Team 71%)

#### 4.1 Classifica — Team 75% [alta] · PO: __%

- **Nel codice:** linguetta `standings` (18:8833-9084)
- **Come ci si arriva:** barra «Stagione» (apre sulla classifica, 18:631)
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 85 | classifiche di tutte le leghe, capocannonieri, risultati dagli altri campionati |
| Stabilità (20%) | 60 | PO-182 BLOCCANTE chiusa in 7.999.102; PO-175 gol fatti ≠ subiti (7.999.94); `classifica-94` precedente |
| Test (15%) | 85 | `classifica-102` (rosso `__CPM_NO_CLASSIFICA102`) in catena carriera; `career-invariants` (standings) in `career-critical`, verdi su 7.999.122 |
| Coerenza (15%) | 80 | una sola fonte per la classifica dopo la 7.999.102 |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | riconciliazione al caricamento (07:85) |
| **Media pesata** | 75 | peso coperto da prove: 85% |
| **Tetto** | — | nessuno |
| **Team** | **75** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** un collaudo Codex di 30 carriere (fase 1) senza anomalie di classifica.

**Voci del backlog collegate:** PO-153.

#### 4.2 Calendario — Team 74% [alta] · PO: __%

- **Nel codice:** linguetta `calendar` (18:8586)
- **Come ci si arriva:** Stagione → «Calendario»
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 85 | griglia con sigla, sede e punteggio (7.999.114) |
| Stabilità (20%) | 60 | PO-193 «SETTIMANA 39 DI 38» (7.999.113), PO-195 (7.999.114), 7.999.106 avversario pescato a caso, PO-089 amichevole durante l'Europeo |
| Test (15%) | 80 | `calendario-offerte-195` (grafica), `avversario-106` (carriera) con rossi, verdi; `calendario-nazionale` nella catena guardiani |
| Coerenza (15%) | 80 | stesse sigle della classifica |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | calendario persistente generato una volta per stagione |
| **Media pesata** | 74 | peso coperto da prove: 85% |
| **Tetto** | — | nessuno |
| **Team** | **74** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO della griglia sul telefono.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Calendario»: collaudo PO della griglia sul telefono.

#### 4.3 Coppe (nazionale, europee, tornei) — Team 66% [alta] · PO: __%

- **Nel codice:** linguetta `coppe` (18:11304)
- **Come ci si arriva:** Stagione → «Coppe»
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | tabellone, gironi, capocannonieri, albo |
| Stabilità (20%) | 45 | 7.999.107 rete di sicurezza per le coppe ferme; PO-186 KCC ferma agli ottavi; 7.686 «trofeo alzato a metà torneo» (18:5900); 7.999.105 |
| Test (15%) | 85 | `coppa-intera`, `coppa-nazioni`, `cup-final-replay`, `recovery-competition` in `career-critical`; `rinvio-coppe-107` in catena carriera |
| Coerenza (15%) | 70 | nomi delle coppe «Korward» (18:5897) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | stato coppe sparso fra `cup`, `euro`, `euroMondiale` |
| **Media pesata** | 66 | peso coperto da prove: 85% |
| **Tetto** | — | nessuno |
| **Team** | **66** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 1 Codex con controllo delle coppe arrivate in fondo.

**Voci del backlog collegate:** PO-153.

#### 4.4 Sorteggi dei gironi europei — Team 69% [media] · PO: __%

- **Nel codice:** `euroGroupModal` (18:7011) e passo «sorteggi» (18:898)
- **Come ci si arriva:** settimana 1 con coppa europea a gironi
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | rivelazione progressiva (`drawRevealN`) |
| Stabilità (20%) | 75 | nessuna voce aperta |
| Test (15%) | 50 | `career-invariants` controlla `euroGroupTable` (dati), non la finestra |
| Coerenza (15%) | 75 | Modal standard |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 69 | peso coperto da prove: 85% |
| **Tetto** | — | nessuno |
| **Team** | **69** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** uno scatto della finestra in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Sorteggi dei gironi europei»: uno scatto della finestra in catena grafica.

#### 4.5 Ritiro pre-campionato — Team 66% [media] · PO: __%

- **Nel codice:** overlay `ritiroEvent` (18:5828), `ritiroPlan` (`src/10-folla-stadi-ritiro.jsx:409`)
- **Come ci si arriva:** assistente d'apertura, dalla seconda stagione da pro (18:887)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | sei tempi con un'unica scelta (7.337) |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 30 | nessun guardiano dedicato; `home-opening-test` lo cita |
| Coerenza (15%) | 75 | stesso schema a tempi della serata di presentazione |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | motori puri (18:5826) |
| **Media pesata** | 66 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **66** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano del racconto e della scelta.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Ritiro pre-campionato»: guardiano del racconto e della scelta.

### Ramo 5 — Partita — 61% (Team 61%)

#### 5.1 Scelta Gioca / Simula — Team 50% [alta] · PO: __%

- **Nel codice:** `showMatchPrompt` (18:6552)
- **Come ci si arriva:** pulsante principale nella settimana con partita (18:525), tasto P
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | Gioca, Simula, «Non ora», squalifica → simulata (18:6552-6650) |
| Stabilità (20%) | 30 | PO-183 BLOCCANTE «riproponeva di rigiocare l'ultima partita già pareggiata»; PO-194 GRAVE (7.999.113); doppio tocco (`double-tap`, P0_4) |
| Test (15%) | 85 | `double-tap` in `career-critical`, `partita-rigiocata-194` (rosso `__CPM_NO_CONF194`) in catena carriera, `typing-shortcuts` in completa |
| Coerenza (15%) | 75 | Modal del kit |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | stato in più ref (`showMatchPromptRef`) |
| **Media pesata** | 65 | peso coperto da prove: 85% |
| **Tetto** | 50 | max 50% (difetto bloccante aperto: PO-183) |
| **Team** | **50** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-183.

**Voci del backlog collegate:** PO-183.

#### 5.2 Conferenza pre-partita e discorso del mister — Team 67% [alta] · PO: __%

- **Nel codice:** `interviewModal` con `matchCtx:"prematch"` (18:1053), `misterDiscorsoModal` (18:6316)
- **Come ci si arriva:** prima di una partita importante, prima del calcio d'inizio
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | ordine conferenza → discorso → partita (7.999.113) |
| Stabilità (20%) | 55 | PO-194 GRAVE e PO-192 corretti in 7.999.113 (nelle ultime 15 release) |
| Test (15%) | 75 | `partita-rigiocata-194` e `conferenza-192` con rossi in catena carriera, verdi su 7.999.122 |
| Coerenza (15%) | 70 | domande filtrate per derby e professionisti |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | sequenza a timeout (18:462-469) |
| **Media pesata** | 67 | peso coperto da prove: 85% |
| **Tetto** | — | nessuno |
| **Team** | **67** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO di una gara di cartello.

**Voci del backlog collegate:** PO-192 (chiusa), PO-194 (chiusa). Voce da aprire: Consolidamento di «Conferenza pre-partita e discorso del mister»: collaudo PO di una gara di cartello.

#### 5.3 Giorno partita e rapporto dell'osservatore — Team 70% [media] · PO: __%

- **Nel codice:** `LiveMatch` fase `matchday` (`src/15-live-match.jsx:9785`), `MatchdayCard` (`src/13-prepartita-formazioni.jsx:472`), `ScoutReportScreen` (13:69)
- **Come ci si arriva:** «Gioca» → `startMatch` (18:981)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | scheda della gara, meteo, posta in palio, osservatore |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 40 | `griglia-mobile` misura il «Prepartita» (censimento) |
| Coerenza (15%) | 75 | stesso kit |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 70 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **70** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano in catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Giorno partita e rapporto dell'osservatore»: guardiano in catena.

#### 5.4 Formazioni — Team 70% [alta] · PO: __%

- **Nel codice:** `FormationView` (`src/13-prepartita-formazioni.jsx:827`), fase `formations` (15:9813)
- **Come ci si arriva:** dal giorno partita (Invio o pulsante, 15:9354)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | due campetti con le formazioni |
| Stabilità (20%) | 65 | PO-204 in corso (7.999.126 sul ramo) |
| Test (15%) | 75 | `formazioni-204` in catena grafica, rosso `__CPM_NO_FORMAZ204`, verde su 7.999.126 |
| Coerenza (15%) | 75 | — |
| Resa (15%) | 60 | PO-204 «campetti schiacciati con spazio vuoto sotto», correzione non ancora collaudata dal PO |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 70 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-204) |
| **Team** | **70** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO della 7.999.126.

**Voci del backlog collegate:** PO-204.

#### 5.5 Ingresso in campo (3D) — Team 58% [alta] · PO: __%

- **Nel codice:** fase `walkout` (`src/15-live-match.jsx:10313`), sera di presentazione (15:10298), attesa (15:10511)
- **Come ci si arriva:** dalle formazioni
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | fila, statistiche pre-partita su vetro, sfilata |
| Stabilità (20%) | 40 | PO-206 APERTA «la fila corre sul posto» (possibile ricaduta di PO-197, 7.999.115; il guardiano 197 è rosso sulla misura nel giro 7.999.126); PO-188 seconda segnalazione dopo la 7.937; PO-080 (7.999.16 e 7.999.59) |
| Test (15%) | 55 | `walkout-fermi-197`, `pre-188` in catena grafica con rossi; `walkout-fermi-197` ROSSO sul giro 7.999.126 sulla misura, non sui campioni (verde somma 10, massimo ammesso 5,3: `walkout-fermi-197.mjs:32`) |
| Coerenza (15%) | 70 | — |
| Resa (15%) | 50 | PO-206 e PO-188 dalle foto del PO |
| Solidità tecnica (10%) | 45 | vive in `src/12` (10.887 righe) e `src/15` (11.410) |
| **Media pesata** | 58 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-206) |
| **Team** | **58** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** misurare PO-206; capire il rosso del 7.999.126.

**Voci del backlog collegate:** PO-206, PO-188 (chiusa), PO-197 (chiusa).

#### 5.6 Partita 2D — Team 60% [alta] · PO: __%

- **Nel codice:** fase `playing`: `Campo2D` (15:517), `PannelloLive2D` (15:1101), `Pagella918` (15:886), cronaca `BG_MATCH` (`src/05-cronaca-stadi-formazioni.jsx:24`)
- **Come ci si arriva:** dopo l'ingresso in campo
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | campo dall'alto, cronaca, statistiche e pagelle dal vivo, scelte |
| Stabilità (20%) | 40 | PO-207 APERTA (non riparte da centrocampo dopo il gol); ricorrenze: PO-189 (7.999.112), PO-122 (7.999.61, 7.999.64), PO-039 (7.999.19, 7.999.22) |
| Test (15%) | 65 | `rimbalzo-189` in catena carriera e grafica (ROSSO sul giro 7.999.126: 4 disegni contro 8 richiesti); `replay` in completa; `match-full-test`, `pannello-fermo-test` fuori catena |
| Coerenza (15%) | 70 | decisione PO: «restano partita 2D + highlight 3D» (DECISIONI.md) |
| Resa (15%) | 55 | PO-021 «migliorabile»; PO-207 |
| Solidità tecnica (10%) | 45 | `src/15-live-match.jsx` 11.410 righe, 39 occorrenze di `Math.random` |
| **Media pesata** | 60 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-207) |
| **Team** | **60** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-207 e PO-021.

**Voci del backlog collegate:** PO-207, PO-021, PO-031.

#### 5.7 Highlight 3D dell'eroe — Team 50% [alta] · PO: __%

- **Nel codice:** fasi `hl_intro`/`hl_choose`/`hl_move`/`hl_result` (15); `ThreeMatchView` (`src/12-three-match-view.jsx:241`, montato 15:10083); `PopScelta919` (15:994); `DPad` (13:28); `SITUATIONS` (`src/04-situazioni-zone-piazzati.jsx:164`)
- **Come ci si arriva:** durante la partita 2D, quando il motore apre una scena
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | 191 scene; copertura gesti 49%, 30/46 varianti (PO-024); manovre vere assenti (PO-030) |
| Stabilità (20%) | 10 | L1: 22 voci aperte (BACKLOG.md); difetti aperti sul nodo: PO-033, 048, 050, 079, 094, 100, 104, 120, 127, 143, 172, 185 |
| Test (15%) | 85 | `validate-situations` (gate a 14 categorie) in completa; circa 18 guardiani della scena con rosso (es. `testa-tempismo`, `tiro-caricato`, `gesti-copertura-96`) nella catena guardiani, ultimo giro sulla 7.999.98 |
| Coerenza (15%) | 55 | PO-022/PO-064: «Le scene si pescano ancora da schede scritte»; DT-05 gesti riconosciuti da regex sui testi |
| Resa (15%) | 40 | PO-033 «ancora davvero poco credibili»; PO-094 «teletrasporto»; PO-079 |
| Solidità tecnica (10%) | 35 | DT-03: 203 rotazioni di ossa scritte a numero in `src/12`; 93 occorrenze di `Math.random` in `src/12` |
| **Media pesata** | 50 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-033, PO-079, PO-094…) |
| **Team** | **50** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere le 22 voci L1 (decisione PO 30/09).

**Voci del backlog collegate:** PO-033, PO-048, PO-050, PO-079, PO-094, PO-100, PO-104, PO-120, PO-127, PO-143, PO-172, PO-185, PO-024, PO-030, PO-064, PO-068, PO-123, PO-133.

#### 5.8 Rigori di fine gara — Team 64% [media] · PO: __%

- **Nel codice:** fase `shootout` (`src/15-live-match.jsx:10267`)
- **Come ci si arriva:** pareggio in una gara a eliminazione
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | serie di rigori |
| Stabilità (20%) | 75 | PO-113 (7.999.58) e PO-130 (7.999.68) chiuse |
| Test (15%) | 40 | `rigori-58` (rosso `__CPM_NO_RIGORI58`) fuori catena |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | dentro `src/15` |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `rigori-58` in una catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Rigori di fine gara»: `rigori-58` in una catena.

#### 5.9 Fine gara: riepilogo, pagelle e tabellino — Team 65% [media] · PO: __%

- **Nel codice:** fase `ended` (`src/15-live-match.jsx:11143`)
- **Come ci si arriva:** fischio finale
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | punteggio, tabellino, voti |
| Stabilità (20%) | 60 | PO-034 statistiche sbagliate (7.999.10); PO-043 voto assurdo (7.999.17, .20, .29); PO-049 |
| Test (15%) | 45 | `tabellino-lati`, `voto-volume` con rosso fuori catena; `griglia-mobile` misura il post-partita (censimento) |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | — |
| **Media pesata** | 65 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **65** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `tabellino-schermo` o `tabellino-lati` in catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Fine gara: riepilogo, pagelle e tabellino»: `tabellino-schermo` o `tabellino-lati` in catena.

#### 5.10 Festa di fine partita — Team 52% [media] · PO: __%

- **Nel codice:** `FestaFine942` (`src/15-live-match.jsx:934`, montata 15:10233)
- **Come ci si arriva:** vittoria meritata, al fischio
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | festa leggera con tabellone e coro |
| Stabilità (20%) | 25 | PO-203 APERTA (eroe affonda nell'erba); PO-048 APERTA (palo in primo piano); ricorrenze: PO-135 (7.999.75, .77, .80), PO-117, PO-121 |
| Test (15%) | 40 | `festa-942`, `festa-3d`, `festa-57`, `festa-79`, `mister-77` con rosso, tutti fuori catena |
| Coerenza (15%) | 70 | — |
| Resa (15%) | 45 | PO-203 e PO-048 dalle foto del PO |
| Solidità tecnica (10%) | 45 | corpi 3D in `src/12` |
| **Media pesata** | 52 | peso coperto da prove: 100% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-203, PO-048) |
| **Team** | **52** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-203/PO-048 e un guardiano della festa in catena.

**Voci del backlog collegate:** PO-203, PO-048.

#### 5.11 Rassegna stampa post-partita — Team 68% [media] · PO: __%

- **Nel codice:** schermata `postmatch` (18:6004) → `PostMatchPress` (`src/13-prepartita-formazioni.jsx:218`); `press` (18:6000) → `PressScreen` (13:321)
- **Come ci si arriva:** chiusura della fine gara
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | giornale con punteggio, statistiche, titoli |
| Stabilità (20%) | 80 | PO-129 (7.999.67) chiusa |
| Test (15%) | 30 | nessun guardiano dedicato |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 68 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **68** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Rassegna stampa post-partita»: guardiano in catena grafica.

#### 5.12 Simula: la partita dell'eroe senza giocarla — Team 65% [alta] · PO: __%

- **Nel codice:** «Simula» → `simulateAndAdvance` (18:3083) → `simulaPartitaMotore` (`src/14-motore-possesso.jsx:1342`)
- **Come ci si arriva:** scelta Gioca/Simula
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | risultato, voto e statistiche dal motore |
| Stabilità (20%) | 40 | goleade: PO-035, PO-090, PO-140, PO-179 chiuse; PO-190 PARZIALE; PO-202 APERTA |
| Test (15%) | 80 | `partita-vera` (completa); `rigori-190`, `debito-190` con rossi in catena carriera; `goleade` nella catena guardiani |
| Coerenza (15%) | 75 | decisione «brain unico» (30/09) |
| Resa (15%) | 50 | PO-190 «da confermare sul telefono»; PO-202 |
| Solidità tecnica (10%) | 60 | funzione pura con seme |
| **Media pesata** | 65 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-202) |
| **Team** | **65** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** misura PO-202 e chiusura PO-190.

**Voci del backlog collegate:** PO-190, PO-202, PO-021.

### Ramo 6 — Club — 63% (Team 63%)

#### 6.1 Scheda Club — Team 65% [media] · PO: __%

- **Nel codice:** linguetta `club` (18:9128): stadio, sponsor, piazzamenti, allenatore, staff, rosa, bacheca, spogliatoio
- **Come ci si arriva:** barra «Club» (18:6025), tasto S
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | otto sezioni a fisarmonica (18:9201-9461) |
| Stabilità (20%) | 75 | PO-110 «12 allenatori che non tornano» (7.999.53) chiusa |
| Test (15%) | 30 | solo il censimento `griglia-mobile` (schermata `club`) |
| Coerenza (15%) | 70 | fisarmoniche del kit |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | blocchi inline in 18 |
| **Media pesata** | 65 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **65** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano dei dati del club (rosa, staff, bacheca).

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Scheda Club»: guardiano dei dati del club (rosa, staff, bacheca).

#### 6.2 Presentazione al nuovo club — Team 59% [bassa] · PO: __%

- **Nel codice:** schermata `clubPresentation` (18:5880) → `ClubPresentationScreen` (`src/16-scene-3d-cerimonie.jsx:3170`)
- **Come ci si arriva:** dopo un trasferimento (`setScreen("clubPresentation")`, 2 punti in 18)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | scena di benvenuto |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 0 | nessun test la cita |
| Coerenza (15%) | 60 | esistono due «presentazioni» diverse (questa e la serata 3D di 11.1) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 59 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **59** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo Codex con scheda dopo un trasferimento.

**Voci del backlog collegate:** nessuna. Voce da aprire: Presentazione al nuovo club: nessuna verifica.

#### 6.3 Numero di maglia — Team 61% [media] · PO: __%

- **Nel codice:** `jerseyPickModal` (18:6123)
- **Come ci si arriva:** assistente d'apertura, passo «maglia» (18:891)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | scelta del numero libero |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 0 | `maglie-numero-test` riguarda i numeri nel 3D, non la scelta |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 61 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **61** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano della scelta.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Numero di maglia»: guardiano della scelta.

### Ramo 7 — Carriera — 57% (Team 57%)

#### 7.1 Profilo — Team 59% [media] · PO: __%

- **Nel codice:** linguetta `profile` (18:9534): statistiche, biografia, record, trofei, allenatori, rivale, stampa, stile, premi, contratto, attributi, timeline…
- **Come ci si arriva:** barra «Carriera» (apre sul Profilo, 18:631), tasto R
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | circa 25 sezioni a fisarmonica (18:9563-10379) |
| Stabilità (20%) | 65 | PO-066 PARZIALE (Profilo da portare alla card neutra); PO-110 diario solo ultima stagione (7.999.53) |
| Test (15%) | 30 | solo il censimento `griglia-mobile` (`carriera-profilo`) |
| Coerenza (15%) | 55 | PO-066; densità: 25 sezioni in una pagina |
| Resa (15%) | 55 | PO-066 «da completare» |
| Solidità tecnica (10%) | 50 | blocchi inline in 18 |
| **Media pesata** | 59 | peso coperto da prove: 100% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-066) |
| **Team** | **59** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-066; guardiano dei numeri di carriera.

**Voci del backlog collegate:** PO-066.

#### 7.2 Diario sfogliabile — Team 62% [bassa] · PO: __%

- **Nel codice:** `DiarioSfoglia` (`src/18-career-app.jsx:85`, montato 18:10113)
- **Come ci si arriva:** Profilo → «Diario di Carriera»
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | diario fino a 80 voci |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 0 | nessuno |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 65 | — |
| **Media pesata** | 62 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **62** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** uno scatto in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Diario sfogliabile»: uno scatto in catena grafica.

#### 7.3 Traguardi (milestone e achievement) — Team 64% [bassa] · PO: __%

- **Nel codice:** `MilestoneCelebrationModal` (`src/17-menu-creazione-pannelli.jsx:1761`, montata 18:6107), `CAREER_MILESTONES` (17:1257)
- **Come ci si arriva:** al raggiungimento di un traguardo
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | finestra di festa + elenco nel Profilo |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 20 | `run-save-compat` controlla solo la compatibilità dei dati |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano dello scatto dei traguardi.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Traguardi (milestone e achievement)»: guardiano dello scatto dei traguardi.

#### 7.4 Stile di gioco (archetipi) — Team 49% [media] · PO: __%

- **Nel codice:** Profilo → «Stile di gioco» (18:9902); `ARCHETYPES` (`src/06-archetipi-agenti-sponsor.jsx`)
- **Come ci si arriva:** Profilo
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 50 | PO-098: «Ridurre gli archetipi e dare a ciascuno un modo di giocare riconoscibile»; `__CPM_NO_STILI` non c'è |
| Stabilità (20%) | 80 | nessun difetto aperto |
| Test (15%) | 0 | nessuno |
| Coerenza (15%) | 50 | otto stili che non cambiano il gioco (PO-098) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 49 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-098) |
| **Team** | **49** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** proposta PO-098 dopo la fase 1 Codex.

**Voci del backlog collegate:** PO-098, PO-153.

### Ramo 8 — Agente e Ufficio — 63% (Team 63%)

#### 8.1 Agente (procuratore, mercato, contratto, cessione, prestito) — Team 63% [media] · PO: __%

- **Nel codice:** linguetta `agente` (18:10409)
- **Come ci si arriva:** barra «Agente» (18:6025), tasto G
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | procuratore, finestra di mercato, contratto, cessione, prestito, compito, parere (18:10594-10922) |
| Stabilità (20%) | 60 | PO-174 BLOCCANTE prestito chiusa (7.999.91); scheda rinominata tre volte (PO-015, PO-053); PO-181 «198 osservazioni di contratto oltre la scadenza» |
| Test (15%) | 40 | `agent-lifecycle-test`, `agent-relation-test`, `prestito-91` (rosso) fuori catena |
| Coerenza (15%) | 70 | divisione Agente/Ufficio scelta dal PO (7.999.14) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | blocco di 500 righe inline |
| **Media pesata** | 63 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **63** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiani dell'agente in una catena.

**Voci del backlog collegate:** PO-153.

#### 8.2 Primo incontro col procuratore — Team 70% [media] · PO: __%

- **Nel codice:** `agentIntro` (18:7715)
- **Come ci si arriva:** riquadro in Home quando arriva il suggerimento (18:7795-7805)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | conoscenza, ambizione, firma |
| Stabilità (20%) | 80 | PO-003 chiusa (7.983, 7.993) |
| Test (15%) | 40 | `agent-relation-test` fuori catena |
| Coerenza (15%) | 75 | uniformato al Modal standard |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 70 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **70** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano in catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Primo incontro col procuratore»: guardiano in catena.

#### 8.3 Offerta di trasferimento e rifiuto — Team 67% [media] · PO: __%

- **Nel codice:** `transferOffer` (18:6668), `refuseEvent` (18:6750); `generateTransferOffer` (`src/06-archetipi-agenti-sponsor.jsx:655`)
- **Come ci si arriva:** a sorpresa durante la stagione (18:1182, 18:4499)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | situazione del club offerente prima di accettare (PO-005) |
| Stabilità (20%) | 70 | PO-108 crescita delle offerte non applicata (7.999.50) |
| Test (15%) | 40 | `decisioni-50` (rossi `__CPM_NO_CRESC49`, `__CPM_NO_SCALATA50`) fuori catena |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | probabilità non seedate (`Math.random()<offerProb`, 18:1182) |
| **Media pesata** | 67 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **67** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `decisioni-50` in catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Offerta di trasferimento e rifiuto»: `decisioni-50` in catena.

#### 8.4 Trattativa del contratto — Team 60% [bassa] · PO: __%

- **Nel codice:** `negoModal` (18:6775)
- **Come ci si arriva:** rinnovo o offerta: «Tratta»
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | proposta, controproposta, rifiuto |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 0 | nessun test cita `negoModal` |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 60 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **60** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano della trattativa; collaudo Codex.

**Voci del backlog collegate:** nessuna. Voce da aprire: Trattativa del contratto: nessuna verifica.

#### 8.5 Ufficio (patrimonio, staff privato, investimenti) — Team 58% [media] · PO: __%

- **Nel codice:** linguetta `ufficio` (18:10409, `_uff13`: sezioni 18:10453-10482)
- **Come ci si arriva:** barra «Ufficio» (18:6025), tasto U
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 60 | PO-157: «dare un effetto reale e visibile a ciò che resta, oppure togliere o accorpare» |
| Stabilità (20%) | 80 | nessun difetto aperto |
| Test (15%) | 30 | solo il censimento `griglia-mobile` (`ufficio`) |
| Coerenza (15%) | 55 | PO-157 |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 58 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-157) |
| **Team** | **58** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** proposta PO-157 dopo la fase 1 Codex.

**Voci del backlog collegate:** PO-157, PO-014 (chiusa).

### Ramo 9 — Nazionale — 56% (Team 56%)

#### 9.1 Scheda Nazionale — Team 57% [media] · PO: __%

- **Nel codice:** linguetta `nazionale` (18:10936)
- **Come ci si arriva:** Carriera → «Nazionale» (18:7161)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 65 | PO-155: «La convocazione è un tiro di dado settimanale… sistema rattoppato» |
| Stabilità (20%) | 50 | PO-177 APERTA (10 stagioni, OVR 96, presenze sempre 0); PO-089, PO-114 chiuse |
| Test (15%) | 60 | `calendario-nazionale`, `career-nat-sim` nella catena guardiani (ultimo giro 7.999.98) |
| Coerenza (15%) | 55 | PO-066: Nazionale da portare alla card neutra |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | — |
| **Media pesata** | 57 | peso coperto da prove: 85% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-177) |
| **Team** | **57** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 1 Codex e proposta PO-155.

**Voci del backlog collegate:** PO-155, PO-177, PO-066.

#### 9.2 Convocazione e partita in Nazionale — Team 62% [media] · PO: __%

- **Nel codice:** schermata `nationalCallup` (18:6010) → `NationalCallupScreen` (`src/17-menu-creazione-pannelli.jsx:658`); `startNationalMatch` (18:5348)
- **Come ci si arriva:** settimane della Nazionale (`setScreen("nationalCallup")`)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | convocazione, CT della nazione |
| Stabilità (20%) | 60 | PO-114 «il mister non cambia in nazionale» (7.999.55); PO-177 aperta |
| Test (15%) | 50 | `career-nat-sim` (catena guardiani); `ct-54` (rosso) fuori catena |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 62 | peso coperto da prove: 85% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-177) |
| **Team** | **62** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `ct-54` in catena; proposta PO-155.

**Voci del backlog collegate:** PO-155, PO-177.

#### 9.3 Tornei per nazionali (Coppa delle Nazioni, Europeo, Mondiale) — Team 50% [alta] · PO: __%

- **Nel codice:** `nationsCupModal` (18:7049), `euroMondiale` (riquadro 18:8314)
- **Come ci si arriva:** settimana 20/24 secondo il ciclo (stab-nat-trigger)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | qualificazioni, gironi, eliminazione |
| Stabilità (20%) | 20 | PO-183 BLOCCANTE (qualificazione Europeo vs Belgio rigiocata); 7.999.103 «sette giornate sparite durante l'Europeo»; PO-181 (7.999.104); 7.999.105; PO-090 |
| Test (15%) | 80 | `coppa-nazioni` in `career-critical`; `euro-attesa-181`, `riquadro-euro-105`, `recupero-103` in catena carriera |
| Coerenza (15%) | 65 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | — |
| **Media pesata** | 57 | peso coperto da prove: 85% |
| **Tetto** | 50 | max 50% (difetto bloccante aperto: PO-183) |
| **Team** | **50** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-183; fase 1 Codex.

**Voci del backlog collegate:** PO-183, PO-155.

### Ramo 10 — Media e relazioni — 62% (Team 62%)

#### 10.1 Intervista post-partita (3D) — Team 64% [media] · PO: __%

- **Nel codice:** `interviewModal` (18:6351), `InterviewStage3D` (`src/16-scene-3d-cerimonie.jsx:323`), `InterviewScena2D` (16:230), `TavoloStampa24` (16:879)
- **Come ci si arriva:** dopo la partita, in coda alle altre finestre (18:3766)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | domanda, rilancio per tono (PO-040), esito |
| Stabilità (20%) | 65 | chiuse PO-008 (×2 release), PO-020, PO-040, PO-129, PO-138 |
| Test (15%) | 40 | `giornaliste-169`, `intervista-2d` fuori catena; `conferenza-192` (catena carriera) copre solo le domande pre-partita |
| Coerenza (15%) | 70 | foglio in basso quando c'è la scena (18:6351) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | scena 3D in `src/16` (3.242 righe) |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano dell'intervista in catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Intervista post-partita (3D)»: guardiano dell'intervista in catena.

#### 10.2 Esito dell'intervista — Team 60% [bassa] · PO: __%

- **Nel codice:** `interviewFeedback` (18:6538)
- **Come ci si arriva:** dopo l'ultima risposta
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | effetti della risposta |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 0 | nessuno |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 60 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **60** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Esito dell'intervista»: guardiano.

#### 10.3 Relazioni: spogliatoio, rivale, stampa — Team 61% [bassa] · PO: __%

- **Nel codice:** Club → «Lo spogliatoio» (18:9461), Profilo → «Rivale» (18:9722), «La Stampa» (18:9814); eventi di spogliatoio (18:4014) e del rivale (18:4565)
- **Come ci si arriva:** schede Club e Profilo; eventi settimanali
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | compagni, rivale, giornalisti con memoria parziale |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 20 | `critica-context-test` fuori catena |
| Coerenza (15%) | 65 | PO-154: nessuna memoria negli impulsi |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 61 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **61** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 1 Codex con metriche sulle relazioni.

**Voci del backlog collegate:** PO-154.

### Ramo 11 — Cerimonie e scene 3D — 59% (Team 59%)

#### 11.1 Serata di presentazione della squadra — Team 68% [alta] · PO: __%

- **Nel codice:** `presEvent` (18:5802), `PresentationStage3D` (`src/16-scene-3d-cerimonie.jsx:1019`), `PresentazioneScena2D` (16:963)
- **Come ci si arriva:** assistente d'apertura, passo «presentazione» (18:894)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | corpi CGTrader e figurina piccola «da televisione» (7.999.124) |
| Stabilità (20%) | 70 | PO-200 chiusa in 7.999.124 |
| Test (15%) | 70 | `presentazione-200` in catena grafica, rosso `__CPM_NO_PRES200`, verde su 7.999.126 |
| Coerenza (15%) | 70 | — |
| Resa (15%) | 60 | PO-137 «tutte le scene 3D fuori dalla partita a qualità professionale» aperta |
| Solidità tecnica (10%) | 45 | PO-171: corpi CH38 ancora in cerimonie |
| **Media pesata** | 68 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-137) |
| **Team** | **68** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO di PO-200; PO-137.

**Voci del backlog collegate:** PO-137, PO-171.

#### 11.2 Premiazione di squadra in campo — Team 46% [alta] · PO: __%

- **Nel codice:** fase `ceremony` (`src/15-live-match.jsx:10241`), decisione `_titleStakes` (`src/18-career-app.jsx:5893`)
- **Come ci si arriva:** fischio finale della gara che assegna il titolo
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 65 | PO-002 PARZIALE: «Il passaggio della coppa non è confermato»; PO-150 SOSPESO (cerimonie uguali per tutte le competizioni) |
| Stabilità (20%) | 20 | PO-191 corretta in quattro release (7.999.116-119); 7.686 «trofeo a metà torneo»; `cerimonie` rosso dal 24/09 (PO-137); sul giro 7.999.126 `premiazione-palco-191` e `coppa-mani-191` ROSSI (11 e 2 campioni) |
| Test (15%) | 55 | quattro guardiani 191 con rosso in catena grafica, due ROSSI sull'ultimo giro; `cerimonie-test` rosso fuori catena |
| Coerenza (15%) | 45 | decisione PO 30/09 «cerimonie diverse per competizione» non ancora applicata (sospesa a L8) |
| Resa (15%) | 45 | PO-191 «eroe che vola», «coppa non in mano»; PO-137 |
| Solidità tecnica (10%) | 40 | camera e corpi in `src/12` |
| **Media pesata** | 46 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-002, PO-137, PO-150) |
| **Team** | **46** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-002/150/137 in L8; ripetere la catena grafica su macchina scarica.

**Voci del backlog collegate:** PO-002, PO-137, PO-150, PO-071.

#### 11.3 Festa del titolo (finestra) — Team 57% [bassa] · PO: __%

- **Nel codice:** `titleCeleb` (18:6867): «COPPA VINTA!», «TRIONFO EUROPEO!»
- **Come ci si arriva:** dopo un titolo (18:346)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | festa a schermo |
| Stabilità (20%) | 75 | nessuna voce aperta |
| Test (15%) | 0 | nessuno |
| Coerenza (15%) | 60 | terzo modo di festeggiare oltre a cerimonia in campo e parata |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 57 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **57** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** decidere col PO se resta accanto alle cerimonie 3D.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Festa del titolo (finestra)»: decidere col PO se resta accanto alle cerimonie 3D.

#### 11.4 Galà dei premi — Team 61% [alta] · PO: __%

- **Nel codice:** schermata `seasonAwards` (18:5775) → `SeasonAwardsScreen` (`src/16-scene-3d-cerimonie.jsx:2193`) → `GalaStage3D` (16:1844), `GalaScena2D` (16:1827)
- **Come ci si arriva:** fine stagione, prima della chiusura (18:5781)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 85 | busta dal 3° al 1° a tocchi, per tutti i premi (7.999.125) |
| Stabilità (20%) | 45 | decisione cambiata tre volte: PO-109 (7.999.51-52), PO-199 (7.999.124 e 7.999.125); PO-001 |
| Test (15%) | 65 | `busta-199` (rossi `__CPM_NO_BUSTA199`, `__CPM_NO_TUTTI201`) in catena grafica, verde su 7.999.126 |
| Coerenza (15%) | 50 | `gala-3d.mjs` verifica ancora «Apri la busta porta DIRETTO al premio vinto», comportamento superato dalla decisione PO 03/10 |
| Resa (15%) | 60 | PO-137 aperta |
| Solidità tecnica (10%) | 45 | `src/16` 3.242 righe |
| **Media pesata** | 61 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-137) |
| **Team** | **61** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** aggiornare o ritirare `gala-3d`; collaudo PO 7.999.125.

**Voci del backlog collegate:** PO-137, PO-199 (chiusa). Voce da aprire: Guardiano `gala-3d` obsoleto (verifica la busta diretta, superata il 03/10).

#### 11.5 Podio della stagione — Team 59% [bassa] · PO: __%

- **Nel codice:** `Podio23` (`src/16-scene-3d-cerimonie.jsx:2221`) dentro il galà
- **Come ci si arriva:** galà dei premi
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | podio con figurine |
| Stabilità (20%) | 75 | PO-006, PO-007 chiuse |
| Test (15%) | 0 | nessun guardiano dedicato |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 59 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **59** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** scatto in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Podio della stagione»: scatto in catena grafica.

#### 11.6 Parata del pullman — Team 64% [alta] · PO: __%

- **Nel codice:** `ParataCompleta198` (`src/16-scene-3d-cerimonie.jsx:1408`), `ParataBus3D` (16:1415), montata in `SeasonEndScreen` (16:2641)
- **Come ci si arriva:** fine stagione da campione (`parata-test`)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | squadra CGTrader sul tetto (7.999.123) |
| Stabilità (20%) | 55 | PO-009 (7.982) e PO-198 (7.999.123): rifatta due volte |
| Test (15%) | 70 | `parata-198` (rosso `__CPM_NO_PARATA198`) in catena grafica, verde su 7.999.126 |
| Coerenza (15%) | 70 | — |
| Resa (15%) | 55 | PO-137 aperta |
| Solidità tecnica (10%) | 45 | — |
| **Media pesata** | 64 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-137) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO della 7.999.123.

**Voci del backlog collegate:** PO-137.

#### 11.7 Stadi 3D — Team 61% [media] · PO: __%

- **Nel codice:** `buildStadium` (`src/11-ui-kit-highlight.jsx:693`), `makeCrowdTex` (11:372), folla (`src/10`)
- **Come ci si arriva:** in ogni scena 3D
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | PO-071: fase 3 (nuove tipologie) senza release |
| Stabilità (20%) | 75 | nessun difetto aperto; PO-127 «tribune da dietro» è della regia |
| Test (15%) | 40 | `stadi-70`, `pali-69` con rossi e `galleria-stadi` fuori catena |
| Coerenza (15%) | 70 | — |
| Resa (15%) | 50 | PO-071 «la grafica degli stadi deve essere migliorata il più possibile» |
| Solidità tecnica (10%) | 45 | — |
| **Media pesata** | 61 | peso coperto da prove: 100% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-071) |
| **Team** | **61** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 3 di PO-071; `stadi-70` in catena.

**Voci del backlog collegate:** PO-071.

### Ramo 12 — Fine stagione e fine carriera — 64% (Team 64%)

#### 12.1 Fine stagione — Team 65% [media] · PO: __%

- **Nel codice:** schermata `seasonEnd` (18:5874) → `SeasonEndScreen` (`src/16-scene-3d-cerimonie.jsx:2634`); `doStartNewSeason` (18:4801)
- **Come ci si arriva:** dopo il galà (18:5781)
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | bilancio, parata se campione, nuova stagione o ritiro |
| Stabilità (20%) | 55 | PO-174 BLOCCANTE fine prestito (7.999.91); PO-193 «settimana 39 di 38» (7.999.113); PO-186 |
| Test (15%) | 55 | `career-invariants` (cambio stagione) in `career-critical`; `career-sim-test`, `prestito-91`, `retire-announce-test` fuori catena |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | — |
| **Media pesata** | 65 | peso coperto da prove: 85% |
| **Tetto** | — | nessuno |
| **Team** | **65** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `career-sim-test` (N stagioni) in catena.

**Voci del backlog collegate:** PO-153.

#### 12.2 Annuncio del ritiro e stagione d'addio — Team 68% [media] · PO: __%

- **Nel codice:** passo «addio» dell'assistente (18:897), conferma (18:10180), `doRetire` (18:4790)
- **Come ci si arriva:** dai 34 anni a inizio stagione; dal Profilo
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | annuncio, stagione d'addio, ritiro |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 40 | `retire-announce-test` fuori catena |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 68 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **68** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `retire-announce-test` in catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Annuncio del ritiro e stagione d'addio»: `retire-announce-test` in catena.

#### 12.3 Fine carriera — Team 64% [bassa] · PO: __%

- **Nel codice:** schermata `careerEnd` (18:5793) → `CareerEndScreen` (`src/17-menu-creazione-pannelli.jsx:790`), `calcLegacyScore` (17:727)
- **Come ci si arriva:** ritiro; un salvataggio ritirato apre sempre questa pagina (18:5795)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | pagina celebrativa con punteggio di eredità |
| Stabilità (20%) | 75 | nessuna voce aperta |
| Test (15%) | 20 | nessun guardiano del flusso (`slot-card-layout-test` cita solo lo stato) |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | ricostruisce i dati dal salvataggio (7.258) |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo Codex con scheda di una carriera fino al ritiro.

**Voci del backlog collegate:** nessuna. Voce da aprire: Fine carriera: nessun guardiano del flusso fino al ritiro.

#### 12.4 Nuova partita+ (eredità) — Team 55% [bassa] · PO: __%

- **Nel codice:** `onNewGamePlusCB` (`src/19-app-root.jsx:955`) → `CreateScreen` con `legacyBonus` (19:951)
- **Come ci si arriva:** dalla pagina di fine carriera
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 65 | bonus passato alla creazione |
| Stabilità (20%) | 80 | nessuna voce in BACKLOG.md |
| Test (15%) | 0 | nessuno |
| Coerenza (15%) | — | Non posso confermarlo |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 55 | peso coperto da prove: 70% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **55** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo Codex.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Nuova partita+ (eredità)»: collaudo Codex.

### Ramo 13 — Sistemi trasversali — 59% (Team 59%)

#### 13.1 Motore della partita (brain) — Team 58% [alta] · PO: __%

- **Nel codice:** `src/14-motore-possesso.jsx`: `simulaPartitaMotore` (14:1342), `probEroe` (14:1316)
- **Come ci si arriva:** ogni partita, simulata o vissuta
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 65 | PO-022/PO-064 parziali (la scena non nasce ancora dal motore); PO-030 manovre assenti; PO-031 metriche |
| Stabilità (20%) | 30 | PO-021 e PO-190 PARZIALI; PO-202 APERTA; goleade ricorrenti (PO-035, PO-090, PO-140, PO-179) |
| Test (15%) | 85 | `partita-vera` e `test:logic` (`motore-possesso.test.mjs`) in completa; `rigori-190`, `debito-190` in carriera; `goleade`, `motore-unico`, `brain-82` nei guardiani |
| Coerenza (15%) | 60 | «brain unico» fatto per `probEroe` (7.999.82), non per il render (PO-064) |
| Resa (15%) | 50 | PO-202 «troppo sbilanciate le partite, non sono tirate» |
| Solidità tecnica (10%) | 65 | 1.356 righe, 1 riga con `Math.random`; seme deterministico (`sim-motore-test`: «stesso seme ⇒ stessa partita») |
| **Media pesata** | 58 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-202) |
| **Team** | **58** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-021/022/064/190/202.

**Voci del backlog collegate:** PO-021, PO-022, PO-030, PO-031, PO-064, PO-190, PO-202.

#### 13.2 Simulazione delle altre partite e classifiche — Team 71% [alta] · PO: __%

- **Nel codice:** `simulateMatch` (`src/10-folla-stadi-ritiro.jsx:866`), `updateStandings` (`src/09-audio-scout-anagrafiche.jsx:1391`)
- **Come ci si arriva:** ogni avanzamento di settimana
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | risultati di tutte le leghe |
| Stabilità (20%) | 55 | PO-175 (7.999.94), PO-182 BLOCCANTE (7.999.102) chiuse |
| Test (15%) | 85 | `career-invariants`, `classifica-102` in catena; `sim-motore-test` (rosso `__CPM_NO_SIMV2`) |
| Coerenza (15%) | 75 | `simulateMatch(...,{motore:true})` = motore unico (`sim-motore-test`) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 71 | peso coperto da prove: 85% |
| **Tetto** | — | nessuno |
| **Team** | **71** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 1 Codex senza anomalie.

**Voci del backlog collegate:** PO-153.

#### 13.3 Salvataggi e migrazioni — Team 50% [alta] · PO: __%

- **Nel codice:** `storage` (`src/08-panchina-derby-meteo-cori.jsx:576`), `SAVE_VERSION=9` (`src/07-versione-save-interviste.jsx:457`), `migratePlayer` (`src/17-menu-creazione-pannelli.jsx:1885`)
- **Come ci si arriva:** salvataggio automatico a ogni cambio (3 slot `cpm-v3*`)
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | PO-167: niente `navigator.storage.persist()`, nessun backup né copia dello slot |
| Stabilità (20%) | 25 | PO-183 BLOCCANTE IN CORSO; PO-176 PARZIALE; rischi R-01…R-04 |
| Test (15%) | 85 | `save-compat`, `save-monotonic` (P0_2), `pending-mr-durable`, `playedmd-registry` in catena |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 40 | R-02: `storage.save` cattura l'errore e restituisce `false` senza avviso (08:597) |
| **Media pesata** | 59 | peso coperto da prove: 85% |
| **Tetto** | 50 | max 50% (difetto bloccante aperto: PO-183) |
| **Team** | **50** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** L3 (PO-167, PO-168) e chiusura PO-183/PO-176.

**Voci del backlog collegate:** PO-183, PO-176, PO-167.

#### 13.4 Calendario e competizioni (generazione) — Team 66% [alta] · PO: __%

- **Nel codice:** `generateSeasonCalendar` (`src/09-audio-scout-anagrafiche.jsx:999`), innesco dei tornei (`stab-nat-trigger-test.mjs`)
- **Come ci si arriva:** inizio stagione
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | campionato, coppe, finestre della Nazionale |
| Stabilità (20%) | 40 | PO-089, PO-181 (7.999.104), 7.999.103, 7.999.106, 7.999.107: cinque correttive in 30 release |
| Test (15%) | 85 | `career-invariants`, `recupero-103`, `avversario-106`, `rinvio-coppe-107` in catena carriera |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | — |
| **Media pesata** | 66 | peso coperto da prove: 85% |
| **Tetto** | — | nessuno |
| **Team** | **66** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 1 Codex con 30 carriere.

**Voci del backlog collegate:** PO-153, PO-183.

#### 13.5 Mercato e contratti — Team 63% [media] · PO: __%

- **Nel codice:** `generateTransferOffer` (`src/06-archetipi-agenti-sponsor.jsx:655`), `generateProContracts` (06:724)
- **Come ci si arriva:** offerte in stagione e a fine Under 18
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | offerte, rinnovi, prestiti |
| Stabilità (20%) | 65 | PO-181 «198 osservazioni di contratto oltre la scadenza»; PO-108 (7.999.50) |
| Test (15%) | 40 | `decisioni-50` fuori catena |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 63 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **63** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano del contratto scaduto in catena.

**Voci del backlog collegate:** PO-153, PO-157.

#### 13.6 Crescita del giocatore e difficoltà — Team 56% [media] · PO: __%

- **Nel codice:** allenamento automatico (18:3060), crescita a fine gara (18:3726), `adaptiveDifficulty` (`src/06-archetipi-agenti-sponsor.jsx:60`)
- **Come ci si arriva:** ogni settimana e partita
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 65 | PO-156 difficoltà unica tarata sulla carriera: in attesa |
| Stabilità (20%) | 65 | PO-177 «OVR fino a 96» |
| Test (15%) | 30 | `career-sim-test` fuori catena |
| Coerenza (15%) | 55 | `adaptiveDifficulty` accanto alla decisione «difficoltà unica»; vista Allenamento orfana (3.8) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 56 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **56** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** proposta PO-156 dopo la fase 1.

**Voci del backlog collegate:** PO-156, PO-177.

#### 13.7 Generazione club, rose e nomi — Team 73% [media] · PO: __%

- **Nel codice:** `CLUBS` (`src/02-club-leghe-albo.jsx:24`), `generateTeamRoster` (`src/09-audio-scout-anagrafiche.jsx:963`), `NAME_BY_NAT` (09:900)
- **Come ci si arriva:** inizio partita e stagione
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | nove leghe, rose deterministiche |
| Stabilità (20%) | 80 | PO-184 nomi sopra i corpi (7.999.102) chiusa |
| Test (15%) | 60 | `nomi-51` (rossi) nella catena guardiani; `audit-copyright` non in CI |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 73 | peso coperto da prove: 85% |
| **Tetto** | — | nessuno |
| **Team** | **73** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `audit-copyright` in CI prima dello store.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Generazione club, rose e nomi»: `audit-copyright` in CI prima dello store.

#### 13.8 Audio — Team 56% [bassa] · PO: __%

- **Nel codice:** `AudioMgr` (`src/09-audio-scout-anagrafiche.jsx:38`), `AudioSettings` (`src/19-app-root.jsx:633`)
- **Come ci si arriva:** sempre; regolazioni nelle Impostazioni
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | musica, effetti, pubblico, arbitro |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 0 | `grep AudioMgr tests/visual` = 0 file |
| Coerenza (15%) | — | Non posso confermarlo |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 56 | peso coperto da prove: 70% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **56** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo sul telefono; guardiano dei volumi.

**Voci del backlog collegate:** nessuna. Voce da aprire: Audio: nessun guardiano né collaudo registrato.

#### 13.9 Prestazioni — Team 42% [bassa] · PO: __%

- **Nel codice:** misura in Impostazioni (18:6053, limite 300 ms), `lib/perf-monitor.mjs` (gate)
- **Come ci si arriva:** —
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 50 | PO-023: FPS e caricamento sul telefono non misurati |
| Stabilità (20%) | — | Non posso confermarlo |
| Test (15%) | 30 | R-07: «l'headless non misura gli FPS veri» |
| Coerenza (15%) | — | Non posso confermarlo |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 40 | file unico 6,5 MB, Babel nel browser (ARCHITETTURA.md) |
| **Media pesata** | 42 | peso coperto da prove: 50% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-023) |
| **Team** | **42** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** PO-023: misura sul telefono a fine lotto.

**Voci del backlog collegate:** PO-023.

#### 13.10 Gestione degli errori — Team 35% [media] · PO: __%

- **Nel codice:** `RootErrorBoundary` (`src/19-app-root.jsx:1001`), `MatchErrorBoundary` (`src/13-prepartita-formazioni.jsx:1525`)
- **Come ci si arriva:** —
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 40 | PO-168: nessun `window.onerror` né `unhandledrejection` (0 occorrenze, verificato) |
| Stabilità (20%) | — | Non posso confermarlo |
| Test (15%) | 0 | nessuno |
| Coerenza (15%) | 60 | R-06 |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 40 | errori sul telefono invisibili (R-06) |
| **Media pesata** | 35 | peso coperto da prove: 65% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-168) |
| **Team** | **35** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** L3 Parte C (PO-168).

**Voci del backlog collegate:** PO-168.

#### 13.11 Build web e store — Team 62% [media] · PO: __%

- **Nel codice:** `tools/build-dist.mjs`, `tools/validate-dist.mjs`, `capacitor.config.json`, `tools/audit-copyright.mjs`
- **Come ci si arriva:** —
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | build precompilata senza CDN; il sito serve la build (7.999.11) |
| Stabilità (20%) | 75 | nessuna voce aperta |
| Test (15%) | 30 | `validate-dist` non in CI (ARCHITETTURA.md); `dist-web-partita-test` fuori catena |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | R-08 licenze degli asset non verificate |
| **Media pesata** | 62 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`) |
| **Team** | **62** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `validate-dist` e `audit-copyright` in CI; inventario licenze.

**Voci del backlog collegate:** nessuna. Voce da aprire: `validate-dist` e `audit-copyright` nella CI.

#### 13.12 Corpi, clip e gesti 3D — Team 54% [alta] · PO: __%

- **Nel codice:** corpi CGTrader e clip (src/12); copertura gesti
- **Come ci si arriva:** in highlight e cerimonie
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 55 | PO-024: copertura gesti 49%, 30/46 varianti; PO-070, PO-075 parziali |
| Stabilità (20%) | 55 | PO-201 in corso (7.999.126); PO-171 parziale |
| Test (15%) | 70 | `gesti-copertura-96` (guardiani), `guanti-201` (grafica, rosso `__CPM_NO_GUANTI_PO201`, verde su 7.999.126) |
| Coerenza (15%) | 50 | PO-171 «Via CH38 ovunque» parziale; DT-04 due modi di muovere le braccia |
| Resa (15%) | 50 | PO-061 kit «migliorabile» |
| Solidità tecnica (10%) | 40 | DT-03 203 rotazioni a numero |
| **Media pesata** | 54 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-061, PO-201) |
| **Team** | **54** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-068/070/075/171.

**Voci del backlog collegate:** PO-024, PO-061, PO-068, PO-070, PO-075, PO-171, PO-201.

#### 13.13 Kit grafico e tema — Team 72% [alta] · PO: __%

- **Nel codice:** `Card`, `Btn`, `Modal`, `Tabs`, `Fisarmonica` (`src/11-ui-kit-highlight.jsx:42-348`), token `TH`/`FS`/`RAD` (src/01)
- **Come ci si arriva:** ogni schermata
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | kit unico, tema chiaro/scuro |
| Stabilità (20%) | 70 | PO-066 parziale; PO-188 seconda segnalazione |
| Test (15%) | 75 | `design-system` in completa e grafica (verde 7.999.126); `griglia-mobile` (censimento) |
| Coerenza (15%) | 70 | PO-066 |
| Resa (15%) | 65 | PO-188, PO-066 |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 72 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-066) |
| **Team** | **72** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-066.

**Voci del backlog collegate:** PO-066, PO-188 (chiusa).

## Elenchi

### 1. I 10 nodi più deboli

| # | Nodo | Team | Cosa manca |
|---:|---|---:|---|
| 1 | 3.8 Allenamento (vista orfana) | 26% | decisione PO: ripristinare o togliere |
| 2 | 13.10 Gestione degli errori | 35% | L3 Parte C (PO-168) |
| 3 | 13.9 Prestazioni | 42% | PO-023: misura sul telefono a fine lotto |
| 4 | 11.2 Premiazione di squadra in campo | 46% | chiudere PO-002/150/137 in L8; ripetere la catena grafica su macchina scarica |
| 5 | 7.4 Stile di gioco (archetipi) | 49% | proposta PO-098 dopo la fase 1 Codex |
| 6 | 3.2 Pulsante principale e avanzamento della settimana | 50% | chiudere PO-183 con collaudo; una sola funzione di avanzamento |
| 7 | 5.1 Scelta Gioca / Simula | 50% | chiudere PO-183 |
| 8 | 5.7 Highlight 3D dell'eroe | 50% | chiudere le 22 voci L1 (decisione PO 30/09) |
| 9 | 13.3 Salvataggi e migrazioni | 50% | L3 (PO-167, PO-168) e chiusura PO-183/PO-176 |
| 10 | 9.3 Tornei per nazionali (Coppa delle Nazioni, Europeo, Mondiale) | 50% | chiudere PO-183; fase 1 Codex |

### 2. I 10 nodi più solidi

| # | Nodo | Team | Punti per criterio (F·S·T·C·R·So) e prova del Test |
|---:|---|---:|---|
| 1 | 2.4 Offerte di fine provini | 81% | F 85 · S 85 · T 75 · C 80 · R — · So 70. Test: `calendario-offerte-195` in catena grafica, rosso `__CPM_NO_LEGA196`, verde su 7.999.126 (STABILITA.json) |
| 2 | 4.1 Classifica | 75% | F 85 · S 60 · T 85 · C 80 · R — · So 60. Test: `classifica-102` (rosso `__CPM_NO_CLASSIFICA102`) in catena carriera; `career-invariants` (standings) in `career-critical`, verdi su 7.999.122 |
| 3 | 4.2 Calendario | 74% | F 85 · S 60 · T 80 · C 80 · R — · So 60. Test: `calendario-offerte-195` (grafica), `avversario-106` (carriera) con rossi, verdi; `calendario-nazionale` nella catena guardiani |
| 4 | 13.7 Generazione club, rose e nomi | 73% | F 80 · S 80 · T 60 · C 75 · R — · So 60. Test: `nomi-51` (rossi) nella catena guardiani; `audit-copyright` non in CI |
| 5 | 13.13 Kit grafico e tema | 72% | F 80 · S 70 · T 75 · C 70 · R 65 · So 60 — tetto 80%. Test: `design-system` in completa e grafica (verde 7.999.126); `griglia-mobile` (censimento) |
| 6 | 13.2 Simulazione delle altre partite e classifiche | 71% | F 80 · S 55 · T 85 · C 75 · R — · So 55. Test: `career-invariants`, `classifica-102` in catena; `sim-motore-test` (rosso `__CPM_NO_SIMV2`) |
| 7 | 2.6 Passaggio a professionista | 71% | F 80 · S 65 · T 70 · C 75 · R — · So 60 — tetto 80%. Test: `pro-rivale-176` in catena carriera, rosso `__CPM_NO_PRO176`, verde su 7.999.122 |
| 8 | 1.2 Menu principale e slot di salvataggio | 70% | F 85 · S 85 · T 30 · C 75 · R — · So 70 — tetto 70%. Test: `griglia-mobile` (catena grafica) misura la schermata `home` ma è un censimento senza soglia (griglia-mobile.mjs:164); `slot-card-layout-test.mjs` fuori catena |
| 9 | 5.3 Giorno partita e rapporto dell'osservatore | 70% | F 80 · S 80 · T 40 · C 75 · R — · So 60 — tetto 70%. Test: `griglia-mobile` misura il «Prepartita» (censimento) |
| 10 | 5.4 Formazioni | 70% | F 80 · S 65 · T 75 · C 75 · R 60 · So 60 — tetto 80%. Test: `formazioni-204` in catena grafica, rosso `__CPM_NO_FORMAZ204`, verde su 7.999.126 |

### 3. Nodi a bassa affidabilità e come misurarli

| Nodo | Team | Cosa servirebbe per misurarlo |
|---|---:|---|
| 1.5 Revisione azioni e prova situazioni (solo sviluppo) | 57% | fuori dal conto (peso 0): resta nella mappa per completezza |
| 2.2 Filmato introduttivo | 65% | uno scatto di controllo in catena grafica |
| 3.4 Momenti di carriera | 61% | guardiano della coda delle finestre in catena; misura Codex delle frequenze |
| 3.7 Tutorial | 54% | collaudo Codex con scheda del primo avvio; uno scatto in catena grafica |
| 6.2 Presentazione al nuovo club | 59% | collaudo Codex con scheda dopo un trasferimento |
| 7.2 Diario sfogliabile | 62% | uno scatto in catena grafica |
| 7.3 Traguardi (milestone e achievement) | 64% | guardiano dello scatto dei traguardi |
| 8.4 Trattativa del contratto | 60% | guardiano della trattativa; collaudo Codex |
| 10.2 Esito dell'intervista | 60% | guardiano |
| 10.3 Relazioni: spogliatoio, rivale, stampa | 61% | fase 1 Codex con metriche sulle relazioni |
| 11.3 Festa del titolo (finestra) | 57% | decidere col PO se resta accanto alle cerimonie 3D |
| 11.5 Podio della stagione | 59% | scatto in catena grafica |
| 12.3 Fine carriera | 64% | collaudo Codex con scheda di una carriera fino al ritiro |
| 12.4 Nuova partita+ (eredità) | 55% | collaudo Codex |
| 13.8 Audio | 56% | collaudo sul telefono; guardiano dei volumi |
| 13.9 Prestazioni | 42% | PO-023: misura sul telefono a fine lotto |

### 4. Scarti PO/Team

Nessun valore PO ancora.

## Collegamenti

Ogni nodo sotto l'80% e le voci di `BACKLOG.md` che lo riguardano. «(chiusa)» = voce dello storico, citata perché è la storia del nodo; dove nessuna voce aperta copre il nodo, il rimando va a «Voci da aprire».

| Nodo | Team | Voci PO collegate |
|---|---:|---|
| 1.1 Caricamento e ripresa automatica | 66% | PO-167, PO-176 · voce da aprire n. 1 |
| 1.2 Menu principale e slot di salvataggio | 70% | voce da aprire n. 2 |
| 1.3 Impostazioni | 67% | PO-072 · voce da aprire n. 3 |
| 1.4 Importa ed esporta salvataggio | 59% | PO-167 · voce da aprire n. 4 |
| 2.1 Creazione del giocatore | 69% | voce da aprire n. 5 |
| 2.2 Filmato introduttivo | 65% | voce da aprire n. 6 |
| 2.3 Provini (tre partite) | 65% | voce da aprire n. 7 |
| 2.5 Stagioni Primavera (Under 18) | 64% | PO-192 (chiusa), PO-194 (chiusa), PO-153 |
| 2.6 Passaggio a professionista | 71% | PO-176 |
| 3.1 Home (cruscotto) | 64% | PO-066 |
| 3.2 Pulsante principale e avanzamento della settimana | 50% | PO-183, PO-176, PO-153 |
| 3.3 Vivi la settimana ed eventi settimanali | 64% | PO-154, PO-153 |
| 3.4 Momenti di carriera | 61% | PO-154 |
| 3.5 Il mister: verifica mensile e dialoghi | 64% | voce da aprire n. 8 |
| 3.6 Interazioni d'apertura stagione | 69% | voce da aprire n. 9 |
| 3.7 Tutorial | 54% | voce da aprire n. 10 |
| 3.8 Allenamento (vista orfana) | 26% | PO-125 (chiusa) · voce da aprire n. 11 |
| 4.1 Classifica | 75% | PO-153 |
| 4.2 Calendario | 74% | voce da aprire n. 12 |
| 4.3 Coppe (nazionale, europee, tornei) | 66% | PO-153 |
| 4.4 Sorteggi dei gironi europei | 69% | voce da aprire n. 13 |
| 4.5 Ritiro pre-campionato | 66% | voce da aprire n. 14 |
| 5.1 Scelta Gioca / Simula | 50% | PO-183 |
| 5.2 Conferenza pre-partita e discorso del mister | 67% | PO-192 (chiusa), PO-194 (chiusa) · voce da aprire n. 15 |
| 5.3 Giorno partita e rapporto dell'osservatore | 70% | voce da aprire n. 16 |
| 5.4 Formazioni | 70% | PO-204 |
| 5.5 Ingresso in campo (3D) | 58% | PO-206, PO-188 (chiusa), PO-197 (chiusa) |
| 5.6 Partita 2D | 60% | PO-207, PO-021, PO-031 |
| 5.7 Highlight 3D dell'eroe | 50% | PO-033, PO-048, PO-050, PO-079, PO-094, PO-100, PO-104, PO-120, PO-127, PO-143, PO-172, PO-185, PO-024, PO-030, PO-064, PO-068, PO-123, PO-133 |
| 5.8 Rigori di fine gara | 64% | voce da aprire n. 17 |
| 5.9 Fine gara: riepilogo, pagelle e tabellino | 65% | voce da aprire n. 18 |
| 5.10 Festa di fine partita | 52% | PO-203, PO-048 |
| 5.11 Rassegna stampa post-partita | 68% | voce da aprire n. 19 |
| 5.12 Simula: la partita dell'eroe senza giocarla | 65% | PO-190, PO-202, PO-021 |
| 6.1 Scheda Club | 65% | voce da aprire n. 20 |
| 6.2 Presentazione al nuovo club | 59% | voce da aprire n. 21 |
| 6.3 Numero di maglia | 61% | voce da aprire n. 22 |
| 7.1 Profilo | 59% | PO-066 |
| 7.2 Diario sfogliabile | 62% | voce da aprire n. 23 |
| 7.3 Traguardi (milestone e achievement) | 64% | voce da aprire n. 24 |
| 7.4 Stile di gioco (archetipi) | 49% | PO-098, PO-153 |
| 8.1 Agente (procuratore, mercato, contratto, cessione, prestito) | 63% | PO-153 |
| 8.2 Primo incontro col procuratore | 70% | voce da aprire n. 25 |
| 8.3 Offerta di trasferimento e rifiuto | 67% | voce da aprire n. 26 |
| 8.4 Trattativa del contratto | 60% | voce da aprire n. 27 |
| 8.5 Ufficio (patrimonio, staff privato, investimenti) | 58% | PO-157, PO-014 (chiusa) |
| 9.1 Scheda Nazionale | 57% | PO-155, PO-177, PO-066 |
| 9.2 Convocazione e partita in Nazionale | 62% | PO-155, PO-177 |
| 9.3 Tornei per nazionali (Coppa delle Nazioni, Europeo, Mondiale) | 50% | PO-183, PO-155 |
| 10.1 Intervista post-partita (3D) | 64% | voce da aprire n. 28 |
| 10.2 Esito dell'intervista | 60% | voce da aprire n. 29 |
| 10.3 Relazioni: spogliatoio, rivale, stampa | 61% | PO-154 |
| 11.1 Serata di presentazione della squadra | 68% | PO-137, PO-171 |
| 11.2 Premiazione di squadra in campo | 46% | PO-002, PO-137, PO-150, PO-071 |
| 11.3 Festa del titolo (finestra) | 57% | voce da aprire n. 30 |
| 11.4 Galà dei premi | 61% | PO-137, PO-199 (chiusa) · voce da aprire n. 31 |
| 11.5 Podio della stagione | 59% | voce da aprire n. 32 |
| 11.6 Parata del pullman | 64% | PO-137 |
| 11.7 Stadi 3D | 61% | PO-071 |
| 12.1 Fine stagione | 65% | PO-153 |
| 12.2 Annuncio del ritiro e stagione d'addio | 68% | voce da aprire n. 33 |
| 12.3 Fine carriera | 64% | voce da aprire n. 34 |
| 12.4 Nuova partita+ (eredità) | 55% | voce da aprire n. 35 |
| 13.1 Motore della partita (brain) | 58% | PO-021, PO-022, PO-030, PO-031, PO-064, PO-190, PO-202 |
| 13.2 Simulazione delle altre partite e classifiche | 71% | PO-153 |
| 13.3 Salvataggi e migrazioni | 50% | PO-183, PO-176, PO-167 |
| 13.4 Calendario e competizioni (generazione) | 66% | PO-153, PO-183 |
| 13.5 Mercato e contratti | 63% | PO-153, PO-157 |
| 13.6 Crescita del giocatore e difficoltà | 56% | PO-156, PO-177 |
| 13.7 Generazione club, rose e nomi | 73% | voce da aprire n. 36 |
| 13.8 Audio | 56% | voce da aprire n. 37 |
| 13.9 Prestazioni | 42% | PO-023 |
| 13.10 Gestione degli errori | 35% | PO-168 |
| 13.11 Build web e store | 62% | voce da aprire n. 38 |
| 13.12 Corpi, clip e gesti 3D | 54% | PO-024, PO-061, PO-068, PO-070, PO-075, PO-171, PO-201 |
| 13.13 Kit grafico e tema | 72% | PO-066, PO-188 (chiusa) |

### Voci da aprire (in attesa del PO)

Non scritte in `BACKLOG.md`: le apre il PO o le autorizza.

1. **Guardiano dell'auto-ripresa reale (oggi spenta sotto `cpmtest=1`)** — nodo 1.1.
2. **Guardiano del menu principale con slot pieni e vuoti** — nodo 1.2.
3. **Strumenti di collaudo visibili nelle Impostazioni del giocatore (DT-08)** — nodo 1.3.
4. **Guardiano di import/export del salvataggio** — nodo 1.4.
5. **Guardiano nuova carriera: creazione → provini → offerte → prima partita** — nodo 2.1.
6. **Consolidamento di «Filmato introduttivo»: uno scatto di controllo in catena grafica** — nodo 2.2.
7. **Guardiano dei provini con ripresa a metà** — nodo 2.3.
8. **Consolidamento di «Il mister: verifica mensile e dialoghi»: guardiano in catena e collaudo dei testi** — nodo 3.5.
9. **Consolidamento di «Interazioni d'apertura stagione»: rimettere `home-opening-test` in una catena** — nodo 3.6.
10. **Tutorial: nessuna verifica (né guardiano né collaudo)** — nodo 3.7.
11. **Vista Allenamento orfana: ripristinare o eliminare** — nodo 3.8.
12. **Consolidamento di «Calendario»: collaudo PO della griglia sul telefono** — nodo 4.2.
13. **Consolidamento di «Sorteggi dei gironi europei»: uno scatto della finestra in catena grafica** — nodo 4.4.
14. **Consolidamento di «Ritiro pre-campionato»: guardiano del racconto e della scelta** — nodo 4.5.
15. **Consolidamento di «Conferenza pre-partita e discorso del mister»: collaudo PO di una gara di cartello** — nodo 5.2.
16. **Consolidamento di «Giorno partita e rapporto dell'osservatore»: guardiano in catena** — nodo 5.3.
17. **Consolidamento di «Rigori di fine gara»: `rigori-58` in una catena** — nodo 5.8.
18. **Consolidamento di «Fine gara: riepilogo, pagelle e tabellino»: `tabellino-schermo` o `tabellino-lati` in catena** — nodo 5.9.
19. **Consolidamento di «Rassegna stampa post-partita»: guardiano in catena grafica** — nodo 5.11.
20. **Consolidamento di «Scheda Club»: guardiano dei dati del club (rosa, staff, bacheca)** — nodo 6.1.
21. **Presentazione al nuovo club: nessuna verifica** — nodo 6.2.
22. **Consolidamento di «Numero di maglia»: guardiano della scelta** — nodo 6.3.
23. **Consolidamento di «Diario sfogliabile»: uno scatto in catena grafica** — nodo 7.2.
24. **Consolidamento di «Traguardi (milestone e achievement)»: guardiano dello scatto dei traguardi** — nodo 7.3.
25. **Consolidamento di «Primo incontro col procuratore»: guardiano in catena** — nodo 8.2.
26. **Consolidamento di «Offerta di trasferimento e rifiuto»: `decisioni-50` in catena** — nodo 8.3.
27. **Trattativa del contratto: nessuna verifica** — nodo 8.4.
28. **Consolidamento di «Intervista post-partita (3D)»: guardiano dell'intervista in catena** — nodo 10.1.
29. **Consolidamento di «Esito dell'intervista»: guardiano** — nodo 10.2.
30. **Consolidamento di «Festa del titolo (finestra)»: decidere col PO se resta accanto alle cerimonie 3D** — nodo 11.3.
31. **Guardiano `gala-3d` obsoleto (verifica la busta diretta, superata il 03/10)** — nodo 11.4.
32. **Consolidamento di «Podio della stagione»: scatto in catena grafica** — nodo 11.5.
33. **Consolidamento di «Annuncio del ritiro e stagione d'addio»: `retire-announce-test` in catena** — nodo 12.2.
34. **Fine carriera: nessun guardiano del flusso fino al ritiro** — nodo 12.3.
35. **Consolidamento di «Nuova partita+ (eredità)»: collaudo Codex** — nodo 12.4.
36. **Consolidamento di «Generazione club, rose e nomi»: `audit-copyright` in CI prima dello store** — nodo 13.7.
37. **Audio: nessun guardiano né collaudo registrato** — nodo 13.8.
38. **`validate-dist` e `audit-copyright` nella CI** — nodo 13.11.
39. **Catena `guardiani` non rieseguita dalla 7.999.98 (01/10): 28 release senza giro (STABILITA.json)** — trasversale.
40. **Giro grafico 7.999.126: `rimbalzo-189`, `premiazione-palco-191`, `coppa-mani-191` rossi per campioni insufficienti (4 disegni su 8 richiesti, 11 campioni su 20, 2 su 10: `const ok` dei tre guardiani) — da ripetere su macchina scarica e rendere i guardiani robusti al carico; `walkout-fermi-197` rosso invece sulla misura (verde: somma 10 contro un massimo di 5,3 = un terzo del rosso 16), coerente con PO-206** — trasversale.
41. **Componenti definiti e mai montati: `AIDecisionOverlay` (src/13:425), `Player3DViewer` (src/01:732), `AISettingsCard` (src/17:589)** — trasversale.
42. **BACKLOG.md: PO-201 e PO-204 risultano «DA FARE» ma la 7.999.126 li consegna (ROADMAP.md)** — trasversale.

## Autocritica

**Rami che sembravano «a posto» e che la griglia mostra non esserlo.**
- *Stagione e ciclo settimanale.* `career-critical` e la catena carriera sono verdi su ogni giro recente, ma la stabilità è bassa: la «partita già giocata» è alla nona ricorrenza documentata (07:114) più PO-194 e PO-183 ancora in corso. Verde dei guardiani ≠ stabile: i guardiani coprono i casi già visti.
- *Cerimonie.* Molte release recenti (7.999.116-125) le hanno «chiuse», ma ogni chiusura è una correzione di un rilievo del PO sulla stessa scena; due guardiani su quattro della premiazione sono rossi sull'ultimo giro (per pochi campioni: la correzione non è smentita, ma nemmeno confermata) e `gala-3d` verifica un comportamento ormai superato.
- *Percorso iniziale.* Funziona e nessuno lo segnala, ma creazione, provini e auto-ripresa non hanno un guardiano in catena e la ripresa è spenta proprio sotto `cpmtest=1`: è «a posto» perché nessuno lo guarda.
- *Club, Carriera, Agente/Ufficio.* Le schede sono misurate solo dal censimento `griglia-mobile`, che non può diventare rosso: i valori di Test sono bassi e il tetto 70% vale quasi ovunque.

**Dove la stima dipende solo dal giudizio e potrebbe essere ottimista.**
- *Funzione* delle linguette (Club, Profilo, Agente, Ufficio, Nazionale): letta dal codice, non navigata. Una sezione può esistere nel codice ed essere vuota o rotta a schermo.
- *Resa esclusa* dove manca una prova: 62 nodi su 78 la hanno senza punteggio e la loro media si calcola sugli altri criteri. Se la Resa reale fosse bassa i valori scenderebbero (vedi correzione 1).
- *Stabilità «nessuna voce aperta» = 75-85*: l'assenza di segnalazioni su nodi rari (Tutorial, Nuova partita+, Fine carriera, Trattativa) può voler dire solo che il PO non ci è ancora arrivato.
- *Solidità*: giudizio sul file unico, non una metrica per nodo.
- *Pesi d'importanza*: scelti dal team; con pesi diversi i rami cambiano di qualche punto.

