# Proposte giro 242 — clip dribbling (PO-505) e inno a centrocampo (PO-476)

**Solo proposta: nulla è entrato nel gioco né nel pacchetto.** La scelta è del PO. Ramo `sviluppo/giro242-proposte-asset`
(da `lavoro/197`, `cd3a2f5`). Verifiche fatte il 17/11/2026 in questa sessione; dove non ho potuto verificare lo scrivo.

---

## A. PO-505 — clip per doppio passo e sterzata

### Situazione di partenza (dal rapporto giro 226)

Finta, rientro, sterzata e doppio passo suonano tutte la clip `change-direction` (Mixamo, nel corpo CGTrader LOD1); il doppio passo
non si vede. Provino della clip di oggi: `docs/proposte/giro242/change-direction.jpg` (1,75 s, sul posto: il bacino non si sposta).

### Esito della ricerca, in breve

- **Sterzata / cambio di direzione: ci sono candidati con licenza libera** (CMU, sotto), riadattati sul nostro corpo con lo strumento
  del progetto e passati dal suo cancello anatomico.
- **Doppio passo (step-over): non ho trovato nessuna clip con licenza libera verificata.** Cercato su CMU (nessuna voce «soccer» oltre
  al calcio del pallone), OpenGameArt/Quaternius (librerie CC0 senza gesti da calcio, per quanto ho potuto leggere), Rohr pack 05
  (tre «Dribble» senza descrizione), Rokoko (12 clip sportive gratuite, ma serve un modulo con email e consenso al marketing: escluso,
  regola «nessun account»), Xsens/Movella (stesso tipo di modulo: non aperto), Bandai Namco (CC BY-NC-ND: vieta l'uso commerciale),
  SFU (vieta l'uso commerciale), Sketchfab (lo scaricamento richiede un account: escluso). Mixamo escluso dalla consegna.

### Candidati

Provini: 8 fotogrammi in sequenza sul **corpo CGTrader LOD1 del gioco** (three r128 come nel gioco), linea gialla = percorso del
bacino a terra. Sonda: `tests/visual/proposte-242-foto.mjs`; misure in `docs/proposte/giro242/misure.json`.

| # | Clip | Fonte · licenza | Durata · fotogrammi (30 fps) | Peso nel GLB (tracce) | Cancello anatomico (mediana / max, soglie 10° / 30°) | Provino |
|---|---|---|---|---|---|---|
| **1** | **CMU 102_13 «Offensive move go right»** → cambio passo esplosivo verso destra (per la **sterzata**) | CMU Graphics Lab, testo sotto | 1,27 s · 39 | ~25,8 KB (50) | 5,73° / 27,46° ✅ | `giro242/cmu-scatto-dx.jpg` |
| **2** | **CMU 102_19 «Feint right move left»** → finta di corpo a destra e partenza a sinistra (per **finta / rientro**) | CMU, testo sotto | 1,90 s · 58 | ~45,6 KB (60) | 5,64° / 28,14° ✅ | `giro242/cmu-finta-dx-va-sx.jpg` |
| **3** | **CMU 16_37 / 16_39 «run/jog, veer left / right»** → corsa che sterza (sterzata morbida, ~30-35°) | CMU, testo sotto | 1,53 s · 47 / 1,23 s · 38 | ~22,4 KB / ~16,7 KB | 4,54° / 25,67° ✅ · 4,76° / 27,01° ✅ | `giro242/cmu-corsa-sterza-sx.jpg`, `-dx.jpg` |
| (4) | **Rohr «Dribble 03»** — già nel repo (`assets/cgtrader-clip-rohr.glb`, `rohr-dribble-03`), non collegata | Anderson Rohr, licenza già registrata (CREDITI-fonti.md) | 3,37 s · 102 | ~45,7 KB, già nel file | registrato al giro 184: 6,12° / 28,94° ✅ | `giro242/rohr-dribble-03.jpg` |

Il gemello di #2, **CMU 102_18 «Feint left move right»**, è **rifiutato dal cancello** (massimo 31,04° > 30°): non proposto.

**Che cosa si vede nei provini (mio giudizio dalle foto, non dal telefono):**
1. **102_13**: partenza bassa, spinta laterale e accelerazione, braccia larghe da cestista ma senza pallone in mano. È il più vicino a
   uno «scatto dopo la sterzata». Rotta finale quasi diritta (svolta misurata 9°): il cambio di direzione è nei primi 0,5 s.
2. **102_19**: nei fotogrammi 1-2 **le mani salgono come per ricevere un pallone da basket** (si vede bene a 0,27 s), poi finta e
   partenza (svolta misurata 50°). Le braccia andrebbero sostituite o attenuate prima dell'uso.
3. **16_37/16_39**: corsa leggera con curva; **la testa resta piegata all'indietro** in tutta la clip (difetto del riadattamento: la
   testa non è nel cancello) e le mani stanno davanti al petto. Utile solo come base per una sterzata morbida.
4. **Rohr Dribble 03**: conduzione lenta con piccoli tocchi e un giro (svolta 37°): **non è un doppio passo**. Si potrebbe usare
   per «dribbling puro» / conduzione.

**Compatibilità con lo scheletro.** Tutte sono riadattate allo scheletro CGTrader a 75 ossa con `tools/retarget_cgtrader_clip.py`
(lo stesso strumento delle clip Mixamo del portiere), senza modificarlo: un involucro di prova (`tools/proposte-242/`) gli passa i
giunti CMU come nodi. ⚠️ Le clip CMU e Rohr **si spostano** (bacino 3,4-4,8 m nella clip), mentre `change-direction` e `dribble` di
oggi sono **sul posto** (bacino fermo): per usarle nel gioco servirebbe togliere lo spostamento del bacino (il gioco muove l'eroe da
sé). Pianta sotto il suolo: 0-1 cm su tutte.

**Licenza CMU, parola per parola** (mocap.cs.cmu.edu, letta il 17/11/2026):
- pagina principale: «This dataset of motions is free for all uses.»
- pagina principale: «This data is free for use in research projects. You may include this data in commercially-sold products, but
  you may not resell this data directly, even in converted form. If you publish results obtained using this data, we would appreciate
  it if you would send the citation to your published paper to jkh+mocap@cs.cmu.edu.»
- FAQ: «The motion capture data may be copied, modified, or redistributed without permission.»

Non è CC0, ma l'uso commerciale incorporato è permesso e l'attribuzione **non** è richiesta. Il divieto «resell … even in converted
form» riguarda la vendita dei dati in sé: un GLB convertito scaricabile dal repo pubblico non è una vendita (stesso tipo di rischio
già accettato per CGTrader, Mixamo e Rohr) — giudizio mio, **non posso confermarlo** con un parere.

**File scaricati (cartella di prova, fuori dal repo, non committati):** `102.asf` (7.271 B, sha256 `c6bf353bb26d6531…`),
`102_13.amc` (121.115 B, `ce6858141c2101ee…`), `102_18.amc` (182.814 B, `46795636d7230c07…`), `102_19.amc` (180.325 B,
`cfb81ac5d45c47b8…`), `16.asf` (7.257 B, `2323f876564610f8…`), `16_37.amc` (146.460 B, `b2184d1823822728…`), `16_39.amc`
(117.279 B, `c442a8d7fca96a44…`). URL: `http://mocap.cs.cmu.edu/subjects/<n>/<file>`. Il GLB riadattato di prova (4 clip, 173.792 B)
è rimasto nella cartella di prova.

### Per il doppio passo, strade possibili (nessuna presa)
- **a)** Rohr «Dribble 01» e «Dribble 02» (pack 05, licenza già registrata, il PO ha lo zip): il contenuto non è descritto da nessuna
  parte; al giro 180 sono state scartate dal cancello (31,6° e 35,9°). Se il PO rimette lo zip a disposizione, si possono fotografare
  per vedere se contengono un doppio passo.
- **b)** Clip **fatta da noi** a fotogrammi chiave sul corpo CGTrader (come il brusio di folla «nostro»): nessuna licenza di terzi,
  ma qualità da verificare sul telefono.
- **c)** Doppio passo **procedurale** sopra la clip di corsa (giro delle gambe sul pallone), senza asset nuovi.

---

## B. PO-476 — inno strumentale per l'ingresso a centrocampo

La scena dell'inno dura **7,05 s** (giro 206), dentro ingressi di 23-30 s. Tutti i candidati sono **CC0** su OpenGameArt (campo
«License» della pagina, letto il 17/11/2026: «CC0»): uso commerciale libero, **nessuna attribuzione obbligatoria**.
**Non posso ascoltare i brani**: le descrizioni sono quelle dell'autore più l'andamento del volume misurato (loudness a breve termine).
Peso stimato nel formato del gioco (Opus 96 kb/s + MP3 128 kb/s, normalizzato a −18 LUFS come gli altri brani), su un taglio di prova.

| # | Brano | Autore · pagina | Durata originale | Descrizione dell'autore | Andamento del volume (misurato) | Taglio di prova · peso ogg / mp3 |
|---|---|---|---|---|---|---|
| **1** | **Production Theme Intro [Epic Orchestra]** | nene · opengameart.org/content/production-theme-intro-epic-orchestra | 12,0 s (WAV; i primi ~2,9 s sono silenzio) | «Intro theme for producations and companies to use for openings or/and endings» | sale da −15 a −11 LUFS e chiude a −15: **un solo crescendo di ~9 s** | 2,9-12,0 s (9,1 s) · 108 KB / 147 KB |
| **2** | **Original hymn — versione «orchestral build»** | Bobjt · opengameart.org/content/original-hymn (file `4-hymn-orchestral-build.mp3`) | 63,7 s | «The original "hymn" that bases the theme for G&T RPG» | costante −16/−13, cresce verso −11 a 54 s: brano **lento che si costruisce** | 0-30 s · 474 KB / 481 KB |
| **3** | **A Legend Will Rise (Orchestral)** | CodeManu · opengameart.org/content/a-legend-will-rise-orchestral | 69,6 s | «A small orchestral piece … No attribution required but always appreciated» | pieno da subito (−9), cala a −13 a metà e risale a −8 verso 50 s: **solenne e forte** | 0-30 s · 353 KB / 481 KB |
| (4) | Fantasy Orchestral Theme | Joth · opengameart.org/content/fantasy-orchestral-theme | 191,7 s | «Begins fairly slow and serene, but ends in a more intense crescendo» | il crescendo pieno è fra 99 e 158 s | 99-129 s · 390 KB / 481 KB |

sha256 dei file scaricati (cartella di prova, non committati): `65aca17e6c1b0ff0…` (Production_Intro_Theme.wav, 2.116.310 B),
`4fb2b140e27d701f…` (4-hymn-orchestral-build.mp3, 1.277.827 B), `6c38472a541777c3…` (A Legend Will Rise.mp3, 2.785.768 B),
`add1de5eae0771c4…` (FantasyOrchestralTheme_1.mp3, 3.837.827 B).

**Lettura per l'uso:** il #1 sta già nella scena da 7 s (si taglia il silenzio iniziale), ma per descrizione è una «sigla di
apertura» più che un inno. #2 e #3 sono più lunghi e vanno tagliati su un tratto scelto (il gioco ne userebbe 7-30 s); il #2 è
l'unico che l'autore chiama «hymn». Anteprime normalizzate prodotte nella cartella di prova (non nel repo): il PO può ascoltare i
brani dalle pagine OpenGameArt indicate.

**Anteprime da ascoltare sul telefono (giro 267):** [`giro242/inno/ASCOLTA.md`](giro242/inno/ASCOLTA.md) — i tre candidati
(#1-#3) interi, in mono a −18 LUFS, più un taglio da 7 s per #2 (46,5-53,5 s) e #3 (41,5-48,5 s). Licenze riverificate il 18/11: CC0.

Nota: il pacchetto ha già un brano CC0 dello stesso sito per le cerimonie (`music/ceremony/il-mondo-e-nostro`, Zane Little Music):
nessun candidato è quel brano.
