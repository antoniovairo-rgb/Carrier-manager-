# Rapporto giro 287 — pre-partita da PC, la nota dentro il pulsante (PO-546)

Versione di destinazione: 7.999.198 rapida (decisione PO 19/11 «Nella 198 rapida»). Ramo `sviluppo/giro287-prepartita-pc`, partito da `lavoro/198`.
Solo grafica, nessun cambio di funzione. `GAME_VERSION` non toccata. Home e `<select>` non toccati (giro 284 in parallelo).

## Cosa ha chiesto il PO

Foto da PC (~1457×672, pre-partita del provino «Selezione Granata vs …»): «non si capisce che la nota è collegata ad un pulsante specifico».
Scelta PO: **«Dentro il pulsante»**. In più: il riquadro della partita da PC ha molto vuoto sopra e sotto la riga stadio/spettatori/meteo/orario.

## Dove stavano le note staccate (ricerca nel sorgente)

| Punto | Sorgente | Stato prima | Dopo |
|---|---|---|---|
| Pre-partita, tutte le competizioni e il provino (giri 243/246/253) — `solo-243-nota` | `src/13` `MatchdayCard` | riga staccata sotto la pila | sottotitolo dentro il tasto |
| Prompt della partita (giro 166/229) — `solo-166-nota` | `src/18` | riga staccata; oggi il tasto lì non si vede (giro 246: vive solo nella pre-partita) | sottotitolo dentro il tasto (coerenza, se il tasto tornasse) |
| Nazionale / Coppa delle Nazioni / Europeo-Mondiale (giro 229: `solo-229-nc`, `solo-229-em`) | `src/18` | nessuna nota | invariato (spenti dal giro 246) |
| `riserva2d205-nota` | `src/15` | non è la nota di un pulsante (dicitura «Versione 2D») | invariato |

La panchina e la Nazionale passano dalla stessa `MatchdayCard`: il punto unico del giro 243/246 copre tutte le competizioni.

## Cosa è cambiato

- `src/01`: interruttore `_g287()` (rosso `window.__CPM_NO_G287`) e `sotto287(cpm,testo)`, il sottotitolo piccolo del tasto (FS.caption, colore `TH.muted` = `TINTE.sec`, va a capo).
- `src/13`: «Gioca solo i momenti salienti» porta la nota come sottotitolo; la testata è marcata `data-cpm="testata287"`, la riga stadio/spettatori/meteo/orario `data-cpm="pp-info287"`.
- `src/18`: stesso sottotitolo per `solo-166`.
- `src/19`: da PC (≥ 900 px) la pre-partita prende l'altezza dal contenuto: la testata non si allunga più (`space-evenly` del giro 114 spento solo da PC), i tasti seguono la testata, la riga stadio/spettatori/meteo/orario va su quattro colonne. **Telefono invariato** (sotto 900 px nessuna regola nuova).
- Guardiani `salienti-243`, `salienti-246`, `salienti-253` e `lib/partita-166.mjs`: l'etichetta del tasto si legge **senza** la nota (clono il tasto e tolgo `[data-cpm$="-nota"]`); la nota si cerca sempre col suo `data-cpm`. Nessuna soglia toccata, stesse regex.
- Guardiano nuovo `npm run prepartita-287` (registrato in `ci-runner.mjs`: catena completa e mappa src/12|13).

## Misure (rettangoli del DOM, pre-partita vera del provino)

«Vuoti» = spazio verticale fra il bordo interno della testata e la prima riga, fra le righe, e fra l'ultima riga e il bordo interno (px).

| Schermo | Prima: nota | Prima: vuoti testata · altezza | Dopo: nota | Dopo: vuoti testata · altezza | Dopo: margine sotto l'ultimo tasto |
|---|---|---|---|---|---|
| 1366×768 | staccata (sotto il tasto, 8 px) | 61 · 76 · 73 · 61 — h 519 | dentro il tasto | 0 · 16 · 12 · 0 — h 240 | 319 px liberi |
| 1457×672 (foto PO) | staccata | 37 · 52 · 49 · 37 — h 423 | dentro | 0 · 16 · 12 · 0 — h 240 | 223 px |
| 1920×1080 | staccata | 139 · 154 · 151 · 139 — h 831 | dentro | 0 · 16 · 12 · 0 — h 240 | 631 px |
| 360×800 | staccata | 57 · 74 · 69 · 57 — h 533 | dentro | 61 · 76 · 73 · 61 — h 547 (invariato, giro 114) | 28 px |
| 412×915 | staccata | 90 · 105 · 102 · 89 — h 648 | dentro | 93 · 109 · 105 · 93 — h 662 (invariato) | 28 px |

Al telefono la testata si accorcia di 14 px perché il tasto dei salienti cresce (ora contiene la nota): i tasti restano ≥ 44 px, la nota non si taglia.

**Soglia V = 40 px, misurata:** il vuoto più grande «naturale» dopo la correzione è 16 px (i margini del kit fra stemmi e riga info); il più piccolo vuoto massimo del difetto da PC è 52 px (1457×672). 40 sta fra i due, con margine da entrambi.

Foto: `docs/sviluppo/giro287/prima/` e `docs/sviluppo/giro287/dopo/` (in `dopo/` anche i bracci `-rosso`).

## Guardiano `prepartita-287`

- **N** ogni nota di pulsante dentro il rettangolo del suo pulsante (e suo discendente) · **S** nessun testo non-pulsante nella pila dei tasti · **L** etichetta e nota giuste · **V** (PC) nessun vuoto > 40 px nella testata · **P** (1366×768, 1457×672) tutti i tasti interi senza scorrere · **T** (telefono) tasti ≥ 44 px, nota non tagliata, tasto intero · **E** nessun errore di pagina.
- Verde: 5/5 misure verdi. Rosso (`__CPM_NO_G287`): cade su N e S a tutte le misure e su V a tutte le misure da PC. «Non giudicato» = rosso.

## Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Controllo | Esito |
|---|---|
| `prepartita-287` (nuovo) | ✅ verde 5/5 misure · rosso cade su N, S, V |
| `salienti-243` | ✅ verde passa · rosso cade |
| `salienti-246` | ✅ verde passa · rosso cade su ogni percorso |
| `salienti-229` | ✅ verde passa · rosso cade |
| `salienti-253` (adeguato anche lui, non richiesto) | ✅ verde passa · rosso cade su ogni parte |
| `griglia-mobile` | ✅ uscita 0, 14 schermate × 5 larghezze (le sue foto in `docs/collaudo-grafico/g0/` rimesse con `git checkout --`) |
| `design-system` | ✅ sistema grafico OK |
| `tema-unico` | ✅ verde + rosso atteso |
| `career-critical` | ✅ PASS |
| `test:logic` | ✅ |
| `save-compat` | ✅ 12 pass · 0 fail |
| `node tools/build-src.mjs` + `node tools/check-src.mjs` | ✅ IDENTICO byte per byte |

Non eseguiti per mandato: `highlight-95`, `ingresso-206`, `ci-runner.mjs mirata`.

## Dubbi per il PO

1. **Da PC ora resta vuoto SOTTO i tasti** (a 1920×1080 circa 630 px): la richiesta era «altezza dal contenuto», quindi la pila sta subito sotto la testata e la pagina finisce lì. In alternativa si può centrare il blocco in verticale da PC: non l'ho fatto perché non richiesto.
2. **Quattro colonne per stadio/spettatori/meteo/orario da PC**: le ho messe per togliere la seconda riga mezza vuota. Su un nome di stadio lungo a 900-1000 px la colonna può troncare con «…» (già previsto dallo stile esistente); al telefono restano due colonne.
3. **Il telefono ha ancora i vuoti del giro 114** (testata che riempie lo schermo, 57-109 px fra le righe): è la «schermata piena» decisa nel giro 114 e il mandato diceva di non cambiare il telefono. Se il PO vuole la stessa compattezza anche lì, è una riga CSS.
4. Il tasto dei salienti nel **prompt della partita** (`solo-166`) oggi non si vede (giro 246); l'ho aggiornato lo stesso per coerenza se tornasse.
5. Roadmap: non ho scritto la riga in `docs/governo/ROADMAP.md` perché il giro confluisce nella 7.999.198 rapida (lavoro in parallelo col giro 284): la riga va scritta da chi integra la 198.
