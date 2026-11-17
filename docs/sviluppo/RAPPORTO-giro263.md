# Rapporto giro 263 — PO-514 «Pulsanti tra di loro sproporzionati»

Base `lavoro/197` (7.999.196, `GAME_VERSION` non toccata) · ramo `sviluppo/giro263-home-pulsanti`.
Foto del PO: `docs/collaudo-po/196-home-pulsanti-sproporzionati.jpg` (Home, scheda «Prossima», Mondiale vs Belgio prima del club).

## Decisione applicata (della madre, notte 17/11)

I due pulsanti della scheda «Prossima» (principale `avanza23` e `simula-v2`) hanno la stessa larghezza e la stessa altezza in ogni
caso e a ogni larghezza; il titolo del principale sta in al piu' 2 righe, il dettaglio in una riga che puo' troncare con «…»; nel
pulsante non c'e' piu' «poi: …» (c'e' gia' la riga «Poi:» sopra); il motivo del pulsante spento resta leggibile. Cosa fanno i
pulsanti: invariato.

## Causa misurata

`src/18-career-app.jsx`, scheda `prossima-v2`: il principale era `flex:1 1 0` mentre Simula era `flex:0 1 auto; min-width:96px`.
Simula prendeva quindi la larghezza del proprio testo e il principale si prendeva il resto: col motivo lungo «prima il torneo della
Nazionale» Simula si allargava e il principale si stringeva fino a spezzarsi su 9 righe (la foto del PO); senza motivo succedeva
l'opposto (Simula a 107 px, principale fino a 855 px su PC).

## Misure (sonda-guardiano `tests/visual/pulsanti-263.mjs`, `docs/sviluppo/giro263/misure-263.json`)

Larghezza principale / Simula in px, righe del titolo, righe del dettaglio.

| caso | larghezza | PRIMA | DOPO |
|---|---|---|---|
| nazionale (Mondiale, Simula spento) | 360 | 91 / 206 (0,44) · titolo 4 · dettaglio 5 · altezza 176 | 145 / 152 (0,96) · 2 · 1 · altezza 72 |
| nazionale | 375 | 106 / 206 (0,52) · 4 · 5 | 153 / 159 (0,96) · 2 · 1 |
| nazionale | 412 | 139 / 206 (0,67) · 2 · 4 | 169 / 176 (0,96) · 2 · 1 |
| nazionale | 1366 | 757 / 206 (3,68) · 1 · 1 | 478 / 485 (0,99) · 2 · 1 |
| club | 360 / 1366 | 190 / 108 (1,77) / 855 / 108 (7,96) | 146 / 151 (0,97) / 479 / 484 (0,99) |
| coppa | 360 | 190 / 108 (1,77) | 146 / 151 (0,97) |
| settimana da vivere (Simula spento) | 360 | 136 / 162 (0,84) · dettaglio 2 | 145 / 152 (0,96) · dettaglio 1 |
| infortunio (Simula spento) | 360 | 182 / 116 (1,57) | 145 / 152 (0,96) |

Altezze dei due pulsanti uguali in tutti i 20 casi (la riga li stira). Motivo del pulsante spento: 12 px, contrasto 13,2:1, mai
troncato (va a capo, al piu' 2 righe a 360). La differenza residua di ~6 px fra le due larghezze e' il bordo tratteggiato/padding
diverso del pulsante Simula.

Foto `prima-*` (braccio rosso) e `dopo-*` (verde) in `docs/sviluppo/giro263/`, per caso e larghezza.

## Correzione

- `src/18`: Simula `flex:1 1 0; min-width:0` come il principale.
- Titolo: se contiene « vs », due righe ciascuna su una riga sola con «…» («🌍 Mondiale» / «vs Belgio», «⚽ Gioca» / «vs FC Lariano»);
  altrimenti al piu' 2 righe (line-clamp).
- Dettaglio: una riga con «…»; se la card mostra la riga «Poi:», si toglie dal dettaglio la coda « · poi: …».
- Rosso `window.__CPM_NO_G263`: torna esattamente com'era.

## Guardiani

- **nuovo `pulsanti-263`** (`npm run pulsanti-263`, in `completa`, `carriera` e nella MAPPA di src/18): 5 casi (club · nazionale ·
  coppa · settimana · infortunio) × 4 larghezze (360 · 375 · 412 · 1366). Verde: rapporto 0,95–1,05, altezze ±2 px, titolo ≤ 2 righe,
  dettaglio ≤ 1 riga, nessun «poi:» nel pulsante, Simula acceso/spento come atteso, motivo presente ≥ 11 px contrasto ≥ 4,5 e non
  troncato; non giudicato = rosso. **Verde 20/20; rosso `__CPM_NO_G263` 20/20 caduti** (nazionale al telefono 3/3).
- **`prossima-131` adeguato**: i controlli dei giri 134/137 pretendevano «poi: <club> W.N» DENTRO il pulsante (decisioni PO-335 e
  PO-340). Ora valgono sul pulsante di prima: i bracci `rosso134`/`rosso137w` girano con `__CPM_NO_G263`, e c'e' un braccio nuovo
  `storico263` (solo `__CPM_NO_G263`, deve passare tutto come prima); nel verde si pretende che il pulsante NON contenga «poi:».

## Controlli eseguiti (uno alla volta, CPM_CHROME=/opt/pw-browsers/chromium)

ESITI: vedi sezione in fondo (aggiornata a fine giro).

## Dubbi per il PO

1. **Contrasto con decisioni gia' prese.** Togliere «poi: <club> W.N» dal pulsante rovescia PO-335 («Sì», giro 134: il pulsante
   dell'amichevole diceva «poi: <club> W.N» come Coppa Nazioni/Euro) e rende senza oggetto PO-340 (giro 137, «Tieni insieme club e
   W.N»). L'ho fatto perche' la decisione di stanotte lo chiede esplicitamente; il guardiano `prossima-131` conserva le vecchie prove
   sul braccio `__CPM_NO_G263`. Se il PO preferisce il «poi:» nel pulsante, va rimesso nel dettaglio (che pero' a 360 verrebbe troncato).
2. **Nomi lunghi troncati.** A 360 «vs Real Castilla Atlético» diventa «VS REAL CAST…» e il dettaglio «Coppa · Ottavi di fi…»; nel
   caso Mondiale il dettaglio diventa «Coppa del Mondo · …» e perde «Giornata 1/3». Tutte queste informazioni sono gia' scritte per
   intero nella card (testata e nomi delle squadre), ma il PO potrebbe preferire un titolo su 2 righe senza troncare (rischio: 3 righe
   con un nome lungo) o un corpo piu' piccolo.
3. **Coppa Nazioni**: il titolo «🌍 Gioca vs Francia — Coppa Nazioni» diventa «🌍 Gioca» / «vs Francia — Coppa Nazioni», la seconda
   riga a 360 viene troncata dopo il nome. Non misurato dal guardiano (i suoi casi Nazionale sono Mondiale/Europeo).
4. Il pulsante principale e Simula restano diversi di ~6 px (bordo tratteggiato del pulsante spento): dentro la tolleranza decisa
   (0,95–1,05), ma non identici al pixel.
5. All'inizio del giro ho lanciato per errore `node ci-runner.mjs mirata lavoro/197 --elenco` (l'esecutore non ha un'opzione
   «elenco»): con i `node_modules` non ancora installati e' fallito subito su ogni passo ed e' stato interrotto in pochi secondi; non ha
   scritto `docs/governo/STABILITA.json` (stato git pulito subito dopo).
