# Rapporto giro 438 — PO-632: ritaratura della pelle nella parata

Base: `main` 7.999.218 (f3cf45c). Ramo: `sviluppo/giro438-resa-parata`. `GAME_VERSION` e `docs/governo` non toccati.

## Cosa ha chiesto il PO

Dubbio 3 del giro 331, scelta «Media e ritaratura»: ritarare `RESA240.parata` con la misura nuova (riquadro del viso
di lato 36%, giro 331), giro breve. `walkout-fermi-197` resta com'e' (media della finestra peggiore di 0,5 s): non l'ho toccato.

## Misura prima (No Blind Fix)

`CPM_SCENE=parata CPM_SOLO=verde CPM_MISURA=1 node pelle-240.mjs`, GLB acceso, alle tre ore:

| ora | mediana | massima |
|---|---|---|
| notte | 7,0 | 10,5 |
| tramonto | 7,0 | 9,8 |
| giorno | 7,2 | 10,5 |

La parata non dipende dall'ora (i rgb resi coincidono al decimale fra le tre corse). Lo scarto era sistematico per lato:

- eroe: reso 228,191,164 contro figurina 225,173,141 → troppo giallo/chiaro su verde e blu;
- tetto-dx (4 corpi): tutti piu' scuri della figurina (es. 190,125,90 contro 219,153,116, dE 10,5);
- tetto-sx (3 corpi): rosso un po' basso (197,146,123 contro 218,156,129).

## Correzione (solo la parata)

`src/16-scene-3d-cerimonie.jsx`, `RESA240.parata`: per ogni lato il fattore nuovo = fattore vecchio × media geometrica di
`fL(figurina)/fL(reso)` per canale, sui corpi misurati nelle tre ore (eroe 3 misure, tetto-sx 9, tetto-dx 12).

| lato | prima | dopo |
|---|---|---|
| eroe | 0,362 · 0,267 · 0,255 | 0,351 · 0,214 · 0,183 |
| tetto-sx | 0,47 · 0,37 · 0,355 | 0,556 · 0,366 · 0,338 |
| tetto-dx | 0,179 · 0,111 · 0,090 | 0,228 · 0,142 · 0,112 |

Rosso: `window.__CPM_NO_G438` fa leggere a `resa240` i valori di prima (`RESA240_PARATA_331`), solo per la scena `parata`.
`ESP240` non toccato. Il giro 433 (carnagione scura, `SCURA433` dentro `_pelle225`) non tocca `RESA240`: nessun conflitto di
testo. ⚠️ Quando entrambi arrivano su main, i corpi di carnagione «s» della parata (tetto-sx: volti 551 e 749; tetto-dx: 254)
riceveranno anche il fattore 0,80 del 433: la parata andra' rimisurata dopo l'unione (vedi dubbio 2).

## Misura dopo

| ora | mediana | massima |
|---|---|---|
| notte | 3,3 | 5,2 |
| tramonto | 3,3 | 5,0 |
| giorno | 3,3 | 4,9 |

Rosso `__CPM_NO_G438` (notte): mediana 7,0-7,2, massima 9,9-10,6 = la misura di prima.

**Altre scene, prima (main) e dopo (ramo), stesse corse in parallelo, verde, alle tre ore** (mediana / massima):

| scena | notte prima → dopo | tramonto prima → dopo | giorno prima → dopo |
|---|---|---|---|
| ingresso | 3,0/6,8 → 2,9/7,1 | 4,4/7,5 → 4,5/7,3 | 4,2/6,5 → 4,2/6,6 |
| serata | 6,6/8,1 → 6,3/8,4 | 6,6/8,6 → 6,3/8,5 | 6,1/8,3 → 6,6/8,5 |
| gioco | 3,8/6,3 → 4,2/6,3 | 4,1/6,5 → 3,8/6,4 | 4,0/5,7 → 3,2/5,7 |
| premiazione | 2,9/6,5 → 3,3/6,3 | 6,9/10,8 → 5,4/7,5 | 6,2/9,8 → 7,8/10,7 |
| festa | 2,2/6,7 → 5,7/7,8 | 5,1/6,9 → 3,8/8,0 | 5,8/8,0 → 4,4/5,2 |

Ingresso e serata (scene ferme) restano entro ±0,5. Gioco, premiazione e festa sono scene in movimento: cambiano i corpi in
scena fra una corsa e l'altra (premiazione 22-29 corpi, 11-14 con figurina) e i numeri oscillano in entrambe le direzioni anche
fra due corse dello stesso codice. Il codice nuovo agisce solo con `scena==='parata'` (la partita passa da `RESA240.partita`,
la serata da `RESA240.serata`, entrambi invariati), quindi quelle oscillazioni non vengono da questa modifica.

## Guardiano

`pelle-240.mjs`:
- braccio nuovo `rosso438` (solo parata, `__CPM_NO_G438`);
- controllo nuovo sulla sola parata: **mediana dei visi <= DE_PELLE/2 (6)** nel verde, e > 6 nel rosso438 (se no «il difetto
  non si vede»; un braccio senza misura = «non giudicato» = rosso). La soglia dei visi (12) e i criteri esistenti non cambiano;
- `CPM_EXTRA=<bandiere>` (solo misura) aggiunge bandiere a ogni braccio.

`npm run pelle-240` (notte): ✅ verde — parata 3,4 / 5,5; rosso 240 parata 35,6 / 42,8; rosso438 parata 7,2 / 10,6 («il rosso
si vede»). Durata 5 min 10 s.

`node ci-runner.mjs giro pelle-240`: esito nella sezione «Giro» qui sotto.

## Foto

- `docs/collaudo-po/438-parata-prima.png` · `docs/collaudo-po/438-parata-dopo.png` (scena intera, notte);
- `docs/collaudo-po/438-visi-prima-sopra-dopo-sotto.png` (primi piani del testimone: eroe, tetto-dx, tetto-sx, tetto-dx; sopra
  prima, sotto dopo). Si vede l'eroe meno giallo-pallido e il tetto-dx meno scuro.

## Dubbi per il PO

**Dubbio 1 — il controllo nuovo «mediana <= 6» sulla parata.**
1. *(consigliata, applicata)* Tenerlo: e' l'unico modo di avere un rosso visibile per una ritaratura (con la soglia 12 la
   taratura vecchia era gia' «verde» a 10,5); margini: verde 3,3-3,4, rosso 7,0-7,2.
2. Toglierlo e lasciare il solo braccio rosso «informativo» stampato senza giudizio: meno severo, ma un rosso che non giudica
   non e' un rosso.
3. Estenderlo a tutte le scene ferme (ingresso, serata): la serata oggi sta a 6,1-6,6 di mediana, quindi sarebbe rossa; servirebbe
   prima ritarare `RESA240.serata` — fuori dall'ambito di questo giro.

**Dubbio 2 — unione col giro 433 (carnagione scura).**
1. *(consigliata, applicata come nota)* Unire i due giri cosi' come sono e rimisurare la parata dopo l'unione: i tre corpi «s» della
   parata riceveranno anche il fattore 0,80 del 433; se la mediana restasse <= 6 non serve altro.
2. Ritarare la parata DOPO il 433, sul ramo unito: piu' preciso, ma fa aspettare questo giro.
3. Escludere la parata dal fattore del 433: sconsigliata, due regole diverse per la stessa pelle.

**Dubbio 3 — un fattore per lato o un fattore per corpo.**
1. *(consigliata, applicata)* Per lato (come era): la luce della parata e' fissa per lato, e dopo la ritaratura il peggior viso
   sta a 5,5.
2. Per corpo: azzererebbe anche il residuo (tetto-dx volto 650 a 5,2), ma lega la taratura ai volti estratti oggi.
3. Un fattore unico per la parata: sconsigliata, l'eroe e il tetto-dx vanno in direzioni opposte (eroe troppo chiaro, tetto-dx
   troppo scuro).

## Giro

`node ci-runner.mjs giro pelle-240` sul commit di questo ramo (build 7.999.218): **18/18 verdi** — pelle-240 (270 s), mappa-unica,
test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023, tunnel-285, home-298,
web-237, career-critical, battito-264, partita-vera, gk-dive-sync, schermate-97. Nessun passo instabile.
`docs/governo/STABILITA.json` scritto dal runner non e' stato committato (regola: non toccare docs/governo).
