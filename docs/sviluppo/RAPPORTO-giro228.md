# Rapporto giro 228 — PO-493 (Rosa del Club: ruoli in sigla, nomi non più tagliati)

Ramo `sviluppo/giro228-rosa-ruoli`, partito da `lavoro/196`. `GAME_VERSION` non toccata (la porta la sessione di rilascio,
consegna «7.999.196»). Roadmap non toccata per lo stesso motivo: la riga la scrive chi spedisce la versione.
Foto del PO: `docs/collaudo-po/195-rosa-ruoli-lunghi-nomi-tagliati.jpg` (ramo `poc/marioprada-character-system`).

## 1. Misura prima

Sonda nuova `tests/visual/misura-228.mjs` (non guardiano): gioco vero `?cpmtest=1`, salvataggio sintetico di `misura-199`,
60 club scelti a passo fisso fra i 252 di `__CPM_CLUBS`, Club › Rosa aperta, per ogni riga lo span del nome è «tagliato» se
`scrollWidth > clientWidth`. 24 righe per club (23 della rosa + il titolare spostato in panchina dal 7.999.49).

| larghezza | righe | nomi tagliati | di cui sotto 18 caratteri |
|---|---|---|---|
| 360 px | 1440 | **110** | **100** |
| 412 px | 1440 | **6** | **4** |

Esempi a 360: «Diego De Luca [CENTROCAMPISTA] 73/74 px», «Ivan Pepe [CENTROCAMPISTA U21] 42/50», «Edoardo Mancini [DIFENSORE jolly] 77/86».
A 412 restano solo le righe con «CENTROCAMPISTA» + etichetta U21/jolly. Causa confermata: in `renderRow`
(`src/18-career-app.jsx`) il ruolo è `whiteSpace:nowrap` e non si restringe; il nome (`flex:1, minWidth:0`) è l'unico che cede.

## 2. Correzione

- Funzione unica riusabile **`siglaRuolo228(r)`** in `src/09-audio-scout-anagrafiche.jsx` (accanto a `generateTeamRoster`, che
  produce i ruoli). Solo testo mostrato: le regex che classificano i ruoli (`_roleCat` in src/18, src/13, src/15) non sono toccate
  e continuano a leggere `pl.role` per esteso.
- Sigle della decisione PO 16/11: POR · DIF (difensore/centrale) · TER · MED · CEN (centrocampista/interno/regista) · MEZ · TRQ ·
  ALA (ala/esterno) · ATT (attaccante/punta) · CTR.
- **Sigle scelte da me per ruoli non in elenco** (da confermare, vedi Dubbi): `libero`/`stopper` → DIF; `fascia` → ALA;
  `Jolly` → JOL; `Under-21` → U21; codici già brevi: GK→POR, DEF→DIF, MID/CC/TC→CEN, DM→MED, AM→TRQ, CF→CTR, FWD/FW/ST→ATT,
  ogni altro codice di 2-3 lettere resta com'è in maiuscolo (es. il ruolo dell'eroe salvato come «ATT»); qualunque altro ruolo
  sconosciuto → le prime tre lettere in maiuscolo. Nelle rose generate oggi Jolly/Under-21 non arrivano mai alla sigla: la
  Rosa li sostituisce già con un ruolo di campo + etichetta (7.999.49).
- Riga della Rosa: ruolo in sigla, span `flexShrink:0`, ruolo intero in `title` e `aria-label` («Ruolo: Centrocampista · U21»),
  marcatore `data-cpm="rosa-ruolo228"`. Le etichette jolly/U21 restano accanto, invariate.
- Rosso **`window.__CPM_NO_G228`**: si torna al ruolo per esteso, senza title/aria-label (com'era).

## 3. Misura dopo (stessa sonda, stessi 60 club)

| larghezza | righe | nomi tagliati | sotto 18 caratteri |
|---|---|---|---|
| 360 px | 1440 | **0** | 0 |
| 412 px | 1440 | **0** | 0 |

Il nome più lungo incontrato è di 21 caratteri e a 360 px entra anche lui. Foto a 360 px: `docs/sviluppo/giro228/prima-rosa-360.png`
(rosso) e `dopo-rosa-360.png` (la fotografia dell'elemento mostra una fascia scura in alto: è la barra fissa della pagina sopra la
fisarmonica, non un difetto della riga).

## 4. Altre liste di giocatori cercate

Cercati in `src/` tutti gli span con ellissi accanto a nomi/ruoli e tutti i punti che mostrano `.role`:
- **Mercato d'apertura stagione** (wizard, `src/18` ~7743, e card della home ~9081, oggi spenta da `_OPENING_HOME_CARDS`):
  mostra «→ Nome · ruolo · saluta Nome». Lì nessuno span è `nowrap` con ellissi: la riga va a capo, il nome **non viene tagliato
  per costruzione**. Non corretta (la consegna dice di correggere solo dove il ruolo taglia il nome). Non l'ho misurata a pixel.
- **Formazione / prepartita** (`src/13`): i nomi sono sotto i pallini del campo, senza ruolo accanto. Fuori ambito.
- **Duello capocannoniere** (`src/18` ~9135): nome con ellissi ma accanto c'è il club, non il ruolo. Fuori ambito.
- **Figurina** (`src/01` ~493): ruolo su una riga separata dal nome. Fuori ambito.
- **Offerte** (`src/16` ~88): ruolo in una riga di testo che va a capo. Fuori ambito.

## 5. Guardiano

`tests/visual/rosa-228.mjs` (`npm run rosa-228`): 360 px, eroe con ruolo per esteso «Centrocampista», 24 club (576 righe,
minimo 480 altrimenti «non giudicato» = rosso). Pretende: ogni ruolo in sigla `^[A-Z0-9]{3}$` (etichetta jolly/U21 a parte),
title e aria-label col ruolo intero, nessun nome sotto i 18 caratteri tagliato. Uscita 0 solo con verde ok **e** rosso bocciato.

- VERDE: 24 club · 576 righe · ruoli non in sigla 0 · senza ruolo intero 0 · nomi <18 tagliati 0 · nomi ≥18 tagliati 0
- ROSSO `__CPM_NO_G228`: bocciato · ruoli non in sigla 527 · senza ruolo intero 576 · nomi <18 tagliati 65 · nomi ≥18 tagliati 4

Messo una sola volta nelle catene `completa` e `carriera` di `ci-runner.mjs`, nei LENTI e nella mappa mirata di `src/18`
(`node --check` ok, nessun doppione nelle due catene).

## 6. Controlli (uno alla volta, build `node tools/build-src.mjs` + `check-src` IDENTICO BYTE PER BYTE)

| controllo | esito |
|---|---|
| rosa-228 | ✅ verde + rosso bocciato |
| career-critical | ✅ FINE 0 (superati i 10 minuti: fatto girare in sottofondo con registro e atteso fino alla riga FINE) |
| rifiniture-200 | ✅ 10/10 verde, 10/10 rosso bocciato |
| home-199 | ✅ verde |
| save-compat | ✅ 12 pass · 0 fail |
| test:logic | ✅ 51/51 |

Le foto di `docs/sviluppo/giro199/` e `giro200/` rigenerate dai controlli sono state rimesse con `git checkout --`.

## Dubbi per il PO

1. **Sigle fuori elenco scelte da me**: JOL (jolly), U21 (under-21), libero/stopper → DIF, «fascia» → ALA, e i codici inglesi
   (GK/DEF/MID/DM/AM/CF/FW/ST). Oggi nelle rose generate nessuno di questi arriva a schermo come sigla; vanno confermate.
2. **«Leggibile al tocco»**: il ruolo intero è in `title` (passandoci sopra col mouse) e `aria-label` (lettore di schermo).
   Sul telefono un tocco **non** mostra il ruolo intero: se lo si vuole, serve un piccolo fumetto al tocco (non fatto, è una
   scelta d'interfaccia).
3. **Pallino del reparto + sigla**: la riga ha già la lettera del reparto (P/D/C/A) e ora anche la sigla (es. «C … CEN»):
   due informazioni vicine e un po' ridondanti. Le ho lasciate entrambe come da consegna.
4. **Mercato d'apertura stagione**: lì il ruolo resta per esteso (non taglia nomi, va a capo). Se per coerenza si vogliono le
   sigle ovunque, `siglaRuolo228` è pronta per essere usata anche lì.
