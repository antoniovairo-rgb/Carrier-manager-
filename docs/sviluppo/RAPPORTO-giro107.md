# Rapporto giro 107 — la freccetta di Statistiche/Pagelle nella partita 2D

Ramo `sviluppo/giro107-freccetta`, base `lavoro/180` (999eb19, 7.999.179). Sessione figlia del collaudo 180, nessuna
decisione di prodotto. `CPM_CHROME=/opt/pw-browsers/chromium`, un controllo alla volta. Nessun bump di `GAME_VERSION`
(lo fa chi integra il giro, come per i giri precedenti).

Richiesta PO 06/11: «durante la partita 2D rivedere il posizionamento e la logica della freccetta sulle statistiche / pagelle».

## Quale freccetta

Nella partita 2D (`src/15-live-match.jsx`) le candidate erano due:

| Candidata | Dove | Stato sulla 179 |
|---|---|---|
| tasto ▾/▴ del pannello Statistiche/Pagelle | `PannelloLive2D`, barra `data-cpm="linguette918"` | **visibile, difettosa** (sotto) |
| capsula «freccetta televisiva» col verso d'attacco | `data-cpm="verso697"` (7.697, 7.791) | **spenta dalla 7.893** (PO 14/09: «puo' essere eliminata»), resta solo sotto `__CPM_NO893`; misurata assente (`verso:false`) in casa e in trasferta |

La freccetta che il PO vede è quindi il **tasto del pannello**. La capsula non è resa e non c'era niente da correggere: non l'ho toccata.

## Misure prima (codice 7.999.179, sonda esplorativa sul flusso vero)

Partita di carriera da `fixtures/save-194-primavera-w38.json`, ingresso saltato, gioco fluido. Rettangoli `[x, y, larghezza, altezza]`.

| Formato | Chiuso: freccia | Aperto: freccia | Simbolo chiuso → aperto | Linguette (altezza) |
|---|---|---|---|---|
| 360x800 (tocco) | [304,146,34,27] | [304,252,34,27] | ▴ → ▾ | 25 px |
| 412x915 (tocco) | [362,146,34,27] | [362,317,34,27] | ▴ → ▾ | 25 px |
| 820x1180 (tocco) | [760,146,44,45] | [760,468,44,45] | ▴ → ▾ | 43 px |
| 1440x900 (mouse, colonna) | [1342,289,34,27] | stesso posto | ▴ → ▾ | 25 px |

Difetti:
1. **Verso del simbolo invertito.** Dal giro 92 (PO-297) la barra chiusa sta in **cima**, sotto la striscia alta, ma il simbolo è
   rimasto quello di quando stava in basso: da chiusa mostra «▴» e il pannello si apre **sotto** (a 412: da y 141 a 312–701); da
   aperta mostra «▾» e chiudendo la barra **sale**. Sul PC (colonna) il contenuto si apre sotto l'intestazione e il simbolo era
   invertito allo stesso modo.
2. **Tasto sotto i 44 px**: 34x27 su telefono e PC; solo il tablet (≥640 px con dito) aveva 44x45. Le linguette «Statistiche»/«Pagelle»
   erano alte 25 px.
3. **Linguetta che non fa niente a pannello chiuso**: toccare «Statistiche» cambiava solo l'evidenza della linguetta (memoria
   `vista` aggiornata) senza mostrare il contenuto.

Cose verificate e risultate **corrette**: stato aperto/chiuso e vista **invariati al 46'** (cambio campo, `__CPM_SALTA297(46)`);
**stessa posizione in casa e in trasferta** (scarto 0 px a 412x915); nessuna sovrapposizione con striscia alta, tabellone e testo della
cronaca; freccia ad almeno 4 px dai bordi.

## Correzione (`src/15-live-match.jsx`, `PannelloLive2D`)

| Lettera | Cosa | Rosso |
|---|---|---|
| A | il simbolo è il **chevron di casa delle fisarmoniche** («›», ruotato di 90° verso il basso quando è aperto, transizione `MO.fast`), con `aria-expanded` e `title`; `aria-label` resta «Mostra»/«Nascondi» (lo leggono `partita2d-297` e altre sonde) | `__CPM_NO_G107A` |
| B | freccia 44 px di larghezza e almeno 44 px d'altezza, linguette almeno 44 px d'altezza, in ogni formato; l'imbottitura verticale della riga scende a 0 per non far crescere la barra più del necessario (da 37 a 46 px) | `__CPM_NO_G107B` |
| C | toccare una linguetta a pannello chiuso **apre** il pannello su quella vista (e marca la scelta come fatta, come la freccia) | `__CPM_NO_G107C` |

Niente markup V1 reintrodotto: colori `_COL918` e token `FS/FW/MO` già esistenti. Nessuna soglia abbassata.

**Fuori ambito, dichiarato:** sul telefono la barra **cambia posto** fra chiuso (in cima, giro 92) e aperto (pannello più in basso,
decisione PO 7.999.64 «posizione troppo alta del pannello»): il tasto si sposta di 106 px (360) / 171 px (412) sotto il dito. Tenerli
insieme richiede di scegliere fra le due decisioni del PO, quindi non l'ho fatto. Proposta per il PO: aprire il pannello **a partire
dalla barra in cima** (contenuto sotto la striscia) oppure lasciare la barra chiusa in basso come prima del giro 92.

## Guardiano `freccia-107` (`npm run freccia-107`)

Flusso vero, in trasferta a 360x800, 412x915, 820x1180 (tocco) e 1440x900 (mouse), **in casa** a 412x915 (la gara rimasta e quella già
giocata contro lo stesso avversario si scambiano la sede in calendario **e** nello storico: le guardie anti-loop lo pretendono, altrimenti
`playMatch` risponde `nomatch`). Giudica A (verso del simbolo = verso del contenuto, `aria-expanded`), B (≥44 px), C (linguetta apre,
freccia apre/chiude, stato al 46'), D (niente sovrapposizioni, ≥4 px dai bordi, stesso posto casa/trasferta).
Rosso `CPM_PROVA_ROSSO=1`: accende i tre interruttori su 412x915 e 1440x900 e pretende che A, B e C cadano.

Esito (registro in `foto-giro107/freccia-107.log`): **VERDE**; scarto casa/trasferta 0 px; **ROSSO: A cade · B cade · C cade**.

Dopo la correzione: freccia **44x44** e linguette alte **44** in tutti e quattro i formati; chiuso «›» (destra), aperto «›» ruotato in giù.

Due correzioni dello **strumento** durante la taratura, nessuna del gioco:
- la rotazione si legge dallo stile dichiarato (stato d'arrivo): a 820 e 1440 la lettura calcolata cadeva a metà transizione;
- la cronaca si misura sul **testo** e non sul riquadro `com661`: a 820 il riquadro parte a 963 px con un'imbottitura trasparente,
  il testo a 990 px, il pannello aperto finisce a 966 — 3 px «sovrapposti» al vuoto (foto `freccia-t820-trasf-2-aperto.png`).

Foto: `docs/sviluppo/foto-giro107/freccia-<formato>-<sede>-{1-chiuso,2-aperto}.png`.

## Rigioco (in sequenza, sul build del ramo)

**Tutti verdi, ogni braccio rosso riconosciuto.**

| Controllo | Esito |
|---|---|
| freccia-107 | verde · rosso A/B/C cade |
| test:logic | 43 pass · 0 fail |
| save-compat | 12 pass · 0 fail |
| tema-unico | verde · rosso atteso (cade P) |
| partita2d-297 | verde · rosso A/B/C cade |
| pc-tablet-292 | verde · rosso (la 177) cade su PC e tablet; telefono identico con e senza interruttori |
| partita-v2 | verde: 3 formati x 4 schermate, contrasto minimo 4,87:1 · rosso atteso |
| momenti-v2 | verde: 4 formati x 5 schermate, contrasto minimo 4,83:1 · rosso atteso |
| build-src / check-src | ricomposto, identico byte per byte |

## Osservazioni per il collaudo 180 (non corrette qui)

- 820x1180, partita 2D: nel tabellone il tasto velocità «1×» copre il «0 - 0» e la scritta «PRIMAVERA 2» è tagliata
  (`freccia-t820-trasf-2-aperto.png`).
- Al 1'–2' la striscia alta mostra **possesso 100% · 0%** (tutte e quattro le misure, casa e trasferta).
