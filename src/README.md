# `src/` — i frammenti del sorgente

## LA REGOLA D'ORO

> **Si modificano i FRAMMENTI. Mai il file generato.**
>
> `CARRIER-MANAGER-AV.html` è **prodotto** da questi file.
> Ogni modifica fatta lì dentro viene **cancellata** al primo `node tools/build-src.mjs`.

```
modifica un frammento  →  node tools/build-src.mjs  →  node tools/check-src.mjs
```

---

## Perché non è un sistema di moduli

Il gioco è un unico blocco `<script type="text/babel">` di ~41.100 righe (righe 277-41425
del file generato) in cui **tutto condivide lo stesso scope**. Non è un file lungo: è un
ambiente unico. Un sistema di moduli avrebbe richiesto di riscrivere quello scope, cioè di
cambiare semantica.

Questi frammenti quindi **non sono moduli: sono tagli.** La build non li importa, li
**riconcatena nell'ordine esatto** dei prefissi numerici `00…19`. L'unica cosa che rimuove
è l'intestazione di ciascun frammento (tutto fino alla riga con la sentinella
`CMAV-SRC-HEADER-END`, quella riga compresa). Nient'altro: né uno spazio, né un a-capo, né
l'ordine.

La prova che il taglio è innocuo è brutale e non ammette opinioni:

> **il file ricomposto è IDENTICO BYTE PER BYTE a quello versionato.**

`node tools/check-src.mjs` lo verifica ed **esce 1** se differiscono anche di un solo byte.

## Perché il file generato resta in git

Perché **tutto il resto del progetto lo legge**: `tools/build-dist.mjs` (il packaging
Android), il quality gate, le sonde, e soprattutto il modello analitico
`tests/situations-3d-validation.js`, che **estrae blocchi di codice dal sorgente
ancorandosi a righe specifiche**. Finché il generato è identico, nessuno di questi si
accorge che i frammenti esistono — ed è esattamente il punto.

---

## I frammenti

Ordine di concatenazione = ordine dei prefissi. `NN-nome.jsx|html`.

| # | file | righe dell'originale | contenuto |
|---|------|---------------------|-----------|
| 00 | `00-head.html` | 1-277 | testata HTML, CSS, loader, `<script>` delle librerie |
| 01 | `01-bootstrap-tema-avatar.jsx` | 278-739 | flag di test, tema `TH`, token, avatar, `Player3DViewer` |
| 02 | `02-club-leghe-albo.jsx` | 740-1325 | `CLUBS`, leghe, `LEAGUE_RECORDS`, albo europeo |
| 03 | `03-eventi-narrativi.jsx` | 1326-2752 | eventi settimanali, spogliatoio, vita, infortuni, `ACHIEVEMENTS` |
| 04 | `04-situazioni-zone-piazzati.jsx` | 2753-3500 | `S()`/`A()`, **`SITUATIONS`** (r.2854), `ZONES`, piazzati, telecronisti |
| 05 | `05-cronaca-stadi-formazioni.jsx` | 3501-4028 | **`BG_MATCH`** (r.3501), overlay d'esito, stadi, formazioni |
| 06 | `06-archetipi-agenti-sponsor.jsx` | 4029-4857 | archetipi, allenamento, procuratore, sponsor |
| 07 | `07-versione-save-interviste.jsx` | 4858-6380 | `GAME_VERSION`, `SAVE_VERSION`, europei, `INTERVIEW_QS` |
| 08 | `08-panchina-derby-meteo-cori.jsx` | 6381-6975 | allenatori, derby, meteo, cori, slot, `safeLS` |
| 09 | `09-audio-scout-anagrafiche.jsx` | 6976-8432 | `AudioMgr`, scouting, nomi per nazionalità, calendario |
| 10 | `10-folla-stadi-ritiro.jsx` | 8433-9279 | `CROWD_CFG`, identità club, template stadio, ritiro |
| 11 | `11-ui-kit-highlight.jsx` | 9280-11308 | i 20 componenti UI di base, costanti highlight 3D |
| 12 | `12-three-match-view.jsx` | 11309-17899 | **`ThreeMatchView`** intero (r.11309-17897) |
| 13 | `13-prepartita-formazioni.jsx` | 17900-19168 | D-pad, scout, stampa, formazioni, maglie, ordini |
| 14 | `14-live-match.jsx` | 19169-24671 | metronomo + **`LiveMatch`** intero (r.19215-24670) |
| 15 | `15-scene-3d-cerimonie.jsx` | 24672-27154 | scene 3D, premi, fine stagione, presentazione |
| 16 | `16-menu-creazione-pannelli.jsx` | 27155-29704 | menu, creazione, provino, nazionale, tutorial, allenamento |
| 17 | `17-career-app.jsx` | 29705-40453 | **`CareerApp`** intero (r.29705-40452) |
| 18 | `18-app-root.jsx` | 40454-41424 | wizard di revisione, impostazioni, `App`, mount |
| 19 | `19-tail.html` | 41425-41427 | `</script></body></html>` |

`theme.js`, in questa stessa cartella, **non è un frammento**: è il documento dei design
token, non entra nella build (non ha il prefisso `NN-`).

## Ritrovarsi con i vecchi numeri di riga

Chi ha in testa i numeri del file intero non deve cercarli a mano: **l'intestazione di ogni
frammento dice quali righe copre e dà la formula di conversione esatta**, per esempio

```
CONVERSIONE: riga N di questo file  =  riga N + 11283 del file generato.
```

E nella direzione opposta: la tabella qui sopra dice in quale frammento cade una riga.
Anche `check-src.mjs`, quando trova una differenza, la riporta **con il numero di riga del
file generato**, non del frammento.

---

## Regole di taglio (per chi aggiunge o sposta un frammento)

1. **Confini naturali.** Mai a metà di una funzione, di un componente o di un letterale.
   I tagli stanno fra dichiarazioni di primo livello, e il commento-banner di una sezione
   viaggia col codice che descrive.
2. **Prefissi contigui da `00`.** Sono l'ordine di concatenazione. La build si ferma se
   trova un buco o un doppione: l'ordine non deve mai essere ambiguo.
3. **Ogni frammento ha l'intestazione** con la riga `CMAV-SRC-HEADER-END`. Senza, la build
   si ferma.
4. **`19-tail.html` non finisce con un a-capo.** L'originale termina esattamente su
   `</html>`. Aggiungerne uno rompe l'identità byte per byte.
5. **Dopo ogni modifica: `node tools/build-src.mjs && node tools/check-src.mjs`.**

## Se qualcuno ha modificato il file generato

Succederà. `check-src.mjs` esce 1 e stampa la riga esatta. Quella modifica va **riportata
nel frammento** che copre quella riga (tabella qui sopra), poi si ricostruisce. Il diff di
git sul file generato dice cosa è stato toccato:

```
git diff -- CARRIER-MANAGER-AV.html
```

---

## Cosa questo lavoro NON risolve

Onestà prima di tutto, perché la cartella non prometta più di quello che dà:

- **Non rende più divisibili i tre monoliti.** `ThreeMatchView` (~6.600 righe, di cui
  quasi tutte dentro un **solo** `useEffect` da ~6.540 righe con **221** dichiarazioni
  `const`/`let` nella stessa chiusura), `LiveMatch` (~5.500 righe, **113** `useRef` e
  **75** `useState`) e `CareerApp` (~10.700 righe) sono stati **isolati**, non scomposti.
  Aprire `12-three-match-view.jsx` è più comodo che scorrere 41.000 righe, ma dentro è
  lo stesso componente di ieri: il taglio si è fermato dove finiva un confine naturale, e
  lì dentro di confini naturali non ce ne sono.
- **Non riduce lo stato condiviso via chiusura.** Lo scope resta uno solo: un frammento può
  leggere e scrivere qualunque cosa dichiarata in un altro, esattamente come prima. Non c'è
  alcun confine imposto — solo un confine *visivo*.
- **Introduce un rischio nuovo:** che qualcuno modifichi il file generato invece dei
  frammenti e perda il lavoro al rebuild successivo. `check-src.mjs` è l'unica difesa:
  va eseguito, non ammirato. Il posto giusto per farlo girare è il quality gate.
