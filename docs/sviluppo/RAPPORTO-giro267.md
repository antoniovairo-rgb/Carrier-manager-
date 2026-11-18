# Rapporto giro 267 — PO-476: anteprime dei tre inni da ascoltare sul telefono

Ramo `sviluppo/giro267-anteprime-inno`, partito da `lavoro/197`. Versione del gioco invariata (7.999.197): **solo documenti**,
nulla in `src/`, nel gioco o nel pacchetto. Decisione PO del 18/11 07:10 («Anteprime sul telefono»), che risponde al dubbio 7 del
giro 242.

## Cosa ho fatto

1. **Licenze riverificate sulle pagine** (18/11/2026, scaricate le tre pagine OpenGameArt, letto il campo «License(s)»):
   - #1 Production Theme Intro [Epic Orchestra], nene — «License(s): CC0».
   - #2 Original hymn, Bobjt — «License(s): CC0» (la pagina ha più versioni; ho usato `4-hymn-orchestral-build.mp3`, come al 242).
   - #3 A Legend Will Rise (Orchestral), CodeManu — «License(s): CC0»; descrizione: «No attribution required but always appreciated».
   Tutti e tre CC0: uso commerciale libero senza attribuzione obbligatoria. **Nessun candidato escluso.**
2. **Scaricati** i file originali nella cartella di prova della sessione (fuori dal repo). Byte e sha256 **identici** a quelli
   registrati al giro 242 (2.116.310 · 1.277.827 · 2.785.768 B): sono gli stessi file.
3. **Anteprime MP3** in `docs/proposte/giro242/inno/` (ffmpeg, mono, −18 LUFS; misurati −18,4/−18,5):

   | File | Durata | Peso |
   |---|---|---|
   | `1-production-theme-intro-anteprima.mp3` (64 kb/s) | 12,0 s | 96.592 B |
   | `2-original-hymn-orchestral-build-anteprima.mp3` (48 kb/s) | 63,7 s | 382.503 B |
   | `2-original-hymn-taglio-46.5-53.5s.mp3` (96 kb/s) | 7,0 s | 84.681 B |
   | `3-a-legend-will-rise-anteprima.mp3` (48 kb/s) | 69,6 s | 418.238 B |
   | `3-a-legend-will-rise-taglio-41.5-48.5s.mp3` (96 kb/s) | 7,0 s | 84.681 B |

   Tutti sotto 0,5 MB; in tutto 1.066.695 B (~1,07 MB) aggiunti al repo.
4. **Tagli da 7 s** scelti dalla loudness momentanea (ffmpeg `ebur128`): #2 da 46,5 a 53,5 s (salita da −16,4 a −10,8 LUFS, il
   tratto più forte del brano); #3 da 41,5 a 48,5 s (chiude sul punto più forte, −6,5 a 48 s). Dissolvenze 0,2 s in / 0,6 s out.
5. Pagina `docs/proposte/giro242/inno/ASCOLTA.md` (titolo, autore, pagina, licenza testuale, durata, peso, link relativi) e rimando
   in `docs/proposte/PROPOSTE-giro242.md`, sezione B.

Rete: le pagine e i file OpenGameArt si sono scaricati senza blocchi (HTTP 200).

## Cosa non ho fatto

- Nessuna modifica al gioco, al pacchetto, a `GAME_VERSION`; nessun guardiano o catena eseguita (non c'è codice toccato).
- Nessuna riga nella roadmap: non è un rilascio del gioco. Se il PO la vuole anche per i giri di soli documenti, va aggiunta.
- Nessuna promozione su `main`.

## Dubbi per il PO

1. **Non ho ascoltato i brani**: i tagli da 7 s sono scelti solo dal volume misurato. Il tratto «più adatto a un ingresso in campo»
   va confermato a orecchio; se non convince, basta indicare i secondi e rifaccio il taglio.
2. **#3, quale tipo di taglio**: quello prodotto (41,5-48,5 s) è «pieno» dall'inizio e chiude sul culmine. Esiste un tratto con più
   salita, 30,5-37,5 s (da −13,5 a −10,1), che non ho prodotto. Serve anche quello?
3. **#1 col silenzio iniziale**: l'anteprima lascia i ~2,9 s di silenzio del file originale. Nel gioco andrebbero tolti (restano ~9 s,
   cioè ~2 s più della scena da 7,05 s): si allunga la scena o si accorcia il brano? (stesso dubbio 6 del giro 242, ancora aperto).
4. **Somiglianza con inni reali**: non posso confermare che nessuno dei tre ricordi un inno di competizione esistente (rischio
   d'immagine, dubbio 5 del giro 242). Si giudica ascoltando.
5. **Le anteprime restano nel repo?** Pesano ~1,07 MB in `docs/` (non nel pacchetto). Dopo la scelta si possono togliere quelle dei
   brani scartati, o lasciarle come traccia della decisione.
6. **Qualità dell'ascolto**: mono a 48 kb/s per i brani interi (per stare sotto 0,5 MB); i tagli sono a 96 kb/s e suonano meglio. Il
   giudizio sul timbro conviene darlo sui tagli o dalla pagina OpenGameArt (stereo).
