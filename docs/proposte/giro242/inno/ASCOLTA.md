# Ascolta — i tre inni candidati (PO-476, giro 267)

Anteprime per ascoltare dal telefono i candidati della sezione B di `../../PROPOSTE-giro242.md`. **Nessun file entra nel gioco**:
sono solo materiale di scelta. La scena dell'inno dura **7,05 s** (giro 206).

Licenza riverificata il **18/11/2026** sulla pagina di ciascun brano (campo «License(s)» di OpenGameArt): **CC0** per tutti e tre.
CC0 = dedica al pubblico dominio: uso commerciale libero, **nessuna attribuzione obbligatoria**.

Come sono fatte le anteprime: dal file originale scaricato dalla pagina, convertite in **mono**, portate a **−18 LUFS** integrati
(misurati −18,4/−18,5: lo stesso livello per tutte, così si confrontano a pari volume; −18 è il livello dei brani del gioco), MP3
48-64 kb/s per il brano intero, 96 kb/s per i tagli. I tagli hanno 0,2 s di dissolvenza in entrata e 0,6 s in uscita.

| # | Brano | Autore | Pagina | Licenza (testo della pagina) | Anteprima | Durata | Peso |
|---|---|---|---|---|---|---|---|
| 1 | Production Theme Intro [Epic Orchestra] | nene | <https://opengameart.org/content/production-theme-intro-epic-orchestra> | «License(s): CC0» | [brano intero](1-production-theme-intro-anteprima.mp3) | 12,0 s | 96.592 B (0,10 MB) |
| 2 | Original hymn — versione «orchestral build» | Bobjt | <https://opengameart.org/content/original-hymn> | «License(s): CC0» | [brano intero](2-original-hymn-orchestral-build-anteprima.mp3) | 63,7 s | 382.503 B (0,38 MB) |
| 2 | ↳ taglio da 7 s | | | | [46,5 → 53,5 s](2-original-hymn-taglio-46.5-53.5s.mp3) | 7,0 s | 84.681 B (0,08 MB) |
| 3 | A Legend Will Rise (Orchestral) | CodeManu | <https://opengameart.org/content/a-legend-will-rise-orchestral> | «License(s): CC0» · descrizione: «No attribution required but always appreciated» | [brano intero](3-a-legend-will-rise-anteprima.mp3) | 69,6 s | 418.238 B (0,42 MB) |
| 3 | ↳ taglio da 7 s | | | | [41,5 → 48,5 s](3-a-legend-will-rise-taglio-41.5-48.5s.mp3) | 7,0 s | 84.681 B (0,08 MB) |

## Perché questi secondi (solo misura, non ascolto)

Non posso ascoltare i brani: i tagli sono scelti **dal volume misurato** (loudness momentanea, ffmpeg `ebur128`), cercando un tratto
che parta più basso e salga, come un ingresso in campo. Va giudicato a orecchio.

- **#1** — nessun taglio: è già lungo 12,0 s, di cui i primi ~2,9 s sono silenzio (la musica vera è ~9 s). Nell'anteprima il
  silenzio iniziale è lasciato com'è, per far sentire il file originale.
- **#2, 46,5 → 53,5 s** — il punto più basso della seconda metà è a 46-47 s (−16,4 LUFS momentanei); da lì il brano sale fino a
  −10,8 a 53 s, il tratto più forte del brano. Il taglio è l'intera salita.
- **#3, 41,5 → 48,5 s** — chiude sul punto più forte del brano (−6,5 LUFS momentanei a 48 s), dentro il crescendo che dura da 31 a
  48 s. Parte già forte (−8,4): è un taglio «pieno», non una salita. Alternativa misurata con più salita: 30,5 → 37,5 s (da −13,5 a
  −10,1), non prodotta.

## Impronte

| File originale scaricato (non nel repo) | Byte | sha256 (inizio) | Uguale al giro 242 |
|---|---|---|---|
| `Production_Intro_Theme.wav` | 2.116.310 | `65aca17e6c1b0ff0` | sì |
| `4-hymn-orchestral-build.mp3` | 1.277.827 | `4fb2b140e27d701f` | sì |
| `A Legend Will Rise.mp3` | 2.785.768 | `6c38472a541777c3` | sì |
