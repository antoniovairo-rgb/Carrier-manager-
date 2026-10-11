# PO-220 — clip del gesto difensivo con GLB acceso (collaudo, sola lettura)

**Build:** `main` 7.999.158 (commit `1a819fb`, `GAME_VERSION="7.999.158"` a riga 5625 del file ricomposto da `tools/build-src.mjs` in `/tmp/cpm`).
**Campione:** 30 partite vere (nomi `Samuelito Vairo k`, k = 1…30), salvataggio `save-190-s12-ovr93.json`, autoplay `seeded`, GLB default (CH38, nessun `__CPM_GLB`), `__CPM_PRESENT=1`. 30/30 partite fino alla cerimonia, 0 errori. **30 scene difensive**, una per partita.
**Sonda:** `po220-difesa.mjs` (invariata) per la misura; `po220-diag.mjs` (copia con `hlType` per fotogramma) per la diagnostica su 3 partite. Dati grezzi: `po220-158-w1.jsonl`, `po220-158-w11.jsonl`, `po220-158-w21.jsonl`, `po220-158-diag.jsonl`. Analisi: `po220-158-analisi.mjs`.

**Riesecuzione:** copiare le sonde e l'analisi in `tests/visual/` (gli import sono relativi a quella cartella) con `FROM=k TO=k OUT=file.jsonl CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node po220-difesa.mjs`; analisi con `node po220-158-analisi.mjs <file.jsonl>…`.

## 1. Come il gesto deciso diventa una clip (codice)

Il gesto deciso è `defGesto` (`lunge` o `slide`), dichiarato dalla scena. Il percorso fino alla clip:

| Gesto deciso | Chiave clip attesa | Dove è scritta | File in `assets/` |
|---|---|---|---|
| `lunge` (chiusura, contrasto, anticipo, raddoppio) | `kick` | tabella `GESTI.tackle.lunge` r. 15750 | `anim-kick.glb` — **esiste** |
| `slide` (scivolata netta) | `tackle` | tabella `GESTI.tackle.slide` r. 15750 | `anim-tackle.glb` — **esiste**; `anim-slide-tackle.glb` — **esiste** (la mappa prova prima `slide-tackle`, r. 14160 e 14310: `_clip('slide-tackle')||_clip('tackle')`) |

Passi del percorso:
- `defGesto` assegnato dalla scena: r. 3198–3228 (classificazione per etichetta) e r. 4030 (`scelte[i].g`, interruttore `__CPM_NO_GESTO220`).
- Il lookup `gestoDi('tackle', gesto)` avviene solo quando `actType==='tackle'`: r. 22945–22946. `press`/`call` danno clip `null`.
- Degradazione a `press` per distanza: r. 20362–20372, `if(_dlT>6.5 && (slide|lunge|!gesto)) _dgFar440 = hlSitKey`. Con `_dgFar440` attivo il gesto diventa `press` (r. 22945) e la clip è `null`.
- Finestra del gesto: `GESTURE_WIN.tackle` r. 15673 (`vita 1.7, app 0.6, clip 1.7`). Il commento a r. 22942 dice che la clip parte solo col gesto (`actT>0`).
- Mappa chiave → clip: `_mkGestures` r. 14071 (`tackle:_tackleClip`).

Non ho verificato dove il nome dentro il GLB diventa `kick`/`tackle`: i tre file contengono un'animazione chiamata `mixamo.com` (letto il chunk JSON). Il punto di assegnazione del nome nel percorso di default **non l'ho trovato**.

## 2. Misura su 30 scene (GLB acceso)

Il **picco** è il fotogramma col peso GLB massimo tra i fotogrammi delle fasi `hl_choose`/`hl_result`. **Esclusa `hl_intro`**: vedi §4.

- Gesto deciso: `lunge` 25 · `slide` 5 · `press` 0.
- Clip al picco: `kick` 11 · `tackle` 2 · **nessuna 17**.
- **Clip attesa al picco: 13/30** (`lunge`→`kick`: 11 su 25; `slide`→`tackle`: 2 su 5).
- Distanza eroe–portatore al picco: mediana **6,0 u**; entro 4 u in 6 scene. Con clip attesa mediana 4,98 u (13 scene); senza clip mediana 6,37 u (17 scene).
- Distanza minima durante la scena: mediana 4,56 u.
- Peso GLB al picco con clip attesa: 0,97–1,00 (13 scene).
- In `hl_intro` una clip è già montata in **26/30** scene: `kick` 11, `pass` 11, `shortPass` 4.

Tabella per scena (`gesto` e `clip` = al picco; `attesa OK` = clip attesa presente; `dist.` in unità 3D):

| k | hl | gesto deciso | clip al picco | gw | dist. al picco (u) | dist. minima (u) | clip attesa | attesa OK | esito (key) | outKind motore | clip in hl_intro |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | lunge | kick | 0.98 | 4.18 | 4.08 | kick | true | recovery | — | intro=kick |
| 2 | 1 | lunge | kick | 1 | 6.08 | 6.08 | kick | true | through | beaten | intro=pass |
| 3 | 1 | lunge | kick | 1 | 2.12 | 2.12 | kick | true | through | beaten | intro=null |
| 4 | 1 | lunge | **nessuna** | 0.47 | 6.31 | 3.81 | kick | false | foul | missed | intro=shortPass |
| 5 | 1 | lunge | **nessuna** | 0.27 | 7.01 | 6.2 | kick | false | recovery | — | intro=pass |
| 6 | 1 | lunge | **nessuna** | 0.6 | 2.82 | 2.82 | kick | false | recovery | — | intro=pass |
| 7 | 4 | lunge | **nessuna** | 0.46 | 3.14 | 3.14 | kick | false | through | deflected_out | intro=kick |
| 8 | 1 | lunge | **nessuna** | 0.46 | 7.4 | 6.8 | kick | false | through | beaten | intro=kick |
| 9 | 1 | lunge | **nessuna** | 0.6 | 3.6 | 3.6 | kick | false | foul | beaten | intro=kick |
| 10 | 1 | lunge | **nessuna** | 0.77 | 4.61 | 4.61 | kick | false | recovery | — | intro=kick |
| 11 | 1 | slide | **nessuna** | 0.32 | 6 | 6 | tackle | false | foul | deflected_out | intro=shortPass |
| 12 | 1 | lunge | kick | 0.98 | 4.98 | 4.98 | kick | true | recovery | — | intro=pass |
| 13 | 1 | lunge | **nessuna** | 0.47 | 9.9 | 4.78 | kick | false | recovery | — | intro=pass |
| 14 | 1 | lunge | **nessuna** | 0.12 | 8 | 2.67 | kick | false | through | beaten | intro=pass |
| 15 | 1 | lunge | kick | 1 | 2.68 | 0.73 | kick | true | through | beaten | intro=pass |
| 16 | 1 | slide | tackle | 1 | 7.1 | 6.8 | tackle | true | foul | beaten | intro=null |
| 17 | 2 | lunge | kick | 1 | 3.69 | 2.33 | kick | true | through | beaten | intro=null |
| 18 | 1 | lunge | kick | 0.98 | 5.66 | 4 | kick | true | recovery | — | intro=kick |
| 19 | 1 | lunge | kick | 1 | 12.57 | 5 | kick | true | recovery | — | intro=pass |
| 20 | 1 | slide | **nessuna** | 0.15 | 8.24 | 4.21 | tackle | false | recovery | — | intro=kick |
| 21 | 1 | lunge | **nessuna** | 0.24 | 7.84 | 6.36 | kick | false | recovery | — | intro=pass |
| 22 | 1 | lunge | **nessuna** | 0.53 | 10.07 | 6.7 | kick | false | recovery | — | intro=pass |
| 23 | 1 | slide | tackle | 0.99 | 4.52 | 4.52 | tackle | true | foul | beaten | intro=kick |
| 24 | 1 | slide | **nessuna** | 0.75 | 6.2 | 6.2 | tackle | false | foul | beaten | intro=kick |
| 25 | 1 | lunge | **nessuna** | 0.46 | 8.65 | 4.56 | kick | false | through | beaten | intro=pass |
| 26 | 1 | lunge | kick | 0.99 | 4.54 | 2.42 | kick | true | recovery | — | intro=kick |
| 27 | 2 | lunge | kick | 0.97 | 6.56 | 5.32 | kick | true | foul | deflected_out | intro=kick |
| 28 | 1 | lunge | **nessuna** | 0.46 | 6.37 | 4.32 | kick | false | recovery | — | intro=shortPass |
| 29 | 1 | lunge | kick | 0.99 | 5.63 | 5.63 | kick | true | recovery | — | intro=null |
| 30 | 1 | lunge | **nessuna** | 0.45 | 4.88 | 4.88 | kick | false | recovery | — | intro=shortPass |

## 3. Diagnostica su 3 partite (`po220-diag.mjs`, `hlType` per fotogramma)

Sonda ripetuta su k = 4, 5, 6 (una scena difensiva ciascuna). Il tipo che il motore assegna alla scena è `tackle` in **tutti** i fotogrammi, con `defGesto=lunge`.

- **k4**: clip mai montata in tutta la scena. Distanza 5,9–6,5 u.
- **k5**: clip mai montata in azione. In `hl_intro` compare `pass` (distanza 14,5 u). Distanza 6,8–8,0 u.
- **k6**: clip `kick` assente in `hl_choose` (distanza 7,0 u) e presente solo da `hl_result`, dopo circa sette fotogrammi.

## 4. Ipotesi sulle 17 scene senza clip (ipotesi, non conferme)

- **H1 — soglia di distanza (r. 20372).** Compatibile con k5, ma non la separa: fra le 17 scene senza clip 8 sono oltre 6,5 u; fra le 13 con clip attesa solo 3 sono oltre 6,5 u. k6 (7 u) monta `kick` nella fase di esito: contraddice la regola, a meno che `_dlT` (distanza al bersaglio del gesto, non misurato) differisca dalla distanza eroe–portatore che registro. **Non dimostrata.**
- **H2 — finestra del gesto.** La clip parte solo con `actT>0` (r. 22942). In k6 il gesto arriva tardi, in `hl_result`. `actT` non è esposto dal hook `__CPM_GESTURE`, quindi non lo posso leggere. **Non dimostrata.**
- **H3 — il hook legge l'avatar sbagliato.** `__CPM_GESTURE` (r. 15533–15535) legge `glbAvatars[0]`, che potrebbe non essere l'eroe. Se così, i `null` sono falsi. **Non verificato:** non posso confermarlo senza esporre l'avatar dell'eroe.
- **Scartata — ramo `passaggio` di `deriveHL`.** Avevo ipotizzato che la cascata (r. 12263 prima di r. 12265) desse `pass` alle scene difensive con statistica di passaggio. La diagnostica smentisce: `hlType` è `tackle` in tutti i fotogrammi. La clip `pass` in `hl_intro` ha origine **non determinata**.

**Cosa servirebbe per decidere** (modifica di build, quindi fuori dalla sola lettura): esporre in `__CPM_GESTURE` `actT`, `_gName` e la distanza `_dlT`, più l'avatar dell'eroe. Con quei tre valori H1–H3 si separano con una misura.

## 5. Cosa correggo rispetto al rapporto 157 (`PO220-difesa.md`)

- **Metodo.** Il rapporto 157 prendeva il picco del peso su **tutti** i fotogrammi, `hl_intro` inclusa. Lì la clip è già montata in 26 scene su 30, quindi il picco finiva spesso in intro. Ora il picco esclude `hl_intro`.
- **Campione non confrontabile.** Le stesse partite (`k`) con lo stesso nome **danno scene diverse** tra un giro e l'altro (per esempio k=1 nel 157: `lunge`, distanza 15,8 u; nel 158: distanza 4,2 u). Il confronto 7/22 → 17/30 non dice se qualcosa è migliorato o peggiorato. **Non posso confermare una regressione né un miglioramento.**
- `receive` e `shortPass` del 157 erano clip misurate in `hl_intro`: non sono prova di un gesto sbagliato, e in questo giro il `pass` in intro ha origine non determinata.

## 6. Limiti

- 30 scene: il campione è piccolo. Le scene `slide` sono 5, quindi i numeri per la scivolata valgono poco.
- Le partite girano in parallelo (3 worker su 4 CPU, circa 5 minuti a partita): il tempo di scena headless non è quello del telefono. Le distanze sono spaziali e reggono meglio dei tempi.
- La distanza è eroe–portatore dalla posizione logica di `__CPM_STATE`, non dal `_dlT` del codice.
- Nessuna modifica al gioco: sola lettura, `main` 7.999.158 non toccato.
