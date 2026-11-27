# Rapporto giro 422 — PO-640: il pre-stacco si estende all'attesa del pallone

Ramo: `sviluppo/giro422-prestacco-testa` (base: `main` 2e084dc). Voce PO-640, dal giro 342 dubbio D («Tutte le consigliate»):
nelle scene di colpo di testa senza costruzione aerea il pre-stacco va esteso all'attesa del pallone (TESTA146), con la stessa fase
della clip. GAME_VERSION e `docs/governo` non toccati.

## 1. Misura prima (No Blind Fix)

Strumento: `testa-342.mjs` (GLB acceso, teatro acceso, una pagina nuova per scena, passo 1/60), le stesse grandezze e le stesse soglie
del giro 342. Commit misurato: `main` 2e084dc, senza alcuna modifica.

| misura | esecuzioni | esito |
|---|---|---|
| gi53 a1 «Di testa al volo», riuscita + fallita, passo 1/60 | 34 | **33 dentro le soglie** (frustata↔pallone 0,01 s, apice −0,01 s, testa-pallone 0,10-0,19 u); **1 fuori** |
| gi53 a1 + gi48 a1, passo nativo (0,05 s, telefono a 20 fps) | 3 | 3 dentro (frustata 0,02 s) |
| gi48 · gi1 · gi103 a1 (rimbalzi), riuscita + fallita | 6 | 6 dentro |

**Il difetto del giro 342 («frustata 0,38 s prima» su gi53) oggi non si vede quasi più**: 1 esecuzione su 34. Lo ha in gran parte
riparato la correzione 12 del giro 342 (clip tenuta sulla frustata durante l'attesa), arrivata DOPO il censimento che aveva dato 0,38.
L'unica esecuzione fuori: contatto a 2,09 s invece di 1,65-1,73, **testa all'altezza da fermo (1,67 invece di 1,98: nessuno stacco)**,
nessuna clip di testa al contatto, testa al punto più alto 0,35 s prima del contatto, pallone arrivato a 22,6 u/s. È la stessa famiglia
del difetto: colpo di testa montato a terra con il pallone ancora lontano. Non l'ho riprodotta a comando (0 su 21 ripetizioni
successive), quindi il guardiano la **provoca** (sotto).

Provocazione (`__CPM_TESTA422_PROVA`, solo sul banco): la scena si gioca senza il pre-stacco della costruzione (come una scena senza
costruzione aerea) e all'esito il pallone sta 6 u lontano dalla testa → il colpo lo aspetta circa 0,4 s (caricamento + volo 274).
Prima della correzione, su gi53 · gi48 · gi108 (3 su 3, identico):

| grandezza | prima | soglia (testa-342) |
|---|---|---|
| testa al punto più alto rispetto al contatto | **+0,35 s** (il corpo sale DOPO che il pallone è partito) | ±0,15 |
| quota del corpo | sale fino a **2,2 u** (seno della vita del gesto, senza pre-stacco) | — |
| testa-pallone al contatto | 0,25-0,32 u | 0,45 |
| frustata della clip | −0,04 s (fasata sul solo caricamento, poi tenuta) | ±0,08 |

## 2. Correzione (src/12, tutta dietro `window.__CPM_NO_G422` = comportamento di prima)

Quando il colpo di testa si arma all'esito con l'eroe **a terra** (nessun pre-stacco dalla costruzione) e finché il colpo non è partito:

1. si stima quanto manca al contatto: caricamento che resta + volo 274 che resta (o `d/32` se partirà, o la convergenza
   `ln(d/0,9)/14` entro il tetto 0,8 s dell'attesa TESTA146);
2. la **clip si fasa su quel tempo** (`_TC342` cade sul pallone), cambiando passo fra fermo e 2×, mai a scatti (misurato: col salto
   diretto al primo fotogramma la testa faceva 20,7 u/s);
3. il **corpo sta a terra e stacca balistico** (`L = √(2H/g)`), arrivando all'apice col pallone; se manca meno di L lo stacco è più
   basso con la stessa gravità (misurato: senza, primo fotogramma a 20,8 u/s);
4. la vita del gesto resta prima dell'apice; al lancio il gesto riparte **dal picco**, come col pre-stacco della costruzione, e
   scende balistico (stessa macchina `_pre33` del giro 342).

Le scene col pre-stacco della costruzione (tutte quelle naturali misurate) non passano da qui: il ramo vale solo con l'eroe a terra.

## 3. Dopo

| scena | prima (rosso `__CPM_NO_G422`) | dopo |
|---|---|---|
| gi53 a1 PROVA | apice +0,35 s · 0,25 u | apice **+0,03 s** · 0,06 u · frustata 0,00 s · scatto 9,7 u/s |
| gi48 a1 PROVA | apice +0,35 s · 0,29 u | apice **+0,03 s** · 0,07 u · frustata 0,00 s · scatto 9,7 u/s |
| gi108 a0 PROVA | apice +0,35 s · 0,32 u | apice **+0,02 s** · 0,16 u · frustata 0,00 s · scatto 10,1 u/s |
| gi53 a1 naturale | dentro | dentro (invariata) |
| gi48 a1 naturale | dentro | dentro (invariata) |

Non regressione: `npm run testa-342` sul commit del giro **verde 11/11**, rosso valido (11 bocciate su misura).

Foto (GLB acceso, gi53 con la provocazione, fotogrammi a −0,25 · 0 · +0,30 s dal contatto):
`docs/collaudo-po/422-gi53-prima.png` (a +0,30 s l'eroe è ancora in volo, testa a ~3,9 u, il pallone è già partito) ·
`docs/collaudo-po/422-gi53-dopo.png` (stacco basso, contatto all'apice, a +0,30 s è già a terra).

## 4. Guardiano `npm run prestacco-422`

`tests/visual/prestacco-422.mjs`, nella riga della MAPPA esistente per `src/12-|src/13-` (ci-runner.mjs), accanto a `testa-342`.
Importa `analizza`, `giudica` e `SOGLIE` da `testa-342.mjs` (nessuna soglia nuova, nessuna abbassata; a `testa-342.mjs` ho solo
esportato `scena` e fatto leggere il testimone `__CPM_W422`).
- 3 scene PROVA (gi53 a1, gi48 a1, gi108 a0) + 2 naturali (gi53 a1, gi48 a1), riuscite.
- Il testimone `__CPM_W422` deve dire che l'attesa è stata provocata davvero (≥ 0,30 s): altrimenti **non giudicato = rosso**.
- **Verde**: 5/5 dentro le soglie (misurato). **Rosso** (`CPM_ROSSO=__CPM_NO_G422`): valido se ≥ 2 PROVA su 3 cadono su misura —
  misurato 3/3 (apice a +0,35 s).

Catena del giro: `cd tests/visual && node ci-runner.mjs giro prestacco-422` — esito in §6.

## 5. Dubbi per il PO

**A. Il caso «stacco già fatto, pallone ancora lontano».** Se la costruzione ha già fatto il pre-stacco (eroe all'apice) e il pallone
arriva dopo (misurato con la provocazione del giro 274 sul pallone dalla bandierina: clip ferma sulla frustata 0,26 s, corpo che
riscende, contatto con la testa all'altezza da fermo), un salto non si può «rimandare» senza un secondo stacco.
1. **(consigliata, applicata)** Lasciarlo fuori da questo giro: nelle scene naturali misurate non succede (0 su 33), il ramo 422 vale
   solo con l'eroe a terra.
2. Tenere l'eroe all'apice finché arriva il pallone (fino a 0,3 s «sospeso»: smussato, ma non fisico).
3. Far atterrare e ristaccare (due salti: più vero, più lungo, più rischioso sui tempi del telefono).

**B. Il caso naturale residuo (1 su 34 su gi53).** Non riprodotto a comando: la provocazione ne copre il meccanismo (eroe a terra +
attesa), non la causa per cui in quella esecuzione il pre-stacco della costruzione non è partito.
1. **(consigliata, applicata)** Il guardiano provoca il meccanismo e lascia `testa-342` sulle scene naturali; il caso torna sul
   taccuino se il PO lo vede in partita.
2. Aggiungere una sonda a ripetizione (50 esecuzioni di gi53, ~25 min) che caccia la causa della costruzione senza pre-stacco.
3. Allargare il pre-stacco della costruzione a tutti i tratti (non solo agli ultimi due): rischio di stacchi in anticipo sulle
   costruzioni lunghe.

**C. Lo stacco nell'attesa è basso** (H minimo 0,25 u, o meno se manca meno di L): sui rimbalzi la testa arriva a 1,89 invece che
a 1,98 delle scene col cross.
1. **(consigliata, applicata)** Così: il pallone di un rimbalzo arriva basso, lo stacco è proporzionato.
2. Stessa altezza del pre-stacco dei cross (fino a 0,9 u): più spettacolo, testa sopra il pallone.
3. Nessuno stacco nell'attesa, solo la fase della clip (colpo di testa da fermo).

**D. Il telefono.** Misurato al passo 1/60; al passo nativo (20 fps) ho misurato solo la base (3 esecuzioni dentro).
1. **(consigliata)** Collaudo sul telefono del PO con il taccuino (codice 000) sui colpi di testa di rimbalzo.
2. Aggiungere al guardiano un braccio al passo nativo (con le stesse soglie: +2 min).
3. Nessuna verifica ulteriore.

## 6. Esito della catena del giro

(in corso — vedi sotto)
