# Rapporto — giro 194 (7.999.194)

Ramo `sviluppo/giro194-tasto-momento`, partito da `lavoro/194`. `GAME_VERSION` non toccato.
Ogni correzione del gioco ha il suo rosso `window.__CPM_NO_G194<lettera>`; il guardiano nuovo `momento-194` è stato provato verde
col verde e rosso con ciascun rosso. Foto prima/dopo a 375 px (dpr 2) in `docs/sviluppo/giro194/`.

| Lettera | Voce | Dove | Rosso |
|---|---|---|---|
| A | PO-405 l'intervista settimanale ferma il tasto | `src/18` tick della corsa, `applyInterviewAnswer` | `__CPM_NO_G194A` |
| B | PO-410 «Ok» nel riepilogo della corsa | `src/18` riepilogo `salta163-riepilogo` | `__CPM_NO_G194B` |
| C | PO-411 grafica del tasto «Vai al prossimo momento» | `src/18` card `corsa163` | `__CPM_NO_G194C` |
| D | PO-431 `convocazione-235` rosso sulla 7.999.193 | `tests/visual/convocazione-235.mjs` (strumento) | `CPM_NO_G194D=1` (variabile dello strumento) |

---

## A. PO-405 — «Perché il vai al prossimo momento è interrotto da un'intervista?»

**Causa (letta nel codice).** Il tick della corsa (`src/18`, `_saltaStop163`) si fermava su *qualsiasi* intervista aperta:
`if(interviewModal)return _saltaStop163("intervista")`. L'intervista della foto è quella **settimanale** (`matchCtx:"weekly"`),
aperta da `liveCurrentWeek` (15% delle settimane da professionista, 4% in Primavera).

**Correzione (decisione PO).** Durante la corsa, se l'intervista aperta è settimanale:
- risponde da sola col **tono abituale** del giocatore (`_tonoAbituale194`), sulle due domande (domanda e rilancio del
  giornalista), chiamando lo stesso `applyInterviewAnswer` del tocco: effetti identici a una scelta (morale, popolarità, fiducia,
  forma, chimica, fiducia del giornalista, riga nel diario `🎙️ [tono]`);
- chiude la prima pagina e prosegue;
- la elenca nel riepilogo fra le «Scelte fatte da solo»: «sett. N «Intervista settimanale: tono Diplomatico»»;
- durante la corsa la finestra non lampeggia a schermo (non viene disegnata finché la corsa la gestisce).

Le altre interviste (post-partita, pre-partita, presentazione) **fermano ancora** la corsa; fuori dal tasto l'intervista settimanale
resta com'era.

**Tono abituale.** Non esisteva uno storico dei toni. Ho aggiunto il campo additivo `player.ivToni194`
(`{diplomatico,diretto,umile}`), che cresce solo con le risposte **date dal giocatore** (le automatiche non lo spostano, così non si
autoalimentano). Per i salvataggi senza il campo il tono si conta dal diario (`player.log`, righe `🎙️ [tono]`, massimo 60 righe di
diario). Nessuna storia → Diplomatico; parità con il Diplomatico in testa → Diplomatico. Nessun bump di `SAVE_VERSION` (campo
facoltativo, letto con default).

**Misura (momento-194, parte A, gioco vero `?cpmtest=1`, intervista settimanale aperta subito dopo «Vai»):**

| Caso | Fermata | Risposta da sola | Diario | Storico dopo |
|---|---|---|---|---|
| pro, storico umile 3 / diplomatico 1 | partita chiave | umile | `🎙️ [umile]` ×2 | invariato |
| pro, nessuna storia | partita chiave | diplomatico | `🎙️ [diplomatico]` ×2 | invariato (assente) |
| pro, storia solo nel diario (2 ambizioso, 1 umile) | partita chiave | diretto (Ambizioso) | `🎙️ [diretto]` | invariato (assente) |
| Primavera, nessuna storia | partita chiave | diplomatico | `🎙️ [diplomatico]` ×2 | invariato (assente) |
| **rosso** `__CPM_NO_G194A` | **intervista** | nessuna | — | — |

## B. PO-410 — via l'«Ok» dal riepilogo della corsa

**Correzione.** Il riepilogo non ha più il tasto «Ok». Quando compare si fotografa lo stato (stagione, settimana, settimana vissuta,
partite giocate); il riepilogo sparisce da solo appena quello stato cambia (si vive la settimana, si simula, si avanza, si gioca) o
si entra in campo (`screen==="match"`). Una nuova corsa del tasto lo azzerava già.

**Misura (momento-194, parte B, 375 px):** verde — riepilogo «⚽ Partita chiave · 🥀 Derby …» presente, nessun «Ok», ancora a
schermo dopo 2,5 s senza azioni, sparito dopo l'azione «simula». Rosso `__CPM_NO_G194B` — «Ok» presente e riepilogo ancora a
schermo dopo l'azione → bocciato.
Foto: `prima-riepilogo-con-ok-375.png`, `dopo-riepilogo-senza-ok-375.png`.

## C. PO-411 — il tasto «Vai al prossimo momento»

**Correzione (decisione PO).** Tasto pieno nel colore del club (`player.club.c`), titolo in grassetto maiuscolo (stessa scala del
tasto principale della card «Prossima»), sotto in piccolo dove si fermerà, dalla stessa proiezione del pannello di conferma
(`_saltaPrev163`): «fino alla partita chiave · sett. N» oppure «fino a fine stagione». L'inchiostro è quello del kit
(`inkSu945`: bianco o notte, il più contrastato sul colore). Spento: fondo traccia come il tasto «Avanza» spento, il motivo resta
sotto. Il caso rinnovo (giro 173) resta: tasto velato, il tocco apre la trattativa.

**Contrasto misurato (momento-194, parte C, 375 px):**

| Club | Colore | Titolo | Riga piccola | Peso titolo | Altezza |
|---|---|---|---|---|---|
| chiaro (Torino Athletic) | `#f5f5f5` | 17,58:1 | 17,58:1 | 800 | 63 px |
| scuro (FC Tyneside) | `#0f0f0f` | 19,17:1 | 19,17:1 | 800 | 63 px |
| FC Merseyside (foto PO) | `#dc2626` | 4,83:1 | 4,83:1 | 800 | 63 px |

Nessuno scorrimento orizzontale. Rosso `__CPM_NO_G194C` (tasto secondario di prima): fondo non del club, nessuna riga «fino a» →
bocciato su tutti e tre. Foto: `prima-/dopo-tasto-{chiaro,scuro,merseyside}-375.png`.

## D. PO-431 — `convocazione-235` rosso («card del kit 0»)

**Causa misurata: difetto dello STRUMENTO, non del gioco.** Il guardiano contava le card del kit pretendendo
`borderTopLeftRadius === 12` scritto a mano. Dal giro 110 (`_g110(25)` in `src/11`, `Card`) la Card del kit ha raggio `RAD.lg` =
**16**: nessuna card poteva superare il filtro, quindi «0» in tutti e quattro i casi (verde e rosso). `NationalCallupScreen` non
c'entra: monta 3 `Card` nel verde e il rosso (`__CPM_NO_235`) ne ha 2.

**Correzione.** Il guardiano legge il raggio da una `Card` vera montata dal gioco caricato (non più un numero scritto a mano).
Misura dopo: verde 3 card (raggio 16) in tutti e quattro i casi → verde; rosso `__CPM_NO_235` 2 card + gradiente + bottone non
primario → bocciato. Prova del rosso dello strumento: `CPM_NO_G194D=1` (torna il 12 fisso) → di nuovo «card del kit 0», uscita 1.

---

## Controlli (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

ESITI_CONTROLLI

## Dubbi per il PO (non decisi da me)

1. **«Pieno nel colore del club»**: ho usato il colore sociale **vivo** (`club.c`), non quello smorzato verso la notte del riquadro
   «Prossima» (`fondoClub106`). Con FC Merseyside il tasto è quindi rosso acceso (4,83:1, sopra 4,5 ma di poco); sui club bianchi è
   un tasto chiaro con testo scuro. Se preferisce lo stesso tono smorzato della card «Prossima», è una riga.
2. **Tono abituale con poca storia**: lo storico nuovo (`ivToni194`) parte da questa versione; per i salvataggi esistenti si legge
   dal diario, che tiene solo le ultime 60 righe di tutti i tipi, quindi la «storia» vecchia può essere corta o assente
   (→ Diplomatico).
3. **Nocomment**: il tono «no comment» del rilancio non entra nel conto del tono abituale (le tre voci della domanda sono
   Diplomatico / Ambizioso / Umile).
4. **Riepilogo e «Gioca»**: la sparizione all'ingresso in campo (`screen==="match"`) è nel codice ma il guardiano misura solo
   l'azione «simula»; l'ingresso in campo non è provato da una sonda.
5. **Riga «fino a»**: è una proiezione con la classifica di oggi (la stessa del pannello di conferma); la corsa può fermarsi prima
   su mercato, chiamate, scelte di storia, infortuni. Se la settimana corrente ha già la partita chiave il tasto dice
   «fino alla partita chiave · sett. <questa>».
6. **Roadmap**: la riga di `docs/governo/ROADMAP.md` non l'ho scritta su questo ramo (i giri precedenti la lasciano alla sessione di
   rilascio su `lavoro/194`).
