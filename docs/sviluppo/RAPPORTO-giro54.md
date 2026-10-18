# Rapporto giro 54 — PO-277 «ingresso dal tunnel più rapido, saltabile, che sfrutti il tempo per caricare i GLB»

Ramo `sviluppo/ingresso-277-giro54`, base `lavoro/172-base` (7.999.171). Toccati `src/12-three-match-view.jsx` e
`src/15-live-match.jsx` (motore 3D e partita, niente carriera/economia). GAME_VERSION e SAVE_VERSION invariati (come gli altri
giri di sviluppo: il bump lo fa l'integrazione). Interruttori rossi: **`__CPM_NO_ING277`** (tutto il giro) e
**`__CPM_NO_ING277S`** (il solo salto, vedi §3.3).

## 1. Misure di partenza

Strumento: `tests/visual/ingresso-277.mjs` (percorso vero salvataggio → partita → walkout, GLB acceso, campionamento ogni
200 ms). ⚠️ In headless col GLB acceso il tempo di scena scorre a circa 1/4-1/6 del reale: le **durate dell'ingresso** si leggono in
secondi di scena (`__CPM_WALKDUR245`, la stessa costante che chiude la fase), mai sull'orologio della sonda.

| grandezza | valore | fonte |
|---|---|---|
| ingresso di oggi (giro 23 → 7.999.171) | **38,51 s di scena** | `__CPM_WALKDUR245`, braccio rosso |
| ingresso «velocissimo» di prima (prima del giro 23) | **10,5 s** fissi, passo 6,5 u/s, 0,20 s fra un'uscita e l'altra | `git show 8e7e5aa` (giro 23), stesso valore riprodotto da `ingresso-camminata-245` col suo rosso: `durata 10.5`, `vmax 6.52` |
| velo d'attesa prima della camminata (7.999.59) | 1,0-2,8 s reali al banco con la rete locale; **12,4-16,6 s reali** con i corpi CGTrader in ritardo di 25 s (tetto: 10 s di scena) | braccio rosso, `veloS` |
| caricamento dei corpi all'ingresso | CH38 «regular» pronto a 0-0,3 s (è pre-caricato al boot); corpi CGTrader montati e compilati in 2,8 s reali al banco, 20-33 s reali con la rete lenta | `ch38S`, `corpiS` |

Dove andava il tempo: il 7.999.59 metteva il caricamento **prima** della camminata, dietro il velo «Si accendono i riflettori»
(CH38 + CGTrader + compilazione degli shader, tetto 10 s), poi 38,5 s di ingresso. Sul telefono quindi fino a ~48 s.

## 2. Durata scelta: 24 s di scena

- Tetto fisico: il guardiano `ingresso-camminata-245` (PO-245, «camminata vera») vuole velocità ≤ 2,3 u/s e cadenza della clip
  di camminata fra 0,7 e 1,8. Dal tunnel (z −36) il più lontano doveva arrivare a z +28: 64 u, cioè 28 s solo di strada anche
  al tetto di velocità. Sotto i 24 s non si scende senza correre.
- Leve usate: passo **1,8 → 2,2 u/s** (cadenza misurata 1,05, velocità naturale della clip 2,07 u/s) e **fila schierata
  compatta**: 20 u invece di 56 (2 u fra due compagni invece di 5,6, più vicino alla fila spalla a spalla di una regia tv).
- Calcolo (stessa formula del gioco: ultimo arrivo + 2 s): 24,0 s; misurato `durataDich` **23,96 s**.
- 24 s è circa la media aritmetica fra 10,5 e 38,5 (24,5) e toglie il 38% del tempo di oggi; in più il velo davanti
  all'ingresso sparisce quasi del tutto (§3.2), quindi il tempo percepito scende da 38,5 + fino a 10 s a 24 s.
- La regia dei 12 s iniziali (bocca del tunnel 3,2 s + giro dello stadio) è invariata; la carrellata finale lungo la fila è
  scalata sulla fila compatta e avvicinata (§3.4).

## 3. Correzioni

### 3.1 Ingresso più rapido (`src/12`, `_placeRow` e `WALK_V245`)
Semicampata della fila 28 → 10 u, passo 1,8 → 2,2 u/s. Rosso `__CPM_NO_ING277` = 28 u e 1,8 u/s (38,51 s).

### 3.2 Il caricamento avviene durante l'ingresso (`src/12`, `_hold74`)
Il velo ora aspetta solo il corpo CH38 (pre-caricato: 0-0,3 s); montaggio e compilazione dei corpi CGTrader avvengono mentre
la camera è sul tunnel e sulle tribune. Con la rete lenta (25 s di ritardo sui `cgtrader-*.glb`): velo **0 s** (verde) contro
**12,4-16,6 s** (rosso), e i corpi sono pronti a 20-22 s reali, dentro l'ingresso; a fine ingresso nessuna attesa (0,2 s, un
campione). Rosso `__CPM_NO_ING277` = il velo che aspetta anche CGTrader.
⚠️ Prezzo dichiarato: i blocchi del thread della compilazione (motivo del 7.999.59) cadono ora nei primi secondi
dell'ingresso, quando la camera guarda tunnel e tribune, non più dietro il velo. È esattamente lo scambio chiesto dal PO; la
fluidità di quei secondi sul telefono **non posso confermarla** dal banco (fps headless senza GPU).

### 3.3 Pulsante «Salta ingresso →» (`src/15`)
Stesso stile di «Salta premiazione →» (in basso a destra, `RAD.xl`, fondo nero 0,45, `FS.body`), `data-cpm="salta-ingresso"`,
sopra il velo (zIndex 41). Il click chiede al 3D di portare tutti al proprio posto e di chiudere l'ingresso nello stesso
fotogramma (`walkT = WALK_DUR`): la fase si chiude dal percorso naturale (`onWalkoutDone`), con una rete di 4 s se il 3D è
fermo. ⚠️ Una prima stesura lasciava scorrere mezzo secondo di scena: sotto carico (gate in parallelo) in headless durava più
della rete da 2,5 s, la fase si chiudeva dalla rete e l'attesa tornava (6,6 s). Corretto prima del commit.

**Difetto trovato misurando il salto** (e corretto): il primo salto, quello secco (`setPhase("playing")`), faceva aspettare la
partita **7,4-8,0 s** anche coi corpi già caricati, perché l'attesa PO-232 vedeva 15-21 corpi su 23 «fermi». Causa misurata
leggendo lo stato del mixer per corpo: nell'ingresso la clip di riposo ha `timeScale 0` e il tempo guidato a mano (respiro
della fila, PO-206); il ripristino vive nel ciclo per-avatar, che in `playing` non torna sui corpi rimasti in attesa al
tunnel → idle a peso 1 ma «non in esecuzione». Correzione: chiuso l'ingresso (`walkDone`, anche saltato) il respiro manuale si
spegne e il riposo riparte nello stesso fotogramma. Dopo: **0 s** di attesa; rosso `__CPM_NO_ING277S` (taglio secco, nessun
ripristino) = 7,4-8,0 s. Lo stesso difetto c'era anche a fine ingresso NATURALE col codice di prima: il braccio rosso
(`__CPM_NO_ING277`) misura 4,2 s di attesa dei corpi dopo l'ingresso intero, il verde 0,2 s (un campione). Il salto dalle formazioni che esisteva già («Salta l'ingresso») non ha il difetto: il 3D lì nasce in
`playing`.
⚠️ Con la rete lenta un salto ai primi secondi non può evitare l'attesa del caricamento che manca (misurato 7,8 s di
«Caricamento giocatori» dopo un salto a 5 s con 25 s di ritardo sui file): il caricamento è partito con l'ingresso e
prosegue, ma i byte non ci sono ancora. Lo copre l'attesa PO-232 già esistente.

### 3.4 Carrellata finale sulla fila compatta (PO-276, parte «file lontane»)
La chiusura dell'ingresso guardava z 11-16, cioè oltre la coda della fila nuova (la squadra finiva piccola sul bordo
sinistro, foto `fila-verde-prima-camera.png`). Stessa carrellata scalata sulla fila (×10/28) e più vicina (x −42 → −33,
quota 9,5 → 7,2). Rosso `__CPM_NO_ING277`.

## 4. Guardiano `ingresso-277` (nuovo)

`npm run ingresso-277`, in `package.json`, nella MAPPA di `ci-runner.mjs` per `src/12|13` e `src/15`, e fra i passi LENTI.
Quattro bracci, contesto nuovo per ciascuno, service worker bloccato:

| braccio | verdetto | misurato (ultimo giro) |
|---|---|---|
| verde (rete lenta sui CGTrader) | durata in [16,26] s di scena, velo ≤ 0,4 s, pulsante presente, corpi caricati a fine ingresso | 23,96 s · velo 0 · pulsante sì · corpi pronti a 22,3 s reali, fine ingresso a 194,9 s reali (headless) · attesa dopo 0,2 s |
| salta (rete del banco) | fase fuori dal walkout ≤ 3 s dopo il click, attesa dei corpi dopo il salto ≤ 1 s | uscita +0,4 s · attesa 0 |
| salta-secco (`__CPM_NO_ING277S`) | il difetto del salto deve vedersi: attesa ≥ 3 s | 7,6 s |
| rosso (`__CPM_NO_ING277`) | durata > 26 s, nessun pulsante, velo ≥ 2 s con la rete lenta | 38,51 s · nessun pulsante · velo 10,6 s · attesa dopo 4,2 s |

Durata del guardiano: ~10-15 minuti (headless lento col GLB acceso; il rosso da solo ~5 min).

## 5. Guardiani rilanciati

Sul build finale (md5 `44d47ac9…` di `CARRIER-MANAGER-AV.html`) — vedi §7 per l'esito definitivo; prima della carrellata
(§3.4) e del ripristino dell'idle (§3.3) erano già verdi: nucleo `test:logic`, `save-compat`, `design-system`,
`typing-shortcuts`, `career-critical`; `validate-situations` PASS; `griglia-mobile`; `ingresso-245` (vmax 2,2 u/s, tutti al
posto, rosso 143,7 u/s); `ingresso-camminata-245` (vmax 2,22, clip walk 100%, cadenza 1,05; rosso 6,52 u/s); `bambini-236`
(1804/1804 per squadra, rosso 0,09-0,27); `fila-206` (quota 1 contro 0,305 del rosso); `glb-pronti-232`.
`stadi-071-ingresso` (strumento, non guardiano): borgo e arena, walkout visto, tunnel pensilina/vetro, 5 foto per caso, 0 errori.

⚠️ **`walkout-fermi-197` è rosso, e lo era già sulla base**: il suo braccio rosso (`__CPM_NO_FERMI197`) non mostra più il
difetto (somma 0 contro ≥ 15 richiesti) **anche con `__CPM_NO_ING277`**, cioè con l'ingresso di prima. Causa probabile (non
verificata): campiona solo 12 s reali dopo l'ingresso forzato, e dal giro 23 a passo di camminata in quella finestra nessun
corpo è ancora arrivato al posto, dove nasceva la «corsa sul posto». Va riscritto sul tempo di scena; non toccato in questo giro.

## 6. PO-276 — cosa è fatto e cosa no

- «Walkout con fotogrammi a campo vuoto e file lontane»: la parte **file lontane** della chiusura è corretta (§3.4). I
  fotogrammi a campo vuoto dei primi 12 s sono il giro dello stadio voluto (6.90.0 / giro 46: sguardo alla tribuna opposta)
  e **non li ho misurati né toccati**.
- Pillola «PALLA PERSA» sopra il tabellone in `hl_result`: **non posso confermare** quale elemento sia. Nel codice «Palla
  persa» compare come titolo d'esito (`_MISS_OVL.intercepted`, `src/05`) nella banda bassa dell'esito (C3), non sopra il
  tabellone; senza la foto del PO non ho trovato una pillola in alto con quel testo. Non corretto.

## 7. Esito della batteria finale

Build finale `CARRIER-MANAGER-AV.html` md5 `306cb844…` (check-src: identico byte per byte ai frammenti). Corse complete, due
catene in parallelo, nessuna interrotta:

| passo | esito |
|---|---|
| `ingresso-277` (nuovo) | ✅ quattro bracci, tabella §4 |
| `validate-situations` | ✅ PASS |
| `ingresso-245` | ✅ |
| `ingresso-camminata-245` | ✅ |
| `fila-206` (ne ho toccato la condizione) | ✅ |
| `glb-pronti-232` | ✅ |
| `bambini-236` | ✅ |
| `griglia-mobile` | ✅ uscita 0, ma dichiara «NON misurato: prepartita: playMatch → nomatch» (identico al primo giro di stamattina; non indagato) |

Nucleo (`test:logic`, `save-compat`, `design-system`, `typing-shortcuts`, `career-critical`) verde al primo giro; dopo
non ho più toccato file letti da quei passi (solo il motore 3D dell'ingresso e il pulsante). Non eseguita la catena `mirata`
completa di `ci-runner` (oltre 90 passi per `src/12`+`src/15`): resta da fare all'integrazione. Gli scatti riscritti da
`griglia-mobile` in `docs/collaudo-grafico/g0/` sono stati riportati a HEAD (artefatti della sonda, non del giro).

## Foto (`docs/sviluppo/foto-giro54/`)

- `pulsante-salta.png` — il pulsante durante l'uscita dal tunnel.
- `fila-oggi.png` — fine ingresso col codice di prima (`__CPM_NO_ING277`): fila larga, corpi sparsi.
- `fila-verde-prima-camera.png` — fila compatta con la carrellata vecchia (squadra piccola sul bordo sinistro).
- `fila-dopo.png` — fila compatta con la carrellata scalata (§3.4).
- `stadio-borgo.png`, `stadio-arena.png` — uscita dal tunnel nelle due tipologie (strumento stadi-071-ingresso).
