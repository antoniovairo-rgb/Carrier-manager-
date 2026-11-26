# Giro 411 — PO-677: l'uscita dal tunnel dei giocatori

**Base:** `lavoro/202` (7.999.216 + giro 401). **Ramo:** `sviluppo/giro411-tunnel`. GAME_VERSION e `docs/governo` non toccati.

**Parole del PO (26/11, sulla 7.999.216):** «Tunnel dei giocatori è ancora da migliorare. Sembrano appiccicati al tunnel e piano piano
si staccano. Non c'è un effetto 3D realistico».

## 1. Cosa ho misurato prima di toccare (No Blind Fix)

Sonda e guardiano: `tests/visual/tunnel-411.mjs` (percorso vero: salvataggio → partita → ingresso in campo), **corpi 3D accesi**,
**notte a ora congelata** (`__CPM_TOD=night`), una pagina nuova per stadio e per vista (**telefono 412×915** e **PC 1366×768**), un
campione ogni **0,5 s di tempo di scena** fino a 6 s, con foto. Tre bocche diverse: `comunale` (tubo telescopico, 6,6 u),
`borgo` (pensilina, bocca sul muro), `arena` (tubo di vetro, 9,4 u). Il «prima» è il braccio rosso `window.__CPM_NO_G411`, che
rimette esattamente il comportamento della base (piano nero, attesa alla bocca, asta e drappi dove stavano).

Causa letta nel codice e confermata dai numeri:

- la bocca era un **piano nero** appoggiato sulla faccia di un **blocco pieno** (il basamento della Tribuna Ovest, alto 3): nessun
  interno; davanti, l'asta della bandiera di centro e i due drappi ultras (alti 3,4, da y 0,72 a 4,12) che arrivavano a x ±0,5,
  cioè coprivano gran parte della bocca;
- i 12 corpi di ogni squadra partivano **tutti dallo stesso punto** (x ±1,3, z −36, a 0,1 dalla bocca) e se ne staccavano **uno
  ogni 0,65 s**: è esattamente «appiccicati al tunnel e piano piano si staccano».

## 2. Numeri prima / dopo

| misura | prima (rosso, telefono, 3 stadi) | dopo (verde, telefono + PC, 3 stadi) |
|---|---|---|
| profondità visibile oltre la bocca (raggio orizzontale, corpi e veli esclusi) | comunale 6,48 (il tubo fino al piano nero) · borgo **−0,02** · arena 8,03 (l'asta) | comunale **19,62** · borgo **10,83** · arena **13,99** |
| corpi che nascono dentro (oltre 0,5 u dalla soglia, primo campione) | **0 / 22** | **20 / 22** (i due primi della fila sono già sulla soglia) |
| coppie di corpi visibili impilate (< 0,5 u fra i centri) | **110** (= 2 × 55: le due colonne intere) | **0** |
| corpi-campione fermi alla bocca (< 0,3 u/s entro 1 u dalla soglia) | **96** | **0** |
| corpi nelle pareti del tunnel | 0 | 0 |
| velocità prima di uscire / dopo l'uscita (mediana, tempo di scena) | 0 / 2,2 u/s | **2,2 / 2,2 u/s** (= passo d'ingresso `WALK_V245`, tetto 2,3 non toccato) |
| scivolamento (fotogrammi in moto con cadenza della clip oltre il 25% dalla velocità vera, o in moto con la clip di riposo) | 7,8% su 592 | **2,8%** su 1650 |
| trasmittanza della luce, soglia → petto (mediana; giudicata) | — (nessun corpo dentro) | dentro **0,26 / 0,21 / 0,41** · fuori **1** |
| riscontro dalla foto: luminanza del petto dentro / fuori (riportata, non giudicata) | — | comunale 0,21 / 0,45-0,46 · borgo 0,21 / 0,40-0,42 |
| ombre: corpi appena usciti dentro la camera d'ombra del sole, mappa d'ombra accesa | 30 / 30 | 28 / 28 |

Guardiano: **verde 6/6** (3 stadi × telefono/PC) e **rosso visto 3/3** (`npm run tunnel-411`).

## 3. Foto (telefono: a sinistra prima, a destra dopo)

- `docs/collaudo-po/411-comunale-telefono-prima-dopo-t1.png` e `…-t2.png` (1 s e 2 s di scena)
- `docs/collaudo-po/411-borgo-telefono-prima-dopo-t1.png` e `…-t2.png`
- `docs/collaudo-po/411-arena-telefono-prima-dopo-t1.png` e `…-t2.png`
- PC, dopo: `docs/collaudo-po/411-comunale-pc-dopo-t1.png`, `docs/collaudo-po/411-arena-pc-dopo-t1.png`

## 4. Cosa ho cambiato (alla sorgente)

1. **Un corridoio vero nel basamento** della Tribuna Ovest: il blocco pieno diventa tre blocchi (due ai lati, uno dietro) più il
   soffitto; dentro pavimento, pareti, soffitto, fondo nero e tre plafoniere. Largo quanto la luce della bocca (5,4), profondo fin
   davanti alla struttura posteriore della tribuna (al massimo 14). La fascia della competizione sul muretto si interrompe sulla bocca.
2. **Il buio cresce con la profondità**: veli neri trasparenti in fila, uno ogni ~1 u (il primo, sulla soglia, più forte: 0,36; poi
   0,20). Scuriscono ciò che sta dietro di loro — corpi compresi — **senza toccare i materiali dei corpi** (giro 412 parallelo).
   Nel tubo di vetro dell'arena il buio comincia nel basamento: il tubo resta chiaro.
3. **La colonna nasce dentro e cammina**: chi ha il ritardo d'uscita *d* sta, all'inizio dell'ingresso, a *d* × passo dentro il
   corridoio sulla sua colonna e arriva alla bocca esattamente all'orario di prima. Nessun cambio di durata dell'ingresso, dei tagli
   di camera (giro 80) né del passo (giro 54). Chi non sta nel corridoio visibile aspetta nascosto nel blocco dietro il fondo.
   Ai tagli di montaggio (giro 80) chi era ancora dentro esce prima dalla bocca (mai attraverso la parete).
4. **Varco libero**: il pilone di centro della copertura e l'asta di centro della Tribuna Ovest si spostano di lato (x 3,3); i due
   drappi ultras del muro Ovest vanno da x ±3,4 a ±23,4 (prima ±0,5 … ±23,5).

**Peso e prestazioni sul telefono (dichiarati, non misurati in fps: gli fps headless non provano nulla):** +4 piani, 1 fondo,
3 plafoniere, fino a 14 veli (geometrie condivise), +3 blocchi del basamento, +1 tratto di fascia; 6 materiali nuovi senza texture,
**nessun asset nuovo**. I veli sono trasparenti: sovrapposizione solo nell'area dello schermo occupata dalla bocca, e solo quando la
camera ci guarda dentro (i primi ~3 s dell'ingresso). Ombre: dentro il corridoio il pavimento non riceve l'ombra del sole (è coperto);
fuori la mappa d'ombra è quella di prima.

## 5. File e funzioni toccati

- `src/11-ui-kit-highlight.jsx` — `buildStadium`: `_v411` alla chiamata di `addStand` della Tribuna Ovest; blocco del tunnel
  (corridoio, plafoniere, veli, `g411` in `__CPM_STADI246.tunnel` e nel ritorno `tunnel`); `addStand`: `opts.varco411` (basamento in tre
  blocchi + soffitto, fascia della competizione in due tratti, piloni della copertura fuori dal corridoio).
- `src/12-three-match-view.jsx` — `ThreeMatchView`: `_G411`/`_in411`/`_z411` e il ramo di `animWalk` per chi è nel tunnel; `_toTunnel`
  (partenza dentro); `_adv285` (taglio: uscita dalla bocca); asta di centro (`_fx411` in `_mkFlag`); drappi del muro Ovest (`_s411`);
  testimoni di sola prova `__CPM_T411()` (+ `__CPM_T411H`, `__CPM_T411C`) e `__CPM_W411` (nel ciclo di locomozione dei corpi).
- `CARRIER-MANAGER-AV.html` — ricomposto con `tools/build-src.mjs`.
- `tests/visual/tunnel-411.mjs` (nuovo guardiano/sonda), `tests/visual/package.json` (`npm run tunnel-411`), `tests/visual/ci-runner.mjs`
  (riga della MAPPA `src/12|src/13`, che esiste già).
- `docs/collaudo-po/411-*.png`, questo rapporto.

## 6. Rituali

`node ci-runner.mjs giro tunnel-411 tunnel-245 ingresso-245 ingresso-camminata-245 ingresso-277 ingresso-285 ingresso-294 ingresso-206
walkout-fermi-197 fila-206 ingresso-276 ingresso-59` (= guardiani della zona + le 17 sentinelle, fra cui `tunnel-285` e `mappa-unica`).
Esito: vedi sezione 8.

## 7. Dubbi per il PO (la consigliata è la prima, ed è già applicata)

1. **Quanto buio dentro il tunnel?**
   - **(a) applicata** — buio deciso ma leggibile: trasmittanza ~0,2-0,4 già a 2 u dentro; i primi della fila si riconoscono, i
     più lontani sono sagome.
   - (b) più buio: a 4 u dentro i corpi sono quasi neri (più drammatico, si vede meno la fila).
   - (c) più chiaro: si vedono bene tutti, effetto «galleria» più leggero.
2. **Arena (tubo di vetro)**
   - **(a) applicata** — il tubo di vetro resta chiaro, il buio comincia nel basamento.
   - (b) buio anche nel tubo: da fuori il vetro mostrerebbe lastre scure di traverso.
   - (c) tubo opaco come negli altri stadi.
3. **Stadi piccoli: la colonna è più lunga del corridoio visibile**
   - **(a) applicata** — gli ultimi aspettano nascosti dietro il fondo e appaiono dal buio quando tocca a loro.
   - (b) avvicinare i compagni nella fila (0,65 s → 0,5 s fra uno e l'altro): colonna più corta, ingresso un po' più rapido.
   - (c) quattro colonne (due per squadra): colonna dimezzata ma bocca più affollata.
4. **I due drappi ultras sul muro Ovest**
   - **(a) applicata** — restano, più stretti (20 invece di 23), da x ±3,4: la bocca è libera.
   - (b) toglierli dal muro Ovest.
   - (c) alzarli sopra la bocca.

Non posso confermare la resa sul telefono vero (fps, sensazione della luce): i numeri sono del banco headless e vanno collaudati sul
dispositivo.

## 8. Esito dei rituali
`node ci-runner.mjs giro tunnel-411 tunnel-245 ingresso-245 ingresso-camminata-245 ingresso-277 ingresso-285 ingresso-294 ingresso-206
walkout-fermi-197 fila-206 ingresso-276 ingresso-59` sul commit del giro: **28/29 verdi**. Verdi: tunnel-411 (257 s), tunnel-245
(764 s), tunnel-285, ingresso-245, ingresso-camminata-245, ingresso-277, ingresso-285, ingresso-294, ingresso-206, ingresso-276,
walkout-fermi-197, fila-206 e tutte le 17 sentinelle (mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system,
tema-unico, griglia-mobile, career-critical, battito-264, partita-vera, render-3d-023, tunnel-285, gk-dive-sync, home-298,
schermate-97, web-237).

**Unico rosso: `ingresso-59` («ingresso ancora a scatti», blocchi del thread principale durante la camminata) — PREESISTENTE.**
Già annotato in `docs/governo/DECISIONI.md` (rosso anche sulla 7.999.176, fuori da ogni catena dal 7.999.59). Confrontato sulla stessa
macchina, a macchina scarica, uno dopo l'altro: base `lavoro/202` **178 blocchi · 30,6 s in blocco · massimo 265 ms**; questo ramo
**178 blocchi · 29,3 s · massimo 236 ms**. Il giro non lo peggiora; non l'ho riparato (fuori ambito).

I file che i guardiani riscrivono durante il giro (`docs/governo/STABILITA.json`, le foto di `docs/collaudo-grafico/g0`) sono stati
riportati com'erano: questo giro non tocca `docs/governo`.
