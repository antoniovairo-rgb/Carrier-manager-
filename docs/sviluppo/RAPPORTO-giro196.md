# Rapporto giro 196 — PO-449 «T pose e non CGTrader non deve mai capitare»

Ramo: `sviluppo/giro196-tpose` (partito da `lavoro/194`). `GAME_VERSION` non toccata (regola fissa): resta 7.999.193.

## 1. Misura (prima della correzione)

Strumenti nuovi:
- **testimone per fotogramma `__CPM_T196W`** (src/12, armato solo dalla sonda): dopo ogni fotogramma disegnato conta i corpi
  visibili e inquadrati. Per scheletro: CGTrader sì/no (marca `userData.cg196` messa da `loadGLB` sui file `cgtrader*`) e T-pose
  (braccia e cosce a meno di 6° dalla rotazione di riposo del file, `userData.rq196`: nessuna clip le muove — vale anche per una clip
  che gira ma non si lega alle ossa). Conta a parte le figure procedurali (`userData.proc196`, marcate in `mkP` e `mkFig`).
- **sonda `tests/visual/tpose-196.mjs`**: telefono emulato 412×915 (o 375×812), tocco, cache vuota (contesto nuovo, service worker
  bloccato), rete lenta a **banda condivisa** (tubo da 1000 KB/s ≈ 8 Mbit/s + 120 ms di latenza su ogni `assets/*.glb|png|jpg`),
  CPU rallentata ×2 via CDP. Percorso vero: salvataggio → partita → ingresso → partita con due highlight. Scenari campionato/coppa ×
  notte/giorno.

Risultato su campionato, notte (stesso build del sito, prima della correzione):

| | fotogrammi | con corpi sbagliati | dettaglio |
|---|---|---|---|
| ingresso | 356 | **102** | figure procedurali (giocatori 230 presenze, bambini 144, panchina 2), corpi «regular» non CGTrader 37, T-pose 3 |
| highlight | 17 | 0 | (pochi fotogrammi: misura debole su questo braccio) |

Foto: `giro196/prima-campionato-notte-walkout.png`; foto del PO: `giro196/po-193-*.jpg`.

## 2. Da dove partono (src/12, src/15)

1. **Ingresso**: il velo `_hold74` aspettava solo il corpo «regular» (`__CPM_GLB_READY`, tetto 10 s). Dal giro 54 (PO-277) i corpi
   CGTrader si montano *durante* la camminata: fino all'arrivo dei ~33 MB CGTrader la fila cammina con corpi regular e figure
   procedurali, bambini compresi (`_mkMascot` → `mkFig`, sostituiti solo da `__CPM_HYPER_MASCOT_BUILDER` a pacchetto pronto).
2. **Guardalinee**: `_replaceAssistantsWithHyper` girava solo in modalità `full`; nella modalità predefinita
   (`cgtrader-highlight-optimized`) i due guardalinee (`linRef1/2`, src/12 r.~2561) restavano **figure procedurali per sempre**.
3. **Partita**: l'attesa dei corpi PO-232 mollava dopo 8 s (`__CPM_CAP232`) e apriva la scena coi corpi che c'erano; il bottone
   «Gioca comunque senza modelli 3D» rimetteva in campo i procedurali (`__CPM_SHOW_PROC`).

## 3. Correzione (rosso `window.__CPM_NO_G196`)

- `__CPM_PRONTI196()` (src/12): pronto = pacchetto CGTrader montato e compilato, teste caricate, e in **tutta la scena** nessun corpo
  visibile non CGTrader, in T-pose o procedurale. `pct` = byte CGTrader arrivati (progressi di `loadGLB`) + passi finali.
- Ingresso e cronometro (prima di aprire una scena dell'eroe) **aspettano** dietro una schermata **opaca** «Caricamento dei
  giocatori» con barra e percentuale (`data-cpm="attesa196"`). Le squadre restano al tunnel e il 3D **non si disegna** finché
  l'attesa è attiva (anche il primo fotogramma dell'ingresso: l'attesa si arma in src/12 al cambio di fase, prima che React mostri
  la schermata).
- Oltre il tetto (`__CPM_CAP196`, 60 s per attesa) o a caricamento fallito: **partita 2D** per il resto della gara (`__CPM_2D196`):
  il campo dall'alto copre anche le scene dell'eroe; se l'attesa scade nell'ingresso, l'ingresso si salta.
- Guardalinee CGTrader (LOD leggero, clip `idle`) anche nella modalità predefinita.
- Il bottone «Gioca comunque senza modelli 3D» diventa «Gioca la partita in 2D».

## 4. Dopo

`tpose-196` (stessa rete lenta, telefono 412×915, CPU ×2):

| scenario | ingresso (fotogrammi giudicati / sbagliati) | highlight | attesa dietro la schermata | 2D |
|---|---|---|---|---|
| campionato notte | ~320 / **0** | 25–32 / **0** | ~54–55 s | no |
| campionato giorno | ~320 / **0** | 25–32 / **0** | ~54–55 s | no |
| coppa notte | ~320 / **0** | 25–32 / **0** | ~54–55 s | no |
| coppa giorno | ~320 / **0** | 25–32 / **0** | ~54–55 s | no |

- Braccio rosso (`__CPM_NO_G196`, campionato notte): **102** fotogrammi sbagliati visti, cioè il guardiano è rosso col rosso.
- 375×812 su coppa notte: verde.
- Ramo 2D provato con `CPM_CAP196=5000`: l'attesa scade, la partita passa al 2D e l'highlight si gioca sul campo dall'alto
  (foto `giro196/2d/`).
- Foto: `giro196/dopo-*-walkout.png`, `giro196/dopo-*-attesa.png`, `giro196/rosso-campionato-notte-walkout.png`.

## 5. Esiti dei controlli (uno alla volta, `CPM_CI_PAR=0`)

| controllo | esito |
|---|---|
| tpose-196 | verde 4/4 scenari, rosso visto |
| scene-178 | verde, rosso visto |
| intro-292 | verde 6/6, rosso visto |
| gesto-177 | verde |
| licenze-184 | verde, rosso visto |
| clip-180 | **rosso, preesistente**: `assets/cgtrader-clip-rohr.glb` pesa 3.298.744 byte contro un tetto di 3.000.000. Il file arriva dal giro 184 (commit 85cdd28) e questo giro non tocca asset. Soglia non abbassata. |
| highlight-95 | verde (102 highlight, 0 difetti), rosso visto (171 difetti). Una prima corsa, interrotta dal tetto di 30 min del sottofondo, aveva segnato **1 difetto D3** nel braccio verde (s5/2021 «Uno-due con GÜNTHER»: il pallone non arriva al portiere entro 1,5 s dall'esito): da trattare come **instabile**, non riprodotto alla corsa completa. |

## Dubbi per il PO (non decisi)

- **Tetto di 60 s**: il PO ha detto «tempo lungo» senza un numero. 60 s per attesa è una mia scelta provvisoria.
- **Modalità 2D**: le scene dell'eroe si giocano con il campo dall'alto sopra il 3D. Rigori finali (`shootout`) e cerimonia in 2D
  non sono stati collaudati in questa modalità.
- La regola vale solo con i modelli 3D accesi; con «3D spento» dall'utente (`cpm-glb=0`) il comportamento non è cambiato.
- Sotto `?cpmtest=1` l'attesa si accende solo con `__CPM_T196ON` (le altre sonde del banco non cambiano comportamento).
- La rete del telefono del PO non è nota: la banda della sonda (8 Mbit/s) è un'ipotesi; non posso confermare che sia quella reale.
