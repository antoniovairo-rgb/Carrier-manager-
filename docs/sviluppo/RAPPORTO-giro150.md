# Rapporto giro 150 — finestre su PC e tablet (PO-352 «Finestra centrata col velo»)

Ramo `sviluppo/giro150-finestre-pc` da `lavoro/189`. Solo grafica: nessun campo nuovo nel salvataggio, `GAME_VERSION` non toccato.

## 1. Segnalazione e decisione

- Foto PO `docs/collaudo-po/188-intervista-pc.png` (ramo `poc/marioprada-character-system`, PC ~1351x703): intervista
  «Giovanni Neri», la home ai lati leggibile, finestra alta fino in fondo con la metà inferiore vuota.
- Decisione PO-352 (10/11): velo scuro su tutta la pagina, finestra alta quanto il contenuto, centrata in verticale, un po' più larga.

## 2. Misura prima (braccio rosso `__CPM_NO_G150` = codice di prima)

Sonda `tests/visual/finestre-150.mjs`, salvataggio di prova S12 (`lib/banco-g0.mjs`), finestre aperte con gli hook di prova già
esistenti (`__CPM_CAREER.forceInterview/forceOffer/apriIntro253`, Opzioni → privacy). Il velo si misura sullo **screenshot**:
luminanza media di due strisce della home ai lati della finestra, a finestra chiusa e aperta.

**Quale finestra è quella della foto.** L'occhiello «INTERVISTA», la larghezza 560 e il fondo attaccato al bordo sono
l'intervista **post-partita** (`matchCtx` win/draw/loss: foglio dal basso, `minHeight:69vh`, sotto la scena 2D della sala stampa).
Il codice dell'intervista è identico sul ramo della foto e su `lavoro/189` (confrontato con `git show`).

| Finestra | Formato | Larghezza | Vuoto in basso | Centratura | Velo (luce tolta alla home) | Tagli |
|---|---|---|---|---|---|---|
| Intervista post-partita | 1366x768 | 560 | **70 px** | ancorata in basso | 60% | — |
| Intervista post-partita | 1440x900 | 560 | **161 px** | ancorata in basso | 60% | — |
| Intervista post-partita | 1920x1080 | 560 | **286 px** | ancorata in basso | 60% | — |
| Intervista post-partita | tablet 768x1024 | 560 | **247 px** | ancorata in basso | 61% | — |
| Intervista settimanale / pre-partita | PC | **420** | 1 | centrata | 61% | — |
| Offerta di trasferimento | 1366/1440, tablet 1024 | 470 | 0 (scorre) | — | 67% | **esce di 3-4 px sopra e sotto** |
| Primo incontro col procuratore | PC/tablet | 493 | 1 | centrata | 67% | — |
| Informativa privacy | PC/tablet | 694 | 0 (scorre) | — | 68-75% | **esce di 3-4 px sopra e sotto** |

**Causa del taglio, misurata:** lo scorrimento della home (`.cpm-scroll`) porta `zoom:1.12` (src/19). I Modal montati lì dentro
vengono ingranditi di 1,12: 420 → 470 px, e il `maxHeight:90vh` diventa ~101vh (774 px su 768). L'intervista invece è un
portale su `body` e non ne risente.

**Velo:** 0,60 (intervista) e 0,66 (`TH.scrim`, gli altri). Sul tema scuro della home il 60% di luce tolta lascia leggibili
titoli e numeri: è la foto del PO.

## 3. Correzione — una regola sola

- Token nuovo `TH.scrimForte` = `rgba(0,0,0,0.82)` in `src/01` (stesso tema, nessun ramo alternativo).
- CSS globale in `src/19` (accanto al foglio del giro 114), attivo **da 768 px** (PC e tablet; telefono escluso):
  - lo strato `.cpm-velo150`: velo `TH.scrimForte`, margine `SP.lg`, finestra centrata in verticale;
  - il pannello `.cpm-pan150`: alto quanto il contenuto (via `minHeight`), `max-height` = schermo meno i margini con
    **scorrimento interno**, larghezza minima 520 px (mai più stretta di com'era: `min-width` non restringe chi è già più largo),
    raggio `RAD.xl` su tutti gli angoli;
  - dentro `.cpm-scroll` le due misure si dividono per 1,12 (zoom della home) → niente più taglio;
  - con la scena della sala stampa (`.cpm-scena150`) la finestra si centra nello spazio **sotto** la scena (31% alto).
  - Il foglio dal basso del giro 114 (`foglio`, 768-899 px) resta foglio: cambia solo il velo.
- Classi messe su: `Modal`/`ModalPannello` (quindi tutte le finestre standard: offerte, procuratore, privacy, mister, avvisi…),
  le finestre degli impulsi della home (`_pop224`, ramo senza Modal), il momento di carriera, l'intervista (tutte le varianti).
- Rosso `__CPM_NO_G150`: il CSS non viene emesso, tutto torna com'era.

## 4. Misura dopo (verde)

| Finestra | 1366 | 1920 | tablet 1024 | tablet 768 |
|---|---|---|---|---|
| Intervista post-partita | 560x461, vuoto 1, velo 82% | 560x461, vuoto 1 | centrata sotto la scena | centrata sotto la scena |
| Intervista settimanale | 520x525, centrata, velo 82% | 520x525, centrata | 520, centrata | 520, centrata |
| Offerta | 520x736, dentro lo schermo (scorre) | 520x966, centrata | dentro lo schermo | dentro |
| Privacy | 694x736, dentro (scorre), velo 85% | 694x1048, dentro | dentro | dentro |

Guardiano `npm run finestre-150` (6 formati x 6 finestre, verde e rosso nella stessa corsa):
**VERDE 36/36 in regola · ROSSO cade su 30/30 misure PC/tablet · telefono 360x800 identico fra i due bracci.**

Soglie fissate dopo la misura (mai abbassate): velo >= 75% di luce tolta (prima 60-67%), vuoto in basso <= 48 px, scarto
sopra/sotto <= 24 px, larghezza PC >= 480 px, pannello dentro lo schermo, scorrimento interno se il contenuto è più alto.
«Non giudicato» (finestra non aperta, nessuna striscia di home) = rosso.

Foto prima/dopo: `docs/sviluppo/giro150/{prima,dopo}-{pc1366,pc1920,tabO,tabV,tel}-{ivPost,ivSett}.png`.

## 5. Catena (solo grafica, un controllo alla volta)

| Controllo | Esito |
|---|---|
| finestre-150 | ✅ verde 36/36, rosso cade 30/30 |
| pc-tablet-292 | ✅ verde, rosso cade, telefono identico |
| altezza-114 | ✅ PASS verde+rosso |
| griglia-mobile | ✅ uscita 0, 14 schermate x 5 larghezze (scatti rigenerati NON committati) |
| design-system | ✅ SISTEMA GRAFICO OK |
| privacy-134 | ✅ verde 0 difetti, rosso cade |
| prossima-131 | (vedi sezione 7) |
| career-critical (due gruppi) | (vedi sezione 7) |
| test:logic | (vedi sezione 7) |
| save-compat | (vedi sezione 7) |

## 6. Cosa resta fuori / difetti misurati non corretti

- **Telefono: l'offerta e la privacy escono di 3 px** sopra e sotto anche a 360x800 (stessa causa, zoom 1,12). Non corretto
  per la consegna «telefono invariato»: la stessa riga di CSS senza la condizione `min-width:768px` lo chiuderebbe.
- **«Testata della home tagliata»** della foto: sta sotto la scena della sala stampa; ora è coperta dal velo. Non misurata a parte.
- Non censite col guardiano (coperte dalla stessa classe, ma senza hook di apertura): momento di carriera, impulsi della home,
  dialogo col mister. Le misura la stessa regola; il guardiano non le apre.
- La scena della sala stampa resta sopra il velo (è il soggetto); la finestra si centra sotto di lei, non a metà schermo.

## 7. Domande aperte per il PO

1. Velo a 0,82: la home resta appena intuibile. Lo vuoi più chiaro (0,75) o più scuro (0,9)?
2. Intervista post-partita su PC: centrata **sotto** la scena (scelta fatta) oppure a metà schermo, sopra la scena?
3. Il taglio di 3 px sul telefono (offerta, privacy): lo correggo nel prossimo giro?
4. Larghezza minima 520 px su PC per tutte le finestre: va bene anche per le conferme brevi (es. procuratore, avvisi)?
