# Korward Elite — Macro piano delle attività (dal 14/09/2026)

> Redatto dal PO-delegato la sera del 14/09 su richiesta del PO. Numeri, non impressioni: ogni riga ha un metro
> misurabile, un rosso appaiato e uno stato dichiarato. Il piano si aggiorna a verbale (`docs/FASE3-SCAMBIO.md`)
> a ogni spedizione o revoca.

## Avanzamento (una riga per spedizione, la più recente in alto)

- **15/09 14:30** — **7.903.0 + C3 in produzione** (main ed0ecd2, ff da 6324c4b; career-critical 14:03 e ci 14:27 verdi sul build esatto, dopo il riavvio del container delle 13:50). C3 HUD della partita dalle tavole del PO (rosso `__CPM_NO901`): barra 98 → 60 px, righe delle scelte 40 → 52 px senza percentuali, con 7 opzioni 53 → 44 % con lista che scorre, esito con un solo «Continua»; testo sopra il campo 12-17 %. 7.903 l'arbitro esiste (decisione PO, rosso `__CPM_NO903`): falli 0,18/0,05 → 0,22/0,08; banco 48 partite interruzioni 6,8 → 7,8, tiri 5,2 → 4,9 (costo dichiarato); banda ci «arbitro-esiste» da 4-6 (moneta: 7.900 11/4/3, C3 6/4/4) a 7. Scheda n° 20 in corsa. Non verificato sull’Android del PO.
- **15/09 08:40** — **7.900.0 in produzione** (main 5553514, ff da 018e96b; career-critical e ci verdi sul build esatto 65cc427). A4 v1: il fallo pesa meno (0,26/0,14 → 0,18 sotto pressione / 0,05), al limite e in area si sorteggia DOPO il tiro, la conduzione con la strada libera punta la porta. Banco 48 partite: tiri 4,1 → 5,2 (dall’area 1,3 → 1,8), catene ≥ 3 passaggi → tiro 0,6 → 1,0, interruzioni 8,6 → 6,8. v2-v5 scartate al banco (tetto ~5 tiri: 7-8 attacchi nel terzo finale a partita, un tocco al minuto); per 8 tiri serve una decisione del PO sul tempo del mondo. Scheda n° 19 (09:44, GLB accesi): media 7,25 = n° 18; ai piedi 64/59/62/61 %, coppia rosso/verde Vairo 70/64 e Moretti 58/62 (nessuna regressione al telefono). Lezione: un secondo Chromium in parallelo dimezza «ai piedi» (64 → 29 %), da oggi una sola sonda nel browser alla volta. Non verificato sull’Android del PO.
- **15/09 07:25** — **7.899.0 in produzione** (main 018e96b, ff da 96f9903; career-critical e ci verdi sul build esatto). Dalle due foto del PO: pallone «troppo grande» → il pavimento (7.862, 11 px fissi) guarda l’uomo alla stessa profondità (un quarto, 8-11 px): rapporto pallone/uomo 0,52 → 0,35; panchina «invasiva» → riprodotta a 412×700 da sostituito (sovrapposizione al racconto 100 % → 0 %), riquadro 30 px → riga 16 px, il sottopancia sale col tasto «Salta». Scheda n° 18 in corsa. Non verificato sull’Android del PO.
- **15/09 05:40** — **7.898.0 in produzione** (main 96f9903, ff da 0a1746c; career-critical e ci verdi sul build esatto). A2 v3: il minuto del motore ha tre fasi (dt=1/3: una decide, due muovono la fisica); il pallone reso segue portatore o logico, l’eroe non ruba il pallone altrui. Banco: padrone dichiarato 58,6 → 66,2 %, salti > 5u per chiamata 342 → 0. Telefono Moretti rosso → verde: ai piedi 53 → 58 %, distanza dal padrone 2,8 → 2,4u, scarto 1,2 → 1,0u, salti 66 → 55; diagnosi padrone «altro» 3,6 → 1,7u. Costo dichiarato: code p90 più lunghe, padrone-eroe 2,5 → 5,2u, niente parabola dell’arco di cronaca in gioco ambientale. Scheda n° 17 (GLB accesi) in corsa.
**Regola (direttiva PO 15/09):** ogni rilascio in produzione porta la scheda da telefono successiva (4 partite, scala 9) e aggiorna la sezione «Voti del player da cellulare» qui sotto: voti delle 12 aree, differenza dalla scheda precedente, istogramma. **I voti si danno sempre con i GLB accesi** (direttiva PO 15/09: la sonda `collaudo-telefono` forza `__CPM_GLB=true`; una scheda a GLB spenti non vale come voto). Registro: `docs/voti/voti-telefono.json`, generatore `node tools/voti-piano.mjs`.

| quando (UTC) | cosa | cantiere → stato | numeri |
|---|---|---|---|
| 15/09 03:30 | **main = 0a1746c**: 7.897 in produzione (rituali verdi su c1d8303, build identico) | A3 → passo 1 fatto | telefono Moretti, coppia rosso/verde: ai piedi del padrone 50 → 53 %, scarto reso↔logico 2,7 → 1,7u, salti 74 → 64; padrone-eroe 3,9 → 2,5u |
| 15/09 00:40 | **main = 9188df9**: 7.895 v2 in produzione (rituali verdi su 3beb674: guardiano tabellone, career-critical, ci; build identico) | C7 → fatto | primo cielo sopra il bordo alto del tabellone: rosso 1 px in 9/9 impianti → 12-28 px (0,9-1,9u); provino piccolo 22 px, tabellone 151 → 68 px di larghezza (costo dichiarato) |
| 14/09 22:05 | **main = f6a65d6**: 7.894 in produzione (rituali verdi su 6519780, build identico; f6a65d6 solo docs) | A1 → fatto | banco: azioni ≥ 3 passaggi 0,25 → 0,88/partita; tiri 2,88 → 3,13; passaggi 21 → 24,5 (rosso `__CPM_NO894`) |
| 14/09 20:10 | **main = 5504b6e**: 7.892 + 7.893 in produzione (rituali verdi su 7940f26, build identico) | C1 → fatto | riga di telecronaca sopra la metà del campo 67,4 % → 0 %; blocco scelte 36,7 % → 21,5 %; barra specchiata dal 46' (casa x 13 → 297); frecce via |
| 14/09 19:40 | main = e62db88: 7.891 v2 | B1 → fatto | piazzato di cartone 32,8u → 0; passo conduzione ≤ 8u |
| 14/09 18:20 | main = f8cb0b3: 7.889 + 7.890 + overhaul grafico G0-G4.1 | A/B1/C1 → fatto | corpi in campo 0,3 → 45; regie di gioco vivo 5 → 0; contrasto 917 → 62 |

<!-- VOTI-INIZIO -->
## Voti del player da cellulare (scheda n° 19, build 7.900.0, 15/09 09:44)

Soglia di collaudo: **media ≥ 9, nessuna area < 7** (direttiva PO 14/09: il PO collauda solo con media >= 9 su 12 aree e nessuna area < 7). Media **7,25** (n° 18, 7.899.0: 7,25 → **±0**); area minima **7**. Fonte: tests/visual/collaudo-telefono (4 partite: Vairo casa / Galli fuori / Moretti casa / Conti fuori, GLB accesi, senza foto; Vairo e Galli ricorse a macchina scarica dopo la lezione del secondo Chromium) + coppia rosso/verde __CPM_NO900 su Vairo e Moretti — verbale FASE3-SCAMBIO 15/09 09:44.

| # | area | n° 18 | **n° 19** | Δ | istogramma (voto) | crescita / decrescita |
|---|---|---|---|---|---|---|
| 1 | Realismo | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 2 | Credibilita' da attaccante | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 3 | Causalita' | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 4 | Varieta' | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 5 | Ritmo | 8 | **8** | ±0 | `████████░░` 8 | · |
| 6 | Azioni extra-eroe | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 7 | Highlight dell'eroe | 8 | **8** | ±0 | `████████░░` 8 | · |
| 8 | Telecronaca | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 9 | Interazioni | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 10 | Coerenza fra i sistemi | 8 | **8** | ±0 | `████████░░` 8 | · |
| 11 | Immersione | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 12 | Carriera | 7 | **7** | ±0 | `███████░░░` 7 | · |

Storico delle medie: n° 12 (7.880.0) **6,92** · n° 13 (7.881.0) **7,08** · n° 14 (7.884.0) **7,25** · n° 15 (7.886.0) **7,17** · n° 16 (7.895.0) **7,08** · n° 17 (7.898.0) **7,08** · n° 18 (7.899.0) **7,25** · n° 19 (7.900.0) **7,25**.

<!-- VOTI-FINE -->

## 0. Dove siamo (misurato, 14/09 sera)

| cosa | numero | fonte |
|---|---|---|
| produzione (`main`) | **ed0ecd2 = 7.903.0 + C3** (7.889 → 7.903 in produzione; 7.896 revocata) | verbale 14:30 |
| gioco vivo con un padrone dichiarato (telefono, 4 partite) | **37 %** | sonda telefono 14/09 |
| tiri del motore a partita (4 partite) | **1,75** (0/2/2/3), 1 dall'area | area 2, misura B |
| azioni ≥ 3 passaggi poi tiro (banco) | 0,25 (7.893) → **0,88**/partita (7.894, in produzione) | banco `stati-motore` |
| eventi del motore a partita | **92** (un tick per minuto) | banco |
| teletrasporti dei ventidue all'apertura delle scene | 50 → **0** (7.890); piazzato 32,8u → **0** (7.891) | `salti-scena`, `chi-588` |
| telecronaca sopra la metà del campo | 67 % → **0 %** (7.892) | `copertura` |
| metro grafico (5 larghezze) | contrasto 917 → 62 (chiaro) / 1000 → 61 (scuro), testo < 10 px 463 → 29, overflow 0 | griglia G0→G6 |
| fps banco con i 22 GLB in campo | 11 → **2** (Chromium); Android del PO: gioca, fps non misurati | c889 |
| scheda da telefono (ultima) | media **7,08** (scheda n° 16, 7.895, 15/09, GLB accesi; n° 15: 7,17); area minima 6 (Realismo, Immersione); soglia di collaudo **≥ 9** (PO 14/09) | sezione voti, #81 |

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
| A2 | 7.898 cadenza: il minuto del motore ha tre fasi (dt=1/3: una decide, due muovono la fisica); il pallone reso segue portatore o logico senza arco di cronaca | banco: padrone dichiarato 58,6 → 66,2 %, salti > 5u per chiamata 342 → 0 · telefono rosso → verde: ai piedi 53 → 55 %, padrone dichiarato 39 → 48 %, salti 66 → 46; scarto reso↔logico 1,2 → 2,4u (costo dichiarato); v1/v2 (7.896) e v3/v3b scartate a verbale | **fatto** — in produzione (main 96f9903, 05:40), v3d: telefono ai piedi 53 → 58 %, diagnosi padrone «altro» 3,6 → 1,7u |
| A3 | il padrone del pallone nel live — 7.897 (l'eroe è un portatore per la colla) in produzione; diagnosi: 30 % del vivo in volo per costruzione (un passaggio = un tick), colla sul compagno 40 %, ritardo dei corpi resi 3,6u | padrone dichiarato 44 % → ≥ 70 % (serve A2 v3) · ai piedi 53 % → ≥ 75 % · metro da rivedere sul corpo RESO | passo 1 fatto; A2 v3 sul branch (padrone dichiarato 44 → 48 % al telefono); prossimo: arco reso sui punti del motore (dur, poss.a) e metro sul corpo RESO |
| A4 | 7.900 la squadra tira: fallo 0,26/0,14 → 0,18/0,05, al limite e in area il fallo si sorteggia dopo il tiro, conduzione con strada libera verso la porta (rosso `__CPM_NO900`) | banco 48 partite: tiri 4,1 → 5,2 (area 1,3 → 1,8), catene 0,6 → 1,0, interruzioni 8,6 → 6,8; obiettivo 8 (≥ 3 dall'area) NON raggiunto; v2-v5 scartate (5,1 · 5,2 · 4,2 · 5,2) | **fatto alla v1** — in produzione (main 5553514, 08:40); il resto chiede una decisione del PO sul tempo del mondo (attacco in 3 minuti invece di 5-6) |
| A5 | cross e ricezioni (#38): il cross atterra su qualcuno | cross ricevuti ≥ 60 %, mediana ≤ 2u | aperto |
| A6 | portiere e gesti (codici 000/111, #46, #49) | doppio gesto 0; portiere in tempo ≥ 90 % delle parate | aperto |
| A7 | azioni: strumento nel live (sonda `azioni`) e soglia | azioni (≥ 3 passaggi → area) ≥ 6/partita | strumento da scrivere |
| A8 | l'arbitro esiste: 7.903 alza i falli (0,22/0,08) per tenere la banda del ci; passo vero: falli 2 → 8-12 a partita, rimesse laterali, corner (oggi 0 nel motore) | banda ci arbitro-esiste 20-30 (7.72x) → 4-6 (7.900) → 7 (7.903); interruzioni al banco 6,8 → 7,8 | **7.903 in produzione**; passo vero da progettare dopo C4 e D7 |

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
| C2 | **G4 anteprima di design del HUD**: barra broadcast 60 px, filo del possesso, banda bassa unica (telecronaca + mister), interazione come scheda dal basso, esito nella banda con un solo tasto; due schizzi alternativi | sì del PO sul disegno (4 domande nel canvas) | **fatto** — sì del PO (08:15): barra 60 px · scheda dal basso 44 % · niente percentuali · esito con un solo Continua |
| C3 | 7.901 il HUD della partita dalle tavole del PO: barra 60 px una riga, scheda delle scelte dal basso ≤ 44 % senza percentuali, esito a banda con un solo «Continua» (rosso `__CPM_NO901`) | 412×915 e 700: barra 98 → 60 px; righe delle scelte 40 → 52 px; con 7 opzioni 53 % (sfonda) → 44 % con lista che scorre; esito 0 → 1 tasto; testo sopra il campo 12-17 % (≤ 25 %) | **in produzione** (main ed0ecd2, 14:30) — fusa con la 7.903; non verificato sull'Android del PO |
| C4 | post-partita, tema scuro fotografato, altre schermate (gerarchia, una cosa alla volta) | griglia: nessuna regressione; pieni ≤ 1 per vista | da fare |
| C5 | performance mobile: 22 GLB per 90' (LOD/instancing, texture) — misura sull'Android del PO | fps ≥ 30 sul telefono del PO (da lui misurato); banco: triangoli in quadro −50 % | da misurare prima |
| C6 | report finale in 16 sezioni della direttiva | consegnato | da scrivere |
| C7 | **tabelloni luminosi: altezza misurata stadio per stadio** (nota PO 14/09) — 7.895 v2: dentro la sagoma della Curva Sud | primo cielo sopra il bordo alto: rosso 1 px in 9/9 impianti → verde 12-28 px (0,9-1,9u); provino piccolo 22 px | **fatto** — in produzione (main 9188df9, 00:40); giudizio del PO sul telefono sulla taglia nel provino |
| C8 | **panchinari, mister e vice con il corpo CH38 alleggerito** (PO 15/09: «renderei GLB anche i panchinari ed il mister», «non devono volare») — v1 a corpo pieno misurata: 16/16 corpi ma triangoli 1,09 → 1,84 M (+68,6 %), figure a T sospese; persa nel riavvio; v2 in corso sul corpo a 14.622 triangoli (rosso `__CPM_NO904`) | corpi CH38 in panchina 0/16 → 16/16 · piedi entro 0,15u dalla seduta 16/16 · triangoli ≤ +25 % · fps banco rosso/verde · foto ravvicinate | **in corso** (squadra grafica, ramo claude/panchina-glb) |

### D · COLLAUDO, STRUMENTI, SKILL
| # | attività | metro | stato |
|---|---|---|---|
| D1 | scheda da telefono con scala 9, 4 partite, ogni settimana | media, area minima | ricorrente |
| D2 | sonda `azioni` + `padrone` nel live (per A3/A7) | esiste, ripetibile (due corse identiche) | da scrivere |
| D3 | smoke dei flussi mancanti nel `ci`: import, creazione carriera, navigazione tab, responsive (griglia) | 4 smoke verdi; `ci` +≤ 6 min | da fare |
| D4 | subagent `regressione-pre-release` in `.claude/agents/` (isolato, torna pass/fail) | usato a ogni release | da fare |
| D5 | skill custom: `build-frammenti`, `misura-appaiata`, `rituale-produzione` (subito), poi `motore-possesso`, `sonda-telefono`, `griglia-mobile`, `verbale` | esistono e sono vere | da fare |
| D6 | `CLAUDE.md` e `ARCHITECTURE_MAP.md` allineati a `src/`, motore, rituale, rami | 5 patch proposte | da confermare |
| D7 | **librerie migliori, carta bianca (PO 15/09)** — passo 1 misurato: corpi GLB semplificati offline con gltf-transform (48.140 → 22.768 triangoli) | banco fps con 22 corpi: mediana 4,7/3,9 → 4,3/4,6 (rumore), p10 2,3 → 4,0; sul GL software i triangoli non sono il collo di bottiglia | **v2 decisa con il PO (14:20)**: corpi alleggeriti per i 22 (candidati 14.622 e 24.066 triangoli), contatore fps a schermo e interruttore TEMPORANEO «Corpi: leggeri / pieni» nel menu di pausa: due numeri dal telefono del PO, poi l'interruttore si toglie; dopo C8 · passo 1 non spedito (serve la misura sul telefono del PO) |

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
