# Giro 416 — PO-680 «da PC l'intervista si vede male»

Base: `main` = 7.999.217. Ramo: `sviluppo/giro416-intervista-pc`. GAME_VERSION e `docs/governo` non toccati.

## Il difetto, misurato (prima)

Sonda/guardiano `tests/visual/intervista-pc-416.mjs`: intervista post partita aperta col gancio di prova `forceIv183`
(salvataggio S12, corpi accesi `__CPM_GLB=true`), misure dai rettangoli del DOM.

| formato | quota scena | proporzioni (l/a) | tavolo / scena | nome sulla targa | home visibile (punti su 160) | finestra ↔ scena | vuoto fra i marchi |
|---|---|---|---|---|---|---|---|
| PC 1920×1080 | 31% | **5,73** | **28%** | 17,8 px | **140** | 106 px sotto, composizione scentrata di 106 px | **5,6×** |
| PC 1895×950 (foto PO) | 31% | **6,43** | **25%** | **14,7 px** | **140** | 61 px sotto | **5,5×** |
| PC 1366×768 | 31% | **5,74** | **28%** | **12,4 px** | **118** | 24 px | **3,8×** |
| telefono 390×844 | 31% | 1,49 | 100% | 13,2 px | 48 | 0 px | 0,55× |

Causa: la scena della sala stampa è una scatola disegnata per il telefono (129% × 40% dello schermo, ridotta a 0,775).
Su PC quella regola la stirava a tutta larghezza e al 31% dell'altezza: il pannello con i marchi diventava una fascia larga
(marchi radi e sfalsati), il tavolo (SVG con «meet») restava piccolo perché limitato dall'altezza, e la finestra della domanda
stava centrata nello spazio sotto, sopra il velo semitrasparente della home.

## La correzione (alla sorgente)

Da **1100 px di larghezza e finestra almeno 1,25 volte più larga che alta** (PC e tablet orizzontale grande):
- la scena è la **stessa scatola del telefono (503×338) ingrandita intera** → proporzioni 1,49, tavolo e marchi come sul telefono;
- scena e finestra della domanda stanno **affiancate e centrate insieme** (`data-cpm="composizione416"`);
- lo sfondo è **pieno** (`TINTE.bg` sotto il velo forte `TH.scrimForte`): la home non si vede;
- finestra larga 520 px, alta al massimo quanto lo schermo meno i margini, raggi `RAD.xl` (solo token).

Telefono, tablet verticale e finestre più strette: **invariati** (il componente restituisce i due figli tali e quali).
Rosso: `window.__CPM_NO_G416` = l'impaginazione di prima.

## Dopo

| formato | quota scena | proporzioni | tavolo / scena | targa | home visibile | finestra ↔ scena | marchi tagliati / vuoto |
|---|---|---|---|---|---|---|---|
| PC 1920×1080 | 39,1% | 1,49 | 100% | 37,2 px | 0 | affiancata, 16 px, centrata (scarti 1/1 px) | 0 / 0,55× |
| PC 1895×950 | 45,1% | 1,49 | 100% | 37,2 px | 0 | affiancata, 16 px, centrata (1/1) | 0 / 0,55× |
| PC 1366×768 | 40,7% | 1,49 | 100% | 27,0 px | 0 | affiancata, 16 px, centrata (1/0) | 0 / 0,55× |
| telefono 390×844 | identico al rosso (impronta delle misure uguale campo per campo) |||||||

Foto (corpi accesi): `docs/collaudo-po/416-prima-{pc1920,pc1895,pc1366,tel390}.png` e `416-dopo-{…}.png`.

## Guardiano

`npm run intervista-pc-416` — soglie dichiarate prima della correzione (solo PC): S1 scena ≥ 30% dello schermo · S2 proporzioni
1,3–1,7 · S3 targa ≥ 16 px e tavolo ≥ 60% della scena · S4 nessuno dei 160 punti lascia vedere la home (copertura < 0,9) ·
S5 finestra nello schermo, a ≤ 32 px dalla scena, allineata ≥ 60%, composizione centrata (scarti ≤ 24 px) · S6 nessun marchio
tagliato e vuoto fra marchi ≤ 1× la loro larghezza. Telefono: verde = rosso. «Non giudicato» = rosso.
Verde su tutti e tre i formati PC; rosso `__CPM_NO_G416` cade su tutti e tre (S2, S3, S4, S6 e — a 1920/1895 — S5).
Righe della MAPPA già esistenti: `src/18-|src/16-|src/10-` e `src/16-`.

## Guardiano esistente adeguato: `finestre-150`

`finestre-150` (finestra centrata col velo) supponeva la scena SEMPRE sopra la finestra (31% dell'altezza) e la home SEMPRE
ai lati della finestra. Con la composizione la striscia sinistra cade sulla scena e la finestra è centrata nello schermo
intero. Ora la scena si **misura** (`[data-cpm-scena]`): una striscia che cade sulla scena non si giudica (resta l'altra;
nessuna = non giudicato), e la centratura si calcola sotto la scena solo se la scena sta sopra. **Soglie invariate**
(velo ≥ 75%, vuoto ≤ 48, centratura ≤ 24, larghezza ≥ 480). Verde 6/6; il suo rosso `__CPM_NO_G150` sull'intervista ora
cade sui due tablet (2/5) e non più sui PC, perché lì l'impaginazione la decide la regola 416, non più quella del 150.
Nota: `finestre-150` non ha una riga nella MAPPA (né prima né ora).

## Esiti dei rituali (sul banco, build di questo ramo)

- `node ci-runner.mjs giro intervista-pc-416`: **18/18 verdi** (il guardiano + le 17 sentinelle: mappa-unica, test:logic,
  save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, career-critical, battito-264, partita-vera,
  render-3d-023, tunnel-285, gk-dive-sync, home-298, schermate-97, web-237).
- `flussi-115`: verde 54/54 controlli su 17 punti, rosso cade su tutti i 17 punti.
- `interviste-183`, `interviste-211` (con i due rossi), `toast-intervista-247`: verdi.
- `finestre-150` (tutte le finestre, verde + rosso): verde 36/36, telefono invariato, rosso cade su 27/30.
- `intervista-231`: **NON GIUDICATO = rosso**, rosso già dichiarato in `ROSSI-DICHIARATI.json` (giro 344) con lo stesso
  sintomo: sul banco le quattro partite si fermano al tetto di 400 s (qui al 79'-83') e l'intervista non viene mai chiesta.
  Non dipende da questo giro (la composizione entra solo a intervista aperta); non l'ho ripetuto.
- Le sentinelle riscrivono `docs/collaudo-grafico/g0/**` e `docs/governo/STABILITA.json`: riportati allo stato di `main`, non nel commit.

## File e funzioni toccati

- `src/16-scene-3d-cerimonie.jsx`: nuovi `SCATOLA416`, `pc416(W,H)`, componente `Intervista416`; `InterviewScena2D` riceve `scala416`.
- `src/18-career-app.jsx`: la finestra dell'intervista (portale `data-cpm="intervista231"`) avvolge scena + Card in `<Intervista416 attiva={_iv3d}>`.
- `CARRIER-MANAGER-AV.html`: ricomposto (`tools/build-src.mjs`, `check-src` identico).
- `tests/visual/intervista-pc-416.mjs` (nuovo), `tests/visual/package.json` (script), `tests/visual/ci-runner.mjs` (righe MAPPA src/18 e src/16), `tests/visual/finestre-150.mjs` (misura della scena).

## Dubbi per il PO (la consigliata è la prima, GIÀ APPLICATA)

1. **Scena a sinistra, domanda a destra, affiancate (applicata).** Si legge come una sala stampa vista in TV con il «gobbo»
   delle domande accanto; tutto entra senza scorrere anche a 1366×768.
2. Scena sopra e domanda sotto, una colonna sola larga ~720 px: più simile al telefono, ma a 1366×768 la scena scende a
   ~240 px di altezza (circa 16% dello schermo) o la finestra deve scorrere.
3. Scena a tutto schermo come fondale (ingrandita a coprire) con la finestra sopra a destra: più scenografica, ma la finestra
   copre il tavolo o il tabellino a seconda delle proporzioni dello schermo.

Altri punti aperti, non toccati in questo giro:
- **Tablet orizzontale 1024×768 e finestre sotto 1100 px**: restano con l'impaginazione di prima (scena in fascia, velo). Se
  il PO la vuole anche lì, basta abbassare la soglia di `pc416` (a 1024 la scena verrebbe larga ~440 px).
- Sull'etichetta della bottiglietta lo sponsor è tagliato («esta Assic»): era così anche prima e anche sul telefono.
- Sul telefono il guardiano conta 48 punti su 160 «non coperti» dallo strato dell'intervista (lettura degli stili, non dei
  pixel). Non ho verificato dove cadono: il telefono non è cambiato (verde = rosso) e non è giudicato su questo.
