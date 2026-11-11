# Rapporto giro 168 — PO-363: «riga tua non nel colore del club» (grafica-v2 rosso su 4 formati)

Ramo: `sviluppo/giro168-grafica-v2`, partito da `main` 6e995b91 (7.999.190). `GAME_VERSION` non toccato.

## 1. Misura: cosa giudica grafica-v2 e cosa trova

`tests/visual/grafica-v2.mjs`, controllo **SCH › standings** (riga 162 prima del giro): prende
`[data-cpm="riga-mia-v2"]` (la `<tr>` della squadra dell'eroe nella classifica della scheda Stagione) e la
boccia se `getComputedStyle(r).backgroundColor` contiene `26, 30, 39` (superficie `#1a1e27`) o `13, 15, 20`
(fondo pagina `#0d0f14`), cioè se il fondo è uno dei due neutri del tema.

Esecuzione su `main` (banco-g0, club FC Salernum, colore `#6c1f2e` = 108,31,46):

| formato | riga misurata | colore atteso | colore trovato | esito |
|---|---|---|---|---|
| tel 412x915 | riga-mia-v2 (11ª, SAL) | un velo del club (non neutro) | `rgba(13, 15, 20, 0.28)` | ✗ |
| tabv 820x1180 | idem | idem | `rgba(13, 15, 20, 0.28)` | ✗ |
| tabo 1180x820 | idem | idem | `rgba(13, 15, 20, 0.28)` | ✗ |
| pc 1440x900 | idem | idem | `rgba(13, 15, 20, 0.28)` | ✗ |

Il valore trovato è stato letto dal nuovo guardiano `grafica-168` (braccio rosso, che rimette la chiamata di
prima) — identico in tutti i formati e per tutti i cinque colori di club provati: **il colore del club non
entra mai nel calcolo**. Tutti gli altri controlli di grafica-v2 erano verdi.

## 2. Quando è diventato rosso e perché

- La riga nasce nel commit **5086ab19** (02/11, «Grafica V2 tappa 2») con
  `background: inkVelo945(player.club?.c, 0.28)`, ed è lì che nasce anche il controllo di grafica-v2 (regex
  invariata da allora: `git log -G` sul messaggio, un solo commit).
- `inkVelo945(ink,q)` (src/01) è il **velo dell'inchiostro**: vuole `'#ffffff'` o l'inchiostro scuro, e per
  qualunque altro valore rende il velo scuro del tema. Passandogli il colore del club, il colore veniva
  ignorato **dal primo giorno**: la riga non è mai stata nel colore del club.
- Allora il velo scuro era `rgba(15,23,42,q)` (ardesia V1), che non è nella regex → grafica-v2 **verde per
  caso**.
- Il commit **a71d220d** (07/11, giro 110 PO-309, correzione G180-23 «l'inchiostro scuro è il TINTE.bg del
  tema unico») ha cambiato il velo scuro in `rgba(13,15,20,q)` = fondo pagina, che è nella regex → **rosso**
  da lì (genitore 9d3f8d66 verde per costruzione). La correzione G180-23 era giusta per il suo scopo; ha solo
  reso visibile un difetto più vecchio.
- Bisect fatto per lettura della storia (`git log -S/-G` sulla riga, su `inkVelo945` e sulla regex: sono solo
  tre commit rilevanti), non lanciando grafica-v2 su ogni commit. La prova empirica dell'equivalenza è il
  braccio rosso `__CPM_NO_G168`, che riproduce esattamente la chiamata di `main` e dà `rgba(13,15,20,0.28)`.

## 3. Gioco o strumento?

**Difetto del gioco.** Lo strumento legge l'elemento giusto (la riga esiste, `data-cpm="riga-mia-v2"`, una
sola per pagina) e dice il vero: il fondo è il neutro del tema. Lo strumento **non** è stato toccato.

Nota sullo strumento (non modificato, per non toccare un guardiano altrui): il criterio di grafica-v2 è per
esclusione, ed è stato proprio quello a lasciar passare per sei giorni un velo ardesia che non era il club.
Il nuovo guardiano usa un criterio positivo (sotto).

## 4. Correzione

- `src/01-bootstrap-tema-avatar.jsx` righe 237-245: nuova `veloClub168(col,q)` — il colore del club,
  **smorzato verso la notte con `fondoClub106`** (la regola del giro 106 già usata per la fascia della
  prossima partita), diventa `rgba(r,g,b,q)`. Interruttore rosso `window.__CPM_NO_G168` → torna a
  `inkVelo945(col,q)`, cioè al comportamento di `main`.
- `src/18-career-app.jsx` riga 9445: la riga tua usa `veloClub168(player.club?.c||"#8e1f33",0.28)`.
- Perché smorzato e non il colore puro: la prima stesura col colore puro è stata **bocciata dal guardiano
  nuovo** sul contrasto — club bianco `#f5f5f5` 2,49:1, giallo `#f59e0b` 3,44:1 sui numeri della riga (sotto
  4,5:1). Col colore smorzato il minimo è 5,16:1.
- `node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE** (7.185.850 byte, 21 frammenti).

## 5. Guardiano nuovo: `npm run grafica-168` (`tests/visual/grafica-168.mjs`)

Criterio (positivo, più severo del vecchio): su telefono 375x812, tablet 820x1180, PC 1440x900 e per cinque
colori di club (banco `#6c1f2e`, bianco `#f5f5f5`, giallo `#f59e0b`, rosso `#dc2626`, blu `#1d4ed8`; il
colore si cambia nel database `CLUBS` prima di «Continua», perché la migrazione di src/17 ripara
`player.club` da lì — cambiarlo nel salvataggio non ha effetto, misurato):
- **CLR** fondo della riga = esattamente i canali di `fondoClub106(colore)` con alfa 0,28 ±0,01, e mai uno
  dei neutri 13,15,20 · 26,30,39 · 15,23,42;
- **CON** ogni testo della riga ≥ 4,5:1 (≥ 3:1 se grande) sul fondo composto;
- **VIS** riga presente, alta ≥ 20 px, larga ≥ 95% della tabella. Riga mancante = rosso («non giudicato»).

| braccio | esito |
|---|---|
| verde | **VERDE 15/15** casi · contrasto minimo nella riga 5,16:1 (bianco), 5,26 giallo, 5,46 rosso/blu, 5,62 banco |
| rosso `__CPM_NO_G168` | **ROSSO ATTESO OK**: CLR cade in 15/15 (fondo `rgba(13,15,20,0.28)` ovunque) |

Fondi misurati col verde: banco 108,31,46 · bianco 73,75,78 · giallo 97,66,17 · rosso 141,29,31 · blu 23,55,145.

## 6. Foto (docs/sviluppo/giro168/, scala 2, club del banco)

`prima-tel375.png` `prima-tab820.png` `prima-pc1440.png` (braccio rosso = codice di `main`) ·
`dopo-tel375.png` `dopo-tab820.png` `dopo-pc1440.png`. Prima: la riga 11 (SAL) è indistinguibile dalle
righe scure alternate, resta solo la barretta a sinistra. Dopo: velo granata del club su tutta la riga.

## 7. Catena (area grafica, CLAUDE.md «solo grafica» + guardiani della grafica toccata), uno alla volta, `CPM_CI_PAR=0`

| controllo | esito |
|---|---|
| grafica-v2 (verde + rosso) | **VERDE** 4 formati, contrasto minimo 4,99:1 · rosso atteso OK (PAL e CON cadono in ogni formato) |
| grafica-168 (verde + rosso) | VERDE 15/15 · rosso atteso OK 15/15 |
| tema-unico | VERDE (+ rosso atteso OK) |
| design-system | ✅ SISTEMA GRAFICO OK |
| griglia-mobile | uscita 0 · misura completa 14 schermate x 5 larghezze (scatti rigenerati in docs/collaudo-grafico/g0 **non** committati: ripristinati) |
| test:logic | 43 pass · 0 fail |
| save-compat | 12 pass · 0 fail |
| career-critical | uscita 0 · 11/11 passi PASS (recovery-competition, save-monotonic, playing-mdref, double-tap, stale-matchday, playedmd-registry, career-invariants, pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera); oltre 10 min, eseguito in sottofondo con attesa in primo piano sulla riga FINE |

Memoria e disco prima di ogni controllo: ~13,6 GB liberi su 16 GB, disco 27% (29 GB liberi).

## 8. Domande aperte per la sessione madre

1. grafica-v2 giudica la riga per esclusione (non-neutro): è quel criterio che ha fatto passare il difetto
   dal 02/11 al 07/11. Lo lascio com'è (il guardiano positivo ora è grafica-168): va aggiunto `grafica-168`
   alle catene `grafica`/`completa` di `ci-runner.mjs` e alla mappa `src/01`/`src/18`? Non l'ho fatto per non
   toccare la configurazione delle catene senza decisione.
2. (verificato, non è una domanda) Altri usi di `inkVelo945` con un colore che non è inchiostro: nessuno.
   `grep -o "inkVelo945([^,]*," src/*.jsx`: restano solo `inkVelo945(_ink,…)` in src/18 (la fascia della
   prossima partita, inchiostro vero) e i ripieghi dentro `veloClub168`.
3. Riga della ROADMAP non scritta: il giro non spedisce una versione (GAME_VERSION invariato); la scrive la
   sessione madre al rilascio.
