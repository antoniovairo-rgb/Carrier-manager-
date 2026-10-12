# Rapporto giro 7 — schermate fuori standard sul telefono (L7)

Ramo: `sviluppo/haiku-l7-pulizia-l8` · base: `origin/main` 995835f (7.999.159) · `GAME_VERSION` **non** toccata (la sessione principale la aggiorna all'unione).
Perimetro: solo presentazione. Nessuna modifica a motore partita, carriera, economia, salvataggi.

## 1. Misura (prima della correzione)

**Strumento:** `tests/visual/l7-schermate.mjs` (nuovo). Apre la carriera a tre salvataggi, a 360 · 375 · 412 px, e misura su dashboard e pre-partita:
S1 sforamento orizzontale · S2 testo tagliato in orizzontale · S3 testo tagliato in verticale · S4 testo sotto 11 px · S5 sovrapposizioni fra blocchi di testo.

**Salvataggi.** La fase *fine stagione* è reale (`tests/visual/fixtures/save-190-s12-ovr93.json`, stagione 12, settimana 38). Le fasi *inizio* (0 partite giocate) e *metà* (20 giocate) sono **sintetiche**: stesso salvataggio con calendario riscritto. Non sono carriere vere.

**Foto prima:** `docs/sviluppo/foto-l7/prima/` (dashboard e pre-partita, 15 file).

| Schermata | Sforamenti | Testo tagliato (orizz.) | Testo tagliato (vert.) | Sotto 11 px | Sovrapposizioni |
|---|---|---|---|---|---|
| Dashboard · inizio · 360/375/412 | 0 | **1 per larghezza** | 0 | 0 | 0 |
| Dashboard · meta · 360/375/412 | 0 | **1 per larghezza** | 0 | 0 | 0 |
| Dashboard · fine · 360/375/412 | 0 | **1 per larghezza** | 0 | 0 | 0 |
| Pre-partita · meta e fine · 360/375/412 | 0 | 0 | 0 | 0 | 0 |

Il testo tagliato è sempre lo stesso nodo: la riga `FC Merseyside · Premier Division · St. 12 …` nell'intestazione della carriera. La parte tagliata è proprio «Sett. 38/38 · 1° posto», cioè la settimana e la posizione.

**Strada scartata nella misura.** La prima passata dava 12–19 «sovrapposizioni» per larghezza. Erano: (a) la barra d'ambiente `TEST` / `KE 7.999.159` (`src/19-app-root.jsx:879-880`, mostrata su ogni host diverso da github.io); (b) contenuto che scorre sotto la barra fissa in basso (nav, «Sostieni il gioco», «Idee e feedback»). Non sono difetti del layout: le ho escluse dalla misura, dichiarandolo nel codice del guardiano.

**Osservato in foto, non misurato come difetto:** spazio vuoto sotto i pulsanti del pre-partita (circa 120 px a 360 px di larghezza). Non lo dichiaro difetto perché non ho una soglia.

## 2. Difetti trovati, corretti, rimasti

### Corretto — D1: riga della carriera tagliata
- **Dove:** `src/18-career-app.jsx` ~7140–7144 (intestazione carriera).
- **Causa misurata:** la riga stagione·settimana·posto era `nowrap` con ellissi: su 360–412 px cadeva proprio la parte che conta («St. 12», «Sett. 38/38», «1° posto»).
- **Correzione:** la riga va a capo (`lineHeight:1.3` al posto di `nowrap`/ellissi).
- **Interruttore rosso:** `window.__CPM_NO_L7_SUB` riporta il comportamento vecchio.
- **Prima / dopo:** `docs/sviluppo/foto-l7/prima/fine-dashboard-360.png` → `docs/sviluppo/foto-l7/dopo/fine-dashboard-360.png`. Dopo: «Sett. 38/38 · 1° posto» leggibile su due righe; l'intestazione cresce di una riga.
- **Costo misurato:** la pagina è più alta di 16 px a 360 px (griglia-mobile: 1652 → 1668 px su Dashboard).

### Rimasto (dichiarato, non corretto)
1. **Barra d'ambiente «TEST» / «KE versione»** (`src/19-app-root.jsx:879-880`). Il codice la mostra per ogni host diverso da `github.io`. Sul sito è verde «PRODUCTION». **Non verificato** se la build store (Capacitor) compaia con «TEST»: non ho fatto la prova sul guscio. È una scelta da decidere col PO, non un difetto di layout: non l'ho toccata.
2. **Pre-partita della fase «inizio» non misurato.** Il sintetico a 0 partite giocate restituisce `playMatch → nomatch`. Non ho ricostruito la causa: nessuna misura su quella fase.
3. **Foto solo sulla parte alta della pagina.** Il contenuto scorre in un contenitore interno; `fullPage` non lo cattura. La misura invece scansiona tutto il DOM, quindi gli sforamenti sono giudicati sull'intera pagina; le foto no.

## 3. Guardiano L7

- **File:** `tests/visual/l7-schermate.mjs`, aggiunto in `package.json` come `l7-schermate` (guardiano, con `CPM_L7_GUARDIA=1`) e `l7-schermate:misura`.
- **Catena:** aggiunto il passo `l7-schermate` in coda alla catena `grafica` di `tests/visual/ci-runner.mjs`.
- **Verdetto bloccante:** sforamento orizzontale, testo tagliato in orizzontale o verticale, su dashboard e pre-partita, a 360 · 375 · 412.
- **Prova del rosso:** `CPM_L7_ROSSO=__CPM_NO_L7_SUB CPM_L7_GUARDIA=1 node l7-schermate.mjs` → **esce 1** (9 schermate della dashboard con «sforo/tagliato»). Con la correzione attiva → **esce 0**.
- **Limite dichiarato:** il testo sotto 11 px e le sovrapposizioni sono solo riportati, non bloccanti (le sovrapposizioni escludono per costruzione il contenuto che scorre sotto le barre fisse).

## 4. Catena grafica — `node ci-runner.mjs grafica`

**Esito: 29/30 verdi. NON VERDE.** Log: `docs/sviluppo/grafica-giro7.log`.
- ✅ griglia-mobile · design-system · test:logic · save-compat · l7-schermate (guardiano) · career-critical · le altre schede di grafica.
- ❌ **movimento-147** — rosso. Il controllo richiede almeno 100 campioni di compagni/avversari prima dell'azione, e fermi ≤ 25 % nel verde / ≥ 30 % nel rosso.

**Perché movimento-147 è rosso, misurato.** Il numero che fallisce è `campioniCompagni < 100`, non la quota di fermi:

| Corsa | Build | Campioni compagni (verde) | Fermi verde | Esito |
|---|---|---|---|---|
| isolata | mia | 61 | 0 % | ❌ |
| isolata 2 | mia | 80 | 10 % | ❌ |
| dentro la catena | mia | 87 | 25,3 % (riga di log, etichetta non chiara) | ❌ |
| base 1 | origin/main | 124 | 9,7 % | ✅ |
| base 2 | origin/main | 79 | 8,9 % | ❌ |

Sul ramo base è rosso anche una volta su due: il problema preesiste alla mia modifica, come soglia su un conteggio di campioni sensibile al tempo. **Ma:** sulla mia build è rosso 3 corse su 3, sul base 1 corsa su 2. Con due corse di base non posso escludere un effetto. Per confermarlo servono più corse per parte, e in questa sessione ogni corsa costa 5–10 minuti. Non posso confermarlo.

Non ho abbassato la soglia né saltato il controllo: sarebbe un guardiano spento. La sua stabilità è un lavoro a parte (suggerimento: misurare i campioni a tempo fisso invece che a conteggio).

Log delle corse di base: `docs/sviluppo/movimento-main-giro7-1.log` e `…-2.log`; corse sulla mia build: `docs/sviluppo/movimento-giro7.log` e `…-b.log`.

## 5. Foto

- `docs/sviluppo/foto-l7/prima/` — prima della correzione (15 file, dashboard e pre-partita, 3 fasi × 3 larghezze + pre-partita).
- `docs/sviluppo/foto-l7/dopo/` — dopo la correzione (15 file).
- `docs/sviluppo/foto-l7/rosso/` — con l'interruttore rosso acceso, e `misura.json` di quella corsa.
- `docs/collaudo-grafico/g0/` — rigenerate dalla griglia-mobile della catena (cambiano perché la riga della carriera è presente in ogni scheda).

## 6. Esito

**CHIUSO / NON CHIUSO: NON CHIUSO.** Motivo: la catena grafica è 29/30, non verde. L'unico rosso è `movimento-147`, controllo sul movimento in partita che non ho toccato. Sul ramo base è rosso in una corsa su due, quindi preesiste; ma sulla mia build la prova è 3 su 3 contro 1 su 2 sul base, e due corse di base non bastano a escludere un effetto. Il difetto L7 è corretto, misurato e guardato; il rilascio resta bloccato dal guardiano del movimento.

**NON CHIUSO** — catena grafica 29/30 (movimento-147 rosso, soglia sui campioni; preesiste in una corsa su due su origin/main, ma la prova non esclude un effetto della mia build).
