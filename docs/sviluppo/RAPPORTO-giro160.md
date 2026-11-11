# Rapporto giro 160 — pavimento del testo a 12 px (D20) e taglio delle finestre sul telefono

Ramo `sviluppo/giro160-testo12` da `lavoro/190`. Versione di destinazione 7.999.191. **Solo grafica**: nessun campo nuovo nel
salvataggio, `GAME_VERSION` non toccato.

## 1. Decisioni del PO (11/11)

- **D20**: il pavimento del testo passa da 11 a 12 px, alzando il token `FS.caption` (circa 1.360 usi nei sorgenti), non a mano
  nei singoli punti. Prima si misura su telefono 360/390, tablet e PC quali schermate perdono righe o si rompono, poi si alza il
  token e si sistemano i casi rotti.
- **Taglio di 3 px sul telefono** lasciato aperto dal giro 150 (`RAPPORTO-giro150.md` §6): da correggere.

## 2. Strumento: guardiano nuovo `testo-160`

`tests/visual/testo-160.mjs`, `npm run testo-160` (non-gate, catena grafica). Salvataggio di prova S12 (`lib/banco-g0.mjs`),
14 schermate (menu, Opzioni, Dashboard, Classifica, Calendario, Coppe, Club, Profilo, Nazionale, Agente, Ufficio, e tre finestre:
offerta, privacy, intervista settimanale) x 4 formati (telefono 360x800 e 390x844, tablet 768x1024, PC 1366x768).
Per ogni schermata misura dentro la pagina:

- **corpo minimo** dei nodi di testo visibili (font-size calcolato) e quanti sotto 12 px;
- **righe** rese (righe distinte per nodo di testo, `Range.getClientRects`) e righe nascoste dal line-clamp;
- **rotture**: scorrimento orizzontale, elementi fuori schermo, testi tagliati senza ellissi (rilevatore comune `D` di
  `c178-graf-lib`), testi sovrapposti fra contenuti;
- **finestra**: pannello dentro lo schermo (bordo alto >= 0, fondo <= altezza).

**Braccio rosso tramite il banco di prova dei token** (invariante «un tema solo»: niente secondo tema, niente interruttore che spenga
la grafica): `window.__CPM_TEMA_PROVA = {fs:{caption:11}, noG160:true}`. `src/01` lo legge solo sotto `?cpmtest=1` (stesso cancello
di `TINTE`) e applica `fs` alla scala `FS`; `noG160` è l'interruttore `__CPM_NO_G160` del giro (`_noG160()`), che spegne le due
correzioni CSS. Terzo braccio `anteprima` = `{fs:{caption:12}}`, usato per misurare **prima** di toccare il token.

Verde se: nessun testo visibile sotto 12 px; nessuna finestra fuori schermo; scorrimento orizzontale 0; testi tagliati, fuori
schermo e sovrapposti non in aumento rispetto al rosso. «Non giudicato» = rosso. Il rosso deve cadere sia sul pavimento sia sulle
finestre del telefono.

Lezione di strumento: il primo rilevatore di sovrapposizioni (quello del collaudo 178) contava anche il contenuto che scorre sotto
le barre fisse («Sostieni il progetto», barra delle schede). Al 360 dava 1 → 8 «sovrapposizioni» su Nazionale e 7 → 3 su Agente
fra due bracci per il solo spostamento delle righe. La sonda esclude i nodi dentro un elemento fixed/sticky diverso dall'overlay.

## 3. Misura prima (codice di partenza contro anteprima a 12 px, 12 schermate)

| Formato | Testi sotto 12 px oggi | Tagli / scorrimento orizzontale / line-clamp con 12 px | Righe |
|---|---|---|---|
| telefono 360 | da 3 (privacy) a 204 (calendario) per schermata | 0 / 0 / 0 | +0..+6 (Ufficio 166 → 172) |
| telefono 390 | idem | 0 / 0 / 0 | +0..+2 |
| tablet 768 | idem | 0 / 0 / 0 | +0 |
| PC 1366 | idem | 0 / 0 / 0 | +0..+1 |

Finestre del telefono, **in entrambi i bracci** (difetto del giro 150, non del 12 px): offerta e privacy 324x806 a top −3 su 800
(360) e 354x851 a top −3 su 844 (390). Causa (già misurata nel giro 150): il pannello porta `maxHeight:90vh` e sta dentro
`.cpm-scroll` con `zoom:1.12`, quindi 90vh diventa ~101vh.

Nessuna schermata misurata perde righe o si rompe col token a 12. Le schermate con più righe nuove sono Calendario al 360
(+23 righe su 243, nelle liste in basso: nessun taglio) e Ufficio al 360 (+6).

## 4. Correzione

1. `src/01` — `FS.caption` 11 → **12** (un token, nessun ritocco puntuale). Commento della scala aggiornato («floor 12px»).
2. `src/01` — il banco di prova accetta la chiave `fs` (scala tipografica) e `noG160`; solo sotto `?cpmtest=1`.
3. `src/19` — **taglio del telefono**: sotto 768 px, dentro `.cpm-scroll`, il pannello `.cpm-pan150` prende
   `max-height: calc(90vh / 1.12)`. È la stessa regola del giro 150 per PC e tablet, estesa al telefono. Spenta da `noG160`.
4. `src/19` — **caso rotto trovato dalla sonda**: i tasti `1·2·3` delle scorciatoie da tastiera del menu (`.kbd`, visibili su
   tablet e PC) erano a `font-size:11px` scritto a mano nel CSS globale, fuori dalla scala: ora prendono `FS.caption`. Spenti da `noG160`.
5. `tests/visual/design-system.mjs` — il pavimento statico passa da 11 a **12** px, insieme al token (alzato, mai abbassato).
   Nessun corpo scritto a mano sotto 12 nei sorgenti.

## 5. Misura dopo — `npm run testo-160`

```
righe di testo rese: rosso 5788 → verde 5843 · righe nascoste dal line-clamp: rosso 0 → verde 0
ROSSO (banco fs.caption=11 + noG160): cade su 56/56 misure (testo sotto 12: 56 · finestre fuori schermo: 4)
VERDE: 56/56 in regola
✅ testo-160 verde e il rosso cade
```

Testi sotto 12 px nel rosso: 2.896 in tutto; nel verde 0. Prima corsa del verde: **2/56 rossi** (menu a tablet e PC, i `.kbd`
a 11 px), corretti al punto 4 e rimisurati.

Righe per schermata (rosso → verde):

| Schermata | tel360 | tel390 | tab768 | pc1366 |
|---|---|---|---|---|
| dashboard | 99→99 | 98→99 | 97→97 | 96→96 |
| classifica | 261→261 | 261→261 | 260→260 | 260→260 |
| calendario | 243→266 | 242→242 | 241→241 | 240→240 |
| coppe | 44→47 | 43→44 | 37→37 | 36→36 |
| club | 99→100 | 96→97 | 90→90 | 90→90 |
| profilo | 107→109 | 105→106 | 103→104 | 103→103 |
| nazionale | 104→106 | 103→104 | 100→100 | 100→100 |
| agente | 106→108 | 102→104 | 97→97 | 97→97 |
| ufficio | 166→172 | 165→166 | 147→147 | 143→144 |
| menu | 39→40 | 39→39 | 43→43 | 43→43 |
| opzioni | 44→45 | 41→42 | 36→36 | 36→36 |
| offerta | 85→86 | 82→83 | 78→78 | 78→78 |
| privacy | 79→79 | 76→76 | 53→53 | 53→53 |
| intervista settimanale | 27→28 | 25→25 | 25→25 | 25→25 |

Finestre (verde): offerta e privacy al 360 **324x720, da 40 a 760 su 800**; al 390 **354x760, da 42 a 802 su 844**. Tablet e PC
invariati rispetto al giro 150 (offerta tab768 520x975 da 25 a 999 su 1024).

Foto prima/dopo in `docs/sviluppo/giro160/` (`prima-*` = codice di partenza, `dopo-*` = verde; per il menu `prima` è il braccio
rosso): tel360 dashboard, ufficio, offerta, calendario · tel390 calendario, privacy · tab768 club, nazionale · pc1366 classifica,
profilo, intervista settimanale, menu — 12 coppie.

## 6. Catena grafica (un controllo alla volta, `CPM_CI_PAR=0`, `free -m` e `df -h` prima di ognuno)

| Controllo | Esito |
|---|---|
| testo-160 | ✅ verde 56/56, rosso cade 56/56 |
| design-system | ✅ SISTEMA GRAFICO OK (pavimento 12) |
| tema-unico | ✅ verde, rosso atteso |
| test:logic | ✅ 43/43 |
| save-compat | ✅ 12 pass · 0 fail |
| altezza-114 | ✅ PASS verde+rosso |
| pc-tablet-292 | _in corsa — vedi §7_ |
| finestre-150 | _da eseguire_ |
| home-larghezza-156 | _da eseguire_ |
| griglia-mobile | _da eseguire_ |
| career-critical | _da eseguire_ |

## 7. Cosa resta fuori / dichiarato

- **Copertura**: la sonda misura 14 schermate della carriera e del menu. Non apre la partita (HUD in gioco, scelta, post-partita),
  le cerimonie, la creazione e il pre-partita: lì `FS.caption` è usato ~430 volte (src/13, 15, 16). Il 12 px vale anche lì (token
  unico) ma rotture eventuali non sono misurate da `testo-160`; `griglia-mobile` copre menu, creazione, offerte e pre-partita.
- **Scala**: con `caption` a 12 i passi `caption` e `small` coincidono (12/12). Non ho toccato `small`: è una scelta di prodotto.
- **Fuori dal token**: il messaggio dello spinner di caricamento (`src/00`, `clamp(9px,2.6vw,11px)`) è prima di React e non usa la
  scala; non toccato.
- Il menu ha **1 testo tagliato** a tutti i formati, identico nei due bracci (pre-esistente, non legato al 12 px).
- Riga di roadmap: non scritta in questo giro (la versione 7.999.191 la dichiara chi integra i giri).
