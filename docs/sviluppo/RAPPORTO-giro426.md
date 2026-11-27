# Rapporto del giro 426 — riparazione del treno 7.999.218

Base: `lavoro/201` @ 9e876eb5 (contiene il giro 418). Ramo di consegna: `sviluppo/giro426-riparazione-218`.
Non toccati: `GAME_VERSION`, `docs/governo/**`, licenze. Corpi accesi (GLB) in tutte le misure.

## 1. `testa-tempismo` — gi171 azione 0 (treno 45949544850, parte 30)

**Non è il giro 418.** Stessa scena, stesso guardiano, 4 ripetizioni per base:

| base | scarto (s) | esito |
|---|---|---|
| d75ded1d (senza 418) | 0,11 · 0,09 · 0,15 · 0,15 | verde, ma al bordo |
| 9e876eb5 (con 418) | 0,10 · 0,14 · 0,10 | verde, al bordo (il treno ha trovato 0,16) |
| questo ramo | −0,01 (giro intero) · ±0,03 (4 ripetizioni) | verde con margine |

Quindi era **instabile, ma per un difetto vero**: la scena stava al limite su ogni base, e lo 0,16 del treno è
quel limite superato. La spinta dei difensori della punizione (418) non c'entra: gi171 è un colpo di testa in tuffo dopo un cross.

**Causa, misurata** (sonda `__CPM_BU43` + `__CPM_TESTA33`, fotogramma per fotogramma): il copione è passaggio → corsa →
**cross** → **control** → colpo di testa. Il cross consegna già il pallone alla testa (0,16–0,30 u a 1,58–1,65 s). Poi il
tratto «control» del giro 342 lo tiene lì altri 0,13–0,16 s, mentre lo stacco balistico arriva all'apice solo alla fine di quel tratto
(colpo 1,70–1,76 s). Il «picco del salto» arriva 0,1–0,16 s dopo l'incontro.

**Correzione** (`src/12-three-match-view.jsx`, prima della finestra dello stacco 7.999.33): sul colpo di testa **in tuffo**
(`header_diving`), quando il tratto prima del colpo è un cross aereo, il «control» dura un fotogramma. Così apice, incontro e fine
della costruzione cadono nello stesso punto. Rosso `window.__CPM_NO_G426`.
- Il primo tentativo valeva per tutti i colpi di testa e ha rotto gi55, gi86 e gi76 (scarto −0,36/−0,38 s): su quei colpi da in piedi
  il cross non arriva alla testa e il «control» serve. Per questo la correzione è ristretta al tuffo.
- Il primo tentativo in assoluto (portare il pallone alla quota della testa vera invece che a 1,3) è stato misurato e tolto:
  il pallone restava a 0,16–0,26 u dalla testa per tutto il tratto, cioè galleggiava, e l'incontro migliorava su 1 ripetizione su 4.

**Verde:** `npm run testa-tempismo` PASS su 7/7 scene, scarto medio 0,03 s (gi7 0,06 · gi55 0 · gi86 0,05 · gi90 0,07 · gi76 0 ·
gi171/0 −0,01 · gi171/1 0,04). **Rosso:** `CPM_NO_G426=1 CPM_CASI=171:0×5` → 0,11 · 0,12 · 0,14 · −0,01 · **0,16** →
«TESTA TEMPISMO: FALLITO (1)». Il difetto torna, nella stessa misura del treno.

## 2. `rilascio-312` — B2 (treno 45949544850 parte 24, e treno grande 45920908452)

**È un difetto della prova, non dello strumento.** Lo scenario B costruisce un remoto finto partendo da `origin/main` VERO, e
quindi eredita il `docs/governo/BLOCCO-RILASCI.json` vero. Con un blocco attivo (prima `consegna-103`/`testa-342`, poi
`tiro-caricato`/`rilascio-312`) la decisione di B2 si ferma **correttamente**: lo strumento fa quello che deve. Da lì vengono il
«fermo» e poi `refs/tags/v7.999.218^{commit}` inesistente (tag mai creato), cioè i 6 controlli falliti del treno grande. E c'è un
circolo vizioso: un treno grande che blocca rende rosso `rilascio-312`, e `rilascio-312` entra lui stesso nel blocco successivo.

**Correzione** (`tests/visual/rilascio-312.mjs`): nel commit di governo del main finto lo scenario scrive il **suo** blocco
(spento, `rossi: []`) e non lascia passare `CPM_REF_BLOCCO` dall'ambiente. `tools/rilascio-vagone-312.mjs` non è stato toccato.
**Verde:** 20 controlli A + percorso B completo → «✅ VERDE». **Rosso del giro:** `CPM_NO_G426=1` (lo scenario torna a leggere il blocco
vero) riproduce esattamente il messaggio del treno: «❌ B2 soli rossi dichiarati: fermo 7.999.218 — rilasci BLOCCATI dal treno grande
(…, corsa 45920908452): tiro-caricato, rilascio-312». **Rosso storico** `CPM_NO_G312=1` → «❌ ROSSO: 4 controlli falliti» (atteso).
Nota di ambiente: in un clone superficiale il percorso B si interrompe («Could not read …», manca l'antenato comune). Serve
`git fetch --deepen`. In CI il checkout del treno ha già la storia: il treno l'ha eseguito fino al B2.

## 3. `tiro-caricato` — gi0/L (treno grande 45920908452, parte 21)

Dal log della parte 21: tutti i controlli verdi tranne **«gi0/L: il piede che calcia arriva al pallone (0,751 u)»**, contro la
soglia di 0,7. gi0 destro: 0,256.

**Difetto vero, con un esito instabile.** Sul ramo, prima della correzione, gi0/L ×6: contatto **0,473 · 0,165 · 0,304 · 0,555 ·
0,379 · 0,81**, cioè 1 volta su 6 sopra 0,7. I fotogrammi sono fitti (0,019 s), quindi non è velocità × intervallo.
Main (c162d010) e `lavoro/201` hanno lo stesso `src/12` per questa parte (il 418 tocca solo la punizione), quindi la misura vale per
entrambi. Non ho fatto una corsa separata su main.

**Causa, misurata** nel riferimento del corpo visibile (posizione e rotazione del testimone `__CPM_TIRO34`): prima del contatto il
pallone è tenuto 0,78 u davanti secondo `hero.rotation.y`, ma il corpo visibile mira la porta (`_mira20`). Così il pallone sta a lato
**−0,70/−0,79 in entrambe le esecuzioni**. Il destro passa a −0,26/−0,35 e lo prende. Il sinistro della clip specchiata passa a
+0,24/+0,36, a circa 1 u dal pallone. Lo salvava solo l'aggancio all'osso nella finestra stretta `[u−0,06, u+0,06]`, che entra uno o
due fotogrammi prima dell'armo dell'arco. Quando non fa in tempo, il contatto finisce oltre 0,7.

**Correzione** (`src/12`, blocco del contatto del calcio): con la clip `mx-strike-foward-jog~m` il punto d'attesa del pallone si
specchia rispetto all'asse del corpo visibile, così il mancino ha la geometria del destro. Il destro non cambia per costruzione.
Rosso `window.__CPM_NO_G426`. **Misura dopo:** gi0/L ×6 → 0,358 · 0,291 · 0,388 · 0,375 · 0,383 · 0,392 (pallone a lato
+0,32/+0,43, sinistro a +0,25/+0,34). Guardiano intero PASS. **Rosso:** con `CPM_NO_G426=1` il comportamento torna quello misurato
prima. Passata rossa del giro: `CPM_NO_G426=1 CPM_CASI=0:0:L×6` → 0,458 · **0,792** · 0,394 · 0,395 · 0,294 · 0,344 →
«TIRO CARICATO: FALLITO (1)». Visto che il difetto esce circa 1 volta su 6, anche una passata rossa può uscire verde: lo dichiaro e
non lo presento come un rosso stabile.

## 4. Catena del giro

`node ci-runner.mjs giro testa-tempismo tiro-caricato rilascio-312 barriera-73 testa-342` (5 guardiani + 17 sentinelle):
**22/22 verdi** sul commit ad3c6ac8 (testa-tempismo 324 s · tiro-caricato 178 s · rilascio-312 15 s · barriera-73 64 s ·
testa-342 466 s · mappa-unica · test:logic · save-compat · replay · migrazione-194 · design-system · tema-unico · griglia-mobile ·
render-3d-023 · tunnel-285 · home-298 · web-237 · career-critical · battito-264 · partita-vera 675 s · gk-dive-sync · schermate-97).
`testa-342` è stato aggiunto perché la correzione tocca il colpo di testa del giro 342. Gli artefatti scritti dalla catena
(`docs/governo/STABILITA.json`, foto in `docs/collaudo-grafico/g0`) sono stati ripristinati e non sono nel commit.

## Dubbi per il PO (la prima opzione è quella consigliata ed è già applicata)

**D1 — `rilascio-312` e il blocco vero.**
1. *(applicata)* Lo scenario porta il suo blocco spento: il guardiano dello strumento non dipende più dallo stato reale di main.
2. Aggiungere allo scenario un caso B «blocco finto attivo → fermo», per giudicare la lettura del blocco anche sul percorso vero
   (oggi la giudica solo `trenino-317`).
3. Dichiarare `rilascio-312` in ROSSI-DICHIARATI finché il blocco vero è attivo. Sconsigliato: nasconde un difetto della prova, e
   il guardiano resterebbe nel blocco successivo.

**D2 — `tiro-caricato` gi0/L.**
1. *(applicata)* Punto d'attesa del pallone specchiato per la sola clip `mx-strike-foward-jog~m`.
2. Estendere lo specchio a tutte le clip `~m` (anche `kick~m`). Non è misurato: va fatto con un guardiano su quella clip.
3. Mettere il pallone sull'asse del corpo visibile (lato 0) per entrambi i piedi. Correggerebbe la causa comune (mira del corpo
   contro rotazione logica), ma cambia ogni tiro destro: servono tutto il gruppo del piede (P1B2, piede-cross, salti-274) e una foto
   dal vivo.

**D3 — `testa-tempismo` gi171.**
1. *(applicata)* Solo sul colpo di testa in tuffo, un cross aereo seguito dal «control» chiude il «control» in un fotogramma.
2. Togliere il «control» dopo il cross direttamente nel copione (`src/11`, timeline pura). È più pulito, ma cambia la timeline che i
   test in node e la firma narrativa leggono.
3. Lasciare il codice e dichiarare il guardiano instabile. Sconsigliato: la scena stava al bordo su tutte le basi, e un rosso
   ricorrente ogni tanto bloccherebbe di nuovo il treno.

Il blocco del treno grande (`tiro-caricato`, `rilascio-312`) dovrebbe sciogliersi da solo col prossimo treno grande che prova
questo codice. Nessuna proposta di ROSSI-DICHIARATI.

Foto `docs/collaudo-po/426-*.png`: non prodotte. Le due correzioni cambiano tempi (0,13 s) e un lato (~1 u) misurati sul
testimone. Lo dichiaro come mancanza, se il PO le vuole.
