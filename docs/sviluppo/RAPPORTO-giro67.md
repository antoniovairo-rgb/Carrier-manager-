# Rapporto giro 67 — PO-098 stili · PO-190 quota gol dell'eroe · PO-156 difficoltà per fase (solo misura)

Ramo `sviluppo/archetipi-difficolta-giro67`, base `lavoro/172` (7.999.172, commit `46cdcdc`). GAME_VERSION e SAVE_VERSION
**invariati** (il numero lo dà il rilascio che unisce i giri). Decisioni di riferimento: DECISIONI 16/10 notte punto 5
(PO-156 «Bersagli del PO, poi taratura») e punto 6 (PO-098 «Misura, poi motore, dopo L1», stili Finalizzatore · Regista ·
Incursore · Trascinatore, Enfant tratto di crescita); DECISIONI 03/10 righe 48-58 (PO-190, quota eroe verso il 50%).

Come leggere: **Verificato** = numero dai dati grezzi o riga di sorgente; **Ipotesi** = interpretazione non provata;
**Non posso confermarlo / Non verificato** = il dato non c'è.

Dati grezzi e script in `docs/sviluppo/dati-giro67/`.

---

## 1. PO-098 — prima: cosa fanno oggi gli 8 archetipi (misura sulla 172)

Script `dati-giro67/arch8-misura.mjs` (legge i frammenti della 172), risultato `arch8.json`. Statistiche uguali (75 ovunque)
più il bonus di creazione dell'archetipo; motore vero in node per `probEroe`; formula vera di `_pSimStats` a OVR 80, gara vinta.

| Archetipo | Somma bonus creazione | `succRate` bonus max | probEroe tiro | probEroe assist | Sim: gol attesi (vinta) | Sim: assist attesi | Crescita |
|---|---|---|---|---|---|---|---|
| (neutro 75) | — | — | 0,149 | 0,125 | 0,618 | 0,416 | ×1 |
| bomber | +14 | 6 pp | 0,160 | 0,119 | **0,735** | 0,416 | ×1 |
| centravanti | +15 | 5 pp | 0,156 | 0,129 | **0,735** | 0,416 | ×1 |
| fantasista | +13 | 6 pp | 0,146 | 0,133 | 0,618 | **0,508** | ×1 |
| trequartista | +14 | 7 pp | 0,145 | 0,139 | 0,618 | **0,508** | ×1 |
| velocista | +12 | 7 pp | 0,143 | 0,125 | 0,618 | 0,416 | ×1 |
| leader | +15 | 6 pp | 0,149 | 0,125 | 0,618 | 0,416 | ×1 |
| enfant | +16 | 3 pp | 0,153 | 0,125 | 0,618 | 0,416 | ×1,35 fino a 22 |
| tuttocampista | +16 | 2 pp | 0,152 | 0,129 | 0,618 | 0,416 | ×1 |

**Verificato (codice, 172):**
- Nel **motore della partita** l'archetipo **non entra**: l'eroe passato a `creaMotorePossesso` porta solo nome, posizione,
  `attivo`, `ovr`, `fiducia`, `forma` (`src/15-live-match.jsx:5664` sulla 172), e il motore dà all'eroe tutti gli attributi
  uguali all'OVR (`src/14-motore-possesso.jsx:260`, `attrsDi`). Dove riceve, quante scene ha, che cosa fa: identico per tutti gli 8.
- Nelle **scene dal vivo** il successo lo decide `probEroe` del motore (`src/15:1166` `_rateUI82`): il bonus d'archetipo di
  `succRate` (`src/06:44`) vale **solo** come ripiego senza motore. L'archetipo arriva quindi solo dalle statistiche di
  creazione: probEroe tiro 0,143–0,160 (±1 punto), assist 0,119–0,139 (±1 punto).
- Nelle **partite simulate** pesano solo due liste di `_pSimStats` (`src/10:937-938`): bomber/centravanti +19% gol attesi,
  trequartista/fantasista +22% assist; gli altri quattro identici.
- Altre tracce: obiettivi stagionali (`src/06:798-810`), pesca della statistica che cresce (`src/18:3800`, `:5106`), crescita
  Enfant ×1,35 sotto i 23 anni (`src/06:83`).

Conclusione della misura: degli 8, **nessuno** cambia il modo di giocare; 4 su 8 non hanno alcun effetto oltre ai punti di creazione.

## 2. PO-098 — la correzione: 4 stili che cambiano il gioco nel motore

**Cosa cambia** (tabella unica `ARCHETYPES` in `src/06-archetipi-agenti-sponsor.jsx`, campo `motore`):

| Stile | Bonus creazione | Leva «zona» (compagni lo cercano: area · limite · trequarti · metà) | Leva «scena» (peso opzioni: gol · assist · dribbling) | Leva «squadra» |
|---|---|---|---|---|
| Finalizzatore 🎯 | tiro +8, posiz. +6, fisico +3, vel. −2, pass. −3 | 1,7 · 1,3 · 0,8 · 0,5 | 1,35 · 0,75 · 0,9 | 0 |
| Regista 🎨 | pass. +9, tecnica +6, ment. +3, fisico −3, tiro −3 | 0,7 · 0,9 · 1,5 · 1,6 | 0,85 · 1,9 · 1,0 | 0 |
| Incursore ⚡ | vel. +9, dribbling +7, fisico +2, tiro −2, ment. −2 | 1,1 · 1,3 · 1,4 · 0,7 | 1,0 · 0,9 · 1,8 | 0 |
| Trascinatore 🦁 | ment. +9, fisico +5, posiz. +3, vel. −2, dribb. −1 | 1 ovunque | 1 ovunque | +5 forza squadra con lui in campo |

- **Zona** (`src/14`, `_bStile67`): premio additivo `10×(fattore−1)` al punteggio con cui un compagno sceglie l'eroe come
  ricevente (i due punti dove già pesava `BONUS_EROE`). Cambia **dove** l'eroe riceve, quindi quante e quali scene nascono
  (conclusione / spalle / fascia / fra le linee: la regola di `_tipoOcc` non è toccata).
- **Scena** (`src/04`, `_pesoStile67`): il peso di ogni opzione proposta nelle scene dal motore (conclusione, strati, seguiti)
  si moltiplica per la leva; nella sim rapida (`sceltaAutoV2`) la scelta automatica usa gli stessi pesi.
- **Squadra** (`src/14`): il Trascinatore alza di 5 la forza della squadra finché è in campo (segue `chiedi.eroe(on)`).
- Nessun sorteggio in più: le leve cambiano solo pesi e punteggi (il flusso dei sorteggi seminati resta quello).
- Partite simulate: il motore riceve lo stile (`stileEroe` in tutte le `simulateMatch(...,{motore:true})` di `src/09`,
  `src/18`); `_pSimStats` legge lo stile col suo archetipo di riferimento (Finalizzatore→bomber, Regista→trequartista,
  Incursore→velocista, Trascinatore→leader: `archLetturaDi`), così obiettivi e sim restano quelli già tarati.
- **Enfant = tratto di crescita**: casella in creazione (`data-cpm="tratto-enfant"`), costo −2 su ogni statistica di
  partenza, crescita ×1,35 fino a 22 anni (`haTrattoEnfant`, `archGrowthMult`); il Profilo lo mostra sotto lo stile.
- **Migrazione additiva** (`migratePlayer`, `src/17`): un vecchio archetipo diventa il suo stile, l'id di prima resta in
  `archetipoOrig`, l'Enfant diventa `tratti.enfant` e prende lo stile delle sue statistiche migliori. Nessun campo tolto,
  nessun bump di SAVE_VERSION; gli 8 restano in `ARCHETYPES_8` per le letture dei vecchi id (`archDi`).
- **Rosso `__CPM_NO_STILI`**: il motore ignora lo stile (zona, scena, squadra) e la migrazione non converte.

**Cosa resta fuori:** posizione/ruolo nel motore (l'eroe resta `rl:"AT"`), schermata di creazione oltre alla griglia dei 4 e
alla casella Enfant, testi narrativi che citano gli archetipi, `succRate` (ripiego senza motore: bonus copiati dai riferimenti).

### 2.1 Misura nel motore (node, `npm run stili-098`, 80 partite per stile, stessi semi, forza 74 contro 70, OVR eroe 82)

Dati `dati-giro67/stili-098-N80.json`.

| Stile | Tiri eroe | Gol eroe | Assist eroe | Passaggi eroe | Tocchi | Scelte (dribbling · tiro · passaggio) | GF squadra | GS squadra |
|---|---|---|---|---|---|---|---|---|
| neutro / rosso | 0,34 | 0,14 | 0,04 | 28,8 | 126,5 | 137 · 16 · 89 | 0,99 | 1,09 |
| Finalizzatore | **1,30** | **0,28** | 0,04 | 20,8 | 98,2 | 83 · **93** · 40 | 1,01 | 1,15 |
| Regista | 0,25 | 0,09 | **0,08** | **38,8** | **163,7** | 0 · 0 · **309** | 1,24 | 1,03 |
| Incursore | 0,35 | 0,14 | 0,01 | 28,1 | 133,4 | **251** · 9 · 0 | 0,99 | 1,14 |
| Trascinatore | 0,68 | 0,23 | 0,09 | 30,3 | 137,9 | 134 · 28 · 117 | **1,39** | **0,73** |

Rosso: con `__CPM_NO_STILI` i quattro stili giocano **la stessa partita** del neutro (firme identiche, verificato dal guardiano).

### 2.2 Misura dal vivo (salvataggio S12, 25+ partite, vedi §3)

Il salvataggio S12 è un **centravanti** → migra a **Finalizzatore**. Tiri dell'eroe a partita **3,56 → 4,64**, gol registrati
**0,56 → 0,80**, voto **6,81 → 7,24**. Braccio Regista (stesso salvataggio, `ARCH=regista`, **solo 9 partite**): tiri 4,00,
gol 0,67, assist 0,11 — **Non verificato**: su 9 partite la differenza Regista/Finalizzatore dal vivo non è distinguibile dal caso;
la separazione è misurata nel motore (§2.1), non ancora nella partita guardata.

### 2.3 Guardiani nuovi
- `npm run stili-098` (node, ~1 min a N=40): verde se le firme si separano nel verso dichiarato (Finalizzatore tira più di
  Regista e Incursore, Regista passa più di tutti e fa assist almeno quanto Finalizzatore e Incursore, Incursore sceglie il
  dribbling più di tutti, Trascinatore porta la differenza reti più in alto di tutti e del neutro); rosso: i 4 stili uguali al neutro.
- `npm run stili-098-migrazione` (pagina vera): 8 archetipi → stile giusto, `archetipoOrig`, tratto Enfant solo all'Enfant,
  nessun campo perso, seconda migrazione senza effetto, creazione con 4 stili; rosso: l'archetipo resta quello di prima.
- Entrambi aggiunti alla MAPPA di `ci-runner.mjs` (src/14, src/0[0-8], src/1[17]).

## 3. PO-190 — quota gol dell'eroe sul totale squadra

Strumento `tests/visual/quota-190-vivo.mjs` (derivato da `statistiche-228-vivo`): partite intere dal salvataggio
`fixtures/save-190-s12-ovr93.json`, autoplay seedato, velocità 4, `home` = squadra dell'eroe (`src/15 _buildEndResult`),
gol dell'eroe = risultato registrato (`__CPM_GOLEROE228`). Dati `dati-giro67/vivo/*.jsonl`, riepilogo `q190.json`
(`riepilogo190.py`). Partite in timeout di caricamento escluse (2 nel braccio «dopo», 1 in «scene piene», 1 in Regista).

| Braccio | Build | Partite | Gol squadra | Gol eroe | **Quota** (IC 95%) | GF · GS a partita | Tiri eroe | V-N-P | 5+ gol |
|---|---|---|---|---|---|---|---|---|---|
| **prima** | 7.999.172 (worktree) | 27 | 38 | 15 | **39,5%** (24–55) | 1,41 · 0,70 | 3,56 | 14-6-7 | 0 |
| **dopo** (Finalizzatore) | questo ramo | 25 | 44 | 20 | **45,5%** (31–60) | 1,76 · 0,64 | 4,64 | 20-3-2 | 0 |
| dopo + scene piene (`__CPM_NO_SCENE190`) | questo ramo | 26 | 44 | 19 | 43,2% (29–58) | 1,69 · 0,69 | 4,58 | 20-4-2 | 0 |
| Regista (`ARCH=regista`) | questo ramo | 9 | 14 | 6 | 42,9% (17–69) | 1,56 · 1,00 | 4,00 | 4-3-2 | 0 |

**Lettura.**
- Sulla 172 la quota è **39,5%**: sotto il 50% deciso dal PO, ma con 38 gol l'intervallo (24–55%) contiene il 50%: **non posso
  confermare** che sia «lontana» in senso statistico. Il 41,4% della misura del 15/10 (percorso simulato) è nello stesso ordine.
- Con gli stili il salvataggio S12 diventa Finalizzatore e la quota sale a **45,5%** senza toccare altro: **non ho aggiunto una
  correzione PO-190 separata**. Togliere il −25% delle scene (rosso esistente `__CPM_NO_SCENE190`, braccio «scene piene») non
  sposta la quota (43,2%): la leva non è la probabilità della scena ma quante scene arrivano all'eroe.
- Effetto collaterale da guardare (Verificato sui dati, causa: più scene in area): vittorie **52% → 80%**, GF 1,41 → 1,76.
  Nessuna goleada (0 partite con 5+ gol in tutti i bracci).

**Difetto osservato, fuori ambito (Non verificato la causa):** in 3 partite (braccio dopo k4, k12, k13; identiche nel braccio
«scene piene») la **pagella** del motore dà all'eroe 2 gol e il **risultato registrato** 1. Contando la pagella la quota del braccio
«dopo» sarebbe 52,3% (23/44). Sulla 172 non è capitato (15 = 15), ma lì l'eroe non ha mai segnato due gol nella stessa partita
nelle partite misurate. Va aperta una voce: quale dei due numeri arriva in carriera è il registrato.

**Decisione per la sessione principale (PO-190):**
1. **Consigliata — tenere così:** la quota dipende ora dallo stile (Finalizzatore ~45-52%, gli altri meno per costruzione);
   il 50% del PO resta il bersaglio del Finalizzatore. Nessuna nuova leva sul motore.
2. Fissare un bersaglio **per stile** (es. Finalizzatore 50%, Incursore 40%, Regista/Trascinatore 30%) e tarare dopo la decisione
   PO-156, con 25 partite per stile.
3. Alzare il numero di scene dell'eroe per tutti gli stili (non la loro probabilità): misura a parte, 25 partite per braccio.

## 4. PO-156 — difficoltà per fase di carriera (SOLO MISURA, nessuna taratura)

Fonte: i 45 file carriera del banco L6-bis (`origin/collaudo/carriere-l6-bis-giro49:docs/collaudi/dati-carriere-l6-bis/`
`syn-*` 30, `u18-*` 10, `naz-*` 5; GAME_VERSION **7.999.170**), ricalcolati per fase con `dati-giro67/fasi156.py`
(→ `fasi156-170.json`). Voto, gol, assist e risultati da `matchHistory` (tutte le gare registrate, campionato e coppe);
minuti e titolarità dalla decisione del mister `calcCoachDecision` registrata dal banco per ogni gara di campionato
(titolare 90', panchina 90 − ingresso, non convocato 0). Solo stagioni da professionista.

| Fase (età) | Stagioni | OVR | Gare | **Voto medio** | **Gol/gara** | Assist/gara | **Vittorie · pari · sconfitte** | **Minuti teorici** | Titolare |
|---|---|---|---|---|---|---|---|---|---|
| Gavetta 17-20 | 73 | 70,9 | 2 607 | **5,96** | **0,245** | 0,127 | 33,4% · 23,8% · 42,8% | **85,9** | 93,5% |
| Affermazione 21-25 | 203 | 76,8 | 7 663 | **6,11** | **0,312** | 0,163 | 40,4% · 21,1% · 38,5% | **82,8** | 88,9% |
| Élite 26-30 | 142 | 81,8 | 5 712 | **6,24** | **0,362** | 0,203 | 45,1% · 21,4% · 33,5% | **85,6** | 93,4% |
| Declino 31+ | 22 | 81,0 | 872 | **6,22** | **0,352** | 0,200 | 43,3% · 22,6% · 34,1% | **86,5** | 95,0% |

(per gruppo — sintetiche, U18 dalla creazione, Nazionale — vedi `fasi156-170.json`.)

**Lettura (Verificato sui dati):** la carriera oggi è quasi **piatta**: dal primo all'ultimo anno il voto sale di 0,3, i gol a
gara di 0,1, le vittorie di 12 punti; i minuti **non** salgono (la gavetta gioca 86' come l'élite: titolare 9 volte su 10 a 17-20
anni). Il declino non c'è: a 31+ i numeri sono quelli dell'élite.

**Non verificato:** (a) i dati sono della **7.999.170**, non della 172 (la 171-172 tocca il rinnovo, PO-270: cambia quante
stagioni restano sotto contratto, non dovrebbe spostare i numeri per gara — non l'ho rimisurato); (b) tutte le gare del banco sono
**simulate** (0 gare vissute nelle stagioni): i numeri della partita guardata per fase non esistono; (c) il declino ha 22
stagioni sole (nessuna U18 supera i 26 anni in 10 stagioni); (d) i minuti sono quelli che il mister **mostrerebbe**: nel percorso
simulato l'eroe gioca sempre (L6-bis §7).

### 4.1 Proposta di bersagli per il PO (da scegliere; NON tarato)

Cinque numeri per fase. Tre opzioni.

| Fase | Misura oggi (voto · gol/gara · vittorie · minuti · titolare) | **A — Curva netta (consigliata)** | B — Curva morbida | C — Gavetta dura, picco breve |
|---|---|---|---|---|
| Gavetta 17-20 | 5,96 · 0,25 · 33% · 86' · 94% | 6,0 · 0,15 · 35% · **55'** · **45%** | 6,0 · 0,20 · 35% · 70' · 70% | 5,8 · 0,10 · 30% · 40' · 30% |
| Affermazione 21-25 | 6,11 · 0,31 · 40% · 83' · 89% | 6,4 · 0,30 · 45% · 75' · 75% | 6,3 · 0,30 · 42% · 80' · 85% | 6,3 · 0,30 · 42% · 75' · 75% |
| Élite 26-30 | 6,24 · 0,36 · 45% · 86' · 93% | **6,9** · **0,50** · **55%** · 85' · 95% | 6,6 · 0,42 · 50% · 85' · 95% | **7,1** · **0,55** · 58% · 88' · 97% |
| Declino 31+ | 6,22 · 0,35 · 43% · 87' · 95% | **6,3** · **0,25** · 45% · **65'** · **60%** | 6,4 · 0,30 · 45% · 75' · 80% | 6,0 · 0,20 · 40% · 55' · 50% |

- **A (consigliata):** la storia di una carriera si legge nei numeri — si parte dalla panchina, si arriva al picco a 26-30 con
  mezzo gol a gara, si esce gradualmente. Richiede che i minuti dipendano davvero dalla gerarchia (oggi l'eroe è titolare 9 su
  10 anche da «riserva», L6-bis §7) e un declino fisico vero.
- **B:** la curva c'è ma resta gentile: meno panchine in gavetta e declino appena accennato.
- **C:** la gavetta è dura (un terzo delle gare da titolare), il picco è più alto e corto, il declino arriva presto.
- I numeri di A/B/C sono **proposte mie** (nessuna fonte esterna): servono a far scegliere la forma della curva; il PO fissa i
  valori. Per tararli serviranno misure sulla partita **vissuta** per fase, che oggi non esistono.

## 5. Rituali (su questo ramo, build `5bf6e7f`)

RITUALI

## 6. Non verificato (riassunto)
- Differenza fra stili **dal vivo** oltre il Finalizzatore: misurata solo nel motore (node); Regista 9 partite, Incursore e
  Trascinatore 0 partite vissute.
- Numeri di taratura degli stili (fattori di zona, pesi di scena, +5 del Trascinatore): miei, da collaudare col PO. Il +5 vale
  +0,4 gol fatti e −0,36 subiti nel motore (§2.1): è forte.
- Costo del tratto Enfant (−2 su ogni statistica): mio, non misurato sulla carriera intera.
- Pagella dell'eroe ≠ risultato registrato in 3 partite su 25 (§3): causa non cercata.
- PO-156 su dati 7.999.170 e solo percorso simulato (§4).
- Resa grafica: la creazione è fotografata a 412×915 (`dati-giro67/creazione-412.png`: 4 stili in griglia 2×2, effetto sugli
  attributi, casella Enfant); la riga Enfant del **Profilo** non è fotografata.

## 7. Decisioni aperte (per la sessione principale)
1. **PO-190** — vedi §3: consigliata «tenere così» (quota per stile).
2. **PO-156** — scelta della curva A/B/C (§4.1); consigliata A.
3. **PO-098 taratura** — forza del Trascinatore: (a) **+5 come ora, consigliata per il collaudo** (è l'unico valore misurato che
   si vede: +0,4 gol fatti, −0,36 subiti nel motore) · (b) +3 (misurato a N=40: +0,08 gol, quasi invisibile) · (c) leva diversa
   (morale/fiducia dei compagni invece della forza). Costo Enfant: (a) −2 come ora, consigliata · (b) nessun costo · (c) −3.
