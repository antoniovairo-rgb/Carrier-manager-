# Rapporto giro 169 — riquadro del fischio finale (PO-365, PO-366)

Ramo `sviluppo/giro169-box-fischio`, partito da `poc/marioprada-character-system` (fb2de62 = 7.999.190 + foto PO).
`GAME_VERSION` non toccata (resta 7.999.190, il numero 7.999.191 lo assegna la sessione madre).
Foto del PO: `docs/collaudo-po/190-fischio-finale-box.jpg`.

## PO-365 — «Non si vede il voto e le altre info nel box sotto»

### Causa misurata
Il riquadro della festa leggera (`data-cpm="festa47"`, `src/15-live-match.jsx`) aveva fondo **bianco**
`rgba(255,255,255,0.94)`, ma i testi usano i token del tema unico scuro (`TH.text` #f4f1ea, `TH.muted` #9aa3b2),
pensati per il fondo notte. Nessun colore di club entra nel riquadro: il difetto e' lo stesso per ogni club.

Misura del guardiano sulla build di partenza (rosso `__CPM_NO_G169`), 3 formati × 3 esiti, 54 testi:

| testo | stili (peggiore su 7 fondi) | pixel della foto | soglia |
|---|---|---|---|
| punteggio «1 – 0» | 1,00 | 1,03–1,09 | 3 |
| voto «7,4» (non oro) | 1,00 | 1,03–1,09 | 4,5 |
| «in casa contro …», «gol», «voto», «assist» | 2,23 | 2,22–2,33 | 4,5 |
| numeri «oro» (granata `TH.primary`) | 7,68 | 8,01 | 4,5 |

**45 testi su 54 sotto soglia.** Corrisponde alla foto: punteggio e voto chiaro su bianco, testo grigio debole.

### Correzione (`src/15-live-match.jsx`, r. 11422-11438)
- Il riquadro usa la superficie del tema: fondo `rgba(26,30,39,0.96)` (= `TINTE.sup` quasi opaca) con bordo `TINTE.bordo`.
- Le voci «oro» passano da `TH.primary` (granata, 1,6:1 sul fondo scuro) a `TH.gold`.
- Aggiunto `data-cpm="box-fischio"` al riquadro.
- Rosso `window.__CPM_NO_G169=true` = fondo bianco e granata di prima.

### Dopo
54/54 testi sopra soglia. Minimi: testi informativi **5,88** (stili) / **5,74** (pixel); punteggio **13,26** / **13,77**;
voto non oro 13,26 / 13,77; voci oro 7,87 / 8,18. Il riquadro e' quasi opaco, quindi il peggiore fra i fondi dietro
(bianco, nero, colori sociali dei club `ful`, `liv`, `new`, `wol`, `tot` dal database) cambia di pochi centesimi.

Foto prima/dopo: `docs/sviluppo/giro169/prima-*.png`, `docs/sviluppo/giro169/dopo-*.png`
(telefono 375×812, tablet 820×1180, PC 1440×900 · vittoria 1–0, pareggio 2–2 con voto oro, sconfitta 0–2).

## PO-366 — riquadro «7,4 voto», barra «★ 7.1»

### Da dove arrivano i due numeri (misurato nel codice)
- **Riquadro della festa** (`src/15-live-match.jsx` r. ~2463): `_voto` = voto dell'eroe da `motoreRef.current.pagelle()`
  (pagella del motore), con la formula vecchia solo come ripiego se il motore manca.
- **Voto registrato** (`_buildEndResult`, r. 10386-10397): stessa pagella (`__CPM_NO_VOTO20`, 7.999.20).
- **Card PC/tablet** (r. ~12299): stessa pagella (`__CPM_NO_VOTO23`).
- **Barra in basso del telefono** (`data-cpm="striscia"`, r. ~12344): calcolava ancora la formula vecchia
  `clamp(5.8 + min(rb,30)·0,13 + ±risultato, 4, 10)`. Era l'unico punto rimasto fuori dalla «sola sorgente» del VOTO23.

Non e' un voto «in corso» voluto: la card PC mostra in corso la pagella, e la barra del telefono e' la stessa
informazione su schermo stretto. E' un difetto.

### Correzione (`src/15-live-match.jsx`, r. ~12344 e 12349)
La barra legge la pagella dell'eroe dal motore (formula vecchia solo se il motore manca), in corso e al fischio.
`data-cpm="voto-barra"` sul ★. Rosso `window.__CPM_NO_G169_VOTO=true`.

### Misura
Telefono, gioco fluido, 12 letture: **prima 4/12 uguali** (es. barra 5,9 · registrato 6,2), **dopo 12/12 uguali**.

## Guardiano `npm run box-fischio-169` (`tests/visual/box-fischio-169.mjs`)
Verde + rosso nella stessa riga npm (`CPM_PROVA_ROSSO=1`). A) contrasto di ogni testo del riquadro, stili composti sopra
7 fondi possibili + pixel veri della foto, 3 formati × 3 esiti; testi ≥ 4,5, punteggio ≥ 3; testo o riquadro non trovato
= rosso. B) ★ della barra contro `__CPM_ENDRESULT20().rating`; meno di 6 letture = rosso.
Esiti: verde PASS (3 corse: 54/54, 12/12), rosso PASS (difetto riprodotto: 45/54 sotto soglia, 4/12).

## Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `free -m` e `df -h` prima di ognuno)
- `node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE** (7.186.229 byte).
- Catena `ci:grafica` (53 passi) + `partita-vera` + `festa-3d` + `box-fischio-169`. La catena e' stata spezzata due volte dal
  tetto di 2 ore delle attivita' in sottofondo; i passi restanti sono stati rilanciati uno alla volta (un rosso si riprova una volta).

| esito sul ramo | passi |
|---|---|
| verdi (42) | simula-v2, momenti-v2, partita-v2, patrimonio-303, intro-292, tema-unico, partita2d-297, pc-tablet-292, panchina-293, cori-291, colori-286, livello-79, barra-360-72, pallone-278, **griglia-mobile**, **design-system**, **career-critical**, **test:logic**, **save-compat**, titolo-110, pre-188, rimbalzo-189, walkout-fermi-197, fila-206, premiazione-palco-191, coppa-mani-191, posa-sollevamento-191, parata-198, busta-199, presentazione-200, guanti-201, formazioni-204, post-210, piedi-203, gesti-scena-p1b, rincorsa-144, l7-schermate, analisi-217, via-ch38-171, stadi-071, cerimonie, scene-fuori-137, kit-061, **partita-vera**, **box-fischio-169** |
| instabili, verdi alla 2a prova (2) | movimento-147, passaggio-coppa-137 |
| rossi (10) | grafica-v2, spazio-296, calendario-offerte-195, palco-corpi-191, figurine-208, piede-cross-p1b2, doppio-gesto-148, testa-146, home-066, festa-3d |

**Tutti e 10 i rossi si ripetono sulla base fb2de62** (worktree senza le modifiche del giro, stessi passi uno alla volta),
con gli stessi messaggi:
- grafica-v2: «standings: riga tua non nel colore del club» (tablet, PC) — base identica;
- spazio-296: «tel menu-home / opzioni: 16,8 div «Crea il tuo calciatore»» — base identica;
- calendario-offerte-195: braccio rosso con 0 caselle — base identica;
- palco-corpi-191: verde e rosso entrambi «dentro 0» (braccio rosso cieco) — base identica;
- figurine-208: «carte 0» in entrambi i bracci — base identica;
- piede-cross-p1b2: braccio rosso «pallone vicino al piede anche spento» — base: rosso ancora;
- doppio-gesto-148: base rossa;
- testa-146: braccio rosso con lanci 2,4/2,4/1,2 — base identica;
- home-066: «127 riquadri, 7 fuori standard» — base identica;
- festa-3d: partita persa (ramo 0–2, base 1–2) quindi niente festa — base rossa.

Le modifiche del giro toccano solo lo stile del riquadro della festa e la lettura del voto nella barra:
nessuno di questi rossi passa da li'.

## Domande aperte per la sessione madre
1. I rossi della catena elencati sopra si ripetono identici sulla base fb2de62, senza le modifiche di questo giro:
   sono preesistenti. Vanno aperti come difetti propri (alcuni sono bracci rossi ciechi: `palco-corpi-191`, `testa-146`,
   `piede-cross-p1b2`, `figurine-208`, `calendario-offerte-195`)?
2. `festa-3d` usa il seme 4545 con autoplay: la partita finisce 0–2 e, dalla regola del 23/09 (festa solo sulle vittorie
   importanti), il riquadro non compare. Il guardiano va riallineato (seme che vince o vittoria forzata)?
3. `fischio-finale.mjs` e' una sonda dell'orologio senza script npm, non un guardiano: non l'ho contata.
4. Il riquadro ora e' scuro come il resto del tema unico. Se il PO preferisce un riquadro chiaro, la strada e' l'inchiostro
   scuro sul bianco (token dedicati), non il fondo: decisione grafica del PO.
