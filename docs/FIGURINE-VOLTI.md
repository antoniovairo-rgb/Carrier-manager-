# Le figurine — il contratto dei volti

> Direttiva PO, 22/09/2026: «Inizia a predisporre lo spazio dei volti rettangolari in verticale, sto
> predisponendo con il team codex delle figurine stile panini con i volti dei giocatori, mister,
> avversari, intervistatori, giornalisti, ecc.»

Questo documento è **il contratto fra chi disegna e chi monta**. Il gioco ha già lo SPAZIO (7.966): i
riquadri sono al loro posto, col rapporto giusto, e mostrano un ripiego finché l'arte non arriva.
Quando arrivano i file, **non si tocca una sola schermata**: si pubblica il manifesto e le figurine
compaiono.

---

## 1. Il formato

| voce | valore | perché |
|---|---|---|
| **rapporto** | **5 : 7 verticale** (0,714) | è il rapporto della figurina da album, 50×70 mm |
| consegna **2x** | **320 × 448 px** | copre ogni riquadro del gioco su schermo a densità 2 |
| consegna **4x** | **640 × 896 px** | telefoni a densità 3-4 (l'Android del PO è in questa fascia) |
| formato file | **webp** (png accettato) | peso: il gioco è un file unico, ogni KB si paga all'avvio |
| peso per figurina | **≤ 30 KB a 2x** | 200 volti × 30 KB = 6 MB, già quanto pesa tutto il gioco oggi |

Il rapporto vive in **un posto solo** nel codice (`const FIG={w:5,h:7,…}`): se il team codex lavora su
un rapporto diverso, si cambia quella riga e **tutte** le figurine del gioco seguono. Meglio dirlo
prima di disegnare duecento volti.

## 2. L'inquadratura

```
┌──────────────┐  ← margine di sicurezza 6% per lato:
│   ╭──────╮   │    la cornice arrotonda gli angoli e ci mette
│   │      │   │    un velo in alto — niente di importante lì
│   │  ◉  ◉│   │  ← OCCHI a ~38% dall'alto
│   │   ▽  │   │
│   ╰──┬───╯   │
│   ╱  │  ╲    │  ← spalle TAGLIATE dal bordo basso, mai sospese
└──────┴───────┘  ← fascia col nome: ultimo 18% coperto da un velo scuro
```

- **volto nel terzo superiore**, occhi a circa il **38 %** dall'alto: è l'allineamento che tiene
  quando le figurine stanno in fila (rosa, candidati procuratore, formazione).
- **spalle tagliate dal bordo basso**: una figura sospesa in mezzo al riquadro sembra un errore.
- **margine di sicurezza 6 %** per lato: il riquadro arrotonda gli angoli (`RAD.xs`, 6 px) e stampa
  in alto una banda col secondo colore del club.
- **fondo pieno o sfumato, MAI trasparente**: sopra ci va il velo del nome, e un fondo trasparente
  lascerebbe vedere il gradiente del riquadro attraverso il viso.

## 3. I nomi dei file

```
assets/volti/<tipo>/<chiave>.webp
```

- `tipo` ∈ `giocatore · mister · avversario · giornalista · arbitro · procuratore · dirigente`
- `chiave` = il nome della persona **normalizzato**: minuscolo, senza accenti, spazi → trattini,
  tutto ciò che non è `a-z0-9` → trattino, al massimo 48 caratteri.
  `"Andrea D'Amico"` → `andrea-d-amico` · `"Élena Greco"` → `elena-greco`

La stessa normalizzazione è nel codice (`_slugVolto`): se il file si chiama così, viene trovato.

## 4. Come si accendono (nessuna modifica alle schermate)

Il gioco cerca il volto in **due posti, in quest'ordine**:

1. **il manifesto** `window.__CPM_VOLTI` — un oggetto `{ "<tipo>/<chiave>": "<url>" }`:
   ```js
   window.__CPM_VOLTI = {
     "procuratore/elena-greco": "assets/volti/procuratore/elena-greco.webp",
     "mister/ruben-ortiz":      "assets/volti/mister/ruben-ortiz.webp"
   };
   ```
   È la via consigliata: si pubblica un file di manifesto e basta. Chi non è nel manifesto continua a
   mostrare il ripiego — **si può quindi consegnare l'arte a lotti**, senza aspettare che sia completa.
2. **niente**: finché non c'è manifesto il gioco **non chiede nulla alla rete** e mostra il ripiego
   (il volto tondo di oggi, dentro la cornice, su fondo col colore del club).

## 5. Dove sono già i riquadri (7.966)

| schermata | chi | larghezza |
|---|---|---|
| Agente · scheda del procuratore | procuratore | 40 px |
| Agente · i tre candidati | procuratore | 34 px |
| Agente · iniziativa e reminder | procuratore | 44 px / 28 px |

Gli altri ventidue punti in cui oggi vive un volto tondo (rosa, rivale, mister, giornalisti,
formazione, HUD di partita) si convertono **uno alla volta, con la loro misura** — la partita per
ultima, perché lì la catena dei rituali è quella completa.

## 6. Il guardiano

La griglia mobile ha una tabella nuova, **9-sexies · lo spazio delle figurine**: conta le figurine per
schermata e registra lo **scarto peggiore dal rapporto 5:7**. Se qualcuno monta l'arte in un riquadro
storto, il numero lo dice prima del PO.

```bash
CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node tests/visual/griglia-mobile.mjs
# → docs/collaudo-grafico/g0/REPORT.md, tabella «9-sexies»
```

## 7. Cosa NON fa questa versione

- non porta nessun disegno: porta lo spazio e il contratto;
- non tocca la schermata dell'intervista, dove il PO ha chiesto **nessun volto** («togli i visi,
  lascia solo una scenografia 2D molto carina»): se e quando i giornalisti avranno la loro figurina,
  quella decisione la prende lui;
- non tocca l'HUD di partita.
