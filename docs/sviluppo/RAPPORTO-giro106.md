# RAPPORTO — giro 106 · Home sul telefono coi colori sociali veri

Ramo `sviluppo/giro106-home-telefono` (da `lavoro/180` = main 7.999.179 + la foto del PO).
`GAME_VERSION` e `docs/governo/*` non toccati, come negli altri giri: li aggiorna chi integra.

## Il difetto

Foto del PO `docs/collaudo-po/179-home-telefono-merseyside.jpg` (Android, Chrome, ~360x800 CSS, FC Merseyside
#dc2626): «Si vede malissimo». Guardata: quattro difetti (A-D), più uno trovato misurando (nome delle squadre nel
riquadro spezzato dentro la parola, «FC WOLVERHAMPTO / N»), messo sotto A.

**Perché nessun guardiano lo vedeva.** grafica-v2 e momenti-v2 misurano col club del banco (FC Salernum, #6c1f2e:
granata scuro, già sotto la soglia di abbaglio) e con un nome corto. Il guardiano nuovo, col braccio rosso,
riproduce la foto del PO pixel per pixel (`foto-giro106/prima-merseyside-360x800.jpg`): «FC / MERSEY / SIDE»
(nel telefono del PO «MERSEYSI / DE»: stesso difetto, larghezza diversa di qualche pixel), riga di meta su 6 righe,
muro rosso, «Zona retrocessione» sotto la colonna del giocatore.

## Le correzioni (src/01, src/18)

| | Causa misurata | Correzione | Rosso |
|---|---|---|---|
| **A** testata | la colonna del nome era larga ~86 px a 360: accanto c'erano le due icone da 44 **e il chip della versione**, che svanisce (opacità) ma tiene il suo posto; `overflowWrap:"anywhere"` spezzava la parola | riga 1 stemma · nome · Salva · Opzioni; riga 2 «Lega · St. · Sett. · posto» larga quanto la testata; riga 3 «salvato hh:mm» + versione. Il nome va a capo solo fra parole e sopra i 14 caratteri scende da 17 a 15 px. Testata 160 → **95 px** | `__CPM_NO_G106A` |
| **A** riquadro | nome delle squadre con `overflowWrap:"anywhere"` → «FC WOLVERHAMPTO / N» | a capo solo fra parole; la parola più lunga decide il corpo (≥13 lettere 13 px, ≥11 15 px, altrimenti 17) | `__CPM_NO_G106A` |
| **B** riquadro prossima | fondo = colore sociale pieno (#dc2626: luminanza 0,167); velo dell'inchiostro a 0,85 → 3,82:1, «VS» 2,51:1; i colori chiari (bianco, celeste, oro) peggio ancora | `fondoClub106()` in src/01: il colore si mescola verso `TINTE.bg` finché **luminanza ≤ 0,070 e canale massimo ≤ 148** — la misura della tavola V2Home, disegnata su #8e1f33 (0,070 e 142). I colori già sotto (granata, blu scuri, neri) restano invariati. Sfumatura verso la notte (`backgroundImage`, solo dove il colore è stato smorzato); il contrasto si misura sul colore pieno, cioè sul punto più chiaro | `__CPM_NO_G106B` |
| **C** fondo pagina | — | **nessuna correzione**: misurato che a fine scorrimento l'ultimo contenuto finisce a 632 px e la fascia comincia a 717 (85 px d'aria), e che a fine pagina le strisce si nascondono da sole (meccanismo 6.2.1). Nella foto il riquadro «STAGIONE» è tagliato perché lo scorrimento è a metà. Fascia + barra: **103 px = 12,9%** di 800 (strisce 27 px) | nessun braccio (niente da spegnere) |
| **D** «Zona retrocessione» | la frase scatta con `op >= st.length-2`, cioè sulla posizione dell'**avversario**; in una riga a capo finiva sotto la colonna del giocatore (7°) | «⚠️ Avversario in zona retrocessione», su una riga sua e centrata sul riquadro | `__CPM_NO_G106D` |

Markup V1 non reintrodotto; tema unico intatto (si usano solo `TINTE`/`TH`; `fondoClub106` legge `TINTE.bg`).
Il ramo morto della card V1 (r. ~7653, dopo il `return` della V2) ha avuto solo lo stesso cambio di testo della D.

## Guardiano nuovo: `npm run home-colori-106`

`tests/visual/home-colori-106.mjs` — stessa carriera del banco (`banco-g0`) che cambia maglia: otto club **veri**
del database, uno per famiglia di colore, a 360x800 col tocco, classifica col giocatore 7° e l'avversario ultimo.
Misure: A (nessuna parola spezzata, nessun trabocco, nome ≤ 2 righe, meta ≤ 2 righe), B (contrasto WCAG di ogni
testo del riquadro ≥ 4,5:1, ≥ 3:1 per i testi grandi; abbaglio: luminanza ≤ 0,070, canale ≤ 148), C (ultimo contenuto
sopra la fascia a fine scorrimento; fascia + barra ≤ 14% dell'altezza), D (la frase dice di chi parla ed è centrata
entro 20 px). Lo script npm esegue verde e rosso (`CPM_ROSSO=ABD`).

| club | colore | fondo dopo | lum | contrasto min | testata |
|---|---|---|---|---|---|
| FC Merseyside | #dc2626 rosso vivo | 141,29,31 | 0,066 | 4,13 (VS, testo grande, soglia 3) | 95 px |
| FC Wolverhampton | #f59e0b oro | 97,66,17 | 0,065 | 4,45 (grande) | 95 |
| Torino Athletic | #f5f5f5 bianco | 73,75,78 | 0,070 | 4,36 (grande) | 95 |
| FC Manchester | #93c5fd azzurro chiaro | 56,73,95 | 0,064 | 4,50 | 95 |
| FC Vellamare | #38bdf8 celeste | 28,78,102 | 0,067 | 4,39 (grande) | 95 |
| FC Westflandria | #15803d verde | 18,85,45 | 0,068 | 4,31 (grande) | 95 |
| FC Torvelle | #6c1f2e granata scuro | invariato | 0,044 | 4,99 | 95 |
| FC Kaiserslautern (17 caratteri) | #dc2626 | 141,29,31 | 0,066 | 4,13 (grande) | 95 |

Tutti i testi piccoli sono ≥ 4,5:1; i valori sotto 4,5 sono il «VS» da 32 px (soglia 3). **Verde 8/8.**
**Rosso** (`CPM_ROSSO=ABD`, build finale): A cade su 8/8, B su 7/8 (tutti i colori vivi; Torvelle no, è già sotto
la soglia ed è giusto così), D su 8/8. Prima del rimedio, su Merseyside: luminanza 0,167, «VS» 2,51:1, testi piccoli
3,82:1; sul bianco «SETT. 12 · CASA» 2,16:1.

⚠️ Limiti dichiarati: Chromium headless con `isMobile`, non un telefono vero; la larghezza utile del telefono del PO
può differire di qualche pixel (lo zoom 1,12 della colonna è lo stesso). I nomi lunghi provati arrivano a 17
caratteri (FC Kaiserslautern); un nome con una sola parola di 15+ lettere non esiste nel database oggi.

## Regressione (in sequenza, `CPM_CI_PAR=0`, build finale)

| passo | esito |
|---|---|
| home-colori-106 | verde 8/8 + rosso ABD atteso |
| grafica-v2 | VERDE 4 formati, contrasto min 4,99:1 · rosso atteso OK |
| momenti-v2 | VERDE 4x5, contrasto min 4,83:1 · rosso atteso OK |
| tema-unico | verde · rosso atteso OK |
| griglia-mobile | uscita 0, 0 difetti su 1740 controlli (artefatti in `docs/collaudo-grafico/g0` rigenerati e **scartati**: il report versionato era già di un build precedente, non lo aggiorno da un giro) |
| design-system | SISTEMA GRAFICO OK |
| career-critical | 11/11 passi verdi (la catena intera sfora i 10 minuti: rieseguita a gruppi dai passi) |
| test:logic | 43/43 |
| save-compat | 12 pass · 0 fail |
| chip-269 (in più: ho spostato il chip della versione) | verde · rosso atteso |

Tutti i passi sono girati sul build del commit 8934095, che contiene già tutte le correzioni del gioco (il secondo
commit aggiunge solo rapporto e foto, nonostante il titolo citi i nomi delle squadre).

`node tools/build-src.mjs` + `node tools/check-src.mjs`: IDENTICO BYTE PER BYTE.

## Scelte prudenti (sessione figlia, nessuna decisione di prodotto)

- **C non toccato**: la misura dice che il contenuto si scorre fino in fondo e che la fascia è 27 px; ridurla
  avrebbe toccato le aree di tocco del giro 97 (decisione PO). Se il PO vuole la fascia più bassa o nascosta prima,
  è una decisione sua.
- Soglia d'abbaglio presa dalla tavola V2Home (#8e1f33), non inventata. Un club bianco diventa grigio ardesia, un
  giallo diventa ocra: l'identità resta nello stemma e nella sfumatura, il riquadro non abbaglia più.
- «salvato hh:mm» resta nella testata (decisione PO 02/11), su una riga sua con la versione.
- Nessun bump di versione, nessuna riga di roadmap: lo fa chi integra.

Foto: `docs/sviluppo/foto-giro106/` — `prima-*` (bracci rossi ABD, riproduce la foto del PO) e `dopo-*` per
FC Merseyside, FC Wolverhampton, FC Manchester, più `dopo-merseyside-fondo-pagina` (fine scorrimento).
