# Scene dell'eroe: solo ciò che il 3D sa disegnare — risposta al prompt del PO (27/09)

Base: build 7.999.37 (il prompt citava la 7.999.36: nel frattempo sono uscite 7.999.36 e 7.999.37, nessuna tocca le schede).
Censimento completo: `CENSIMENTO_SCENE.md` (tabella di tutte le azioni) e `CENSIMENTO_SCENE.json`, generati da
`tests/visual/censimento-scene.mjs`, che legge dal gioco `SITUATIONS`, `deriveHL` e la tabella `GESTI` (hook `__CPM_GESTI`).

## 1. Conferma o smentita

### Punto 1 — le scene non nascono dal brain
- **Numeri: smentita parziale.** Il gioco ha **191 situations e 573 azioni**, non 185/532. Le 185 sono le righe che iniziano
  con `S(` in `src/04-situazioni-zone-piazzati.jsx`; il conteggio vero viene dall'array `SITUATIONS` caricato.
- **Il brain sceglie fra schede scritte: confermato.** `occEroe879Ref` (`src/15-live-match.jsx:2749`) porta l'occasione del
  motore; la scena si pesca con `selectContextualSituations` (`src/13-prepartita-formazioni.jsx:1183`, chiamata in
  `src/15:4432` con 16 candidate quando c'è l'occasione) e fra le candidate vince quella la cui zona di partenza contiene
  già l'eroe (`src/15:4440`, regola 7.880); in mancanza il primo candidato.
- **Altri punti di pesca che NON passano dall'occasione del brain: confermato.** Scelta iniziale di tutta la partita
  (`src/15:1431`), highlight reattivi (`src/15:4221`), scena della «speranza» nel finale (`src/15:4239`), catene
  (`CHAIN_SITS`, `src/15:8814-8818`, scelte dall'esito della scena precedente).
- **Poche candidate: confermato con numeri nuovi** (sotto, sezione 3): mediana 3 candidate dentro la zona dell'eroe.
- **Gesto ricavato dal testo con espressioni regolari: confermato.** `deriveHL` (`src/11-ui-kit-highlight.jsx:1763`) legge
  l'etichetta; `defGesto` è calcolato in factory (`src/04:50-61`) sempre da espressioni regolari sull'etichetta.

### Punto 2 — descrizioni che promettono gesti assenti
Confermato in gran parte, con tre correzioni dal censimento:
- **Step-over** (gi «Step-over e via!») **non** va a `double_step`: nessuna azione raggiunge `double_step` né `step_over`
  (risolve a tiro o dribbling generico). La clip dribbling fa tocchi, non pedalate: l'ho classificato *approssimato*.
- **Sforbiciata**: con «rovesciata/sforbiciata» nell'etichetta monta la clip Mixamo `mx-scissor-kick` (dal 23/09, rovesciata
  vera): *fedele*. «Controllo acrobatico» senza quelle parole va alla volée: *approssimato*.
- **«Chiama/Avvisa il portiere»** ha già un gesto (uscita e presa del portiere, `gkCall`, 7.238): *fedele*. Restano non
  disegnabili i comandi senza portiere («Organizza la difesa», «Guida i compagni», «Copri la linea», «Comunico la
  situazione», «Chiamo il compagno a raddoppiare»).
- Resa accettabile confermata per cucchiaio (campana), esterno a giro (traiettoria curva), portiere in uscita, fallo cercato
  (caduta 7.999.8), chiamata del portiere.

## 2. Totali del censimento (573 azioni)

| Verdetto | Azioni |
|---|---|
| Fedele | 275 |
| Approssimata | 274 |
| **Non disegnabile** | **24** |

Il verdetto viene da un registro di parole-gesto (in testa allo script) con giudizio mio, dichiarato gesto per gesto: è la
parte da validare. «Approssimata» è larga perché ci finisce ogni dribbling, controllo, pressing e temporeggiamento resi con
clip generiche.

**Situations il cui testo promette un gesto assente (11):** gi26 Assist di tacco · gi40 Difensore di fronte (tunnel) ·
gi42 Fascia chiusa (rabona) · gi65 Stop di petto e tiro · gi92 Roulette sul difensore · gi93 Elastico in area · gi98 Tunnel
in area · gi100 Hocus pocus sulla fascia · gi110 Fai il velo · gi115 Tacco al limite · gi138 Allineati con la difesa.

**Azioni non disegnabili (24):** gi7 «Tacco» · gi21 «Elastico e tiro» · gi26 «Tacco preciso» · gi31 «Copri la linea» · gi35
«Organizza la difesa» · gi40 «Tunnel perfetto» · gi42 «Rabona cross» · gi69 «Tacco in porta» · gi76 «Tacco verso compagno» ·
gi85 «Deviazione acrobatica col tacco» · gi92 «Roulette di classe» · gi93 «Elastico e tiro netto» · gi98 «Tunnel e tiro
netto» · gi100 «Hocus pocus e cross» · gi110 «Faccio il velo e attacco», «Ricevo dopo il velo», «Scatto oltre il velo» ·
gi111 «Tacco verso il compagno libero» · gi115 «Tacco per il compagno libero» · gi124 «Stop di petto e conserva» · gi129
«Chiamo il compagno a raddoppiare» · gi135 «Comunico la situazione» · gi166 «Scatto tra le gambe» · gi168 «Guida i compagni e
copri».

**Varianti di `GESTI` mai raggiunte (15 su 46, righe `base` escluse):** `shot_placed`, `cross_rabona`,
`cross_after_dribble`, `dribble_inside`, `dribble_outside`, `double_step`, `step_over`, `feint`, `roulette`,
`hocus_pocus`, `short_pass`, `long_pass`, `chip_pass`, `backheel`, `tackle/aerial`.
Al contrario, `deriveHL` produce **6 varianti che la tabella non ha** (`header_near_post`, `header_flick`,
`freekick_direct`, `freekick_cross_high/low`, `freekick_short`): ripiegano in silenzio sulla riga base.

## 3. Varietà oggi (sonda `varieta-scene.mjs`, 4 partite vere del provino)

17 scene · **6 schede distinte** su 191 · la più frequente copre il **23,5%**, le prime tre il **58,8%** · candidate alla
scelta (mediana): 16 dal selettore, 8 compatibili di zona, **3 dentro la zona dell'eroe**. La sospensione toglierebbe 11
schede e 24 azioni: sulla varietà misurata pesa poco (nessuna delle 6 schede viste è fra le sospese), ma la misura va
ripetuta dopo, su partite di campionato e non solo del provino.

## 4. Piano dei passi 2–5

| Release | Cosa | Rosso | Guardiano |
|---|---|---|---|
| 7.999.38 | **Passo 2.** Campo `richiede` congelato in factory (azione e situation), calcolato una volta dal registro di parole-gesto spostato nel gioco (`src/04`); **registro dei gesti disponibili** costruito dalle clip caricate davvero (+ `mx-scissor-kick`, + clip del PO quando arrivano) e dalla tabella `GESTI`; `deriveHL` assegna `roulette`, `hocus_pocus`, `step_over`, `cross_rabona`, `backheel`, `chip_pass` quando l'etichetta li nomina; le 6 varianti fuori tabella entrano in `GESTI` | `__CPM_NO_RICHIEDE` | censimento in modalità guardiano (varianti raggiungibili) |
| 7.999.39 | **Passo 3.** Azione non disegnabile esclusa dalle opzioni; scheda con meno di 2 opzioni o con testo che promette un gesto assente esclusa dalla pesca (tutti i punti di pesca: iniziale, reattiva, speranza, occasione; le catene sono scritte a parte e vanno censite); riattivazione automatica quando il registro vede la clip | `__CPM_NO_RICHIEDE` | varietà prima/dopo (Passo 4) + riattivazione simulata (registro con la clip in più) |
| 7.999.40 | **Passo 5.** Guardiano: nessuna scheda attiva con gesti mancanti; ogni variante `GESTI` raggiungibile; scena giocata al banco = clip attesa per l'azione (`__CPM_BRAIN23`/`__CPM_SCENA23`) | — | `scene-disegnabili-test.mjs` |

**Rischi.** (a) Salvataggi a metà partita: la ripresa (`resumeState`) conserva le situations già pescate; la sospensione
agisce solo sulla pesca, quindi una scheda sospesa già salvata si gioca ancora (da verificare con `save-compat`).
(b) `validate-situations` forza tutte le schede per indice: le sospese devono restare forzabili (la sospensione non le toglie
dall'array). (c) Le catene (`CHAIN_SITS`) non passano dal selettore: vanno censite a parte. (d) Varietà: se scende, prima di
rilasciare propongo di allargare il filtro di zona (oggi 3 candidate su 16).
**Ipotesi:** la «Soccer Spin» che mi hai appena mandato è una ruleta: col registro in piedi, gi92 «Roulette» tornerebbe da
sola appena la clip è collegata — il primo test vero della riattivazione.

## 5. Passo 6 — la scena nasce dal brain (proposta)

**Oggi:** il motore dichiara *che* c'è un'occasione (minuto, tipo, zona) e il gioco cerca la scheda scritta più simile.
**Proposta:** l'occasione del motore porta già tutto quello che serve (tipo, posizione dell'eroe, compagni liberi e dove,
avversario diretto, pressione, piede, stato del pallone). Un **generatore** produce da lì le 2-3 opzioni dell'eroe scegliendo
fra i gesti del registro (solo disegnabili per costruzione) e le pesa con le statistiche; le schede scritte diventano
**modelli di testo** (titolo, intro, etichette con segnaposti: «{compagno} è libero sul secondo palo») scelti per tipo e
contesto.
- *Vantaggi:* coerenza totale fra motore, testo e 3D; varietà non limitata dal catalogo; nessuna promessa impossibile.
- *Rischi:* `validate-situations` e le firme golden sono costruiti sulle 191 schede (andrebbero rifatti per modelli);
  statistiche e pagelle leggono `rew/fail` delle azioni; la regia cinematica ha zone di partenza autorate; i salvataggi a
  metà partita contengono schede intere.
- *Costo:* alto (settimane), da fare a strati.
- *Primo passo piccolo e misurabile:* generare **solo le opzioni** per un tipo (conclusione in area), tenendo la scheda come
  cornice di testo; misura: % di opzioni coerenti con la posizione del motore (compagno citato che esiste davvero, piede
  giusto) contro le schede di oggi, e schede distinte per partita.

## 6. Schede da riformulare — APPROVATE dal PO il 01/10, fatte in 7.999.95 (guardiano `etichette-95`; i tiri di tacco sono diventati «deviazione di prima»; «Stop di petto e conserva» resta, non era nella lista)

Solo per le schede di valore alto, in attesa delle clip: gi92 «Roulette sul difensore!» → «Giravolta secca sul difensore!»
diventa comunque una promessa di giro: propongo **«Finta secca sul difensore!»** · gi93 «Elastico in area!» → «Finta a
rientrare in area!» · gi98 «Tunnel in area! Passa in mezzo.» → «Dribbling stretto in area!» · gi100 «Hocus pocus sulla
fascia!» → «Finta e cross dalla fascia!» · gi42 «Rabona cross» → «Cross d'esterno» · gi26/gi115 «tacco» → «Appoggio di
prima per il compagno» · gi65 «Stop di petto e tiro fulmineo!» → «Controllo e tiro fulmineo!». Le altre (velo, comandi)
restano sospese finché non c'è un gesto.

## Autocritica
- **Correzioni chiuse cambiando il gesto invece della promessa:** almeno **dieci release sulla rovesciata** (7.220, 7.551,
  7.553, 7.560, 7.569, 7.586, 7.597, 7.611, 7.672, 7.999.19): per mesi il 3D aveva solo una posa procedurale per una
  giocata che il testo prometteva; la cura vera è arrivata con una clip (23/09). Il **tacco** (7.784) è stato chiuso
  cambiando l'intento in consegna, ma la clip resta un passaggio normale. La **chiamata del portiere** (7.238/7.245) è
  l'unico caso in cui la promessa è stata resa disegnabile col gesto giusto.
- **Perché `roulette`, `hocus_pocus`, `step_over`, `cross_rabona` esistono ma non si raggiungono:** la tabella `GESTI`
  (MP-1, 7.534) è stata scritta come vocabolario completo, ma `deriveHL` è rimasta la cascata storica: nessuno ha collegato
  le varianti nuove alle parole dell'etichetta, e il guardiano `gesto-vocabolario` controlla che le varianti *risolvano*,
  non che siano *raggiunte*. Un buco nel guardiano, non solo nel codice.
- **Le espressioni regolari sul testo** vanno bene come *traduzione una tantum in factory* (come `chainOn`, `gkCall`,
  `defGesto`): è il patto già in uso. Diventano il limite strutturale quando decidono il gesto a runtime o quando la scena
  nasce dal testo invece che dal motore: è il punto del Passo 6.
