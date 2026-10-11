# PO-221 su 7.999.158 — 60 partite vere + prova del rosso (collaudo, sola lettura)

Build: `poc/marioprada-character-system` @ 7.999.158 (verificata: `const GAME_VERSION="7.999.158"` in `CARRIER-MANAGER-AV.html` della worktree `/tmp/cpm158`, build `CPM_FORZA_BUILD=1 node tools/build-src.mjs`, 56.521 righe).
Metodo: identico al giro PO-221 sulla 7.999.157 — salvataggio `save-190-s12-ovr93`, nome diverso per partita (`Samuelito Vairo k`), autoplay `seeded`, GLB spento, `__CPM_PRESENT=1`, `__CPM_REC=true`. Sonda: `po221-partite.mjs` (questa cartella). Per la prova del rosso: `po221-rosso.mjs`, identica ma con `window.__CPM_NO_TETTO7=1` e `window.__CPM_NO_PZTOT221=1`.

Dati grezzi: `po221-158-a/b/c/d.jsonl` (60 partite, una riga per partita) · aggregato `po221-aggregato158.json`.
Rosso: `po221-rosso158-a/b/c/d.jsonl` (20 partite, k=1..20, stessi nomi del verde) · aggregato `po221-rosso158-aggregato.json`.
Aggregatore: `po221-aggregato158.mjs`.

## 1. Esito del giro (60 partite, guardiani accesi)

- **60/60 partite arrivate al fischio finale** (`fine` = `ceremony`). **0 errori. 0 partite non arrivate al fischio.**

### Scene dell'eroe (`__CPM_CAST219`, 1 voce = 1 scena)
| Indicatore | 7.999.158 | 7.999.157 (confronto) | Obiettivo PO |
|---|---|---|---|
| Media (tutte le scene) | **6,68** | 8,53 | 5–7 |
| Mediana | **7** | 9 | — |
| Min / max | 1 / 9 | 3 / 15 | — |
| Media senza rigori | **6,47** | — | — |
| Partite con più di 7 scene senza rigori | **0** | — | — |
| Partite con più di 8 scene totali | **1** (k=16: 9 scene, di cui 2 rigori) | — | — |

Distribuzione scene totali (partite): 1→1 · 2→1 · 3→1 · 5→6 · 6→4 · 7→36 · 8→10 · 9→1.
Distribuzione senza rigori: 1→1 · 2→1 · 3→1 · 5→6 · 6→5 · 7→46. **Il tetto a 7 scene (senza rigori) si vede: nessuna partita lo supera.**
Le 10 partite a 8 scene totali (k=5,20,27,30,35,40,42,54,56,58) hanno tutte esattamente **un rigore** (8 scene = 7 di gioco + 1 rigore); k=16, a 9 scene, ha 2 rigori.
Obiettivo PO «5–7»: **media 6,68 dentro**; mediana 7 dentro.

### Gol e assist dell'eroe (`__CPM_RES218`, `ok && key`)
- **Gol a partita: media 0,50** (0 gol 36 partite · 1 gol 19 · 2 gol 4 · 3 gol 1). Riferimento 157: 0,62. Obiettivo PO 0,6–0,9: **sotto l'intervallo** (0,50).
- **Assist a partita: media 0,25** (0 assist 46 · 1 assist 13 · 2 assist 1). Riferimento 157: 0,27.

### Punizioni a partita (`tipo === "punizione"` in `__CPM_CAST219`)
- **Media 0,62, mediana 1** (0 punizioni 23 partite · 1 punizione 37 partite).
- **Partite con più di 1 punizione: 0.** Il limite «mai più di 1» è rispettato su 60 partite.
- Riferimento 157: 1,48 a partita (89 punizioni in 60 partite). Su 7.999.158: 37 punizioni in 60 partite.

### Tipi di scena (60 partite, 401 scene totali)
fra-le-linee 131 · conclusione 72 · cross 60 · difesa 58 · punizione 37 · spalle 20 · angolo 10 · rigore 13.

## 2. Prova del rosso (20 partite, k=1..20, guardiani spenti)

Con `window.__CPM_NO_TETTO7=1` e `window.__CPM_NO_PZTOT221=1`:
- **Scene totali: media 8,55, mediana 8,5, max 14.** Partite con più di 8 scene totali: **10 su 20**.
- **Scene senza rigori: media 8,15. Partite con più di 7 scene senza rigori: 13 su 20** (di cui 4 con un rigore). Il tetto torna sopra 8 scene: **il guardiano del tetto NON è cieco**.
- **Punizioni: media 1,55. Partite con più di 1 punizione: 8 su 20** (massimo 6). Il limite di punizione torna sopra 1: **il guardiano non è cieco**.
- Gol: media 0,75 · assist: media 0,30 (su 20 partite, rumore alto: non confrontabile con il verde a 60).
- 20/20 partite arrivate al fischio finale, 0 errori.

Confronto verde/rosso sulle **stesse 20 partite (k=1..20)**: il verde ha tutte le partite ≤7 scene di gioco e ≤1 punizione; il rosso ne ha 13 e 8 oltre soglia. **La differenza è attribuibile ai due guardiani.**

## 3. Limiti e cautele
- Il seme nasce da avversario+stagione+settimana+nome: 60 nomi diversi danno 60 partite diverse, ma tutte dello stesso salvataggio S12. Non misura l'intero campionato.
- Autoplay `seeded` a `tickMs=150`: misura il gioco nella modalità di collaudo, non la partita giocata a mano.
- Il conteggio «scene» viene dal registro `__CPM_CAST219` (una voce per scena aperta dall'eroe): non è una misura di tutto il flusso di partita.
- Il confronto con il 157 usa il rapporto già pubblicato (`PO221-60partite.md`); non è stato rieseguito sul 157.
- Il valore «gol 0,50» è sotto l'intervallo PO 0,6–0,9: lo riporto come dato, senza spiegarne la causa (non l'ho misurata).

## 4. Riferimenti nel build (7.999.158)
- Tetto a 7 scene e limite punizioni: guardiani `__CPM_NO_TETTO7` / `__CPM_NO_PZTOT221` (grep `CARRIER-MANAGER-AV.html` della worktree; 4 occorrenze in totale fra i due flag).
- Registro scene `__CPM_CAST219` e esiti `__CPM_RES218`: come nel rapporto 157.

## 5. PO-220 (opzionale)
**Non eseguito in questo giro.** Il punto 3 (ripetizione delle 22 difese con GLB acceso e nome della clip per gesto `lunge`/`slide`) richiede un nuovo giro della sonda `po220-difesa.mjs` su 7.999.158 con GLB acceso: non l'ho ancora lanciato.
Mappatura della clip dal codice (7.999.158, verificata in lettura):
- `GESTI` tabella: `tackle:{base:{clip:'tackle'},lunge:{clip:'kick'},slide:{clip:'tackle'}}` — `CARRIER-MANAGER-AV.html:15750`.
- `gestoDi(famiglia,variante)` legge questa tabella: la sua definizione NON l'ho ancora localizzata con file:riga (la chiamata compare a `CARRIER-MANAGER-AV.html:15738`); la lettura `lunge` → `kick`, `slide` → `tackle` discende dalla tabella `GESTI` sopra.
- File GLB: `./assets/korward-regular-anims/regular-anim-kick.glb` e `regular-anim-tackle.glb` — caricati in `CARRIER-MANAGER-AV.html:13863`.
- Quale gesto viene deciso (`defGesto` = `lunge`/`slide`) è in `CARRIER-MANAGER-AV.html:3199-3227`.
Per scena: nome della clip = `kick` (lunge) o `tackle` (slide), da quella mappatura; la scena precisa del giro 220 andrà confermata quando il giro sarà eseguito.

## Riepilogo per il PO
1. **Scene: media 6,68 dentro 5–7** (mediana 7). Nessuna partita sopra 7 scene senza rigori; una sola sopra 8 scene totali, con 2 rigori.
2. **Gol 0,50 e assist 0,25** a partita: il gol è sotto l'intervallo 0,6–0,9.
3. **Punizioni: mai più di 1 a partita** su 60 (media 0,62).
4. **60/60 al fischio finale.**
5. **Prova del rosso: il tetto a 7 e il limite a 1 punizione sono entrambi sopra soglia senza i guardiani** (13/20 e 8/20). I guardiani non sono ciechi.
