# Immagini per la scheda Google Play — elenco e stato

> Giro 236 · PO-322 · 17/11/2026. Misure prese sui file (intestazione PNG) dal guardiano `npm run store-236`, controlli S2 e S3.
> I requisiti dimensionali sono quelli già scritti nei documenti del repository (giri 116/184); **non li ho riletti oggi sulla
> pagina Google**: il modulo della Console rifiuta da solo un'immagine fuori formato, è il controllo definitivo.

| Immagine | File | Misura | Stato |
|---|---|---|---|
| Icona dell'app (scheda) | `store-assets/play-icon-512.png` | 512 × 512, PNG RGBA, 25.069 byte | pronta (giro 116) |
| Grafica in evidenza | `store-assets/feature-graphic.png` | 1024 × 500, PNG RGB (senza alfa) | pronta; **da guardare dal PO**: è generata da `tools/gen-store-graphics.mjs` |
| Screenshot telefono 1 — home | `docs/store/screenshots/01-home.png` | 1080 × 1920 (9:16) | nuovo, dal banco |
| Screenshot telefono 2 — creazione del calciatore | `docs/store/screenshots/02-creazione.png` | 1080 × 1920 | nuovo |
| Screenshot telefono 3 — plancia da professionista | `docs/store/screenshots/03-carriera.png` | 1080 × 1920 | nuovo |
| Screenshot telefono 4 — plancia, classifica e obiettivi | `docs/store/screenshots/04-plancia-classifica.png` | 1080 × 1920 | nuovo |
| Screenshot telefono 5 — partita 3D (rigore) | `docs/store/screenshots/05-partita.png` | 1080 × 1920 | nuovo, modelli 3D accesi |
| Icone Android dell'app | `resources/` (Capacitor, 1024 × 1024) · `twa/android/app/src/main/res/` (TWA) | — | presenti |
| Icone del manifest web | `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `twa/icone/icon-maskable-192.png` | come dichiarato | verificate (S2) |
| Screenshot tablet 7"/10" | — | — | **non preparati** (facoltativi per un'app solo telefono — da confermare in Console) |

## Come sono fatti gli screenshot

`CPM_CHROME=/opt/pw-browsers/chromium node tools/store-screenshots-236.mjs` — il gioco vero dal sorgente, rete esterna chiusa,
schermo 405 × 720 punti a densità 8/3 = **1080 × 1920 px esatti**. Si rifanno con lo stesso comando su ogni versione nuova.

Limiti onesti, da valutare dal PO prima di caricarli:
- sono **catture del banco** (Chrome senza scheda grafica), non di un telefono: luci e fluidità del 3D sul telefono sono diverse;
- [giro 260] rifatti sul ramo del giro 260 (base `lavoro/197`): la scritta in alto dice ancora **7.999.196**, perché `GAME_VERSION`
  nel gioco non è stato toccato (regola del giro); la TWA è già alla 7.999.197. Al rilascio della 7.999.197 la scritta cambia: si rifanno
  con lo stesso comando;
- [giro 260] home, creazione e plancia sono scattate **come nell'app** (`?app=twa`): niente «Sostieni il progetto» (decisione PO 17/11);
  lo script si ferma se lo trova nella plancia;
- la partita è un **provino** con una scena forzata (rigore): mostra la scelta della giocata, non una partita di campionato;
- i vecchi `store-assets/screenshots/` (1080 × 1920 ma con il layout da computer a 1080 px di larghezza) restano dove sono: **non
  usarli** per il telefono.
