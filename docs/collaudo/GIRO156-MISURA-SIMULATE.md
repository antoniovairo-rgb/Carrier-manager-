# Giro 156 · PO-360 — «se simulo le partite l'eroe gioca sempre male, soprattutto ad inizio carriera, è normale?»

**Solo misura: nessuna correzione al gioco in questo giro.** Sonda: `tests/visual/sim-voto-156.mjs`
(`npm run sim-voto-156`, fasi `CPM_FASI=funzione,opzioni,simula,vivo`). Salvataggi usati: i due del PO in
`tests/visual/fixtures/` — `save-c177-s1w15` (Primavera, stagione 1 settimana 15, OVR 62, 17 anni, FC Altoadige
Primavera prestigio 25, Primavera 2) e `save-c177-s5w20` (prima squadra, S5 W20, OVR 74, 21 anni, FC Frankfurt p79).

## Risposta breve

Sì, con il codice di oggi è **sistematico**, e non è un caso: il voto simulato è costruito quasi solo sul
**risultato della squadra**, e un pareggio vale 5,8 e una sconfitta 5,5 o meno. Il voto dal vivo è invece la
pagella che il motore costruisce azione per azione, e resta sopra 6 anche in molte sconfitte.

| | simulate | dal vivo | scarto |
|---|---|---|---|
| Primavera st.1 — storico del PO (s1w15) | **5,75** (n 10, 70% sotto 6) | **6,40** (n 3) | −0,65 |
| Primavera st.1 — misurato oggi, stesso salvataggio | **5,90** (n 17 col tasto Simula vero, 64,7% sotto 6) | **6,60** (n 5 col pilota automatico, 0% sotto 6) | −0,70 |
| Prima squadra — storico del PO (s5w20) | **6,38** (n 8) | **7,60** (n 2) | −1,22 |
| Prima squadra — misurato oggi, stesso salvataggio | **6,25** (n 15 col tasto Simula vero, 46,7% sotto 6) | **7,20** (n 5 col pilota automatico, 20% sotto 6) | −0,95 |

Voti dal vivo uno per uno (pilota automatico `__CPM_AUTOPLAY` politica `seeded`, partita vera della settimana
dal salvataggio, nome diverso = partita diversa): Primavera 6,1 (1-1) · 6,5 (1-2) · 6,8 (2-1) · 6,2 (0-0) ·
7,4 (2-1, 1 gol); prima squadra 7,9 (2-1) · 7,3 (1-0) · 5,8 (0-1) · 7,8 (2-1) · 7,2 (2-1, 1 assist).
⚠️ Il campione dal vivo è piccolo (5 per gruppo, ~3,5 minuti reali a partita) e il pilota automatico non è il
PO: è un ordine di grandezza, non una stima fine. Il segno però è lo stesso in tutti e quattro i confronti.

## Misura per OVR (funzioni vere, N = 160 partite per gruppo)

`simulateMatch` col motore (stessi semi del percorso vero: `_aSd = standingsSeed(club, stagione, settimana)`,
gara `_aSd + md·31 + 1`, gol/assist `_aSd + 2`) + `_pSimStats` + la stessa correzione del voto di
`simulateAndAdvance` (+0,4 a gol, +0,2 ad assist). Fiducia 60, forma 70, fatica 10, voti recenti che si
accumulano (la scelta del mister li legge).

| gruppo | voto medio | mediana | sotto 6 | gol/p | assist/p | titolare / panchina | quota minuti | V/N/P squadra | voto in V / N / P |
|---|---|---|---|---|---|---|---|---|---|
| Primavera st.1 OVR 55 (club p25) | 5,90 | 5,80 | 58,1% | 0,07 | 0,04 | 100% / 0% | 1,00 | 35 / 29 / 36 % | 6,68 / 5,83 / 5,19 |
| Primavera st.1 OVR 60 | 5,86 | 5,75 | 61,3% | 0,12 | 0,06 | 100% / 0% | 1,00 | 32 / 28 / 41 % | 6,70 / 5,84 / 5,22 |
| Primavera st.1 OVR 65 | 5,93 | 5,80 | 59,4% | 0,17 | 0,12 | 100% / 0% | 1,00 | 34 / 27 / 39 % | 6,79 / 5,87 / 5,25 |
| Primavera st.1 OVR 70 | 5,98 | 5,85 | 55,0% | 0,25 | 0,13 | 100% / 0% | 1,00 | 35 / 26 / 39 % | 6,79 / 5,92 / 5,29 |
| Primavera st.1 OVR 75 | 6,20 | 6,10 | 40,6% | 0,29 | 0,15 | 100% / 0% | 1,00 | 35 / 26 / 39 % | 7,02 / 6,13 / 5,50 |
| Primavera st.1 OVR 80 | 6,49 | 6,35 | 30,6% | 0,39 | 0,17 | 100% / 0% | 1,00 | 35 / 26 / 39 % | 7,36 / 6,40 / 5,76 |
| Primavera st.1 OVR 62 (club medio p55) | 6,17 | 6,10 | 44,4% | 0,16 | 0,13 | 100% / 0% | 1,00 | 48 / 32 / 21 % | 6,78 / 5,83 / 5,26 |
| Primavera st.1 OVR 70 (club medio p55) | 6,23 | 6,30 | 40,6% | 0,30 | 0,18 | 100% / 0% | 1,00 | 48 / 31 / 21 % | 6,87 / 5,92 / 5,28 |
| Prima squadra 19 anni OVR 60 (p79) | 5,94 | 5,90 | 56,3% | 0,06 | 0,04 | 18% / 82% | 0,42 | 36 / 24 / 39 % | 6,42 / 5,91 / 5,52 |
| Prima squadra 19 anni OVR 65 | 5,96 | 5,90 | 55,6% | 0,08 | 0,05 | 25% / 75% | 0,47 | 36 / 24 / 40 % | 6,49 / 5,92 / 5,51 |
| Prima squadra 19 anni OVR 70 | 5,99 | 5,90 | 52,5% | 0,14 | 0,09 | 46% / 54% | 0,62 | 36 / 29 / 35 % | 6,63 / 5,91 / 5,42 |
| Prima squadra 19 anni OVR 75 | 6,13 | 6,00 | 43,1% | 0,17 | 0,11 | 60% / 40% | 0,72 | 31 / 31 / 39 % | 6,88 / 6,08 / 5,59 |
| Prima squadra 19 anni OVR 80 | 6,51 | 6,30 | 25,6% | 0,33 | 0,14 | 77% / 23% | 0,84 | 34 / 33 / 33 % | 7,37 / 6,29 / 5,81 |
| Prima squadra 26 anni OVR 70 | 5,99 | 5,90 | 53,8% | 0,22 | 0,11 | 88% / 12% | 0,92 | 36 / 29 / 35 % | 6,79 / 5,92 / 5,24 |
| Prima squadra 26 anni OVR 80 | 6,59 | 6,40 | 22,5% | 0,38 | 0,16 | 94% / 6% | 0,96 | 37 / 34 / 29 % | 7,44 / 6,33 / 5,79 |

Presenze 100% in tutti i gruppi: nel percorso simulato il «non convocato» non scatta con fiducia 60 (serve
fiducia < 12, o punteggio < 25 con fiducia < 30). Prestigio medio degli avversari: Primavera 2 = 31,5 · Deutsche
Liga = 74,8.

## Perché — il calcolo, riga per riga

**1. La base del voto è il risultato** — `src/10-folla-stadi-ritiro.jsx:964`:
`_baseRat = vittoria ? 6,2 + min(scarto·0,25; 0,8) : pareggio ? 5,8 : 5,5 − min(scarto·0,18; 0,5)`.
Un pareggio è **sotto 6 per costruzione**, una sconfitta sta fra 5,0 e 5,5. In tutti i gruppi la squadra
non vince nel 52-69% delle partite → la mediana sta a 5,8-5,9 finché l'eroe non segna. La tabella lo mostra:
il voto medio nelle sconfitte è 5,2-5,8 a **ogni** OVR, nei pareggi 5,8-6,4.

**2. L'OVR conta solo sopra 71** — `src/10:969` (blocco PO-156, attivo quando c'è `opz.giocatore`, cioè sempre
nella gara di lega simulata, `src/18-career-app.jsx:3354`): `_r156 = _baseRat + clamp((OVR_in_campo − 71 −
[3 se ≥31 anni])·0,05; 0; 0,6) + rumore ±0,2`. Sotto 71 il bonus è **zero, non negativo**: un OVR 55 e un OVR
70 partono dalla stessa base. In più questo blocco **sostituisce** il voto di `src/10:966` (dove `_ovrMod` di
`src/10:965` dava un piccolo più da OVR 65 in su anche in pareggio/sconfitta). Effetto: fra OVR 55 e 70 il voto
medio si muove di +0,08 in Primavera e +0,05 in prima squadra; il salto arriva solo da 75 in su.

**3. La quota minuti comprime verso 6** — sempre `src/10:969`: `voto = 6 + (_r156 − 6)·(0,3 + 0,7·quota)`, con
quota da `src/10:949` (titolare 1; panchina (90 − minuto d'ingresso)/90; non convocato 10/90), scelta del mister
da `calcCoachDecision` (`src/08-panchina-derby-meteo-cori.jsx:352`). **La compressione non è la causa del voto
basso**: tira verso 6 sia dall'alto sia dal basso. Misurato a 19 anni OVR 60: voto da titolare 5,98, da
panchina 5,93 — praticamente uguale. Quello che la panchina toglie davvero sono **gol e assist** (vedi 4).
In Primavera la penalità d'età del mister vale solo per i professionisti (`src/08:381`, `proStatus==='pro'`):
titolare 100%, quota 1, nessuna compressione.

**4. Gol e assist sono pochi a OVR basso** — `_pSimStats`, `src/10:974-1000`: λ-gol = `(OVR−48)/55` (+0,07 se
vince), per l'eroe neutro/Finalizzatore con la correzione PO-156 `clamp((OVR−76)·0,025; −0,05; …)` sotto i 76
anni-curva, tutto moltiplicato per la quota; e mai più dei gol della squadra (`goals:min(g, tg)`). A OVR 60 in
panchina (quota 0,42): λ ≈ 0,07 → 0,06 gol a partita. Il bonus +0,4/+0,2 è applicato da `src/18:3364, 3395,
3422, 3446` (Euro girone, Euro KO, Coppa, Lega) — quindi a OVR basso quasi nessuna partita esce dalla base.

**5. L'eroe sposta poco il risultato della squadra** — `_fz156` (`src/10:951`) alza la forza della squadra solo
sopra OVR 70 (`(OVR−70)·quota`, tetto 15). Misurato sul motore senza grafica (`simulaPartitaMotore`, 60 partite
per braccio, stessi semi): forza 30 / 35 / 40 contro 31 danno **esattamente le stesse 25 vittorie**; 60 contro 31
ne dà 30. Infatti in Primavera V/N/P resta 35/26/39 da OVR 70 a OVR 80. Il motore risponde poco alla forza;
l'eroe non può «trascinare» la squadra nella simulazione.

**6. Inizio carriera = squadra debole** — il club Primavera del PO ha prestigio 25 contro una media avversari di
31,5: perde il 36-41% delle partite. Con un club Primavera medio (p55) lo stesso eroe OVR 62 passa da 5,90 a
6,17 di media e da 59% a 44% di voti sotto 6. In prima squadra a 19 anni pesa invece la panchina (75-82% a OVR
60-65): poca quota → pochissimi gol → voto inchiodato alla base del risultato.

**7. Cosa mostra la Home** — `src/18-career-app.jsx:7766-7767`: «Voto medio» è la media delle **ultime 10
partite dal vivo** (`!m.simulated && rating>0`), compare solo da 3 partite dal vivo in su; `src/18:7785-7788`
lo dichiara: «Voto medio sulle ultime N partite giocate dal vivo · le simulate non entrano nella media».
«Partite», «Gol» e «Assist» invece **contano anche le simulate**. Quindi il PO vede i voti bassi delle simulate
nei toast (`_heroSimLine`, `src/10:1005`), nello storico partite e nelle schermate che leggono `matchHistory`,
non nella media della Home.

## Conclusione con i numeri

All'inizio carriera il voto simulato è **sistematicamente sotto** quello dal vivo: −0,65/−0,70 in Primavera,
−0,95/−1,22 in prima squadra sui salvataggi del PO. Le cause, in ordine di peso misurato:
(a) la base per pareggio (5,8) e sconfitta (≤5,5) — il dal vivo non ha questa scala;
(b) squadra di inizio carriera debole (Primavera p25: 36-41% di sconfitte) e un eroe che nel motore sposta poco
il risultato;
(c) a 19 anni in prima squadra la panchina (75-82%) che azzera quasi gol e assist;
(d) OVR sotto 71 senza alcun bonus (né malus): fra 55 e 70 il voto medio cambia di meno di 0,1.
La compressione verso 6 della quota minuti **non** abbassa il voto (lo avvicina a 6 da entrambi i lati).

## Opzioni di taratura (NON applicate — decisione del PO)

Misurate sulle stesse partite (`CPM_FASI=opzioni`, N = 120 per gruppo). Formato: voto medio · % sotto 6.

| gruppo | oggi | A | B | C |
|---|---|---|---|---|
| Primavera st.1 OVR 55 | 5,94 · 55,8% | 6,08 · 47,5% | 5,94 · 60,0% | 6,41 · 15,0% |
| Primavera st.1 OVR 62 | 5,90 · 59,2% | 6,06 · 50,8% | 6,00 · 57,5% | 6,43 · 16,7% |
| Primavera st.1 OVR 70 | 5,95 · 57,5% | 6,10 · 47,5% | 6,45 · 32,5% | 6,54 · 14,2% |
| Prima squadra 19 anni OVR 60 | 6,00 · 53,3% | 6,08 · 41,7% | (= oggi) | 6,31 · 11,7% |
| Prima squadra 19 anni OVR 70 | 6,03 · 53,3% | 6,11 · 44,2% | (= oggi) | 6,35 · 15,8% |
| Prima squadra 19 anni OVR 80 | 6,61 · 20,8% | 6,70 · 12,5% | (= oggi) | 6,64 · 10,8% |
| Prima squadra 26 anni OVR 75 | 6,27 · 38,3% | 6,38 · 30,0% | (= oggi) | 6,51 · 10,8% |

- **A — base del pareggio e della sconfitta più vicina al dal vivo** (`src/10:964`): pareggio 6,0 invece di
  5,8; sconfitta 5,7 − 0,15·scarto (max −0,4) invece di 5,5 − 0,18·scarto (max −0,5). Ritocco piccolo e locale:
  +0,1/+0,16 di media, sotto 6 da ~55% a ~45%. Lo scarto col dal vivo si riduce ma resta (~−0,5 in Primavera).
- **B — in Primavera l'OVR neutro è 60 invece di 71** (`src/10:969`, solo `proStatus==='u18'`): premia l'eroe
  che in Primavera è già sopra la media; non tocca la prima squadra. Utile solo da OVR ~65 in su (OVR 70: 5,95 →
  6,45); a OVR 55-62 non cambia quasi nulla.
- **C — usare la pagella del motore anche nella simulata**: `simulaPartitaMotore` gioca già l'eroe e calcola le
  pagelle (`src/14-motore-possesso.jsx:1813`, `dettaglio:true` restituisce `pag`), cioè la stessa sorgente del
  voto dal vivo (`src/15-live-match.jsx:10332-10336`: base 5,8 + giocate, poi `pagelle().find(eroe)`). Compressa con la quota minuti come oggi.
  È l'opzione che allinea davvero simulata e dal vivo (sotto 6: ~11-17%, coerente col 0-20% misurato dal vivo).
  ⚠️ **Numeri indicativi**: la mia replica della chiamata al motore (senza le tattiche mister/persona) ha dato lo
  stesso punteggio della gara simulata solo in 9-15 casi su 120, quindi la pagella misurata viene da una partita
  «sorella», non dalla stessa. Applicandola davvero, la pagella va letta dalla stessa esecuzione di
  `simulateMatch` (`src/10:959`). Costo: nessuna esecuzione in più (il motore gira già); da verificare
  determinismo e il bonus gol/assist, che la pagella del motore potrebbe già contenere (rischio doppio conteggio).

Le tre opzioni si possono combinare (A + B ad esempio). Nessuna tocca il salvataggio.

## Note di metodo

- Il primo giro della sonda usava semi propri (`hashStr(...)`, G/A a seme+2) e ha prodotto un falso «0 gol a
  OVR 65»: con xorshift32 due semi vicini danno prime estrazioni correlate. Con i **semi del percorso vero**
  il fenomeno sparisce: la sonda ora usa quelli.
- Il primo giro pescava gli avversari della Primavera 2 da `U18_CLUBS` (che contiene solo la Primavera 1):
  pool vuoto → avversario «65 di default». Corretto con `getLeagueClubs`.
- Dal vivo: `__CPM_CAREER.playMatch()` + pilota automatico; il voto è quello scritto in `matchHistory`
  (`simulated:false`) dopo `onMatchEnd`.
