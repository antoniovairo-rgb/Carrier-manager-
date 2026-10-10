# GIRO 4 · PO-218 — esito dell'eroe coerente

**Build collaudata:** `GAME_VERSION = "7.999.157"` (letto con `grep` dal file costruito in `/tmp/cpm157`, da `origin/poc/marioprada-character-system`, commit `c1fd4b2`; build con `CPM_FORZA_BUILD=1 node tools/build-src.mjs`, 56.511 righe).
**Sonda:** `docs/collaudi/giro4-po218/probe-giro4.mjs` · **analisi:** `docs/collaudi/giro4-po218/analisi.mjs` (riproducibile: `node analisi.mjs`) · **dati grezzi:** `docs/collaudi/giro4-po218/dati/*.json`.
**Non posso confermare** che il caso di Codex su 7.999.155 e 7.999.156 si ripresenti con la stessa frequenza: non ho riprodotto né la classe «fuorigioco contro intercetto» con la cronaca, né quella con il riquadro «fuorigioco» su più di una scena (vedi sotto).

## 1. Metodo (come richiesto)

- `window.__CPM_REC = true` e `window.__CPM_PRESENT = 1` armati con `addInitScript` **prima** del caricamento. `__CPM_GLB = false` (per velocità; il PO ha chiesto GLB-ON solo per le verifiche percettive, qui il dato è testuale/logico).
- Partite vere dal salvataggio, con `__CPM_AUTOPLAY` (`policy: 'seeded'`). Il seme nasce dal nome: ogni partita ha **nome e seme diversi**.
- Per ogni scena: `__CPM_RES218` (`hl`, `key`, `ok`, `outKind`, `fam`, `ovl`, `ev`) campionato ogni 400 ms.
- Cronaca successiva: `__CPM_TXT487`, letta **alla sorgente** (testimone pushato nel generatore di riga BG, riga 33944 del file costruito), non dal DOM. Limite: è la **prima riga di cronaca comparsa dopo la scena**, con granularità di 400 ms. Spesso è un evento diverso (vedi §4).

## 2. Campione

| Partita | Salvataggio (fixture) | Nome del giocatore | Seme | Scene | Non riuscite | Fine |
|---|---|---|---|---|---|---|
| p01 | save-190-s12-ovr93 | Marco Rossi | 1234 | 5 | 4 | ceremony |
| p02 | save-194-primavera-w38 | Luca Bianchi | 2021 | 11 | 10 | ended |
| p04 | save-190-s12-ovr93 | Matteo De Luca | 4418 | 9 | 7 | ceremony |
| p05 | save-194-primavera-w38 | Giulio Ferrari | 5529 | 7 | 5 | ended |
| p08 | save-194-primavera-w38 | Paolo Moretti | 8852 | 14 | 12 | ended |
| s20 | save-190-s12-ovr93 | Stefano Villa | 1171 | 9 | 8 | ceremony |
| s21 | save-194-primavera-w38 | Nicola Gallo | 2282 | 6 | 6 | ceremony |
| s22 | save-190-s12-ovr93 | Enrico Fabbri | 3393 | 9 | 7 | ceremony |
| s23 | save-194-primavera-w38 | Tommaso Serra | 4404 | 7 | 7 | ended |

**Totale: 9 partite valide, 77 scene risolte, 66 non riuscite** (obiettivo: almeno 60). Coperte le famiglie tiro (34), punizione (5), dribbling/finta (15), passaggio/uno-due (9), cross (2), altro (1).

**Limiti del campione, dichiarati:**
- **Solo due salvataggi** (190 e 194), non due carriere distinte in senso pieno: le partite sono le stesse due carriere con nomi e semi diversi.
- **Il fixture `save-195-primavera-w39` non avvia mai la partita:** sei tentativi (p03, p06, p09, r10, r12, r13) sono rimasti con `fine=null, scene=0`. Ho registrato p06, r10, r12 come esecuzioni fallite (`dati/`); p03, p07, p09, r13 non hanno prodotto file (processi scaduti al tetto di tempo con quattro gruppi in parallelo).
- **Nessuna scena di «assist»** nel campione: non copro la famiglia assist.
- Il tempo di una partita è 198–275 s (1 partita per processo; in parallelo oltre due gruppi i processi scadono).

## 3. Tabella per famiglia — concordi / totali

«Verificabile» = il motore registra un esito (tiro, intercetto, fallo). «Concordi» = la famiglia del riquadro (`fam`) coincide con quella del motore. Il riquadro senza famiglia (`fam` nullo) **non** è contato come discordanza.

| Famiglia | Scene | Verificabili | Concordi riquadro/motore | Riquadro senza famiglia | Motore senza esito |
|---|---|---|---|---|---|
| Tiro | 34 | 34 | **34 / 34** | 0 | 0 |
| Punizione | 5 | 5 | **5 / 5** | 0 | 0 |
| Dribbling/finta | 15 | 11 | **11 / 11** | 2 | 2 |
| Passaggio (uno-due, filtrante, sponda) | 9 | 9 | **8 / 9** | 0 | 0 |
| Cross | 2 | 1 | **1 / 1** | 0 | 1 |
| Altro («Avanza in area») | 1 | 1 | **1 / 1** | 0 | 0 |
| Assist | 0 | — | non coperta | — | — |

Discordanza di **famiglia** (riquadro ≠ motore): **1 su 66** (p05, §4.1).

**Discordanza di lessico** (la famiglia coincide ma le parole raccontano un'azione diversa): **2 su 66**, entrambe su tiri registrati dal motore e raccontati con parole di passaggio (§4.2). Questa classe **non compare** nella tabella per famiglia, perché il controllo per famiglia la vede come concorde: va contata a parte.

Cronaca successiva: su 26 scene la riga successiva è classificabile per parole chiave, e concorda con il motore in 2 casi (tiro). Il dato **non è affidabile** per giudicare la scena: la riga successiva descrive quasi sempre un evento diverso («Luzi allarga troppo», «Hayes allarga troppo») e non confermo né smentisco il racconto di scena.

## 4. Discordanze, con i tre racconti affiancati

### 4.1 Classe «fuorigioco contro intercetto» — 1 caso su 66 (1,5%)

**p05 · «🔁 Uno-due con MARRA»** (key `intercept`, `outKind` = `offside`)
- **Riquadro:** «La bandierina è alzata» (fuorigioco)
- **Motore:** `passaggio + intercetto + rammarico` (famiglia `intercepted`)
- **Cronaca successiva:** «⚙️ Pellegrini (ALT) appoggia su Luzi (ALT).» — **non dice fuorigioco**.

Riproduzione: 1 caso in 66 scene. Codex riportava il fuorigioco anche nella cronaca: **non riprodotto** nei miei dati.

Scena collegata, stesso schema ma senza discordanza di famiglia: **p08 · «🤝 Rimetti in mezzo per il compagno»**: `outKind = offside`, riquadro generico «Azione non sfruttata», motore `passaggio + rammarico` (nessun esito). Il riquadro non dice fuorigioco; il dato `outKind` sì.

### 4.2 Classe «passaggio respinto» su tiro murato — 1 caso; «passaggio» su tiro fuori — 1 caso

**p02 · «🏃 Avanza in area»** (key `intercept`)
- **Riquadro:** «Passaggio respinto» (famiglia `blocked`)
- **Motore:** `pronto + tiro:blocked + murato + rammarico` → **tiro murato**
- **Cronaca successiva:** nessuna riga (fine della partita nella finestra di campionamento).

**s23 · «🌀 Finta e tiro»** (key `intercept`)
- **Riquadro:** «Passaggio fuori misura» (famiglia `wide`)
- **Motore:** `pronto + tuffo + tiro:fuori + rammarico + pressione` → **tiro fuori**
- **Cronaca successiva:** «🤝 Il capitano lo raggiunge e gli batte una mano sul petto…» — non riguarda la scena.

Nei due casi la **famiglia** è giusta (murato = `blocked`, fuori = `wide`); è sbagliato il **lessico** («passaggio» al posto di «tiro»). Il rapporto di Codex segnalava «Finta e tiro» con tiro murato raccontato come «passaggio respinto»: nei miei dati il caso con tiro murato è «Avanza in area», e «Finta e tiro» compare con lessico di passaggio ma con tiro fuori. Non riproduco il caso esatto di Codex. Riproduzione: 2 casi lessicali su 66.

### 4.3 Discordanze del tipo «riquadro senza famiglia»

Non sono contraddizioni: «Fermato dall'avversario» (p08 «Conduci palla al piede e tira») e «Ci prova ma viene chiuso» (s20) sono compatibili con il tiro murato registrato dal motore. Le escludo dal conteggio.

## 5. Dove il riquadro sceglie il tipo d'errore — causa, IPOTESI

**Nota:** le cause sono lette dal codice e coerenti con i casi, ma **non ho ancora misurato la catena completa**: vanno marcate come ipotesi finché un guardiano non le verifica.

1. **Lessico di passaggio su un tiro (§4.2).** `_hlOvlCat` manda **ogni** `intercept` a `pass_fail` (`CARRIER-MANAGER-AV.html:4632`). `hlOverlay` poi sceglie il pool di passaggio con `_pas218` (riga 4651) e `pool = _MISS_OVL_PASS[_nk]` (riga 4652): il lessico dipende dalla **chiave** (`intercept`), mentre la famiglia `_nk` viene dal `outKind`. Il motore, invece, registra un tiro. **IPOTESI:** il lessico è scelto dalla chiave e non dalla famiglia del tiro registrata dal motore; la famiglia (`fam`) resta corretta, per questo la tabella per famiglia non la vede.
2. **Fuorigioco contro intercetto (§4.1).** `_outKind` nasce da `decideExecution(_di)` (riga 35468), dove `_di` vale `onetwo` per il passaggio e può tornare `offside`. Gli eventi del motore nascono invece da `risolviEroe.eventi(key, …)` (riga 35624, con la definizione a riga 26584), dove la chiave `intercept` produce `intercetto`. Sono **due fonti diverse per la stessa scena**: `outKind` decide il riquadro, `key` decide il motore. **IPOTESI:** il riquadro legge un esito che il motore non registra.

Il testimone `__CPM_RES218` è scritto alla riga 35624 e contiene entrambe le fonti: è da lì che si legge la discordanza.

## 6. Cosa non ho fatto

- Non ho misurato la famiglia **assist** (0 scene nel campione).
- Non ho portato il campione a 60 scene **per famiglia**: il tiro è coperto (34), gli altri meno.
- Non ho confermato la cronaca come sorgente di contraddizione (§3).
- Non ho modificato il gioco (sola lettura). Non ho aperto né confermato alcun guardiano.

## 7. Riproduzione

```bash
# worktree della build (già creato in /tmp/cpm157; npm install fatto nel suo tests/visual)
cd docs/collaudi/giro4-po218
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node probe-giro4.mjs jobs-test.json dati        # una partita (≈200 s)
node analisi.mjs                                  # tabelle e classi da dati/*.json → analisi-output.json
```
