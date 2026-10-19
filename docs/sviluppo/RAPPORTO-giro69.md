# Rapporto giro 69 — PO-156 «A — Curva netta» (taratura della difficoltà per fase)

**Ramo:** `sviluppo/difficolta-156-giro69` da `sviluppo/archetipi-difficolta-giro67` (4 stili del giro 67). **GAME_VERSION** invariata
(7.999.172, `src/07-versione-save-interviste.jsx:35`). **SAVE_VERSION** invariata: nessun campo nuovo nel salvataggio.
**Decisione che lo richiede:** PO, curva A (proposta in `RAPPORTO-giro67.md` §4.1).

## 1. Strumento e tolleranza

`tests/visual/difficolta-156.mjs` (`npm run difficolta-156` = verde, poi `--rosso`). Carriere **simulate** sugli handler veri
(`__CPM_CAREER.step()`, come `career-sim-test` e il banco L6-bis), una «fetta» per fase: partenza a 17 · 21 · 26 · 31 anni, 2 stagioni
ciascuna, **3 stili** (Finalizzatore attaccante, Regista centrocampista, Incursore attaccante) × **2 semi** = 24 carriere, 48 stagioni,
~1 700 gare per braccio. `Math.random` della pagina seedato per carriera (scelta del banco, come L6-bis).
- OVR di partenza 67 · 74 · 81 · 82 (medie per fase del banco L6-bis: 70,9 · 76,8 · 81,8 · 81,0, ricalcolate dai suoi JSON).
- Due club per fase (seme dispari/pari): `utr`/`gron` (Liga Oranje), `rsoc`/`utr`, `fra`/`stu` (Deutsche Liga), `lille`/`nice` (Ligue
  Nationale). Scelti — e dichiaro che è una scelta mia — perché il gioco **senza correzione** riproduca il banco L6-bis: vittorie
  33 · 43 · 38 · 39% contro 33 · 40 · 45 · 43% del banco, titolare 83 · 94 · 95 · 96% contro 94 · 89 · 93 · 95%. La prima scelta (club
  di Lega A, poi `gor`/`cel`) dava 16-20% di vittorie in gavetta senza correzione ed è stata scartata **prima** di giudicare la curva.
- Misure per fase come `fasi156.py` del giro 67: voto, gol e vittorie su tutte le gare di `matchHistory` (campionato e coppe; escluse le
  voci «non convocato»); minuti e % titolare dalla decisione `calcCoachDecision` per ogni gara di campionato (titolare 90', panchina
  90 − ingresso, non convocato 0).

**Tolleranza dichiarata:** voto ±0,2 · gol a gara ±0,08 · vittorie ±8 punti · minuti ±8' · titolare ±10 punti. Verde = 20 celle su 20
dentro; rosso (`__CPM_NO_156`) = almeno 4 celle fuori.

## 2. Prima / dopo (stesso build `11e5848`, stesse 24 carriere; «prima» = interruttore rosso `__CPM_NO_156`)

| Fase | Bersaglio A | Prima (rosso) | **Dopo** | Celle |
|---|---|---|---|---|
| Gavetta 17-20 | 6,0 · 0,15 · 35% · 55' · 45% | 5,96 · 0,253 · 33,3% · 79,7' · 83,3% | **5,94 · 0,125 · 32,3% · 56,1' · 45,5%** | 5/5 |
| Affermazione 21-25 | 6,4 · 0,30 · 45% · 75' · 75% | 6,20 · 0,367 · 42,5% · 86,1' · 93,9% | **6,44 · 0,370 · 48,3% · 79,2' · 82,2%** | 5/5 |
| Élite 26-30 | 6,9 · 0,50 · 55% · 85' · 95% | 6,16 · 0,333 · 38,0% · 86,9' · 95,0% | **6,89 · 0,479 · 51,9% · 88,6' · 97,8%** | 5/5 |
| Declino 31+ | 6,3 · 0,25 · 45% · 65' · 60% | 6,19 · 0,356 · 39,1% · 87,7' · 96,4% | **6,36 · 0,286 · 44,2% · 69,9' · 67,0%** | 5/5 |

Verde **20/20**; rosso **9/20** (11 fuori). Dati: `dati-giro69/difficolta-156-{verde,rosso}.{json,txt}`. Gare per fase 415-468.

Per stile (dopo; voto · gol · vittorie · minuti · titolare):

| Stile | Gavetta | Affermazione | Élite | Declino |
|---|---|---|---|---|
| Finalizzatore | 5,95 · 0,145 · 34,8% · 60,5' · 51% | 6,60 · 0,497 · 55,8% · 82' · 87% | 6,83 · 0,481 · 46,1% · 87' · 96% | 6,44 · 0,355 · 49,3% · 64' · 59% |
| Regista | 5,88 · 0,080 · 29,0% · 47,8' · 35% | 6,41 · 0,297 · 47,3% · 79' · 82% | 6,90 · 0,437 · 55,1% · 89' · 99% | 6,24 · 0,221 · 36,9% · 70' · 66% |
| Incursore | 5,98 · 0,151 · 33,1% · 60,6' · 51% | 6,32 · 0,315 · 41,8% · 77' · 78% | 6,95 · 0,519 · 54,5% · 89' · 99% | 6,40 · 0,279 · 46,3% · 76' · 76% |

**Effetto collaterale del giro 67 (vittorie 52% → 80% col Finalizzatore):** nel percorso simulato il Finalizzatore sta a 34,8 · 55,8 ·
46,1 · 49,3% per fase, dentro o vicino alla banda dei bersagli (affermazione +10,8 sopra il 45%: fuori tolleranza per il singolo stile,
dentro per la media). L'80% del giro 67 era **partita vissuta** dal salvataggio S12 (OVR 93): **non rimisurato** (vedi §5).

**Rumore di giro: Non posso confermarlo con precisione.** Non ho ripetuto lo stesso codice più volte; fra i giri di taratura, con
ritocchi che non toccavano l'élite in modo diretto, le vittorie d'élite sono state 45,9 · 47,4 · 49,2 · 51,4 · 51,9%. I margini minimi
del verde finale sono il voto di gavetta (5,94 contro 5,80) e le vittorie d'élite (51,9 contro 47).

## 3. Le leve (tutte dietro `__CPM_NO_156`)

1. **Scelta del mister — età e scelta graduata** (`src/08-panchina-derby-meteo-cori.jsx:208`). Misura che l'ha decisa: il punteggio di
   `calcCoachDecision` ha una distribuzione strettissima — una penalità fissa di 13 punti portava la gavetta da 86% a 0% di titolarità
   (giro di prova v2). Ora: età −8 (≤20) · +2 (21-25) · +6 (26-30) · −7 (31-32) · −12 (33+), solo professionisti; titolare con probabilità
   logistica sul punteggio (centro 50, scala 8), estratta da `hashStr(stagione|settimana|nome)` → la stessa gara dà sempre la stessa scelta
   nel prompt, nella simulazione e nel banco. Il minuto d'ingresso accetta un `rng` seedato (riga 230).
2. **La partita simulata rispetta la scelta del mister** (`src/10-folla-stadi-ritiro.jsx:908`). Prima l'eroe simulato giocava 90' anche
   «in panchina» (banco L6-bis §7). Se il chiamante passa `opz.giocatore`, `simulateMatch` calcola la decisione (ingresso seedato) e la
   quota di minuti `quota156`; i tre chiamanti della partita di club dell'eroe la passano (`src/18-career-app.jsx:3244, 4534, 4747`), non
   quando è infortunato, squalificato/non convocato dal prompt o svincolato.
3. **Il protagonista pesa sulla squadra.** Sonda di questo giro: nel motore (`simulaPartitaMotore`) l'OVR dell'eroe spostava le vittorie
   di ≤5 punti fra OVR 60 e 92 (120 gare per cella, 4 club). Ora la forza della squadra sale di (OVR in campo − 70) × 1,0, da 0 a +15,
   per la quota di minuti (`:930`).
4. **Voto e gol seguono livello e minuti.** Voto: +0,05 per punto di OVR sopra 71 (tetto +0,6), nessun malus sotto, da 31 anni 3 punti in
   meno nel solo voto; chi entra dalla panchina resta vicino al 6 (scarto × (0,3 + 0,7 × quota)) (`:938`). Gol/assist: λ × quota di
   minuti, +0,03 per punto di OVR sopra 76 (tetto +0,3) sui gol (`:957`). «OVR in campo» del veterano −2 (31-32) / −4 (33+) (`:949`).
5. **Declino fisico** (`src/18-career-app.jsx:1744`): probabilità settimanale di perdere un punto a 31-32 / 33-34 / 35+ da 0,08 / 0,14 /
   0,20 a 0,22 / 0,30 / 0,35. Misura che l'ha decisa: a 31+ l'OVR del banco L6-bis era quello dell'élite (81,0 contro 81,8).

Fuori ambito, non toccati: U18/Primavera, Nazionale, il calcolo del voto nella **partita vissuta**, la gerarchia `calcSquadRole`.

## 4. Guardiano

`npm run difficolta-156` (≈8 min a braccio, 6 pagine in parallelo; un caricamento fallito si riprova una volta). Verde: 20/20 celle,
nessuna carriera interrotta, zero `pageerror`. Rosso (`--rosso`, accende `__CPM_NO_156`): almeno 4 celle fuori (misurato 11).
Aggiunto a `package.json` e alla MAPPA di `ci-runner.mjs` per `src/0[0-8]` e `src/18|16|10`.

## 5. Rituali (build `11e5848`)

Catena **mirata** di `ci-runner.mjs` contro `origin/sviluppo/archetipi-difficolta-giro67` (file toccati src/08, src/10, src/18 →
**48 passi**: nucleo + guardiani della MAPPA, compreso `difficolta-156` verde e rosso). Il riavvio del worker ha interrotto il runner
dopo 27 passi, tutti verdi; i 21 restanti li ho eseguiti uno per uno sullo **stesso build** (`11e5848`), con la stessa regola «un rosso si
riprova una volta». In più: `replay`, `partita-vera`, i quattro guardiani carriera e `tripath-chokepoint`.

| Esito | Passi |
|---|---|
| ✅ verdi al primo giro | **53 su 53** (48 della mirata + replay, career-invariants, stab-nat-trigger, career-sim, tripath-chokepoint; partita-vera è già nella mirata) |
| ⚠️ instabili | nessuno |
| ❌ rossi | nessuno |

Fra i verdi: `test:logic` 43/43 · `save-compat` · `career-critical` (775 s) · `partita-vera` (511 s) · `replay` · `stili-098` ·
`stili-098-migrazione` · `difficolta-156` (569 s, verde + rosso). `docs/governo/STABILITA.json` non toccato (corsa interrotta, non
registrata dal runner). Il gate `validate-situations` non è nella mirata per questi file e non l'ho eseguito: le modifiche sono fuori dal
motore 3D e dalle situation.

## 6. Non verificato

- **Partita vissuta:** la scelta graduata del mister vale anche nel prompt «Gioca/Simula» (stessa funzione), ma nessuna partita vissuta
  è stata misurata per fase; l'effetto del giro 67 sulle vittorie dal vivo (52% → 80%, S12 OVR 93, Finalizzatore) **non è rimisurato**.
  Nota: la leva 3 (peso dell'eroe) agisce solo nel percorso simulato.
- **Carriera continua 17 → 34:** misurate fette di 2 stagioni per fase, non carriere intere; trasferimenti, rinnovi e scelte d'impulso
  sono quelli che `step()`/`dismiss()` producono (come career-sim-test), non le scelte di un giocatore.
- Il **non convocato** nel percorso simulato è trattato come ingresso all'80' (semplificazione dichiarata nel codice), perché le voci di
  coppa/Europa simulate non hanno una voce «tribuna». Frequenza non misurata (richiede fiducia < 30).
- Gol per stile: il Regista in gavetta segna 0,080 (bersaglio medio 0,15): la media è nei bersagli, il singolo stile no — coerente col
  ruolo, ma non è un bersaglio fissato dal PO.
- Ruolo Portiere/Difensore: non nelle fette (il banco L6-bis li includeva); `_pSimStats` non dipende dal ruolo.
- I numeri delle leve (−8/+2/+6/−7/−12, scala 8, 1,0 × (OVR−70), 0,05, 0,22/0,30/0,35) sono **miei**, tarati su questo strumento.

## 7. Decisioni per la sessione principale

1. **Scelta del mister graduata anche nella partita vissuta.** (a) **Consigliata — tenerla** (una sola regola per prompt e simulazione;
   la scelta della settimana è stabile perché viene da un hash) · (b) graduata solo nel percorso simulato, soglia secca nel prompt (due
   regole: il giocatore vedrebbe titolarità diverse fra «Gioca» e «Simula») · (c) rimandare al collaudo PO dal vivo.
2. **Tolleranza del guardiano:** (a) **consigliata — quella di §1** · (b) più stretta (voto ±0,1, vittorie ±5): oggi fallirebbe per il
   rumore di giro (§2) senza più semi, cioè ~16 min a braccio.
3. **Vittorie dal vivo col Finalizzatore:** (a) **consigliata — rimisurare con `quota-190-vivo` (25 partite, ~2 h)** prima di tarare il
   motore dal vivo · (b) accettare la misura simulata.
