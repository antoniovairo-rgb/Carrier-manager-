# Giro 309 — Bilanciamento dei risultati: sola misura (PO-596 · PO-560 · PO-583 · PO-584)

Ramo `sviluppo/giro309-bilanciamento`, partito da `lavoro/200` (1cbc414b = 7.999.199). **Nessuna modifica al gioco**:
`src/` e `CARRIER-MANAGER-AV.html` non sono stati toccati, `GAME_VERSION` nemmeno. Tutto ciò che segue è misurato con
le funzioni VERE del gioco, chiamate in una pagina headless senza partita 3D (nessun highlight, nessun GLB).

Script (cartella `tests/visual/`, uscite in `tests/visual/out/misura-309/`, non versionate):

| script | cosa misura |
|---|---|
| `misura-309-sonda.mjs` | apre la pagina in carriera (nessuna grafica) ed espone le funzioni globali |
| `misura-309-stampo.mjs` | le giornate passate inventate all'arrivo in un club a stagione in corso |
| `misura-309-motore.mjs` + `misura-309-analisi.mjs` | punteggi e strisce del motore, 4.080 partite × 4 percorsi |
| `misura-309-calendario.mjs` | probabilità esatta di 8 sconfitte di fila, ordine vero del calendario contro rimescolato |
| `misura-309-eroe.mjs` · `misura-309-scarto.mjs` | eroe e squadra nelle simulate contro il motore coi parametri del live, per OVR |
| `misura-309-carriera.mjs` | carriere da bandiera sugli handler veri (`__CPM_CAREER.step`): Simula/Avanza, 8–15 stagioni |
| `misura-309-cartellini.mjs` | cartellini che il motore già produce nelle simulate, e squalifiche con una regola proposta |

---

## In breve

1. **PO-596, i punteggi a stampo esistono e sono la causa della foto.** Quando l'eroe arriva in un club a stagione in
   corso (dalla Primavera o con un trasferimento), le giornate già passate **non vengono simulate**: le inventa
   `legaDopoTrasferimento212` (`src/09-audio-scout-anagrafiche.jsx` r.1912-1916) con **tre soli punteggi** — 2-0, 1-1,
   0-1 — scelti da un hash che dà valori quasi uguali a giornate vicine. La sonda riproduce **esattamente** la foto del
   PO (sett. 1–7 «N 1-1», poi «V 2-0» in casa e «V 0-2» in trasferta). Il «girone d'andata da 5ª» era quindi finto:
   35 punti in 17 giornate inventati, contro i ~17 che il motore dà a un club di quel prestigio.
2. **PO-596, le 8 sconfitte di fila sono rare ma non anomale.** Per FC Augusta (prestigio 66, 14° su 18 della lega per
   prestigio, non di metà classifica) la probabilità di almeno 8 sconfitte di fila in una stagione è **4,3%** col motore;
   un riferimento Poisson indipendente con le stesse forze dà lo stesso ordine (3,1–3,8%). Nessun effetto a cascata:
   P(sconfitta | sconfitta prima) = 0,46 contro P(sconfitta) = 0,48. Il calendario non ammucchia le big (4,3% contro
   4,6% rimescolato).
3. **PO-560, la squadra simulata non è più severa del motore del live a parità di forza** (1,04–1,13 punti a partita in
   quattro bracci, rumore ±0,05). Severo resta il **voto** (6,2–6,3 sotto OVR 72, contro 6,60/7,20 misurati dal vivo al
   giro 156); sopra OVR 78 la simulata è anzi **più generosa** del live (fino a +0,5 punti a partita), perché solo la
   simulata aggiunge la forza dell'eroe alla squadra.
4. **PO-583**: vedi §4 (carriere da bandiera, Lega B → Europa).
5. **PO-584, infortuni e squalifiche quasi assenti per costruzione**: vedi §5.

---

## 1. Da dove vengono i risultati (PO-596, punto 1)

| percorso | chi calcola il risultato | file e riga |
|---|---|---|
| Partita giocata intera | motore del possesso dal vivo (`creaMotorePossesso`), forza = **prestigio puro** del club e dell'avversario (`_heroP`, `oppPrestige`), seme della partita | `src/15-live-match.jsx` r.6686-6688 |
| «Solo momenti salienti» (giro 166) | **lo stesso battito** della partita intera, fatto correre a lotti dentro `flushSync`: stessi sorteggi, stesso libro mastro (commento del giro 166 e giro 264: 0 divergenze su 20 confronti) | `src/15-live-match.jsx` r.3147-3152, r.9714-9725 |
| Simula (tasto) / Avanza con auto-sim | `simulateMatch(...,{motore:true})` → `simulaPartitaMotore` (lo stesso motore senza grafica), forza = prestigio **+ `clubPrestigeShifts` + bonus dell'eroe** (`_fz156`), seme `standingsSeed(club,stagione,settimana)+giornata·31+1` | `src/10-folla-stadi-ritiro.jsx` r.921-958; chiamanti `src/18-career-app.jsx` r.3802, 5162, 5377 |
| Risultati del club **prima che l'eroe ci arrivi** (era in Primavera o in un altro club) | **nessuna simulazione**: `legaDopoTrasferimento212` inventa le giornate passate con 2-0 / 1-1 / 0-1 | `src/09-audio-scout-anagrafiche.jsx` r.1900-1937 |
| Le altre partite della lega | Poisson per prestigio (`updateStandings`), non il motore | `src/09-audio-scout-anagrafiche.jsx` r.1762-1830 |

### 1a. Lo stampo (causa delle sett. 1–18 della foto)

```js
const _hr=Math.abs(hashStr(String(seed)+"_"+e.matchday))%100/100;
_pastR74[e.matchday]=_hr<_wp?{won:true,...,homeScore:2,awayScore:0}
                    :_hr<_wp+0.27?{drew:true,homeScore:1,awayScore:1}
                    :{homeScore:0,awayScore:1};
```

Tre difetti sovrapposti, tutti misurati (`misura-309-stampo.mjs`, 2.520 casi = tutti i club di prima e seconda divisione × 10
stagioni, arrivo alla settimana 20, 42.840 giornate):

- **Solo 5 punteggi possibili** (contando l'orientamento): 1-1 27,0% · 0-1 20,1% · 1-0 20,1% · 2-0 16,3% · 0-2 16,4%.
- **L'hash è quasi lineare nella giornata.** `hashStr` è djb2 con XOR: cambiando solo l'ultima cifra della giornata
  l'hash cambia di pochi punti, quindi `%100` dà valori vicini a giornate vicine. Nella foto: giornate 1–7 → 40, 43,
  42, 45, 44, 47, 46 (tutte nella fascia «pareggio»); giornate 10–17 → 16…23 (tutte nella fascia «vittoria», anche
  contro FC Westfalen 93 e FC Leipzig 88). Striscia più lunga di esiti identici: **media 10,1 giornate** contro 3,4
  attese con esiti indipendenti e le stesse probabilità; striscia ≥5 nel **98,1%** dei casi contro il 14,1%.
- **Orientamento rovesciato in trasferta.** Lo stampo scrive il risultato in ordine casa-ospiti
  (`_disp=e.isHome?_r:{...homeScore:_r.awayScore,awayScore:_r.homeScore}`), mentre ovunque altrove `homeScore` è il
  club dell'eroe e la legenda del calendario dice «prima i gol della tua squadra». Da qui le «V 0-2»: **7.041 vittorie
  su 14.035** dello stampo appaiono al rovescio. Effetto collaterale: la riconciliazione della classifica
  (`src/09` r.1886-1888) somma `homeScore` come gol fatti e su queste giornate trova numeri sbagliati (si spegne da sola,
  ritorna `null`: nessun danno, ma non ripara).

**La foto riprodotta** (FC Augusta, stagione 1, arrivo alla settimana 20; seme dello stampo 3287979684):
md 1–7 N 1-1 · md 8 V 2-0 · md 9 (sett. 10) N 1-1 · md 10–17 V 2-0 in casa / V 0-2 in trasferta. Identico alla foto.

### 1b. Il motore non collassa su pochi punteggi e i semi non si ripetono

`misura-309-motore.mjs`: 5 club della metà bassa della Deutsche Liga (Augusta 66, Köln 65, Mainz 68, Kraichgau 70,
Weser 72) × 20–40 stagioni = **4.080 partite** con il calendario vero, ognuna giocata in 4 percorsi:

| | A · Simula (semi del gioco) | B · stesso motore, semi indipendenti | V · motore coi parametri del live | P · Poisson storico (motore spento) |
|---|---|---|---|---|
| V / N / P | 26,9 / 24,6 / 48,5% | 28,0 / 25,7 / 46,3% | 29,5 / 23,8 / 46,6% | 30,8 / 23,9 / 45,2% |
| gol fatti / subiti | 0,88 / 1,36 | 0,92 / 1,32 | 1,00 / 1,40 | 1,14 / 1,48 |
| punteggi distinti | 36 | 37 | 38 | 48 |
| punteggio più frequente | 0-1 14,1% | 0-1 13,4% | 0-1 11,5% | 1-1 11,3% |
| entropia (bit) | 3,93 | 3,96 | 4,08 | 4,27 |
| striscia di punteggio **identico** più lunga (media · massimo) | 2,15 · 4 | 2,16 · 4 | 2,05 · 3 | 1,88 · 3 |

Il percorso A (semi del gioco, che cambiano di poco fra una giornata e l'altra) e il percorso B (semi indipendenti) sono
indistinguibili: **nessuna ripetizione dovuta ai semi**. Sette «1-1» di fila col motore: la probabilità per partita è
~11,6%, quindi sette di fila ≈ 3·10⁻⁷. Quella sequenza non può venire dal motore: viene dallo stampo.

⚠️ Gol a partita: A 2,24 · V 2,40 per queste squadre, contro **3,22** della Bundesliga 2023/24 (985 gol in 306 partite,
fonte: [Wikipedia, 2023–24 Bundesliga](https://en.wikipedia.org/wiki/2023%E2%80%9324_Bundesliga)). Il motore segna
meno del calcio vero; è già noto (banda di `sim-motore` 2,3–3,5) e non è oggetto di questo giro.

### 1c. Due forze diverse per la stessa partita (difetto, non della foto)

Il live usa `forza = club.p` puro (`src/15` r.6686); la simulata usa `club.p + clubPrestigeShifts + _fz156` (`src/10`
r.926, 956). Nella stagione 1 gli spostamenti sono zero, quindi non spiega la foto; da una stagione in poi, giocare o
simulare la stessa partita significa affrontarla con forze diverse (fino a ±24, o fino a +50 col tetto allargato
dall'albo d'oro, più fino a +15 per l'OVR dell'eroe).

## 2. Strisce di sconfitte (PO-596, punto 2)

Striscia di sconfitte più lunga per stagione (120 stagioni di club della metà bassa), contro due riferimenti costruiti
sulle STESSE partite: Poisson indipendente con le medie gol del motore per gradino di forza (5 punti) e casa/trasferta,
e Bernoulli indipendente con le stesse probabilità di sconfitta (40 repliche, 4.800 stagioni):

| | media | stagioni con ≥5 | stagioni con ≥8 | massimo |
|---|---|---|---|---|
| A · Simula | 4,08 | 31,7% | 1,7% | 12 |
| riferimento Poisson (forze di A) | 4,20 | 35,4% | 3,8% | — |
| V · come il live | 4,18 | 30,8% | 5,0% | 9 |
| riferimento Poisson (forze di V) | 4,02 | 30,1% | 3,1% | — |
| riferimento Bernoulli (V) | 4,00 | 30,5% | 2,8% | — |
| P · Poisson storico | 3,53 | 18,3% | 0,8% | 11 |

- **Nessun meccanismo a cascata nei risultati.** P(sconfitta | sconfitta alla giornata prima) = 0,464 contro
  P(sconfitta) = 0,484 (A); 0,455 contro 0,465 (V). Nel codice la forza della squadra non legge morale, forma, fatica o
  fiducia: nel live la forza è il prestigio (`src/15` r.6686); morale e forma entrano solo nel peso con cui il motore
  cerca l'eroe (`BONUS_EROE`, `src/14` r.302) e, nella simulata, nella scelta titolare/panchina (`calcCoachDecision`).
- **Il calendario non ammucchia le big** (`misura-309-calendario.mjs`, probabilità esatta col programma dinamico, 10
  stagioni per club): FC Augusta P(≥8 di fila) **4,28%** nell'ordine vero contro **4,59%** rimescolato; per tutti i 18
  club l'ordine vero è uguale o un po' più favorevole del rimescolato.
- **La sequenza della foto** (Werkstadt t, Leipzig c, Westfalen t, Köpenick t, Frankfurt t, Berlin c, Weser t,
  Friburgo c): probabilità di perderle tutte e otto col motore del live = 0,74·0,56·0,74·0,42·0,62·0,54·0,51·0,41 =
  **0,9%**. Sei avversari su otto sono più forti di 6–27 punti.
- **«Solo momenti salienti» non la rende più probabile**: è lo stesso battito del live (§1). Resta fuori misura una
  cosa sola, le scelte del giocatore negli highlight, che il motore senza grafica non può rifare.
- **Dati di realtà**: non ho una fonte verificata sulla frequenza delle strisce di 8 sconfitte nei campionati veri.
  Non posso confermare un confronto con la realtà; il confronto valido qui è col riferimento indipendente.

**Conclusione.** 8 di fila per un club da 66 in una lega dove 13 avversari su 17 sono più forti è un evento da circa
una stagione su 23 (Augusta), una su 8 per le ultime della lega (Darmstadt 58: 12,9%). Rara, non sistematica. Quello che
l'ha resa **sorprendente** è lo stampo: il PO vedeva la sua squadra quinta con 35 punti finti e si aspettava di restarci.

## 3. PO-560 — l'eroe simulato contro giocato, per OVR

`misura-309-eroe.mjs` (150 partite per OVR, FC Augusta contro tutta la Deutsche Liga, stessi semi per ogni OVR) e
`misura-309-scarto.mjs` (680 partite, OVR 66, quattro bracci sullo stesso motore).

| OVR | Simula: punti/partita | Simula: gol / assist eroe | Simula: voto | motore coi parametri del live: punti/partita | gol / assist eroe | voto |
|---|---|---|---|---|---|---|
| 60 | 0,97 | 0,11 / 0,07 | 6,22 | 1,22 | 0,09 / 0,20 | 6,35 |
| 66 | 0,95 | 0,19 / 0,09 | 6,31 | 1,32 | 0,11 / 0,19 | 6,38 |
| 72 | 1,01 | 0,21 / 0,11 | 6,32 | 1,17 | 0,09 / 0,20 | 6,33 |
| 78 | 1,40 | 0,39 / 0,17 | 6,63 | 1,11 | 0,12 / 0,25 | 6,37 |
| 84 | 1,65 | 0,53 / 0,19 | 6,84 | 1,17 | 0,14 / 0,23 | 6,41 |
| 90 | 1,51 | 0,51 / 0,17 | 6,77 | 1,01 | 0,10 / 0,21 | 6,35 |

⚠️ Le sei righe usano gli stessi semi e gli stessi avversari: non sono sei prove indipendenti. Lo scarto di squadra a OVR
≤72 (0,16–0,37) **non regge** al campione più grande: a OVR 66 su 680 partite i quattro bracci stanno fra 0,98 e 1,13
(tattica dell'avversario sì/no, seme della Simula o del live): differenze dentro l'errore (±0,05). La squadra simulata
non è più severa del motore a parità di forza.

Cosa resta, e dove:

- **Il voto**: simulato 6,22–6,32 sotto OVR 72, contro 6,60 (Primavera) e 7,20 (prima squadra) misurati dal vivo col
  pilota automatico al giro 156 (`docs/sviluppo/RAPPORTO-giro158.md`, campione piccolo: 5 partite per salvataggio).
  Anche il motore coi parametri del live dà ~6,35: il voto alto del vivo viene dagli highlight scelti dal giocatore, che
  il motore senza grafica non ha.
- **L'OVR conta solo nella simulata**: `_fz156 = (OVR−70)·quota minuti`, da 0 a +15 alla forza della squadra
  (`src/10` r.952). Dal vivo la forza è il prestigio puro. Sopra OVR 78 la simulata vale +0,3/+0,5 punti a partita più
  del motore del live: simulare è **conveniente** per un campione, **neutro** per un giovane.
- **La sensazione di severità** viene da altro: il club giovane del PO è nella metà bassa per prestigio (Augusta 66:
  0,99 punti a partita = ~34 punti a stagione) e, nella foto, dallo stampo che aveva gonfiato la prima metà.

## 4. PO-583 — carriera da bandiera dalla seconda divisione

## 5. PO-584 — infortuni e squalifiche

## 6. Proposte di taratura (nessuna applicata)

## 7. Dubbi per il PO
