# EVAL_LIVE_MATCH_3D.md — Griglia di valutazione del live match 3D

> **Scopo:** definire in modo condiviso e ripetibile *cosa* rende "accettabile" il live match 3D, così che il **blocco 1.0** (refactor qualità — animazioni + regia/camera) abbia una **condizione di uscita chiara** e non resti "a tempo aperto".
> **Chi compila:** il **Product Owner** (collaudo dal vivo) + l'**AI Vision** (2° livello, indicativo). Il giudizio finale di "accettabile" è del PO.
> **Quando:** baseline ora (stato attuale), poi ad ogni checkpoint del blocco 1.0.
> **Fase:** strumento di analisi/QA — non modifica il codice.

---

## 1. Come si usa

1. Si gioca/registra un campione di **highlight rappresentativi** (vedi §5: lista campione per coprire tutte le varianti).
2. Per ogni **voce** della griglia si assegna un punteggio **1–5** (scala §2) e si annotano i **difetti osservati** (checklist §3/§4 come promemoria).
3. Si calcola la **media per dimensione** (Animazioni, Regia/Camera) e si verifica la **condizione di uscita** (§6).
4. Si confronta col punteggio **AI Vision** corrispondente (mappatura §7) — se divergono molto, vince **l'occhio del PO**.

> **Regola d'oro:** un singolo **difetto bloccante** (voce a punteggio 1, "rompe l'immersione/illeggibile") impedisce l'accettazione anche se le medie sono alte.

---

## 2. Scala di valutazione (1–5)

| Voto | Etichetta | Significato |
|---|---|---|
| **1** | 🔴 Inaccettabile | Rompe l'immersione o rende l'azione illeggibile. Difetto bloccante. |
| **2** | 🟠 Scarso | Difetti evidenti e frequenti; "sembra un prototipo". |
| **3** | 🟡 Sufficiente | Funzionale e leggibile, ma chiaramente artificiale/rigido. |
| **4** | 🟢 Buono | Credibile; difetti minori solo occasionali. |
| **5** | ⭐ Eccellente | Livello "broadcast"/AAA; nessun difetto percepibile. |

**Stato di partenza dichiarato (loro metriche AI Vision):** `animationQuality ~40-55` ≈ voto **2–3**; `cameraQuality ~50-65` ≈ voto **3**.

---

## 3. SEZIONE A — Animazioni

Per ogni sotto-dimensione: punteggio 1–5 + difetti osservati. La colonna "Difetti tipici da cercare" è un promemoria, non una lista esaustiva.

| # | Sotto-dimensione | Cosa valutare | Difetti tipici da cercare | Voto | Note |
|---|---|---|---|---|---|
| A1 | **Locomozione (corsa/camminata/idle)** | Naturalezza del movimento base dei 22 giocatori | Scivolamento ("ice-skating"/glide), piedi che slittano sul terreno, cadenza passo irreale, T-pose residue | ☐ | |
| A2 | **Transizioni di stato** | Passaggio fermo↔corsa, accelera/decelera, cambio direzione | Snap/scatti istantanei, "pop" tra pose, crossfade troppo brusco o troppo molle | ☐ | |
| A3 | **Animazioni eroe — tiro/volée** | Caricamento (wind-up), swing, follow-through | Gamba che parte senza caricare, contatto palla non sincrono, posa che si congela | ☐ | |
| A4 | **Animazioni eroe — cross/punizione/rigore** | Rincorsa, colpo, recupero | Movimento identico al tiro, niente differenza percepibile tra varianti | ☐ | |
| A5 | **Animazioni eroe — colpo di testa/stacco** | Stacco, impatto aereo | Stacco senza salto credibile, testa che colpisce palla a terra (invariante CINE), timing impatto | ☐ | |
| A6 | **Animazioni eroe — contrasto/dribbling/passaggio** | Tackle, finta, tocco | Contrasto senza contatto, dribbling rigido, passaggio senza gesto di gamba | ☐ | |
| A7 | **Interazione con la palla** | Sincronia gesto↔palla | Palla che parte prima/dopo il contatto, piede che attraversa la palla, niente "peso" | ☐ | |
| A8 | **Off-ball / comportamento squadra** | Movimento dei 21 non-portatori | Ammucchiamenti, giocatori statici/legnosi, smarcamenti innaturali, marcature finte | ☐ | |
| A9 | **Portiere** | Tuffi, uscite, parate | GK fuori dai bound, tuffo senza anticipo, parata non agganciata al tiro | ☐ | |
| A10 | **Reazioni / esultanze** | Gol, parata, delusione, folla | Esultanza del lato sbagliato (fix 5.45), reazioni assenti/identiche | ☐ | |
| A11 | **Posa & silhouette** | Proporzioni e posa a riposo | Corpo "a pera"/tozzo, proporzioni innaturali, posa a riposo rigida | ☐ | |
| A12 | **Varietà** | Ripetitività percepita | Tutte le azioni identiche, nessuna micro-variazione, effetto "robot" | ☐ | |
| | **MEDIA ANIMAZIONI** | | | **☐** | |

---

## 4. SEZIONE B — Regia / Camera

| # | Sotto-dimensione | Cosa valutare | Difetti tipici da cercare | Voto | Note |
|---|---|---|---|---|---|
| B1 | **Framing (inquadratura)** | Soggetto dell'azione (eroe + palla) ben inquadrato | Hero o palla fuori campo nei momenti chiave, soggetto decentrato/perso | ☐ | |
| B2 | **Tracking (inseguimento)** | La camera segue l'azione | Camera che resta indietro/avanti, perde il portatore, scatta per "rincorrere" | ☐ | |
| B3 | **Distanza / zoom** | Adeguata al momento | Troppo larga sul tiro (illeggibile) o troppo stretta sul build-up (senza contesto) | ☐ | |
| B4 | **Stabilità** | Movimento di camera fluido | Jitter, micro-scatti, oscillazioni, "camera ubriaca" | ☐ | |
| B5 | **Angolazione / leggibilità profondità** | Si capisce direzione di gioco e spazio | Angolo che appiattisce l'azione, direzione d'attacco ambigua | ☐ | |
| B6 | **Stacchi / transizioni di fase** | Tagli tra intro→move→choose→result→ripresa | Tagli bruschi, frame neri, salti di posizione, transizioni confuse | ☐ | |
| B7 | **Drammatizzazione** | I momenti clou (gol, parata, rigore) sono enfatizzati | Gol uguale a un passaggio qualsiasi, nessun "momento", zero tensione | ☐ | |
| B8 | **Coerenza col tipo di azione** | La regia cambia per pattern (tiro vs cross vs build) | Stessa inquadratura per tutto, niente regia "per situazione" | ☐ | |
| | **MEDIA REGIA/CAMERA** | | | **☐** | |

---

## 5. Campione di highlight da valutare (copertura varianti)

Per non giudicare su un caso fortunato, valutare **almeno un highlight per ciascuna famiglia** (le varianti eroe esistenti):

- ☐ **Tiro** (in porta / parato / palo)
- ☐ **Volée / tiro aereo**
- ☐ **Cross** (→ stacco compagno)
- ☐ **Colpo di testa / stacco**
- ☐ **Rigore**
- ☐ **Punizione**
- ☐ **Contrasto / tackle** (difensivo)
- ☐ **Dribbling**
- ☐ **Passaggio / uno-due / filtrante**
- ☐ **Costruzione (build-up)**
- ☐ **Azione in zona alta vs bassa** (per testare la camera su zone diverse del campo)
- ☐ **Un gol completo** (azione → rete → esultanza → ripresa dal centro)

> Suggerimento: registrare i campioni con il **determinismo di test** (`?cpmtest=1`) per poterli **riconfrontare identici** prima/dopo ogni step del refactor.

---

## 6. Condizione di uscita del blocco 1.0 (da confermare col PO)

Il blocco 1.0 si considera **chiuso** quando — sul campione §5 — sono **tutte** vere:

- ☐ **Media Animazioni ≥ [TARGET]** (proposta TD: **≥ 4,0**)
- ☐ **Media Regia/Camera ≥ [TARGET]** (proposta TD: **≥ 4,0**)
- ☐ **Nessuna voce a punteggio 1** (zero difetti bloccanti)
- ☐ **Massimo N voci a punteggio 2** (proposta TD: **0–2**, da decidere)
- ☐ **Il PO dichiara "accettabile"** dal vivo (giudizio finale, sovraordinato ai numeri)
- ☐ **Gate 12/12 + 3 baseline verdi** (lo *stato* non è regredito anche se la *resa* è cambiata)
- ☐ **(Opz.) AI Vision** `animationQuality` e `cameraQuality` ≥ [TARGET] (proposta TD: **≥ 70**)

> ⚠️ I **[TARGET]** sopra sono **proposte** del Technical Director: vanno **confermati o modificati dal Product Owner**. È questo il numero che trasforma il blocco da "a tempo aperto" a "chiudibile".

---

## 7. Mappatura con AI Vision (2° livello, indicativo)

| Dimensione griglia | Metrica AI Vision | Baseline dichiarata | Target proposto |
|---|---|---|---|
| Sezione A (Animazioni) | `animationQuality` | ~40–55 | ≥ 70 |
| Sezione B (Regia/Camera) | `cameraQuality` | ~50–65 | ≥ 70 |
| (Contesto) riconoscimento azione | `situation-recognition` | operativo | — |

**Uso:** l'AI Vision dà un segnale **continuo e ripetibile** tra build (utile per trend e per scovare regressioni percettive), ma **non blocca** e può avere rumore. In caso di divergenza, **prevale il collaudo del PO**.

---

## 8. Scheda di valutazione (template compilabile)

```
=== EVAL LIVE MATCH 3D — build: __________  data: __________  valutatore: __________ ===

ANIMAZIONI                         Voto(1-5)   Difetti / note
A1  Locomozione                      [   ]      __________________________
A2  Transizioni di stato             [   ]      __________________________
A3  Tiro/volée                       [   ]      __________________________
A4  Cross/punizione/rigore           [   ]      __________________________
A5  Testa/stacco                     [   ]      __________________________
A6  Contrasto/dribbling/passaggio    [   ]      __________________________
A7  Interazione con la palla         [   ]      __________________________
A8  Off-ball / squadra               [   ]      __________________________
A9  Portiere                         [   ]      __________________________
A10 Reazioni / esultanze             [   ]      __________________________
A11 Posa & silhouette                [   ]      __________________________
A12 Varietà                          [   ]      __________________________
                          MEDIA A =  [   ]

REGIA / CAMERA                     Voto(1-5)   Difetti / note
B1  Framing                          [   ]      __________________________
B2  Tracking                         [   ]      __________________________
B3  Distanza / zoom                  [   ]      __________________________
B4  Stabilità                        [   ]      __________________________
B5  Angolazione / profondità         [   ]      __________________________
B6  Stacchi / transizioni            [   ]      __________________________
B7  Drammatizzazione                 [   ]      __________________________
B8  Coerenza col tipo di azione      [   ]      __________________________
                          MEDIA B =  [   ]

DIFETTI BLOCCANTI (voto 1): _______________________________________________
TOP 3 PRIORITÀ DA SISTEMARE:  1) ______  2) ______  3) ______
VERDETTO PO:  [ ] Accettabile   [ ] Non ancora   Soglia usata: A≥__ B≥__
AI Vision:  animationQuality=___  cameraQuality=___
```

---

## 9. Prossimo passo

Quando usciamo dalla fase di sola analisi:
1. **Il PO compila una baseline** con questa griglia sullo stato attuale (5.45.2) → fotografa i difetti reali e le priorità.
2. **Il PO conferma i [TARGET]** della §6 (le soglie di accettazione).
3. Da lì il blocco 1.0 procede a **step ≤300 righe**, ricompilando questa scheda ad ogni checkpoint, fino a "Accettabile".
