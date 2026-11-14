# Rapporto giro 171 — i tifosi hanno il colore del club, non la maglia del giorno (PO-368)

Ramo `sviluppo/giro171-tifosi-colore-club`, partito da `lavoro/191` (b58d70e). `GAME_VERSION` non toccato.

## Segnalazione

Foto PO `docs/collaudo-po/191-tifosi-colore-trasferta.webp` (ramo `poc/marioprada-character-system`): partita 2D su PC,
FC Cesenate Primavera (casa, bianco) contro FC Leonessa Primavera (trasferta, maglia viola; colore del club celeste).
Curva ospiti e cartelloni del settore ospiti viola. Richiesta: «i tifosi devono mantenere il colore originale del club,
non prendere il colore della maglia da trasferta».

## Misura (prima di correggere)

Dove nascono i colori della folla, per ogni vista:

| Vista | Punto | Fonte prima | Giudizio |
|---|---|---|---|
| Partita 2D (spalti, settori, cartelloni) | `src/15-live-match.jsx`, chiamata `<Campo2D … tifoCasa tifoCasa2 tifoOsp tifoOsp2>` | `_mkits.homeShirt/homeAccent/awayShirt/awayAccent`, cioè la divisa che `selectMatchKits` sceglie **per contrasto in campo** (Home, Away o Third) | **sbagliato** per gli ospiti: con la seconda/terza maglia la curva ospiti prende la maglia del giorno. Per la squadra di casa la maglia Home coincide con `c`/`c2` del club, quindi il difetto si vedeva solo sugli ospiti |
| Partita 3D: folla (tele + sagome), rete, muretti | `src/12-three-match-view.jsx` → `buildStadium(_root732, sHome, sAway, …)` | `stadiumHomeCol/stadiumAwayCol` = `homeTeamObj.c` / `awayTeamObj.c` (colori sociali, dal 6.5.1) | già corretto |
| Partita 3D: bandiere, striscioni, sciarpe, teli | `src/12`, `_tHCol/_tACol/_hc2/_ac2` | primario sociale; secondario di casa `homeClub.c2`; **secondario ospiti bianco fisso `#f0f0f0`** | primario giusto; secondario ospiti non era il colore del club (non era nemmeno la maglia) |
| Presentazione / cerimonie 3D | `src/16-scene-3d-cerimonie.jsx` (`homeHex=club.c`, `awayHex=club.c2`) | colori del club | già corretto |
| Stadi e sedili | `src/10-folla-stadi-ritiro.jsx` (`seatCol=club.c`, `seatCol2=club.c2`) | colori del club | già corretto |
| Cori / panchina | `src/08-panchina-derby-meteo-cori.jsx` | nessun colore di maglia | nulla da fare |

Riproduzione (guardiano `tifosi-171`, braccio rosso = comportamento di prima): coppia della foto CES v LNS con la maglia
Third `#4e206c` → curva ospiti 2D **0% colori del club** sia a 375×812 (955 px giudicati) sia a 1440×900 (578 px),
cartelloni ospiti 0%. Stesso esito sulle altre tre coppie (sotto).

## Correzione (rosso `window.__CPM_NO_G171 = true` riporta il comportamento di prima)

- `src/15-live-match.jsx` (dopo `awayTeamObj`, ~r. 10759-10768): nuovo `_tifo171` = colori sociali di `homeTeamObj` /
  `awayTeamObj` (la **stessa fonte** dello stadio 3D), con ripiego sulla maglia solo se il club non ha colori; testimone
  `window.__CPM_G171` (scrive solo se la sonda lo arma) con colori del club, maglie del giorno e nomi.
- `src/15-live-match.jsx` (~r. 11264): `<Campo2D tifoCasa={_tifo171.c} tifoCasa2={_tifo171.c2} tifoOsp={_tifo171.o} tifoOsp2={_tifo171.o2}>`.
  `kitCasa`/`kitOspiti` (i pallini dei giocatori) restano la maglia del giorno.
- `src/15-live-match.jsx` (~r. 11273): nuova prop `stadiumAwayCol2={awayTeamObj?.c2}` a `ThreeMatchView`.
- `src/12-three-match-view.jsx` r. 408: prop `stadiumAwayCol2`; r. 2575: `_ac2` = secondo colore sociale ospite (prima `#f0f0f0`
  fisso); r. 3024: `__CPM_TIFO().colori171` = colori con cui folla e scenografia sono stati costruiti, più la maglia del giorno.
- `tests/visual/tifosi-171.mjs` + script `npm run tifosi-171` (con `CPM_PROVA_ROSSO=1`).
- `CARRIER-MANAGER-AV.html` ricomposto con `node tools/build-src.mjs`; `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE** (7.231.804 byte).

Le palette della tribuna 2D (`_spalti109`: leggibilità sul fondo, scambio col secondo colore quando gli ospiti hanno il colore
di casa) e la mappa dei settori (`_settore141/_padrone141`, curve ruotate al secondo tempo del 143) non sono state toccate:
cambia solo il colore che ricevono in ingresso.

## Guardiano `tifosi-171`

Partita vera dal salvataggio Primavera (`fixtures/save-194-primavera-w38.json`). Dopo il caricamento, con l'hook di collaudo
`__CPM_CAREER.patch`, l'eroe passa al club ospite della coppia (voce vera della tabella U18) e la giornata diventa la trasferta
in casa del club di casa; calendario ridotto a quella giornata e storico vuoto (le guardie anti-loop altrimenti rispondono
«nomatch»; cambiare l'id nel salvataggio fa ricostruire il calendario alla migrazione — entrambe le cose misurate). Gli id sono
quelli veri, quindi la maglia del giorno è quella della partita reale.

- **Scelta delle coppie** (da 36 club U18 di Primavera 1 e 2, coppie della stessa lega): la coppia della foto e poi le più
  distanti, a condizione che la **tinta principale della tribuna** del club non compaia nella tavolozza costruita dalla maglia e
  viceversa (34 candidate). Le coppie in cui la maglia del giorno è il secondo colore del club (es. club giallo/blu con maglia blu)
  sono escluse: le due tavolozze sono le stesse tinte in proporzioni diverse e la misura non le distingue (è successo nella prima
  stesura, vedi «domande»).
- **2D**: pixel della curva ospiti (rettangolo dichiarato `__CPM_G141.ospRect`, fuori dai cartelloni) e centro dei cartelloni
  del settore ospiti (`__CPM_G141.pan`); ogni pixel saturo si assegna alla tavolozza `_spalti297` del CLUB o a quella della MAGLIA
  usando solo le tinte che distinguono le due (neutri, sedili e bianchi in comune non contano). Criterio: club ≥ 80% sulla curva
  (con almeno 150 pixel giudicati) e sui cartelloni (almeno 2); sotto = «non giudicato» = rosso.
- **3D**: `__CPM_TIFO().colori171` — folla ospite = `c` del club ospite; bandiere/sciarpe ospiti = `[c, c2]` del club.
- **Formati**: telefono 375×812 (tocco) e PC 1440×900.

Esito (giro completo, 12/11):

| Coppia (casa v ospite, maglia ospite) | Formato | Verde: curva club · cartelloni club · 3D | Rosso `__CPM_NO_G171`: curva club · cartelloni club |
|---|---|---|---|
| CES v LNS (foto PO), Third `#4e206c`, club `#60a5fa` | 375 | 88% su 4776 px · 100% (7) · OK | 0% su 955 px · 0% (7) |
| | PC | 96% su 1847 px · 100% (6) · OK | 0% su 578 px · 0% (6) |
| TAT v FEL, Third `#2a9746`, club `#dc2626/#1d4ed8` | 375 | 100% su 4141 · 100% (7) · OK | 0% su 4143 · 0% (7) |
| | PC | 100% su 1674 · 100% (6) · OK | 0% su 1711 · 0% (6) |
| TAT v SAR, Third `#2a9746`, club `#dc2626/#1d4ed8` | 375 | 100% su 4119 · 100% (7) · OK | 0% su 4122 · 0% (7) |
| | PC | 95% su 1770 · 100% (6) · OK | 0% su 1807 · 0% (6) |
| VEL v VAL, Third `#ad4326`, club `#1d4ed8/#0f0f0f` | 375 | 87% su 4492 · 88% (8) · OK | 0% su 4494 · 0% (8) |
| | PC | 96% su 1872 · 100% (6) · OK | 0% su 1868 · 0% (6) |

`✅ verde: 8 misure (4 coppie x 2 formati)` · `✅ rosso: __CPM_NO_G171 rimette la maglia del giorno sulla curva ospiti 2D in 8/8
misure (foto PO compresa); bandiere 3D ospiti senza il secondo colore del club in 8/8`. Nel 3D la folla ospite resta `c` del club
anche col rosso: era già giusta, e il rosso riporta solo il bianco fisso sul secondo colore delle bandiere.

Nota: le coppie della corsa finale sono CES-LNS, TAT-FEL, TAT-SAR, VEL-VAL (la riga «coppie» del registro mostra gli id della
tabella: `ces-bres`, `juve-bol`, `juve-cag`, `napoli-inter`; le sigle U18 sono quelle a schermo).

## Foto (prima = rosso, dopo = verde), coppia della foto PO

`docs/sviluppo/giro171/`: `prima-2d-pc.png` / `dopo-2d-pc.png`, `prima-2d-t375.png` / `dopo-2d-t375.png`. Prima la curva
ospiti (a sinistra nel primo tempo) e i suoi cartelloni sono viola; dopo sono celesti come la fascia di FC Leonessa.
Le foto 3D sono state scattate e scartate: la camera della partita inquadra il prato e non gli spalti, quindi non mostravano
nulla di utile; la prova 3D è quella numerica del guardiano.

## Controlli (uno alla volta, `CPM_CI_PAR=0`, `free -m`/`df -h` prima di ognuno: ~15,2-15,5 GB liberi, 29 GB di disco)

| Controllo | Esito |
|---|---|
| `tifosi-171` (nuovo) | ✅ verde 8/8 · rosso 8/8 |
| `spalti-109` (giro 109) | ✅ verde 21/21 · rosso 21/21 (coppia PO 180 compresa) · sigle partita vera verde/rosso |
| `partita2d-141` (giri 141/143) | ✅ verde 16/16 (cartelloni per settore ≥ 95%, occupati entro 6 punti) · rosso 141 16/16 + 16/16 · rosso 143 8/8 secondo tempo, primo tempo verde 8/8 |
| `partita2d-297` | ✅ VERDE · rosso A/B/C cadono |
| `partita2d-151` | ✅ verde (4 partite, cronaca di zona lontana 0/39) · rosso S 4/4 · rosso C 49% |
| `folla` (giri 129/147, initTexture) | ✅ verde PASSA (F1 0 tele · F2 0 caricamenti · F3 19067 tifosi, scarto 0,025 · F4 firma deterministica · F5 densità) · rosso visto 3/3 |
| `griglia-mobile` | ✅ uscita 0 — 14 schermate × 5 larghezze |
| `design-system` | ✅ SISTEMA GRAFICO OK |
| `test:logic` | ✅ 51/51 |
| `save-compat` | ✅ 12 pass · 0 fail |
| `career-critical` | ✅ PASS (0 FAIL) |
| `partita-vera` | ✅ PARTITA-VERA OK — 12 bande giudicate e tenute, 2/2 partite finite |

Non toccati: `GAME_VERSION`, `docs/governo/ROADMAP.md` (la riga di roadmap la scrive la sessione madre al rilascio).

## Domande aperte per la sessione madre

1. **Maglia del giorno = secondo colore del club.** Quando la divisa scelta per contrasto è il secondo colore del club ospite
   (es. club giallo con secondo colore blu che gioca in blu), la tribuna 2D ha le stesse due tinte di prima ma in proporzioni
   diverse: dopo la correzione prevale il primario (giallo), prima il blu. Il guardiano non sa giudicare queste coppie e le esclude
   dichiaratamente. Serve una misura per proporzione (tinta prevalente) oppure basta questa esclusione?
2. **Squadra di casa in 2D.** La maglia Home coincide con `c`/`c2` del club, quindi la tribuna di casa non cambiava; ora legge
   comunque i colori del club. Se un giorno la squadra di casa potesse indossare una maglia diversa dalla Home, la regola regge già.
3. **Scenografia 3D ospite, secondo colore.** Ora è il `c2` del club ospite (prima bianco fisso). Per club col secondo colore
   scuro (nero) bandiere e sciarpe ospiti diventano più scure: le foto 3D di questo giro non inquadrano gli spalti, quindi la resa
   va guardata dal vivo o con una sonda di camera sugli spalti (`tifo-shot`?), che non ho eseguito.
4. **Barra in alto e tabellino.** Usano ancora la maglia del giorno (`colori286` su `scoreHomeCol/scoreAwayCol`): non sono
   tifosi e non li ho toccati, ma nella foto la fascia di LNS è celeste mentre i pallini sono viola. Va bene così?
