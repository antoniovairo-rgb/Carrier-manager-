# MAPPA DEL GIOCO — build 7.999.173 — 18/10/2026

Consolidamento complessivo: **62% → 64% (Team 64%)** media semplice dei rami · **62% → 64%** pesata per tempo di gioco (Partita ×3; Home, Stagione, Sistemi ×2) — entrambe per decisione PO del 03/10 (affidabilità: 32 nodi alta · 32 media · 15 bassa su 79 nodi nel conto; nessun valore PO ancora)

> **Limiti di questa stesura (PO-205, seconda versione, build 7.999.173).** Aggiornamento della stesura 7.999.126 (03/10) fatto **senza navigare il gioco**: nessun browser aperto per questa stesura. Le sole misure di Resa nuove sono quelle del giro 68, **riferite dalla sessione che le ha prese e non rieseguite qui**: Home (3.1) con `home-066` verde, 112 riquadri, 0 fuori standard a 412 e 360 px, controllo D1 «titolo ripetuto» col rosso `__CPM_NO_DUP068`; analisi pre-partita (5.3) con `analisi-217` verde a 412×915 e 360×780; Crediti (1.6) con `crediti-254` e il rosso `__CPM_NO_CRED267B`; le foto esistono in `docs/sviluppo/foto/giro68/` (verificato l'elenco dei file, non il contenuto). Stati delle voci letti da `BACKLOG.md` (sezione aperte/storico) e confrontati con `BACKLOG.md` della 7.999.126 (commit ef17137); guardiani letti dalle catene fisse di `tests/visual/ci-runner.mjs` (completa, carriera, grafica, guardiani — i guardiani presenti solo nella catena `mirata`, cioè nella MAPPA file→guardiani, **non** contano per il tetto del 70%); esiti dall'ultimo giro per catena in `STABILITA.json` (notte 7.999.171 del 17/10 89/89 verde; grafica registrata solo fino alla 7.999.146 del 07/10: `home-066`, `analisi-217`, `kit-061`, `stadi-071`, `cerimonie` non hanno un giro grafica registrato). Numeri di riga rimappati con `git diff ef17137 -- src` (righe intatte esatte; 8 riferimenti caduti in righe riscritte ricontrollati a mano con `grep`); dove il riferimento non era più verificabile il numero è stato tolto. Nodi nuovi dal codice: 1.6 Crediti, 1.7 Copia di riserva, 3.9 Finestre in primo piano; nodo tolto: 3.8 Allenamento. Il resto della prima stesura vale ancora: Resa «Non posso confermarlo» dove non c'è una misura o una foto del PO.

> **Prima stesura (7.999.126).** Albero generato **dal codice** (`grep` su `src/*.jsx`: stati `screen`/`setScreen`, fasi `phase` di `App`, `LiveMatch` e `TrialFlow`, linguette `tab`, finestre `…Modal` e overlay di `CareerApp`, componenti di scena 3D) e dai documenti di governo (`BACKLOG.md`, `ROADMAP.md`, `DECISIONI.md`, `RISCHI.md`, `ARCHITETTURA.md`, `STABILITA.json`). **La verifica navigando il gioco NON è stata fatta** (macchina occupata dai collaudi, nessun browser): per questo il criterio **Resa** ha un punteggio solo dove esiste una misura o una segnalazione del PO, altrove è «Non posso confermarlo». La versione 7.999.126 è la release in corso (guanti dei portieri, formazioni). I numeri di riga di quella stesura valevano per quella build.

## Legenda e griglia

**Sei criteri, punteggio 0-100 ciascuno, ognuno con una riga di prova.**

| Criterio | Peso | Come si dà il punteggio |
|---|---:|---|
| Funzione | 25% | 90+ completa e raggiungibile, tutto ciò che il PO ha chiesto c'è · 70-89 completa con lacune note · 50-69 parziale · <50 incompleta o non raggiungibile (letto nel codice) |
| Stabilità | 20% | parte da 100: −15 per ogni difetto aperto/parziale/da collaudare sul nodo, −25 per un bloccante aperto, −10 per ogni correzione ripetuta (stesso difetto riaperto o corretto in più release) nel registro recente (7.999.126 → 7.999.173) o per un rosso sull'ultimo giro di `STABILITA.json`. Le voci chiuse da tempo pesano meno (giudizio dichiarato) |
| Test | 15% | 0 nessuno · 20-30 solo sonde o censimenti senza soglia (`griglia-mobile`) o test fuori catena senza rosso · 40-50 guardiani con interruttore rosso `__CPM_NO_*` ma **fuori** dalle catene · 55-75 guardiano con rosso **dentro** una catena di `tests/visual/ci-runner.mjs` (completa, carriera, grafica, guardiani) · 80-90 più guardiani in catena che coprono il flusso principale, ultimo giro verde · −10 se l'ultimo giro è rosso |
| Coerenza | 15% | rispetto delle decisioni PO (`DECISIONI.md`), stesso kit delle altre schermate, niente codice morto o guardiani che verificano un comportamento superato |
| Resa | 15% | solo da misure o segnalazioni del PO (foto, collaudi). Senza prove: «Non posso confermarlo», criterio **senza punteggio** |
| Solidità tecnica | 10% | dimensione e intreccio del codice, `Math.random()` non seedati, gestione degli errori, strumentazione di test in produzione (`ARCHITETTURA.md`, DT-01…09) |

**Calcolo.** Schermata (nodo) = media pesata dei criteri **che hanno un punteggio** (i pesi dei criteri senza punteggio non entrano: la colonna «prova» dice quanta parte del peso è coperta). Poi si applicano i **tetti**: difetto bloccante aperto → massimo 50% · nessun guardiano in una catena di `ci-runner.mjs` → massimo 70% · segnalazione di collaudo PO aperta sul nodo → massimo 80%. Ramo = media dei nodi pesata per **importanza** (3 = cuore del ciclo di gioco, 2 = frequente, 1 = raro o accessorio, 0 = solo sviluppo, fuori dal conto). Gioco = **media semplice** dei 13 rami.

**Affidabilità** — alta: il nodo è coperto da un guardiano in catena o da una misura registrata · media: punteggi letti nel codice e nei documenti · bassa: prevale il giudizio (nessun guardiano, nessuna segnalazione, criteri senza punteggio).

**Valori.** `Team` = la nostra stima. `PO: __%` = spazio per il valore del PO (con nota). **Valore valido = PO se presente, altrimenti Team.** Rami e gioco si scrivono `NN% (Team MM%)`: oggi nessun valore PO esiste, quindi NN = MM.

**Interpretazione dichiarata dei tetti.** «Nessun guardiano» = nessun guardiano che giri in una catena di `ci-runner.mjs`: un guardiano col rosso che nessuno lancia non protegge (PO-178: 8 su 19 erano rossi senza che nessuno se ne accorgesse). «Segnalazione PO aperta» = voce aperta o parziale in `BACKLOG.md` nata da una richiesta o una foto del PO che riguarda il nodo.

**Decisioni del PO sulla griglia (questionario del 03/10, `DECISIONI.md` righe 53-55), applicate dallo script:**
1. *Resa senza prova.* Il criterio resta fuori dalla media, ma **un nodo senza Resa misurata non supera il 75%** (alternative scartate dal PO: solo esclusione; contarla 50). Oggi 63 nodi su 80 hanno la Resa senza punteggio.
2. *Peso dei rami.* Si mostrano **entrambe** le medie del gioco: semplice e pesata per tempo di gioco (Partita ×3; Home, Stagione, Sistemi ×2; gli altri ×1). Con quei pesi il gioco vale 64%.
3. *Tetto del 70%.* Conta come guardiano **solo** quello che gira in una catena di collaudo (alternative scartate: qualunque guardiano col rosso; anche le sonde). Interpretazione di questa stesura: catene fisse di `ci-runner.mjs`, non la `mirata`.
4. *Stabilità (proposta ancora aperta).* Oggi è una formula applicata a mano sulle voci del backlog: andrebbe calcolata da uno script su `BACKLOG.md` + `STABILITA.json` per nodo (serve una colonna «nodo» nel backlog).

**Regole di aggiornamento.**
- La mappa si aggiorna **a ogni fine lotto** (e a ogni release che chiude una voce collegata, se il PO lo chiede).
- Il team cambia **solo i valori Team**; i valori **PO non si toccano mai** (li scrive solo il PO).
- Ogni variazione si mostra come `NN% → MM%` accanto al nodo, al ramo e al gioco, per una sola stesura (poi resta il valore nuovo).
- Se il valore PO è **più basso di Team di 15 punti o più**, il team scrive un'analisi dello scarto nella scheda del nodo e apre una voce in `BACKLOG.md`.
- I numeri di riga si rigenerano con `grep` a ogni aggiornamento; un nodo nuovo nel codice (nuovo `setScreen`, nuova finestra) entra nell'albero alla stesura successiva.

## Albero

```
Korward Elite 7.999.173 — 62% → 64% (Team 64%)
├── 1 Avvio e accesso — 67% → 68% (Team 68%) [media]
│   ├── 1.1 Caricamento e ripresa automatica — Team 66% → 67% [media] · PO: __%
│   ├── 1.2 Menu principale e slot di salvataggio — Team 70% → 71% [alta] · PO: __%
│   ├── 1.3 Impostazioni — Team 67% [media] · PO: __%
│   ├── 1.4 Importa ed esporta salvataggio — Team 59% [media] · PO: __%
│   ├── 1.5 Revisione azioni e prova situazioni (solo sviluppo) — Team 57% [bassa] · PO: __% (peso 0, fuori dal conto)
│   ├── 1.6 Crediti — Team 70% [alta] · PO: __% (nodo nuovo)
│   └── 1.7 Copia di riserva dello slot — Team 68% [alta] · PO: __% (nodo nuovo)
├── 2 Percorso iniziale (creazione, provini, Primavera, passaggio pro) — 68% → 69% (Team 69%) [media]
│   ├── 2.1 Creazione del giocatore — Team 69% [media] · PO: __%
│   ├── 2.2 Filmato introduttivo — Team 65% [bassa] · PO: __%
│   ├── 2.3 Provini (tre partite) — Team 65% [media] · PO: __%
│   ├── 2.4 Offerte di fine provini — Team 75% [alta] · PO: __%
│   ├── 2.5 Stagioni Primavera (Under 18) — Team 64% [media] · PO: __%
│   └── 2.6 Passaggio a professionista — Team 71% → 75% [alta] · PO: __%
├── 3 Home e ciclo settimanale — 59% → 65% (Team 65%) [alta]
│   ├── 3.1 Home (cruscotto) — Team 64% → 70% [alta] · PO: __%
│   ├── 3.2 Pulsante principale e avanzamento della settimana — Team 50% → 66% [alta] · PO: __%
│   ├── 3.3 Vivi la settimana ed eventi settimanali — Team 64% [media] · PO: __%
│   ├── 3.4 Momenti di carriera — Team 61% [bassa] · PO: __%
│   ├── 3.5 Il mister: verifica mensile e dialoghi — Team 64% [media] · PO: __%
│   ├── 3.6 Interazioni d'apertura stagione — Team 69% [media] · PO: __%
│   ├── 3.7 Tutorial — Team 54% [bassa] · PO: __%
│   └── 3.9 Finestre in primo piano della Home — Team 66% [alta] · PO: __% (nodo nuovo)
├── 4 Stagione — 71% (Team 71%) [alta]
│   ├── 4.1 Classifica — Team 75% [alta] · PO: __%
│   ├── 4.2 Calendario — Team 74% → 73% [alta] · PO: __%
│   ├── 4.3 Coppe (nazionale, europee, tornei) — Team 66% [alta] · PO: __%
│   ├── 4.4 Sorteggi dei gironi europei — Team 69% [media] · PO: __%
│   └── 4.5 Ritiro pre-campionato — Team 66% [media] · PO: __%
├── 5 Partita — 61% → 64% (Team 64%) [alta]
│   ├── 5.1 Scelta Gioca / Simula — Team 50% → 72% [alta] · PO: __%
│   ├── 5.2 Conferenza pre-partita e discorso del mister — Team 67% [alta] · PO: __%
│   ├── 5.3 Giorno partita e rapporto dell'osservatore — Team 70% → 72% [alta] · PO: __%
│   ├── 5.4 Formazioni — Team 70% → 74% [alta] · PO: __%
│   ├── 5.5 Ingresso in campo (3D) — Team 58% → 63% [alta] · PO: __%
│   ├── 5.6 Partita 2D — Team 60% → 59% [alta] · PO: __%
│   ├── 5.7 Highlight 3D dell'eroe — Team 50% [alta] · PO: __%
│   ├── 5.8 Rigori di fine gara — Team 64% [media] · PO: __%
│   ├── 5.9 Fine gara: riepilogo, pagelle e tabellino — Team 65% → 66% [alta] · PO: __%
│   ├── 5.10 Festa di fine partita — Team 52% → 60% [media] · PO: __%
│   ├── 5.11 Rassegna stampa post-partita — Team 68% → 64% [media] · PO: __%
│   └── 5.12 Simula: la partita dell'eroe senza giocarla — Team 65% → 66% [alta] · PO: __%
├── 6 Club — 63% (Team 63%) [media]
│   ├── 6.1 Scheda Club — Team 65% [media] · PO: __%
│   ├── 6.2 Presentazione al nuovo club — Team 59% [bassa] · PO: __%
│   └── 6.3 Numero di maglia — Team 61% [media] · PO: __%
├── 7 Carriera — 57% (Team 57%) [media]
│   ├── 7.1 Profilo — Team 59% [media] · PO: __%
│   ├── 7.2 Diario sfogliabile — Team 62% [bassa] · PO: __%
│   ├── 7.3 Traguardi (milestone e achievement) — Team 64% [bassa] · PO: __%
│   └── 7.4 Stile di gioco (archetipi) — Team 49% [media] · PO: __%
├── 8 Agente e Ufficio — 63% → 62% (Team 62%) [media]
│   ├── 8.1 Agente (procuratore, mercato, contratto, cessione, prestito) — Team 63% [media] · PO: __%
│   ├── 8.2 Primo incontro col procuratore — Team 70% → 72% [alta] · PO: __%
│   ├── 8.3 Offerta di trasferimento e rifiuto — Team 67% [media] · PO: __%
│   ├── 8.4 Trattativa del contratto — Team 60% → 55% [bassa] · PO: __%
│   └── 8.5 Ufficio (patrimonio, staff privato, investimenti) — Team 58% [media] · PO: __%
├── 9 Nazionale — 56% → 62% (Team 62%) [media]
│   ├── 9.1 Scheda Nazionale — Team 57% [media] · PO: __%
│   ├── 9.2 Convocazione e partita in Nazionale — Team 62% → 64% [media] · PO: __%
│   └── 9.3 Tornei per nazionali (Coppa delle Nazioni, Europeo, Mondiale) — Team 50% → 64% [alta] · PO: __%
├── 10 Media e relazioni — 62% → 63% (Team 63%) [bassa]
│   ├── 10.1 Intervista post-partita (3D) — Team 64% → 67% [media] · PO: __%
│   ├── 10.2 Esito dell'intervista — Team 60% [bassa] · PO: __%
│   └── 10.3 Relazioni: spogliatoio, rivale, stampa — Team 61% [bassa] · PO: __%
├── 11 Cerimonie e scene 3D — 59% → 60% (Team 60%) [alta]
│   ├── 11.1 Serata di presentazione della squadra — Team 68% [alta] · PO: __%
│   ├── 11.2 Premiazione di squadra in campo — Team 46% → 50% [alta] · PO: __%
│   ├── 11.3 Festa del titolo (finestra) — Team 57% → 55% [bassa] · PO: __%
│   ├── 11.4 Galà dei premi — Team 61% [alta] · PO: __%
│   ├── 11.5 Podio della stagione — Team 59% [bassa] · PO: __%
│   ├── 11.6 Parata del pullman — Team 64% [alta] · PO: __%
│   └── 11.7 Stadi 3D — Team 61% [media] · PO: __%
├── 12 Fine stagione e fine carriera — 64% (Team 64%) [media]
│   ├── 12.1 Fine stagione — Team 65% [media] · PO: __%
│   ├── 12.2 Annuncio del ritiro e stagione d'addio — Team 68% [media] · PO: __%
│   ├── 12.3 Fine carriera — Team 64% [bassa] · PO: __%
│   └── 12.4 Nuova partita+ (eredità) — Team 55% [bassa] · PO: __%
└── 13 Sistemi trasversali — 59% → 61% (Team 61%) [alta]
    ├── 13.1 Motore della partita (brain) — Team 58% → 60% [alta] · PO: __%
    ├── 13.2 Simulazione delle altre partite e classifiche — Team 71% → 70% [alta] · PO: __%
    ├── 13.3 Salvataggi e migrazioni — Team 50% → 67% [alta] · PO: __%
    ├── 13.4 Calendario e competizioni (generazione) — Team 66% → 69% [alta] · PO: __%
    ├── 13.5 Mercato e contratti — Team 63% [media] · PO: __%
    ├── 13.6 Crescita del giocatore e difficoltà — Team 56% [media] · PO: __%
    ├── 13.7 Generazione club, rose e nomi — Team 73% [media] · PO: __%
    ├── 13.8 Audio — Team 56% [bassa] · PO: __%
    ├── 13.9 Prestazioni — Team 42% [bassa] · PO: __%
    ├── 13.10 Gestione degli errori — Team 35% [media] · PO: __%
    ├── 13.11 Build web e store — Team 62% [media] · PO: __%
    ├── 13.12 Corpi, clip e gesti 3D — Team 54% → 56% [alta] · PO: __%
    └── 13.13 Kit grafico e tema — Team 72% → 71% [alta] · PO: __%
```

| Ramo | Valore | Nodi | Pesi dei nodi (importanza) | Affidabilità (quota del peso) |
|---|---:|---:|---|---|
| 1 Avvio e accesso | 67% → 68% (Team 68%) | 7 | 1.1×3, 1.2×3, 1.3×2, 1.4×1, 1.5×0, 1.6×1, 1.7×1 | alta 45% · media 55% · bassa 0% |
| 2 Percorso iniziale (creazione, provini, Primavera, passaggio pro) | 68% → 69% (Team 69%) | 6 | 2.1×3, 2.2×1, 2.3×2, 2.4×2, 2.5×3, 2.6×2 | alta 31% · media 62% · bassa 8% |
| 3 Home e ciclo settimanale | 59% → 65% (Team 65%) | 8 | 3.1×3, 3.2×3, 3.3×3, 3.4×2, 3.5×2, 3.6×2, 3.7×1, 3.9×2 | alta 44% · media 39% · bassa 17% |
| 4 Stagione | 71% (Team 71%) | 5 | 4.1×3, 4.2×3, 4.3×2, 4.4×1, 4.5×1 | alta 80% · media 20% · bassa 0% |
| 5 Partita | 61% → 64% (Team 64%) | 12 | 5.1×3, 5.2×2, 5.3×2, 5.4×2, 5.5×2, 5.6×3, 5.7×3, 5.8×1, 5.9×3, 5.10×2, 5.11×2, 5.12×2 | alta 81% · media 19% · bassa 0% |
| 6 Club | 63% (Team 63%) | 3 | 6.1×3, 6.2×1, 6.3×1 | alta 0% · media 80% · bassa 20% |
| 7 Carriera | 57% (Team 57%) | 4 | 7.1×3, 7.2×1, 7.3×1, 7.4×2 | alta 0% · media 71% · bassa 29% |
| 8 Agente e Ufficio | 63% → 62% (Team 62%) | 5 | 8.1×3, 8.2×1, 8.3×2, 8.4×2, 8.5×2 | alta 10% · media 70% · bassa 20% |
| 9 Nazionale | 56% → 62% (Team 62%) | 3 | 9.1×2, 9.2×2, 9.3×2 | alta 33% · media 67% · bassa 0% |
| 10 Media e relazioni | 62% → 63% (Team 63%) | 3 | 10.1×2, 10.2×1, 10.3×2 | alta 0% · media 40% · bassa 60% |
| 11 Cerimonie e scene 3D | 59% → 60% (Team 60%) | 7 | 11.1×2, 11.2×2, 11.3×1, 11.4×2, 11.5×1, 11.6×1, 11.7×2 | alta 64% · media 18% · bassa 18% |
| 12 Fine stagione e fine carriera | 64% (Team 64%) | 4 | 12.1×3, 12.2×1, 12.3×2, 12.4×1 | alta 0% · media 57% · bassa 43% |
| 13 Sistemi trasversali | 59% → 61% (Team 61%) | 13 | 13.1×3, 13.2×3, 13.3×3, 13.4×2, 13.5×2, 13.6×2, 13.7×2, 13.8×1, 13.9×2, 13.10×2, 13.11×2, 13.12×2, 13.13×2 | alta 54% · media 36% · bassa 11% |

## Variazioni rispetto alla stesura 7.999.126

Gioco: media semplice 62% → 64% · pesata 62% → 64%. Nodi nel conto: 77 → 79.

| Nodo | Prima | Ora | Perché (prova di Stabilità, il criterio che si è mosso di più) |
|---|---:|---:|---|
| 5.1 Scelta Gioca / Simula | 50% | 72% | PO-183 e PO-194 FATTI (collaudo Codex chiuso il 07/10); doppio tocco (`double-tap`, P0_4); ricorrenze storiche −10 |
| 13.3 Salvataggi e migrazioni | 50% | 67% | PO-183 e PO-176 FATTI (collaudo Codex 07/10); PO-167 PARZIALE; rischi R-01…R-04 |
| 3.2 Pulsante principale e avanzamento della settimana | 50% | 66% | nessun bloccante aperto: PO-183 FATTO (collaudo Codex chiuso il 07/10 su 7.999.145, 12/12 interruzioni); restano la storia delle ricorrenze (nota 7.445 «9ª RICORRENZA», `src/07-versione-save-interviste.jsx:126`; PO-194, PO-181) e PO-222/PO-263 (zona G) sul ramo «Simula» |
| 9.3 Tornei per nazionali (Coppa delle Nazioni, Europeo, Mondiale) | 50% | 64% | PO-183 FATTO (collaudo Codex 07/10); storia di correttive (7.999.103, 7.999.104, 7.999.105, PO-090) −10; PO-155 IN ATTESA (difetto di codice confermato) |
| 5.10 Festa di fine partita | 52% | 60% | PO-203 FATTO (7.999.140, collaudo Codex chiuso 07/10: 0 sotto il prato); PO-048 FATTO (non riprodotta, chiusa dal PO 12/10); ricorrenze storiche PO-135 (×3), PO-117, PO-121 |
| 3.1 Home (cruscotto) | 64% | 70% | PO-066 DA VERIFICARE DAL PO (riquadri nel kit, 7.999.170; titoli ripetuti tolti nel giro 68); PO-224 PARZIALE (finestre in secondo piano, vedi 3.9) |
| 5.5 Ingresso in campo (3D) | 58% | 63% | PO-206 FATTO (7.999.128, la fila non corre più sul posto); PO-245 DA VERIFICARE DAL PO (ospiti che attraversano il campo); storico PO-188, PO-197, PO-080 |
| 8.4 Trattativa del contratto | 60% | 55% | PO-270 APERTO (eccezione zona G concessa dal PO il 16/10) |
| 2.6 Passaggio a professionista | 71% | 75% | PO-176 FATTO: collaudo Codex chiuso il 07/10 su 7.999.145 (BACKLOG.md, storico) |
| 5.4 Formazioni | 70% | 74% | PO-204 FATTO (7.999.126: campetti a tutta altezza); nessuna voce aperta sul nodo |
| 5.11 Rassegna stampa post-partita | 68% | 64% | PO-244 DA VERIFICARE DAL PO («FASE A ELIMINAZIONE» su gare di girone e amichevoli, collaudo mirato 15/10) |
| 11.2 Premiazione di squadra in campo | 46% | 50% | PO-191 corretta in quattro release (7.999.116-119); 7.686 «trofeo a metà torneo»; `cerimonie` rosso dal 24/09 (PO-137); i rossi del giro 7.999.126 (`premiazione-palco-191`, `coppa-mani-191`, campioni insufficienti) non ci sono più sull'ultimo giro grafica registrato (7.999.146, 07/10) |
| 10.1 Intervista post-partita (3D) | 64% | 67% | PO-243 DA VERIFICARE DAL PO; chiuse PO-008 (×2 release), PO-020, PO-040, PO-129, PO-138 |
| 13.4 Calendario e competizioni (generazione) | 66% | 69% | nessuna voce aperta sul nodo; PO-183 FATTO; cinque correttive in 30 release fino alla 7.999.107 (PO-089, PO-181, 7.999.103, .106, .107) |
| 5.3 Giorno partita e rapporto dell'osservatore | 70% | 72% | PO-217 DA VERIFICARE DAL PO (analisi pre-partita nel kit, 7.999.170) |
| 8.2 Primo incontro col procuratore | 70% | 72% | PO-253 DA VERIFICARE DAL PO (cornice del procuratore nel kit, 7.999.170); PO-003 chiusa |
| 9.2 Convocazione e partita in Nazionale | 62% | 64% | PO-235 e PO-243 DA VERIFICARE DAL PO; PO-155 IN ATTESA (PO-177 confluita, DOPPIONE) |
| 11.3 Festa del titolo (finestra) | 57% | 55% | PO-251 DA VERIFICARE DAL PO (7.999.170) |
| 13.1 Motore della partita (brain) | 58% | 60% | PO-262 APERTO (`match-sequence` ROSSO: determinismo); PO-228 APERTO (statistiche); PO-190 DA COLLAUDARE; PO-022 PARZIALE; goleade ricorrenti nello storico |
| 13.12 Corpi, clip e gesti 3D | 54% | 56% | PO-068, PO-061, PO-171 PARZIALI (PO-024, PO-070, PO-075 confluite in PO-068) |
| 1.1 Caricamento e ripresa automatica | 66% | 67% | PO-176 chiusa (collaudo Codex 07/10 su 7.999.145); PO-167 PARZIALE (copia di riserva degli slot, 7.999.170); ricorrenze chiuse: PO-037 (7.999.11 e 7.999.12), PO-115 (7.999.55) |
| 1.2 Menu principale e slot di salvataggio | 70% | 71% | PO-255 DA VERIFICARE DAL PO (badge d'avvio, 7.999.170); PO-269 APERTO (a 360 px il badge si sovrappone al contenuto) |
| 4.2 Calendario | 74% | 73% | PO-233 DA VERIFICARE DAL PO («1489 giornata», 7.999.165); storico: PO-193, PO-195, 7.999.106, PO-089 |
| 5.6 Partita 2D | 60% | 59% | aperte sul nodo: PO-207 PARZIALE (ripartenza dopo il gol), PO-266 APERTO (riaperto 16/10: cronaca che nomina un giocatore lontano), PO-226, PO-234, PO-246 PARZIALI (schede del mister), PO-259 DA VERIFICARE; ricorrenze: PO-189, PO-122, PO-039 |
| 5.9 Fine gara: riepilogo, pagelle e tabellino | 65% | 66% | PO-209 DA VERIFICARE DAL PO (intestazione del tabellino, 7.999.164); PO-228 APERTO (statistiche poco realistiche: 811,3 passaggi su 40 partite); storico PO-034, PO-043, PO-049 |
| 5.12 Simula: la partita dell'eroe senza giocarla | 65% | 66% | PO-190 DA COLLAUDARE (quota gol dell'eroe 41,4% su 20 partite); PO-222 APERTO (un non convocato riceve una presenza); PO-263 PARZIALE (squalificato/non convocato si infortunano) |
| 13.2 Simulazione delle altre partite e classifiche | 71% | 70% | PO-264 PARZIALE (Europa simulata: lo svincolato riceve una voce di storico); storico PO-175, PO-182 chiuse |
| 13.13 Kit grafico e tema | 72% | 71% | PO-066, PO-230, PO-256 DA VERIFICARE DAL PO |
| 1.6 Crediti | — | 70% | nodo nuovo nel codice: `Crediti238` (`src/17-menu-creazione-pannelli.jsx:184`), pulsante `crediti254-pulsante` (17:353) |
| 1.7 Copia di riserva dello slot | — | 68% | nodo nuovo nel codice: finestra `riserva-167` (`src/19-app-root.jsx:958`), `storage` (`src/08-panchina-derby-meteo-cori.jsx:585`) |
| 3.9 Finestre in primo piano della Home | — | 66% | nodo nuovo nel codice: `pop224` → `Modal` standard `finestra230` (`src/18-career-app.jsx:1991`) |
| 3.8 (tolto) | 26% | — | Allenamento (vista orfana) — vista e `TrainPanel` eliminati nella 7.999.127 per decisione PO del 03/10 (`src/17-menu-creazione-pannelli.jsx:1967`) |

Nota: anche i nodi senza variazione hanno le prove riscritte dove serviva (guardiani verdi nella notte 7.999.171, numeri di riga rimappati), con lo stesso punteggio.

## Schede dei nodi

### Ramo 1 — Avvio e accesso — 67% → 68% (Team 68%)

#### 1.1 Caricamento e ripresa automatica — Team 66% → 67% [media] · PO: __%

- **Nel codice:** `App` fase `loading` + auto-ripresa (`src/19-app-root.jsx:765-811`)
- **Come ci si arriva:** apertura dell'app; con carriera attiva (`cpm-active`) si rientra dritti in carriera
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | riprende carriera (19:781-784), provini (19:786-808) e link `?review=` (19:776); fallback «Stato non riconosciuto» (19:973) |
| Stabilità (20%) | 75 | PO-176 chiusa (collaudo Codex 07/10 su 7.999.145); PO-167 PARZIALE (copia di riserva degli slot, 7.999.170); ricorrenze chiuse: PO-037 (7.999.11 e 7.999.12), PO-115 (7.999.55) |
| Test (15%) | 25 | auto-ripresa DISATTIVATA sotto `?cpmtest=1`: nessun guardiano la esercita; `backup-167` (completa) copre la copia di riserva, non la ripresa; `dist-web-partita-test.mjs` fuori dalle catene |
| Coerenza (15%) | 80 | ripresa sullo stesso tab (`cpm-active-tab`) coerente con la direttiva 7.149 |
| Resa (15%) | — | Non posso confermarlo (nessuna navigazione eseguita) |
| Solidità tecnica (10%) | 60 | ogni lettura in try/catch; rischio R-04 «partita in corso persa» (RISCHI.md) |
| **Media pesata** | 67 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **67** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** un guardiano che ricarichi la pagina SENZA `cpmtest` (carriera, provini, partita in corso) e lo metta in una catena.

**Voci del backlog collegate:** PO-167, PO-176 (chiusa). Voce da aprire: Guardiano dell'auto-ripresa reale (oggi spenta sotto `cpmtest=1`).

#### 1.2 Menu principale e slot di salvataggio — Team 70% → 71% [alta] · PO: __%

- **Nel codice:** `HomeScreen` (`src/17-menu-creazione-pannelli.jsx:216`), `HomeNavBar` (`src/19-app-root.jsx`), `PwaInstallBanner` (17:27), badge di versione (src/19)
- **Come ci si arriva:** fase `home`, quando non c'è una carriera da riprendere
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 85 | tre slot, nuova/carica/elimina/importa; pulsante «Crediti» del kit (17:353); badge d'avvio «v x.y.z» (PO-255) |
| Stabilità (20%) | 60 | PO-255 DA VERIFICARE DAL PO (badge d'avvio, 7.999.170); PO-269 APERTO (a 360 px il badge si sovrappone al contenuto) |
| Test (15%) | 60 | `badge-255`, `toast-256`, `crediti-254` in completa, verdi nella notte 7.999.171 (STABILITA.json 17/10 04:07); `griglia-mobile` (catena grafica) misura `home` senza soglia; `chip-269` solo nella catena mirata |
| Coerenza (15%) | 75 | schermata uniformata al kit (commento G9 in griglia-mobile.mjs); esito attuale Non posso confermarlo |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 70 | componente compatto, nessuna logica di gioco |
| **Media pesata** | 71 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-255, PO-269); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **71** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-255/PO-269 (badge) con collaudo PO a 360 px.

**Voci del backlog collegate:** PO-255, PO-269.

#### 1.3 Impostazioni — Team 67% [media] · PO: __%

- **Nel codice:** `SettingsScreen` (`src/19-app-root.jsx:601`), `AudioSettings` (19:633)
- **Come ci si arriva:** rotella dal menu (19:885) o «Opzioni» in carriera (18:6164)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | grafica, audio, esporta, rivedi intro, uscita al menu (18:6164-6236) |
| Stabilità (20%) | 85 | PO-044 «Rivedi l'intro non funziona» chiusa in 7.999.12; nessuna voce aperta |
| Test (15%) | 30 | solo il censimento `griglia-mobile` (schermata `impostazioni`) |
| Coerenza (15%) | 60 | nel menu del giocatore stanno «Strumenti di collaudo», appunti e misura del motore (18:6172-6231): strumentazione di test in produzione (DT-08) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 65 | strumenti di collaudo condizionati da `devToolsOn()`, ma il codice è nella build |
| **Media pesata** | 67 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **67** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** togliere o nascondere dalla build store gli strumenti di collaudo; guardiano dei due ingressi.

**Voci del backlog collegate:** PO-072. Voce da aprire: Strumenti di collaudo visibili nelle Impostazioni del giocatore (DT-08).

#### 1.4 Importa ed esporta salvataggio — Team 59% [media] · PO: __%

- **Nel codice:** `importSave` (`src/19-app-root.jsx:828`), `exportSave` (`src/18-career-app.jsx:680`)
- **Come ci si arriva:** menu: «Importa»; carriera: Impostazioni → «Esporta salvataggio»
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | export su file e import con avviso se il salvataggio è di una versione più nuova (19:814) |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 0 | ARCHITETTURA.md «Scoperti oggi: … import di un salvataggio da file»; RISCHI R-05 |
| Coerenza (15%) | 70 | export in fondo alle impostazioni come chiesto dal PO (commento 6.84.0, 18:6231) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | un salvataggio più nuovo viene comunque caricato con un avviso (19:814) |
| **Media pesata** | 59 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **59** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano import→export→import con confronto byte per byte.

**Voci del backlog collegate:** PO-167. Voce da aprire: Guardiano di import/export del salvataggio.

#### 1.5 Revisione azioni e prova situazioni (solo sviluppo) — Team 57% [bassa] · PO: __%

- **Nel codice:** `ReviewWizard` (`src/19-app-root.jsx:50`), `SitTest` (19:181)
- **Come ci si arriva:** `?dev=1` → «Revisione azioni» nel menu (19:965); `?sit=N`
- **Importanza nel ramo:** 0

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | wizard muto (19:954), escluso dalla build store (`__CPM_STORE_BUILD`, 19:957) |
| Stabilità (20%) | — | Non posso confermarlo |
| Test (15%) | 30 | usato dal collaudo, nessun guardiano proprio |
| Coerenza (15%) | 60 | strumento di sviluppo dentro il file di gioco (DT-08) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | dipende dagli hook `window.__CPM_*` |
| **Media pesata** | 57 | peso coperto da prove: 65% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **57** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fuori dal conto (peso 0): resta nella mappa per completezza.

**Voci del backlog collegate:** nessuna.

#### 1.6 Crediti — Team 70% [alta] · PO: __% (nodo nuovo)

- **Nel codice:** `Crediti238` (`src/17-menu-creazione-pannelli.jsx:184`), pulsante `crediti254-pulsante` (17:353)
- **Come ci si arriva:** menu principale → «Crediti»
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | 16 voci con fonte (PO-254); le due voci DiceBear nel formato delle altre (riga Licenza e fonte, giro 68, PO-267) |
| Stabilità (20%) | 55 | PO-254 DA VERIFICARE DAL PO; PO-267 PARZIALE; PO-268 APERTO nel BACKLOG ma il codice toglie già numero d'ordine e data (17:154, rosso `__CPM_NO_CRED268`); `crediti-238` rosso sul giro completa 7.999.170 (STABILITA.json 16/10 04:43), sostituito da `crediti-254` |
| Test (15%) | 70 | `crediti-254` in completa (rossi `__CPM_NO_CRED267`, `__CPM_NO_CRED267B` del giro 68), verde nella notte 7.999.171; verde sul giro 68 riferito dalla sessione, non rieseguito in questa stesura |
| Coerenza (15%) | 75 | Modal del kit (`cpm="crediti238"`) |
| Resa (15%) | 70 | MISURA (giro 68): foto prima/dopo a 412 e 360 px (`docs/sviluppo/foto/giro68/crediti-*.jpg`) + guardiano verde; il PO non ha ancora confermato |
| Solidità tecnica (10%) | 70 | componente piccolo, testi in tabella (17:144-182) |
| **Media pesata** | 70 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-254, PO-267, PO-268) |
| **Team** | **70** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** conferma PO dei Crediti; allineare PO-268 nel BACKLOG al codice.

**Voci del backlog collegate:** PO-254, PO-267, PO-268.

#### 1.7 Copia di riserva dello slot — Team 68% [alta] · PO: __% (nodo nuovo)

- **Nel codice:** finestra `riserva-167` (`src/19-app-root.jsx:958`), `storage` (`src/08-panchina-derby-meteo-cori.jsx:585`)
- **Come ci si arriva:** al caricamento, quando lo slot non si legge e una copia di riserva esiste
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | PO-167 PARZIALE: copia di riserva degli slot e avviso «Copia di riserva trovata» (7.999.170) |
| Stabilità (20%) | 65 | PO-167 PARZIALE; `backup-167` corretto nel 7.999.171 (ROADMAP.md:66) |
| Test (15%) | 65 | `backup-167` in completa, verde nella notte 7.999.171 |
| Coerenza (15%) | 75 | Modal del kit, non chiudibile per sbaglio (`dismissable={false}`) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | dipende da `storage` (R-02: errore di scrittura senza avviso, 08:626) |
| **Media pesata** | 68 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-167); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **68** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** completare PO-167 (persistenza del browser, copia esportabile) e collaudo con slot corrotto.

**Voci del backlog collegate:** PO-167.

### Ramo 2 — Percorso iniziale (creazione, provini, Primavera, passaggio pro) — 68% → 69% (Team 69%)

#### 2.1 Creazione del giocatore — Team 69% [media] · PO: __%

- **Nel codice:** `CreateScreen` (`src/17-menu-creazione-pannelli.jsx:396`)
- **Come ci si arriva:** menu → slot vuoto → «Nuova carriera» (`startNew`, 19:822)
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | nome, nazione, ruolo, volto; bonus eredità della Nuova partita+ (19:968) |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 30 | solo il censimento `griglia-mobile` (schermata `creazione`); `grep CreateScreen tests/visual` = 0 file |
| Coerenza (15%) | 75 | nella griglia mobile come le altre schermate del menu |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 70 | componente compatto |
| **Media pesata** | 69 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **69** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano «nuova carriera dall'inizio alla prima partita» (lacuna dichiarata in ARCHITETTURA.md).

**Voci del backlog collegate:** nessuna. Voce da aprire: Guardiano nuova carriera: creazione → provini → offerte → prima partita.

#### 2.2 Filmato introduttivo — Team 65% [bassa] · PO: __%

- **Nel codice:** `IntroCinematic` (`src/19-app-root.jsx:221`)
- **Come ci si arriva:** dopo la creazione, la prima volta (`setPhase("cinematic")`, 19:864); «Rivedi l'intro» (19:719)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | una volta per dispositivo (`cpm-intro-seen`, 19:969) e ripetibile |
| Stabilità (20%) | 85 | PO-044 chiusa in 7.999.12 |
| Test (15%) | 0 | nessun test lo cita |
| Coerenza (15%) | 75 | evento unico `cpm-replay-intro` da menu e profilo (19:730-732) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 70 | isolato |
| **Media pesata** | 65 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **65** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** uno scatto di controllo in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Filmato introduttivo»: uno scatto di controllo in catena grafica.

#### 2.3 Provini (tre partite) — Team 65% [media] · PO: __%

- **Nel codice:** `TrialFlow` (`src/17-menu-creazione-pannelli.jsx:593`), fasi `pre`/`match`/`post`
- **Come ci si arriva:** dopo il filmato (19:969) o in ripresa (19:804-808)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | tre provini con la «Selezione Granata» (17:595), ripresa da `cpm-trial-prog` (7.330) |
| Stabilità (20%) | 70 | bug grave chiuso 7.332 «mi ha sovrascritto una carriera» (19:798); mai un quarto risultato (7.331, 17:600) |
| Test (15%) | 30 | `tripath-chokepoint-test.mjs` (fuori catena); la ripresa è spenta sotto `cpmtest` (19:785) |
| Coerenza (15%) | 70 | stessa `LiveMatch` della carriera con `context="trial"` |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 65 | persistenza su chiave separata dallo slot |
| **Media pesata** | 65 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **65** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano dei tre provini con ripresa a metà.

**Voci del backlog collegate:** nessuna. Voce da aprire: Guardiano dei provini con ripresa a metà.

#### 2.4 Offerte di fine provini — Team 75% [alta] · PO: __%

- **Nel codice:** `OffersScreen` (`src/17-menu-creazione-pannelli.jsx:529`)
- **Come ci si arriva:** fine del terzo provino (`onTrials`, 19:865)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 85 | lega e bandiera su ogni offerta (7.999.114, PO-196) |
| Stabilità (20%) | 85 | PO-196 chiusa nello storico |
| Test (15%) | 75 | `calendario-offerte-195` in catena grafica, rosso `__CPM_NO_LEGA196`, verde sull'ultimo giro grafica registrato (7.999.146, 07/10) |
| Coerenza (15%) | 80 | etichette di lega coerenti con la Stagione |
| Resa (15%) | — | Non posso confermarlo (correzione 7.999.114 non ricollaudata dal PO) |
| Solidità tecnica (10%) | 70 | logica breve |
| **Media pesata** | 81 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **75** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO della 7.999.114 sul telefono.

**Voci del backlog collegate:** PO-196 (chiusa). Voce da aprire: Consolidamento di «Offerte di fine provini»: collaudo PO della 7.999.114 sul telefono.

#### 2.5 Stagioni Primavera (Under 18) — Team 64% [media] · PO: __%

- **Nel codice:** `CareerApp` con `proStatus:"u18"` (`src/18-career-app.jsx:10313` riquadro di stato)
- **Come ci si arriva:** firma con un club giovanile dalle offerte (`onChoose`, 19:866)
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | stessa carriera dei pro con regole proprie (gol Primavera fuori dalle classifiche pro, `primavera-awards-test.mjs`) |
| Stabilità (20%) | 55 | PO-194 GRAVE «partita già giocata» in Primavera 2, S.1 (chiusa 7.999.113); PO-192 conferenza «quasi un derby» in Primavera; impulsi «troppo presto» (`impulsi-contesto-test.mjs`) |
| Test (15%) | 60 | `conferenza-192` (rosso `__CPM_NO_DERBY192`) e `partita-rigiocata-194` in catena carriera, verdi nella notte 7.999.171 (17/10, 89/89); `primavera-awards-test`, `impulsi-contesto-test` fuori catena |
| Coerenza (15%) | 70 | PO-192: domande da professionisti finite in Primavera |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | molte regole `proStatus==="u18"` sparse in 18 |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo Codex di una stagione Primavera intera con scheda (eventi, conferenze, classifica).

**Voci del backlog collegate:** PO-192 (chiusa), PO-194 (chiusa), PO-153.

#### 2.6 Passaggio a professionista — Team 71% → 75% [alta] · PO: __%

- **Nel codice:** schermata `proTransition` → `ProTransitionScreen` (`src/16-scene-3d-cerimonie.jsx:26`); `onProChoose` (`src/18-career-app.jsx:5420`)
- **Come ci si arriva:** fine stagione Under 18 (`setScreen("proTransition")`)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | rivale e sponsor nascono all'accettazione dell'offerta (7.999.120) |
| Stabilità (20%) | 80 | PO-176 FATTO: collaudo Codex chiuso il 07/10 su 7.999.145 (BACKLOG.md, storico) |
| Test (15%) | 70 | `pro-rivale-176` in catena carriera, rosso `__CPM_NO_PRO176`, verde nella notte 7.999.171 (17/10, 89/89) |
| Coerenza (15%) | 75 | stesso flusso offerta/firma della carriera |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | migrazione al caricamento che crea campi (prima della 7.999.120) |
| **Media pesata** | 75 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **75** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO di un passaggio a professionista sul telefono.

**Voci del backlog collegate:** PO-176 (chiusa). Voce da aprire: Consolidamento di «Passaggio a professionista»: collaudo PO di un passaggio a professionista sul telefono.

### Ramo 3 — Home e ciclo settimanale — 59% → 65% (Team 65%)

#### 3.1 Home (cruscotto) — Team 64% → 70% [alta] · PO: __%

- **Nel codice:** linguetta `dashboard` (`src/18-career-app.jsx`, `tab==="dashboard"`)
- **Come ci si arriva:** barra in basso «Home», tasto M
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | circa 45 riquadri condizionati in fisarmoniche |
| Stabilità (20%) | 60 | PO-066 DA VERIFICARE DAL PO (riquadri nel kit, 7.999.170; titoli ripetuti tolti nel giro 68); PO-224 PARZIALE (finestre in secondo piano, vedi 3.9) |
| Test (15%) | 75 | `home-066` in catena grafica (rossi `__CPM_NO_HOME066` e, dal giro 68, `__CPM_NO_DUP068` per il controllo D1 «titolo ripetuto»); `titolo-110`, `riquadro-euro-105` in carriera, verdi nella notte 7.999.171; nessun giro della catena grafica registrato con `home-066` (ultimo grafica: 7.999.146) |
| Coerenza (15%) | 70 | riquadri portati alla card neutra (PO-066, 7.999.170) |
| Resa (15%) | 75 | MISURA VERA (giro 68): foto prima/dopo della Home pro e Under 18 a 412 e 360 px (`docs/sviluppo/foto/giro68/home-*.jpg`) + `home-066` verde, 112 riquadri, 0 fuori standard a 412 e 360 (riferito dalla sessione del giro 68); manca la conferma del PO |
| Solidità tecnica (10%) | 50 | riquadri scritti come blocchi inline nel file più grande del gioco (DT-06) |
| **Media pesata** | 70 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-066) |
| **Team** | **70** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** conferma PO di PO-066 sul telefono; un giro registrato della catena grafica con `home-066`.

**Voci del backlog collegate:** PO-066, PO-224.

#### 3.2 Pulsante principale e avanzamento della settimana — Team 50% → 66% [alta] · PO: __%

- **Nel codice:** `handleContinua` (18:1322), `doAdvanceWeek` (18:4328), conferma `showAdvanceConfirm`
- **Come ci si arriva:** pulsante fisso in cima alla Home, tasto A
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | vivi / gioca / avanza in un solo pulsante; conferma prima di saltare |
| Stabilità (20%) | 55 | nessun bloccante aperto: PO-183 FATTO (collaudo Codex chiuso il 07/10 su 7.999.145, 12/12 interruzioni); restano la storia delle ricorrenze (nota 7.445 «9ª RICORRENZA», `src/07-versione-save-interviste.jsx:126`; PO-194, PO-181) e PO-222/PO-263 (zona G) sul ramo «Simula» |
| Test (15%) | 85 | `career-critical` (11 guardiani, rossi `__CPM_NO_P0_1…6`), `partita-rigiocata-194`, `recupero-103`, `euro-attesa-181`, `rinvio-coppe-107` in catena carriera, verdi nella notte 7.999.171 (17/10, 89/89) |
| Coerenza (15%) | 65 | tre strade che avanzano la settimana (doAdvanceWeek / onMatchEnd / simulateAndAdvance: `tripath-chokepoint-test.mjs`) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 40 | `Math.random` non seedati in `src/18` (DT-07) |
| **Media pesata** | 66 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **66** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** una sola funzione di avanzamento; collaudo Codex di una stagione intera senza ricorrenze.

**Voci del backlog collegate:** PO-183 (chiusa), PO-153.

#### 3.3 Vivi la settimana ed eventi settimanali — Team 64% [media] · PO: __%

- **Nel codice:** `liveCurrentWeek` (18:4044), finestra `weekLiveModal` (18:6296), avviso `weekEvent` (18:6252), `WEEKLY_EVENTS` (`src/03-eventi-narrativi.jsx:26`)
- **Come ci si arriva:** pulsante principale nelle settimane senza partita
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | evento, riabilitazione, spogliatoio, impulso, rivale (18:4062-4698) |
| Stabilità (20%) | 70 | lamentele ripetute chiuse: «in una stagione mai capitato un evento» (`vita-flow-test`), «ripetitivo» (`vita-variety-test`) |
| Test (15%) | 40 | `vita-flow-test`, `vita-variety-test`, `impulsi-contesto-test` fuori catena |
| Coerenza (15%) | 65 | PO-154: «46 impulsi su 112 non hanno condizioni… Nessun impulso ha memoria» |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | testi e pesi in tabelle da 1.459 righe |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-154); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 1 Codex (PO-153) e proposta PO-154; guardiano in catena.

**Voci del backlog collegate:** PO-154, PO-153.

#### 3.4 Momenti di carriera — Team 61% [bassa] · PO: __%

- **Nel codice:** `careerMomentModal` (18:6416), `CAREER_MOMENTS` (`src/03-eventi-narrativi.jsx:972`)
- **Come ci si arriva:** dopo partite o settimane speciali (18:1313)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | finestra in coda alle altre (precedenza unica, rosso `__CPM_NO_CODA23`, 18:6159) |
| Stabilità (20%) | 75 | nessuna voce aperta sul nodo; coda delle finestre corretta il 24/09 |
| Test (15%) | 30 | hook `forceMoment` (18:1448), nessun guardiano in catena |
| Coerenza (15%) | 65 | PO-154: niente memoria né catene |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | trigger probabilistici non seedati |
| **Media pesata** | 61 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **61** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano della coda delle finestre in catena; misura Codex delle frequenze.

**Voci del backlog collegate:** PO-154.

#### 3.5 Il mister: verifica mensile e dialoghi — Team 64% [media] · PO: __%

- **Nel codice:** `monthlyReviewModal` (18:6636), `coachModal` (18:6594)
- **Come ci si arriva:** ogni mese (18:4078); dialogo proattivo (18:4888)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano in catena e collaudo dei testi.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Il mister: verifica mensile e dialoghi»: guardiano in catena e collaudo dei testi.

#### 3.6 Interazioni d'apertura stagione — Team 69% [media] · PO: __%

- **Nel codice:** `openingWiz` (18:7026), `openingPending` (18:946: ritiro, presidente, mercato, stampa, maglia, presentazione, addio, sorteggi)
- **Come ci si arriva:** settimana 1 di ogni stagione (`openingGate`, 18:964)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | otto passi in fila in un solo assistente |
| Stabilità (20%) | 75 | nessuna voce aperta |
| Test (15%) | 40 | `home-opening-test` (fuori catena): «le interazioni d'apertura vivono solo nel wizard» |
| Coerenza (15%) | 75 | direttiva PO: niente riquadri pre-stagionali in Home |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | gestori condivisi card⟷wizard (18:967) |
| **Media pesata** | 69 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **69** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** rimettere `home-opening-test` in una catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Interazioni d'apertura stagione»: rimettere `home-opening-test` in una catena.

#### 3.7 Tutorial — Team 54% [bassa] · PO: __%

- **Nel codice:** `TutorialOverlay` (`src/17-menu-creazione-pannelli.jsx:1922`), `TUTORIAL_STEPS` (17:1914)
- **Come ci si arriva:** primo ingresso in Home (`!player.tutorialDone`, 18:6240)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 60 | quattro passi (`tutStep` 0-3, 18:172), salta/avanti |
| Stabilità (20%) | 80 | nessuna voce in BACKLOG.md |
| Test (15%) | 0 | i guardiani impostano `tutorialDone:true` per saltarlo |
| Coerenza (15%) | — | Non posso confermarlo |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 70 | componente piccolo |
| **Media pesata** | 54 | peso coperto da prove: 70% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **54** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo Codex con scheda del primo avvio; uno scatto in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Tutorial: nessuna verifica (né guardiano né collaudo).

#### 3.9 Finestre in primo piano della Home — Team 66% [alta] · PO: __% (nodo nuovo)

- **Nel codice:** `pop224` → `Modal` standard `finestra230` (`src/18-career-app.jsx:1991`)
- **Come ci si arriva:** Home, quando arrivano risposte, storie, impulsi o notizie
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | PO-224 PARZIALE: le finestre aspettano anche l'intervista settimanale (7.999.161) |
| Stabilità (20%) | 55 | PO-224 PARZIALE; PO-230 DA VERIFICARE DAL PO (finestre in primo piano nel Modal standard, 7.999.163) |
| Test (15%) | 70 | `popup-224`, `finestra-230`, `toast-256` in completa, verdi nella notte 7.999.171 |
| Coerenza (15%) | 75 | Modal standard (decisione PO «tutte le finestre in primo piano con grafica standard», PO-230) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | finestra costruita intorno alle `Card` esistenti (18:1991), interruttore `__CPM_NO_MOD230` |
| **Media pesata** | 66 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-224, PO-230); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **66** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-224 e conferma PO di PO-230.

**Voci del backlog collegate:** PO-224, PO-230.

### Ramo 4 — Stagione — 71% (Team 71%)

#### 4.1 Classifica — Team 75% [alta] · PO: __%

- **Nel codice:** linguetta `standings` (18:9048-9299)
- **Come ci si arriva:** barra «Stagione» (apre sulla classifica, 18:690)
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 85 | classifiche di tutte le leghe, capocannonieri, risultati dagli altri campionati |
| Stabilità (20%) | 60 | PO-182 BLOCCANTE chiusa in 7.999.102; PO-175 gol fatti ≠ subiti (7.999.94); `classifica-94` precedente |
| Test (15%) | 85 | `classifica-102` (rosso `__CPM_NO_CLASSIFICA102`) in catena carriera; `career-invariants` (standings) in `career-critical`, verdi nella notte 7.999.171 (17/10, 89/89) |
| Coerenza (15%) | 80 | una sola fonte per la classifica dopo la 7.999.102 |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | riconciliazione al caricamento (07:97) |
| **Media pesata** | 75 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **75** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** un collaudo Codex di 30 carriere (fase 1) senza anomalie di classifica.

**Voci del backlog collegate:** PO-153.

#### 4.2 Calendario — Team 74% → 73% [alta] · PO: __%

- **Nel codice:** linguetta `calendar` (`src/18-career-app.jsx`)
- **Come ci si arriva:** Stagione → «Calendario»
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 85 | griglia con sigla, sede e punteggio (7.999.114); riga della Nazionale in «Prossime partite» (PO-233) |
| Stabilità (20%) | 55 | PO-233 DA VERIFICARE DAL PO («1489 giornata», 7.999.165); storico: PO-193, PO-195, 7.999.106, PO-089 |
| Test (15%) | 80 | `giornata-233` in completa, `avversario-106` in carriera, verdi nella notte 7.999.171; `calendario-offerte-195` (grafica) verde sull'ultimo giro grafica registrato (7.999.146, 07/10) |
| Coerenza (15%) | 80 | stesse sigle della classifica |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | calendario persistente generato una volta per stagione |
| **Media pesata** | 73 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-233); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **73** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** conferma PO di PO-233 sul telefono.

**Voci del backlog collegate:** PO-233.

#### 4.3 Coppe (nazionale, europee, tornei) — Team 66% [alta] · PO: __%

- **Nel codice:** linguetta `coppe` (18:11498)
- **Come ci si arriva:** Stagione → «Coppe»
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | tabellone, gironi, capocannonieri, albo |
| Stabilità (20%) | 45 | 7.999.107 rete di sicurezza per le coppe ferme; PO-186 KCC ferma agli ottavi; 7.686 «trofeo alzato a metà torneo» (18:6031); 7.999.105 |
| Test (15%) | 85 | `coppa-intera`, `coppa-nazioni`, `cup-final-replay`, `recovery-competition` in `career-critical`; `rinvio-coppe-107` in catena carriera |
| Coerenza (15%) | 70 | nomi delle coppe «Korward» (18:6028) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | stato coppe sparso fra `cup`, `euro`, `euroMondiale` |
| **Media pesata** | 66 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **66** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 1 Codex con controllo delle coppe arrivate in fondo.

**Voci del backlog collegate:** PO-153.

#### 4.4 Sorteggi dei gironi europei — Team 69% [media] · PO: __%

- **Nel codice:** `euroGroupModal` (18:7147) e passo «sorteggi» (18:961)
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
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **69** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** uno scatto della finestra in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Sorteggi dei gironi europei»: uno scatto della finestra in catena grafica.

#### 4.5 Ritiro pre-campionato — Team 66% [media] · PO: __%

- **Nel codice:** overlay `ritiroEvent` (18:5959), `ritiroPlan` (`src/10-folla-stadi-ritiro.jsx:435`)
- **Come ci si arriva:** assistente d'apertura, dalla seconda stagione da pro (18:950)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | sei tempi con un'unica scelta (7.337) |
| Stabilità (20%) | 80 | nessuna voce aperta |
| Test (15%) | 30 | nessun guardiano dedicato; `home-opening-test` lo cita |
| Coerenza (15%) | 75 | stesso schema a tempi della serata di presentazione |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | motori puri (18:5957) |
| **Media pesata** | 66 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **66** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano del racconto e della scelta.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Ritiro pre-campionato»: guardiano del racconto e della scelta.

### Ramo 5 — Partita — 61% → 64% (Team 64%)

#### 5.1 Scelta Gioca / Simula — Team 50% → 72% [alta] · PO: __%

- **Nel codice:** `showMatchPrompt` (18:6684)
- **Come ci si arriva:** pulsante principale nella settimana con partita, tasto P
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | Gioca, Simula, «Non ora», squalifica → simulata (18:6684-6782) |
| Stabilità (20%) | 60 | PO-183 e PO-194 FATTI (collaudo Codex chiuso il 07/10); doppio tocco (`double-tap`, P0_4); ricorrenze storiche −10 |
| Test (15%) | 85 | `double-tap` in `career-critical`, `partita-rigiocata-194` (rosso `__CPM_NO_CONF194`) in catena carriera, `typing-shortcuts` in completa, verdi nella notte 7.999.171 |
| Coerenza (15%) | 75 | Modal del kit |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | stato in più ref (`showMatchPromptRef`) |
| **Media pesata** | 72 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **72** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO sul telefono del ciclo Gioca/Simula.

**Voci del backlog collegate:** PO-183 (chiusa). Voce da aprire: Consolidamento di «Scelta Gioca / Simula»: collaudo PO sul telefono del ciclo Gioca/Simula.

#### 5.2 Conferenza pre-partita e discorso del mister — Team 67% [alta] · PO: __%

- **Nel codice:** `interviewModal` con `matchCtx:"prematch"` (18:1122), `misterDiscorsoModal` (18:6447)
- **Come ci si arriva:** prima di una partita importante, prima del calcio d'inizio
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | ordine conferenza → discorso → partita (7.999.113) |
| Stabilità (20%) | 55 | PO-194 GRAVE e PO-192 corretti in 7.999.113 (nelle ultime 15 release) |
| Test (15%) | 75 | `partita-rigiocata-194` e `conferenza-192` con rossi in catena carriera, verdi nella notte 7.999.171 (17/10, 89/89) |
| Coerenza (15%) | 70 | domande filtrate per derby e professionisti |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | sequenza a timeout (18:521-528) |
| **Media pesata** | 67 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **67** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO di una gara di cartello.

**Voci del backlog collegate:** PO-192 (chiusa), PO-194 (chiusa). Voce da aprire: Consolidamento di «Conferenza pre-partita e discorso del mister»: collaudo PO di una gara di cartello.

#### 5.3 Giorno partita e rapporto dell'osservatore — Team 70% → 72% [alta] · PO: __%

- **Nel codice:** `LiveMatch` fase `matchday` (`src/15-live-match.jsx`), `MatchdayCard` (`src/13-prepartita-formazioni.jsx:570`), `ScoutReportScreen` (13:69)
- **Come ci si arriva:** «Gioca» → `startMatch`
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | scheda della gara, meteo, posta in palio, osservatore; analisi pre-partita nel kit (PO-217) |
| Stabilità (20%) | 70 | PO-217 DA VERIFICARE DAL PO (analisi pre-partita nel kit, 7.999.170) |
| Test (15%) | 65 | `analisi-217` in catena grafica (nessun giro grafica registrato con lui: ultimo 7.999.146); verde a 412×915 e 360×780 nel giro 68 senza modifiche al codice (riferito); `griglia-mobile` (censimento) |
| Coerenza (15%) | 75 | stesso kit |
| Resa (15%) | 75 | MISURA VERA (giro 68): foto `docs/sviluppo/foto/giro68/analisi-pro-412.jpg` e `analisi-pro-360.jpg` + `analisi-217` verde; manca la conferma del PO |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 72 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-217) |
| **Team** | **72** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** conferma PO di PO-217; un giro registrato della catena grafica.

**Voci del backlog collegate:** PO-217.

#### 5.4 Formazioni — Team 70% → 74% [alta] · PO: __%

- **Nel codice:** `FormationView` (`src/13-prepartita-formazioni.jsx:925`), fase `formations` (15:10350)
- **Come ci si arriva:** dal giorno partita (Invio o pulsante, 15:9879)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | due campetti con le formazioni |
| Stabilità (20%) | 80 | PO-204 FATTO (7.999.126: campetti a tutta altezza); nessuna voce aperta sul nodo |
| Test (15%) | 75 | `formazioni-204` in catena grafica, rosso `__CPM_NO_FORMAZ204`, verde sull'ultimo giro grafica registrato (7.999.146, 07/10) |
| Coerenza (15%) | 75 | — |
| Resa (15%) | 60 | PO-204 «campetti schiacciati con spazio vuoto sotto», chiusa nel BACKLOG; nessuna foto dopo la correzione |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 74 | peso coperto da prove: 100% |
| **Tetto** | — | nessuno |
| **Team** | **74** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** foto di controllo sul telefono dopo la 7.999.126.

**Voci del backlog collegate:** PO-204 (chiusa). Voce da aprire: Consolidamento di «Formazioni»: foto di controllo sul telefono dopo la 7.999.126.

#### 5.5 Ingresso in campo (3D) — Team 58% → 63% [alta] · PO: __%

- **Nel codice:** fase `walkout` (`src/15-live-match.jsx`), sera di presentazione, attesa
- **Come ci si arriva:** dalle formazioni
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | fila, statistiche pre-partita su vetro, sfilata, bambini; ingresso a passo di camminata (7.999.170) |
| Stabilità (20%) | 60 | PO-206 FATTO (7.999.128, la fila non corre più sul posto); PO-245 DA VERIFICARE DAL PO (ospiti che attraversano il campo); storico PO-188, PO-197, PO-080 |
| Test (15%) | 65 | `walkout-fermi-197`, `fila-206`, `pre-188` in grafica (verde sull'ultimo giro grafica registrato (7.999.146, 07/10)); `fila-227`, `bambini-236`, `prima-partita-237` in completa, verdi nella notte 7.999.171; `ingresso-camminata-245` solo nella mirata |
| Coerenza (15%) | 70 | — |
| Resa (15%) | 50 | PO-245 dalle foto del PO; nessuna foto dopo la 7.999.170 |
| Solidità tecnica (10%) | 45 | vive in `src/12` e `src/15` |
| **Media pesata** | 63 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-245) |
| **Team** | **63** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** conferma PO di PO-245; `ingresso-camminata-245` in una catena fissa.

**Voci del backlog collegate:** PO-245, PO-206 (chiusa), PO-188 (chiusa), PO-197 (chiusa).

#### 5.6 Partita 2D — Team 60% → 59% [alta] · PO: __%

- **Nel codice:** fase `playing`: `Campo2D` (15:558), `PannelloLive2D`, `Pagella918`, cronaca `BG_MATCH` (`src/05-cronaca-stadi-formazioni.jsx:24`), schede del mister
- **Come ci si arriva:** dopo l'ingresso in campo
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | campo dall'alto, cronaca, statistiche e pagelle dal vivo, schede del mister con 3 opzioni (PO-234) |
| Stabilità (20%) | 30 | aperte sul nodo: PO-207 PARZIALE (ripartenza dopo il gol), PO-266 APERTO (riaperto 16/10: cronaca che nomina un giocatore lontano), PO-226, PO-234, PO-246 PARZIALI (schede del mister), PO-259 DA VERIFICARE; ricorrenze: PO-189, PO-122, PO-039 |
| Test (15%) | 75 | `ripartenza-207`, `rimbalzo-189` in carriera; `schede-234/246/259/260`, `nomi-219`, `ripartenza-235`, `spot-266` in completa; notte 7.999.171 verde (89/89), ma senza `rimbalzo-189` e `spot-266`, allora fuori catena (ROADMAP.md:66); `ripartenza-207` ROSSO nella notte 7.999.166 (14/10) |
| Coerenza (15%) | 70 | decisione PO: «restano partita 2D + highlight 3D» (DECISIONI.md) |
| Resa (15%) | 55 | PO-207, PO-259 dalle segnalazioni del PO |
| Solidità tecnica (10%) | 45 | `src/15-live-match.jsx` oltre 11.000 righe, `Math.random` non seedati |
| **Media pesata** | 59 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-207, PO-266, PO-226, PO-234, PO-246) |
| **Team** | **59** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-207 e PO-266; decisione PO sulle schede (PO-259).

**Voci del backlog collegate:** PO-207, PO-266, PO-226, PO-234, PO-246, PO-259, PO-021 (chiusa), PO-031 (chiusa).

#### 5.7 Highlight 3D dell'eroe — Team 50% [alta] · PO: __%

- **Nel codice:** fasi `hl_intro`/`hl_choose`/`hl_move`/`hl_result` (15); `ThreeMatchView` (`src/12-three-match-view.jsx:258`); `PopScelta919`; `DPad` (13:28); `SITUATIONS` (`src/04-situazioni-zone-piazzati.jsx:164`)
- **Come ci si arriva:** durante la partita 2D, quando il motore apre una scena
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | 191 scene; gesti e clip per evento ancora parziali (PO-068); scene dal moto solo in parte (PO-022) |
| Stabilità (20%) | 10 | aperte sul nodo (BACKLOG.md): PO-068, PO-123, PO-143, PO-218, PO-220, PO-229, PO-240, PO-261 PARZIALI; PO-248, PO-250, PO-252, PO-258, PO-260, PO-271 APERTI; PO-242, PO-257 DA VERIFICARE; 17 voci del 03/10 chiuse come DOPPIONE (05-06/10) e confluite in PO-123/PO-068/PO-022, non risolte |
| Test (15%) | 85 | `validate-situations` (14 categorie) e circa 25 guardiani di scena in completa (`esiti-218`, `cross-218`, `lessico-218`, `gk-miss-229`, `apertura-261`, `parata-258`, `difesa-220*`, `piedi/rete/portiere/aereo/camera/reazione-252`, `esiti-241`, `tecnica-045`…), notte 7.999.171 verde; `difesa-252`, `rinvio-252`, `testa-143` erano fuori catena nella 171 (PO-271) e rientrati al giro 50 |
| Coerenza (15%) | 55 | PO-022: «scene generate dal moto» solo in parte; DT-05 gesti riconosciuti da regex sui testi |
| Resa (15%) | 40 | PO-248 «puntiamo alla fluidità, credibilità degli highlight»; PO-261 primo highlight con eroe fuori in 1 partita su 7 (collaudo 3D 170) |
| Solidità tecnica (10%) | 35 | DT-03: rotazioni di ossa scritte a numero in `src/12`; `Math.random` non seedati in `src/12` |
| **Media pesata** | 50 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-123, PO-248, PO-252…) |
| **Team** | **50** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** banco unico degli highlight (PO-248) e chiusura delle voci L1.

**Voci del backlog collegate:** PO-123, PO-068, PO-143, PO-218, PO-220, PO-229, PO-240, PO-242, PO-248, PO-250, PO-252, PO-257, PO-258, PO-260, PO-261, PO-271, PO-033 (chiusa), PO-048 (chiusa), PO-094 (chiusa), PO-120 (chiusa), PO-185 (chiusa).

#### 5.8 Rigori di fine gara — Team 64% [media] · PO: __%

- **Nel codice:** fase `shootout` (`src/15-live-match.jsx:10817`)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `rigori-58` in una catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Rigori di fine gara»: `rigori-58` in una catena.

#### 5.9 Fine gara: riepilogo, pagelle e tabellino — Team 65% → 66% [alta] · PO: __%

- **Nel codice:** fase `ended` (`src/15-live-match.jsx`)
- **Come ci si arriva:** fischio finale
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | punteggio, tabellino, voti |
| Stabilità (20%) | 45 | PO-209 DA VERIFICARE DAL PO (intestazione del tabellino, 7.999.164); PO-228 APERTO (statistiche poco realistiche: 811,3 passaggi su 40 partite); storico PO-034, PO-043, PO-049 |
| Test (15%) | 75 | `tabellino-228`, `statistiche-228`, `passaggi-228`, `testata-209` in completa; `tabellino-216`, `possesso-209` in carriera; notte 7.999.171 verde |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | — |
| **Media pesata** | 66 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-209, PO-228); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **66** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-228 (statistiche) e conferma PO di PO-209.

**Voci del backlog collegate:** PO-209, PO-228.

#### 5.10 Festa di fine partita — Team 52% → 60% [media] · PO: __%

- **Nel codice:** `FestaFine942` (`src/15-live-match.jsx`)
- **Come ci si arriva:** vittoria meritata, al fischio
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | festa leggera con tabellone e coro |
| Stabilità (20%) | 55 | PO-203 FATTO (7.999.140, collaudo Codex chiuso 07/10: 0 sotto il prato); PO-048 FATTO (non riprodotta, chiusa dal PO 12/10); ricorrenze storiche PO-135 (×3), PO-117, PO-121 |
| Test (15%) | 40 | `festa-942`, `festa-3d`, `festa-57`, `festa-79`, `mister-77` con rosso, tutti fuori catena |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo (i difetti fotografati dal PO sono chiusi, nessuna foto dopo la correzione) |
| Solidità tecnica (10%) | 45 | corpi 3D in `src/12` |
| **Media pesata** | 60 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **60** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** un guardiano della festa in catena.

**Voci del backlog collegate:** PO-203 (chiusa), PO-048 (chiusa). Voce da aprire: Consolidamento di «Festa di fine partita»: un guardiano della festa in catena.

#### 5.11 Rassegna stampa post-partita — Team 68% → 64% [media] · PO: __%

- **Nel codice:** schermata `postmatch` → `PostMatchPress` (`src/13-prepartita-formazioni.jsx:313`); `press` → `PressScreen` (13:419)
- **Come ci si arriva:** chiusura della fine gara
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | giornale con punteggio, statistiche, titoli |
| Stabilità (20%) | 65 | PO-244 DA VERIFICARE DAL PO («FASE A ELIMINAZIONE» su gare di girone e amichevoli, collaudo mirato 15/10) |
| Test (15%) | 30 | `giornale-244` solo nella catena mirata; nessun guardiano in una catena fissa |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-244); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `giornale-244` in una catena fissa; conferma PO.

**Voci del backlog collegate:** PO-244.

#### 5.12 Simula: la partita dell'eroe senza giocarla — Team 65% → 66% [alta] · PO: __%

- **Nel codice:** «Simula» → `simulateAndAdvance` → `simulaPartitaMotore` (`src/14-motore-possesso.jsx`)
- **Come ci si arriva:** scelta Gioca/Simula
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | risultato, voto e statistiche dal motore (brain unico, PO-202 FATTO 7.999.137-138) |
| Stabilità (20%) | 40 | PO-190 DA COLLAUDARE (quota gol dell'eroe 41,4% su 20 partite); PO-222 APERTO (un non convocato riceve una presenza); PO-263 PARZIALE (squalificato/non convocato si infortunano) |
| Test (15%) | 85 | `partita-vera` (completa); `rigori-190`, `debito-190`, `brain-202`, `squalifica-222`, `infortunio-263` con rossi in catena carriera, verdi nella notte 7.999.171 |
| Coerenza (15%) | 75 | decisione «brain unico» (30/09) |
| Resa (15%) | 50 | PO-190 «da confermare sul telefono» |
| Solidità tecnica (10%) | 60 | funzione pura con seme |
| **Media pesata** | 66 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-190, PO-222, PO-263) |
| **Team** | **66** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-222/PO-263 (zona G) e collaudo PO-190.

**Voci del backlog collegate:** PO-190, PO-222, PO-263, PO-202 (chiusa), PO-021 (chiusa).

### Ramo 6 — Club — 63% (Team 63%)

#### 6.1 Scheda Club — Team 65% [media] · PO: __%

- **Nel codice:** linguetta `club` (18:9343): stadio, sponsor, piazzamenti, allenatore, staff, rosa, bacheca, spogliatoio
- **Come ci si arriva:** barra «Club» (18:6156), tasto S
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | otto sezioni a fisarmonica (18:9416-9676) |
| Stabilità (20%) | 75 | PO-110 «12 allenatori che non tornano» (7.999.53) chiusa |
| Test (15%) | 30 | solo il censimento `griglia-mobile` (schermata `club`) |
| Coerenza (15%) | 70 | fisarmoniche del kit |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | blocchi inline in 18 |
| **Media pesata** | 65 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **65** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano dei dati del club (rosa, staff, bacheca).

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Scheda Club»: guardiano dei dati del club (rosa, staff, bacheca).

#### 6.2 Presentazione al nuovo club — Team 59% [bassa] · PO: __%

- **Nel codice:** schermata `clubPresentation` (18:6011) → `ClubPresentationScreen` (`src/16-scene-3d-cerimonie.jsx:3186`)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **59** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo Codex con scheda dopo un trasferimento.

**Voci del backlog collegate:** nessuna. Voce da aprire: Presentazione al nuovo club: nessuna verifica.

#### 6.3 Numero di maglia — Team 61% [media] · PO: __%

- **Nel codice:** `jerseyPickModal` (18:6254)
- **Come ci si arriva:** assistente d'apertura, passo «maglia» (18:954)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **61** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano della scelta.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Numero di maglia»: guardiano della scelta.

### Ramo 7 — Carriera — 57% (Team 57%)

#### 7.1 Profilo — Team 59% [media] · PO: __%

- **Nel codice:** linguetta `profile` (18:9725): statistiche, biografia, record, trofei, allenatori, rivale, stampa, stile, premi, contratto, attributi, timeline…
- **Come ci si arriva:** barra «Carriera» (apre sul Profilo, 18:690), tasto R
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | circa 25 sezioni a fisarmonica (18:9754-10573) |
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

- **Nel codice:** `DiarioSfoglia` (`src/18-career-app.jsx:85`, montato 18:10307)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **62** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** uno scatto in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Diario sfogliabile»: uno scatto in catena grafica.

#### 7.3 Traguardi (milestone e achievement) — Team 64% [bassa] · PO: __%

- **Nel codice:** `MilestoneCelebrationModal` (`src/17-menu-creazione-pannelli.jsx:1950`, montata 18:6238), `CAREER_MILESTONES` (17:1446)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano dello scatto dei traguardi.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Traguardi (milestone e achievement)»: guardiano dello scatto dei traguardi.

#### 7.4 Stile di gioco (archetipi) — Team 49% [media] · PO: __%

- **Nel codice:** Profilo → «Stile di gioco» (18:10096); `ARCHETYPES` (`src/06-archetipi-agenti-sponsor.jsx`)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-098); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **49** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** proposta PO-098 dopo la fase 1 Codex.

**Voci del backlog collegate:** PO-098, PO-153.

### Ramo 8 — Agente e Ufficio — 63% → 62% (Team 62%)

#### 8.1 Agente (procuratore, mercato, contratto, cessione, prestito) — Team 63% [media] · PO: __%

- **Nel codice:** linguetta `agente` (18:10603)
- **Come ci si arriva:** barra «Agente» (18:6156), tasto G
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | procuratore, finestra di mercato, contratto, cessione, prestito, compito, parere (18:10788-11116) |
| Stabilità (20%) | 60 | PO-174 BLOCCANTE prestito chiusa (7.999.91); scheda rinominata tre volte (PO-015, PO-053); PO-181 «198 osservazioni di contratto oltre la scadenza» |
| Test (15%) | 40 | `agent-lifecycle-test`, `agent-relation-test`, `prestito-91` (rosso) fuori catena |
| Coerenza (15%) | 70 | divisione Agente/Ufficio scelta dal PO (7.999.14) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | blocco di 500 righe inline |
| **Media pesata** | 63 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **63** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiani dell'agente in una catena.

**Voci del backlog collegate:** PO-153.

#### 8.2 Primo incontro col procuratore — Team 70% → 72% [alta] · PO: __%

- **Nel codice:** `agentIntro` (18:7884), finestre «Il primo incontro» (18:7908) e «Il confronto» (18:7830)
- **Come ci si arriva:** riquadro in Home quando arriva il suggerimento
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | conoscenza, ambizione, firma |
| Stabilità (20%) | 70 | PO-253 DA VERIFICARE DAL PO (cornice del procuratore nel kit, 7.999.170); PO-003 chiusa |
| Test (15%) | 65 | `procuratore-253` in completa, verde nella notte 7.999.171; `agent-relation-test` fuori catena |
| Coerenza (15%) | 75 | Modal standard |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 72 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-253); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **72** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** conferma PO di PO-253.

**Voci del backlog collegate:** PO-253.

#### 8.3 Offerta di trasferimento e rifiuto — Team 67% [media] · PO: __%

- **Nel codice:** `transferOffer` (18:6800), `refuseEvent` (18:6885); `generateTransferOffer` (`src/06-archetipi-agenti-sponsor.jsx:656`)
- **Come ci si arriva:** a sorpresa durante la stagione (18:1251, 18:4632)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | situazione del club offerente prima di accettare (PO-005) |
| Stabilità (20%) | 70 | PO-108 crescita delle offerte non applicata (7.999.50) |
| Test (15%) | 40 | `decisioni-50` (rossi `__CPM_NO_CRESC49`, `__CPM_NO_SCALATA50`) fuori catena |
| Coerenza (15%) | 75 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | probabilità non seedate (`Math.random()<offerProb`, 18:1251) |
| **Media pesata** | 67 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **67** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `decisioni-50` in catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Offerta di trasferimento e rifiuto»: `decisioni-50` in catena.

#### 8.4 Trattativa del contratto — Team 60% → 55% [bassa] · PO: __%

- **Nel codice:** `negoModal` (18:6910)
- **Come ci si arriva:** rinnovo o offerta: «Tratta»
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | proposta, controproposta, rifiuto; PO-270: il rinnovo di 1 anno firmato nell'ultimo anno non aggiunge stagioni |
| Stabilità (20%) | 65 | PO-270 APERTO (eccezione zona G concessa dal PO il 16/10) |
| Test (15%) | 0 | nessun guardiano in una catena fissa; `rinnovo-270` solo nella catena mirata |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 55 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-270); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **55** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-270; guardiano della trattativa in catena; collaudo Codex.

**Voci del backlog collegate:** PO-270. Voce da aprire: Trattativa del contratto: nessun guardiano in catena fissa.

#### 8.5 Ufficio (patrimonio, staff privato, investimenti) — Team 58% [media] · PO: __%

- **Nel codice:** linguetta `ufficio` (18:10603, `_uff13`: sezioni 18:10647-10676)
- **Come ci si arriva:** barra «Ufficio», tasto U
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 60 | PO-157: «dare un effetto reale e visibile a ciò che resta, oppure togliere o accorpare» |
| Stabilità (20%) | 55 | PO-223 APERTO (investimento pendente aggiunge €55.000 alla stagione successiva); PO-265 PARZIALE («metà del conto» toglieva sempre 40.000€) |
| Test (15%) | 65 | `investimento-223`, `meta-conto-265` in catena carriera, verdi nella notte 7.999.171; `griglia-mobile` (`ufficio`) |
| Coerenza (15%) | 55 | PO-157 |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 58 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-157, PO-223, PO-265); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **58** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-223/PO-265; proposta PO-157.

**Voci del backlog collegate:** PO-157, PO-223, PO-265, PO-014 (chiusa).

### Ramo 9 — Nazionale — 56% → 62% (Team 62%)

#### 9.1 Scheda Nazionale — Team 57% [media] · PO: __%

- **Nel codice:** linguetta `nazionale` (18:11130)
- **Come ci si arriva:** Carriera → «Nazionale» (18:7300)
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
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-155); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **57** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 1 Codex e proposta PO-155.

**Voci del backlog collegate:** PO-155, PO-177 (chiusa), PO-066.

#### 9.2 Convocazione e partita in Nazionale — Team 62% → 64% [media] · PO: __%

- **Nel codice:** schermata `nationalCallup` → `NationalCallupScreen` (`src/17-menu-creazione-pannelli.jsx`); `startNationalMatch`
- **Come ci si arriva:** settimane della Nazionale (`setScreen("nationalCallup")`)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | convocazione nel kit standard (PO-235), CT della nazione, intervista dopo la gara (PO-243) |
| Stabilità (20%) | 55 | PO-235 e PO-243 DA VERIFICARE DAL PO; PO-155 IN ATTESA (PO-177 confluita, DOPPIONE) |
| Test (15%) | 65 | `convocazione-235`, `intervista-231` in completa, verdi nella notte 7.999.171; `career-nat-sim` (catena guardiani); `ct-54` fuori catena |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-155, PO-235, PO-243); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** conferma PO di PO-235/PO-243; proposta PO-155.

**Voci del backlog collegate:** PO-155, PO-235, PO-243, PO-177 (chiusa).

#### 9.3 Tornei per nazionali (Coppa delle Nazioni, Europeo, Mondiale) — Team 50% → 64% [alta] · PO: __%

- **Nel codice:** `nationsCupModal` (18:7185), `euroMondiale`
- **Come ci si arriva:** settimana 20/24 secondo il ciclo (stab-nat-trigger)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | qualificazioni, gironi, eliminazione |
| Stabilità (20%) | 50 | PO-183 FATTO (collaudo Codex 07/10); storia di correttive (7.999.103, 7.999.104, 7.999.105, PO-090) −10; PO-155 IN ATTESA (difetto di codice confermato) |
| Test (15%) | 80 | `coppa-nazioni` in `career-critical`; `euro-attesa-181`, `riquadro-euro-105`, `recupero-103` in catena carriera, verdi nella notte 7.999.171 |
| Coerenza (15%) | 65 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | — |
| **Media pesata** | 64 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-155); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** correggere PO-155; fase 1 Codex.

**Voci del backlog collegate:** PO-155, PO-183 (chiusa).

### Ramo 10 — Media e relazioni — 62% → 63% (Team 63%)

#### 10.1 Intervista post-partita (3D) — Team 64% → 67% [media] · PO: __%

- **Nel codice:** `interviewModal` (18:6483), `InterviewStage3D` (`src/16-scene-3d-cerimonie.jsx:323`), `InterviewScena2D` (16:230), `TavoloStampa24` (16:879)
- **Come ci si arriva:** dopo la partita, in coda alle altre finestre (18:3517)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | domanda, rilancio per tono (PO-040), esito; anche dopo le gare della Nazionale (PO-243) |
| Stabilità (20%) | 60 | PO-243 DA VERIFICARE DAL PO; chiuse PO-008 (×2 release), PO-020, PO-040, PO-129, PO-138 |
| Test (15%) | 65 | `intervista-231` in completa, `conferenza-192` in carriera, verdi nella notte 7.999.171; `giornaliste-169`, `intervista-2d` fuori catena |
| Coerenza (15%) | 70 | foglio in basso quando c'è la scena (18:6483) |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | scena 3D in `src/16` |
| **Media pesata** | 67 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-243); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **67** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** conferma PO di PO-243.

**Voci del backlog collegate:** PO-243.

#### 10.2 Esito dell'intervista — Team 60% [bassa] · PO: __%

- **Nel codice:** `interviewFeedback` (18:6670)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **60** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Esito dell'intervista»: guardiano.

#### 10.3 Relazioni: spogliatoio, rivale, stampa — Team 61% [bassa] · PO: __%

- **Nel codice:** Club → «Lo spogliatoio» (18:9676), Profilo → «Rivale» (18:9916), «La Stampa» (18:10008); eventi di spogliatoio (18:4147) e del rivale (18:4698)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **61** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 1 Codex con metriche sulle relazioni.

**Voci del backlog collegate:** PO-154.

### Ramo 11 — Cerimonie e scene 3D — 59% → 60% (Team 60%)

#### 11.1 Serata di presentazione della squadra — Team 68% [alta] · PO: __%

- **Nel codice:** `presEvent` (18:5933), `PresentationStage3D` (`src/16-scene-3d-cerimonie.jsx:1019`), `PresentazioneScena2D` (16:963)
- **Come ci si arriva:** assistente d'apertura, passo «presentazione» (18:957)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | corpi CGTrader e figurina piccola «da televisione» (7.999.124) |
| Stabilità (20%) | 70 | PO-200 chiusa in 7.999.124 |
| Test (15%) | 70 | `presentazione-200` in catena grafica, rosso `__CPM_NO_PRES200`, verde sull'ultimo giro grafica registrato (7.999.146, 07/10) |
| Coerenza (15%) | 70 | — |
| Resa (15%) | 60 | PO-137 «tutte le scene 3D fuori dalla partita a qualità professionale» aperta |
| Solidità tecnica (10%) | 45 | PO-171: corpi CH38 ancora in cerimonie |
| **Media pesata** | 68 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-137) |
| **Team** | **68** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO di PO-200; PO-137.

**Voci del backlog collegate:** PO-137, PO-171.

#### 11.2 Premiazione di squadra in campo — Team 46% → 50% [alta] · PO: __%

- **Nel codice:** fase `ceremony` (`src/15-live-match.jsx:10790`), decisione `_titleStakes` (`src/18-career-app.jsx:6024`)
- **Come ci si arriva:** fischio finale della gara che assegna il titolo
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 65 | PO-002 PARZIALE: «Il passaggio della coppa non è confermato»; PO-150 confluita in PO-002 (DOPPIONE, decisione PO 05/10) |
| Stabilità (20%) | 35 | PO-191 corretta in quattro release (7.999.116-119); 7.686 «trofeo a metà torneo»; `cerimonie` rosso dal 24/09 (PO-137); i rossi del giro 7.999.126 (`premiazione-palco-191`, `coppa-mani-191`, campioni insufficienti) non ci sono più sull'ultimo giro grafica registrato (7.999.146, 07/10) |
| Test (15%) | 65 | quattro guardiani 191, `passaggio-coppa-137`, `cerimonie`, `scene-fuori-137` in catena grafica; i quattro 191 verdi sull'ultimo giro grafica registrato (7.999.146); gli altri tre non hanno ancora un giro grafica registrato |
| Coerenza (15%) | 45 | decisione PO 30/09 «cerimonie diverse per competizione» non ancora applicata (sospesa a L8) |
| Resa (15%) | 45 | PO-191 «eroe che vola», «coppa non in mano»; PO-137 |
| Solidità tecnica (10%) | 40 | camera e corpi in `src/12` |
| **Media pesata** | 50 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-002, PO-137) |
| **Team** | **50** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-002/137 in L8; un giro registrato della catena grafica completa.

**Voci del backlog collegate:** PO-002, PO-137, PO-150 (chiusa), PO-071.

#### 11.3 Festa del titolo (finestra) — Team 57% → 55% [bassa] · PO: __%

- **Nel codice:** `titleCeleb` (18:7002): «COPPA VINTA!», «TRIONFO EUROPEO!»
- **Come ci si arriva:** dopo un titolo
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | festa a schermo, pulsante «Festeggia» in oro da festa (PO-251) |
| Stabilità (20%) | 65 | PO-251 DA VERIFICARE DAL PO (7.999.170) |
| Test (15%) | 0 | `festa-oro-251` solo nella catena mirata |
| Coerenza (15%) | 60 | terzo modo di festeggiare oltre a cerimonia in campo e parata |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 55 | peso coperto da prove: 85% |
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-251); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **55** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** decidere col PO se resta accanto alle cerimonie 3D; `festa-oro-251` in una catena fissa.

**Voci del backlog collegate:** PO-251.

#### 11.4 Galà dei premi — Team 61% [alta] · PO: __%

- **Nel codice:** schermata `seasonAwards` (18:5906) → `SeasonAwardsScreen` (`src/16-scene-3d-cerimonie.jsx:2209`) → `GalaStage3D` (16:1848), `GalaScena2D` (16:1831)
- **Come ci si arriva:** fine stagione, prima della chiusura (18:5912)
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 85 | busta dal 3° al 1° a tocchi, per tutti i premi (7.999.125) |
| Stabilità (20%) | 45 | decisione cambiata tre volte: PO-109 (7.999.51-52), PO-199 (7.999.124 e 7.999.125); PO-001 |
| Test (15%) | 65 | `busta-199` (rossi `__CPM_NO_BUSTA199`, `__CPM_NO_TUTTI201`) in catena grafica, verde sull'ultimo giro grafica registrato (7.999.146, 07/10) |
| Coerenza (15%) | 50 | `gala-3d.mjs` verifica ancora «Apri la busta porta DIRETTO al premio vinto», comportamento superato dalla decisione PO 03/10 |
| Resa (15%) | 60 | PO-137 aperta |
| Solidità tecnica (10%) | 45 | `src/16` 3.242 righe |
| **Media pesata** | 61 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-137) |
| **Team** | **61** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** aggiornare o ritirare `gala-3d`; collaudo PO 7.999.125.

**Voci del backlog collegate:** PO-137, PO-199 (chiusa). Voce da aprire: Guardiano `gala-3d` obsoleto (verifica la busta diretta, superata il 03/10).

#### 11.5 Podio della stagione — Team 59% [bassa] · PO: __%

- **Nel codice:** `Podio23` (`src/16-scene-3d-cerimonie.jsx:2237`) dentro il galà
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **59** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** scatto in catena grafica.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Podio della stagione»: scatto in catena grafica.

#### 11.6 Parata del pullman — Team 64% [alta] · PO: __%

- **Nel codice:** `ParataCompleta198` (`src/16-scene-3d-cerimonie.jsx:1408`), `ParataBus3D` (16:1415), montata in `SeasonEndScreen` (16:2657)
- **Come ci si arriva:** fine stagione da campione (`parata-test`)
- **Importanza nel ramo:** 1

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | squadra CGTrader sul tetto (7.999.123) |
| Stabilità (20%) | 55 | PO-009 (7.982) e PO-198 (7.999.123): rifatta due volte |
| Test (15%) | 70 | `parata-198` (rosso `__CPM_NO_PARATA198`) in catena grafica, verde sull'ultimo giro grafica registrato (7.999.146, 07/10) |
| Coerenza (15%) | 70 | — |
| Resa (15%) | 55 | PO-137 aperta |
| Solidità tecnica (10%) | 45 | — |
| **Media pesata** | 64 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-137) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo PO della 7.999.123.

**Voci del backlog collegate:** PO-137.

#### 11.7 Stadi 3D — Team 61% [media] · PO: __%

- **Nel codice:** `buildStadium` (`src/11-ui-kit-highlight.jsx:747`), `makeCrowdTex` (11:425), folla (`src/10`)
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

- **Nel codice:** schermata `seasonEnd` (18:6005) → `SeasonEndScreen` (`src/16-scene-3d-cerimonie.jsx:2650`); `doStartNewSeason` (18:4934)
- **Come ci si arriva:** dopo il galà (18:5912)
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
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **65** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `career-sim-test` (N stagioni) in catena.

**Voci del backlog collegate:** PO-153.

#### 12.2 Annuncio del ritiro e stagione d'addio — Team 68% [media] · PO: __%

- **Nel codice:** passo «addio» dell'assistente (18:960), conferma (18:10374), `doRetire` (18:4923)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **68** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `retire-announce-test` in catena.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Annuncio del ritiro e stagione d'addio»: `retire-announce-test` in catena.

#### 12.3 Fine carriera — Team 64% [bassa] · PO: __%

- **Nel codice:** schermata `careerEnd` (18:5924) → `CareerEndScreen` (`src/17-menu-creazione-pannelli.jsx:979`), `calcLegacyScore` (17:916)
- **Come ci si arriva:** ritiro; un salvataggio ritirato apre sempre questa pagina (18:5926)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **64** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo Codex con scheda di una carriera fino al ritiro.

**Voci del backlog collegate:** nessuna. Voce da aprire: Fine carriera: nessun guardiano del flusso fino al ritiro.

#### 12.4 Nuova partita+ (eredità) — Team 55% [bassa] · PO: __%

- **Nel codice:** `onNewGamePlusCB` (`src/19-app-root.jsx:972`) → `CreateScreen` con `legacyBonus` (19:968)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **55** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo Codex.

**Voci del backlog collegate:** nessuna. Voce da aprire: Consolidamento di «Nuova partita+ (eredità)»: collaudo Codex.

### Ramo 13 — Sistemi trasversali — 59% → 61% (Team 61%)

#### 13.1 Motore della partita (brain) — Team 58% → 60% [alta] · PO: __%

- **Nel codice:** `src/14-motore-possesso.jsx`: `simulaPartitaMotore`, `probEroe`
- **Come ci si arriva:** ogni partita, simulata o vissuta
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 70 | PO-202 FATTO (7.999.137-138: il brain decide tutto); PO-022 PARZIALE (scene generate dal moto, 7.999.169) |
| Stabilità (20%) | 35 | PO-262 APERTO (`match-sequence` ROSSO: determinismo); PO-228 APERTO (statistiche); PO-190 DA COLLAUDARE; PO-022 PARZIALE; goleade ricorrenti nello storico |
| Test (15%) | 85 | `partita-vera`, `test:logic`, `passaggi-228`, `statistiche-228` in completa; `rigori-190`, `debito-190`, `brain-202`, `possesso-209`, `tempo-138` in carriera; notte 7.999.171 verde; `match-sequence` non è in nessuna catena |
| Coerenza (15%) | 60 | «brain unico» fatto per `probEroe` e per la scena (PO-202), non ancora per i gesti (PO-022) |
| Resa (15%) | 50 | PO-228: «811,3 passaggi su 40 partite» (foto po228-statistiche-86min.jpg) |
| Solidità tecnica (10%) | 60 | seme deterministico per partita, ma PO-262: la stessa partita giocata 4 volte non è identica |
| **Media pesata** | 60 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-262, PO-228, PO-022) |
| **Team** | **60** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-262 (determinismo) e PO-228; `match-sequence` in catena.

**Voci del backlog collegate:** PO-022, PO-190, PO-228, PO-262, PO-202 (chiusa), PO-021 (chiusa), PO-030 (chiusa), PO-031 (chiusa), PO-064 (chiusa).

#### 13.2 Simulazione delle altre partite e classifiche — Team 71% → 70% [alta] · PO: __%

- **Nel codice:** `simulateMatch` (`src/10-folla-stadi-ritiro.jsx`), `updateStandings` (`src/09-audio-scout-anagrafiche.jsx`)
- **Come ci si arriva:** ogni avanzamento di settimana
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | risultati di tutte le leghe |
| Stabilità (20%) | 50 | PO-264 PARZIALE (Europa simulata: lo svincolato riceve una voce di storico); storico PO-175, PO-182 chiuse |
| Test (15%) | 85 | `career-invariants`, `classifica-102`, `svincolato-264` in catena, verdi nella notte 7.999.171; `sim-motore-test` (rosso `__CPM_NO_SIMV2`) |
| Coerenza (15%) | 75 | `simulateMatch(...,{motore:true})` = motore unico |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 55 | — |
| **Media pesata** | 70 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-264); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **70** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-264; fase 1 Codex senza anomalie.

**Voci del backlog collegate:** PO-153, PO-264.

#### 13.3 Salvataggi e migrazioni — Team 50% → 67% [alta] · PO: __%

- **Nel codice:** `storage` (`src/08-panchina-derby-meteo-cori.jsx:585`), `SAVE_VERSION` (`src/07-versione-save-interviste.jsx`), `migratePlayer` (`src/17-menu-creazione-pannelli.jsx`)
- **Come ci si arriva:** salvataggio automatico a ogni cambio (3 slot `cpm-v3*`)
- **Importanza nel ramo:** 3

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 75 | copia di riserva degli slot e avviso (PO-167 PARZIALE, 7.999.170); manca ancora la persistenza garantita del browser |
| Stabilità (20%) | 55 | PO-183 e PO-176 FATTI (collaudo Codex 07/10); PO-167 PARZIALE; rischi R-01…R-04 |
| Test (15%) | 85 | `save-compat`, `save-monotonic` (P0_2), `pending-mr-durable`, `playedmd-registry`, `migrazione-194`, `backup-167` in catena, verdi nella notte 7.999.171 |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 40 | R-02: `storage.save` cattura l'errore e restituisce `false` senza avviso (08:626) |
| **Media pesata** | 67 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 80% (segnalazione PO aperta: PO-167); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **67** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** L3 (PO-167, PO-168).

**Voci del backlog collegate:** PO-167, PO-183 (chiusa), PO-176 (chiusa).

#### 13.4 Calendario e competizioni (generazione) — Team 66% → 69% [alta] · PO: __%

- **Nel codice:** `generateSeasonCalendar` (`src/09-audio-scout-anagrafiche.jsx`), innesco dei tornei (`stab-nat-trigger-test.mjs`)
- **Come ci si arriva:** inizio stagione
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | campionato, coppe, finestre della Nazionale |
| Stabilità (20%) | 50 | nessuna voce aperta sul nodo; PO-183 FATTO; cinque correttive in 30 release fino alla 7.999.107 (PO-089, PO-181, 7.999.103, .106, .107) |
| Test (15%) | 85 | `career-invariants`, `recupero-103`, `avversario-106`, `rinvio-coppe-107` in catena carriera, verdi nella notte 7.999.171 |
| Coerenza (15%) | 70 | — |
| Resa (15%) | — | Non posso confermarlo |
| Solidità tecnica (10%) | 50 | — |
| **Media pesata** | 69 | peso coperto da prove: 85% |
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **69** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** fase 1 Codex con 30 carriere.

**Voci del backlog collegate:** PO-153, PO-183 (chiusa).

#### 13.5 Mercato e contratti — Team 63% [media] · PO: __%

- **Nel codice:** `generateTransferOffer` (`src/06-archetipi-agenti-sponsor.jsx:656`), `generateProContracts` (06:725)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **63** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** guardiano del contratto scaduto in catena.

**Voci del backlog collegate:** PO-153, PO-157.

#### 13.6 Crescita del giocatore e difficoltà — Team 56% [media] · PO: __%

- **Nel codice:** allenamento automatico (18:3154), crescita a fine gara (18:3879), `adaptiveDifficulty` (`src/06-archetipi-agenti-sponsor.jsx:60`)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **56** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** proposta PO-156 dopo la fase 1.

**Voci del backlog collegate:** PO-156, PO-177 (chiusa).

#### 13.7 Generazione club, rose e nomi — Team 73% [media] · PO: __%

- **Nel codice:** `CLUBS` (`src/02-club-leghe-albo.jsx:24`), `generateTeamRoster` (`src/09-audio-scout-anagrafiche.jsx:982`), `NAME_BY_NAT` (09:909)
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
| **Tetto** | 75 | max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **56** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** collaudo sul telefono; guardiano dei volumi.

**Voci del backlog collegate:** nessuna. Voce da aprire: Audio: nessun guardiano né collaudo registrato.

#### 13.9 Prestazioni — Team 42% [bassa] · PO: __%

- **Nel codice:** misura in Impostazioni (18:6184, limite 300 ms), `lib/perf-monitor.mjs` (gate)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-023); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **42** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** PO-023: misura sul telefono a fine lotto.

**Voci del backlog collegate:** PO-023.

#### 13.10 Gestione degli errori — Team 35% [media] · PO: __%

- **Nel codice:** `RootErrorBoundary` (`src/19-app-root.jsx:1018`), `MatchErrorBoundary` (`src/13-prepartita-formazioni.jsx:1623`)
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 80% (segnalazione PO aperta: PO-168); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
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
| **Tetto** | 70 | max 70% (nessun guardiano in una catena di `ci-runner.mjs`); max 75% (Resa non misurata sullo schermo (decisione PO 03/10)) |
| **Team** | **62** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** `validate-dist` e `audit-copyright` in CI; inventario licenze.

**Voci del backlog collegate:** nessuna. Voce da aprire: `validate-dist` e `audit-copyright` nella CI.

#### 13.12 Corpi, clip e gesti 3D — Team 54% → 56% [alta] · PO: __%

- **Nel codice:** corpi CGTrader e clip (src/12); copertura gesti
- **Come ci si arriva:** in highlight e cerimonie
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 60 | guanti dei portieri (PO-201 FATTO, 7.999.126); gesti per evento ancora parziali (PO-068) |
| Stabilità (20%) | 55 | PO-068, PO-061, PO-171 PARZIALI (PO-024, PO-070, PO-075 confluite in PO-068) |
| Test (15%) | 75 | `kit-061`, `via-ch38-171`, `guanti-201` in catena grafica; `gesti-copertura-96` (guardiani); `piedi-252` e altri gesti in completa |
| Coerenza (15%) | 50 | PO-171 «Via CH38 ovunque» parziale; DT-04 due modi di muovere le braccia |
| Resa (15%) | 50 | PO-061 kit «migliorabile» |
| Solidità tecnica (10%) | 40 | DT-03 rotazioni a numero |
| **Media pesata** | 56 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-061, PO-068, PO-171) |
| **Team** | **56** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** chiudere PO-068/PO-061/PO-171.

**Voci del backlog collegate:** PO-068, PO-061, PO-171, PO-201 (chiusa), PO-024 (chiusa), PO-070 (chiusa), PO-075 (chiusa).

#### 13.13 Kit grafico e tema — Team 72% → 71% [alta] · PO: __%

- **Nel codice:** `Card`, `Btn`, `Modal`, `Tabs`, `Fisarmonica` (`src/11-ui-kit-highlight.jsx`), token `TH`/`FS`/`RAD` (src/01)
- **Come ci si arriva:** ogni schermata
- **Importanza nel ramo:** 2

| Criterio | Punti | Prova |
|---|---:|---|
| Funzione (25%) | 80 | kit unico, tema chiaro/scuro; finestre in primo piano nel Modal standard |
| Stabilità (20%) | 60 | PO-066, PO-230, PO-256 DA VERIFICARE DAL PO |
| Test (15%) | 80 | `design-system` in completa e grafica, `finestra-230`, `toast-256`, `popup-224` in completa, verdi nella notte 7.999.171; `griglia-mobile` (censimento) |
| Coerenza (15%) | 70 | PO-066 |
| Resa (15%) | 70 | giro 68: Home a 412 e 360 senza titoli ripetuti (foto, vedi 3.1) |
| Solidità tecnica (10%) | 60 | — |
| **Media pesata** | 71 | peso coperto da prove: 100% |
| **Tetto** | 80 | max 80% (segnalazione PO aperta: PO-066, PO-230, PO-256) |
| **Team** | **71** | PO: __% · nota: |

**Cosa manca per arrivare al 90%:** conferma PO di PO-066/PO-230/PO-256.

**Voci del backlog collegate:** PO-066, PO-230, PO-256, PO-188 (chiusa).

## Elenchi

### 1. I 10 nodi più deboli

| # | Nodo | Team | Cosa manca |
|---:|---|---:|---|
| 1 | 13.10 Gestione degli errori | 35% | L3 Parte C (PO-168) |
| 2 | 13.9 Prestazioni | 42% | PO-023: misura sul telefono a fine lotto |
| 3 | 7.4 Stile di gioco (archetipi) | 49% | proposta PO-098 dopo la fase 1 Codex |
| 4 | 5.7 Highlight 3D dell'eroe | 50% | banco unico degli highlight (PO-248) e chiusura delle voci L1 |
| 5 | 11.2 Premiazione di squadra in campo | 50% | chiudere PO-002/137 in L8; un giro registrato della catena grafica completa |
| 6 | 3.7 Tutorial | 54% | collaudo Codex con scheda del primo avvio; uno scatto in catena grafica |
| 7 | 8.4 Trattativa del contratto | 55% | chiudere PO-270; guardiano della trattativa in catena; collaudo Codex |
| 8 | 11.3 Festa del titolo (finestra) | 55% | decidere col PO se resta accanto alle cerimonie 3D; `festa-oro-251` in una catena fissa |
| 9 | 12.4 Nuova partita+ (eredità) | 55% | collaudo Codex |
| 10 | 13.6 Crescita del giocatore e difficoltà | 56% | proposta PO-156 dopo la fase 1 |

### 2. I 10 nodi più solidi

| # | Nodo | Team | Punti per criterio (F·S·T·C·R·So) e prova del Test |
|---:|---|---:|---|
| 1 | 4.1 Classifica | 75% | F 85 · S 60 · T 85 · C 80 · R — · So 60 — tetto 75%. Test: `classifica-102` (rosso `__CPM_NO_CLASSIFICA102`) in catena carriera; `career-invariants` (standings) in `career-critical`, verdi nella notte 7.999.171 (17/10, 89/89) |
| 2 | 2.4 Offerte di fine provini | 75% | F 85 · S 85 · T 75 · C 80 · R — · So 70 — tetto 75%. Test: `calendario-offerte-195` in catena grafica, rosso `__CPM_NO_LEGA196`, verde sull'ultimo giro grafica registrato (7.999.146, 07/10) |
| 3 | 2.6 Passaggio a professionista | 75% | F 80 · S 80 · T 70 · C 75 · R — · So 60 — tetto 75%. Test: `pro-rivale-176` in catena carriera, rosso `__CPM_NO_PRO176`, verde nella notte 7.999.171 (17/10, 89/89) |
| 4 | 5.4 Formazioni | 74% | F 80 · S 80 · T 75 · C 75 · R 60 · So 60. Test: `formazioni-204` in catena grafica, rosso `__CPM_NO_FORMAZ204`, verde sull'ultimo giro grafica registrato (7.999.146, 07/10) |
| 5 | 4.2 Calendario | 73% | F 85 · S 55 · T 80 · C 80 · R — · So 60 — tetto 75%. Test: `giornata-233` in completa, `avversario-106` in carriera, verdi nella notte 7.999.171; `calendario-offerte-195` (grafica) verde sull'ultimo giro grafica registrato (7.999.146, 07/10) |
| 6 | 13.7 Generazione club, rose e nomi | 73% | F 80 · S 80 · T 60 · C 75 · R — · So 60 — tetto 75%. Test: `nomi-51` (rossi) nella catena guardiani; `audit-copyright` non in CI |
| 7 | 5.1 Scelta Gioca / Simula | 72% | F 80 · S 60 · T 85 · C 75 · R — · So 55 — tetto 75%. Test: `double-tap` in `career-critical`, `partita-rigiocata-194` (rosso `__CPM_NO_CONF194`) in catena carriera, `typing-shortcuts` in completa, verdi nella notte 7.999.171 |
| 8 | 5.3 Giorno partita e rapporto dell'osservatore | 72% | F 80 · S 70 · T 65 · C 75 · R 75 · So 60 — tetto 80%. Test: `analisi-217` in catena grafica (nessun giro grafica registrato con lui: ultimo 7.999.146); verde a 412×915 e 360×780 nel giro 68 senza modifiche al codice (riferito); `griglia-mobile` (censimento) |
| 9 | 8.2 Primo incontro col procuratore | 72% | F 80 · S 70 · T 65 · C 75 · R — · So 60 — tetto 75%. Test: `procuratore-253` in completa, verde nella notte 7.999.171; `agent-relation-test` fuori catena |
| 10 | 1.2 Menu principale e slot di salvataggio | 71% | F 85 · S 60 · T 60 · C 75 · R — · So 70 — tetto 75%. Test: `badge-255`, `toast-256`, `crediti-254` in completa, verdi nella notte 7.999.171 (STABILITA.json 17/10 04:07); `griglia-mobile` (catena grafica) misura `home` senza soglia; `chip-269` solo nella catena mirata |

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
| 8.4 Trattativa del contratto | 55% | chiudere PO-270; guardiano della trattativa in catena; collaudo Codex |
| 10.2 Esito dell'intervista | 60% | guardiano |
| 10.3 Relazioni: spogliatoio, rivale, stampa | 61% | fase 1 Codex con metriche sulle relazioni |
| 11.3 Festa del titolo (finestra) | 55% | decidere col PO se resta accanto alle cerimonie 3D; `festa-oro-251` in una catena fissa |
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
| 1.1 Caricamento e ripresa automatica | 67% | PO-167, PO-176 (chiusa) · voce da aprire n. 1 |
| 1.2 Menu principale e slot di salvataggio | 71% | PO-255, PO-269 |
| 1.3 Impostazioni | 67% | PO-072 · voce da aprire n. 2 |
| 1.4 Importa ed esporta salvataggio | 59% | PO-167 · voce da aprire n. 3 |
| 1.6 Crediti | 70% | PO-254, PO-267, PO-268 |
| 1.7 Copia di riserva dello slot | 68% | PO-167 |
| 2.1 Creazione del giocatore | 69% | voce da aprire n. 4 |
| 2.2 Filmato introduttivo | 65% | voce da aprire n. 5 |
| 2.3 Provini (tre partite) | 65% | voce da aprire n. 6 |
| 2.4 Offerte di fine provini | 75% | PO-196 (chiusa) · voce da aprire n. 7 |
| 2.5 Stagioni Primavera (Under 18) | 64% | PO-192 (chiusa), PO-194 (chiusa), PO-153 |
| 2.6 Passaggio a professionista | 75% | PO-176 (chiusa) · voce da aprire n. 8 |
| 3.1 Home (cruscotto) | 70% | PO-066, PO-224 |
| 3.2 Pulsante principale e avanzamento della settimana | 66% | PO-183 (chiusa), PO-153 |
| 3.3 Vivi la settimana ed eventi settimanali | 64% | PO-154, PO-153 |
| 3.4 Momenti di carriera | 61% | PO-154 |
| 3.5 Il mister: verifica mensile e dialoghi | 64% | voce da aprire n. 9 |
| 3.6 Interazioni d'apertura stagione | 69% | voce da aprire n. 10 |
| 3.7 Tutorial | 54% | voce da aprire n. 11 |
| 3.9 Finestre in primo piano della Home | 66% | PO-224, PO-230 |
| 4.1 Classifica | 75% | PO-153 |
| 4.2 Calendario | 73% | PO-233 |
| 4.3 Coppe (nazionale, europee, tornei) | 66% | PO-153 |
| 4.4 Sorteggi dei gironi europei | 69% | voce da aprire n. 12 |
| 4.5 Ritiro pre-campionato | 66% | voce da aprire n. 13 |
| 5.1 Scelta Gioca / Simula | 72% | PO-183 (chiusa) · voce da aprire n. 14 |
| 5.2 Conferenza pre-partita e discorso del mister | 67% | PO-192 (chiusa), PO-194 (chiusa) · voce da aprire n. 15 |
| 5.3 Giorno partita e rapporto dell'osservatore | 72% | PO-217 |
| 5.4 Formazioni | 74% | PO-204 (chiusa) · voce da aprire n. 16 |
| 5.5 Ingresso in campo (3D) | 63% | PO-245, PO-206 (chiusa), PO-188 (chiusa), PO-197 (chiusa) |
| 5.6 Partita 2D | 59% | PO-207, PO-266, PO-226, PO-234, PO-246, PO-259, PO-021 (chiusa), PO-031 (chiusa) |
| 5.7 Highlight 3D dell'eroe | 50% | PO-123, PO-068, PO-143, PO-218, PO-220, PO-229, PO-240, PO-242, PO-248, PO-250, PO-252, PO-257, PO-258, PO-260, PO-261, PO-271, PO-033 (chiusa), PO-048 (chiusa), PO-094 (chiusa), PO-120 (chiusa), PO-185 (chiusa) |
| 5.8 Rigori di fine gara | 64% | voce da aprire n. 17 |
| 5.9 Fine gara: riepilogo, pagelle e tabellino | 66% | PO-209, PO-228 |
| 5.10 Festa di fine partita | 60% | PO-203 (chiusa), PO-048 (chiusa) · voce da aprire n. 18 |
| 5.11 Rassegna stampa post-partita | 64% | PO-244 |
| 5.12 Simula: la partita dell'eroe senza giocarla | 66% | PO-190, PO-222, PO-263, PO-202 (chiusa), PO-021 (chiusa) |
| 6.1 Scheda Club | 65% | voce da aprire n. 19 |
| 6.2 Presentazione al nuovo club | 59% | voce da aprire n. 20 |
| 6.3 Numero di maglia | 61% | voce da aprire n. 21 |
| 7.1 Profilo | 59% | PO-066 |
| 7.2 Diario sfogliabile | 62% | voce da aprire n. 22 |
| 7.3 Traguardi (milestone e achievement) | 64% | voce da aprire n. 23 |
| 7.4 Stile di gioco (archetipi) | 49% | PO-098, PO-153 |
| 8.1 Agente (procuratore, mercato, contratto, cessione, prestito) | 63% | PO-153 |
| 8.2 Primo incontro col procuratore | 72% | PO-253 |
| 8.3 Offerta di trasferimento e rifiuto | 67% | voce da aprire n. 24 |
| 8.4 Trattativa del contratto | 55% | PO-270 · voce da aprire n. 25 |
| 8.5 Ufficio (patrimonio, staff privato, investimenti) | 58% | PO-157, PO-223, PO-265, PO-014 (chiusa) |
| 9.1 Scheda Nazionale | 57% | PO-155, PO-177 (chiusa), PO-066 |
| 9.2 Convocazione e partita in Nazionale | 64% | PO-155, PO-235, PO-243, PO-177 (chiusa) |
| 9.3 Tornei per nazionali (Coppa delle Nazioni, Europeo, Mondiale) | 64% | PO-155, PO-183 (chiusa) |
| 10.1 Intervista post-partita (3D) | 67% | PO-243 |
| 10.2 Esito dell'intervista | 60% | voce da aprire n. 26 |
| 10.3 Relazioni: spogliatoio, rivale, stampa | 61% | PO-154 |
| 11.1 Serata di presentazione della squadra | 68% | PO-137, PO-171 |
| 11.2 Premiazione di squadra in campo | 50% | PO-002, PO-137, PO-150 (chiusa), PO-071 |
| 11.3 Festa del titolo (finestra) | 55% | PO-251 |
| 11.4 Galà dei premi | 61% | PO-137, PO-199 (chiusa) · voce da aprire n. 27 |
| 11.5 Podio della stagione | 59% | voce da aprire n. 28 |
| 11.6 Parata del pullman | 64% | PO-137 |
| 11.7 Stadi 3D | 61% | PO-071 |
| 12.1 Fine stagione | 65% | PO-153 |
| 12.2 Annuncio del ritiro e stagione d'addio | 68% | voce da aprire n. 29 |
| 12.3 Fine carriera | 64% | voce da aprire n. 30 |
| 12.4 Nuova partita+ (eredità) | 55% | voce da aprire n. 31 |
| 13.1 Motore della partita (brain) | 60% | PO-022, PO-190, PO-228, PO-262, PO-202 (chiusa), PO-021 (chiusa), PO-030 (chiusa), PO-031 (chiusa), PO-064 (chiusa) |
| 13.2 Simulazione delle altre partite e classifiche | 70% | PO-153, PO-264 |
| 13.3 Salvataggi e migrazioni | 67% | PO-167, PO-183 (chiusa), PO-176 (chiusa) |
| 13.4 Calendario e competizioni (generazione) | 69% | PO-153, PO-183 (chiusa) |
| 13.5 Mercato e contratti | 63% | PO-153, PO-157 |
| 13.6 Crescita del giocatore e difficoltà | 56% | PO-156, PO-177 (chiusa) |
| 13.7 Generazione club, rose e nomi | 73% | voce da aprire n. 32 |
| 13.8 Audio | 56% | voce da aprire n. 33 |
| 13.9 Prestazioni | 42% | PO-023 |
| 13.10 Gestione degli errori | 35% | PO-168 |
| 13.11 Build web e store | 62% | voce da aprire n. 34 |
| 13.12 Corpi, clip e gesti 3D | 56% | PO-068, PO-061, PO-171, PO-201 (chiusa), PO-024 (chiusa), PO-070 (chiusa), PO-075 (chiusa) |
| 13.13 Kit grafico e tema | 71% | PO-066, PO-230, PO-256, PO-188 (chiusa) |

### Voci da aprire (in attesa del PO)

Non scritte in `BACKLOG.md`: le apre il PO o le autorizza.

1. **Guardiano dell'auto-ripresa reale (oggi spenta sotto `cpmtest=1`)** — nodo 1.1.
2. **Strumenti di collaudo visibili nelle Impostazioni del giocatore (DT-08)** — nodo 1.3.
3. **Guardiano di import/export del salvataggio** — nodo 1.4.
4. **Guardiano nuova carriera: creazione → provini → offerte → prima partita** — nodo 2.1.
5. **Consolidamento di «Filmato introduttivo»: uno scatto di controllo in catena grafica** — nodo 2.2.
6. **Guardiano dei provini con ripresa a metà** — nodo 2.3.
7. **Consolidamento di «Offerte di fine provini»: collaudo PO della 7.999.114 sul telefono** — nodo 2.4.
8. **Consolidamento di «Passaggio a professionista»: collaudo PO di un passaggio a professionista sul telefono** — nodo 2.6.
9. **Consolidamento di «Il mister: verifica mensile e dialoghi»: guardiano in catena e collaudo dei testi** — nodo 3.5.
10. **Consolidamento di «Interazioni d'apertura stagione»: rimettere `home-opening-test` in una catena** — nodo 3.6.
11. **Tutorial: nessuna verifica (né guardiano né collaudo)** — nodo 3.7.
12. **Consolidamento di «Sorteggi dei gironi europei»: uno scatto della finestra in catena grafica** — nodo 4.4.
13. **Consolidamento di «Ritiro pre-campionato»: guardiano del racconto e della scelta** — nodo 4.5.
14. **Consolidamento di «Scelta Gioca / Simula»: collaudo PO sul telefono del ciclo Gioca/Simula** — nodo 5.1.
15. **Consolidamento di «Conferenza pre-partita e discorso del mister»: collaudo PO di una gara di cartello** — nodo 5.2.
16. **Consolidamento di «Formazioni»: foto di controllo sul telefono dopo la 7.999.126** — nodo 5.4.
17. **Consolidamento di «Rigori di fine gara»: `rigori-58` in una catena** — nodo 5.8.
18. **Consolidamento di «Festa di fine partita»: un guardiano della festa in catena** — nodo 5.10.
19. **Consolidamento di «Scheda Club»: guardiano dei dati del club (rosa, staff, bacheca)** — nodo 6.1.
20. **Presentazione al nuovo club: nessuna verifica** — nodo 6.2.
21. **Consolidamento di «Numero di maglia»: guardiano della scelta** — nodo 6.3.
22. **Consolidamento di «Diario sfogliabile»: uno scatto in catena grafica** — nodo 7.2.
23. **Consolidamento di «Traguardi (milestone e achievement)»: guardiano dello scatto dei traguardi** — nodo 7.3.
24. **Consolidamento di «Offerta di trasferimento e rifiuto»: `decisioni-50` in catena** — nodo 8.3.
25. **Trattativa del contratto: nessun guardiano in catena fissa** — nodo 8.4.
26. **Consolidamento di «Esito dell'intervista»: guardiano** — nodo 10.2.
27. **Guardiano `gala-3d` obsoleto (verifica la busta diretta, superata il 03/10)** — nodo 11.4.
28. **Consolidamento di «Podio della stagione»: scatto in catena grafica** — nodo 11.5.
29. **Consolidamento di «Annuncio del ritiro e stagione d'addio»: `retire-announce-test` in catena** — nodo 12.2.
30. **Fine carriera: nessun guardiano del flusso fino al ritiro** — nodo 12.3.
31. **Consolidamento di «Nuova partita+ (eredità)»: collaudo Codex** — nodo 12.4.
32. **Consolidamento di «Generazione club, rose e nomi»: `audit-copyright` in CI prima dello store** — nodo 13.7.
33. **Audio: nessun guardiano né collaudo registrato** — nodo 13.8.
34. **`validate-dist` e `audit-copyright` nella CI** — nodo 13.11.
35. **Catena `guardiani` senza alcun giro in `STABILITA.json` (68 giri registrati: completa, carriera, notte, mirata, grafica); catena `grafica` registrata l'ultima volta sulla 7.999.146 (07/10): `home-066`, `analisi-217`, `kit-061`, `stadi-071`, `cerimonie`, `scene-fuori-137`, `passaggio-coppa-137` non hanno mai un giro registrato** — trasversale.
36. **BACKLOG.md: PO-268 risulta APERTO ma il codice toglie già numero d'ordine e data dai Crediti (`src/17-menu-creazione-pannelli.jsx:154`, rosso `__CPM_NO_CRED268`)** — trasversale.
37. **PO-262: `match-sequence` (determinismo) ROSSO e fuori da ogni catena** — trasversale.
38. **(storico, 7.999.126) Giro grafico 7.999.126: `rimbalzo-189`, `premiazione-palco-191`, `coppa-mani-191` rossi per campioni insufficienti (4 disegni su 8 richiesti, 11 campioni su 20, 2 su 10: `const ok` dei tre guardiani) — da ripetere su macchina scarica e rendere i guardiani robusti al carico; `walkout-fermi-197` rosso invece sulla misura (verde: somma 10 contro un massimo di 5,3 = un terzo del rosso 16), coerente con PO-206** — trasversale.
39. **Componenti definiti e mai montati: `AIDecisionOverlay` (src/13:523), `Player3DViewer` (src/01:740), `AISettingsCard` (src/17:713)** — trasversale.
40. **(storico, risolto) BACKLOG.md: PO-201 e PO-204 risultavano «DA FARE»; oggi sono FATTO nello storico** — trasversale.

## Autocritica

**Rami che sembravano «a posto» e che la griglia mostra non esserlo.**
- *Stagione e ciclo settimanale (aggiornato 7.999.173).* Il salto del ramo 3 e dei nodi 5.1, 9.3, 13.3 viene quasi tutto dalla chiusura di PO-183 (bloccante) e PO-176 col collaudo Codex del 07/10: cadono tre tetti del 50%. Ma la «partita già giocata» resta alla nona ricorrenza documentata (07:126): verde dei guardiani ≠ stabile, i guardiani coprono i casi già visti.
- *Highlight (5.7).* Fermo al 50%: 17 voci del 03/10 sono uscite dal BACKLOG come DOPPIONE (05-06/10), non come risolte, e ne sono entrate 16 nuove (PO-218…PO-271). Il numero di voci chiuse non misura il nodo.
- *Resa del giro 68.* Home (3.1), analisi pre-partita (5.3) e Crediti (1.6) hanno ora una Resa con foto e guardiano, ma è una misura del team: nessuno dei tre è confermato dal PO (voci DA VERIFICARE), quindi il tetto dell'80% resta.
- *Cerimonie.* Molte release recenti (7.999.116-125) le hanno «chiuse», ma ogni chiusura è una correzione di un rilievo del PO sulla stessa scena; due guardiani su quattro della premiazione sono rossi sull'ultimo giro (per pochi campioni: la correzione non è smentita, ma nemmeno confermata) e `gala-3d` verifica un comportamento ormai superato.
- *Percorso iniziale.* Funziona e nessuno lo segnala, ma creazione, provini e auto-ripresa non hanno un guardiano in catena e la ripresa è spenta proprio sotto `cpmtest=1`: è «a posto» perché nessuno lo guarda.
- *Club, Carriera, Agente/Ufficio.* Le schede sono misurate solo dal censimento `griglia-mobile`, che non può diventare rosso: i valori di Test sono bassi e il tetto 70% vale quasi ovunque.

**Dove la stima dipende solo dal giudizio e potrebbe essere ottimista.**
- *Funzione* delle linguette (Club, Profilo, Agente, Ufficio, Nazionale): letta dal codice, non navigata. Una sezione può esistere nel codice ed essere vuota o rotta a schermo.
- *Resa esclusa* dove manca una prova (con tetto 75%): 63 nodi su 80 la hanno senza punteggio e la loro media si calcola sugli altri criteri. Se la Resa reale fosse bassa i valori scenderebbero (vedi correzione 1).
- *Stabilità «nessuna voce aperta» = 75-85*: l'assenza di segnalazioni su nodi rari (Tutorial, Nuova partita+, Fine carriera, Trattativa) può voler dire solo che il PO non ci è ancora arrivato.
- *Solidità*: giudizio sul file unico, non una metrica per nodo.
- *Pesi d'importanza*: scelti dal team; con pesi diversi i rami cambiano di qualche punto.

