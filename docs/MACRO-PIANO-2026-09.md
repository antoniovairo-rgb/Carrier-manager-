# Korward Elite — Macro piano delle attività (dal 14/09/2026)

> Redatto dal PO-delegato la sera del 14/09 su richiesta del PO. Numeri, non impressioni: ogni riga ha un metro
> misurabile, un rosso appaiato e uno stato dichiarato. Il piano si aggiorna a verbale (`docs/FASE3-SCAMBIO.md`)
> a ogni spedizione o revoca.

## Avanzamento (una riga per spedizione, la più recente in alto)

| quando (UTC) | cosa | cantiere → stato | numeri |
|---|---|---|---|
| 14/09 22:05 | **main = f6a65d6**: 7.894 in produzione (rituali verdi su 6519780, build identico; f6a65d6 solo docs) | A1 → fatto | banco: azioni ≥ 3 passaggi 0,25 → 0,88/partita; tiri 2,88 → 3,13; passaggi 21 → 24,5 (rosso `__CPM_NO894`) |
| 14/09 20:10 | **main = 5504b6e**: 7.892 + 7.893 in produzione (rituali verdi su 7940f26, build identico) | C1 → fatto | riga di telecronaca sopra la metà del campo 67,4 % → 0 %; blocco scelte 36,7 % → 21,5 %; barra specchiata dal 46' (casa x 13 → 297); frecce via |
| 14/09 19:40 | main = e62db88: 7.891 v2 | B1 → fatto | piazzato di cartone 32,8u → 0; passo conduzione ≤ 8u |
| 14/09 18:20 | main = f8cb0b3: 7.889 + 7.890 + overhaul grafico G0-G4.1 | A/B1/C1 → fatto | corpi in campo 0,3 → 45; regie di gioco vivo 5 → 0; contrasto 917 → 62 |

## 0. Dove siamo (misurato, 14/09 sera)

| cosa | numero | fonte |
|---|---|---|
| produzione (`main`) | **f6a65d6 = 7.894.0** (7.889 → 7.894 tutte in produzione) | verbale 22:05 |
| gioco vivo con un padrone dichiarato (telefono, 4 partite) | **37 %** | sonda telefono 14/09 |
| tiri del motore a partita (4 partite) | **1,75** (0/2/2/3), 1 dall'area | area 2, misura B |
| azioni ≥ 3 passaggi poi tiro (banco) | 0,25 (7.893) → **0,88**/partita (7.894, in produzione) | banco `stati-motore` |
| eventi del motore a partita | **92** (un tick per minuto) | banco |
| teletrasporti dei ventidue all'apertura delle scene | 50 → **0** (7.890); piazzato 32,8u → **0** (7.891) | `salti-scena`, `chi-588` |
| telecronaca sopra la metà del campo | 67 % → **0 %** (7.892) | `copertura` |
| metro grafico (5 larghezze) | contrasto 917 → 62 (chiaro) / 1000 → 61 (scuro), testo < 10 px 463 → 29, overflow 0 | griglia G0→G6 |
| fps banco con i 22 GLB in campo | 11 → **2** (Chromium); Android del PO: gioca, fps non misurati | c889 |
| scheda da telefono (ultima) | media **5,3** (n°1, 11/09); soglia di collaudo **≥ 9** (PO 14/09) | #73, #56 |

## 1. Obiettivo e metro finale

- **Metro di uscita**: scheda da telefono su 4 partite (Vairo casa, Galli fuori, Moretti casa, Conti fuori) con
  **media ≥ 9 su 12 aree, nessuna area < 7**, zero bugie P0/P1; il PO collauda solo oltre questa soglia.
- **Regole invariabili**: misura → rimedio → ri-misura con rosso appaiato; una misura alla volta; revoca a verbale
  se non batte la misura; nessuna regressione su un metro spedito; dichiarare sempre ciò che non è verificato
  (Chromium 412×915 ≠ Android del PO); `main` solo fast-forward con career-critical + ci verdi; mai il game
  engine dalla squadra grafica.

## 2. I cantieri

### A · MOTORE — «è calcio» (source of truth)
| # | attività | metro (rosso → verde atteso) | stato |
|---|---|---|---|
| A1 | 7.894 primo tocco non sempre sosta | banco: azioni 0,25 → 0,88, tiri 2,88 → 3,13, passaggi 21 → 24,5 | **fatto** — in produzione (main f6a65d6, 22:05) |
| A2 | **7.895 cadenza: 3 tick del motore per minuto** + narratore che sceglie l'evento saliente del minuto | banco a 3 tick: tiri 9,4, catene ≥ 3 passaggi 7,8/partita, possesso 51 %; nel live: righe di cronaca ≤ 1/minuto, fps invariati | proposta (esperimento fatto) |
| A3 | il padrone del pallone nel live: ponte motore → `carrierRef` (oggi esclude l'eroe), volo/libero resi | gioco vivo con padrone 37 % → ≥ 70 %; pallone reso ai piedi ≥ 75 % | da fare |
| A4 | la squadra sale e tira dall'area (#44): posizioni d'attacco, pTiro, strada libera | tiri ≥ 8/partita, ≥ 3 dall'area; avanzato più alto ≥ 70 | da fare |
| A5 | cross e ricezioni (#38): il cross atterra su qualcuno | cross ricevuti ≥ 60 %, mediana ≤ 2u | aperto |
| A6 | portiere e gesti (codici 000/111, #46, #49) | doppio gesto 0; portiere in tempo ≥ 90 % delle parate | aperto |
| A7 | azioni: strumento nel live (sonda `azioni`) e soglia | azioni (≥ 3 passaggi → area) ≥ 6/partita | strumento da scrivere |

### B · HIGHLIGHT — «la scena è un istante del motore»
| # | attività | metro | stato |
|---|---|---|---|
| B1 | scena senza teletrasporto (7.890, 7.891) | apertura 50 → 0; piazzato 32,8u → 0 | **fatto** |
| B2 | l'esito torna nel motore: chiusura continua (`riprendi` completo) | salti alla chiusura 0; pallone continuo | da fare |
| B3 | `tickScena`: il motore muove i ventidue anche in scena (via il loop del pressing 2025) | scritture non-motore in scena 8-12 → 0; corpi in movimento in scena ≥ 60 % | da progettare |
| B4 | attori della scena dai ruoli del motore (portatore, difensore, portiere) | distanza attore-ruolo mediana ≤ 3u | da fare |
| B5 | muro/rigore/corner fotografati e valutati | scheda: area «scene» ≥ 8 | da fare |

### C · GRAFICA & UX — «wow, professionale»
| # | attività | metro | stato |
|---|---|---|---|
| C1 | fondamenta (G0-G3) e correzioni in partita (7.892/7.893) | vedi §0 | **in produzione** |
| C2 | **G4 anteprima di design del HUD di partita** (barra broadcast, banda bassa unica, interazione come scheda dal basso, transizioni) → sì del PO sul disegno | approvazione del PO | domani mattina |
| C3 | G4 implementazione: HUD, telecronaca, interazioni, scena SETUP→AZIONE→CONCLUSIONE→CONSEGUENZA | copertura del campo ≤ 25 %, griglia partita: <10 px 0, contrasto 0; scheda area «HUD» ≥ 8 | dopo C2 |
| C4 | post-partita, tema scuro fotografato, altre schermate (gerarchia, una cosa alla volta) | griglia: nessuna regressione; pieni ≤ 1 per vista | da fare |
| C5 | performance mobile: 22 GLB per 90' (LOD/instancing, texture) — misura sull'Android del PO | fps ≥ 30 sul telefono del PO (da lui misurato); banco: triangoli in quadro −50 % | da misurare prima |
| C6 | report finale in 16 sezioni della direttiva | consegnato | da scrivere |
| C7 | **tabelloni luminosi degli stadi: altezza misurata stadio per stadio** (nota PO 14/09: nello stadio del provino il tabellone vola nel cielo) | per ogni stadio: base del tabellone entro 2u sopra la gradinata di fondo, foto per stadio, provino incluso | da misurare (sonda per stadio) |

### D · COLLAUDO, STRUMENTI, SKILL
| # | attività | metro | stato |
|---|---|---|---|
| D1 | scheda da telefono con scala 9, 4 partite, ogni settimana | media, area minima | ricorrente |
| D2 | sonda `azioni` + `padrone` nel live (per A3/A7) | esiste, ripetibile (due corse identiche) | da scrivere |
| D3 | smoke dei flussi mancanti nel `ci`: import, creazione carriera, navigazione tab, responsive (griglia) | 4 smoke verdi; `ci` +≤ 6 min | da fare |
| D4 | subagent `regressione-pre-release` in `.claude/agents/` (isolato, torna pass/fail) | usato a ogni release | da fare |
| D5 | skill custom: `build-frammenti`, `misura-appaiata`, `rituale-produzione` (subito), poi `motore-possesso`, `sonda-telefono`, `griglia-mobile`, `verbale` | esistono e sono vere | da fare |
| D6 | `CLAUDE.md` e `ARCHITECTURE_MAP.md` allineati a `src/`, motore, rituale, rami | 5 patch proposte | da confermare |

### E · PRODUZIONE E RILASCIO
| # | attività | metro | stato |
|---|---|---|---|
| E1 | `main` in fast-forward ogni notte con rituali verdi (routine 01:00 UTC) | mai force; verbale per ogni allineamento | attivo |
| E2 | pipeline Android (dist → validate → audit copyright → AAB) verificata su una release | AAB prodotto e installato dal PO | da verificare |

## 3. Sequenza (stime oneste, misurate a ogni passo)

| quando | motore (A) | highlight (B) | grafica (C) | strumenti (D/E) |
|---|---|---|---|---|
| **15/09** | A1 spedita; A2 progettata e prima misura nel live | — | C2 anteprima HUD → sì del PO | D5 (3 skill), D2 sonda azioni |
| **16-18/09** | A2 spedita; A3 padrone | B2 chiusura continua | C3 HUD + telecronaca | D1 scheda n°2 (scala 9) |
| **19-21/09** | A4 la squadra sale | B3 tickScena | C3 interazioni + scena | D3 smoke nel ci, D4 subagent |
| **22-25/09** | A5 cross, A7 azioni ≥ 6 | B4 attori dai ruoli | C4 post-partita, scuro | D6 documenti |
| **26-28/09** | A6 portiere/gesti | B5 scene fotografate | C5 performance (misura sul telefono del PO) | E2 pipeline Android |
| **29/09-02/10** | consolidamento: scheda 4 partite ≥ 9 o revoche e nuova sequenza | | C6 report 16 sezioni | |

Ordine dentro ogni giorno: prima il motore (senza calcio il resto è cornice), poi highlight, poi grafica; ogni
spedizione porta i suoi rituali; i cantieri B e C toccano lo stesso file (`15-live-match`) e si coordinano.

## 4. Rischi dichiarati
- **fps dei 22 GLB sull'Android del PO**: mai misurati; se non reggono, C5 sale di priorità (LOD) prima di A2.
- **A2 (3 tick/min)** cambia il ritmo del narratore e le sonde che assumono tick = minuto: costo di progetto, misura
  appaiata obbligatoria su 4 partite prima di spedire.
- **ci stocastico** (guardiani sensibili ai fps del banco): un rosso si ripete prima di essere creduto; contesa CPU
  fra catene evitata (una misura alla volta).
- **subagenti**: limite di spesa (429) già incontrato; la delega è per compiti misurabili, il resto in prima persona.
- **Chromium ≠ telefono**: ogni numero grafico e di resa è del banco finché il PO non fotografa.
