# Rapporto giro 32 — PO-228 «Ritara i passaggi a ~814»

Data: 15/10/2026 · Ramo `sviluppo/passaggi-228-giro32`, base `lavoro/170` (7.999.170, `8fd95fe`) · GAME_VERSION e
SAVE_VERSION invariate · nessuna modifica a `src/` né a `CARRIER-MANAGER-AV.html`.

## Esito in breve

**Sulla 7.999.170 i passaggi sono già a ~814: 811,3 di media su 40 partite vere (due serie di semi: 815,0 e 807,7).**
Lo scarto del collaudo (739) era della 7.999.169. Una ritaratura in questa situazione allontanerebbe dal bersaglio, quindi
**non l'ho applicata**. La correzione preparata e misurata al banco (+2,5 % in partita vissuta, tiri/xG fermi) resta come
patch pronta, non adottata: `docs/sviluppo/dati-giro32/ritaratura-pronta-non-adottata.patch`.

Fra 169 e 170 però sono cambiati anche **tiri (−17 %), xG (−17 %) e cross (−22 %)**, cioè proprio le voci che la decisione PO
chiede di non toccare. Lo spostamento non viene dal motore del possesso (al banco 169 e 170 sono identici al bit) né dalle
schede del giro 28 (vedi §4). Lo segnalo come punto da decidere.

## 1. Metodo

- Sonda: `tests/visual/passaggi-228-vivo-misura.mjs` (npm `passaggi-228-vivo-misura`), copia della sonda del collaudo
  (`collaudo/mirato-169`: `collaudo-169-stats.mjs`) con la stessa procedura: salvataggio `fixtures/save-190-s12-ovr93.json`,
  GLB spento, velocità 4, autoplay seedato, una partita alla volta, tabellino letto da `__CPM_MOTORE_OBJ().tabellino()`.
  Aggiunte: `PRE` (prefisso dei nomi = seme), `FLAG` (interruttori), contatori interni del motore e del debito delle scene,
  `TRACCIA=1` (fase · minuto · scena del motore ogni 250 ms).
- Bersaglio: «~814» = valore del banco del giro 16 (rapporto collaudo 169, §A: «Banco giro 16: obiettivo ~814»; guardiano
  banco 800-950). Misura del collaudo: 739,1 (sd 63,3) su 20 partite della 7.999.169.
- Serie A = gli stessi 20 nomi del collaudo (`Collaudo169 Atleta 01…20`); serie B = 20 nomi nuovi (`Giro32 Serie B 01…20`).
  Tutte le 40 partite sono arrivate al fischio (`ceremony`).
- **Tolleranza dichiarata: 814 ± 3 % (790-838).** Ragione: l'errore standard della media su 40 partite è 9,3 (1,1 %), le due
  serie differiscono di 7,3; ±3 % è circa tre errori standard.
- Rumore fra semi (per partita, 40 partite): passaggi sd 58,9 · tiri sd 3,1 · gol sd 1,2 · xG sd 0,51. Su medie da 20 partite
  l'errore standard della DIFFERENZA fra due serie è ~19 passaggi (2,3 %), ~1,0 tiri (5 %), ~0,4 gol (18 %), ~0,16 xG (11 %).

## 2. Prima e dopo (due squadre insieme, medie per partita)

«Dopo» = la 7.999.170 senza modifiche (nessuna correzione adottata). Per confronto, la colonna 169 è il collaudo.

| Voce | 169 collaudo (20) | 170 serie A (20) | 170 serie B (20) | **170 totale (40)** | sd (40) | bersaglio / tolleranza |
|---|---|---|---|---|---|---|
| Passaggi | 739,1 | 814,95 | 807,70 | **811,3** | 58,9 | ~814 ± 3 % → **dentro** (−0,3 %) |
| Passaggi riusciti % | 90,8 | 90,7 | 91,0 | 90,9 | — | — |
| Tiri | 22,5 | 19,45 | 17,90 | **18,7** | 3,1 | fermi rispetto alla 170 (nessuna modifica) |
| Tiri in porta | 8,0 | 6,20 | 7,30 | 6,75 | 2,3 | — |
| Gol | 2,4 | 2,10 | 2,35 | **2,23** | 1,2 | — |
| xG | 1,68 | 1,35 | 1,43 | **1,39** | 0,51 | — |
| Possesso squadra di casa % | 51,2 | 52,2 | 52,3 | 52,3 | 3,4 | — |
| Cross | 26,7 | 20,15 | 21,30 | **20,7** | 5,0 | (fascia giro 16: 20-30) |
| Dribbling tentati | 24,2 | 23,35 | 22,35 | 22,9 | 9,0 | — |
| Dribbling riusciti | — | 12,30 | 12,05 | 12,2 | 5,9 | — |
| Contrasti | 24,5 | 22,30 | 22,30 | 22,3 | 7,9 | — |
| Falli | 22,8 | 22,05 | 22,25 | 22,2 | 4,5 | — |
| Calci d'angolo | 5,6 | 4,30 | 5,10 | 4,7 | 2,5 | — |

Dati grezzi: `docs/sviluppo/dati-giro32/base-170-serieA.jsonl`, `base-170-serieB.jsonl` (una riga per partita, tabellino per
squadra). Sulle 10 gare comuni con la 169, le due finite 0-0 (k4, k7) danno esattamente gli stessi numeri sulle due versioni
(798 e 728 passaggi, 23 e 22 tiri): la 169 e la 170 si separano solo dopo il primo gol.

## 3. Perché la partita vissuta passa meno della simulazione rapida (diagnosi, vale anche per la 170)

Misurato al banco (motore da `src/14`, 300-2000 partite, stessi semi di `statistiche-228`):

| modo | passaggi | tiri | battiti fermi in scena |
|---|---|---|---|
| simulazione rapida | 800-803 | 23,2-23,3 | 0 |
| partita vissuta (`brainLive`, scene rilasciate dal motore) | 747-751 | 21,4-21,7 | 153 su 2.068 (7,4 %) |

Nella partita vissuta il motore si ferma sulle scene dell'eroe e passaggi e tiri scendono insieme. Dal vivo (3 partite di
diagnosi, `dati-giro32/diagnosi-170.jsonl`; le prime due giocate in parallelo alla serie A, quindi con cadenza disturbata):
battiti 2.067-2.177, fermi in scena 84-203, passaggi 691-889. Il debito delle scene si salda (partita 3: aperto 286 = pagato 286
≥ 203 fermi): il tempo che manca è quello degli highlight, in cui gioca l'eroe, ed è giusto che il motore lì non giri.

Cosa ho provato al banco (modo vissuto, 800-2000 partite per variante) per alzare i passaggi:

- velocità del pallone ×1,3/×1,5/×2: **nessun effetto** (il passaggio arriva già in un battito, regola 7.928);
- sosta al primo tocco, raggio della palla vagante, attesa del battitore, perdita di palla, intercetti, gestione: ±1 % —
  i passaggi sono legati ai battiti di volo;
- giro palla (`fw`, `adv`, `advC`): i passaggi salgono ma a tempo dato tolgono tempo all'attacco, ~40 passaggi per tiro perso
  (`advC` 71: passaggi +6 %, tiri −8 %, xG −7 %, scartato);
- **`adv` (appoggio al posto della conduzione) + `pAtt` (propensione al tiro dell'ultimo terzo)**, solo nel modo vissuto: il
  profilo pulito. Tarata a +2,5 % è la patch pronta (§5).

## 4. Da dove viene lo spostamento 169 → 170 (tiri, xG, cross)

- **Motore del possesso:** escluso. `src/14` della 169 (collaudo) e della 170 danno al banco gli stessi numeri al bit, in
  simulazione rapida e in modo vissuto (600 partite).
- **Schede del giro 28 (PO-259):** escluse. 10 partite della serie A con `__CPM_NO_SCHEDE259`: passaggi 780,1 · tiri 18,4 ·
  xG 1,38 · cross 21,0, contro 785,4 · 19,1 · 1,24 · 19,7 della 170 sulle stesse 10 gare e 723,7 · 21,8 · 1,53 · 25,1 della 169.
- **Ripresa dal centro dopo il gol del giro 27 (PO-207, `__CPM_NO_SCHIERA27`):** **è la causa.** 10 partite della serie A con
  `__CPM_NO_SCHIERA27`: passaggi **737,1** · tiri **22,2** · xG **1,53** · cross **24,6** · dribbling 28,3 · contrasti 28,1, cioè
  il profilo della 169 sulle stesse 10 gare (723,7 · 21,8 · 1,53 · 25,1 · 28,6 · 29,3), e **4 tabellini su 10 identici al numero**
  a quelli del collaudo 169 (k1, k2, k4, k7: k4 e k7 sono 0-0 e coincidono comunque; k1 1-0 e k2 4-2 hanno gol e coincidono solo spegnendo la regola; gli altri divergono per la non riproducibilità al battito già nota,
  `tabellino-228`). La regola del giro 27 (schierare i ventidue e tenere la palla 11 passi alla ripresa dal centro) era dichiarata
  per il gol su rigore/punizione dell'eroe, ma in `src/15-live-match.jsx` (r. ~5554, `riprendi({centro,lato,schiera:true})`)
  scatta a **ogni** aumento del punteggio fuori scena. Effetto misurato: passaggi +6 %, tiri −14 %, xG −19 %, cross −22 % sulle
  stesse gare. Non l'ho toccata (fuori ambito, ed è una regola chiesta dal PO): se il PO la restringe ai gol da piazzato, i
  passaggi tornano verso 739 e la patch del §5 (o la variante da +9 %) diventa la ritaratura giusta.
  Dati: `dati-giro32/screening-170-no-schiera27.jsonl`, `screening-170-no-schede259.jsonl`.
- Gli altri rami della 170 (decisioni-245, procuratore-253, crediti-254, badge-toast-255, backup-167, grafica-217-066) non
  toccano `src/14`/`src/15` nel percorso della partita: non verificati uno per uno.

## 5. La correzione pronta e non adottata

`docs/sviluppo/dati-giro32/ritaratura-pronta-non-adottata.patch` (si applica con `git apply` sulla 7.999.170; aggiungere a
`tests/visual/package.json` lo script `"passaggi-228": "node passaggi-228.mjs"`):

- `src/14-motore-possesso.jsx`: solo quando `cfg.brainLive` (la partita vissuta), `adv` 70 → 73 e `pAtt` ×1,12; rosso
  `__CPM_NO_PASSVIVO228` = motore 7.999.170. La simulazione rapida resta identica al bit.
- `tests/visual/passaggi-228.mjs`: guardiano al banco, due bracci sugli stessi semi (verde contro `__CPM_NO_PASSVIVO228`),
  verde se passaggi +1…+5 %, tiri e xG ±3 %, gol ±4 % + 2,5 errori standard, cross ±5 %, dribbling ±6 %, occasioni dell'eroe
  ±5 %, possesso ±1,5 punti, rapida identica. Aggiunto nella patch alla MAPPA di `ci-runner.mjs` (src/14-) e alla catena
  completa.
- Misurato (N=1500 per braccio): passaggi 751,2 → 769,6 (**+2,5 %**) · tiri −0,8 % · xG −0,1 % · gol −3,5 % (tolleranza
  ±10,1 %) · cross +2,0 % · dribbling −3,6 % · occasioni dell'eroe −1,8 % · possesso +0,02 · rapida identica → **VERDE**.
  Prova del rosso (`CPM_ROSSO=1`, N=600): passaggi +0,0 % → **ROSSO**.
- Taratura più ampia, se un giorno servisse +9 %: `advC` 72 · `adv` 80 · `pAtt` 0,08 (N=2000: passaggi +9,0 %, tiri +0,3 %,
  xG +1,2 %, gol −3,8 %, cross +0,1 %, dribbling −1,6 %). Oltre `adv` 80 satura (~805) e l'xG cala.
- **Non adottata** perché la 170 misura già 811,3 ± 9,3: con +2,5 % si andrebbe a ~832.

## 6. Guardiani fatti girare

Sul codice della 7.999.170 (nessuna modifica a `src/`; `node tools/check-src.mjs`: HTML identico byte per byte ai frammenti e
a HEAD). Uno alla volta, a macchina libera.

| guardiano | esito | durata | nota |
|---|---|---|---|
| `seme-a` | ✅ verde | 598 s | 3 giri, seme 2311: ingressi del motore, sorteggi per minuto e punteggio identici |
| `replay` | ✅ verde | 43 s | 8 highlight, replay completi e coerenti |
| `partita-vera` | ✅ verde | 503 s | bande d'accettazione tengono |
| `goleade` | ✅ verde | 27 s | 95 contro 50: 7+ gol 0,0 %, scarto 5+ 2,0 %, 2,37 gol di media |
| `tabellino-228` | ✅ verde | 296 s | k4 verde coincide, il rosso mostra lo scarto |
| `statistiche-228` | ✅ verde | 133 s | 4000 partite per braccio: tiri +2,5 %, gol +0,8 %, xG +1,4 % |
| `passaggi-228` (della patch, in copia temporanea) | ✅ verde N=1500 e N=400 · ❌ rosso con `CPM_ROSSO=1` (exit 1) | 19-100 s | vedi §5 |

Il determinismo non cambia: nessun codice di gioco modificato. Non ho fatto girare la catena completa (gate 14/14, catena
`ci`): il ramo non tocca `src/` né l'HTML, quindi non c'è un build nuovo da validare.

Tempo speso in misure dal vivo: 40 partite di baseline + 20 di screening + 3 di diagnosi, ~4,7 ore a una partita alla volta.

## 7. Cosa resta al PO

1. Confermare che 811 (tolleranza 790-838) chiude PO-228 per i passaggi.
2. Decidere sullo spostamento 169 → 170 di tiri (22,5 → 18,7), xG (1,68 → 1,39) e cross (26,7 → 20,7), arrivato con la 170
   dalla ripresa dal centro del giro 27 (PO-207) applicata a ogni gol. Due strade: (a) tenerla com'è, e allora passaggi ~811 e
   tiri ~19 sono il nuovo profilo; (b) restringerla ai gol da piazzato/scena come dichiarato nel giro 27, e poi applicare la
   ritaratura dei passaggi (patch §5, da tarare di nuovo sulla misura dopo la restrizione).
