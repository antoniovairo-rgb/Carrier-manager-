# EVAL_LIVE_MATCH_3D.md — v2.0
## Framework ufficiale di valutazione qualitativa del Live Match 3D

> **Stato:** documento di riferimento **ufficiale** per tutto il refactoring del motore 3D (blocco 1.0 e oltre).
> **North-star:** non un motore *funzionante*, ma un motore che — guardando gli highlight — trasmetta una **qualità percepita vicina a un videogioco calcistico moderno** (FIFA/EA FC, eFootball, UFL).
> **Regola:** strumento di analisi/QA. **Non modifica il codice. Non implementa nulla.**
> **Compila:** il **Product Owner** (collaudo dal vivo, giudizio finale) + l'**AI Vision** (2° livello, indicativo).

---

## 0. Changelog v1 → v2

| Cambiamento | Motivo |
|---|---|
| **Target di uscita innalzati** (Anim ≥4,4 · Camera ≥4,5 · niente voti 1 **e** 2 · AI Vision ≥85/85) | Allineare la soglia all'obiettivo "videogioco moderno", non "funzionante" |
| **Nuova SEZIONE C — Coinvolgimento Emotivo** (media separata, north-star) | L'emozione è l'**obiettivo**, non un dettaglio: va misurata esplicitamente |
| **3 nuove dimensioni tecniche:** Fisica & Interazione Palla · IA & Off-ball (formalizzata) · Atmosfera (folla/luci/audio) · Replay & Transizioni | Coprire i buchi della v1 (timing, fisica, collisioni, sincronizzazione, illuminazione, replay, audio) |
| **Indice di Qualità Percepita (IQP)** con **pesi** | Da checklist piatta a punteggio composito professionale |
| **Ranking tecnico delle aree** (priorità 1-10 + difficoltà + impatto immersione) | Guidare l'ordine del refactoring per ROI percettivo |
| **Milestone a stadi (M1/M2/M3)** | Evitare il "tutto o niente": progresso misurabile verso il target finale |
| **Nota sul "soffitto di realismo"** (personaggi procedurali vs GLB skinnato) | Onestà tecnica: alcuni target richiedono investimento su asset/struttura |

---

## 1. Filosofia & criterio guida

Un highlight è convincente quando **tre cose** accadono insieme:
1. **Il momento del contatto palla è credibile** (l'occhio è lì → è il giudice più severo).
2. **La camera lo racconta** come lo racconterebbe una regia TV.
3. **L'insieme genera un'emozione** (tensione, sorpresa, voglia di rivedere).

Da qui la struttura: **6 dimensioni tecniche pesate** (il *come*) + **1 sezione di Coinvolgimento Emotivo** (il *perché*, north-star a media separata). Il motore è "realmente convincente" quando **entrambe** superano le soglie — non basta una.

---

## 2. Indice di Qualità Percepita (IQP) — dimensioni e pesi

Le **6 dimensioni tecniche** producono un punteggio composito pesato. Il **Coinvolgimento Emotivo (Sezione C)** è **separato**: agisce da *gate* (north-star), non è diluito in una percentuale.

| Cod. | Dimensione | Peso IQP | Razionale del peso |
|---|---|---|---|
| **D1** | **Interazione Palla & Fisica** | **18%** | È il singolo maggior *immersion-breaker*: se la palla parte prima del contatto o il piede l'attraversa, crolla tutto il resto. Priorità tecnica #1. |
| **D2** | **Animazioni (Hero + locomozione + transizioni + posa)** | **30%** | In primo piano durante l'highlight; l'occhio è sull'eroe. Il peso più alto perché è ciò che si guarda di più. |
| **D3** | **Camera & Regia** | **24%** | È la "lente": una buona regia nobilita anche animazioni discrete; una cattiva camera rovina ottime animazioni. (Target di soglia il più alto del blocco.) |
| **D4** | **IA & Movimenti Off-ball** | **12%** | Riempie il campo di vita tattica credibile; gli ammucchiamenti rompono l'illusione. Sfondo, non focus → peso medio. |
| **D5** | **Atmosfera (reazioni · folla · luci · audio contestuale)** | **10%** | Vende l'emozione del momento e il "vivo"; l'audio (oggi assente) ha un impatto percettivo enorme. |
| **D6** | **Replay & Transizioni** | **6%** | Linguaggio "broadcast" (instant replay, slow-mo, tagli puliti). Alto valore percepito, ma non blocca il *gioco*. |
| | **Totale tecnico** | **100%** | → **IQP** |
| **C** | **Coinvolgimento Emotivo** | *separato (gate)* | North-star. Media a sé. **Deve** superare la soglia indipendentemente dall'IQP. |

> **Perché Coinvolgimento è un *gate* e non un 10%** *(miglioria sull'esempio proposto):* è la conseguenza emergente delle 6 dimensioni, non un loro pari grado. Diluirlo al 10% permetterebbe a un motore tecnicamente passabile ma **emotivamente piatto** di "passare". Tenendolo separato, obblighiamo l'esperienza ad essere *sentita*, non solo corretta. *(Alternativa, se il PO preferisce un singolo numero: includere C al 10–15% e riproporzionare le tecniche — sconsigliata.)*

> **Nota sul peso Fisica 18% vs esempio 15%:** alzato perché in un calcistico moderno il contatto piede-palla è il dettaglio che il cervello usa per giudicare "vero/finto" → merita più dei 15% indicativi.

---

## 3. TARGET BLOCCO 1.0 (criteri di uscita ufficiali)

Il blocco 1.0 è **chiuso** quando, sul campione rappresentativo (§9), sono **tutte** vere:

| Criterio | Soglia v2.0 | Note |
|---|---|---|
| **Media Animazioni (D2)** | **≥ 4,4 / 5** | — |
| **Media Camera & Regia (D3)** | **≥ 4,5 / 5** | Soglia più alta: la regia "fa" la qualità percepita |
| **Media Interazione Palla & Fisica (D1)** | **≥ 4,3 / 5** *(proposta TD aggiunta)* | Coerente con la priorità #1; era scoperta dai target dati |
| **Media Coinvolgimento Emotivo (C)** | **≥ 4,2 / 5** *(proposta TD aggiunta)* | Il north-star ha bisogno di una sua soglia, altrimenti non è un gate |
| **Nessuna voce con voto 1** | obbligatorio | Difetto bloccante |
| **Nessuna voce con voto 2** | obbligatorio | Ogni sotto-voce ≥ 3 |
| **AI Vision — animationQuality** | **≥ 85** | Da baseline ~40-55 |
| **AI Vision — cameraQuality** | **≥ 85** | Da baseline ~50-65 |
| **IQP composito (D1–D6 pesato)** | **≥ 4,4 / 5** *(proposta TD)* | Sintesi unica per i checkpoint |
| **Verdetto PO dal vivo** | "Accettabile" | Sovraordinato ai numeri |
| **Gate 12/12 + 3 baseline** | verdi | Lo *stato* non regredisce anche se la *resa* cambia |

### 3.1 — Argomentazione delle soglie (sono giuste?)

**Sono ambiziose, e intenzionalmente.** Osservazioni da Technical Director:

- **"Nessun voto 1 *e* 2"** è una barra molto severa: impone che **ogni singola sotto-voce sia ≥ 3** *e* che le medie siano 4,4–4,5 → la maggioranza delle voci deve stare a **4–5**. È il livello giusto per "videogioco moderno", ma significa che **basta una voce a 2 per non chiudere**. Corretto come **accettazione finale**; per non bloccarsi durante il lavoro, vedi le **milestone a stadi** (§3.2).
- **AI Vision 85** è un salto grande dalla baseline (40-55 / 50-65). È raggiungibile, ma **probabilmente non con i soli personaggi procedurali attuali**: vedi §13 (soffitto di realismo). Va trattato come **indicatore con rumore**, non come gate rigido — il giudice resta il PO.
- **Soglie aggiunte (D1, C, IQP):** i target dati coprivano solo Animazioni e Camera. Ho aggiunto soglie per **Interazione Palla**, **Coinvolgimento** e **IQP composito**, altrimenti la priorità tecnica #1 e il north-star resterebbero *non misurati* nel criterio di uscita — un buco logico.

### 3.2 — Milestone a stadi (per progredire senza "tutto o niente")

| Milestone | Soglia | Significato |
|---|---|---|
| **M1 — "Non rotto"** | Nessun voto 1 · medie ≥ 3,5 | Eliminati i difetti che rompono l'immersione |
| **M2 — "Solido"** | Nessun voto 1 · max 2 voti=2 · medie ≥ 4,0 · AI Vision ≥ 75 | Credibile, difetti minori residui |
| **M3 — "Convincente" (target 1.0)** | Criteri §3 completi | Qualità da videogioco moderno |

---

## 4. Scala di valutazione (1–5) con ancore

| Voto | Etichetta | Ancora descrittiva (cosa vedo) |
|---|---|---|
| **1** | 🔴 Inaccettabile | Rompe l'immersione o rende l'azione **illeggibile**. Difetto **bloccante**. |
| **2** | 🟠 Scarso | Difetti **evidenti e frequenti**; "sembra un prototipo". |
| **3** | 🟡 Sufficiente | **Leggibile e funzionale**, ma **chiaramente artificiale/rigido**. |
| **4** | 🟢 Buono | **Credibile**; difetti minori solo **occasionali**. |
| **5** | ⭐ Eccellente | Livello **broadcast/AAA**; nessun difetto percepibile. |

> Per ridurre la soggettività: ogni voto va accompagnato da **almeno un difetto annotato** (o "nessuno" per il 5). Due valutatori sulla stessa clip non dovrebbero divergere di più di **1 punto**; se accade, si rivede l'ancora.

---

## 5. Ranking tecnico delle aree (ordine del refactoring per ROI percettivo)

Per ogni area: **perché** influenza la qualità percepita · **impatto immersione** · **difficoltà tecnica** · **priorità assoluta (1-10)**.

| # | Area | Perché conta | Impatto immersione | Difficoltà | Priorità |
|---|---|---|---|---|---|
| 1 | **Interazione giocatore-palla** | Il contatto piede-palla è il dettaglio su cui il cervello decide "vero vs finto". È il punto di massima attenzione dello spettatore. | **Massimo** | **Alta** (sync animazione↔fisica palla, timing contatto, idealmente IK piede) | **10** |
| 2 | **Animazioni Hero** | Sono in primo piano nell'highlight; l'occhio è sull'eroe che esegue l'azione. | **Alto** | **Alta** (clip/procedural credibili + blending) | **9** |
| 3 | **Camera cinematografica** | È la "lente" che racconta: nobilita o rovina tutto il resto. (Soglia di qualità la più alta del blocco.) | **Alto** | **Media-alta** (logica, non asset) | **9** |
| 4 | **Regia contestuale** | Camera che **cambia per situazione** = "trasmissione"; uguale per tutto = "motore grafico". *(Promossa rispetto all'ordine indicativo: pesa più della varietà.)* | **Medio-alto** | **Media** | **7** |
| 5 | **Reazioni** | Vendono l'emozione dei momenti clou (gol/parata). Il fix 5.45 (esultanza lato corretto) dimostra quanto un difetto qui sia visibile. | **Medio-alto** nei clou | **Media** | **6** |
| 6 | **Movimenti off-ball** | Riempiono il campo di vita tattica; ammucchiamenti e staticità rompono la credibilità collettiva. | **Medio** (sfondo) | **Alta** (IA su 22 attori, costo per-frame, GC mobile) | **6** |
| 7 | **Varietà delle animazioni** | La ripetizione identica spezza l'illusione su sessioni lunghe (effetto cumulativo). | **Medio** (cumulativo) | **Media** (micro-variazioni seedate) | **5** |

> **Perché ho spostato "Regia contestuale" sopra "Varietà"** *(deviazione argomentata dall'ordine indicativo):* una regia che si adatta al tipo di azione produce un salto di "qualità da trasmissione" percepito molto più della varietà delle clip, a parità di sforzo. La varietà conta, ma è un raffinamento di secondo ordine.

> **Lettura operativa:** il refactoring rende di più se attaccato in quest'ordine — **palla → hero → camera/regia** prima, poi reazioni/off-ball/varietà. È l'ordine a maggior ROI percettivo per euro speso.

---

## 6. Dimensioni tecniche — voci di valutazione

Ogni voce: voto **1–5** + difetti osservati. La colonna "difetti tipici" è un promemoria, non esaustiva.

### D1 — Interazione Palla & Fisica *(NUOVA)*

| # | Voce | Cosa valutare | Difetti tipici da cercare | Voto |
|---|---|---|---|---|
| D1.1 | **Contatto piede-palla** | Sincronia gesto↔partenza palla | Palla che parte prima/dopo il contatto, piede che attraversa la palla, "teletrasporto" | ☐ |
| D1.2 | **Traiettoria & fisica della palla** | Arco, gravità, velocità credibili | Archi innaturali, palla "guidata"/magnetica, decelerazione finta | ☐ |
| D1.3 | **Peso & momentum del giocatore** | Inerzia, appoggi, baricentro | Stop/partenze istantanee, niente peso, scivolate senza attrito | ☐ |
| D1.4 | **Collisioni** | Giocatore-giocatore, palla-palo/rete/portiere | Compenetrazioni, palla che bucla la rete, contrasti senza contatto | ☐ |
| D1.5 | **Rotazione/spin palla** | Effetto, rotolamento | Palla che non ruota, rotolamento scollegato dalla velocità | ☐ |
| | **MEDIA D1** | | | ☐ |

### D2 — Animazioni (Hero + locomozione + transizioni + posa + varietà)

| # | Voce | Cosa valutare | Difetti tipici | Voto |
|---|---|---|---|---|
| D2.1 | **Locomozione (corsa/camminata/idle)** | Naturalezza dei 22 | Glide/ice-skating, piedi che slittano, T-pose residue | ☐ |
| D2.2 | **Transizioni di stato** | Fermo↔corsa, accel/decel, cambio direzione | Snap/scatti, "pop" tra pose, crossfade brusco o molle | ☐ |
| D2.3 | **Hero — tiro/volée** | Wind-up, swing, follow-through | Gamba senza caricamento, posa congelata, contatto non sincrono | ☐ |
| D2.4 | **Hero — cross/punizione/rigore** | Rincorsa, colpo, recupero | Movimento identico al tiro, varianti indistinguibili | ☐ |
| D2.5 | **Hero — testa/stacco** | Salto, impatto aereo | Stacco senza salto credibile, timing impatto, testa su palla a terra (invariante CINE) | ☐ |
| D2.6 | **Hero — contrasto/dribbling/passaggio** | Tackle, finta, tocco | Contrasto senza contatto, dribbling rigido, passaggio senza gesto | ☐ |
| D2.7 | **Posa & silhouette** | Proporzioni, posa a riposo | Corpo tozzo/"a pera", proporzioni innaturali, idle rigido | ☐ |
| D2.8 | **Varietà** | Ripetitività percepita | Azioni identiche, niente micro-variazione, effetto "robot" | ☐ |
| | **MEDIA D2** | | | ☐ |

### D3 — Camera & Regia

| # | Voce | Cosa valutare | Difetti tipici | Voto |
|---|---|---|---|---|
| D3.1 | **Framing** | Eroe + palla ben inquadrati | Soggetto fuori campo nei clou, decentrato/perso | ☐ |
| D3.2 | **Tracking** | La camera segue l'azione | Resta indietro/avanti, perde il portatore, scatta per rincorrere | ☐ |
| D3.3 | **Distanza / zoom** | Adeguata al momento | Larga sul tiro (illeggibile) o stretta sul build (senza contesto) | ☐ |
| D3.4 | **Stabilità** | Movimento fluido | Jitter, micro-scatti, "camera ubriaca" | ☐ |
| D3.5 | **Angolazione / profondità** | Direzione di gioco e spazio leggibili | Angolo che appiattisce, direzione d'attacco ambigua | ☐ |
| D3.6 | **Linguaggio cinematografico** | Regola dei terzi, profondità di campo, slow-mo sui clou | Inquadrature "piatte"/da editor, nessun respiro cinematografico | ☐ |
| D3.7 | **Regia contestuale** | La camera cambia per tipo di azione | Stessa inquadratura per tutto, niente regia "per situazione" | ☐ |
| D3.8 | **Drammatizzazione** | I clou (gol/parata/rigore) enfatizzati | Gol uguale a un passaggio, nessun "momento" | ☐ |
| | **MEDIA D3** | | | ☐ |

### D4 — IA & Movimenti Off-ball *(formalizzata)*

| # | Voce | Cosa valutare | Difetti tipici | Voto |
|---|---|---|---|---|
| D4.1 | **Posizionamento collettivo** | Forma squadra, reparti, spaziatura | Ammucchiamenti, campo vuoto, linee incoerenti | ☐ |
| D4.2 | **Smarcamenti & inserimenti** | Movimenti senza palla credibili | Corse finte, giocatori statici, tempi sbagliati | ☐ |
| D4.3 | **Comportamento difensivo** | Marcatura, copertura, chiusura linee | Marcature "magnetiche"/assenti, difensori che non reagiscono | ☐ |
| D4.4 | **Portiere** | Posizione, tuffi, uscite | GK fuori dai bound, tuffo senza anticipo, parata non agganciata al tiro | ☐ |
| D4.5 | **Coerenza tattica** | L'IA "ha senso" calcistico | Decisioni illogiche, reazioni assurde alla palla | ☐ |
| | **MEDIA D4** | | | ☐ |

### D5 — Atmosfera (reazioni · folla · luci · audio contestuale) *(NUOVA)*

| # | Voce | Cosa valutare | Difetti tipici | Voto |
|---|---|---|---|---|
| D5.1 | **Reazioni giocatori** | Esultanza/delusione coerenti col momento | Esultanza lato sbagliato, reazioni assenti/identiche | ☐ |
| D5.2 | **Folla** | Movimento, ola, reazione a gol/parata | Texture statica, reazione del settore sbagliato, densità finta | ☐ |
| D5.3 | **Illuminazione & ombre** | Luci stadio, ombre, contrasto, ora del giorno | Flat lighting, niente ombre, scena "piatta"/slavata | ☐ |
| D5.4 | **Audio contestuale** | Boato, cori, commento, impatti | **Oggi assente** (vedi §13): pesa molto sulla qualità percepita | ☐ |
| D5.5 | **Vita di contorno** | Panchine, raccattapalle, bandierine, dettagli | Stadio "morto", nessun dettaglio ambientale | ☐ |
| | **MEDIA D5** | | | ☐ |

### D6 — Replay & Transizioni *(NUOVA)*

| # | Voce | Cosa valutare | Difetti tipici | Voto |
|---|---|---|---|---|
| D6.1 | **Instant replay dei gol** | Esiste? È leggibile? | Nessun replay, replay confuso | ☐ |
| D6.2 | **Slow-motion sui clou** | Rallenty sui momenti chiave | Assente, mal temporizzato | ☐ |
| D6.3 | **Multi-angolo** | Più camere sul momento | Sempre la stessa inquadratura | ☐ |
| D6.4 | **Transizioni di fase** | Tagli intro→move→choose→result→ripresa | Cut bruschi, **frame neri**, salti di posizione | ☐ |
| D6.5 | **Fluidità / frame-pacing** | Niente stutter percepito | Micro-freeze, hitch al cambio fase | ☐ |
| | **MEDIA D6** | | | ☐ |

---

## 7. SEZIONE C — Coinvolgimento Emotivo *(north-star, media separata)*

La domanda non è "è corretto?" ma **"mi fa sentire qualcosa?"**. Media **separata** dall'IQP; **gate** obbligatorio (§3).

| # | Metrica | Domanda guida | Voto |
|---|---|---|---|
| **C1** | **Tensione** | L'azione genera tensione/attesa mentre si svolge? | ☐ |
| **C2** | **Ritmo credibile** | Il ritmo della partita (pause, accelerazioni, clou) è credibile? | ☐ |
| **C3** | **Unicità** | Ogni highlight è percepito **diverso** dagli altri? | ☐ |
| **C4** | **Voglia di replay** | Lo spettatore avrebbe voglia di **rivedere** l'azione? | ☐ |
| **C5** | **"TV vs motore grafico"** | La scena sembra una **trasmissione televisiva** o un semplice motore? | ☐ |
| **C6** | **Picco emotivo sul gol** *(agg.)* | Il gol dà un "picco" (boato/regia/esultanza all'unisono) o è anonimo? | ☐ |
| **C7** | **Credibilità complessiva** *(agg.)* | Mostrandolo a un appassionato, lo scambierebbe per un calcistico vero (anche solo per un istante)? | ☐ |
| | **MEDIA C** | | ☐ |

> C6/C7 aggiunte perché "tensione/ritmo/unicità" misurano l'esperienza *durante*; C6 misura il **culmine** (il gol è il momento che si ricorda) e C7 è il **test di Turing percettivo** — la sintesi onesta del north-star.

---

## 8. Analisi critica: metriche mancanti nella v1

Verifica sistematica sui 15 assi richiesti. *(Coperto = già nella griglia v2 · Aggiunto = nuova metrica v2.)*

| Asse | Stato v1 | Dove sta in v2 |
|---|---|---|
| **Timing** | ❌ Mancante | D1.1 (contatto), D2.2 (transizioni), D2.5 (impatto), D6.2 (slow-mo timing) |
| **Fisica** | ❌ Mancante | **D1** intera (traiettoria, peso, spin) |
| **Fluidità** | 🟡 Parziale | D2.2 + **D6.5** (frame-pacing/stutter) |
| **Collisioni** | ❌ Mancante | **D1.4** (giocatore-giocatore, palla-palo/rete/GK) |
| **Sincronizzazione** | ❌ Mancante | D1.1 (anim↔palla), **D5.1/D5.2** (gol↔esultanza↔folla), D3.8 (evento↔camera) |
| **IA** | 🟡 Parziale (solo A8) | **D4** intera (posizionamento, difesa, coerenza tattica) |
| **Cinematografia** | 🟡 Parziale | **D3.6** (linguaggio cinematografico) + D3.7/D3.8 |
| **Varietà** | ✅ Coperto | D2.8 (+ C3 lato percepito) |
| **Emozione** | ❌ Mancante | **SEZIONE C** intera |
| **Audio contestuale** | ❌ Mancante | **D5.4** (⚠️ oggi assente nel motore — vedi §13) |
| **Comportamento folla** | 🟡 Parziale | **D5.2** dedicata |
| **Illuminazione** | ❌ Mancante | **D5.3** (luci/ombre/contrasto) |
| **Replay** | ❌ Mancante | **D6.1–D6.3** |
| **Telecamere** | 🟡 Parziale | D3 + **D6.3** (multi-angolo) |
| **Transizioni** | 🟡 Parziale (solo B6) | **D6.4** dedicata |

**Conclusione:** la v1 copriva bene **animazioni di superficie** e **camera base**, ma era **cieca** su fisica/collisioni, IA, sincronizzazione, illuminazione, audio, replay ed **emozione** — cioè gran parte di ciò che separa un "motore grafico" da una "trasmissione". La v2 chiude questi buchi.

---

## 9. Campione di highlight da valutare (copertura varianti)

Almeno un highlight per famiglia (per non giudicare su un caso fortunato):

- ☐ Tiro (in porta / parato / palo) · ☐ Volée/aereo · ☐ Cross→stacco · ☐ Testa/stacco · ☐ Rigore · ☐ Punizione · ☐ Contrasto/tackle · ☐ Dribbling · ☐ Passaggio/uno-due/filtrante · ☐ Build-up · ☐ Azione zona alta **e** bassa (test camera su zone diverse) · ☐ **Un gol completo** (azione→rete→esultanza→ripresa)

> Registrare con il **determinismo di test** (`?cpmtest=1`) per riconfrontare clip **identiche** prima/dopo ogni step.

---

## 10. Condizione di uscita del blocco 1.0

Il blocco 1.0 è **chiuso** quando tutte le caselle di **§3** sono spuntate sul campione **§9**, **e** il **Product Owner dichiara "Accettabile" dal vivo**. I numeri sono condizione **necessaria**; il giudizio del PO è quella **sufficiente**.

---

## 11. Mappatura con AI Vision (2° livello)

| Dimensione | Metrica AI Vision | Baseline | Target 1.0 |
|---|---|---|---|
| D2 Animazioni | `animationQuality` | ~40–55 | **≥ 85** |
| D3 Camera & Regia | `cameraQuality` | ~50–65 | **≥ 85** |
| Contesto | `situation-recognition` | operativo | — |
| D1/D4/D5/D6/C | *(da estendere)* | — | proporre nuove metriche AI Vision allineate alle nuove dimensioni |

**Uso:** segnale **continuo e ripetibile** tra build (trend + caccia regressioni percettive); **non blocca** e può avere rumore. In caso di divergenza, **prevale il PO**. *Nota:* le dimensioni nuove (fisica, IA, atmosfera, replay, emozione) **non hanno ancora** una metrica AI Vision → estendere il prompt di scoring è un lavoro a sé (post-definizione griglia).

---

## 12. Scheda di valutazione (template compilabile)

```
=== EVAL LIVE MATCH 3D v2.0 — build:______  data:______  valutatore:______  clip:______ ===

D1 INTERAZIONE PALLA & FISICA      Voto   Difetti
D1.1 Contatto piede-palla           [ ]   ____________________
D1.2 Traiettoria & fisica palla     [ ]   ____________________
D1.3 Peso & momentum                [ ]   ____________________
D1.4 Collisioni                     [ ]   ____________________
D1.5 Rotazione/spin                 [ ]   ____________________
                       MEDIA D1 =   [ ]

D2 ANIMAZIONI                       Voto   Difetti
D2.1 Locomozione                    [ ]   ____________________
D2.2 Transizioni                    [ ]   ____________________
D2.3 Hero tiro/volée                [ ]   ____________________
D2.4 Hero cross/punizione/rigore    [ ]   ____________________
D2.5 Hero testa/stacco              [ ]   ____________________
D2.6 Hero contrasto/dribbling/pass  [ ]   ____________________
D2.7 Posa & silhouette              [ ]   ____________________
D2.8 Varietà                        [ ]   ____________________
                       MEDIA D2 =   [ ]

D3 CAMERA & REGIA                   Voto   Difetti
D3.1 Framing                        [ ]   ____________________
D3.2 Tracking                       [ ]   ____________________
D3.3 Distanza/zoom                  [ ]   ____________________
D3.4 Stabilità                      [ ]   ____________________
D3.5 Angolazione/profondità         [ ]   ____________________
D3.6 Linguaggio cinematografico     [ ]   ____________________
D3.7 Regia contestuale              [ ]   ____________________
D3.8 Drammatizzazione               [ ]   ____________________
                       MEDIA D3 =   [ ]

D4 IA & OFF-BALL                    Voto   Difetti
D4.1 Posizionamento collettivo      [ ]   ____________________
D4.2 Smarcamenti/inserimenti        [ ]   ____________________
D4.3 Comportamento difensivo        [ ]   ____________________
D4.4 Portiere                       [ ]   ____________________
D4.5 Coerenza tattica               [ ]   ____________________
                       MEDIA D4 =   [ ]

D5 ATMOSFERA                        Voto   Difetti
D5.1 Reazioni giocatori             [ ]   ____________________
D5.2 Folla                          [ ]   ____________________
D5.3 Illuminazione & ombre          [ ]   ____________________
D5.4 Audio contestuale              [ ]   ____________________
D5.5 Vita di contorno               [ ]   ____________________
                       MEDIA D5 =   [ ]

D6 REPLAY & TRANSIZIONI             Voto   Difetti
D6.1 Instant replay gol             [ ]   ____________________
D6.2 Slow-motion clou               [ ]   ____________________
D6.3 Multi-angolo                   [ ]   ____________________
D6.4 Transizioni di fase            [ ]   ____________________
D6.5 Fluidità/frame-pacing          [ ]   ____________________
                       MEDIA D6 =   [ ]

>>> IQP = D1*0.18 + D2*0.30 + D3*0.24 + D4*0.12 + D5*0.10 + D6*0.06 = [ ]

SEZIONE C — COINVOLGIMENTO EMOTIVO  Voto   Note
C1 Tensione                         [ ]   ____________________
C2 Ritmo credibile                  [ ]   ____________________
C3 Unicità                          [ ]   ____________________
C4 Voglia di replay                 [ ]   ____________________
C5 TV vs motore grafico             [ ]   ____________________
C6 Picco emotivo sul gol            [ ]   ____________________
C7 Credibilità complessiva          [ ]   ____________________
                       MEDIA C =    [ ]

=== ESITO ===
Difetti BLOCCANTI (voto 1): _______________________________________
Voci a voto 2: ____________________________________________________
TOP 3 priorità da sistemare: 1)______ 2)______ 3)______
AI Vision: animationQuality=___  cameraQuality=___
Milestone raggiunta: [ ] M1  [ ] M2  [ ] M3(target)
VERDETTO PO: [ ] Accettabile  [ ] Non ancora
```

---

## 13. Note di onestà tecnica (soffitto di realismo & dipendenze)

Da Technical Director, perché i target siano realistici e non solo aspirazionali:

1. **Soffitto dei personaggi procedurali.** Oggi i giocatori sono **mesh procedurali Three.js** (lo scaffolding GLB skinnato `loadGLB`/`colorCharGLB` è **dormiente**). Con personaggi procedurali è **difficile** superare ~3,5–4 su animazioni e raggiungere **AI Vision 85** sull'animazione: il salto a "videogioco moderno" su D2 **probabilmente richiede** di attivare il **modello GLB skinnato** (collegamento allo *Studio asset 3D* già prodotto). → **D2 ≥ 4,4 e AI Vision ≥ 85 sono un target che può comportare lavoro su asset/struttura**, non solo tuning del render-loop.
2. **Audio assente (D5.4).** Il motore **non ha audio**. L'audio (boato sul gol, cori, commento) è uno dei più forti moltiplicatori di qualità percepita ed emozione (Sezione C). Va deciso se l'audio entra nel blocco 1.0 o è una fase a sé — ma **non valutarlo** sarebbe disonesto: resta nella griglia con il suo voto (oggi presumibilmente 1).
3. **Replay (D6) come funzionalità nuova.** Instant replay / multi-angolo / slow-mo **non esistono** oggi → D6 parte basso. Sono *features*, non solo qualità: incidono sul target ma vanno pianificate.
4. **Camera gate-blind + ROI.** D3 ha la soglia più alta (4,5) ed è **a difficoltà media** (è logica, non asset) → **è l'area a miglior rapporto qualità/sforzo**: spesso conviene aggredirla presto per un salto percepito rapido, in parallelo al lavoro (più lungo) su D1/D2.
5. **Tutto resta gate-blind alla resa.** Il quality gate certifica lo *stato*, non la *bellezza*. Questa griglia **è** il sistema di validazione della resa: va presa sul serio come il gate.

---

## 14. Prossimo passo (quando si esce dalla sola analisi)

1. **Il PO conferma/aggiusta** soglie (§3) e pesi (§2) — sono proposte argomentate del TD.
2. **Il PO compila la baseline** v2.0 sullo stato attuale (5.45.2): fotografa difetti reali, top-3 priorità, milestone di partenza.
3. **Decisione su scope 1.0:** D2 (GLB skinnato?), D5.4 (audio dentro o fuori?), D6 (replay dentro o fuori?) — definiscono quanto è grande il blocco.
4. Da lì, refactoring a **step ≤300 righe**, ricompilando questa scheda ad ogni checkpoint, dall'area a priorità più alta (§5), fino a **M3 / "Accettabile"**.
