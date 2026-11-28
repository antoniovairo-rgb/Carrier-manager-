# Rapporto giro 444 — PO-686 ter (barbe sul treno, stempiati e lunghi spenti, baffi folti)

Ramo `sviluppo/giro444-barbe-treno`, da `sviluppo/giro440-barba-capelli-bis` con **origin/main (7.999.219) unito**. Un solo conflitto,
in `tests/visual/ci-runner.mjs` (riga MAPPA `src/12-|src/13-`): tenuti i guardiani nuovi di main (`esultanza-420`, `testa-419`,
`tunnel-411`) e quelli del 440 (`resa-barba-440`, `barba-capelli-432`, `aspetto-412`). `GAME_VERSION` e `docs/governo` non toccati
(la catena del giro scrive `docs/governo/STABILITA.json`: ripristinato prima del commit). Nessun asset di terzi: la mappa nuova è
disegnata da `tools/aspetto-444.py`.

**Tutte le misure sono sul banco (rendering software, headless), GLB acceso, salvataggio `fixtures/save-190-s12-ovr93.json`, ingresso
in campo. Non sono misure del telefono del PO.**

Decisione PO 28/11 applicata: **«Barbe sì, il resto rifatto»**.

## 1. Stempiati e lunghi raccolti spenti

- `assets/aspetto/aspetto-432.json`: in «tagli» `"stempiati e corti": null` e `"lunghi raccolti": null` → nessuno strato, resta la testa del
  corpo come prima del 432. I valori stanno in un blocco nuovo `spenti_444` (`"stempiati e corti": "stempiato"`, `"lunghi raccolti":
  "lunghi-raccolti"`): per riaccenderli nel giro 445 si rimette quel valore al posto di `null`, **una riga per taglio**. Le calotte
  `stempiato` e `lunghi-raccolti` restano descritte (nessun file cancellato).
- Nessuna riga di codice per spegnerli. Una sola riga solo-banco (`window.__CPM_TAB444_PRIMA`, letta solo sotto `?cpmtest=1`) rimette la
  tabella del 440: serve alla foto «prima» e al rosso del guardiano.

Misura (`resa-barba-444`, braccio A, sui 22 corpi del banco):

| braccio | esito |
|---|---|
| 22 corpi, tagli del salvataggio | **0** corpi con calotta liscia di stempiato/lunghi (strati pronti 22/22); Keith Carr e Noah Marshall (gli stempiati del salvataggio) alla testa del corpo |
| «lunghi raccolti» dato dal banco a 6 nomi (eroe compreso) | **0** corpi con calotta o chignon |
| rosso `__CPM_TAB444_PRIMA` (tabella del 440) | la calotta liscia **ricompare su 8 corpi** (Carr, Marshall + i 6 forzati) |

`resa-barba-440` giudicava chignon e tempie scoperte: ora, se la tabella li ha spenti, giudica che quei corpi siano **alla testa del corpo**
(6/6 e 2/2) e tiene la compenetrazione in movimento (0 vertici fuori su 3.209, 6 scene hl_*). Quando il 445 li riaccende torna il giudizio
del 440 (stesso file, ramo `else`).

## 2. Baffi — cause misurate (No Blind Fix)

Sonda nuova `tests/visual/misura-444.mjs`: stessi punti del viso del 440 (azimut/elevazione attorno al centro della testa), primo piano 3D
frontale e figurina. Definizione **a mezza intensità**, identica sui due lati: scurimento D (figurina: pelle della stessa riga e dello
stesso lato meno il punto; 3D: stesso fotogramma senza baffi meno con baffi), nucleo sotto il naso, soglia = metà del nucleo;
**larghezza** = estensione continua per riga (gradi di azimut, massimo fra le righe), **spessore** = corsa più lunga di righe sopra
soglia nelle colonne 6-14° (gradi della testa; le righe della figurina si portano sulla testa coi due punti tarati del 440: narici −25 →
base del naso −29, rima −39 → −39).

Cause trovate:
1. **Mappa troppo stretta e troppo bassa.** La mappa del 440 era piena solo per 2,2° al centro (−30,3…−32,5), larga 20; la resa 3D era
   una riga fra −32 e −36, **con la pelle scoperta sotto il naso**.
2. **Guscio che galleggia sotto il naso.** Il guscio prende il raggio massimo delle celle vicine: sotto il naso è il raggio della punta del
   naso, e un punto spinto in fuori lungo una direzione che scende appare più in basso. Misurato: mappa che parte da −26,75 → resa che
   parte da −31. Con un guscio **aderente** (raggio della cella) la resa parte dalla base del naso.
3. **Colore preso dal labbro.** `tools/ritratti/barba-440.py` misurava il colore dei baffi (`bn`) a ±8°, −34,5…−31 della figurina, che cade
   fra filtro e labbro: baffi rosati (Dylan Gray, Gary Howard, Keith Carr). Ora: zona 3-18° di lato, −35…−25, media del **40% più scuro**
   (i peli), copertura 0,85 per questi baffi. Cambiano 248 colori su 688 figurine con barba (solo i «baffi sottili»).
4. **Strumento** (dichiarato): (a) il riferimento della figurina era la guancia alta: con la luce di lato (Aaron Lane, metà viso 20 L* più
   chiara) e le ombre della mascella (Dylan Gray) i «baffi» risultavano larghi 130°: ora si usa la pelle della stessa riga e dello stesso
   lato; (b) il pavimento anti-rumore di 6 L* della figurina applicato anche al 3D (dove la misura è una differenza esatta) valeva il 62%
   del nucleo sui baffi chiari: sul 3D è 2; (c) il **primo** primo piano della pagina usciva a volte senza baffi (Dylan Gray, nucleo 3,9
   contro 11,6-11,9 su tre scatti ripetuti): uno scatto di riscaldamento scartato. Misurato, **non spiegato**.

## 3. Cosa è stato fatto

- `tools/aspetto-444.py` → `assets/aspetto/barba444-baffi.png` (1 KB): dalla base del naso (−26,5 nella mappa, la resa scende di ~3°) al
  labbro, larga 28° per lato con le punte che scendono accanto agli angoli della bocca fino a −39,5; bordi netti; **labbra sempre a 0**
  (ellisse del 440 + 1,2° di pelle libera).
- Tabella: `baffi.densita444`, `baffi.copertura444` (0,85).
- `src/12`: `_g444` (rosso `window.__CPM_NO_G444` = baffi del 440), mappa e chiavi di cache proprie, peli a ventaglio su tutta la zona
  nuova, guscio aderente (`_strato432(..., aderente)`) col raggio massimo dei vertici della testa nella cella (`_vmax444`): la prima
  stesura aderente lasciava uscire 24 vertici su 3.206 (ali del naso), ora **0**.

## 4. Misure

`npm run resa-barba-444` (~2 min, verde e rosso nello stesso comando). Soglie dichiarate prima, dalle figurine dei 6 corpi «baffi sottili»
del banco: larghezza mediana **48°**, spessore mediano **5°** (5 figurine giudicate su 6: quella di Keith Carr ha baffi troppo chiari per
la soglia di 6 L*). La mappa è una sola per tipo, quindi il confronto è con la mediana: larghezza 3D ≥ 0,85 × 48 = 40,8 · spessore ≥ 0,8 ×
5 = 4,0 · labbra visibili ≥ 0,90.

| corpo | figurina larg./spess. | 440 (rosso) | 444 notte | 444 giorno | labbra |
|---|---|---|---|---|---|
| Dylan Gray | 61,5 / 3,6 | 0 / 0 | 51 / 5 | 51 / 5 | 1,00 |
| Declan Russell | 48 / 7,1 | 0 / 0 | 48 / 5 | 48 / 5 | 1,00 |
| Gary Howard | 33 / 4,3 | 40,5 / 4 | 51 / 4 | 51 / 4 | 1,00 |
| Keith Carr | non giudicata | 40,5 / 4 | 51 / 5 | 51 / 5 | 1,00 |
| Connor Quinn | 46,5 / 5 | 0 / 0 | 48 / 4 | 48 / 4 | 1,00 |
| Aaron Lane | 64,5 / 7,9 | 0 / 0 | 48 / 5 | 48 / 4 | 1,00 |

Rosso: **6/6 fuori soglia**. Dichiaro che due corpi (Gary Howard, Keith Carr) nel rosso escono per poco (40,5 contro 40,8): sul 440 il
nucleo sotto il naso era vuoto e gli altri quattro escono a 0. I baffi del 440 erano più bassi della zona del nucleo, quindi il rosso
cade soprattutto perché **sotto il naso non c'era niente**, che è il difetto che il PO ha visto.

`npm run resa-barba-440` resta **verde** coi baffi nuovi: 19/19 corpi con barba entro le soglie del 440 (labbra min 1,00 · contributo di
colore max 11,7 · varianza min 5,39 di notte; 11,3 / 5,97 di giorno), rosso del 432 su 15/19.

Catena del giro: vedi sezione 7.

## 5. Foto (prima = giro 440 sopra · dopo = giro 444 sotto)

`docs/collaudo-po/444-{notte,giorno}-N-*.png` (figurina | corpo in campo | primo piano), stesso formato del 440, **nessun taglio forzato**:
1 Connor Quinn · 2 Declan Russell · 3 Keith Carr (+ `-dietro`: lo stempiato torna alla testa del corpo) · 4 Samuelito Vairo · 5 Sebastian
Maxwell · 6 Norman Bailey · 7 Noah Marshall (+ `-dietro`, l'altro stempiato) · 8 Aaron Lane; `444-{notte,giorno}-ingresso.png` la fila.
Il «prima» è il gioco con `__CPM_NO_G444` + `__CPM_TAB444_PRIMA`.

Cosa si vede, onestamente: i baffi coprono il filtro dal naso al labbro e arrivano agli angoli della bocca, colore marrone come in figurina,
labbra libere. Su figurine con «baffi sottili» davvero sottili (Russell, Gary Howard, Carr) i baffi 3D sono **più folti della figurina**:
la mappa è unica per tipo e l'ho tarata sui folti (Quinn), come chiesto. Di lato i baffi stanno un poco davanti alla pelle sotto il naso.
Carr e Marshall tornano alla testa del corpo: **capelli scuri e pieni**, non stempiati come in figurina (è lo stato di prima del 432).
Barbe di Vairo, Maxwell, Bailey: invariate rispetto al 440 (il codice della barba piena/corta/pizzetto non è toccato).

## 6. File toccati

`assets/aspetto/aspetto-432.json` (tagli spenti, `spenti_444`, `densita444`, `copertura444`), `assets/aspetto/barba444-baffi.png`,
`src/12-three-match-view.jsx` (blocco giro 444), `CARRIER-MANAGER-AV.html` ricomposto, `tools/aspetto-444.py`, `tools/foto-444.py`,
`tools/ritratti/barba-440.py` (zona dei baffi) + `barba-440.json` + `assets/portraits/ai/indice.json` (rigenerato, stessa dimensione),
`tests/visual/misura-444.mjs`, `resa-barba-444.mjs`, `foto-444.mjs`, `resa-barba-440.mjs` (tagli spenti), `package.json`, `ci-runner.mjs`
(unione + `resa-barba-444` nella riga MAPPA che esiste già); foto `docs/collaudo-po/444-*.png`.

## 7. Catena del giro

`node ci-runner.mjs giro resa-barba-444 resa-barba-440 barba-capelli-432 pelle-240 aspetto-412 spalle-146` (+ 17 sentinelle):

**23/23 verdi** sulla build ricomposta del ramo (GAME_VERSION invariata 7.999.219), nessun passo instabile. I rossi dei guardiani dell'area cadono dentro i loro stessi comandi (sezioni 1 e 4).

```
✅ resa-barba-444 (131s)
✅ resa-barba-440 (127s)
✅ barba-capelli-432 (128s)
✅ pelle-240 (187s)
✅ aspetto-412 (92s)
✅ spalle-146 (325s)
✅ mappa-unica (0s)
✅ test:logic (2s)
✅ save-compat (1s)
✅ replay (39s)
✅ migrazione-194 (24s)
✅ design-system (0s)
✅ tema-unico (14s)
✅ griglia-mobile (174s)
✅ render-3d-023 (35s)
✅ tunnel-285 (162s)
✅ home-298 (118s)
✅ web-237 (42s)
✅ career-critical (336s)
✅ battito-264 (375s)
✅ partita-vera (644s)
✅ gk-dive-sync (174s)
✅ schermate-97 (110s)
✅ catena giro su 7.999.219: 23/23 verdi
```

## 8. Dubbi per il PO (la consigliata per prima, già applicata)

**1. Una mappa dei baffi per tutti o per giocatore?**
- **(consigliata, applicata)** Una mappa per tipo, folta e larga come i baffi di Quinn; colore per giocatore dalla figurina.
- Due mappe («baffi folti» e «baffi a matita») scelte misurando lo spessore sulla figurina di ognuno (come il colore, offline): Russell,
  Gary Howard e Carr avrebbero baffi più sottili, fedeli alla figurina.
- Spessore continuo per giocatore (un numero nell'indice dei volti, la mappa scalata in altezza): più fedele, più codice.

**2. Stempiati e lunghi raccolti nel giro 445.**
- **(consigliata)** Stempiato = la testa del corpo con le tempie e la fronte ritagliate dal guscio dei capelli dipinti (nessuna calotta
  color pelle), nuca intatta; lunghi raccolti = calotta + coda che scende sulla nuca, animata come un osso in più.
- Tenerli spenti finché non ci sono corpi con quei capelli già modellati (asset con licenza verificata).
- Riaccendere quelli del 440 (una riga ciascuno in tabella): è ciò che il PO ha bocciato.

**3. Il colore dei baffi è cambiato per 248 figurine.**
- **(consigliata, applicata)** Colore dal 40% più scuro della zona dei baffi (i peli): le foto mostrano baffi marroni come in figurina.
- Media dell'intera zona nuova: alcuni baffi a matita diventavano color pelle (provato: figurina 3, da `#7f5235` a `#cc8268`).
- La zona del 440: baffi rosati.

**4. Il primo primo piano della pagina a volte senza baffi (solo strumento).**
- **(consigliata, applicata)** Scatto di riscaldamento scartato nella sonda, dichiarato qui; indagine a parte se ricompare.
- Misurare ogni corpo due volte e tenere la seconda.
- Lasciare così (rosso casuale).
