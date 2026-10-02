# Prompt per Codex — 02/10/2026 · banco deterministico e verifiche su CPM 7.999.104

Base: `main` al commit `a118c4ce`, `GAME_VERSION="7.999.104"`. Lavora su un ramo `codex/2026-10-02-banco-deterministico`.
Regole invariate: scrivi solo in `reports/codex/` e `tests/codex/`; nessuna modifica al gioco, nessuna pull request, nessun merge,
nessun deploy. Ogni rilievo è un'ipotesi finché non lo riproduciamo noi.

## Perché

Sul ricollaudo difesa 3D (7.999.91) hai segnalato 002 (eroe o pallone fuori quadro) in 8 casi. Lo abbiamo misurato con la sonda
`tests/visual/inquadratura-185.mjs`: a orologio vero, in headless, il pallone risultava fuori quadro nel 22–32% dei fotogrammi, con
variazioni enormi tra un giro e l'altro (la stessa scena dava 12% o 53%). Il rumore aveva tre fonti, ora neutralizzate:

1. **Il tempo.** A pochi fotogrammi al secondo la camera non raggiunge la sua inquadratura prima che la scena si chiuda.
   Rimedio: **orologio virtuale** — `performance.now()` avanza di 1000/30 ms a ogni `requestAnimationFrame`, quindi la scena
   è funzione del numero di fotogrammi e non dell'orologio a muro.
2. **Il caso.** La scena usa `Math.random` non seedato (traiettorie, respinte). Rimedio: **`Math.random` a seme fisso** per scena+giro,
   identico nei bracci da confrontare.
3. **L'istante della risoluzione.** In fase di scelta il pallone avanza: risolvere dopo un'attesa fissa lo trova in punti diversi.
   Rimedio: **aggancio** — si risolve appena il pallone, dopo essersi mosso dalla posizione precedente alla forzatura, resta fermo
   per 3 fotogrammi.

Con i tre accorgimenti due giri con lo stesso seme escono identici fotogramma per fotogramma, e su 10 casi difensivi il pallone fuori
quadro scende al **5%** (eroe 0%). Residuo: gi45, 1–4 fotogrammi all'ingresso della camera.

Il codice dei tre accorgimenti è in `tests/visual/inquadratura-185.mjs` (variabili `CPM_OROLOGIO`, `CPM_SEME`, `CPM_FISSA`);
il comando pronto è `npm run inquadratura-185` dalla cartella `tests/visual`. Copia gli `addInitScript` nelle tue sonde.

## Compiti

### A. Ricollaudo difesa 3D col banco deterministico
Stesse 16 scene del ricollaudo 7.999.91 (azione canonica 0, success e fail), con orologio virtuale + seme + aggancio, pagina nuova per
caso, procedurale (`__CPM_GLB=false`) **e** GLB acceso, 412×915. Per ogni caso: quota di fotogrammi con eroe fuori quadro e con pallone
fuori quadro (testimone `window.__CPM_FRAME480`: campi `n/fuori` eroe, `bn/bfuori` pallone, `a12/afuori/abfuori` prime 12 letture),
e la tua lettura dei sei scatti con i codici 001/002/003. Riporta **due giri con lo stesso seme** per almeno 4 scene, per dimostrare che
il banco è ripetibile sulla tua macchina. Dichiara i giri scartati e il motivo.

### B. Carriere: la «settimana ferma» (PO-181) deve essere sparita
Rigioca il seme 6 fino alla stagione 8 oltre la settimana 24. Atteso: dopo le due qualificazioni dell'Europeo il passo di carriera
avanza (`simulated`/`lived`/`advanced`), alla W.24 la fase diventa `group`. Con `window.__CPM_NO181=1` deve tornare il blocco a W.21
(`blocked:euroMondiale`): riportalo come prova del rosso.

### C. Carriere: le 198 osservazioni di contratto oltre la scadenza
Distingui: stato ripetuto dallo stesso passo (il banco che non rinnova) oppure contratti che restano davvero scaduti in carriere che
avanzano. Per ogni caso: seme, stagione, settimana, `contract.expiresAtSeason`, `proStatus`, e se esiste un'offerta pendente.

## Consegna
Rapporto `reports/codex/2026-10-02-banco-deterministico.md`, grezzi in `tests/codex/`, commit e push sul ramo. Messaggio finale con
ramo, commit e una riga per compito (A/B/C) con l'esito.
