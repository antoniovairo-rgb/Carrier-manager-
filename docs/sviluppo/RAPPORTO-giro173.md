# Rapporto giro 173 — «Vai al prossimo momento» e «solo momenti salienti», rifiniture finali

**PO-364 · 7.999.191 · decisioni PO e sessione madre del 12/11 mattina**
Ramo `sviluppo/giro173-momento-salienti`, partito da `lavoro/191` (`13fa539`, contiene 165, 165b, 166). `GAME_VERSION` **non toccata**.
`SAVE_VERSION` resta 9: **nessun campo nuovo nel salvataggio** (il campo `smId` sta solo nella finestra della settimana, in memoria).
Build: `node tools/build-src.mjs` + `node tools/check-src.mjs` → «✓ IDENTICO BYTE PER BYTE — 7251816 byte ricomposti da 21 frammenti».
Interruttore rosso unico: **`window.__CPM_NO_G173`** — riporta il comportamento dei giri 165b+166 come sono uniti in `lavoro/191`, per i punti 1-6.

---

## 1. Misure prima / dopo

### 1.1 Tocchi e fermate per stagione (`momento-165b`, sezione 2)
Una stagione intera da professionista (FC Salento, prestigio 62, stagione 3, W1 → W39) col solo tasto. **Prima** = `CPM_NO173=1`
(nuova opzione del guardiano: accende `__CPM_NO_G173` su tutte le pagine); **dopo** = giro 173 acceso. Stesso build, due giri per braccio.

| Misura (una stagione) | Prima, giro 1 | Prima, giro 2 | Dopo, giro 1 | Dopo, giro 2 |
|---|---|---|---|---|
| Tocchi | 83 | 86 | 102 | 101 |
| Corse del tasto | 26 | 27 | 33 | 32 |
| Fermate «partita chiave» | 12 | 12 | 12 | 14 |
| Fermate «scelta da fare» | 4 | 5 | 8 | 6 |
| di cui per tipo | seguito 3, intervista 1 | seguito 4, offerta 1 | seguito 4, mister 2, offerta 1, intervista 1 | seguito 4, mister 1, offerta 1 |
| Fermate «momento importante» | 7 | 6 | 7 | 5 |
| Fermate «intervista» | 2 | 3 | 3 | 5 |
| Fermate «mercato» | 1 | 1 | 3 | 2 |
| Scelte di routine fatte da sole | 24 | 19 | 16 | 15 |

⚠️ **Lettura onesta.** Il «dopo» ha ~16 tocchi in più, ma la differenza sta soprattutto in categorie che questo giro **non tocca**
(interviste 2-3 → 3-5, mercato 1 → 2-3, partite chiave 12 → 12-14): mercato, impulsi e risultati usano `Math.random`, e due giri non
giocano la stessa stagione (già scritto nei rapporti 165 e 165b). Con due giri per braccio **non posso attribuire** lo scarto dei tocchi
al giro 173. La misura che separa l'effetto del giro dal caso è il **catalogo** (sotto): strutturalmente il 173 toglie una scelta di
storia possibile, non ne aggiunge.

**Catalogo** (`momento-173` sezione 1, tutti gli impulsi veri con almeno due scelte, funzione pura `storia165b`):

| | Storia | Routine | Storia per tipo |
|---|---|---|---|
| Prima (`__CPM_NO_G173`) | 50 | 80 | seguito 25 · momento di carriera 12 · **mister 8** · procuratore 2 · **offerta 2** · **intervista 1** |
| Dopo | 49 | 81 | seguito 25 · momento di carriera 12 · **mister 3** · procuratore 2 · **offerta 5** · **intervista 2** |

Momenti dello spogliatoio con almeno due scelte: 1 di storia (`sm_crisis`), 9 di routine, in entrambi i bracci.

### 1.2 Durata della partita a soli highlight con gli avvisi
Partita «Collaudo Salienti» (seme 7300, pilota automatico, 1x, 375 px, corpi 3D spenti), un gol nel gioco veloce (36', Riedel) e uno
da scena (73'):

| | Durata reale | Avvisi |
|---|---|---|
| Rosso `__CPM_NO_G173` (momento-173 §4) | 41,5 s | 0 |
| Rosso `__CPM_NO_G173`, dopo la riparazione | 40,1 s | 0 |
| Verde (momento-173 §4, cinque giri) | 42,4 · 44,2 · 43,6 · 42,5 · 42,0 s | 1 per giro; nella pagina 2.014 · 2.015 · 2.024 ms |
| `solo-highlight-166` in catena | intera **189,7 s** · soli highlight **43,3 s** | libro mastro **298/298** identico con l'avviso |

L'avviso aggiunge circa 2 s per gol nel gioco veloce: una partita con tre gol ambientali costerà circa 6 s in più.

---

## 2. Cosa ho cambiato

### `src/18-career-app.jsx`
- **r. 456-461** — commento del giro e `_g173()` (rosso `__CPM_NO_G173`).
- **r. 464 — punto 1.** `senzaPosta166(md)`: col 173 acceso è vero solo se `posta165(player, md)` dice «niente posta» (resta il controllo
  «solo professionista»). Il rosso torna a `calcMatchWeight < 5` e solo campionato. La nota sotto il bottone («Partita senza posta in palio:
  giochi solo le tue azioni. Il risultato lo decide la stessa partita.») resta valida e **non l'ho cambiata**.
- **r. 1495 — punto 5.** `MISTER173`, l'elenco esplicito delle scelte «mister».
- **r. 1496 — punto 6.** `_rinnAperto173(p)`: professionista, rinnovo aperto (stesse condizioni della card «Il contratto scade»,
  `_rinnovo165`) e non rifiutato in questa stagione (`rinnRif165b`). Vale solo col 165b acceso (la nozione di «rifiutato» è sua).
- **r. 1505-1507 — punti 4 e 5** in `_storia165b`: `wi_sponsor*` → «offerta»; «mister» solo se l'id (o `smId` per lo spogliatoio) è in
  `MISTER173`. Il rosso torna alla regola sul testo.
- **r. 1519 — punto 6.** `_saltaMotivo163`: con il rinnovo aperto il motivo è **«Prima rispondi al rinnovo»** (dopo «prima trova una
  squadra», prima di tutti gli altri). La corsa quindi non parte. La fermata «rinnovo» **dentro** una corsa resta com'era (una corsa che
  arriva a W28 si ferma lì, poi il tasto è spento col motivo).
- **r. 4466** — la finestra del momento dello spogliatoio porta `smId` (id del momento), che l'elenco «mister» legge. Solo in memoria.
- **r. 7828 — punto 6.** Il tasto `salta163-tasto` col rinnovo aperto ha aspetto spento (opacità 0,55, `aria-disabled`, `data-g173="rinnovo"`),
  il motivo sotto, e **al tocco apre la trattativa del rinnovo** (`openNegoModal`, la stessa del pulsante «📋 Negozia rinnovo» della card).
  Ho letto «apre la card del rinnovo» come «apre ciò che la card apre»: vedi domanda 2.
- Rifiuto (decisione PO, come nel 165b): «Rifiuta», «Chiudi», «Ho capito». Non ho cambiato niente lì.

**Le scelte «mister» (punto 5), una per una.** Base: i 14 impulsi e il momento dello spogliatoio con almeno due scelte il cui testo o id
nomina «mister/allenatore» (inventario fatto sul catalogo vero, `src/03`).

| Id | Prima (testo) | Dopo | Perché |
|---|---|---|---|
| `wi_figlia_mister` | mister | **mister** | il mister ti stima (`coachTrust ≥ 65`); la scelta vale +9 di fiducia del mister |
| `wi_vice_infortunato` | mister | **mister** | il mister ti chiede di guidare il gruppo: è un ruolo che ti dà il mister (leadership) |
| `wi_infortunato_posto` | mister | **mister** | parlare o no col mister per un compagno: la fiducia del mister cambia in entrambe le scelte (−2 / +4) |
| `sm_crisis` (spogliatoio) | mister | **mister** | il mister è furioso dopo una sconfitta: parlare o tacere vale ±5-6 di fiducia del mister |
| `wi_giornata_libera` | mister | routine | indicato dalla madre: giorno libero concesso, mare o palestra |
| `wi_pioggia_scelta` | mister | routine | indicato dalla madre: allenamento sotto la pioggia |
| `wi_primo_mister` | mister (id) | routine | è il **primo allenatore** dell'infanzia, non il mister di oggi; nessun effetto sulla fiducia. Il suo seguito (`wi_seg_primo_mister`) ferma comunque come «seguito» |
| `wi_sponsor_pers` | mister (testo: «il mister storce il naso») | offerta | punto 4 |
| `wi_intervista_scomoda` | mister | intervista | già riconosciuta dall'id; prima il testo la classificava «mister» |
| `wi_addio_cambio` | momento di carriera | momento di carriera | categoria «addio», invariata |
| `wi_seg_docu_rifiuto`, `wi_seg_lite_mister`, `wi_seg_intervista`, `wi_seg_primo_mister` | seguito | seguito | sono seguiti, invariati |

Sponsor (punto 4): `wi_sponsor`, `wi_sponsor_auto`, `wi_sponsor_pers` → «offerta» (regola `^wi_sponsor` sull'id). Prima erano routine
(gli ultimi due) o «mister».

### `src/15-live-match.jsx`
- **r. 2863-2868** — commento, `_sh173` (= modalità a soli highlight attiva e rosso 173 spento), `golPend173Ref`, `golFino173Ref`, stato
  `golAvv173`.
- **r. 7652 e 7667 — punto 2.** Nei due rami dei gol ambientali (compagni `team_goal`, avversari `opp_goal`), accanto al nome del marcatore
  che il gioco ha già scelto (`_tmScorer` / `_oppScorer`, lo stesso del badge «⚽ GOL — …»), si annota il gol in attesa. Nessun altro
  effetto: il ramo è identico.
- **r. 9170-9176 — punto 2.** Nel lotto dei soli highlight: dopo ogni battito, se c'è un gol in attesa il lotto si interrompe, parte
  l'avviso e per 2.000 ms i lotti successivi **non chiamano nessun battito**; poi l'avviso sparisce e si riparte. I battiti sono gli stessi,
  nello stesso ordine: cambia solo il tempo reale fra due battiti, come succede già nella partita intera (un battito ogni 1,7 s).
  Testimone di collaudo `__CPM_GOL173`.
- **r. 9178** — `_sh173` fra le dipendenze dell'effetto.
- **r. 11029 e 11114 — punto 3.** Le due versioni del tasto della velocità (intestazione vecchia e intestazione V2) non si mostrano con
  `_sh173`. La preferenza salvata (`cpm-match-speed`) non cambia.
- **r. 11603-11605 — punto 2.** Sul velo, al posto di «Si va al prossimo momento», l'avviso (`data-cpm="gol-173"`, `role="status"`):
  **«GOL! Riedel 36'»** (oro) per i nostri, **«Gol subito · <nome> <minuto>'»** (testo chiaro) per gli avversari. Solo token del tema.

### Punto 7 (nessuna modifica)
In panchina il bottone resta assente (`coachDecision?.status==="starter"`, invariato); la scheda prepartita non ha il bottone; i testi del
166 restano quelli approvati.

### `tests/visual`
- **Nuovo guardiano `momento-173.mjs`** (`npm run momento-173`), in `ci-runner.mjs` nella catena `carriera`, nelle mappe di `src/18`,
  `src/0[0-8]` e `src/15`, e fra i passi lenti. Controllato: in ogni catena (completa, carriera, grafica, fumo) compare al massimo una volta,
  e nessuna catena ha doppioni (completa 101 passi, carriera 68, grafica 56, fumo 3).
- `momento-165b.mjs`: le sezioni 1 e 3 giudicano il comportamento del 165b (mister dal testo, rinnovo che ferma a ogni corsa), che dal 173
  vive nel rosso: si aprono con `__CPM_NO_G173` (stessa scelta fatta nei giri 165 e 165b per `salta-163` e `momento-165`). Nuova opzione
  `CPM_NO173=1` per misurare il «prima». Nessuna soglia cambiata.
- `solo-highlight-166.mjs`: il controllo statico 2 ora pretende `if(_g173())return !posta165(player,md)` e, nel rosso, la vecchia regola.
  Nessuna soglia cambiata.
- `package.json`: script `momento-173`.

---

## 3. Guardiano `momento-173`

1. **Classifica** (pura): sponsor → «offerta»; elenco mister → «mister» (tre impulsi e `sm_crisis`); giornata libera, pioggia, primo
   allenatore → routine; spogliatoio che nomina il mister ma fuori elenco → routine; stessa risposta due volte; salvataggio intatto.
2. **Rinnovo** (375 px): tasto spento con «Prima rispondi al rinnovo» e la card sulla home; toccandolo si apre la trattativa e non parte
   nessuna corsa; rifiutato dal pulsante vero (Negozia → «Chiedi +30%» → Rifiuta/Chiudi, oppure «Ho capito») il tasto torna normale e la
   corsa non si ferma sul rinnovo.
3. **Bottone dei momenti salienti** (prompt vero): partita senza posta → c'è; con la 100ª presenza in arrivo (`posta165` «🎖️ 100ª presenza
   in carriera», peso `calcMatchWeight` 1, cioè un caso che la regola del 166 lasciava passare) → non c'è.
4. **Partita a soli highlight**: nella partita intera il tasto della velocità c'è; a soli highlight un gol nel gioco veloce mostra l'avviso
   (testo, durata 1,6-3,0 s misurata nella pagina da un osservatore del DOM, minuto fermo, numero di avvisi = testimone), e il tasto della velocità non compare in nessun campione di gioco.
   Nessun gol nel gioco veloce = **non giudicato = rosso**.

| Braccio | Esito |
|---|---|
| verde | **19/19, uscita 0**, tre volte di fila dopo la riparazione della misura (§4) |
| rosso `CPM_ROSSO173=1` | **9 verdi, 10 rossi, uscita 1** — sponsor null/null/mister · giornata libera, pioggia, primo allenatore «mister» · spogliatoio fuori elenco «mister» · tasto acceso senza motivo · il tocco apre la conferma della corsa invece della trattativa · bottone dei salienti presente con la 100ª presenza · 0 avvisi (non giudicato) · tasto della velocità visibile |

Comandi:
```bash
cd tests/visual
CPM_CHROME=/opt/pw-browsers/chromium npm run momento-173                     # verde
CPM_ROSSO173=1 CPM_CHROME=/opt/pw-browsers/chromium npm run momento-173      # rosso (deve uscire 1)
CPM_SOLO173=2,4 CPM_FOTO173=../../docs/sviluppo/giro173 CPM_CHROME=/opt/pw-browsers/chromium npm run momento-173   # foto
CPM_NO173=1 CPM_SOLO165B=2 CPM_CHROME=/opt/pw-browsers/chromium npm run momento-165b   # misura «prima»
```

---

## 4. Catena

Build provata: commit `af4be1d` (`check-src`: IDENTICO BYTE PER BYTE, 7.251.816 byte). Esecutore di appoggio fuori dal repo: **un passo
alla volta** (`CPM_CI_PAR=0`), `free -m` e `df -h` scritti nel registro prima di ogni prova, un rosso riprovato fino a 3 volte (come
`ci-runner`: verde alla 2ª o 3ª = instabile; rosso vero = 3 su 3). Lanciato dentro il turno con attese in primo piano, dalle 08:10 alle
19:02 (nessuna interruzione). Memoria libera fra 14.141 e 14.686 MB, disco libero 29 GB in tutti i passi.
Passi: la catena **`carriera`** di `ci-runner.mjs` (68, con `momento-173`) + `test:vision`, `typing-shortcuts`, `tripath-chokepoint`,
`design-system`, `solo-highlight-166`, `partita-vera`, `validate-situations` = **75**. `STABILITA.json` non scritto (non è il `ci-runner`).

**Esito: 71 verdi al primo colpo · 2 instabili (verdi alla 2ª prova) · 2 rossi 3 su 3, entrambi preesistenti e fuori dal giro.**

| Controllo | Cosa è successo |
|---|---|
| `validate-situations` | **PASS 14/14**, fingerprint `00001505`, 0 failure (635 s) |
| `solo-highlight-166` | verde (344 s): **libro mastro 298/298 voci identiche** fra partita intera e soli highlight **con l'avviso attivo**, risultato 2-0 uguale, schermata finale e voce di carriera uguali; soli highlight **43,3 s** (gioco fluido 9,2 s, scene 29,4 s, prepartita 4,6 s) contro **189,7 s** dell'intera; rosso cade su 3, 7, 8. ⚠️ Il mandato diceva «288/288»: su questo build la stessa partita ha 298 voci (82 recita, 82 cronaca, 110 turn…), in entrambe le modalità |
| `partita-vera` | verde, 12 bande su 12, partite finite 2/2 (380 s) |
| `momento-165` · `momento-165b` · `salta-163` · `indice-163` | verdi |
| `momento-173` | **instabile**: 1ª prova rossa sulla sola durata dell'avviso (1.422 ms), 2ª verde (1.976 ms). Causa **nello strumento**: la durata era misurata fra due campioni del banco (`page.evaluate` ogni ~80 ms + latenza), cioè velocità × intervallo. Riparato (vedi sotto) |
| `ripartenza-207` | **instabile** (rosso, poi verde): nella 1ª prova il braccio «rosso18» non ha mostrato il difetto che deve mostrare. Gioca partite intere, dove niente del giro 173 è attivo (`_sh173` vale solo a soli highlight). Non riparato: fuori ambito, segnalato |
| `parata-100` | ❌ **3 su 3**, con **gli stessi numeri del giro 166 su `main` 7.999.190**: verde 8 parate (tutte su tiro del compagno), 0 sul ramo `cross_goal` («non giudicato»), 0 difetti; rosso 1 parata. Preesistente |
| `finale-202` | ❌ **3 su 3** in 0 s: «ancora della simulazione non trovata». È statico e legge `src/14-motore-possesso.jsx`, che questo giro **non tocca**: cerca `forza:{home:+o.forzaH||65,away:+o.forzaA||65},`, mentre il motore oggi scrive `forza:{home:_fH157,away:_fA157}` — **anche su `main` e su `lavoro/191`** (verificato con `git show`). Preesistente |
| `grafica-v2` | **verde** (nel giro 166 era rosso anche su `main`) |

**Riparazione di `momento-173` e rigiocata.** La durata dell'avviso ora si misura **nella pagina**: un `MutationObserver` stampa
`performance.now()` quando l'avviso compare e quando sparisce; il campionamento del banco resta solo per «visto», testo e minuto fermo.
Soglia invariata (1,6-3,0 s). Dopo la catena, sul build `af4be1d` (la riparazione tocca solo il guardiano), uno alla volta:

| Prova | Esito | Durata dell'avviso nella pagina · fra campioni del banco | Partita a soli highlight |
|---|---|---|---|
| verde 1 | 19/19, uscita 0 | 2.014 ms · 1.919 ms | 43,6 s |
| verde 2 | 19/19, uscita 0 | 2.015 ms · 1.859 ms | 42,5 s |
| verde 3 | 19/19, uscita 0 | 2.024 ms · 1.898 ms | 42,0 s |
| rosso `CPM_ROSSO173=1` | 9 verdi, **10 rossi, uscita 1** | nessun avviso | 40,1 s |

Tutti i passi:

| # | Controllo | Prove (esito, durata) |
|---|---|---|
| 1 | `test:vision` | ✅ 2s |
| 2 | `typing-shortcuts` | ✅ 19s |
| 3 | `tripath-chokepoint` | ✅ 0s |
| 4 | `design-system` | ✅ 0s |
| 5 | `solo-highlight-166` | ✅ 344s |
| 6 | `partita-vera` | ✅ 380s |
| 7 | `validate-situations` | ✅ 635s |
| 8 | `indice-163` | ✅ 49s |
| 9 | `salta-163` | ✅ 155s |
| 10 | `momento-165` | ✅ 224s |
| 11 | `momento-165b` | ✅ 222s |
| 12 | `momento-173` | ❌ 113s · ✅ 112s |
| 13 | `grafica-v2` | ✅ 213s |
| 14 | `simula-v2` | ✅ 91s |
| 15 | `momenti-v2` | ✅ 421s |
| 16 | `partita-v2` | ✅ 536s |
| 17 | `patrimonio-303` | ✅ 192s |
| 18 | `intro-292` | ✅ 103s |
| 19 | `tema-unico` | ✅ 47s |
| 20 | `carriera3-94` | ✅ 207s |
| 21 | `assist-298` | ✅ 1867s |
| 22 | `schermate-97` | ✅ 259s |
| 23 | `highlight-95` | ✅ 5291s |
| 24 | `parata-100` | ❌ 3159s · ❌ 3275s · ❌ 3153s |
| 25 | `riserva-103` | ✅ 562s |
| 26 | `riserva-104` | ✅ 443s |
| 27 | `contatto-103` | ✅ 604s |
| 28 | `consegna-103` | ✅ 1261s |
| 29 | `colla-103` | ✅ 318s |
| 30 | `assist-nome-98` | ✅ 3085s |
| 31 | `chiusura-99` | ✅ 1382s |
| 32 | `scena3d-96` | ✅ 1441s |
| 33 | `esiti-96` | ✅ 716s |
| 34 | `impulsi-289` | ✅ 34s |
| 35 | `piccoli-85` | ✅ 42s |
| 36 | `trainer-288` | ✅ 32s |
| 37 | `test:logic` | ✅ 3s |
| 38 | `save-compat` | ✅ 8s |
| 39 | `replay` | ✅ 41s |
| 40 | `career-critical` | ✅ 582s |
| 41 | `classifica-102` | ✅ 31s |
| 42 | `recupero-103` | ✅ 60s |
| 43 | `euro-attesa-181` | ✅ 24s |
| 44 | `riquadro-euro-105` | ✅ 33s |
| 45 | `avversario-106` | ✅ 9s |
| 46 | `rinvio-coppe-107` | ✅ 48s |
| 47 | `etichette-108` | ✅ 10s |
| 48 | `titolo-110` | ✅ 23s |
| 49 | `pre-188` | ✅ 16s |
| 50 | `conferenza-192` | ✅ 0s |
| 51 | `partita-rigiocata-194` | ✅ 511s |
| 52 | `pro-rivale-176` | ✅ 38s |
| 53 | `rigori-190` | ✅ 9s |
| 54 | `debito-190` | ✅ 0s |
| 55 | `scene-190` | ✅ 1s |
| 56 | `finale-202` | ❌ 0s · ❌ 1s · ❌ 0s |
| 57 | `ripresa-202` | ✅ 429s |
| 58 | `tetto-202` | ✅ 6s |
| 59 | `minuti-202` | ✅ 162s |
| 60 | `recupero-202` | ✅ 485s |
| 61 | `ripartenza-207` | ❌ 1332s · ✅ 1330s |
| 62 | `anteprima-212` | ✅ 32s |
| 63 | `mister-215` | ✅ 31s |
| 64 | `presentazione-214` | ✅ 43s |
| 65 | `possesso-209` | ✅ 549s |
| 66 | `brain-202` | ✅ 426s |
| 67 | `tempo-138` | ✅ 515s |
| 68 | `tabellino-216` | ✅ 509s |
| 69 | `squalifica-222` | ✅ 135s |
| 70 | `investimento-223` | ✅ 199s |
| 71 | `infortunio-263` | ✅ 176s |
| 72 | `svincolato-264` | ✅ 127s |
| 73 | `meta-conto-265` | ✅ 57s |
| 74 | `rimbalzo-189` | ✅ 62s |
| 75 | `acquisti-281` | ✅ 79s |

Nessun file del repo è stato modificato dalla catena (`git status` pulito a parte questo rapporto e il guardiano riparato).

---

## 5. Foto (`docs/sviluppo/giro173/`, scala 2)
- `avviso-gol-telefono.png` (375 × 812) e `avviso-gol-pc.png` (1366 × 768): velo dei momenti salienti con «GOL! Riedel 36'»; in
  intestazione accanto alla pausa non c'è il tasto della velocità.
- `tasto-rinnovo-telefono.png` / `tasto-rinnovo-pc.png` (+ `-schermo`): tasto spento con «Prima rispondi al rinnovo».
- `trattativa-dal-tasto-telefono.png` / `trattativa-dal-tasto-pc.png`: la trattativa aperta toccando il tasto.
- **Non fotografato:** l'avviso «Gol subito» (nella partita del guardiano non ci sono gol avversari nel gioco veloce); il testo è giudicato
  solo sul formato.

## 6. Fuori ambito (non fatto)
Riga di roadmap e bump di versione (sessione di rilascio) · `posta165` e le sue soglie · il `Math.random` di mercato/impulsi · la
variabilità di base della partita intera (rapporto 166 §4.3).

## 7. Domande per la sessione madre (nessuna decisa qui)
1. **Nome del marcatore.** Nella foto `avviso-gol-telefono.png` la riga di cronaca dice «GOL! Jung (WRK) la mette dentro su assist di
   Vogt», mentre il badge del gioco («⚽ GOL — RIEDEL») e il mio avviso dicono Riedel. L'avviso usa lo stesso nome del badge (`_tmScorer`);
   la riga di cronaca sembra scelta altrove. È un difetto già presente (non nato qui), da aprire come voce a parte?
2. **«Apre la card del rinnovo».** Il tocco apre la **trattativa** (la stessa finestra del pulsante «📋 Negozia rinnovo» della card), non
   scorre fino alla card. Va bene, o si preferisce portare la vista sulla card?
3. **Elenco mister.** `wi_infortunato_posto` (un compagno ti chiede di parlare col mister) e `sm_crisis` (il mister furioso nello
   spogliatoio) li ho messi fra le storie perché cambiano la fiducia del mister; `wi_primo_mister` fra la routine perché è il primo
   allenatore e non il mister di oggi. Confermate?
4. **Altre «offerte» di routine.** Restano routine altre proposte commerciali della categoria «opportunità» (`wi_videogioco`,
   `wi_docufilm`, `wi_biografia`…). La decisione parlava solo di `wi_sponsor*`: le altre vanno spostate?
5. **Rossi preesistenti della catena.** `parata-100` (nessuna parata sul ramo `cross_goal`) e `finale-202` (ancora del motore cambiata
   in `src/14`) sono rossi anche su `main`; `ripartenza-207` è instabile sul braccio «rosso18». Vanno a un giro dei rossi?
6. **Tocchi per stagione.** Due giri per braccio non bastano a separare l'effetto del giro dalla varianza delle stagioni (§1.1). Serve una
   misura su più stagioni (es. 5+5 giri, ~25 minuti) prima del rilascio?
